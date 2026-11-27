/**
 * Seed minimo para o pacote standalone (sem tsx).
 * Cria paginas basicas e mensagem de compartilhamento.
 * O usuario admin deve se cadastrar no site com ADMIN_EMAIL (autoaprovado).
 *
 * Uso: node seed-minimal.cjs
 */
const fs = require('fs');
const path = require('path');

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

async function main() {
  loadEnv(path.join(__dirname, '.env'));
  if (!process.env.DATABASE_URL) process.env.DATABASE_URL = 'file:./dev.db';

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const pages = [
    {
      slug: 'sobre',
      title: 'Sobre o Anita Briza',
      content: 'Conteudo editavel no painel.',
    },
    {
      slug: 'termos-de-uso',
      title: 'Termos de Uso',
      content: 'Conteudo editavel no painel.',
    },
    {
      slug: 'contato',
      title: 'Entrar em Contato',
      content: 'Conteudo editavel no painel.',
    },
    {
      slug: 'obrigado',
      title: 'Obrigado, {nome}!',
      content:
        'Sua generosidade fortalece o Nucleo Assistencial Anita Briza. Conclua o pagamento via PIX abaixo.',
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: { ...page, published: true },
    });
  }

  await prisma.siteSetting.upsert({
    where: { key: 'share_message' },
    update: {},
    create: {
      key: 'share_message',
      value:
        'Acabei de apoiar o Nucleo Assistencial Anita Briza com R$ {valor}! Junte-se a mim: {url}',
    },
  });

  console.log('Seed minimo concluido. Cadastre-se no site com ADMIN_EMAIL para acessar o painel.');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
