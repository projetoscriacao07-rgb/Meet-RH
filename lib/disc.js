// Instrumento comportamental. NAO pontua no ranking.
// A candidata nunca ve a sigla nem o campo `fator`.

export const BLOCOS_DISC = [
  { id: 'b01', ordem: 1, alternativas: [
    { id: 'a', texto: 'Gosto de conversar e me entroso rapido', fator: 'I' },
    { id: 'b', texto: 'Confiro tudo antes de entregar', fator: 'C' },
    { id: 'c', texto: 'Gosto de resolver e decidir rapido', fator: 'D' },
    { id: 'd', texto: 'Prefiro seguir o passo a passo com calma', fator: 'S' }]},
  { id: 'b02', ordem: 2, alternativas: [
    { id: 'a', texto: 'Percebo o detalhe que passou batido', fator: 'C' },
    { id: 'b', texto: 'Encaro desafio de frente', fator: 'D' },
    { id: 'c', texto: 'Sou a pessoa com quem os outros desabafam', fator: 'S' },
    { id: 'd', texto: 'Animo o grupo quando o clima pesa', fator: 'I' }]},
  { id: 'b03', ordem: 3, alternativas: [
    { id: 'a', texto: 'Evito discussao sempre que da', fator: 'S' },
    { id: 'b', texto: 'Vou direto ao ponto', fator: 'D' },
    { id: 'c', texto: 'Gosto de trabalhar com regra clara', fator: 'C' },
    { id: 'd', texto: 'Gosto de conhecer gente nova', fator: 'I' }]},
  { id: 'b04', ordem: 4, alternativas: [
    { id: 'a', texto: 'So me sinto segura depois de conferir', fator: 'C' },
    { id: 'b', texto: 'Convenco as pessoas conversando', fator: 'I' },
    { id: 'c', texto: 'Assumo o comando quando ninguem assume', fator: 'D' },
    { id: 'd', texto: 'Prefiro ambiente previsivel', fator: 'S' }]},
  { id: 'b05', ordem: 5, alternativas: [
    { id: 'a', texto: 'Tenho paciencia pra ouvir', fator: 'S' },
    { id: 'b', texto: 'Organizo tudo antes de comecar', fator: 'C' },
    { id: 'c', texto: 'Fico impaciente com processo lento', fator: 'D' },
    { id: 'd', texto: 'Sou otimista mesmo em dia ruim', fator: 'I' }]},
  { id: 'b06', ordem: 6, alternativas: [
    { id: 'a', texto: 'Gosto de ser reconhecida pelo que faco', fator: 'I' },
    { id: 'b', texto: 'Prefiro qualidade a velocidade', fator: 'C' },
    { id: 'c', texto: 'Prefiro ajudar a ser o centro das atencoes', fator: 'S' },
    { id: 'd', texto: 'Gosto de assumir responsabilidade', fator: 'D' }]},
  { id: 'b07', ordem: 7, alternativas: [
    { id: 'a', texto: 'Sigo o procedimento a risca', fator: 'C' },
    { id: 'b', texto: 'Tomo decisao sem ficar remoendo', fator: 'D' },
    { id: 'c', texto: 'Falo com facilidade com qualquer pessoa', fator: 'I' },
    { id: 'd', texto: 'Sou constante, o dia a dia nao me cansa', fator: 'S' }]},
  { id: 'b08', ordem: 8, alternativas: [
    { id: 'a', texto: 'Cumpro o que combino, sem alarde', fator: 'S' },
    { id: 'b', texto: 'Costumo puxar assunto', fator: 'I' },
    { id: 'c', texto: 'Anoto tudo pra nao esquecer', fator: 'C' },
    { id: 'd', texto: 'Nao tenho medo de dizer nao', fator: 'D' }]},
  { id: 'b09', ordem: 9, alternativas: [
    { id: 'a', texto: 'Reviso antes de mandar', fator: 'C' },
    { id: 'b', texto: 'Me adapto ao ritmo dos outros', fator: 'S' },
    { id: 'c', texto: 'Gosto de resultado que da pra ver', fator: 'D' },
    { id: 'd', texto: 'Gosto de equipe animada', fator: 'I' }]},
  { id: 'b10', ordem: 10, alternativas: [
    { id: 'a', texto: 'Uso o bom humor pra resolver', fator: 'I' },
    { id: 'b', texto: 'Nao gosto de mudanca de ultima hora', fator: 'S' },
    { id: 'c', texto: 'Prefiro instrucao por escrito', fator: 'C' },
    { id: 'd', texto: 'Assumo risco quando precisa', fator: 'D' }]},
  { id: 'b11', ordem: 11, alternativas: [
    { id: 'a', texto: 'Me incomoda trabalho malfeito', fator: 'C' },
    { id: 'b', texto: 'Faco amizade rapido no trabalho', fator: 'I' },
    { id: 'c', texto: 'Prefiro rotina estavel', fator: 'S' },
    { id: 'd', texto: 'Cobro quando algo atrasa', fator: 'D' }]},
  { id: 'b12', ordem: 12, alternativas: [
    { id: 'a', texto: 'Escuto antes de opinar', fator: 'S' },
    { id: 'b', texto: 'Gosto de conferir numero e data', fator: 'C' },
    { id: 'c', texto: 'Gosto de apresentar ideia pro grupo', fator: 'I' },
    { id: 'd', texto: 'Tomo a frente em situacao dificil', fator: 'D' }]},
  { id: 'b13', ordem: 13, alternativas: [
    { id: 'a', texto: 'Sou detalhista', fator: 'C' },
    { id: 'b', texto: 'Trabalho bem sob pressao', fator: 'D' },
    { id: 'c', texto: 'Sou discreta', fator: 'S' },
    { id: 'd', texto: 'Sou espontanea', fator: 'I' }]},
  { id: 'b14', ordem: 14, alternativas: [
    { id: 'a', texto: 'Prefiro apoiar a liderar', fator: 'S' },
    { id: 'b', texto: 'Gosto de autonomia pra decidir', fator: 'D' },
    { id: 'c', texto: 'Prefiro fazer certo a fazer rapido', fator: 'C' },
    { id: 'd', texto: 'Gosto de circular e falar com todo mundo', fator: 'I' }]},
  { id: 'b15', ordem: 15, alternativas: [
    { id: 'a', texto: 'Costumo animar quem esta desanimado', fator: 'I' },
    { id: 'b', texto: 'Sigo checklist', fator: 'C' },
    { id: 'c', texto: 'Digo o que penso', fator: 'D' },
    { id: 'd', texto: 'Nao gosto de conflito', fator: 'S' }]},
  { id: 'b16', ordem: 16, alternativas: [
    { id: 'a', texto: 'Sou leal a quem trabalho', fator: 'S' },
    { id: 'b', texto: 'Sou expansiva', fator: 'I' },
    { id: 'c', texto: 'Sou metodica', fator: 'C' },
    { id: 'd', texto: 'Encaro problema como desafio', fator: 'D' }]},
  { id: 'b17', ordem: 17, alternativas: [
    { id: 'a', texto: 'Gosto de ordem', fator: 'C' },
    { id: 'b', texto: 'Gosto de estabilidade', fator: 'S' },
    { id: 'c', texto: 'Gosto de gente', fator: 'I' },
    { id: 'd', texto: 'Gosto de andar rapido', fator: 'D' }]},
  { id: 'b18', ordem: 18, alternativas: [
    { id: 'a', texto: 'Verifico duas vezes quando e importante', fator: 'C' },
    { id: 'b', texto: 'Termino o que comeco, sem pressa', fator: 'S' },
    { id: 'c', texto: 'Assumo o erro e sigo em frente', fator: 'D' },
    { id: 'd', texto: 'Convenco mais falando do que insistindo', fator: 'I' }]},
  { id: 'b19', ordem: 19, alternativas: [
    { id: 'a', texto: 'Prefiro combinar antes de mudar', fator: 'S' },
    { id: 'b', texto: 'Prefiro documentar tudo', fator: 'C' },
    { id: 'c', texto: 'Prefiro decidir a esperar orientacao', fator: 'D' },
    { id: 'd', texto: 'Prefiro ligar a mandar mensagem', fator: 'I' }]},
  { id: 'b20', ordem: 20, alternativas: [
    { id: 'a', texto: 'Sou criteriosa', fator: 'C' },
    { id: 'b', texto: 'Sou paciente', fator: 'S' },
    { id: 'c', texto: 'Sou comunicativa', fator: 'I' },
    { id: 'd', texto: 'Sou direta', fator: 'D' }]},
];

