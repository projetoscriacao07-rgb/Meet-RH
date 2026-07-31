'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdmin } from '@/components/useAdmin';
import { Cabecalho, Carregando, Aviso, Badge, ErroAcesso } from '@/components/Ui';
import { slugificar } from '@/lib/utils';
import { PESOS_PADRAO } from '@/lib/pontuacao';

const MODELOS = {
  eliminatoria: { tipo: 'eliminatoria', enunciado: '', motivoCorte: '', peso: 1,
    opcoes: [{ id: 'o1', texto: 'Sim', pontos: 0, elimina: false }, { id: 'o2', texto: 'Nao', pontos: 0, elimina: true }] },
  multipla: { tipo: 'multipla', enunciado: '', peso: 1,
    opcoes: [{ id: 'o1', texto: '', pontos: 0, elimina: false }, { id: 'o2', texto: '', pontos: 5, elimina: false }, { id: 'o3', texto: '', pontos: 10, elimina: false }] },
  discursiva: { tipo: 'discursiva', enunciado: '', peso: 2, criterioAvaliacao: '', alertas: '' },
};

export default function NovaVaga() {
  const router = useRouter();
  const { usuario, erro: erroAcesso } = useAdmin();

  const [vaga, setVaga] = useState({
    titulo: '', cidade: '', regiao: '', resumo: '', escopo: '',
    requisitos: '', dataFim: '',
  });
  const [perguntas, setPerguntas] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  if (erroAcesso) return <ErroAcesso mensagem={erroAcesso} />;

  if (usuario === undefined) return <Carregando />;

  function adicionar(tipo) {
    setPerguntas([...perguntas, { ...structuredClone(MODELOS[tipo]), chave: crypto.randomUUID() }]);
  }

  function atualizar(i, campo, valor) {
    const copia = [...perguntas];
    copia[i] = { ...copia[i], [campo]: valor };
    setPerguntas(copia);
  }

  function atualizarOpcao(i, j, campo, valor) {
    const copia = [...perguntas];
    const opcoes = [...copia[i].opcoes];
    opcoes[j] = { ...opcoes[j], [campo]: valor };
    copia[i] = { ...copia[i], opcoes };
    setPerguntas(copia);
  }

  function adicionarOpcao(i) {
    const copia = [...perguntas];
    const opcoes = [...copia[i].opcoes];
    opcoes.push({ id: `o${opcoes.length + 1}`, texto: '', pontos: 0, elimina: false });
    copia[i] = { ...copia[i], opcoes };
    setPerguntas(copia);
  }

  function remover(i) {
    setPerguntas(perguntas.filter((_, k) => k !== i));
  }

  async function salvar() {
    if (!vaga.titulo.trim()) { setErro('Informe o titulo da vaga'); return; }
    if (!vaga.dataFim) { setErro('Informe a data de encerramento'); return; }
    if (perguntas.length === 0) { setErro('Adicione pelo menos uma pergunta'); return; }
    if (perguntas.some((p) => !p.enunciado.trim())) { setErro('Ha pergunta sem enunciado'); return; }

    setSalvando(true);
    setErro(null);

    let slug = slugificar(vaga.titulo);
    const existe = await getDocs(query(collection(db, 'vagas'), where('slug', '==', slug)));
    if (!existe.empty) slug = `${slug}-${Date.now().toString().slice(-4)}`;

    const ref = await addDoc(collection(db, 'vagas'), {
      titulo: vaga.titulo.trim(),
      slug,
      cidade: vaga.cidade.trim(),
      regiao: vaga.regiao.trim(),
      resumo: vaga.resumo.trim(),
      escopo: vaga.escopo.trim(),
      requisitos: vaga.requisitos.split('\n').map((r) => r.trim()).filter(Boolean),
      status: 'aberta',
      dataInicio: new Date(),
      dataFim: new Date(`${vaga.dataFim}T23:59:59`),
      encerradaEm: null,
      pesos: PESOS_PADRAO,
      totalInscricoes: 0,
      totalEliminadas: 0,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });

    const lote = writeBatch(db);
    perguntas.forEach((p, i) => {
      const { chave, ...resto } = p;
      lote.set(doc(collection(db, 'vagas', ref.id, 'perguntas')), { ...resto, ordem: i + 1 });
    });
    await lote.commit();

    router.push(`/admin/vaga/${ref.id}`);
  }

  return (
    <main className="pb-24">
      <Cabecalho titulo="Nova vaga" voltarPara="/admin" />

      <div className="space-y-3 px-4 pt-4">
        <div className="cartao space-y-4">
          <div>
            <label className="rotulo">Titulo</label>
            <input className="campo" value={vaga.titulo}
              onChange={(e) => setVaga({ ...vaga, titulo: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="rotulo">Cidade</label>
              <input className="campo" value={vaga.cidade}
                onChange={(e) => setVaga({ ...vaga, cidade: e.target.value })} />
            </div>
            <div>
              <label className="rotulo">Regiao</label>
              <input className="campo" value={vaga.regiao}
                onChange={(e) => setVaga({ ...vaga, regiao: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="rotulo">Resumo (aparece no card)</label>
            <textarea className="campo min-h-[80px] resize-none" value={vaga.resumo}
              onChange={(e) => setVaga({ ...vaga, resumo: e.target.value })} />
          </div>

          <div>
            <label className="rotulo">Escopo completo</label>
            <textarea className="campo min-h-[160px] resize-none" value={vaga.escopo}
              onChange={(e) => setVaga({ ...vaga, escopo: e.target.value })} />
          </div>

          <div>
            <label className="rotulo">Requisitos (um por linha)</label>
            <textarea className="campo min-h-[110px] resize-none" value={vaga.requisitos}
              onChange={(e) => setVaga({ ...vaga, requisitos: e.target.value })} />
          </div>

          <div>
            <label className="rotulo">Encerra em</label>
            <input type="date" className="campo" value={vaga.dataFim}
              onChange={(e) => setVaga({ ...vaga, dataFim: e.target.value })} />
          </div>
        </div>

        <div className="pt-2">
          <p className="mb-2 px-1 text-[15px] font-medium text-slate-900">
            Perguntas <span className="font-normal text-slate-400">({perguntas.length})</span>
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => adicionar('eliminatoria')} className="btn-secundario px-2 text-[13px]">Corte</button>
            <button onClick={() => adicionar('multipla')} className="btn-secundario px-2 text-[13px]">Escolha</button>
            <button onClick={() => adicionar('discursiva')} className="btn-secundario px-2 text-[13px]">Aberta</button>
          </div>
        </div>

        {perguntas.map((p, i) => (
          <div key={p.chave} className="cartao space-y-3">
            <div className="flex items-center justify-between">
              <Badge cor={p.tipo === 'eliminatoria' ? 'vermelho' : p.tipo === 'discursiva' ? 'azul' : 'cinza'}>
                {p.tipo === 'eliminatoria' ? 'Eliminatoria' : p.tipo === 'discursiva' ? 'Discursiva' : 'Multipla escolha'}
              </Badge>
              <button onClick={() => remover(i)} className="text-[13px] text-rose-600">Remover</button>
            </div>

            <textarea className="campo min-h-[70px] resize-none" placeholder="Enunciado da pergunta"
              value={p.enunciado} onChange={(e) => atualizar(i, 'enunciado', e.target.value)} />

            {p.tipo !== 'discursiva' && (
              <div className="space-y-2">
                {p.opcoes.map((o, j) => (
                  <div key={o.id} className="flex items-center gap-2">
                    <input className="campo flex-1 py-2 text-[14px]" placeholder={`Opcao ${j + 1}`}
                      value={o.texto} onChange={(e) => atualizarOpcao(i, j, 'texto', e.target.value)} />
                    {p.tipo === 'eliminatoria' ? (
                      <button onClick={() => atualizarOpcao(i, j, 'elimina', !o.elimina)}
                        className={`shrink-0 rounded-lg px-2.5 py-2 text-[12px] font-medium ${
                          o.elimina ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
                        {o.elimina ? 'corta' : 'passa'}
                      </button>
                    ) : (
                      <input type="number" min="0" max="10" className="campo w-16 shrink-0 px-2 py-2 text-center text-[14px]"
                        value={o.pontos} onChange={(e) => atualizarOpcao(i, j, 'pontos', Number(e.target.value))} />
                    )}
                  </div>
                ))}
                <button onClick={() => adicionarOpcao(i)} className="text-[13px] text-marinho-600">+ opcao</button>
              </div>
            )}

            {p.tipo === 'eliminatoria' && (
              <input className="campo py-2 text-[14px]" placeholder="Motivo do corte (aparece no painel)"
                value={p.motivoCorte} onChange={(e) => atualizar(i, 'motivoCorte', e.target.value)} />
            )}

            {p.tipo === 'discursiva' && (
              <>
                <textarea className="campo min-h-[70px] resize-none text-[14px]"
                  placeholder="O que caracteriza uma boa resposta (a IA usa isso)"
                  value={p.criterioAvaliacao} onChange={(e) => atualizar(i, 'criterioAvaliacao', e.target.value)} />
                <textarea className="campo min-h-[70px] resize-none text-[14px]"
                  placeholder="Sinais de alerta (a IA usa isso)"
                  value={p.alertas} onChange={(e) => atualizar(i, 'alertas', e.target.value)} />
              </>
            )}

            {p.tipo !== 'eliminatoria' && (
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-slate-500">Peso no ranking</span>
                <input type="number" min="1" max="5" className="campo w-16 px-2 py-2 text-center text-[14px]"
                  value={p.peso} onChange={(e) => atualizar(i, 'peso', Number(e.target.value))} />
              </div>
            )}
          </div>
        ))}

        {erro && <Aviso tipo="erro">{erro}</Aviso>}

        <button onClick={salvar} disabled={salvando} className="btn-primario w-full">
          {salvando ? 'Salvando...' : 'Publicar vaga'}
        </button>
      </div>
    </main>
  );
}
