export function slugificar(texto) {
  return (texto || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatarData(valor) {
  if (!valor) return '-';
  const d = valor.toDate ? valor.toDate() : new Date(valor);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function paraISO(valor) {
  if (!valor) return '';
  const d = valor.toDate ? valor.toDate() : new Date(valor);
  return d.toISOString().slice(0, 10);
}

export function diasRestantes(dataFim) {
  if (!dataFim) return null;
  const fim = dataFim.toDate ? dataFim.toDate() : new Date(dataFim);
  const dias = Math.ceil((fim - new Date()) / 86400000);
  return dias;
}

export function iniciais(nome) {
  const partes = (nome || '').trim().split(/\s+/);
  if (!partes[0]) return '?';
  return ((partes[0][0] || '') + (partes[partes.length - 1][0] || '')).toUpperCase();
}
