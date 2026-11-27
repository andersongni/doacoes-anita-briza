export const IMAGE_SIZES = [
  { value: 'sm', label: 'Pequena' },
  { value: 'md', label: 'Média' },
  { value: 'lg', label: 'Grande' },
  { value: 'full', label: 'Largura total' },
] as const;

export const IMAGE_ALIGNS = [
  { value: 'left', label: 'À esquerda' },
  { value: 'center', label: 'Centralizada' },
  { value: 'right', label: 'À direita' },
] as const;

export type ImageSize = (typeof IMAGE_SIZES)[number]['value'];
export type ImageAlign = (typeof IMAGE_ALIGNS)[number]['value'];

export type ContentImageOptions = {
  size: ImageSize;
  align: ImageAlign;
};

export type ContentImageMatch = {
  id: string;
  start: number;
  end: number;
  raw: string;
  alt: string;
  src: string;
  title: string;
  size: ImageSize;
  align: ImageAlign;
};

const SIZE_SET = new Set<string>(IMAGE_SIZES.map((s) => s.value));
const ALIGN_SET = new Set<string>(IMAGE_ALIGNS.map((a) => a.value));
const IMAGE_RE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;

export function parseImageOptions(title?: string | null): ContentImageOptions {
  const opts: ContentImageOptions = { size: 'md', align: 'center' };
  if (!title?.trim()) return opts;

  for (const part of title.split(/[|;,]/)) {
    const [rawKey, rawVal] = part.split('=').map((s) => s.trim().toLowerCase());
    if (!rawKey || !rawVal) continue;
    if (rawKey === 'size' && SIZE_SET.has(rawVal)) {
      opts.size = rawVal as ImageSize;
    }
    if (
      (rawKey === 'align' || rawKey === 'pos' || rawKey === 'position') &&
      ALIGN_SET.has(rawVal)
    ) {
      opts.align = rawVal as ImageAlign;
    }
  }
  return opts;
}

export function buildImageTitle(options: ContentImageOptions): string {
  return `size=${options.size};align=${options.align}`;
}

export function buildImageMarkdown(
  src: string,
  alt: string,
  options: ContentImageOptions,
): string {
  const safeAlt = (alt || 'Imagem').replace(/[[\]]/g, '');
  const title = buildImageTitle(options);
  return `![${safeAlt}](${src} "${title}")`;
}

export function listContentImages(text: string): ContentImageMatch[] {
  const items: ContentImageMatch[] = [];
  const re = new RegExp(IMAGE_RE.source, 'g');
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = re.exec(text))) {
    const opts = parseImageOptions(match[3] || '');
    items.push({
      id: `${index}-${match.index}-${match[2]}`,
      start: match.index,
      end: match.index + match[0].length,
      raw: match[0],
      alt: match[1] || '',
      src: match[2] || '',
      title: match[3] || '',
      size: opts.size,
      align: opts.align,
    });
    index += 1;
  }
  return items;
}

export function replaceContentSlice(
  text: string,
  start: number,
  end: number,
  nextSlice: string,
): string {
  return text.slice(0, start) + nextSlice + text.slice(end);
}
