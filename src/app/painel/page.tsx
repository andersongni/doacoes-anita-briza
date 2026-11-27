import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  deletePublicacaoAction,
  deleteUserAction,
  savePageAction,
  savePublicacaoAction,
  saveShareMessageAction,
  setUserStatusAction,
} from '@/actions/cms';
import { PainelTabs } from '@/components/PainelTabs';
import { formatName } from '@/lib/format-name';
import { DEFAULT_SHARE_MESSAGE, getShareMessage } from '@/lib/settings';

export default async function PainelPage() {
  const user = await getSessionUser();
  if (!user) redirect('/entrar');

  const [publicacoes, pages, users, donations, shareMessage] = await Promise.all([
    prisma.publicacao.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.page.findMany({ orderBy: { title: 'asc' } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.donation.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        donorName: true,
        document: true,
        email: true,
        phone: true,
        birthDate: true,
        publicacaoId: true,
        createdAt: true,
      },
    }),
    getShareMessage(),
  ]);

  const campaignTitles = new Map(
    publicacoes.map((p) => [p.id, p.title] as const),
  );
  const doadores = donations.map((d) => ({
    ...d,
    donorName: formatName(d.donorName),
    createdAt: d.createdAt.toISOString(),
    campaignTitle: d.publicacaoId
      ? campaignTitles.get(d.publicacaoId) || null
      : null,
  }));

  const usersFormatted = users.map((u) => ({
    ...u,
    firstName: formatName(u.firstName),
    lastName: formatName(u.lastName),
  }));

  return (
    <div className="container">
      <div className="admin-panel">
        <header className="page-hero">
          <h1>Área logada</h1>
          <p>
            Olá, {formatName(user.firstName)}. Todos os usuários aprovados
            compartilham o mesmo perfil: editar publicações, páginas, aprovar
            cadastros e consultar doadores.
          </p>
        </header>

        <PainelTabs
          publicacoes={publicacoes}
          pages={pages}
          users={usersFormatted}
          doadores={doadores}
          shareMessage={shareMessage || DEFAULT_SHARE_MESSAGE}
          protectedAdminEmail={process.env.ADMIN_EMAIL?.trim().toLowerCase() || ''}
          savePublicacaoAction={savePublicacaoAction}
          deletePublicacaoAction={deletePublicacaoAction}
          savePageAction={savePageAction}
          setUserStatusAction={setUserStatusAction}
          deleteUserAction={deleteUserAction}
          saveShareMessageAction={saveShareMessageAction}
        />
      </div>
    </div>
  );
}
