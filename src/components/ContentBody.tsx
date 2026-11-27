import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

type Props = {
  content: string;
  className?: string;
};

export function ContentBody({ content, className = 'prose' }: Props) {
  return (
    <article className={`${className} prose-content`}>
      <ReactMarkdown
        remarkPlugins={[remarkBreaks]}
        components={{
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src || ''}
              alt={alt || ''}
              className="content-image"
              loading="lazy"
            />
          ),
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
