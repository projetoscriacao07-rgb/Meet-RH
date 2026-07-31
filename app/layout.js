import './globals.css';

export const metadata = {
  title: 'Meet RH',
  description: 'Processos seletivos com triagem inteligente',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="mx-auto min-h-screen w-full max-w-2xl bg-[#F5F7FA]">{children}</div>
      </body>
    </html>
  );
}
