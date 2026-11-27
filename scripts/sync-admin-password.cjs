/**
 * CLI / ensure-db: sincroniza ADMIN_PASSWORD → usuário ADMIN_EMAIL no banco.
 * No Next.js, o mesmo ocorre no startup via src/instrumentation.ts.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function syncAdminPasswordFromEnv(options = {}) {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!email || !password) return 'skipped';

  const prisma = new PrismaClient();
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      if (!options.createIfMissing) return 'skipped';
      const hash = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          firstName: 'Admin',
          lastName: 'Anita Briza',
          email,
          password: hash,
          role: 'USER',
          status: 'APPROVED',
        },
      });
      return 'created';
    }

    if (await bcrypt.compare(password, existing.password)) return 'unchanged';

    const hash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hash, status: 'APPROVED' },
    });
    return 'updated';
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { syncAdminPasswordFromEnv };

if (require.main === module) {
  syncAdminPasswordFromEnv({ createIfMissing: true })
    .then((result) => {
      if (result === 'skipped') {
        console.error('Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env');
        process.exit(1);
      }
      console.log(`Senha do admin: ${result}`);
    })
    .catch((err) => {
      console.error(err.message || err);
      process.exit(1);
    });
}
