import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { apurarObjetivas, calcularNotaFinal, PESOS_PADRAO } from '@/lib/pontuacao';
import { apurarDisc } from '@/lib/disc';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const RETENCAO_MESES = 6;
const RETENCAO_BANCO_MESES = 24;

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      vagaId, nomeCompleto, email, telefone, cidade, regiao,
      respostasObjetivas = {}, respostasDiscursivas = {}, respostasDisc = {},
      consentimento, bancoTalentos = false, tempoPreenchimentoSegundos = 0,
    } = body;

    if (!vagaId || !nomeCompleto || !email || !telefone || !cidade) {
      return NextResponse.json({ erro: 'Preencha todos os campos obrigatorios' }, { status: 400 });
    }
    if (!consentimento) {
      return NextResponse.json({ erro: 'E preciso aceitar o uso dos dados' }, { status: 400 });
    }

    const vagaRef = adminDb.collection('vagas').doc(vagaId);
    const vagaDoc = await vagaRef.get();
    if (!vagaDoc.exists) {
      return NextResponse.json({ erro: 'Vaga nao encontrada' }, { status: 404 });
    }

    const vaga = vagaDoc.data();
    if (vaga.status !== 'aberta' || (vaga.dataFim && vaga.dataFim.toDate() < new Date())) {
      return NextResponse.json({ erro: 'Esta vaga foi encerrada' }, { status: 400 });
    }

    const emailNormalizado = String(email).trim().toLowerCase();

    const duplicada = await adminDb.collection('inscricoes')
      .where('vagaId', '==', vagaId).where('email', '==', emailNormalizado).limit(1).get();
    if (!duplicada.empty) {
      return NextResponse.json({ erro: 'Voce ja se inscreveu nesta vaga' }, { status: 409 });
    }

    const pSnap = await vagaRef.collection('perguntas').orderBy('ordem').get();
    const perguntas = pSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const objetivas = apurarObjetivas(respostasObjetivas, perguntas);
    const disc = apurarDisc(respostasDisc);
    const pesos = vaga.pesos || PESOS_PADRAO;

    const meses = bancoTalentos ? RETENCAO_BANCO_MESES : RETENCAO_MESES;
    const expiraEm = new Date();
    expiraEm.setMonth(expiraEm.getMonth() + meses);

    const inscricao = {
      vagaId,
      vagaTitulo: vaga.titulo,
      nomeCompleto: String(nomeCompleto).trim(),
      email: emailNormalizado,
      telefone: String(telefone).trim(),
      cidade: String(cidade).trim(),
      regiao: (regiao || '').trim(),
      consentimento: { aceito: true, em: new Date(), versaoPolitica: 'v1' },
      bancoTalentos: Boolean(bancoTalentos),
      expiraEm,
      respostasObjetivas,
      respostasDiscursivas,
      respostasDisc,
      disc,
      eliminada: objetivas.eliminada,
      motivoEliminacao: objetivas.motivoEliminacao,
      notas: {
        requisitos: objetivas.nota,
        respostas: null,
        final: objetivas.eliminada
          ? null
          : calcularNotaFinal({ requisitos: objetivas.nota, respostas: null }, pesos),
      },
      avaliacaoIA: null,
      status: 'inscrita',
      anotacoes: '',
      tempoPreenchimentoSegundos,
      criadoEm: new Date(),
    };

    const ref = await adminDb.collection('inscricoes').add(inscricao);

    await vagaRef.update({
      totalInscricoes: (vaga.totalInscricoes || 0) + 1,
      totalEliminadas: (vaga.totalEliminadas || 0) + (objetivas.eliminada ? 1 : 0),
    });

    return NextResponse.json({ ok: true, id: ref.id });
  } catch (e) {
    console.error('Erro na inscricao:', e);
    return NextResponse.json({ erro: 'Nao foi possivel enviar. Tente de novo.' }, { status: 500 });
  }
}
