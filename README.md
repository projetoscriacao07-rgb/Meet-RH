# Meet RH — passo a passo

Next.js + Firebase + Vercel. Do zero ao ar em cerca de 40 minutos.

Faça na ordem. Cada passo depende do anterior.

---

## Passo 1 — Criar o repositório no GitHub

1. Entre no GitHub e clique em **New repository**
2. Nome: `meet-rh`
3. Marque **Private**
4. Clique em **Create repository**
5. Na tela seguinte, clique em **uploading an existing file**
6. Descompacte o zip no seu aparelho e arraste **todas as pastas e arquivos** de dentro de `meet-rh`
7. Escreva "primeira versão" e clique em **Commit changes**

Importante: o que vai para a raiz do repositório é o **conteúdo** da pasta `meet-rh`, não a pasta em si. Se der certo, você vê `app`, `lib`, `components` e `package.json` soltos na raiz.

---

## Passo 2 — Criar o projeto no Firebase

1. Vá em console.firebase.google.com e clique em **Adicionar projeto**
2. Nome: `meet-rh`. Pode desativar o Google Analytics
3. Quando abrir o projeto, clique no ícone **</>** (Web) para criar um app
4. Apelido: `meet-rh`. **Não** marque hospedagem
5. Aparece um bloco de código com `apiKey`, `authDomain` etc. **Deixe essa aba aberta**, você vai copiar esses valores no passo 5

---

## Passo 3 — Ligar Authentication e Firestore

**Authentication**
1. Menu lateral → **Authentication** → **Vamos começar**
2. Aba **Sign-in method** → clique em **E-mail/senha** → ative → **Salvar**
3. Aba **Users** → **Adicionar usuário**
4. Coloque seu e-mail e uma senha. **Anote a senha**
5. Depois de criar, copie o **UID** que aparece na linha do usuário. Você vai precisar dele no passo 4

**Firestore**
1. Menu lateral → **Firestore Database** → **Criar banco de dados**
2. Escolha **Modo de produção**
3. Local: `southamerica-east1` (São Paulo)
4. Quando o banco abrir, vá na aba **Regras**
5. Apague tudo e cole o conteúdo do arquivo `firestore.rules` que está no projeto
6. Clique em **Publicar**

---

## Passo 4 — Se cadastrar como administrador

Ainda no Firestore, aba **Dados**:

1. Clique em **Iniciar coleção**
2. ID da coleção: `usuarios` → **Próxima**
3. **ID do documento**: cole o UID que você copiou no passo 3
4. Adicione três campos:

| Campo | Tipo | Valor |
|---|---|---|
| `email` | string | seu e-mail |
| `nome` | string | seu nome |
| `papel` | string | `admin` |

5. **Salvar**

Sem esse documento você não consegue entrar no painel, mesmo com a senha certa. É de propósito: não existe cadastro público de administrador.

---

## Passo 5 — Pegar a chave de servidor

1. No Firebase, clique na engrenagem ao lado de **Visão geral do projeto** → **Configurações do projeto**
2. Aba **Contas de serviço** → **Gerar nova chave privada** → **Gerar chave**
3. Baixa um arquivo `.json`. Abra ele e localize três valores:
   - `project_id`
   - `client_email`
   - `private_key` (o texto longo que começa com `-----BEGIN PRIVATE KEY-----`)

Guarde esse arquivo. Ele dá acesso total ao seu banco — não mande para ninguém e não suba para o GitHub.

---

## Passo 6 — Pegar a chave da Anthropic

1. Entre em console.anthropic.com
2. **API Keys** → **Create Key**
3. Copie a chave (começa com `sk-ant-`). Ela só aparece uma vez

É essa chave que faz a avaliação das respostas discursivas. Se você não colocar, o resto do sistema funciona normalmente — só o botão "Avaliar respostas com IA" que não vai responder.

---

## Passo 7 — Publicar no Vercel

1. Entre em vercel.com e faça login **com a conta do GitHub**
2. **Add New** → **Project**
3. Encontre `meet-rh` na lista e clique em **Import**
4. Antes de clicar em Deploy, abra **Environment Variables** e adicione uma por uma:

