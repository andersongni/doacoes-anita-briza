'use client';

import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import type { Editor } from '@tiptap/react';
import { NodeSelection } from '@tiptap/pm/state';
import { uploadImageAction } from '@/actions/cms';
import {
  ResizableImage,
  type ImageSize,
  type ImageWrap,
} from '@/components/editor/ResizableImage';
import { contentToEditorHtml, sanitizeContentHtml } from '@/lib/rich-content';

type Props = {
  name?: string;
  initialContent?: string;
  label?: string;
  required?: boolean;
};

type ImageDraft = {
  pos: number;
  src: string;
  alt: string;
  size: ImageSize;
  wrap: ImageWrap;
};

const SIZE_OPTIONS: { value: ImageSize; label: string }[] = [
  { value: 'sm', label: 'Pequena' },
  { value: 'md', label: 'Média' },
  { value: 'lg', label: 'Grande' },
  { value: 'full', label: 'Largura da página' },
];

const WRAP_OPTIONS: { value: ImageWrap; label: string; hint: string }[] = [
  {
    value: 'inline',
    label: 'Alinhado ao texto',
    hint: 'A imagem fica na mesma linha do texto',
  },
  {
    value: 'left',
    label: 'Texto à direita',
    hint: 'Imagem à esquerda com texto ao redor',
  },
  {
    value: 'right',
    label: 'Texto à esquerda',
    hint: 'Imagem à direita com texto ao redor',
  },
  {
    value: 'break',
    label: 'Acima e abaixo',
    hint: 'Texto não fica ao lado da imagem',
  },
];

function readSelectedImage(editor: Editor): ImageDraft | null {
  const { selection } = editor.state;
  if (!(selection instanceof NodeSelection) || selection.node.type.name !== 'image') {
    return null;
  }
  const attrs = selection.node.attrs;
  return {
    pos: selection.from,
    src: String(attrs.src || ''),
    alt: String(attrs.alt || ''),
    size: (attrs.size as ImageSize) || 'md',
    wrap: (attrs.wrap as ImageWrap) || 'break',
  };
}

function selectImageAt(editor: Editor, pos: number) {
  const node = editor.state.doc.nodeAt(pos);
  if (!node || node.type.name !== 'image') return false;
  editor.view.dispatch(
    editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, pos)),
  );
  return true;
}

