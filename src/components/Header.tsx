import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { logoutAction } from '@/actions/auth';

export async function Header() {
  const user = await getSessionUser();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Núcleo Assistencial Anita Briza">
          <img src="/logo.png" alt="Logo Anita Briza" className="brand-logo" />
          <span className="brand-name">Anita Briza</span>
        </Link>

        <nav className="main-nav" aria-label="Principal">
          <Link href="/sobre">Sobre o Anita Briza</Link>
          <Link href="/campanhas">Campanhas</Link>
          <Link href="/prestacao-de-contas">Prestação de Contas</Link>
        </nav>

        <div className="auth-actions">
          {user ? (
            <>
              <Link href="/painel" className="btn btn-secondary btn-sm">
                Área logada
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="btn btn-ghost btn-sm">
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/cadastre-se" className="btn btn-ghost btn-sm">
                Cadastre-se
              </Link>
              <Link href="/entrar" className="btn btn-primary btn-sm">
                Acessar sua conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
