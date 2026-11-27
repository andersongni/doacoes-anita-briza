import Link from 'next/link';
import { notFound } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { prisma } from '@/lib/prisma';
import { ContentBody } from '@/components/ContentBody';
import { CopyPixButton } from '@/components/CopyPixButton';
import { ShareCampaignLinks } from '@/components/ShareCampaignLinks';
import { formatName } from '@/lib/format-name';
import {
  getShareMessage,
  getSiteOrigin,
  renderShareMessage,
} from '@/lib/settings';

const DEFAULT_TITLE = 'Obrigado, {nome}!';
const DEFAULT_CONTENT =
  'Sua generosidade fortalece o Núcleo Assistencial Anita Briza. Conclua o pagamento via PIX abaixo.';

function applyThankYouPlaceholders(
  template: string,
  vars: { nome: string; valor: string },
) {
  return template
    .replaceAll('{nome}', vars.nome)
    .replaceAll('{valor}', vars.valor);
}

export default async function ObrigadoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [donation, thankYouPage] = await Promise.all([
    prisma.donation.findUnique({ where: { id } }),
    prisma.page.findUnique({ where: { slug: 'obrigado' } }),
  ]);
  if (!donation) notFound();

  let campaignPath = '/campanhas';
  if (donation.publicacaoId) {
    const campaign = await prisma.publicacao.findUnique({
      where: { id: donation.publicacaoId },
      select: { slug: true, category: true },
    });
    if (campaign) {
      campaignPath =
        campaign.category === 'CAMPANHA'
          ? `/campanhas/${campaign.slug}`
          : `/prestacao-de-contas/${campaign.slug}`;
    }
  }

  const donorName = formatName(donation.donorName);
  const valor = donation.amount.toFixed(2).replace('.', ',');
  const shareUrl = `${getSiteOrigin()}${campaignPath}`;
  const template = await getShareMessage();
  const shareMessage = renderShareMessage(template, {
    valor,
    url: shareUrl,
    nome: donorName,
  });

  const title = applyThankYouPlaceholders(
    thankYouPage?.title || DEFAULT_TITLE,
    { nome: donorName, valor },
  );
  const content = applyThankYouPlaceholders(
    thankYouPage?.content || DEFAULT_CONTENT,
    { nome: donorName, valor },
  );

  return (
    <div className="container thankyou">
      <header className="page-hero">
        <h1>{title}</h1>
      </header>
      <ContentBody content={content} className="prose thankyou-intro" />

      <section className="prose thankyou-card">
        <p>
          Valor: <strong>R$ {donation.amount.toFixed(2)}</strong>
        </p>
        <p className="muted">Código da doação: {donation.id.slice(0, 8).toUpperCase()}</p>
        <div className="pix-box">
          <QRCodeSVG
            value={donation.pixCode}
            size={200}
            fgColor="#004866"
            bgColor="#ffffff"
            title="QR Code PIX para pagamento"
          />
          <div className="pix-code stack-sm">
            <label htmlFor="pix-code">Código PIX (mock)</label>
            <textarea id="pix-code" readOnly rows={4} value={donation.pixCode} />
            <CopyPixButton code={donation.pixCode} />
          </div>
        </div>
      </section>

      <section className="share-block">
        <h2>Compartilhe a campanha</h2>
        <p className="muted share-preview">
          Use os ícones para divulgar a campanha. Em WhatsApp, Twitter / X,
          Telegram, Threads, Bluesky e e-mail a mensagem já vai preenchida; no
          Facebook, Instagram e LinkedIn ela é copiada para você colar no post.
        </p>
        <ShareCampaignLinks message={shareMessage} url={shareUrl} />
      </section>

      <p style={{ marginTop: '1.5rem' }}>
        <Link href="/campanhas">Voltar às campanhas</Link>
      </p>
    </div>
  );
}
