import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';
import { parseImageOptions } from '@/lib/content-image';

const PURIFY = {
  USE_PROFILES: { html: true },
  ADD_TAGS: ['img', 'figure', 'figcaption'],
  ADD_ATTR: [
    'class',
    'src',
    'alt',
    'title',
    'width',
    'height',
    'loading',
    'data-size',
    'data-wrap',
  ],
};

function escapeAttr(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/** Converte imagens markdown antigas para <img data-size data-wrap>. */
function markdownImagesToHtml(markdown: string): string {
  return markdown.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_full, alt: string, src: string, title?: string) => {
      const opts = parseImageOptions(title);
      const wrap =
        opts.align === 'left' ? 'left' : opts.align === 'right' ? 'right' : 'break';
      return `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt || 'Imagem')}" data-size="${opts.size}" data-wrap="${wrap}" class="editor-image editor-image--${opts.size} editor-image--wrap-${wrap}" />`;
    },
  );
}

/** Conteúdo antigo em markdown → HTML para o editor visual. */
export function contentToEditorHtml(content: string): string {
  const trimmed = content?.trim() || '';
  if (!trimmed) return '<p></p>';
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;
  const withImages = markdownImagesToHtml(trimmed);
  return marked.parse(withImages, { async: false, breaks: true }) as string;
}

export function sanitizeContentHtml(html: string): string {
  return DOMPurify.sanitize(html || '', PURIFY);
}

export function looksLikeHtml(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content || '');
}