| Nome | Onde achar |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | passo 2, `apiKey` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | passo 2, `authDomain` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | passo 2, `projectId` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | passo 2, `storageBucket` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | passo 2, `messagingSenderId` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | passo 2, `appId` |
| `FIREBASE_PROJECT_ID` | passo 5, `project_id` |
| `FIREBASE_CLIENT_EMAIL` | passo 5, `client_email` |
| `FIREBASE_PRIVATE_KEY` | passo 5, `private_key` |
| `ANTHROPIC_API_KEY` | passo 6 |

5. Clique em **Deploy** e espere uns 2 minutos

### Atenção com a FIREBASE_PRIVATE_KEY

Cole o valor **exatamente como está no arquivo json**, incluindo as aspas e os `\n`. Fica parecido com isto:

```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBAD...\n-----END PRIVATE KEY-----\n"
```

Se der erro de autenticação depois, esse campo é o primeiro lugar para olhar. É onde quase todo mundo tropeça.

---

## Passo 8 — Primeiro acesso

1. Abra o endereço que o Vercel te deu
2. Vá em `/admin` (ou clique em "Acesso do administrador" no rodapé)
3. Entre com o e-mail e a senha do passo 3
4. Clique em **Carregar vaga de exemplo**

Isso cria a vaga de Secretária Pessoal já com as 16 perguntas configuradas e prazo de 30 dias.

---

## Passo 9 — Testar antes de divulgar

Não pule esta parte.

1. Na vaga, aba **Configurar** → **Copiar link completo**
2. Abra esse link numa aba anônima e preencha o formulário **seis vezes**, fingindo perfis diferentes:

| Perfil | O que testar |
|---|---|
| Candidata ideal | tudo no melhor cenário, respostas longas e com critério |
| Sem CNH | tem que ser cortada |
| Só corporativo | tem que ser cortada |
| Inglês básico | não é cortada, mas cai no ranking |
| Boa mas fria | requisitos altos, respostas curtas e genéricas |
| Mediana | tudo no meio |

3. Volte ao painel e clique em **Avaliar respostas com IA** em cada uma
4. Confira se o ranking bateu com o que você esperava de cabeça

Se não bateu, ajuste os pesos das perguntas antes de divulgar. É muito mais barato descobrir agora do que com 48 pessoas reais dentro.

---

## Como o ranking funciona

- **Perguntas de corte** tiram a candidata da lista, sem nota
- **Perguntas de escolha** somam pontos conforme o peso que você definiu
- **Perguntas abertas** vão para a IA, que dá 0 a 100 em cada uma
- **Nota final** = 50% requisitos + 50% respostas abertas
- Antes de você clicar em avaliar, a nota final usa só os requisitos

O **perfil comportamental não entra na conta**. Ele aparece na aba **Perfis** e na página da candidata, para você ler depois de já ter olhado as respostas.

---

## Um detalhe sobre a avaliação

As respostas vão para a IA **sem nome, sem e-mail e sem telefone** — a função `anonimizar` limpa isso antes de enviar. A IA avalia só o conteúdo. Você vê o nome depois, no painel. É barato de fazer e corta uma classe inteira de viés.

---

## O que ainda não existe

Coisas que deixei de fora de propósito, para você usar a ferramenta antes de decidir se precisa delas:

- Relatórios e métricas de funil
- Upload e leitura de currículo
- E-mails automáticos de retorno
- Mais de um usuário administrador
- Rotina automática de exclusão dos dados vencidos (a data já é gravada em `expiraEm`, falta a função agendada que apaga)

O último item importa para a LGPD. Enquanto ele não existir, apague manualmente as inscrições vencidas — prometer prazo e não cumprir é pior do que não ter prometido.

---

## Se algo der errado

**"Erro ao entrar" mesmo com senha certa** → falta o documento em `usuarios` com `papel: admin` (passo 4), ou o UID está errado

**Página em branco no painel** → variáveis `NEXT_PUBLIC_` faltando no Vercel. Depois de adicionar, é preciso fazer um novo deploy

**"Não autorizado" ao avaliar** → `FIREBASE_PRIVATE_KEY` colada errado

**A vaga não aparece na home** → confira se o status está `aberta` e se a data de encerramento não passou

**Erro de índice no Firestore** → o console mostra um link "criar índice". Clique nele, espere 1 minuto e recarregue
