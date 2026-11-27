export async function verifyRecaptchaToken(token: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
  if (!secret) {
    return { ok: false, error: 'RECAPTCHA_SECRET_KEY não está configurada no servidor.' };
  }

  if (!token?.trim()) {
    return { ok: false, error: 'Confirme o reCAPTCHA antes de continuar.' };
  }

  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret,
      response: token,
    }),
  });

  if (!res.ok) {
    return { ok: false, error: 'Falha ao validar o reCAPTCHA. Tente novamente.' };
  }

  const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] };
  if (!data.success) {
    return { ok: false, error: 'reCAPTCHA inválido ou expirado. Marque novamente.' };
  }

  return { ok: true };
}