export const ROTULOS_DISC = {
  D: { nome: 'Dominancia', resumo: 'Decide rapido, gosta de autonomia e resultado', cor: '#C0392B' },
  I: { nome: 'Influencia', resumo: 'Comunicativa, sociavel, boa em relacionamento', cor: '#C98500' },
  S: { nome: 'Estabilidade', resumo: 'Constante, leal, paciente, evita conflito', cor: '#1B8A62' },
  C: { nome: 'Conformidade', resumo: 'Metodica, detalhista, segue regra e confere', cor: '#2A78D6' },
};

export function apurarDisc(respostas) {
  const bruto = { D: 0, I: 0, S: 0, C: 0 };
  let respondidos = 0;

  for (const bloco of BLOCOS_DISC) {
    const escolhaId = respostas?.[bloco.id];
    if (!escolhaId) continue;
    const alt = bloco.alternativas.find((a) => a.id === escolhaId);
    if (alt) { bruto[alt.fator] += 1; respondidos += 1; }
  }

  if (respondidos === 0) return null;

  const percentual = {
    D: Math.round((bruto.D / respondidos) * 100),
    I: Math.round((bruto.I / respondidos) * 100),
    S: Math.round((bruto.S / respondidos) * 100),
    C: Math.round((bruto.C / respondidos) * 100),
  };

  const ordem = ['D', 'I', 'S', 'C'].sort((a, b) => percentual[b] - percentual[a]);

  return {
    bruto,
    percentual,
    primario: ordem[0],
    secundario: ordem[1],
    respondidos,
    completo: respondidos === BLOCOS_DISC.length,
  };
}
