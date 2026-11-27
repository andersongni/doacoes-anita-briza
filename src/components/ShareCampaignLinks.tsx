'use client';

import { useState, type ReactNode } from 'react';

type Props = {
  message: string;
  url: string;
};

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d={path} />
    </svg>
  );
}

const ICONS = {
  whatsapp:
    'M17.47 14.38c-.28-.14-1.64-.81-1.9-.9-.25-.1-.44-.14-.62.14-.19.28-.71.9-.87 1.08-.16.19-.32.21-.6.07-.28-.14-1.17-.43-2.23-1.37-.82-.73-1.38-1.64-1.54-1.91-.16-.28-.02-.43.12-.57.12-.12.28-.32.42-.48.14-.16.19-.28.28-.46.1-.19.05-.35-.02-.49-.07-.14-.62-1.49-.85-2.04-.22-.53-.45-.46-.62-.46h-.53c-.19 0-.49.07-.74.35-.25.28-.97.95-.97 2.3s.99 2.67 1.13 2.85c.14.19 1.95 2.98 4.72 4.18.66.28 1.18.46 1.58.59.66.21 1.27.18 1.75.11.53-.08 1.64-.67 1.87-1.32.23-.65.23-1.2.16-1.32-.07-.11-.25-.18-.53-.32zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.81-1.32l-.34-.2-3.56.93.95-3.47-.22-.36a9.45 9.45 0 0 1-1.45-5.04 9.48 9.48 0 0 1 9.48-9.48c2.53 0 4.91.99 6.7 2.78a9.42 9.42 0 0 1 2.77 6.7 9.48 9.48 0 0 1-9.51 9.46zm8.22-17.7A11.2 11.2 0 0 0 12.03.5C5.6.5.38 5.72.38 12.15c0 2.05.54 4.05 1.56 5.81L.5 23.5l5.7-1.5a11.14 11.14 0 0 0 5.82 1.49h.01c6.43 0 11.65-5.22 11.65-11.65 0-3.11-1.21-6.04-3.42-8.24z',
  facebook:
    'M22.68 0H1.32A1.32 1.32 0 0 0 0 1.32v21.36A1.32 1.32 0 0 0 1.32 24h11.5v-9.29H9.69v-3.62h3.13V8.41c0-3.1 1.89-4.79 4.66-4.79 1.32 0 2.46.1 2.79.14v3.24h-1.92c-1.5 0-1.79.72-1.79 1.76v2.31h3.58l-.47 3.62h-3.11V24h6.12A1.32 1.32 0 0 0 24 22.68V1.32A1.32 1.32 0 0 0 22.68 0z',
  x: 'M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.22-6.82-5.97 6.82H1.66l7.73-8.84L1.19 2.25h6.83l4.71 6.23 5.51-6.23zm-1.16 17.52h1.83L7.08 4.12H5.11l11.97 15.65z',
  instagram:
    'M12 2.16c3.2 0 3.58.01 4.85.07 3.27.15 4.8 1.7 4.95 4.95.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.24-1.67 4.8-4.95 4.95-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.29-.15-4.8-1.72-4.95-4.95-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.35 3.93 3.87 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zm0-2.16C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.69 21.31.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z',
  linkedin:
    'M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28z',
  telegram:
    'M11.94 2C6.42 2 2 6.42 2 11.94c0 1.9.53 3.67 1.45 5.19L2 22l5.05-1.33a9.9 9.9 0 0 0 4.89 1.27h.01c5.52 0 9.94-4.42 9.94-9.94C21.89 6.42 17.47 2 11.94 2zm5.79 7.08-1.96 9.25c-.15.66-.53.82-1.08.51l-3-2.21-1.45 1.39c-.16.16-.3.3-.61.3l.22-3.07 5.58-5.04c.24-.22-.05-.33-.38-.12l-6.9 4.34-2.97-.93c-.65-.2-.66-.65.13-.96l11.6-4.47c.54-.2 1.01.13.84.91z',
  // Simple Icons (CC0) — marcas oficiais em viewBox 24x24
  threads:
    'M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098c1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015c-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164c1.43 1.783 3.631 2.698 6.54 2.717c2.623-.02 4.358-.631 5.8-2.045c1.647-1.613 1.618-3.593 1.09-4.798c-.31-.71-.873-1.3-1.634-1.75c-.192 1.352-.622 2.446-1.284 3.272c-.886 1.102-2.14 1.704-3.73 1.79c-1.202.065-2.361-.218-3.259-.801c-1.063-.689-1.685-1.74-1.752-2.964c-.065-1.19.408-2.285 1.33-3.082c.88-.76 2.119-1.207 3.583-1.291a14 14 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757c-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32l-1.757-1.18c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388q.163.07.321.142c1.49.7 2.58 1.761 3.154 3.07c.797 1.82.871 4.79-1.548 7.158c-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69q-.362 0-.739.021c-1.836.103-2.98.946-2.916 2.143c.067 1.256 1.452 1.839 2.784 1.767c1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221',
  bluesky:
    'M5.202 2.857C7.954 4.922 10.913 9.11 12 11.358c1.087-2.247 4.046-6.436 6.798-8.501C20.783 1.366 24 .213 24 3.883c0 .732-.42 6.156-.667 7.037-.856 3.061-3.978 3.842-6.755 3.37 4.854.826 6.089 3.562 3.422 6.299-5.065 5.196-7.28-1.304-7.847-2.97-.104-.305-.152-.448-.153-.327 0-.121-.05.022-.153.327-.568 1.666-2.782 8.166-7.847 2.97-2.667-2.737-1.432-5.473 3.422-6.3-2.777.473-5.899-.308-6.755-3.369C.42 10.04 0 4.615 0 3.883c0-3.67 3.217-2.517 5.202-1.026',
  email:
    'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z',
} as const;

