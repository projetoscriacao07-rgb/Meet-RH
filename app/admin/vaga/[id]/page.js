'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdmin } from '@/components/useAdmin';
import { Cabecalho, Carregando, Vazio, Badge, Barra, Aviso, ErroAcesso } from '@/components/Ui';
import { formatarData, paraISO, diasRestantes, iniciais } from '@/lib/utils';
import { ROTULOS_DISC } from '@/lib/disc';
import { faixaDaNota } from '@/lib/pontuacao';

const CORES_FAIXA = { verde: '#1B8A62', ambar: '#C98500', vermelho: '#C0392B', cinza: '#94A3B8' };

export default function DetalheVaga({ params }) {
  const { usuario, erro: erroAcesso } = useAdmin();
  const [vaga, setVaga] = useState(null);
  const [inscricoes, setInscricoes] = useState(null);
  const [aba, setAba] = useState('ranking');
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState(null);

  async function carregar() {
    const vDoc = await getDoc(doc(db, 'vagas', params.id));
    if (!vDoc.exists()) return;
    setVaga({ id: vDoc.id, ...vDoc.data() });

    const snap = await getDocs(query(collection(db, 'inscricoes'), where('vagaId', '==', params.id)));
    setInscricoes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  useEffect(() => { if (usuario) carregar(); }, [usuario, params.id]);

  const ordenadas = useMemo(() => {
    if (!inscricoes) return [];
    return [...inscricoes].sort((a, b) => {
      if (a.eliminada !== b.eliminada) return a.eliminada ? 1 : -1;
      return (b.notas?.final ?? -1) - (a.notas?.final ?? -1);
    });
  }, [inscricoes]);

  const metricas = useMemo(() => {
    if (!inscricoes) return null;
    const validas = inscricoes.filter((i) => !i.eliminada);
    const fortes = validas.filter((i) => (i.notas?.final ?? 0) >= 80).length;
    const cidadeVaga = (vaga?.cidade || '').toLowerCase().trim();
    const mesmaCidade = inscricoes.filter((i) => (i.cidade || '').toLowerCase().trim() === cidadeVaga).length;

    const perfis = { D: 0, I: 0, S: 0, C: 0 };
    let comPerfil = 0;
    for (const i of inscricoes) {
      if (i.disc?.primario) { perfis[i.disc.primario] += 1; comPerfil += 1; }
    }

    return { total: inscricoes.length, fortes, mesmaCidade, cortadas: inscricoes.length - validas.length, perfis, comPerfil };
  }, [inscricoes, vaga]);

  async function salvarDataFim(iso) {
    if (!iso) return;
    setSalvando(true);
    await updateDoc(doc(db, 'vagas', params.id), { dataFim: new Date(`${iso}T23:59:59`), status: 'aberta' });
    setAviso({ tipo: 'ok', texto: 'Data de encerramento atualizada.' });
    setSalvando(false);
    carregar();
  }

  async function encerrarAgora() {
    setSalvando(true);
    await updateDoc(doc(db, 'vagas', params.id), { status: 'encerrada', encerradaEm: new Date() });
    setAviso({ tipo: 'ok', texto: 'Vaga encerrada. O link publico passa a avisar as candidatas.' });
    setSalvando(false);
    carregar();
  }

  async function reabrir() {
    setSalvando(true);
    await updateDoc(doc(db, 'vagas', params.id), { status: 'aberta', encerradaEm: null });
    setAviso({ tipo: 'ok', texto: 'Vaga reaberta.' });
    setSalvando(false);
    carregar();
  }

  function copiarLink() {
    const url = `${window.location.origin}/vaga/${vaga.slug}`;
    navigator.clipboard?.writeText(url);
    setAviso({ tipo: 'ok', texto: 'Link copiado. E so colar no WhatsApp ou no Instagram.' });
  }

  if (erroAcesso) return <ErroAcesso mensagem={erroAcesso} />;

  if (usuario === undefined || !vaga || !inscricoes) return <Carregando />;

  const dias = diasRestantes(vaga.dataFim);
  const encerrada = vaga.status !== 'aberta' || (dias !== null && dias < 0);

  return (
    <main className="pb-16">
      <Cabecalho titulo={vaga.titulo} subtitulo={encerrada ? 'Encerrada' : `${dias}d restantes`} voltarPara="/admin" />

      <div className="grid grid-cols-2 gap-3 px-4 pt-4">
        <Metrica rotulo="Inscritas" valor={metricas.total} />
        <Metrica rotulo="Nota 80+" valor={metricas.fortes} cor="#1B8A62" />
        <Metrica rotulo="Mesma cidade" valor={metricas.mesmaCidade} cor="#1B4E8C" />
        <Metrica rotulo="Cortadas" valor={metricas.cortadas} cor="#C0392B" />
      </div>

      {aviso && <div className="px-4 pt-4"><Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso></div>}

      <div className="sticky top-[60px] z-10 mt-5 flex gap-1 bg-[#F5F7FA] px-4 pb-2">
        {[['ranking', 'Ranking'], ['perfis', 'Perfis'], ['config', 'Configurar']].map(([id, texto]) => (
          <button key={id} onClick={() => setAba(id)}
            className={`flex-1 rounded-xl px-3 py-2.5 text-[14px] font-medium transition ${
              aba === id ? 'bg-marinho-800 text-white' : 'bg-white text-slate-600'}`}>
            {texto}
          </button>
        ))}
      </div>

      {aba === 'ranking' && (
        <section className="space-y-2.5 px-4 pt-2">
          {ordenadas.length === 0 && (
            <div className="rounded-2xl bg-white p-2">
              <Vazio titulo="Nenhuma inscricao ainda"
                texto="Compartilhe o link da vaga para comecar a receber candidaturas."
                acao={<button onClick={copiarLink} className="btn-secundario">Copiar link da vaga</button>} />
            </div>
          )}

          {ordenadas.map((inscricao) => {
            const nota = inscricao.notas?.final;
            const faixa = faixaDaNota(nota);
            const disc = inscricao.disc;

            return (
              <Link key={inscricao.id} href={`/admin/candidata/${inscricao.id}`}
                className={`block rounded-2xl border bg-white p-4 transition active:scale-[.99] ${
                  inscricao.eliminada ? 'border-slate-200 opacity-70' : 'border-slate-200 hover:border-marinho-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-marinho-50 text-[13px] font-medium text-marinho-800">
                    {iniciais(inscricao.nomeCompleto)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-slate-900">{inscricao.nomeCompleto}</p>
                    <p className="truncate text-[12px] text-slate-500">
                      {inscricao.cidade}{inscricao.regiao ? ` - ${inscricao.regiao}` : ''}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    {inscricao.eliminada ? (
                      <Badge cor="vermelho">Cortada</Badge>
                    ) : (
                      <>
                        <p className="text-[19px] font-medium leading-none" style={{ color: CORES_FAIXA[faixa.cor] }}>
                          {nota ?? '-'}
                        </p>
                        {disc?.primario && (
                          <p className="mt-1 text-[11px] text-slate-400">{disc.primario}/{disc.secundario}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {inscricao.eliminada ? (
                  <p className="mt-2.5 text-[12px] leading-relaxed text-rose-700">{inscricao.motivoEliminacao}</p>
                ) : (
                  <div className="mt-3">
                    <Barra valor={nota || 0} cor={CORES_FAIXA[faixa.cor]} />
                    <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
                      <span>Requisitos {inscricao.notas?.requisitos ?? '-'}</span>
                      <span>{inscricao.notas?.respostas === null ? 'Respostas nao avaliadas' : `Respostas ${inscricao.notas.respostas}`}</span>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </section>
      )}

      {aba === 'perfis' && (
        <section className="space-y-3 px-4 pt-2">
          <Aviso>
            O perfil comportamental nao entra no ranking. Ele fica aqui para sua leitura,
            depois que voce ja olhou as respostas.
          </Aviso>

          <div className="cartao">
            <p className="mb-4 text-[15px] font-medium text-slate-900">
              Distribuicao das {metricas.comPerfil} candidatas que responderam
            </p>

            {['D', 'I', 'S', 'C'].map((fator) => {
              const qtd = metricas.perfis[fator];
              const pct = metricas.comPerfil ? Math.round((qtd / metricas.comPerfil) * 100) : 0;
              const info = ROTULOS_DISC[fator];

              return (
                <div key={fator} className="mb-4 last:mb-0">
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="text-[14px] font-medium text-slate-800">{fator} - {info.nome}</span>
                    <span className="shrink-0 text-[13px] text-slate-500">{qtd} ({pct}%)</span>
                  </div>
                  <Barra valor={pct} cor={info.cor} />
                  <p className="mt-1.5 text-[12px] leading-relaxed text-slate-500">{info.resumo}</p>
                </div>
              );
            })}
          </div>

          <div className="cartao">
            <p className="mb-3 text-[15px] font-medium text-slate-900">Por candidata</p>
            <div className="space-y-2.5">
              {ordenadas.filter((i) => i.disc?.primario).map((i) => (
                <Link key={i.id} href={`/admin/candidata/${i.id}`}
                  className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <span className="truncate text-[14px] text-slate-700">{i.nomeCompleto}</span>
                  <span className="flex shrink-0 gap-1">
                    {['D', 'I', 'S', 'C'].map((f) => (
                      <span key={f}
                        className="flex h-6 w-7 items-center justify-center rounded text-[11px] font-medium"
                        style={{
                          background: f === i.disc.primario ? ROTULOS_DISC[f].cor : '#F1F5F9',
                          color: f === i.disc.primario ? '#fff' : '#94A3B8',
                        }}>
                        {i.disc.percentual[f]}
                      </span>
                    ))}
                  </span>
                </Link>
              ))}
              {metricas.comPerfil === 0 && (
                <p className="py-2 text-[13px] text-slate-400">Ninguem respondeu essa parte ainda.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {aba === 'config' && (
        <section className="space-y-3 px-4 pt-2">
          <div className="cartao space-y-4">
            <div>
              <label className="rotulo">Data de encerramento</label>
              <input type="date" className="campo" defaultValue={paraISO(vaga.dataFim)}
                onChange={(e) => salvarDataFim(e.target.value)} disabled={salvando} />
              <p className="mt-1.5 text-[12px] text-slate-500">
                Depois desta data o link publico avisa que a vaga foi encerrada. Atual: {formatarData(vaga.dataFim)}
              </p>
            </div>

            {encerrada ? (
              <button onClick={reabrir} disabled={salvando} className="btn-secundario w-full">Reabrir vaga</button>
            ) : (
              <button onClick={encerrarAgora} disabled={salvando}
                className="btn w-full border border-rose-200 bg-rose-50 text-rose-700">
                Encerrar agora
              </button>
            )}
          </div>

          <div className="cartao">
            <p className="mb-2 text-[15px] font-medium text-slate-900">Link para divulgar</p>
            <p className="mb-3 break-all rounded-xl bg-slate-50 px-3 py-2.5 text-[13px] text-slate-600">
              /vaga/{vaga.slug}
            </p>
            <button onClick={copiarLink} className="btn-secundario w-full">Copiar link completo</button>
          </div>
        </section>
      )}
    </main>
  );
}

function Metrica({ rotulo, valor, cor = '#0C3260' }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-[13px] text-slate-500">{rotulo}</p>
      <p className="mt-0.5 text-[26px] font-medium" style={{ color: cor }}>{valor}</p>
    </div>
  );
}
