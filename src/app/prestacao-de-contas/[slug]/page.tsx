import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ContentBody } from '@/components/ContentBody';

export default async function PrestacaoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await prisma.publicacao.findUnique({ where: { slug } });
  if (!item || !item.published || item.category !== 'PRESTACAO_CONTAS') notFound();

  return (
    <div className="container">
      <header className="page-hero">
        <h1>{item.title}</h1>
      </header>
      <ContentBody content={item.content} />
    </div>
  );
}