/** Garante a URL da campanha uma única vez no texto. */
function withSingleUrl(message: string, url: string): string {
  const trimmed = message.trim();
  if (!url) return trimmed;
  if (trimmed.includes(url)) return trimmed;
  return `${trimmed} ${url}`.trim();
}

/** Texto sem a URL (quando a rede já anexa o link). */
function withoutUrl(message: string, url: string): string {
  return message
    .split(url)
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([:.!?])/g, '$1')
    .trim();
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.left = '-9999px';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

function openExternal(href: string) {
  window.open(href, '_blank', 'noopener,noreferrer');
}

type ShareItem = {
  name: string;
  href: string;
  icon: ReactNode;
  title: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

export function ShareCampaignLinks({ message, url }: Props) {
  const [hint, setHint] = useState('');
  const fullMessage = withSingleUrl(message, url);
  const bodyOnly = withoutUrl(fullMessage, url) || fullMessage;
  const emailSubject = 'Campanha do Núcleo Assistencial Anita Briza';

  async function shareFacebook(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const copied = await copyText(bodyOnly);
    openExternal(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    );
    setHint(
      copied
        ? 'Mensagem copiada. No Facebook, cole no corpo do post (Ctrl+V).'
        : 'Abra o Facebook e cole a mensagem no corpo do post.',
    );
  }

  async function shareInstagram(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const copied = await copyText(fullMessage);
    openExternal('https://www.instagram.com/');
    setHint(
      copied
        ? 'Mensagem copiada. No Instagram, crie o post e cole a legenda (Ctrl+V).'
        : 'Abra o Instagram, crie o post e cole a mensagem na legenda.',
    );
  }

  async function shareLinkedIn(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const copied = await copyText(bodyOnly);
    openExternal(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    );
    setHint(
      copied
        ? 'Mensagem copiada. No LinkedIn, cole no corpo do post (Ctrl+V).'
        : 'Abra o LinkedIn e cole a mensagem no corpo do post.',
    );
  }

  const items: ShareItem[] = [
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(fullMessage)}`,
      icon: <Icon path={ICONS.whatsapp} />,
      title: 'Compartilhar no WhatsApp',
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: <Icon path={ICONS.facebook} />,
      title: 'Copia a mensagem e abre o Facebook',
      onClick: shareFacebook,
    },
    {
      name: 'Twitter / X',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullMessage)}`,
      icon: <Icon path={ICONS.x} />,
      title: 'Compartilhar no Twitter / X',
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/',
      icon: <Icon path={ICONS.instagram} />,
      title: 'Copia a mensagem e abre o Instagram',
      onClick: shareInstagram,
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      icon: <Icon path={ICONS.linkedin} />,
      title: 'Copia a mensagem e abre o LinkedIn',
      onClick: shareLinkedIn,
    },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(bodyOnly)}`,
      icon: <Icon path={ICONS.telegram} />,
      title: 'Compartilhar no Telegram',
    },
    {
      name: 'Threads',
      href: `https://www.threads.net/intent/post?text=${encodeURIComponent(fullMessage)}`,
      icon: <Icon path={ICONS.threads} />,
      title: 'Compartilhar no Threads',
    },
    {
      name: 'Bluesky',
      href: `https://bsky.app/intent/compose?text=${encodeURIComponent(fullMessage)}`,
      icon: <Icon path={ICONS.bluesky} />,
      title: 'Compartilhar no Bluesky',
    },
    {
      name: 'E-mail',
      href: `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(fullMessage)}`,
      icon: <Icon path={ICONS.email} />,
      title: 'Compartilhar por e-mail',
    },
  ];

  return (
    <div className="share-block-actions">
      <div className="share-icons" role="list" aria-label="Compartilhar a campanha">
        {items.map((item) => (
          <a
            key={item.name}
            className="share-icon"
            href={item.href}
            target={item.name === 'E-mail' ? undefined : '_blank'}
            rel={item.name === 'E-mail' ? undefined : 'noreferrer'}
            aria-label={item.title}
            title={item.title}
            role="listitem"
            onClick={item.onClick}
          >
            {item.icon}
            <span className="share-icon-label">{item.name}</span>
          </a>
        ))}
      </div>
      {hint ? (
        <p className="share-hint" role="status">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
