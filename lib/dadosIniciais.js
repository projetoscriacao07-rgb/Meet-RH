// Carregado uma unica vez pelo botao "carregar dados iniciais" no painel.

export const VAGA_INICIAL = {
  titulo: 'Secretaria Pessoal',
  slug: 'secretaria-pessoal',
  cidade: 'Sao Paulo',
  regiao: '',
  resumo:
    'Suporte integral a rotina executiva e pessoal da diretoria: agenda, viagens, ' +
    'documentos, apoio residencial e conducao de veiculo. Exige organizacao, discricao e ingles.',
  escopo: `Objetivo do cargo
Atuar no suporte integral a rotina executiva e pessoal da diretoria, garantindo organizacao, agilidade, discricao e excelencia na conducao das demandas profissionais, administrativas e particulares.

Suporte executivo e administrativo
Gerenciar agenda pessoal e profissional da diretoria; organizar reunioes, compromissos e eventos; controlar viagens nacionais e internacionais, reservas, hospedagens e deslocamentos; elaborar e acompanhar e-mails, documentos e apresentacoes; fazer interface com fornecedores, clientes, parceiros e prestadores; organizar documentos fisicos e digitais com confidencialidade; auxiliar em demandas administrativas e financeiras pessoais e corporativas; comunicar-se em ingles com parceiros internacionais; acompanhar pagamentos, contratos e vencimentos.

Suporte pessoal e residencial
Auxiliar na organizacao da rotina pessoal do executivo; apoiar na organizacao e supervisao da residencia; realizar compras pessoais, domesticas e corporativas; controlar estoque de itens da residencia e escritorio; acompanhar prestadores de servicos residenciais; organizar manutencao de veiculos, residencia e equipamentos; auxiliar no planejamento de viagens pessoais e familiares; apoiar na organizacao de eventos pessoais e recepcao de convidados; realizar pagamentos, retiradas e entregas; garantir organizacao de documentos pessoais e familiares.

Deslocamentos e apoio externo
Conduzir veiculo para compromissos executivos e pessoais; apoiar em deslocamentos para aeroportos, reunioes e eventos; realizar servicos externos em bancos, cartorios e compras; garantir organizacao dos veiculos utilizados pela diretoria.`,
  requisitos: [
    'Ensino superior cursando ou completo em Administracao, Secretariado Executivo, Relacoes Internacionais ou areas correlatas',
    'Experiencia anterior como secretaria executiva, assistente executiva ou secretaria pessoal',
    'Ingles intermediario ou avancado para comunicacao escrita e verbal',
    'Habilitacao categoria B valida',
    'Pratica e seguranca na direcao',
    'Disponibilidade para deslocamentos',
    'Excelente organizacao e gestao de prioridades',
    'Boa comunicacao verbal e escrita',
    'Discricao, postura profissional e confidencialidade',
    'Dominio do Pacote Office e Excel',
    'Vivencia em suporte pessoal e residencial',
    'Experiencia com executivos ou familias de alta demanda',
  ],
  pesos: { requisitos: 50, respostas: 50 },
};

