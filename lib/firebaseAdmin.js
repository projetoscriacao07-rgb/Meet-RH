import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// A inicializacao acontece na PRIMEIRA CHAMADA, nunca ao importar o arquivo.
// Se ela rodasse no topo, o build do Next quebraria: ele importa todas as
// rotas para inspecionar, e nessa hora as variaveis de ambiente nao estao la.
// A private_key passa por copiar, colar e por campos de formulario ate chegar aqui,
// e cada etapa pode estragar as quebras de linha. Esta funcao aceita as tres formas
// que ela costuma chegar e devolve sempre um PEM valido.
function normalizarChave(bruta) {
  let chave = (bruta || '').trim();

  // 1. aspas sobrando das pontas, comuns ao copiar direto do arquivo .json
  if (
    (chave.startsWith('"') && chave.endsWith('"')) ||
    (chave.startsWith("'") && chave.endsWith("'"))
  ) {
    chave = chave.slice(1, -1);
  }

  // 2. \n como texto virando quebra de linha de verdade
  chave = chave.replace(/\\n/g, '\n');

  // 3. chave que chegou numa linha so, com espacos no lugar das quebras.
  //    Remonta o PEM do jeito certo: cabecalho, corpo em blocos de 64, rodape.
  if (!chave.includes('\n')) {
    const partes = chave.match(
      /-----BEGIN PRIVATE KEY-----([\s\S]+?)-----END PRIVATE KEY-----/,
    );
    if (partes) {
      const corpo = partes[1].replace(/\s+/g, '');
      const linhas = corpo.match(/.{1,64}/g) || [];
      chave = `-----BEGIN PRIVATE KEY-----\n${linhas.join('\n')}\n-----END PRIVATE KEY-----\n`;
    }
  }

  // garante a quebra final, que o trim inicial pode ter comido
  return chave.endsWith('\n') ? chave : `${chave}\n`;
}

function appAdmin() {
  const existentes = getApps();
  if (existentes.length) return existentes[0];

  const privateKey = normalizarChave(process.env.FIREBASE_PRIVATE_KEY);

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    throw new Error(
      'Faltam variaveis do Firebase Admin. Confira FIREBASE_PROJECT_ID, ' +
      'FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY nas Environment Variables do Vercel.',
    );
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

// Proxy: adminDb.collection(...) continua funcionando igual nas rotas,
// mas o Firebase so e inicializado quando alguma propriedade e acessada.
function preguicoso(criar) {
  return new Proxy(
    {},
    {
      get(_alvo, prop) {
        const real = criar();
        const valor = real[prop];
        return typeof valor === 'function' ? valor.bind(real) : valor;
      },
    },
  );
}

export const adminDb = preguicoso(() => getFirestore(appAdmin()));
export const adminAuth = preguicoso(() => getAuth(appAdmin()));

// Confere se o token enviado no header pertence a um admin cadastrado.
export async function exigirAdmin(request) {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const doc = await adminDb.collection('usuarios').doc(decoded.uid).get();
    if (!doc.exists || doc.data().papel !== 'admin') return null;
    return decoded;
  } catch {
    return null;
  }
}
