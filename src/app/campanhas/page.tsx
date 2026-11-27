import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function CampanhasPage() {
  const items = await prisma.publicacao.findMany({
    where: { category: 'CAMPANHA', published: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container">
      <header className="page-hero">
        <h1>Campanhas</h1>
        <p>
          Conheça nossas campanhas e apoie as causas do Núcleo Assistencial Anita
          Briza.
        </p>
      </header>
      {items.length === 0 && <p className="muted">Nenhum conteúdo publicado ainda.</p>}
      <div className="card-grid">
        {items.map((item, index) => (
          <article
            key={item.id}
            className="publicacao-card"
            style={{ animationDelay: `${index * 0.06}s` }}
          >
            <span className="tag">Campanha</span>
            <h2>{item.title}</h2>
            <p>{item.excerpt || `${item.content.slice(0, 140)}…`}</p>
            <Link href={`/campanhas/${item.slug}`} className="btn btn-secondary btn-sm">
              Ler mais
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
