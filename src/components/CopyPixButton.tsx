'use client';

import { useState } from 'react';

export function CopyPixButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" className="btn btn-secondary btn-sm" onClick={copy} aria-live="polite">
      {copied ? 'Código PIX copiado' : 'Copiar código PIX'}
    </button>
  );
}
