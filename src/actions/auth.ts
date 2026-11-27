'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createSession, destroySession } from '@/lib/auth';
import { formatName } from '@/lib/format-name';
import { verifyRecaptchaToken } from '@/lib/recaptcha';

export type AuthFields = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
};

export type ActionState = {
  error?: string;
  success?: string;
  fields?: AuthFields;
};

function readAuthFields(formData: FormData): AuthFields {
  return {
    firstName: String(formData.get('firstName') || ''),
    lastName: String(formData.get('lastName') || ''),
    email: String(formData.get('email') || ''),
    password: String(formData.get('password') || ''),
    passwordConfirmation: String(formData.get('passwordConfirmation') || ''),
  };
}

function fail(error: string, fields: AuthFields): ActionState {
  return { error, fields };
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const fields = readAuthFields(formData);

  const captcha = await verifyRecaptchaToken(
    String(formData.get('recaptchaToken') || ''),
  );
  if (!captcha.ok) return fail(captcha.error || 'reCAPTCHA inválido.', fields);

  const firstName = formatName(fields.firstName || '');
  const lastName = formatName(fields.lastName || '');
  const email = (fields.email || '').trim().toLowerCase();
  const password = fields.password || '';
  const passwordConfirmation = fields.passwordConfirmation || '';
  const normalizedFields = { ...fields, firstName, lastName, email };

  if (firstName.length < 2 || lastName.length < 2) {
    return fail('Informe nome e sobrenome.', normalizedFields);
  }
  if (!email.includes('@')) return fail('E-mail inválido.', normalizedFields);
  if (password.length < 8) {
    return fail('A senha deve ter pelo menos 8 caracteres.', normalizedFields);
  }
  if (password !== passwordConfirmation) {
    return fail('As senhas não coincidem.', normalizedFields);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return fail('E-mail já cadastrado.', normalizedFields);

  const bootstrap = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const isBootstrap = !!bootstrap && email === bootstrap;
  const hash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hash,
      role: 'USER',
      status: isBootstrap ? 'APPROVED' : 'PENDING',
    },
  });

  return {
    success: isBootstrap
      ? 'Conta criada com sucesso. Você já pode entrar.'
      : 'Cadastro realizado. Aguarde a aprovação de um usuário autorizado.',
    fields: { firstName, lastName, email, password: '', passwordConfirmation: '' },
  };
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const fields = readAuthFields(formData);

  const captcha = await verifyRecaptchaToken(
    String(formData.get('recaptchaToken') || ''),
  );
  if (!captcha.ok) return fail(captcha.error || 'reCAPTCHA inválido.', fields);

  const email = (fields.email || '').trim().toLowerCase();
  const password = fields.password || '';

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return fail('Credenciais inválidas.', fields);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return fail('Credenciais inválidas.', fields);

  if (user.status !== 'APPROVED') {
    return fail('Seu cadastro ainda aguarda aprovação.', fields);
  }

  await createSession(user.id);
  redirect('/painel');
}

export async function logoutAction() {
  await destroySession();
  redirect('/');
}
