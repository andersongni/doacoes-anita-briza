import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ContentBody } from '@/components/ContentBody';

export default async function ContatoPage() {
  const page = await prisma.page.findUnique({ where: { slug: 'contato' } });
  if (!page || !page.published) notFound();

  return (
    <div className="container">
      <header className="page-hero">
        <h1>{page.title}</h1>
      </header>
      <ContentBody content={page.content} />
    </div>
  );
}
