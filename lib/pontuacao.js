// Ranking = requisitos (multipla escolha) + respostas discursivas (IA).
// O perfil comportamental NAO entra na conta.

export const PESOS_PADRAO = { requisitos: 50, respostas: 50 };

export function apurarObjetivas(respostas, perguntas) {
  let obtidos = 0;
  let maximos = 0;
  let eliminada = false;
  let motivoEliminacao = null;

  for (const p of perguntas) {
    if (p.tipo === 'discursiva') continue;

    const escolhaId = respostas?.[p.id];
    const opcao = (p.opcoes || []).find((o) => o.id === escolhaId);

    if (p.tipo === 'eliminatoria') {
      if (opcao?.elimina && !eliminada) {
        eliminada = true;
        motivoEliminacao = p.motivoCorte || p.enunciado;
      }
      continue;
    }

    const peso = p.peso || 1;
    const teto = Math.max(...(p.opcoes || []).map((o) => o.pontos || 0), 0);
    maximos += teto * peso;
    if (opcao) obtidos += (opcao.pontos || 0) * peso;
  }

  const nota = maximos > 0 ? Math.round((obtidos / maximos) * 100) : 0;
  return { nota, eliminada, motivoEliminacao };
}

export function calcularNotaFinal({ requisitos, respostas }, pesos = PESOS_PADRAO) {
  const p = { ...pesos };

  if (respostas === null || respostas === undefined) {
    p.requisitos += p.respostas;
    p.respostas = 0;
  }

  const total = p.requisitos + p.respostas;
  if (total === 0) return 0;

  const soma = requisitos * p.requisitos + (respostas ?? 0) * p.respostas;
  return Math.round(soma / total);
}

export function faixaDaNota(nota) {
  if (nota === null || nota === undefined) return { rotulo: 'Sem nota', cor: 'cinza' };
  if (nota >= 80) return { rotulo: 'Forte', cor: 'verde' };
  if (nota >= 60) return { rotulo: 'Media', cor: 'ambar' };
  return { rotulo: 'Fraca', cor: 'vermelho' };
}

// Remove marcadores de identidade antes de mandar pra IA.
// A avaliacao das discursivas e cega de proposito.
export function anonimizar(texto, nome) {
  if (!texto) return '';

  // E-mail e telefone saem primeiro: se o nome fosse trocado antes,
  // "ana@x.com" viraria "[nome]@x.com" e escaparia do filtro de e-mail.
  let limpo = texto
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[email]')
    .replace(/\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/g, '[telefone]');

  const partes = (nome || '')
    .split(/\s+/)
    .filter((n) => n.length > 2)
    .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  for (const parte of partes) {
    limpo = limpo.replace(new RegExp(`\\b${parte}\\b`, 'gi'), '[nome]');
  }

  return limpo.replace(/(\[nome\]\s*){2,}/g, '[nome] ');
}