export const PERGUNTAS_INICIAIS = [
  // -------- eliminatorias --------
  { ordem: 1, tipo: 'eliminatoria', enunciado: 'Voce tem CNH categoria B valida e ativa?',
    motivoCorte: 'Nao possui CNH categoria B valida',
    opcoes: [
      { id: 'o1', texto: 'Sim', pontos: 0, elimina: false },
      { id: 'o2', texto: 'Nao', pontos: 0, elimina: true }] },

  { ordem: 2, tipo: 'eliminatoria', enunciado: 'Ha quanto tempo voce dirige com regularidade?',
    motivoCorte: 'Nao dirige com regularidade',
    opcoes: [
      { id: 'o1', texto: 'Nao dirijo', pontos: 0, elimina: true },
      { id: 'o2', texto: 'Menos de 1 ano', pontos: 0, elimina: false },
      { id: 'o3', texto: 'De 1 a 3 anos', pontos: 0, elimina: false },
      { id: 'o4', texto: 'Mais de 3 anos', pontos: 0, elimina: false }] },

  { ordem: 3, tipo: 'eliminatoria', enunciado: 'Voce tem formacao superior em Administracao, Secretariado, Relacoes Internacionais ou area correlata?',
    motivoCorte: 'Sem formacao superior nas areas exigidas',
    opcoes: [
      { id: 'o1', texto: 'Nao tenho', pontos: 0, elimina: true },
      { id: 'o2', texto: 'Cursando', pontos: 0, elimina: false },
      { id: 'o3', texto: 'Completa', pontos: 0, elimina: false }] },

  { ordem: 4, tipo: 'eliminatoria', enunciado: 'A vaga inclui apoio a rotina pessoal e residencial do executivo, como compras, prestadores e organizacao da casa. Voce:',
    motivoCorte: 'Prefere atuar somente no escopo corporativo',
    opcoes: [
      { id: 'o1', texto: 'Ja fiz e me sinto a vontade', pontos: 0, elimina: false },
      { id: 'o2', texto: 'Nunca fiz, mas topo', pontos: 0, elimina: false },
      { id: 'o3', texto: 'Prefiro atuar so no corporativo', pontos: 0, elimina: true }] },

  { ordem: 5, tipo: 'eliminatoria', enunciado: 'Qual sua disponibilidade para deslocamentos e demandas fora do horario comercial?',
    motivoCorte: 'Sem disponibilidade para deslocamentos',
    opcoes: [
      { id: 'o1', texto: 'Total', pontos: 0, elimina: false },
      { id: 'o2', texto: 'Com alguma limitacao', pontos: 0, elimina: false },
      { id: 'o3', texto: 'Nao tenho disponibilidade', pontos: 0, elimina: true }] },

  // -------- classificatorias --------
  { ordem: 6, tipo: 'multipla', peso: 2, enunciado: 'Seu ingles para escrever e falar com fornecedores internacionais e:',
    opcoes: [
      { id: 'o1', texto: 'Basico', pontos: 0, elimina: false },
      { id: 'o2', texto: 'Intermediario', pontos: 6, elimina: false },
      { id: 'o3', texto: 'Avancado', pontos: 9, elimina: false },
      { id: 'o4', texto: 'Fluente', pontos: 10, elimina: false }] },

  { ordem: 7, tipo: 'multipla', peso: 3, enunciado: 'Sua experiencia como secretaria executiva, assistente executiva ou secretaria pessoal:',
    opcoes: [
      { id: 'o1', texto: 'Nenhuma', pontos: 0, elimina: false },
      { id: 'o2', texto: 'Ate 2 anos', pontos: 5, elimina: false },
      { id: 'o3', texto: 'De 2 a 5 anos', pontos: 8, elimina: false },
      { id: 'o4', texto: 'Mais de 5 anos', pontos: 10, elimina: false }] },

  { ordem: 8, tipo: 'multipla', peso: 1, enunciado: 'Seu nivel de Excel:',
    opcoes: [
      { id: 'o1', texto: 'Basico', pontos: 3, elimina: false },
      { id: 'o2', texto: 'Intermediario', pontos: 7, elimina: false },
      { id: 'o3', texto: 'Avancado', pontos: 10, elimina: false }] },

  { ordem: 9, tipo: 'multipla', peso: 2, enunciado: 'Ja organizou viagem internacional completa, com passagem, hospedagem, roteiro e documentacao?',
    opcoes: [
      { id: 'o1', texto: 'Nunca', pontos: 0, elimina: false },
      { id: 'o2', texto: 'Uma ou duas vezes', pontos: 6, elimina: false },
      { id: 'o3', texto: 'Faz parte da minha rotina', pontos: 10, elimina: false }] },

  { ordem: 10, tipo: 'multipla', peso: 2, enunciado: 'Ja trabalhou apoiando executivo ou familia de alta demanda?',
    opcoes: [
      { id: 'o1', texto: 'Nao', pontos: 0, elimina: false },
      { id: 'o2', texto: 'Sim, executivo', pontos: 7, elimina: false },
      { id: 'o3', texto: 'Sim, executivo e familia', pontos: 10, elimina: false }] },

  { ordem: 11, tipo: 'multipla', peso: 1, enunciado: 'Sua disponibilidade de inicio:',
    opcoes: [
      { id: 'o1', texto: 'Imediata', pontos: 10, elimina: false },
      { id: 'o2', texto: 'Em 15 dias', pontos: 8, elimina: false },
      { id: 'o3', texto: 'Em 30 dias', pontos: 6, elimina: false },
      { id: 'o4', texto: 'Mais de 30 dias', pontos: 3, elimina: false }] },

  // -------- discursivas --------
  { ordem: 12, tipo: 'discursiva', peso: 3,
    enunciado: 'Um familiar do executivo te liga pedindo detalhes da agenda dele, que ele pediu para nao divulgar. Como voce conduz essa conversa?',
    criterioAvaliacao: 'Nao entrega a informacao, mas conduz com educacao e sem criar constrangimento. Devolve a decisao ao executivo antes de agir. Demonstra que entende confidencialidade como regra, nao como julgamento de quem esta pedindo.',
    alertas: 'Entregar a informacao por ser da familia. Ser ríspida ou acusatoria. Inventar desculpa em vez de redirecionar. Nao mencionar em nenhum momento confirmar com o executivo.' },

  { ordem: 13, tipo: 'discursiva', peso: 3,
    enunciado: 'Sao 15h. O executivo pede uma remarcacao urgente de voo, um fornecedor cobra assinatura de contrato que vence hoje e o prestador acabou de chegar na residencia. Como voce organiza?',
    criterioAvaliacao: 'Separa prazo fatal de urgencia aparente. Comunica antes de sumir resolvendo. Delega ou reagenda o que da. Mostra criterio explicito de priorizacao, nao so uma lista de acoes.',
    alertas: 'Diz que faz tudo ao mesmo tempo. Lista acoes sem criterio. Nao comunica ninguem. Deixa o contrato vencer por ir atras do que e mais visivel.' },

  { ordem: 14, tipo: 'discursiva', peso: 2,
    enunciado: 'O executivo esta em um voo de 10 horas e surge uma decisao que nao pode esperar. Como voce age?',
    criterioAvaliacao: 'Mostra onde esta a linha entre resolver sozinha e passar por cima. Age dentro de alcada, registra o que fez e reporta na primeira oportunidade. Considera o custo de errar antes de decidir.',
    alertas: 'Paralisa e espera sem fazer nada. Decide tudo sem registrar nem reportar. Nao demonstra nocao de limite de alcada.' },

  { ordem: 15, tipo: 'discursiva', peso: 2,
    enunciado: 'Conte uma situacao de trabalho em que voce errou e como resolveu.',
    criterioAvaliacao: 'Assume o erro sem rodeio, descreve o impacto real e o que fez para corrigir. Melhor ainda se mostra o que mudou na rotina depois.',
    alertas: 'Diz que nunca errou. Transfere a culpa para terceiros. Escolhe um erro trivial de proposito para nao se expor.' },

  { ordem: 16, tipo: 'discursiva', peso: 2,
    enunciado: 'Escreva em ingles um e-mail curto remarcando uma reuniao com um fornecedor internacional.',
    criterioAvaliacao: 'Ingles compreensivel e adequado ao contexto profissional. Tem saudacao, motivo, proposta de nova data e fechamento. Erro pequeno de gramatica nao derruba a nota se a comunicacao funciona.',
    alertas: 'Responde em portugues. Texto curto demais para avaliar. Erros que comprometem o entendimento. Sinais claros de traducao automatica sem revisao.' },
];
