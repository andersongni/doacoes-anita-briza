import { prisma } from '@/lib/prisma';

export const SHARE_MESSAGE_KEY = 'share_message';

export const DEFAULT_SHARE_MESSAGE =
  'Acabei de apoiar o Núcleo Assistencial Anita Briza com R$ {valor}! Junte-se a mim: {url}';

export async function getSetting(key: string, fallback = ''): Promise<string> {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.value ?? fallback;
}

export async function getShareMessage(): Promise<string> {
  return getSetting(SHARE_MESSAGE_KEY, DEFAULT_SHARE_MESSAGE);
}

export function renderShareMessage(
  template: string,
  vars: { valor: string; url: string; nome?: string },
): string {
  return template
    .replaceAll('{valor}', vars.valor)
    .replaceAll('{url}', vars.url)
    .replaceAll('{nome}', vars.nome || '');
}

export function getSiteOrigin(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    '';
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  const port = process.env.PORT?.trim() || '3000';
  const host = process.env.HOST?.trim() || '127.0.0.1';
  return `http://${host}:${port}`;
}