export function RichContentEditor({
  name = 'content',
  initialContent = '',
  label = 'Conteúdo',
  required = true,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const imagePanelRef = useRef<HTMLDivElement>(null);
  const selectedPosRef = useRef<number | null>(null);
  const [html, setHtml] = useState(() =>
    sanitizeContentHtml(contentToEditorHtml(initialContent)),
  );
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageDraft, setImageDraft] = useState<ImageDraft | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder:
          'Escreva aqui como no Word. Use o menu para inserir imagens e clique nelas para ajustar.',
      }),
      ResizableImage.configure({
        inline: true,
        allowBase64: false,
      }),
    ],
    content: contentToEditorHtml(initialContent),
    editorProps: {
      attributes: {
        class: 'rich-editor-surface',
        'aria-label': label,
      },
      handleClickOn(_view, pos, node) {
        if (node.type.name === 'image') {
          selectedPosRef.current = pos;
        }
        return false;
      },
    },
    onUpdate: ({ editor: current }) => {
      setHtml(sanitizeContentHtml(current.getHTML()));
    },
  });

  useEffect(() => {
    if (!editor) return;

    const syncFromSelection = () => {
      const selected = readSelectedImage(editor);
      if (selected) {
        selectedPosRef.current = selected.pos;
        setImageDraft(selected);
        return;
      }

      // Mantém o painel aberto se o foco estiver no menu da imagem
      // (ex.: digitando o texto alternativo).
      const active = document.activeElement;
      if (active && imagePanelRef.current?.contains(active)) {
        return;
      }

      selectedPosRef.current = null;
      setImageDraft(null);
    };

    editor.on('selectionUpdate', syncFromSelection);
    editor.on('transaction', syncFromSelection);
    return () => {
      editor.off('selectionUpdate', syncFromSelection);
      editor.off('transaction', syncFromSelection);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const next = contentToEditorHtml(initialContent);
    editor.commands.setContent(next, { emitUpdate: false });
    setHtml(sanitizeContentHtml(next));
    setImageDraft(null);
    selectedPosRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContent, editor]);

  function applyImageAttrs(patch: Partial<Omit<ImageDraft, 'pos' | 'src'>>) {
    if (!editor || selectedPosRef.current == null) return;
    const pos = selectedPosRef.current;

    // Atualiza o nó pela posição, sem focar o editor (senão o input de alt perde o foco).
    const ok = editor.commands.command(({ tr, dispatch }) => {
      const node = tr.doc.nodeAt(pos);
      if (!node || node.type.name !== 'image') return false;
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...patch });
      if (dispatch) dispatch(tr);
      return true;
    });

    if (!ok) return;
    setImageDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  function removeSelectedImage() {
    if (!editor || selectedPosRef.current == null) return;
    const pos = selectedPosRef.current;
    if (!selectImageAt(editor, pos)) return;
    editor.chain().deleteSelection().run();
    selectedPosRef.current = null;
    setImageDraft(null);
    setStatus('Imagem removida.');
  }

  async function onPickImage(files: FileList | null) {
    const file = files?.[0];
    if (!file || !editor) return;
    setUploading(true);
    setStatus('Enviando imagem…');
    try {
      const formData = new FormData();
      formData.set('file', file);
      const result = await uploadImageAction(formData);
      if (!result.ok || !result.path) {
        setStatus(result.error || 'Falha ao enviar a imagem.');
        return;
      }
      const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
      editor
        .chain()
        .focus()
        .setImage({
          src: result.path,
          alt: alt || 'Imagem',
        })
        .updateAttributes('image', { size: 'md', wrap: 'break' })
        .run();

      const selected = readSelectedImage(editor);
      if (selected) {
        selectedPosRef.current = selected.pos;
        setImageDraft(selected);
      }
      setStatus('Imagem inserida. Use o painel abaixo para ajustar sem perder o menu.');
    } catch {
      setStatus('Falha ao enviar a imagem.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="rich-editor form-row">
      <span className="rich-editor-label">{label}</span>

      <div className="rich-editor-toolbar" role="toolbar" aria-label="Formatação">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          aria-pressed={editor?.isActive('bold') ?? false}
        >
          Negrito
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          aria-pressed={editor?.isActive('italic') ?? false}
        >
          Itálico
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          aria-pressed={editor?.isActive('bulletList') ?? false}
        >
          Lista
        </button>
        <span className="rich-editor-toolbar-sep" aria-hidden="true" />
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={!editor || uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? 'Enviando…' : 'Inserir imagem'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          hidden
          onChange={(e) => void onPickImage(e.target.files)}
        />
      </div>

      <p className="muted rich-editor-help">
        Clique na imagem para abrir o painel de opções (tamanho e texto em volta).
        O painel permanece aberto enquanto você edita o texto alternativo.
      </p>

      {imageDraft ? (
        <div
          ref={imagePanelRef}
          className="rich-image-panel"
          role="region"
          aria-label="Opções da imagem selecionada"
          onMouseDown={(e) => {
            // Evita que cliques nos botões limpem a seleção da imagem.
            if ((e.target as HTMLElement).tagName !== 'INPUT') {
              e.preventDefault();
            }
          }}
        >
          <div className="rich-image-panel-preview" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageDraft.src} alt="" />
          </div>

          <div className="rich-image-menu-group" role="group" aria-label="Tamanho da imagem">
            <span className="rich-image-menu-label">Tamanho</span>
            {SIZE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`btn btn-sm ${
                  imageDraft.size === opt.value ? 'btn-secondary' : 'btn-ghost'
                }`}
                onClick={() => applyImageAttrs({ size: opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div
            className="rich-image-menu-group"
            role="group"
            aria-label="Texto em volta da imagem"
          >
            <span className="rich-image-menu-label">Texto em volta</span>
            {WRAP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                title={opt.hint}
                className={`btn btn-sm ${
                  imageDraft.wrap === opt.value ? 'btn-secondary' : 'btn-ghost'
                }`}
                onClick={() => applyImageAttrs({ wrap: opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="rich-image-menu-group rich-image-menu-alt">
            <label className="rich-image-menu-label" htmlFor="rich-image-alt">
              Texto alternativo
            </label>
            <input
              id="rich-image-alt"
              className="rich-image-alt"
              type="text"
              value={imageDraft.alt}
              onChange={(e) => applyImageAttrs({ alt: e.target.value })}
              placeholder="Descrição da imagem"
            />
          </div>

          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={removeSelectedImage}
          >
            Remover imagem
          </button>
        </div>
      ) : null}

      <div className="rich-editor-canvas">
        <EditorContent editor={editor} />
      </div>

      <input
        type="hidden"
        name={name}
        value={html}
        required={required}
        minLength={required ? 3 : undefined}
      />

      {status ? (
        <p className="muted" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
