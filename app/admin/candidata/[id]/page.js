'use client';
import { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdmin, tokenAtual } from '@/components/useAdmin';
import { Cabecalho, Carregando, Badge, Barra, Aviso, ErroAcesso } from '@/components/Ui';
import { ROTULOS_DISC } from '@/lib/disc';
import { faixaDaNota } from '@/lib/pontuacao';

const CORES_FAIXA = { verde: '#1B8A62', ambar: '#C98500', vermelho: '#C0392B', cinza: '#94A3B8' };

const ETAPAS = [
  ['inscrita', 'Inscrita'], ['triagem', 'Triagem'], ['entrevista', 'Entrevista'],
  ['finalista', 'Finalista'], ['contratada', 'Contratada'], ['reprovada', 'Reprovada'],
];

export default function Candidata({ params }) {
  const { usuario, erro: erroAcesso } = useAdmin();
  const [ins, setIns] = useState(null);
  const [perguntas, setPerguntas] = useState([]);
  const [avaliando, setAvaliando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [anotacoes, setAnotacoes] = useState('');

  async function carregar() {
    const d = await getDoc(doc(db, 'inscricoes', params.id));
    if (!d.exists()) return;
    const dados = { id: d.id, ...d.data() };
    setIns(dados);
    setAnotacoes(dados.anotacoes || '');

    const snap = await getDocs(query(collection(db, 'vagas', dados.vagaId, 'perguntas'), orderBy('ordem')));
    setPerguntas(snap.docs.map((p) => ({ id: p.id, ...p.data() })));
  }

  useEffect(() => { if (usuario) carregar(); }, [usuario, params.id]);

  async function avaliar() {
    setAvaliando(true);
    setAviso(null);
    const token = await tokenAtual();
    const r = await fetch('/api/admin/avaliar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ inscricaoId: params.id }),
    });
    const d = await r.json();
    setAviso(r.ok ? { tipo: 'ok', texto: 'Avaliacao concluida.' } : { tipo: 'erro', texto: d.erro });
    setAvaliando(false);
    carregar();
  }

  async function mudarStatus(novo) {
    await updateDoc(doc(db, 'inscricoes', params.id), { status: novo });
    carregar();
  }

  async function salvarAnotacoes() {
    await updateDoc(doc(db, 'inscricoes', params.id), { anotacoes });
    setAviso({ tipo: 'ok', texto: 'Anotacoes salvas.' });
  }

  if (erroAcesso) return <ErroAcesso mensagem={erroAcesso} />;

  if (usuario === undefined || !ins) return <Carregando />;

  const faixa = faixaDaNota(ins.notas?.final);
  const objetivas = perguntas.filter((p) => p.tipo !== 'discursiva');
  const discursivas = perguntas.filter((p) => p.tipo === 'discursiva');

  return (
    <main className="pb-16">
      <Cabecalho titulo={ins.nomeCompleto} subtitulo={ins.vagaTitulo} voltarPara={`/admin/vaga/${ins.vagaId}`} />

      <div className="px-4 pt-4">
        <div className="cartao">
          {ins.eliminada ? (
            <div className="flex items-start gap-3">
              <Badge cor="vermelho">Cortada</Badge>
              <p className="text-[13px] leading-relaxed text-slate-600">{ins.motivoEliminacao}</p>
            </div>
          ) : (
            <>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[13px] text-slate-500">Nota final</p>
                  <p className="text-[34px] font-medium leading-none" style={{ color: CORES_FAIXA[faixa.cor] }}>
                    {ins.notas?.final ?? '-'}
                  </p>
                </div>
                <Badge cor={faixa.cor}>{faixa.rotulo}</Badge>
              </div>

              <div className="mt-4 space-y-3">
                <ParcialNota rotulo="Requisitos" valor={ins.notas?.requisitos} />
                <ParcialNota rotulo="Respostas discursivas" valor={ins.notas?.respostas} />
              </div>

              {ins.notas?.respostas === null && (
                <button onClick={avaliar} disabled={avaliando} className="btn-primario mt-4 w-full">
                  {avaliando ? 'Avaliando as respostas...' : 'Avaliar respostas com IA'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {aviso && <div className="px-4 pt-3"><Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso></div>}

      <div className="px-4 pt-3">
        <div className="cartao space-y-1.5 text-[14px]">
          <Linha rotulo="E-mail" valor={ins.email} />
          <Linha rotulo="Telefone" valor={ins.telefone} />
          <Linha rotulo="Cidade" valor={`${ins.cidade}${ins.regiao ? ` - ${ins.regiao}` : ''}`} />
          <Linha rotulo="Preenchimento" valor={`${Math.round((ins.tempoPreenchimentoSegundos || 0) / 60)} min`} />
          <Linha rotulo="Banco de talentos" valor={ins.bancoTalentos ? 'Autorizado' : 'Nao'} />
        </div>
      </div>

      <div className="px-4 pt-3">
        <p className="mb-2 px-1 text-[13px] font-medium text-slate-500">Etapa do processo</p>
        <div className="flex flex-wrap gap-2">
          {ETAPAS.map(([id, texto]) => (
            <button key={id} onClick={() => mudarStatus(id)}
              className={`rounded-xl px-3.5 py-2 text-[13px] font-medium transition ${
                ins.status === id ? 'bg-marinho-800 text-white' : 'border border-slate-200 bg-white text-slate-600'}`}>
              {texto}
            </button>
          ))}
        </div>
      </div>

      {ins.avaliacaoIA && (
        <div className="px-4 pt-5">
          <p className="mb-2 px-1 text-[15px] font-medium text-slate-900">Leitura do recrutador</p>
          <div className="space-y-2.5">
            {discursivas.map((p) => {
              const r = ins.avaliacaoIA.porPergunta?.[p.id];
              if (!r) return null;
              const f = faixaDaNota(r.nota);
              return (
                <div key={p.id} className="cartao">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[14px] font-medium leading-snug text-slate-800">{p.enunciado}</p>
                    <span className="shrink-0 text-[17px] font-medium" style={{ color: CORES_FAIXA[f.cor] }}>{r.nota}</span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{r.comentario}</p>
                  {r.alertaAcionado && (
                    <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-[12px] text-rose-800">
                      Sinal de alerta acionado nesta resposta
                    </p>
                  )}
                  <details className="mt-2.5">
                    <summary className="cursor-pointer text-[13px] text-marinho-600">Ver resposta completa</summary>
                    <p className="mt-2 whitespace-pre-line rounded-xl bg-slate-50 p-3 text-[13px] leading-relaxed text-slate-700">
                      {ins.respostasDiscursivas?.[p.id] || '(em branco)'}
                    </p>
                  </details>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!ins.avaliacaoIA && discursivas.length > 0 && (
        <div className="px-4 pt-5">
          <p className="mb-2 px-1 text-[15px] font-medium text-slate-900">Respostas discursivas</p>
          <div className="space-y-2.5">
            {discursivas.map((p) => (
              <div key={p.id} className="cartao">
                <p className="text-[14px] font-medium leading-snug text-slate-800">{p.enunciado}</p>
                <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-slate-600">
                  {ins.respostasDiscursivas?.[p.id] || '(em branco)'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 pt-5">
        <p className="mb-2 px-1 text-[15px] font-medium text-slate-900">Respostas objetivas</p>
        <div className="cartao space-y-2.5">
          {objetivas.map((p) => {
            const escolhaId = ins.respostasObjetivas?.[p.id];
            const opcao = (p.opcoes || []).find((o) => o.id === escolhaId);
            return (
              <div key={p.id} className="border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                <p className="text-[13px] leading-snug text-slate-500">{p.enunciado}</p>
                <p className={`mt-0.5 text-[14px] font-medium ${opcao?.elimina ? 'text-rose-700' : 'text-slate-800'}`}>
                  {opcao?.texto || '-'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {ins.disc && (
        <div className="px-4 pt-5">
          <p className="mb-2 px-1 text-[15px] font-medium text-slate-900">Perfil comportamental</p>
          <div className="cartao">
            <p className="mb-3.5 text-[13px] leading-relaxed text-slate-500">
              Nao entra na nota. Serve para preparar a entrevista e entender o estilo de trabalho.
            </p>
            {['D', 'I', 'S', 'C'].map((f) => (
              <div key={f} className="mb-3.5 last:mb-0">
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="text-[14px] font-medium text-slate-800">
                    {f} - {ROTULOS_DISC[f].nome}
                    {ins.disc.primario === f && <span className="ml-2 text-[11px] text-slate-400">principal</span>}
                  </span>
                  <span className="shrink-0 text-[13px] text-slate-500">{ins.disc.percentual[f]}%</span>
                </div>
                <Barra valor={ins.disc.percentual[f]} cor={ROTULOS_DISC[f].cor} />
              </div>
            ))}
            {!ins.disc.completo && (
              <p className="mt-3 text-[12px] text-amber-700">
                Respondeu {ins.disc.respondidos} de 20 blocos. Leitura parcial.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="px-4 pt-5">
        <p className="mb-2 px-1 text-[15px] font-medium text-slate-900">Anotacoes internas</p>
        <div className="cartao">
          <textarea className="campo min-h-[110px] resize-none" placeholder="So voce ve isso"
            value={anotacoes} onChange={(e) => setAnotacoes(e.target.value)} />
          <button onClick={salvarAnotacoes} className="btn-secundario mt-3 w-full">Salvar anotacoes</button>
        </div>
      </div>
    </main>
  );
}

function ParcialNota({ rotulo, valor }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-[13px]">
        <span className="text-slate-600">{rotulo}</span>
        <span className="font-medium text-slate-800">{valor ?? 'nao avaliado'}</span>
      </div>
      <Barra valor={valor || 0} />
    </div>
  );
}

function Linha({ rotulo, valor }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="shrink-0 text-slate-500">{rotulo}</span>
      <span className="truncate text-right font-medium text-slate-800">{valor || '-'}</span>
    </div>
  );
}
