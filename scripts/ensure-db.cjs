/**
 * Garante schema no SQLite e roda seed só se ainda não houver usuários.
 * Usado no pre-deploy / start em produção (Railway).
 */
const { spawnSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

function run(cmd, args) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32',
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run('npx', ['prisma', 'db', 'push', '--skip-generate']);

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const count = await prisma.user.count();
    if (count === 0) {
      console.log('Banco vazio — executando seed inicial…');
      run('npx', ['tsx', 'prisma/seed.ts']);
    } else {
      console.log(`Banco OK (${count} usuário(s)). Seed ignorado.`);
    }
  } finally {
    await prisma.$disconnect();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
