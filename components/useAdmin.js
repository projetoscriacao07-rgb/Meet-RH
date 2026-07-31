'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// Retorna: undefined = carregando | null = sem acesso | objeto = admin logado
// Qualquer falha agora vira mensagem na tela, nunca carregamento infinito.
export function useAdmin() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(undefined);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    // Rede fora do ar ou configuracao errada travariam a tela para sempre.
    const limite = setTimeout(() => {
      setUsuario((atual) => {
        if (atual === undefined) {
          setErro('O Firebase nao respondeu em 15 segundos. Confira as variaveis NEXT_PUBLIC no Vercel.');
          return null;
        }
        return atual;
      });
    }, 15000);

    const parar = onAuthStateChanged(
      auth,
      async (u) => {
        clearTimeout(limite);

        if (!u) { setUsuario(null); router.replace('/admin/login'); return; }

        try {
          const perfil = await getDoc(doc(db, 'usuarios', u.uid));

          if (!perfil.exists()) {
            setErro(
              `Voce entrou como ${u.email}, mas nao existe documento com o ID ${u.uid} ` +
              'na colecao usuarios do Firestore.',
            );
            setUsuario(null);
            return;
          }

          if (perfil.data().papel !== 'admin') {
            setErro(`O campo papel do seu documento esta como "${perfil.data().papel}". Precisa ser exatamente admin.`);
            setUsuario(null);
            return;
          }

          setUsuario(u);
        } catch (e) {
          setErro(`Falha ao ler o Firestore: ${e.code || ''} ${e.message}`);
          setUsuario(null);
        }
      },
      (e) => {
        clearTimeout(limite);
        setErro(`Falha na autenticacao: ${e.message}`);
        setUsuario(null);
      },
    );

    return () => { clearTimeout(limite); parar(); };
  }, [router]);

  return { usuario, erro };
}

export async function tokenAtual() {
  const u = auth.currentUser;
  if (!u) return null;
  return u.getIdToken();
}

export async function sair(router) {
  await signOut(auth);
  router.replace('/admin/login');
}
