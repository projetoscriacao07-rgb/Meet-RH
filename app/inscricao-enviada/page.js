import Link from 'next/link';

export default function InscricaoEnviada() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      <h1 className="mt-5 text-[21px] font-medium text-slate-900">Candidatura enviada</h1>
      <p className="mt-2.5 max-w-sm text-[15px] leading-relaxed text-slate-600">
        Recebemos suas respostas. Vamos analisar com calma e dar retorno pelo e-mail
        que voce cadastrou, mesmo que a resposta seja negativa.
      </p>

      <Link href="/" className="btn-secundario mt-7">Ver outras vagas</Link>
    </main>
  );
}
