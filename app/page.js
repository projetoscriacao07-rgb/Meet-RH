'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Carregando, Vazio, Badge } from '@/components/Ui';

export default function Home() {
  const [vagas, setVagas] = useState(null);

  useEffect(() => {
    fetch('/api/vagas')
      .then((r) => r.json())
      .then((d) => setVagas(d.vagas || []))
      .catch(() => setVagas([]));
  }, []);

  return (
    <main className="pb-16">
      <header className="bg-marinho-900 px-5 pb-8 pt-10 text-white">
        <p className="text-[22px] font-medium tracking-tight">Meet RH</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-marinho-200">
          Vagas abertas. Escolha uma para ver o escopo e se candidatar.
        </p>
      </header>

      <section className="-mt-4 space-y-3 px-4">
        {vagas === null && <Carregando texto="Buscando vagas" />}

        {vagas?.length === 0 && (
          <div className="rounded-2xl bg-white p-2">
            <Vazio
              titulo="Nenhuma vaga aberta agora"
              texto="Assim que uma nova oportunidade for publicada, ela aparece aqui."
            />
          </div>
        )}

        {vagas?.map((vaga) => (
          <Link
            key={vaga.id}
            href={`/vaga/${vaga.slug}`}
            className="block rounded-2xl border border-slate-200 bg-white p-4 transition active:scale-[.99] hover:border-marinho-200"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-[17px] font-medium leading-snug text-slate-900">{vaga.titulo}</h2>
              <svg className="mt-1 shrink-0 text-marinho-600" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>

            <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{vaga.resumo}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge cor="cinza">{vaga.cidade}</Badge>
              {vaga.regiao && <Badge cor="cinza">{vaga.regiao}</Badge>}
              {vaga.dataFim && (
                <Badge cor="ambar">
                  Ate {new Date(vaga.dataFim).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </Badge>
              )}
            </div>
          </Link>
        ))}
      </section>

      <footer className="mt-10 px-5 text-center">
        <Link href="/admin" className="text-[13px] text-slate-400 underline decoration-slate-300 underline-offset-4">
          Acesso do administrador
        </Link>
      </footer>
    </main>
  );
}
