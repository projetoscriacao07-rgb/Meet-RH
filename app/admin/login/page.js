'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Aviso } from '@/components/Ui';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [entrando, setEntrando] = useState(false);

  async function entrar() {
    setEntrando(true);
    setErro(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), senha);
      router.push('/admin');
    } catch {
      setErro('E-mail ou senha incorretos');
      setEntrando(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col justify-center px-6">
      <div className="mb-8">
        <p className="text-[26px] font-medium tracking-tight text-marinho-900">Meet RH</p>
        <p className="mt-1 text-[15px] text-slate-500">Acesso do administrador</p>
      </div>

      <div className="cartao space-y-4">
        <div>
          <label className="rotulo">E-mail</label>
          <input className="campo" type="email" inputMode="email" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="rotulo">Senha</label>
          <input className="campo" type="password" autoComplete="current-password"
            value={senha} onChange={(e) => setSenha(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && entrar()} />
        </div>

        {erro && <Aviso tipo="erro">{erro}</Aviso>}

        <button onClick={entrar} disabled={entrando || !email || !senha} className="btn-primario w-full">
          {entrando ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
    </main>
  );
}
