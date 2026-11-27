'use server';

import { randomBytes } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { SHARE_MESSAGE_KEY } from '@/lib/settings';
import { slugify } from '@/lib/slug';
import type { PublicacaoCategory, UserStatus } from '@prisma/client';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

async function uniquePublicacaoSlug(base: string, excludeId?: string) {
  let slug = base || 'publicacao';
  let i = 1;
  while (true) {
    const found = await prisma.publicacao.findUnique({ where: { slug } });
    if (!found || found.id === excludeId) return slug;
    slug = `${base}-${i++}`;
  }
}

async function uniquePageSlug(base: string, excludeId?: string) {
  let slug = base || 'pagina';
  let i = 1;
  while (true) {
    const found = await prisma.page.findUnique({ where: { slug } });
    if (!found || found.id === excludeId) return slug;
    slug = `${base}-${i++}`;
  }
}

export async function savePublicacaoAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get('id') || '');
  const title = String(formData.get('title') || '').trim();
  const content = String(formData.get('content') || '').trim();
  const excerpt = String(formData.get('excerpt') || '').trim();
  const category = String(formData.get('category') || 'CAMPANHA') as PublicacaoCategory;
  const published = formData.get('published') === 'on';

  if (title.length < 3 || content.length < 3) {
    throw new Error('Título e conteúdo precisam ter pelo menos 3 caracteres.');
  }

  if (id) {
    await prisma.publicacao.update({
      where: { id },
      data: { title, content, excerpt: excerpt || content.slice(0, 160), category, published },
    });
  } else {
    const slug = await uniquePublicacaoSlug(slugify(title));
    await prisma.publicacao.create({
      data: {
        title,
        content,
        excerpt: excerpt || content.slice(0, 160),
        category,
        published,
        slug,
        authorId: user.id,
      },
    });
  }

  revalidatePath('/campanhas');
  revalidatePath('/prestacao-de-contas');
  revalidatePath('/painel');
}

export async function deletePublicacaoAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') || '');
  await prisma.publicacao.delete({ where: { id } });
  revalidatePath('/campanhas');
  revalidatePath('/prestacao-de-contas');
  revalidatePath('/painel');
}

export async function savePageAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') || '');
  if (!id) {
    throw new Error('Páginas existentes só podem ser editadas, não criadas por aqui.');
  }

  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) throw new Error('Página não encontrada.');

  const title = String(formData.get('title') || '').trim();
  const content = String(formData.get('content') || '').trim();
  const slugInput = String(formData.get('slug') || '').trim();
  const published = formData.get('published') === 'on';

  if (title.length < 3 || content.length < 3) {
    throw new Error('Título e conteúdo precisam ter pelo menos 3 caracteres.');
  }

  const data: { title: string; content: string; published: boolean; slug?: string } = {
    title,
    content,
    published,
  };

  // Slug da página de agradecimento é reservado (usada em /obrigado/[id]).
  if (existing.slug === 'obrigado') {
    data.slug = 'obrigado';
  } else if (slugInput) {
    const nextSlug = await uniquePageSlug(slugify(slugInput), id);
    if (nextSlug === 'obrigado') {
      throw new Error('O slug "obrigado" é reservado para a página de agradecimento.');
    }
    data.slug = nextSlug;
  }

  await prisma.page.update({ where: { id }, data });

  revalidatePath('/');
  revalidatePath('/sobre');
  revalidatePath('/contato');
  revalidatePath('/termos-de-uso');
  revalidatePath('/obrigado', 'layout');
  revalidatePath('/painel');
}

export async function setUserStatusAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || '') as UserStatus;
  await prisma.user.update({ where: { id }, data: { status } });
  revalidatePath('/painel');
}

export async function deleteUserAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') || '');
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return;

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (adminEmail && target.email.toLowerCase() === adminEmail) {
    throw new Error('O usuário admin definido em ADMIN_EMAIL não pode ser excluído.');
  }

  await prisma.publicacao.updateMany({
    where: { authorId: id },
    data: { authorId: null },
  });
  await prisma.page.updateMany({
    where: { authorId: id },
    data: { authorId: null },
  });
  await prisma.user.delete({ where: { id } });
  revalidatePath('/painel');
}

export async function saveShareMessageAction(formData: FormData) {
  await requireUser();
  const value = String(formData.get('shareMessage') || '').trim();
  if (value.length < 10) {
    throw new Error('A mensagem de compartilhamento precisa ter pelo menos 10 caracteres.');
  }

  await prisma.siteSetting.upsert({
    where: { key: SHARE_MESSAGE_KEY },
    update: { value },
    create: { key: SHARE_MESSAGE_KEY, value },
  });

  revalidatePath('/painel');
  revalidatePath('/obrigado', 'layout');
}

export async function uploadImageAction(
  formData: FormData,
): Promise<{ ok: boolean; path?: string; error?: string }> {
  await requireUser();

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Selecione uma imagem.' };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: 'A imagem deve ter no máximo 5 MB.' };
  }

  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) {
    return { ok: false, error: 'Use PNG, JPG, WEBP ou GIF.' };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${randomBytes(6).toString('hex')}.${ext}`;
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, fileName), bytes);

  return { ok: true, path: `/uploads/${fileName}` };
}
