'use client';
import { useRouter } from 'next/navigation';

export function Cabecalho({ titulo, subtitulo, voltarPara, acao }) {
  const router = useRouter();

  function voltar() {
    if (voltarPara) router.push(voltarPara);
    else if (window.history.length > 1) router.back();
    else router.push('/');
  }

  return (
    <header className="sticky top-0 z-20 bg-marinho-900 px-4 py-3.5 text-white shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={voltar}
          aria-label="Voltar"
          className="-ml-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition active:scale-90 hover:bg-white/10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-medium leading-tight">{titulo}</h1>
          {subtitulo && <p className="truncate text-[13px] text-marinho-200">{subtitulo}</p>}
        </div>
        {acao}
      </div>
    </header>
  );
}

export function CabecalhoSimples({ titulo, subtitulo, acao }) {
  return (
    <header className="sticky top-0 z-20 bg-marinho-900 px-4 py-4 text-white shadow-sm">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[18px] font-medium leading-tight">{titulo}</h1>
          {subtitulo && <p className="truncate text-[13px] text-marinho-200">{subtitulo}</p>}
        </div>
        {acao}
      </div>
    </header>
  );
}

export function Carregando({ texto = 'Carregando' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-marinho-600" />
      <p className="text-sm">{texto}</p>
    </div>
  );
}

export function Vazio({ titulo, texto, acao }) {
  return (
    <div className="px-4 py-16 text-center">
      <p className="text-[16px] font-medium text-slate-700">{titulo}</p>
      {texto && <p className="mx-auto mt-1.5 max-w-xs text-[14px] leading-relaxed text-slate-500">{texto}</p>}
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}

const CORES_BADGE = {
  verde: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  ambar: 'bg-amber-50 text-amber-800 border-amber-200',
  vermelho: 'bg-rose-50 text-rose-800 border-rose-200',
  azul: 'bg-marinho-50 text-marinho-800 border-marinho-200',
  cinza: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function Badge({ children, cor = 'cinza' }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-lg border px-2.5 py-1 text-[12px] font-medium ${CORES_BADGE[cor] || CORES_BADGE.cinza}`}>
      {children}
    </span>
  );
}

export function Barra({ valor, cor = '#1B4E8C' }) {
  const largura = Math.max(0, Math.min(100, valor || 0));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-150 bg-slate-200">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${largura}%`, background: cor }} />
    </div>
  );
}

export function Aviso({ tipo = 'info', children }) {
  const estilos = {
    info: 'bg-marinho-50 text-marinho-800 border-marinho-100',
    erro: 'bg-rose-50 text-rose-800 border-rose-100',
    ok: 'bg-emerald-50 text-emerald-800 border-emerald-100',
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-[13px] leading-relaxed ${estilos[tipo]}`}>
      {children}
    </div>
  );
}

export function ErroAcesso({ mensagem }) {
  return (
    <main className="flex min-h-screen flex-col justify-center px-5">
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
        <p className="text-[16px] font-medium text-rose-900">Nao consegui abrir o painel</p>
        <p className="mt-2 break-words text-[13px] leading-relaxed text-rose-800">{mensagem}</p>
      </div>
      <div className="mt-4 flex gap-2">
        <a href="/admin/login" className="btn-secundario flex-1">Entrar de novo</a>
        <a href="/admin/diagnostico" className="btn-secundario flex-1">Diagnostico</a>
      </div>
    </main>
  );
}
