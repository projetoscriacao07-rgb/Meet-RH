'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDocFromServer, getDocsFromServer, limit, query } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// Pagina temporaria de diagnostico. Acesse em /admin/diagnostico
// Pode apagar depois que tudo estiver funcionando.

export default function Diagnostico() {
  const [testes, setTestes] = useState([]);
  const [rodando, setRodando] = useState(true);

  useEffect(() => {
    const resultados = [];
    const registrar = (nome, ok, detalhe) => {
      resultados.push({ nome, ok, detalhe });
      setTestes([...resultados]);
    };

    async function rodar() {
      // 1. variaveis publicas
      const faltando = [
        ['API_KEY', process.env.NEXT_PUBLIC_FIREBASE_API_KEY],
        ['AUTH_DOMAIN', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN],
        ['PROJECT_ID', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID],
        ['APP_ID', process.env.NEXT_PUBLIC_FIREBASE_APP_ID],
      ].filter(([, v]) => !v).map(([n]) => n);

      registrar(
        '1. Variaveis NEXT_PUBLIC no Vercel',
        faltando.length === 0,
        faltando.length ? `Faltando: ${faltando.join(', ')}` : `Projeto: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`,
      );

      // 2. sessao
      const usuario = await new Promise((resolve) => {
        const parar = onAuthStateChanged(auth, (u) => { parar(); resolve(u); });
        setTimeout(() => resolve(undefined), 8000);
      });

      if (usuario === undefined) {
        registrar('2. Conexao com o Authentication', false, 'Nao respondeu em 8s. Confira API_KEY e AUTH_DOMAIN.');
        setRodando(false);
        return;
      }
      if (!usuario) {
        registrar('2. Sessao ativa', false, 'Ninguem logado. Entre em /admin/login e volte aqui.');
        setRodando(false);
        return;
      }
      registrar('2. Sessao ativa', true, `${usuario.email}`);
      registrar('3. Seu UID', true, usuario.uid);

      // 4. documento em usuarios
      try {
        const perfil = await getDocFromServer(doc(db, 'usuarios', usuario.uid));
        if (!perfil.exists()) {
          registrar('4. Documento em usuarios', false,
            `Nao existe documento com o ID ${usuario.uid} na colecao usuarios.`);
        } else {
          const papel = perfil.data().papel;
          registrar('4. Documento em usuarios', true, `Encontrado. Campos: ${Object.keys(perfil.data()).join(', ')}`);
          registrar('5. Campo papel', papel === 'admin', `Valor lido: ${JSON.stringify(papel)}`);
        }
      } catch (e) {
        registrar('4. Documento em usuarios', false, `${e.code || ''} ${e.message}`);
      }

      // 6. leitura de vagas
      try {
        const snap = await getDocsFromServer(query(collection(db, 'vagas'), limit(1)));
        registrar('6. Leitura da colecao vagas (direto do servidor)', true, `${snap.size} documento(s)`);
      } catch (e) {
        registrar('6. Leitura da colecao vagas', false, `${e.code || ''} ${e.message}`);
      }

      // 7. rota de servidor
      try {
        const r = await fetch('/api/vagas');
        const bruto = await r.text();
        let detalhe;
        try {
          const d = JSON.parse(bruto);
          detalhe = r.ok
            ? `${(d.vagas || []).length} vaga(s) aberta(s)`
            : `${d.codigo || ''} ${d.erro || ''}`.trim();
        } catch {
          detalhe = `HTTP ${r.status} - resposta nao era JSON: ${bruto.slice(0, 200)}`;
        }
        registrar('7. Rota /api/vagas (Firebase Admin)', r.ok, detalhe);
      } catch (e) {
        registrar('7. Rota /api/vagas (Firebase Admin)', false, e.message);
      }

      setRodando(false);
    }

    rodar();
  }, []);

  return (
    <main className="px-4 py-6">
      <h1 className="text-[20px] font-medium text-slate-900">Diagnostico</h1>
      <p className="mt-1 text-[14px] text-slate-500">
        Cada linha testa uma peca. A primeira que falhar e a causa.
      </p>

      <div className="mt-5 space-y-2">
        {testes.map((t, i) => (
          <div key={i} className={`rounded-xl border p-3.5 ${t.ok ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
            <div className="flex items-start gap-2.5">
              <span className={`mt-0.5 shrink-0 text-[15px] font-bold ${t.ok ? 'text-emerald-700' : 'text-rose-700'}`}>
                {t.ok ? '+' : 'x'}
              </span>
              <div className="min-w-0">
                <p className={`text-[14px] font-medium ${t.ok ? 'text-emerald-900' : 'text-rose-900'}`}>{t.nome}</p>
                <p className={`mt-0.5 break-all text-[12px] leading-relaxed ${t.ok ? 'text-emerald-800' : 'text-rose-800'}`}>
                  {t.detalhe}
                </p>
              </div>
            </div>
          </div>
        ))}

        {rodando && <p className="py-3 text-[13px] text-slate-400">Testando...</p>}
      </div>

      <div className="mt-6 flex gap-2">
        <Link href="/admin/login" className="btn-secundario flex-1">Ir para o login</Link>
        <Link href="/admin" className="btn-secundario flex-1">Ir para o painel</Link>
      </div>
    </main>
  );
}
