'use client';

import { useRef, useState, type RefObject } from 'react';
import { uploadImageAction } from '@/actions/cms';

type Props = {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
};

export function ContentImageField({ textareaRef }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState('');
  const [pending, setPending] = useState(false);

  async function handleChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    setPending(true);
    setStatus('Enviando imagem…');

    const formData = new FormData();
    formData.set('file', file);

    try {
      const result = await uploadImageAction(formData);
      if (!result.ok || !result.path) {
        setStatus(result.error || 'Falha ao enviar a imagem.');
        return;
      }

      const textarea = textareaRef.current;
      const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
      const markdown = `\n\n![${alt}](${result.path})\n\n`;

      if (textarea) {
        const start = textarea.selectionStart ?? textarea.value.length;
        const end = textarea.selectionEnd ?? start;
        const next =
          textarea.value.slice(0, start) + markdown + textarea.value.slice(end);
        textarea.value = next;
        const cursor = start + markdown.length;
        textarea.focus();
        textarea.setSelectionRange(cursor, cursor);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }

      setStatus(`Imagem inserida: ${result.path}`);
    } catch {
      setStatus('Falha ao enviar a imagem.');
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="content-image-field">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={(e) => handleChange(e.target.files)}
      />
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
      >
        {pending ? 'Enviando…' : 'Inserir imagem'}
      </button>
      <span className="muted">
        PNG, JPG, WEBP ou GIF (máx. 5 MB). Também pode colar{' '}
        <code>![](/uploads/arquivo.jpg)</code> no texto.
      </span>
      {status ? (
        <p className="muted" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
