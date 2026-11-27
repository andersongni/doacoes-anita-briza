import * as bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/**
 * Garante que o usuário ADMIN_EMAIL use a senha de ADMIN_PASSWORD.
 * Só grava no banco se a senha do ambiente for diferente da atual.
 */
export async function syncAdminPasswordFromEnv(options?: {
  createIfMissing?: boolean;
}): Promise<'updated' | 'unchanged' | 'created' | 'skipped'> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!email || !password) return 'skipped';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    if (!options?.createIfMissing) return 'skipped';
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

  const matches = await bcrypt.compare(password, existing.password);
  if (matches) return 'unchanged';

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { email },
    data: { password: hash, status: 'APPROVED' },
  });
  return 'updated';
}
