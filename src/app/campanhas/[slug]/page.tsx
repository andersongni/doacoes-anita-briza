import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ContentBody } from '@/components/ContentBody';
import { DonationForm } from '@/components/DonationForm';

export default async function CampanhaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await prisma.publicacao.findUnique({ where: { slug } });
  if (!item || !item.published || item.category !== 'CAMPANHA') notFound();

  return (
    <div className="container">
      <header className="page-hero">
        <h1>{item.title}</h1>
      </header>
      <ContentBody content={item.content} />
      <DonationForm publicacaoId={item.id} />
    </div>
  );
}
