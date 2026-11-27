import Link from 'next/link';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-wave" aria-hidden="true" />
      <div className="container footer-inner">
        <div className="footer-brand">
          <img src="/logo.png" alt="Logo Núcleo Assistencial Anita Briza" />
          <div>
            <strong>Núcleo Assistencial Anita Briza</strong>
            <p className="muted">Acolhimento, transparência e solidariedade.</p>
          </div>
        </div>
        <nav className="footer-links" aria-label="Links do rodapé">
          <Link href="/sobre">Sobre o Anita Briza</Link>
          <Link href="/termos-de-uso">Termos de uso</Link>
          <Link href="/contato">Entrar em contato</Link>
        </nav>
      </div>
      <div className="container footer-copy">
        <small>© {new Date().getFullYear()} Núcleo Assistencial Anita Briza</small>
      </div>
    </footer>
  );
}
