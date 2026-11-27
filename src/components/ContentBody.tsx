import { looksLikeHtml, sanitizeContentHtml } from '@/lib/rich-content';
import { ContentMarkdownFallback } from '@/components/ContentMarkdownFallback';

type Props = {
  content: string;
  className?: string;
};

export function ContentBody({ content, className = 'prose' }: Props) {
  if (!looksLikeHtml(content)) {
    return <ContentMarkdownFallback content={content} className={className} />;
  }

  const html = sanitizeContentHtml(content);
  return (
    <article
      className={`${className} prose-content rich-content`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
