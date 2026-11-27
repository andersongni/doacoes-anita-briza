'use client';

import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { parseImageOptions } from '@/lib/content-image';

type Props = {
  content: string;
  className?: string;
};

/** Conteúdos antigos em markdown (antes do editor visual). */
export function ContentMarkdownFallback({
  content,
  className = 'prose',
}: Props) {
  return (
    <article className={`${className} prose-content`}>
      <ReactMarkdown
        remarkPlugins={[remarkBreaks]}
        components={{
          img: ({ src, alt, title }) => {
            const opts = parseImageOptions(title);
            return (
              <span
                className={`content-figure content-figure--${opts.size} content-figure--${opts.align}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src || ''}
                  alt={alt || ''}
                  className="content-image"
                  loading="lazy"
                />
              </span>
            );
          },
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
