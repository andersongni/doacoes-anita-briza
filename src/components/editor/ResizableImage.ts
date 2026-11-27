import Image from '@tiptap/extension-image';
import { mergeAttributes, type CommandProps } from '@tiptap/core';

export type ImageWrap = 'inline' | 'left' | 'right' | 'break';
export type ImageSize = 'sm' | 'md' | 'lg' | 'full';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImageAttrs: {
      setImageWrap: (wrap: ImageWrap) => ReturnType;
      setImageSize: (size: ImageSize) => ReturnType;
    };
  }
}

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      size: {
        default: 'md',
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-size') || 'md',
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-size': attributes.size,
        }),
      },
      wrap: {
        default: 'break',
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-wrap') || 'break',
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-wrap': attributes.wrap,
        }),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const size = (HTMLAttributes['data-size'] as string) || 'md';
    const wrap = (HTMLAttributes['data-wrap'] as string) || 'break';
    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: `editor-image editor-image--${size} editor-image--wrap-${wrap}`,
        loading: 'lazy',
      }),
    ];
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImageWrap:
        (wrap: ImageWrap) =>
        ({ commands }: CommandProps) =>
          commands.updateAttributes(this.name, { wrap }),
      setImageSize:
        (size: ImageSize) =>
        ({ commands }: CommandProps) =>
          commands.updateAttributes(this.name, { size }),
    };
  },
});
