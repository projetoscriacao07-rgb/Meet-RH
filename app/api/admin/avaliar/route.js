import { NextResponse } from 'next/server';
import { adminDb, exigirAdmin } from '@/lib/firebaseAdmin';
import { calcularNotaFinal, anonimizar, PESOS_PADRAO } from '@/lib/pontuacao';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PERSONA = `Voce e um recrutador de RH senior, com muitos anos avaliando candidatos para
posicoes de suporte executivo. Voce e criterioso, direto e justo. Voce julga a substancia da
resposta, nao a beleza do texto. Resposta curta mas com criterio claro vale mais que resposta
longa e generica.

Voce NAO tem acesso ao nome, genero, idade ou qualquer dado pessoal do candidato. Avalie
exclusivamente o conteudo. Se algum marcador de identidade aparecer no texto, ignore.`;

function montarPrompt({ vaga, pergunta, resposta }) {
  return `${PERSONA}

## Vaga
Titulo: ${vaga.titulo}

Escopo:
${vaga.escopo}

## Pergunta feita ao candidato
${pergunta.enunciado}

## O que caracteriza uma boa resposta
${pergunta.criterioAvaliacao || 'Resposta coerente com o escopo da vaga.'}

## Sinais de alerta
${pergunta.alertas || 'Respostas genericas ou que fogem da pergunta.'}

## Resposta do candidato
"""
${resposta || '(em branco)'}
"""

## Sua tarefa
Atribua uma nota de 0 a 100 usando estas ancoras:
- 0 a 30: nao responde a pergunta, foge do tema, ou aciona um sinal de alerta grave
- 31 a 55: responde, mas de forma generica, sem criterio proprio nem evidencia
- 56 a 75: responde de forma adequada, com algum criterio, sem se destacar
- 76 a 90: responde bem, com criterio claro e coerente com o escopo da vaga
- 91 a 100: resposta excelente, com criterio, evidencia concreta e nocao de contexto

Responda SOMENTE com um objeto JSON valido, sem crase, sem markdown, sem texto antes ou depois:
{"nota": <numero inteiro>, "comentario": "<uma ou duas frases justificando, em portugues>", "alertaAcionado": <true ou false>}`;
}

async function avaliarUma({ vaga, pergunta, resposta }) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      temperature: 0,
      messages: [{ role: 'user', content: montarPrompt({ vaga, pergunta, resposta }) }],
    }),
  });

  if (!r.ok) throw new Error(`API respondeu ${r.status}`);

  const data = await r.json();
  const texto = (data.content || []).map((c) => c.text || '').join('').trim();
  const limpo = texto.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(limpo);

  return {
    nota: Math.max(0, Math.min(100, Math.round(parsed.nota))),
    comentario: String(parsed.comentario || ''),
    alertaAcionado: Boolean(parsed.alertaAcionado),
  };
}

export async function POST(request) {
  const admin = await exigirAdmin(request);
  if (!admin) return NextResponse.json({ erro: 'Nao autorizado' }, { status: 401 });

  try {
    const { inscricaoId } = await request.json();

    const insRef = adminDb.collection('inscricoes').doc(inscricaoId);
    const insDoc = await insRef.get();
    if (!insDoc.exists) return NextResponse.json({ erro: 'Inscricao nao encontrada' }, { status: 404 });

    const ins = insDoc.data();
    if (ins.eliminada) {
      return NextResponse.json({ erro: 'Candidata eliminada nas perguntas de corte' }, { status: 400 });
    }

    const vagaDoc = await adminDb.collection('vagas').doc(ins.vagaId).get();
    const vaga = vagaDoc.data();

    const pSnap = await adminDb.collection('vagas').doc(ins.vagaId)
      .collection('perguntas').where('tipo', '==', 'discursiva').orderBy('ordem').get();
    const discursivas = pSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const porPergunta = {};
    const pontosAtencao = [];
    let somaPonderada = 0;
    let somaPesos = 0;

    for (const pergunta of discursivas) {
      const bruta = ins.respostasDiscursivas?.[pergunta.id] || '';
      const resposta = anonimizar(bruta, ins.nomeCompleto);

      let resultado;
      try {
        resultado = await avaliarUma({ vaga, pergunta, resposta });
      } catch (e) {
        console.error('Falha ao avaliar pergunta', pergunta.id, e);
        resultado = { nota: 0, comentario: 'Nao foi possivel avaliar esta resposta.', alertaAcionado: false };
      }

      const peso = pergunta.peso || 1;
      porPergunta[pergunta.id] = { ...resultado, enunciado: pergunta.enunciado };
      somaPonderada += resultado.nota * peso;
      somaPesos += peso;

      if (resultado.alertaAcionado) pontosAtencao.push(pergunta.enunciado);
    }

    const notaRespostas = somaPesos > 0 ? Math.round(somaPonderada / somaPesos) : 0;
    const pesos = vaga.pesos || PESOS_PADRAO;

    const notas = {
      ...ins.notas,
      respostas: notaRespostas,
      final: calcularNotaFinal(
        { requisitos: ins.notas.requisitos, respostas: notaRespostas },
        pesos,
      ),
    };

    const fortes = Object.values(porPergunta)
      .filter((p) => p.nota >= 80).map((p) => p.enunciado);

    await insRef.update({
      notas,
      avaliacaoIA: { porPergunta, pontosFortes: fortes, pontosAtencao, avaliadoEm: new Date() },
    });

    return NextResponse.json({ ok: true, notas });
  } catch (e) {
    console.error('Erro na avaliacao:', e);
    return NextResponse.json({ erro: 'Falha ao avaliar' }, { status: 500 });
  }
}
