'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Carregando, Vazio, Aviso, Badge } from '@/components/Ui';

export default function PaginaVaga({ params }) {
  const router = useRouter();
  const { slug } = params;

  const [dados, setDados] = useState(null);
  const [erroCarregar, setErroCarregar] = useState(null);

  const [etapa, setEtapa] = useState('escopo');
  const [indice, setIndice] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  const [identificacao, setIdentificacao] = useState({
    nomeCompleto: '', email: '', telefone: '', cidade: '', regiao: '',
  });
  const [objetivas, setObjetivas] = useState({});
  const [discursivas, setDiscursivas] = useState({});
  const [disc, setDisc] = useState({});
  const [consentimento, setConsentimento] = useState(false);
  const [bancoTalentos, setBancoTalentos] = useState(false);

  const inicio = useRef(Date.now());
  const chaveRascunho = `meetrh:${slug}`;

  useEffect(() => {
    fetch(`/api/vagas/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.erro) setErroCarregar(d.erro);
        else setDados(d);
      })
      .catch(() => setErroCarregar('Nao foi possivel carregar a vaga'));
  }, [slug]);

  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem(chaveRascunho) || 'null');
      if (salvo) {
        setIdentificacao(salvo.identificacao || identificacao);
        setObjetivas(salvo.objetivas || {});
        setDiscursivas(salvo.discursivas || {});
        setDisc(salvo.disc || {});
      }
    } catch {}
  }, [chaveRascunho]);

  useEffect(() => {
    try {
      localStorage.setItem(chaveRascunho, JSON.stringify({ identificacao, objetivas, discursivas, disc }));
    } catch {}
  }, [identificacao, objetivas, discursivas, disc, chaveRascunho]);

  useEffect(() => { window.scrollTo(0, 0); }, [etapa, indice]);

  if (erroCarregar) {
    return (
      <main className="px-4">
        <Vazio titulo="Vaga nao encontrada" texto={erroCarregar}
          acao={<Link href="/" className="btn-primario">Ver vagas abertas</Link>} />
      </main>
    );
  }

  if (!dados) return <Carregando texto="Abrindo a vaga" />;

  if (dados.encerrada) {
    return (
      <main className="px-4">
        <Vazio
          titulo="Esta vaga foi encerrada"
          texto={`As inscricoes para ${dados.vaga.titulo} nao estao mais abertas. Veja o que temos disponivel agora.`}
          acao={<Link href="/" className="btn-primario">Ver vagas abertas</Link>}
        />
      </main>
    );
  }

  const { vaga, perguntas, blocos } = dados;
  const totalPassos = perguntas.length + blocos.length;
  const passoAtual =
    etapa === 'perguntas' ? indice + 1
    : etapa === 'comportamental' ? perguntas.length + indice + 1
    : etapa === 'revisao' ? totalPassos : 0;
  const progresso = totalPassos ? Math.round((passoAtual / totalPassos) * 100) : 0;

  function voltar() {
    setErro(null);
    if (etapa === 'escopo') { router.push('/'); return; }
    if (etapa === 'identificacao') { setEtapa('escopo'); return; }
    if (etapa === 'perguntas') {
      if (indice === 0) setEtapa('identificacao');
      else setIndice(indice - 1);
      return;
    }
    if (etapa === 'comportamental') {
      if (indice === 0) { setEtapa('perguntas'); setIndice(perguntas.length - 1); }
      else setIndice(indice - 1);
      return;
    }
    if (etapa === 'revisao') { setEtapa('comportamental'); setIndice(blocos.length - 1); }
  }

  function avancarPergunta() {
    setErro(null);
    if (indice + 1 < perguntas.length) setIndice(indice + 1);
    else { setEtapa('comportamental'); setIndice(0); }
  }

  function avancarBloco() {
    if (indice + 1 < blocos.length) setIndice(indice + 1);
    else setEtapa('revisao');
  }

  function validarIdentificacao() {
    const { nomeCompleto, email, telefone, cidade } = identificacao;
    if (!nomeCompleto.trim() || nomeCompleto.trim().split(/\s+/).length < 2)
      return 'Escreva seu nome completo';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Confira o e-mail';
    if (telefone.replace(/\D/g, '').length < 10) return 'Confira o telefone com DDD';
    if (!cidade.trim()) return 'Informe sua cidade';
    return null;
  }

  async function enviar() {
    if (!consentimento) { setErro('E preciso aceitar o uso dos dados'); return; }
    setEnviando(true);
    setErro(null);

    try {
      const r = await fetch('/api/inscricao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vagaId: vaga.id,
          ...identificacao,
          respostasObjetivas: objetivas,
          respostasDiscursivas: discursivas,
          respostasDisc: disc,
          consentimento: true,
          bancoTalentos,
          tempoPreenchimentoSegundos: Math.round((Date.now() - inicio.current) / 1000),
        }),
      });
      const d = await r.json();
      if (!r.ok) { setErro(d.erro || 'Nao foi possivel enviar'); setEnviando(false); return; }

      try { localStorage.removeItem(chaveRascunho); } catch {}
      router.push('/inscricao-enviada');
    } catch {
      setErro('Falha de conexao. Tente de novo.');
      setEnviando(false);
    }
  }

  return (
    <main className="pb-24">
      <header className="sticky top-0 z-20 bg-marinho-900 text-white">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <button onClick={voltar} aria-label="Voltar"
            className="-ml-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition active:scale-90 hover:bg-white/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-medium leading-tight">{vaga.titulo}</p>
            <p className="truncate text-[12px] text-marinho-200">{vaga.cidade}</p>
          </div>
        </div>

        {passoAtual > 0 && (
          <div className="px-4 pb-3">
            <div className="mb-1.5 flex justify-between text-[12px] text-marinho-200">
              <span>{etapa === 'comportamental' ? `Sobre voce ${indice + 1} de ${blocos.length}` : `Pergunta ${passoAtual} de ${totalPassos}`}</span>
              <span>{progresso}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white transition-all duration-300" style={{ width: `${progresso}%` }} />
            </div>
          </div>
        )}
      </header>

      <div className="px-4 pt-5">
        {etapa === 'escopo' && (
          <div className="space-y-4">
            <div className="cartao">
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge cor="azul">{vaga.cidade}</Badge>
                {vaga.dataFim && (
                  <Badge cor="ambar">
                    Inscricoes ate {new Date(vaga.dataFim).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </Badge>
                )}
              </div>
              <p className="whitespace-pre-line text-[14px] leading-relaxed text-slate-700">{vaga.escopo}</p>
            </div>

            {vaga.requisitos?.length > 0 && (
              <div className="cartao">
                <p className="mb-2.5 text-[15px] font-medium text-slate-900">Requisitos</p>
                <ul className="space-y-2">
                  {vaga.requisitos.map((r, i) => (
                    <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-slate-700">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-marinho-400" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Aviso>
              O formulario leva cerca de 12 minutos. Suas respostas ficam salvas no aparelho,
              entao voce pode parar e voltar depois.
            </Aviso>

            <button onClick={() => setEtapa('identificacao')} className="btn-primario w-full">
              Quero me candidatar
            </button>
          </div>
        )}

        {etapa === 'identificacao' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-[19px] font-medium text-slate-900">Vamos comecar</h2>
              <p className="mt-1 text-[14px] text-slate-500">So o essencial para entrar em contato.</p>
            </div>

            <div className="cartao space-y-4">
              <div>
                <label className="rotulo">Nome completo</label>
                <input className="campo" value={identificacao.nomeCompleto} autoComplete="name"
                  onChange={(e) => setIdentificacao({ ...identificacao, nomeCompleto: e.target.value })} />
              </div>
              <div>
                <label className="rotulo">E-mail</label>
                <input className="campo" type="email" inputMode="email" autoComplete="email"
                  placeholder="nome@email.com" value={identificacao.email}
                  onChange={(e) => setIdentificacao({ ...identificacao, email: e.target.value })} />
              </div>
              <div>
                <label className="rotulo">Telefone com DDD</label>
                <input className="campo" type="tel" inputMode="tel" autoComplete="tel"
                  placeholder="(11) 90000-0000" value={identificacao.telefone}
                  onChange={(e) => setIdentificacao({ ...identificacao, telefone: e.target.value })} />
              </div>
              <div>
                <label className="rotulo">Cidade onde mora</label>
                <input className="campo" value={identificacao.cidade}
                  onChange={(e) => setIdentificacao({ ...identificacao, cidade: e.target.value })} />
              </div>
              <div>
                <label className="rotulo">Bairro ou regiao <span className="font-normal text-slate-400">(opcional)</span></label>
                <input className="campo" placeholder="Ajuda a saber a distancia ate o trabalho"
                  value={identificacao.regiao}
                  onChange={(e) => setIdentificacao({ ...identificacao, regiao: e.target.value })} />
              </div>
            </div>

            {erro && <Aviso tipo="erro">{erro}</Aviso>}

            <button
              onClick={() => {
                const problema = validarIdentificacao();
                if (problema) { setErro(problema); return; }
                setErro(null); setEtapa('perguntas'); setIndice(0);
              }}
              className="btn-primario w-full"
            >
              Continuar
            </button>
          </div>
        )}

        {etapa === 'perguntas' && (
          <PerguntaAtual
            pergunta={perguntas[indice]}
            valorObjetiva={objetivas[perguntas[indice].id]}
            valorDiscursiva={discursivas[perguntas[indice].id] || ''}
            aoEscolher={(opcaoId) => {
              setObjetivas({ ...objetivas, [perguntas[indice].id]: opcaoId });
              setTimeout(avancarPergunta, 220);
            }}
            aoEscrever={(texto) => setDiscursivas({ ...discursivas, [perguntas[indice].id]: texto })}
            aoAvancar={avancarPergunta}
            erro={erro}
            setErro={setErro}
          />
        )}

        {etapa === 'comportamental' && (
          <div className="space-y-4">
            {indice === 0 && (
              <Aviso>
                Ultima parte. Sao 20 escolhas rapidas para eu te conhecer melhor.
                Nao existe resposta certa nem errada, e responder e opcional.
              </Aviso>
            )}

            <div>
              <p className="text-[13px] text-slate-500">Pra te conhecer melhor</p>
              <h2 className="mt-1 text-[18px] font-medium leading-snug text-slate-900">
                Qual frase mais tem a ver com voce no dia a dia?
              </h2>
            </div>

            <div className="space-y-2.5">
              {blocos[indice].alternativas.map((alt) => {
                const escolhida = disc[blocos[indice].id] === alt.id;
                return (
                  <button
                    key={alt.id}
                    onClick={() => {
                      setDisc({ ...disc, [blocos[indice].id]: alt.id });
                      setTimeout(avancarBloco, 220);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-[15px] leading-snug transition active:scale-[.99] ${
                      escolhida
                        ? 'border-marinho-600 bg-marinho-50 text-marinho-900 ring-2 ring-marinho-100'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-marinho-200'
                    }`}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${escolhida ? 'border-marinho-600 bg-marinho-600' : 'border-slate-300'}`}>
                      {escolhida && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                    {alt.texto}
                  </button>
                );
              })}
            </div>

            <button onClick={() => setEtapa('revisao')} className="w-full py-2 text-[14px] text-slate-500 underline underline-offset-4">
              Pular esta parte e enviar
            </button>
          </div>
        )}

        {etapa === 'revisao' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-[19px] font-medium text-slate-900">Tudo pronto</h2>
              <p className="mt-1 text-[14px] leading-relaxed text-slate-500">
                Confira antes de enviar. Depois do envio nao da para alterar.
              </p>
            </div>

            <div className="cartao space-y-1.5 text-[14px]">
              <Linha rotulo="Nome" valor={identificacao.nomeCompleto} />
              <Linha rotulo="E-mail" valor={identificacao.email} />
              <Linha rotulo="Telefone" valor={identificacao.telefone} />
              <Linha rotulo="Cidade" valor={identificacao.cidade} />
              <Linha rotulo="Vaga" valor={vaga.titulo} />
            </div>

            <div className="cartao space-y-3">
              <label className="flex cursor-pointer gap-3">
                <input type="checkbox" checked={consentimento} onChange={(e) => setConsentimento(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-marinho-800" />
                <span className="text-[13px] leading-relaxed text-slate-700">
                  Autorizo o uso dos meus dados neste processo seletivo. Eles ficam guardados
                  por 6 meses e posso pedir a exclusao a qualquer momento pelo e-mail de contato.
                </span>
              </label>

              <label className="flex cursor-pointer gap-3 border-t border-slate-100 pt-3">
                <input type="checkbox" checked={bancoTalentos} onChange={(e) => setBancoTalentos(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-marinho-800" />
                <span className="text-[13px] leading-relaxed text-slate-700">
                  Quero ser avisada sobre vagas futuras. Nesse caso meus dados ficam por 24 meses.
                </span>
              </label>
            </div>

            {erro && <Aviso tipo="erro">{erro}</Aviso>}

            <button onClick={enviar} disabled={enviando || !consentimento} className="btn-primario w-full">
              {enviando ? 'Enviando...' : 'Enviar candidatura'}
            </button>
          </div>
        )}
      </div>
    </main>
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

function PerguntaAtual({ pergunta, valorObjetiva, valorDiscursiva, aoEscolher, aoEscrever, aoAvancar, erro, setErro }) {
  const ehDiscursiva = pergunta.tipo === 'discursiva';

  return (
    <div className="space-y-4">
      <h2 className="text-[18px] font-medium leading-snug text-slate-900">{pergunta.enunciado}</h2>

      {!ehDiscursiva && (
        <div className="space-y-2.5">
          {pergunta.opcoes.map((opcao) => {
            const escolhida = valorObjetiva === opcao.id;
            return (
              <button
                key={opcao.id}
                onClick={() => aoEscolher(opcao.id)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-[15px] leading-snug transition active:scale-[.99] ${
                  escolhida
                    ? 'border-marinho-600 bg-marinho-50 text-marinho-900 ring-2 ring-marinho-100'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-marinho-200'
                }`}
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${escolhida ? 'border-marinho-600 bg-marinho-600' : 'border-slate-300'}`}>
                  {escolhida && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                {opcao.texto}
              </button>
            );
          })}
        </div>
      )}

      {ehDiscursiva && (
        <>
          <textarea
            className="campo min-h-[190px] resize-none leading-relaxed"
            placeholder="Escreva sua resposta"
            value={valorDiscursiva}
            onChange={(e) => { setErro(null); aoEscrever(e.target.value); }}
          />
          <p className="text-right text-[12px] text-slate-400">{valorDiscursiva.trim().length} caracteres</p>

          {erro && <Aviso tipo="erro">{erro}</Aviso>}

          <button
            onClick={() => {
              if (valorDiscursiva.trim().length < 40) {
                setErro('Escreva um pouco mais para eu conseguir avaliar');
                return;
              }
              aoAvancar();
            }}
            className="btn-primario w-full"
          >
            Continuar
          </button>
        </>
      )}
    </div>
  );
}
