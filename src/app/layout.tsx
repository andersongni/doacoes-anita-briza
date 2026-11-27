import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import '@/styles/global.css';

export const metadata: Metadata = {
  title: 'Anita Briza',
  description:
    'Núcleo Assistencial Anita Briza — campanhas solidárias, acolhimento e prestação de contas.',
  icons: {
    icon: [{ url: '/logo.png', type: 'image/png' }],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.ADMIN_EMAIL?.trim()) {
    throw new Error('ADMIN_EMAIL é obrigatória');
  }

  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="site-shell">
          <a className="skip-link" href="#conteudo-principal">
            Ir para o conteúdo principal
          </a>
          <Header />
          <main id="conteudo-principal" className="site-main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
