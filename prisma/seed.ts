import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

config({ path: resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida.`;

const sobreContent = `O Núcleo Assistencial Anita Briza nasceu do compromisso com a dignidade, o acolhimento e a transformação social.

${LOREM}

Nossa missão é promover ações solidárias, campanhas transparentes e prestação de contas clara à comunidade.`;

const termosContent = `Termos de Uso — Núcleo Assistencial Anita Briza

${LOREM}

Ao utilizar este site, você concorda com as condições aqui descritas. Este conteúdo pode ser editado por usuários autorizados.`;

const contatoContent = `Entre em contato com o Núcleo Assistencial Anita Briza.

${LOREM}

E-mail: contato@anitabriza.org.br
Telefone: (11) 0000-0000

Este conteúdo pode ser editado por usuários autorizados.`;

const campanhaContent = `Campanha de Acolhimento Solidário

${LOREM}

Sua contribuição garante alimentos, materiais e apoio contínuo às famílias acompanhadas pelo Núcleo Assistencial Anita Briza.`;

const prestacaoContent = `Prestação de Contas — Trimestre Atual

${LOREM}

Publicamos periodicamente o detalhamento das receitas e despesas para manter a confiança de doadores e da comunidade.`;

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  if (!adminEmail) {
    throw new Error(
      'ADMIN_EMAIL é obrigatória para o seed. Defina no arquivo .env',
    );
  }

  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const hash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: {
      role: 'USER',
      status: 'APPROVED',
      password: hash,
      lastName: 'Anita Briza',
    },
    create: {
      firstName: 'Admin',
      lastName: 'Anita Briza',
      email: adminEmail.toLowerCase(),
      password: hash,
      role: 'USER',
      status: 'APPROVED',
    },
  });

  await prisma.page.upsert({
    where: { slug: 'sobre' },
    update: { title: 'Sobre o Anita Briza', content: sobreContent },
    create: {
      title: 'Sobre o Anita Briza',
      slug: 'sobre',
      content: sobreContent,
      published: true,
      authorId: admin.id,
    },
  });

  await prisma.page.upsert({
    where: { slug: 'termos-de-uso' },
    update: { content: termosContent },
    create: {
      title: 'Termos de Uso',
      slug: 'termos-de-uso',
      content: termosContent,
      published: true,
      authorId: admin.id,
    },
  });

  await prisma.page.upsert({
    where: { slug: 'contato' },
    update: { content: contatoContent },
    create: {
      title: 'Entrar em Contato',
      slug: 'contato',
      content: contatoContent,
      published: true,
      authorId: admin.id,
    },
  });

  // Conteúdo editável da página /obrigado/[id] (placeholders: {nome}, {valor})
  await prisma.page.upsert({
    where: { slug: 'obrigado' },
    update: {},
    create: {
      title: 'Obrigado, {nome}!',
      slug: 'obrigado',
      content:
        'Sua generosidade fortalece o Núcleo Assistencial Anita Briza. Conclua o pagamento via PIX abaixo.',
      published: true,
      authorId: admin.id,
    },
  });

  await prisma.publicacao.upsert({
    where: { slug: 'campanha-acolhimento-solidario' },
    update: { content: campanhaContent },
    create: {
      title: 'Campanha de Acolhimento Solidário',
      slug: 'campanha-acolhimento-solidario',
      excerpt:
        'Ajude a fortalecer nossas ações de acolhimento e cuidado com quem mais precisa.',
      content: campanhaContent,
      category: 'CAMPANHA',
      published: true,
      authorId: admin.id,
    },
  });

  await prisma.publicacao.upsert({
    where: { slug: 'prestacao-contas-trimestre' },
    update: {
      title: 'Prestação de Contas — Trimestre Atual',
      excerpt:
        'Relatório transparente das doações recebidas e da aplicação dos recursos.',
      content: prestacaoContent,
    },
    create: {
      title: 'Prestação de Contas — Trimestre Atual',
      slug: 'prestacao-contas-trimestre',
      excerpt:
        'Relatório transparente das doações recebidas e da aplicação dos recursos.',
      content: prestacaoContent,
      category: 'PRESTACAO_CONTAS',
      published: true,
      authorId: admin.id,
    },
  });

  // Corrige títulos corrompidos por requests com encoding inválido
  await prisma.publicacao.updateMany({
    where: { slug: 'prestacao-contas-trimestre' },
    data: {
      title: 'Prestação de Contas — Trimestre Atual',
    },
  });


  // Garante perfil único para todos os usuários existentes
  await prisma.user.updateMany({ data: { role: 'USER' } });

  await prisma.siteSetting.upsert({
    where: { key: 'share_message' },
    update: {},
    create: {
      key: 'share_message',
      value:
        'Acabei de apoiar o Núcleo Assistencial Anita Briza com R$ {valor}! Junte-se a mim: {url}',
    },
  });

  console.log('Seed concluído.');
  console.log(`Usuário inicial: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
