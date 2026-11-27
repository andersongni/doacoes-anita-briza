import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="home">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="container home-hero-inner">
          <img src="/logo.png" alt="" className="home-logo" role="presentation" />
          <h1 id="home-title">Anita Briza</h1>
          <p>Acolhimento, transparência e solidariedade em cada campanha.</p>
          <div className="home-cta">
            <Link href="/campanhas" className="btn btn-primary">
              Ver campanhas
            </Link>
            <Link href="/sobre" className="btn btn-secondary">
              Conhecer o Anita Briza
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
