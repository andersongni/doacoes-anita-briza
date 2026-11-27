/**
 * Normaliza nomes: cada palavra com inicial maiúscula e demais minúsculas.
 * Ex.: "jOÃO da SILVA" → "João Da Silva"
 */
export function formatName(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLocaleLowerCase('pt-BR');
      if (!lower) return lower;
      return lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1);
    })
    .join(' ');
}
