function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function allSameDigits(digits: string): boolean {
  return /^(\d)\1+$/.test(digits);
}

function calcCpfCheckDigit(base: string, factorStart: number): number {
  let sum = 0;
  for (let i = 0; i < base.length; i += 1) {
    sum += Number(base[i]) * (factorStart - i);
  }
  const mod = (sum * 10) % 11;
  return mod === 10 ? 0 : mod;
}

export function isValidCpf(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 11 || allSameDigits(digits)) return false;

  const d1 = calcCpfCheckDigit(digits.slice(0, 9), 10);
  if (d1 !== Number(digits[9])) return false;

  const d2 = calcCpfCheckDigit(digits.slice(0, 10), 11);
  return d2 === Number(digits[10]);
}

function calcCnpjCheckDigit(base: string): number {
  const weights =
    base.length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < base.length; i += 1) {
    sum += Number(base[i]) * weights[i];
  }
  const mod = sum % 11;
  return mod < 2 ? 0 : 11 - mod;
}

export function isValidCnpj(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 14 || allSameDigits(digits)) return false;

  const d1 = calcCnpjCheckDigit(digits.slice(0, 12));
  if (d1 !== Number(digits[12])) return false;

  const d2 = calcCnpjCheckDigit(digits.slice(0, 13));
  return d2 === Number(digits[13]);
}

export function isValidCpfOrCnpj(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length === 11) return isValidCpf(digits);
  if (digits.length === 14) return isValidCnpj(digits);
  return false;
}

/** Exige pelo menos nome + sobrenome (duas palavras com 2+ letras cada). */
export function isValidFullName(value: string): boolean {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter((part) => part.replace(/[^\p{L}]/gu, '').length >= 2);
  return parts.length >= 2;
}

export function parseBirthDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export function validateBirthDate(value: string): string | null {
  const date = parseBirthDate(value);
  if (!date) return 'Informe uma data de nascimento válida.';

  const today = new Date();
  const todayUtc = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  if (date.getTime() > todayUtc) {
    return 'A data de nascimento não pode ser no futuro.';
  }

  const ageMs = todayUtc - date.getTime();
  const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000);
  if (ageYears < 16) {
    return 'É necessário ter pelo menos 16 anos para doar.';
  }
  if (ageYears > 120) {
    return 'Informe uma data de nascimento válida.';
  }

  return null;
}

export function normalizeDocument(value: string): string {
  return onlyDigits(value);
}
