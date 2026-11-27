'use server';

import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { verifyRecaptchaToken } from '@/lib/recaptcha';
import {
  isValidCpfOrCnpj,
  isValidFullName,
  normalizeDocument,
  validateBirthDate,
} from '@/lib/donation-validation';
import { formatName } from '@/lib/format-name';

export type DonationFields = {
  donorName: string;
  document: string;
  email: string;
  phone: string;
  birthDate: string;
  amount: string;
};

export type DonationState = {
  error?: string;
  fields?: DonationFields;
};

function readFields(formData: FormData): DonationFields {
  return {
    donorName: String(formData.get('donorName') || ''),
    document: String(formData.get('document') || ''),
    email: String(formData.get('email') || ''),
    phone: String(formData.get('phone') || ''),
    birthDate: String(formData.get('birthDate') || ''),
    amount: String(formData.get('amount') || ''),
  };
}

function fail(error: string, fields: DonationFields): DonationState {
  return { error, fields };
}

export async function donateAction(
  _prev: DonationState,
  formData: FormData,
): Promise<DonationState> {
  const fields = readFields(formData);

  const captcha = await verifyRecaptchaToken(
    String(formData.get('recaptchaToken') || ''),
  );
  if (!captcha.ok) return fail(captcha.error || 'reCAPTCHA inválido.', fields);

  const amount = Number(fields.amount);
  const donorName = formatName(fields.donorName);
  const documentRaw = fields.document.trim();
  const document = normalizeDocument(documentRaw);
  const email = fields.email.trim().toLowerCase();
  const phone = fields.phone.trim();
  const birthDate = fields.birthDate.trim();
  const publicacaoId = String(formData.get('publicacaoId') || '') || undefined;
  const normalizedFields = { ...fields, donorName, email };

  if (!amount || amount < 10) {
    return fail('O valor mínimo de doação é R$ 10,00', normalizedFields);
  }
  if (!donorName || !documentRaw || !email || !phone || !birthDate) {
    return fail('Preencha todos os campos da doação.', normalizedFields);
  }
  if (!isValidFullName(donorName)) {
    return fail('Informe o nome completo (nome e sobrenome).', normalizedFields);
  }
  if (!isValidCpfOrCnpj(document)) {
    return fail('CPF ou CNPJ inválido.', normalizedFields);
  }
  const birthError = validateBirthDate(birthDate);
  if (birthError) return fail(birthError, normalizedFields);
  if (!email.includes('@') || email.length < 5) {
    return fail('E-mail inválido.', normalizedFields);
  }
  if (normalizeDocument(phone).length < 10) {
    return fail('Informe um telefone válido com DDD.', normalizedFields);
  }

  const txId = randomBytes(8).toString('hex').toUpperCase();
  const amountFormatted = amount.toFixed(2);
  const pixCode = [
    '00020126580014BR.GOV.BCB.PIX',
    '0136',
    `anita-briza-${txId.toLowerCase()}`,
    '52040000530398654',
    amountFormatted.length.toString().padStart(2, '0'),
    amountFormatted,
    '5802BR5925NUCLEO ASSIST ANITA BRIZA6009SAO PAULO62070503***6304ABCD',
  ].join('');

  const donation = await prisma.donation.create({
    data: {
      amount,
      donorName,
      document,
      email,
      phone,
      birthDate,
      pixCode,
      publicacaoId,
    },
  });

  revalidatePath('/painel');
  redirect(`/obrigado/${donation.id}`);
}
