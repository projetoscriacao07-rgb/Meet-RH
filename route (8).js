'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdmin, tokenAtual, sair } from '@/components/useAdmin';
import { CabecalhoSimples, Carregando, Vazio, Badge, Aviso, ErroAcesso } from '@/components/Ui';
import { formatarData, diasRestantes } from '@/lib/utils';

export default function PainelAdmin() {
  const router = useRouter();
  const { usuario, erro: erroAcesso } = useAdmin();
  const [vagas, setVagas] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [carregandoSeed, setCarregandoSeed] = useState(false);

  async function carregar() {
    try {
      const snap = await getDocs(query(collection(db, 'vagas'), orderBy('criadoEm', 'desc')));
      setVagas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      // sem isso, uma falha de regra deixaria a lista girando para sempre
      setVagas([]);
      setMensagem({ tipo: 'erro', texto: `Nao consegui ler as vagas: ${e.code || ''} ${e.message}` });
    }
  }

  useEffect(() => { if (usuario) carregar(); }, [usuario]);

  async function carregarDadosIniciais() {
    setCarregandoSeed(true);
    setMensagem(null);
    const token = await tokenAtual();
    const r = await fetch('/api/admin/seed', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await r.json();
    setMensagem(r.ok ? { tipo: 'ok', texto: `Vaga criada com ${d.perguntas} perguntas.` }
                     : { tipo: 'erro', texto: d.erro });
    setCarregandoSeed(false);
    carregar();
  }

  if (erroAcesso) return <ErroAcesso mensagem={erroAcesso} />;

  if (usuario === undefined) return <Carregando />;
  if (!usuario) return null;

  const abertas = vagas?.filter((v) => v.status === 'aberta').length || 0;
  const totalInscricoes = vagas?.reduce((s, v) => s + (v.totalInscricoes || 0), 0) || 0;

  return (
    <main className="pb-16">
      <CabecalhoSimples
        titulo="Meet RH"
        subtitulo={usuario.email}
        acao={
          <button onClick={() => sair(router)} aria-label="Sair"
            className="flex h-9 w-9 items-center justify-center rounded-full transition active:scale-90 hover:bg-white/10">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 px-4 pt-4">
        <div className="rounded-2xl bg-white p-4">
          <p className="text-[13px] text-slate-500">Vagas abertas</p>
          <p className="mt-0.5 text-[26px] font-medium text-marinho-900">{abertas}</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-[13px] text-slate-500">Inscricoes</p>
          <p className="mt-0.5 text-[26px] font-medium text-marinho-900">{totalInscricoes}</p>
        </div>
      </div>

      <div className="px-4 pt-4">
        <Link href="/admin/vaga/nova" className="btn-primario w-full">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nova vaga
        </Link>
      </div>

      {mensagem && <div className="px-4 pt-3"><Aviso tipo={mensagem.tipo}>{mensagem.texto}</Aviso></div>}

      <section className="space-y-3 px-4 pt-5">
        {vagas === null && <Carregando />}

        {vagas?.length === 0 && (
          <div className="rounded-2xl bg-white p-2">
            <Vazio
              titulo="Nenhuma vaga ainda"
              texto="Crie a primeira do zero ou carregue a vaga de secretaria pessoal ja pronta, com as 16 perguntas."
              acao={
                <button onClick={carregarDadosIniciais} disabled={carregandoSeed} className="btn-secundario">
                  {carregandoSeed ? 'Carregando...' : 'Carregar vaga de exemplo'}
                </button>
              }
            />
          </div>
        )}

        {vagas?.map((vaga) => {
          const dias = diasRestantes(vaga.dataFim);
          const encerrada = vaga.status !== 'aberta' || (dias !== null && dias < 0);

          return (
            <Link key={vaga.id} href={`/admin/vaga/${vaga.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-4 transition active:scale-[.99] hover:border-marinho-200">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-[16px] font-medium leading-snug text-slate-900">{vaga.titulo}</h2>
                <Badge cor={encerrada ? 'cinza' : 'verde'}>{encerrada ? 'Encerrada' : 'Aberta'}</Badge>
              </div>

              <div className="mt-3 flex items-center gap-5 text-[13px] text-slate-600">
                <span><strong className="font-medium text-slate-900">{vaga.totalInscricoes || 0}</strong> inscritas</span>
                <span><strong className="font-medium text-slate-900">{vaga.totalEliminadas || 0}</strong> cortadas</span>
                {!encerrada && dias !== null && (
                  <span className={dias <= 3 ? 'text-amber-700' : ''}>
                    {dias === 0 ? 'encerra hoje' : `${dias}d restantes`}
                  </span>
                )}
              </div>

              <p className="mt-2 text-[12px] text-slate-400">Ate {formatarData(vaga.dataFim)}</p>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
