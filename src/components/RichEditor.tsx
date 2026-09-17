import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { Mention } from '@tiptap/extension-mention';
import { Extension, Node as TiptapNode, mergeAttributes } from '@tiptap/core';
import { trpc } from '@/providers/trpc';
import { GOOGLE_FONTS, injectCustomFonts } from '../fonts';
import { SlashCommands } from './editor/slash';
import { suggestionRender } from './editor/suggestions';
import type { MenuEntry } from './editor/suggestions';
import {
  Timeline,
  TimelineEntry,
  FactBox,
  FactRow,
  PlaceCard,
  Gallery,
  VideoEmbed,
  normalizeVideoUrl,
} from './editor/blocks';
import MediaDialog from './editor/MediaDialog';
import { registerMediaPicker } from './editor/mediaPicker';
import type { MediaSelection } from './editor/mediaPicker';

/* ======================================================== toolbar buttons */

const btn = (active: boolean) =>
  `flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg px-1.5 text-[0.82rem] transition-colors ${
    active ? 'bg-[#b98a4a]/15 text-[#8a6224]' : 'text-[#7a6a50] hover:bg-[#f1e8d4] hover:text-[#2c2418]'
  }`;

function Bar() {
  return <div className="mx-1.5 h-5 w-px shrink-0 bg-[#e3d5b8]" />;
}

/* Tooltip with keyboard shortcut */
function Tip({ label, keys, children }: { label: string; keys?: string; children: React.ReactNode }) {
  return (
    <span className="group/tip relative inline-flex shrink-0">
      {children}
      <span className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#2c2418] px-2 py-1 text-[0.66rem] leading-tight text-[#f4ead6] opacity-0 shadow-md transition-opacity delay-500 group-hover/tip:opacity-100">
        {label}
        {keys && <span className="ml-1.5 text-[#b8a888]">{keys}</span>}
      </span>
    </span>
  );
}

/* ================================================= design-token palettes */

const TEXT_COLORS: { name: string; value: string }[] = [
  { name: 'Ink', value: '#2c2418' },
  { name: 'Soft brown', value: '#7a6a50' },
  { name: 'Faded', value: '#a08b66' },
  { name: 'Bronze', value: '#8a6224' },
  { name: 'Ochre', value: '#b07f3c' },
  { name: 'Terracotta', value: '#c05f4e' },
  { name: 'River blue', value: '#3d5a80' },
  { name: 'Palm green', value: '#3e7d5a' },
];

const HIGHLIGHTS: { name: string; value: string }[] = [
  { name: 'Parchment', value: '#f3e5bf' },
  { name: 'Gold', value: '#f5d78a' },
  { name: 'Rose', value: '#f4cfc4' },
  { name: 'River', value: '#cfe0ee' },
  { name: 'Palm', value: '#cfe5d6' },
];

const LINE_SPACINGS = [
  { label: 'Compact (1.4)', value: '1.4' },
  { label: 'Normal (1.85)', value: '1.85' },
  { label: 'Relaxed (2.1)', value: '2.1' },
  { label: 'Double (2.6)', value: '2.6' },
];

const FONT_SIZES = [
  { label: 'Small', value: '0.85rem' },
  { label: 'Compact', value: '0.95rem' },
  { label: 'Large', value: '1.15rem' },
  { label: 'Extra large', value: '1.35rem' },
  { label: 'Display', value: '1.6rem' },
];

const normFont = (s: string | undefined | null) => (s ?? '').replace(/["']/g, '');

/* ===================================================== custom extensions */

/** Paragraph/heading line-height via a style attribute (document attr, not a fake). */
const LineHeight = Extension.create({
  name: 'lineHeight',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (el) => (el as HTMLElement).style.lineHeight || null,
            renderHTML: (attrs) =>
              attrs.lineHeight ? { style: `line-height: ${attrs.lineHeight}` } : {},
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLineHeight:
        (value: string) =>
        ({ commands }: { commands: any }) =>
          commands.updateAttributes('paragraph', { lineHeight: value }) ||
          commands.updateAttributes('heading', { lineHeight: value }),
      unsetLineHeight:
        () =>
        ({ commands }: { commands: any }) =>
          commands.resetAttributes('paragraph', 'lineHeight') ||
          commands.resetAttributes('heading', 'lineHeight'),
    } as any;
  },
});

/** Font family + font size carried on the textStyle mark (coexists with Color). */
const FontStyle = Extension.create({
  name: 'fontStyle',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: (el) => normFont((el as HTMLElement).style.fontFamily) || null,
            renderHTML: (attrs) =>
              attrs.fontFamily ? { style: `font-family: ${attrs.fontFamily}` } : {},
          },
          fontSize: {
            default: null,
            parseHTML: (el) => (el as HTMLElement).style.fontSize || null,
            renderHTML: (attrs) =>
              attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
          },
        },
      },
    ];
  },
});

/** Callout block: info / note / warning / editorial */
const Callout = TiptapNode.create({
  name: 'callout',
  group: 'block',
  content: '(paragraph|heading)+',
  defining: true,
  addAttributes() {
    return { kind: { default: 'info' } };
  },
  parseHTML() {
    return [{ tag: 'div[data-callout]', getAttrs: (el) => ({ kind: (el as HTMLElement).dataset.callout ?? 'info' }) }];
  },
  renderHTML({ node, HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-callout': node.attrs.kind, class: `callout callout-${node.attrs.kind}` }), 0];
  },
  addCommands() {
    return {
      setCallout:
        (kind: string) =>
        ({ commands }: { commands: any }) =>
          commands.wrapIn('callout', { kind }) /* wrap selection */ ||
          commands.insertContent({ type: 'callout', attrs: { kind }, content: [{ type: 'paragraph' }] }),
    } as any;
  },
});

/** Pull quote: big literary quote with attribution */
const PullQuote = TiptapNode.create({
  name: 'pullQuote',
  group: 'block',
  content: '(paragraph|heading)+',
  defining: true,
  addAttributes() {
    return { cite: { default: '' } };
  },
  parseHTML() {
    return [{ tag: 'aside[data-pullquote]', getAttrs: (el) => ({ cite: (el as HTMLElement).dataset.cite ?? '' }) }];
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      'aside',
      mergeAttributes(HTMLAttributes, { 'data-pullquote': 'true', 'data-cite': node.attrs.cite, class: 'pullquote' }),
      0,
    ];
  },
  addCommands() {
    return {
      setPullQuote:
        () =>
        ({ commands }: { commands: any }) =>
          commands.insertContent({ type: 'pullQuote', attrs: { cite: '' }, content: [{ type: 'paragraph' }] }),
    } as any;
  },
});

/** Image upgraded to a figure with caption + credit (rights metadata). */
const CaptionedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: { default: '' },
      credit: { default: '' },
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    const img: [string, Record<string, unknown>] = [
      'img',
      mergeAttributes(HTMLAttributes, { src: node.attrs.src, alt: node.attrs.alt ?? '' }),
    ];
    const cap = (node.attrs.caption as string) || '';
    const credit = (node.attrs.credit as string) || '';
    const figChildren: unknown[] = [img];
    if (cap || credit) {
      const capChildren: unknown[] = [];
      if (cap) capChildren.push(cap);
      if (credit) capChildren.push(['span', { class: 'fig-credit' }, credit]);
      figChildren.push(['figcaption', {}, ...capChildren]);
    }
    return ['figure', { class: 'rte-figure' }, ...figChildren] as never;
  },
  parseHTML() {
    const readFigure = (figure: HTMLElement) => {
      const img = figure.querySelector('img');
      if (!img) return false;
      const captionEl = figure.querySelector('figcaption');
      const credit = captionEl?.querySelector('.fig-credit')?.textContent ?? '';
      let caption = '';
      if (captionEl) {
        for (const child of Array.from(captionEl.childNodes)) {
          if (child.nodeType === Node.TEXT_NODE) caption += child.textContent ?? '';
        }
        caption = caption.trim();
      }
      return { src: img.getAttribute('src'), alt: img.getAttribute('alt') ?? '', caption, credit };
    };
    return [
      // match the whole figure so its figcaption is consumed, never re-parsed as a paragraph
      { tag: 'figure.rte-figure', getAttrs: (el) => readFigure(el as HTMLElement) },
      {
        tag: 'figure img[src]',
        getAttrs: (el) => {
          const figure = (el as HTMLElement).closest('figure');
          if (!figure) return { src: (el as HTMLElement).getAttribute('src') };
          return readFigure(figure as HTMLElement);
        },
      },
      { tag: 'img[src]' },
    ];
  },
});

/** Inline place mention: @chip linking to the place page. */
const PlaceMention = Mention.extend({
  // mentions are self-contained chips — never let link/other marks attach to
  // them, or a save/reload round-trip degrades the chip into a plain link
  marks: '',
  parseHTML() {
    return [
      {
        tag: 'a[data-place-mention]',
        getAttrs: (el) => ({
          id: (el as HTMLElement).getAttribute('data-place-mention'),
          label: (el as HTMLElement).textContent,
        }),
      },
    ];
  },
});

/** Link mark that never claims our place-mention chips. */
const SafeLink = Link.extend({
  parseHTML() {
    return [
      {
        tag: 'a[href]:not([data-place-mention]):not(.place-mention)',
        getAttrs: (el) => ((el as HTMLElement).getAttribute('href') ? null : false),
      },
    ];
  },
});

/* ============================================== paste sanitizer extension */

const ALLOWED_TAGS = new Set([
  'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'UL', 'OL', 'LI',
  'STRONG', 'B', 'EM', 'I', 'U', 'S', 'DEL', 'MARK', 'CODE', 'PRE',
  'A', 'IMG', 'BR', 'HR', 'FIGURE', 'FIGCAPTION', 'DIV', 'ASIDE', 'SPAN',
  'TABLE', 'THEAD', 'TBODY', 'TR', 'TD', 'TH', 'COLGROUP', 'COL',
]);

const DATA_ATTRS = new Set([
  'data-callout', 'data-pullquote', 'data-cite',
  'data-place-mention', 'data-place-card', 'data-place-id',
  'data-timeline', 'data-tentry', 'data-year',
  'data-factbox', 'data-factrow', 'data-label',
  'data-gallery', 'data-images',
  'data-video', 'data-video-embed',
]);

const VIDEO_HOSTS = ['www.youtube-nocookie.com', 'youtube-nocookie.com', 'www.youtube.com', 'player.vimeo.com'];

function sanitizeFragment(root: ParentNode) {
  const walk = (node: Element | ChildNode) => {
    if (node.nodeType === Node.TEXT_NODE) return;
    if (node.nodeType !== Node.ELEMENT_NODE) {
      node.parentNode?.removeChild(node);
      return;
    }
    const el = node as Element;
    if (['SCRIPT', 'STYLE', 'OBJECT', 'EMBED', 'FORM', 'INPUT', 'BUTTON'].includes(el.tagName)) {
      el.remove();
      return;
    }
    if (el.tagName === 'IFRAME') {
      // keep only our own video embeds from allowlisted hosts
      const src = el.getAttribute('src') ?? '';
      let ok = el.hasAttribute('data-video');
      try {
        ok = ok && VIDEO_HOSTS.includes(new URL(src).hostname);
      } catch {
        ok = false;
      }
      if (!ok) {
        el.remove();
        return;
      }
      for (const attr of Array.from(el.attributes)) {
        if (!['src', 'data-video', 'allowfullscreen', 'loading', 'frameborder', 'referrerpolicy'].includes(attr.name))
          el.removeAttribute(attr.name);
      }
      return;
    }
    const kids = Array.from(el.childNodes);
    if (!ALLOWED_TAGS.has(el.tagName)) {
      const parent = el.parentNode;
      if (parent) {
        for (const k of kids) parent.insertBefore(k, el);
        parent.removeChild(el);
        for (const k of kids) walk(k);
      }
      return;
    }
    for (const attr of Array.from(el.attributes)) {
      const keep =
        (el.tagName === 'A' && ['href', 'target', 'rel'].includes(attr.name)) ||
        (el.tagName === 'IMG' && ['src', 'alt'].includes(attr.name)) ||
        DATA_ATTRS.has(attr.name) ||
        (attr.name === 'class' && ['place-card-kicker', 'place-card-name', 'place-card-cta', 'fig-credit', 'tentry', 'factrow', 'timeline', 'factbox', 'gallery', 'place-card', 'video-embed', 'rte-figure'].includes(attr.value)) ||
        (attr.name === 'style' && ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'MARK'].includes(el.tagName));
      if (!keep) el.removeAttribute(attr.name);
    }
    if (el.tagName === 'A') {
      const href = el.getAttribute('href') ?? '';
      if (/^\s*javascript:/i.test(href)) el.removeAttribute('href');
    }
    if (el.tagName === 'IMG') {
      const src = el.getAttribute('src') ?? '';
      if (!src || /^\s*javascript:/i.test(src)) el.remove();
      return;
    }
    for (const k of Array.from(el.childNodes)) walk(k);
  };
  for (const k of Array.from(root.childNodes)) walk(k);
}

const CleanPaste = Extension.create({
  name: 'cleanPaste',
  editorProps: {
    transformPastedHTML(html: string) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      sanitizeFragment(doc.body);
      return doc.body.innerHTML;
    },
  },
});

/* ================================================================ helpers */

export const editorStats = (e: Editor) => {
  const text = e.getText();
  const words = (text.match(/\S+/g) ?? []).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return { words, chars: text.length, minutes };
};

interface SlashEntry extends MenuEntry {
  run: (editor: Editor, range: { from: number; to: number }) => void;
}

/**
 * Insert a block node at the cursor — but never inside a table cell (the cell
 * schema only allows paragraphs, and TipTap would teleport the block to the
 * document end). When the cursor is in a table, the block lands after it.
 */
// Blocks can only live at the top level of the document. If the cursor sits
// inside a container that only accepts paragraphs (table cell, factbox row,
// timeline entry, callout…), insert AFTER the outermost such container
// instead of letting TipTap drop or mangle the block.
const BLOCK_CONTAINERS = new Set([
  'table', 'tableRow', 'tableHeader', 'tableCell',
  'factbox', 'factrow', 'timeline', 'tentry',
  'callout', 'pullQuote', 'blockquote',
]);
const insertBlock = (editor: Editor, content: any) => {
  const { $from } = editor.state.selection;
  let after: number | null = null;
  for (let d = 1; d <= $from.depth; d++) {
    if (BLOCK_CONTAINERS.has($from.node(d).type.name)) {
      after = $from.after(d);
      break; // outermost container wins
    }
  }
  if (after != null) {
    return editor.chain().focus().insertContentAt(after, content).run();
  }
  return editor.chain().focus().insertContent(content).run();
};

/* ============================================================ the editor */

export default function RichEditor({
  html,
  onChange,
  placeholder,
  minHeight = 420,
  onEditor,
}: {
  html: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  onEditor?: (e: Editor | null) => void;
}) {
  /* ------- media dialog state (registered for gallery/image node views) --- */
  const [mediaOpen, setMediaOpen] = useState(false);
  const mediaCbRef = useRef<((sel: MediaSelection) => void) | null>(null);
  const [mediaInitial, setMediaInitial] = useState<Partial<MediaSelection> | undefined>(undefined);

  const openMedia = useCallback((cb: (sel: MediaSelection) => void, initial?: Partial<MediaSelection>) => {
    mediaCbRef.current = cb;
    setMediaInitial(initial);
    setMediaOpen(true);
  }, []);

  useEffect(() => {
    registerMediaPicker(openMedia);
  }, [openMedia]);

  /* ------------------------------ places (for @mentions + place cards) ---- */
  const placesQ = trpc.content.places.useQuery();
  const placesRef = useRef<{ id: string; name: string; region: string }[]>([]);
  placesRef.current = (placesQ.data ?? []) as { id: string; name: string; region: string }[];

  /* ------------------------------------------------------- slash entries -- */
  const slashEntries = useMemo<SlashEntry[]>(() => {
    const ins = (editor: Editor, range: { from: number; to: number }, content: any) => {
      editor.chain().focus().deleteRange(range).run();
      insertBlock(editor, content);
    };
    return [
      { title: 'Heading 2', hint: 'Section heading', icon: 'H2', run: (e, r) => e.chain().focus().deleteRange(r).setNode('heading', { level: 2 }).run() },
      { title: 'Heading 3', hint: 'Sub-section heading', icon: 'H3', run: (e, r) => e.chain().focus().deleteRange(r).setNode('heading', { level: 3 }).run() },
      {
        title: 'Image', hint: 'From the media library', icon: '🖼',
        run: (e, r) => {
          e.chain().focus().deleteRange(r).run();
          openMedia((sel) => insertBlock(e, { type: 'image', attrs: { src: sel.src, alt: sel.alt, caption: sel.caption, credit: sel.credit } }));
        },
      },
      { title: 'Gallery', hint: 'Grid of images', icon: '▦', run: (e, r) => ins(e, r, { type: 'gallery', attrs: { images: '[]' } }) },
      {
        title: 'Video embed', hint: 'YouTube or Vimeo', icon: '▶',
        run: (e, r) => {
          e.chain().focus().deleteRange(r).run();
          const url = window.prompt('Paste a YouTube or Vimeo URL');
          if (!url) return;
          const src = normalizeVideoUrl(url);
          if (!src) window.alert('That does not look like a YouTube or Vimeo link.');
          else insertBlock(e, { type: 'videoEmbed', attrs: { src } });
        },
      },
      {
        title: 'Timeline', hint: 'Year-by-year chronology', icon: '⟶',
        run: (e, r) =>
          ins(e, r, {
            type: 'timeline',
            content: [
              { type: 'timelineEntry', attrs: { year: '' }, content: [{ type: 'paragraph' }] },
              { type: 'timelineEntry', attrs: { year: '' }, content: [{ type: 'paragraph' }] },
            ],
          }),
      },
      {
        title: 'Fact box', hint: 'Key facts panel', icon: '☰',
        run: (e, r) =>
          ins(e, r, {
            type: 'factBox',
            content: [
              { type: 'factRow', attrs: { label: '' }, content: [{ type: 'paragraph' }] },
              { type: 'factRow', attrs: { label: '' }, content: [{ type: 'paragraph' }] },
              { type: 'factRow', attrs: { label: '' }, content: [{ type: 'paragraph' }] },
            ],
          }),
      },
      { title: 'Place card', hint: 'Feature a place from the atlas', icon: '📍', run: (e, r) => ins(e, r, { type: 'placeCard', attrs: { pid: '', name: '' } }) },
      { title: 'Table', hint: '3 × 3 table with header', icon: '⊞', run: (e, r) => e.chain().focus().deleteRange(r).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
      { title: 'Quote', hint: 'Block quotation', icon: '❝', run: (e, r) => e.chain().focus().deleteRange(r).setParagraph().wrapIn('blockquote').run() },
      { title: 'Pull quote', hint: 'Large literary quote', icon: '❞', run: (e, r) => ins(e, r, { type: 'pullQuote', attrs: { cite: '' }, content: [{ type: 'paragraph' }] }) },
      { title: 'Callout — Information', hint: 'Blue info panel', icon: 'ℹ', run: (e, r) => ins(e, r, { type: 'callout', attrs: { kind: 'info' }, content: [{ type: 'paragraph' }] }) },
      { title: 'Callout — Note', hint: 'Parchment note panel', icon: '✎', run: (e, r) => ins(e, r, { type: 'callout', attrs: { kind: 'note' }, content: [{ type: 'paragraph' }] }) },
      { title: 'Callout — Warning', hint: 'Rose warning panel', icon: '⚠', run: (e, r) => ins(e, r, { type: 'callout', attrs: { kind: 'warning' }, content: [{ type: 'paragraph' }] }) },
      { title: 'Callout — Editorial', hint: 'Italic editorial note', icon: '✦', run: (e, r) => ins(e, r, { type: 'callout', attrs: { kind: 'editorial' }, content: [{ type: 'paragraph' }] }) },
      { title: 'Divider', hint: 'Horizontal rule', icon: '―', run: (e, r) => e.chain().focus().deleteRange(r).setHorizontalRule().run() },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openMedia]);

  /* -------------------------------------------------------------- editor -- */

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Underline,
      TextStyle,
      Color,
      FontStyle,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      LineHeight,
      SafeLink.configure({ openOnClick: false, autolink: true }),
      CaptionedImage,
      Placeholder.configure({ placeholder: placeholder ?? 'Write… — type / for blocks, @ for places' }),
      Callout,
      PullQuote,
      Timeline,
      TimelineEntry,
      FactBox,
      FactRow,
      PlaceCard,
      Gallery,
      VideoEmbed,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      PlaceMention.configure({
        HTMLAttributes: { class: 'place-mention' },
        renderHTML({ node }: { node: any }) {
          return [
            'a',
            {
              href: `/place/${node.attrs.id}`,
              'data-place-mention': node.attrs.id,
              class: 'place-mention',
            },
            `@${node.attrs.label ?? node.attrs.id}`,
          ] as never;
        },
        suggestion: {
          char: '@',
          allowSpaces: false,
          items: ({ query }: { query: string }) =>
            placesRef.current
              .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.region.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 8)
              .map((p) => ({ id: p.id, label: p.name, title: p.name, hint: p.region, icon: '📍' })),
          render: suggestionRender<any>((item, props) => {
            props.editor
              .chain()
              .focus()
              .insertContentAt(props.range, [
                { type: 'mention', attrs: { id: item.id, label: item.label } },
                { type: 'text', text: ' ' },
              ])
              .run();
          }),
        } as never,
      }),
      SlashCommands.configure({
        suggestion: {
          char: '/',
          startOfLine: true,
          items: ({ query }: { query: string }) =>
            slashEntries.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()) || (i.hint ?? '').toLowerCase().includes(query.toLowerCase())),
          render: suggestionRender<SlashEntry>((item, props) => item.run(props.editor, props.range)),
        } as never,
      }),
      CleanPaste,
    ],
    content: html,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      handleClickOn: (_view, _pos, _node, nodePos, event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'IMG' && target.closest('figure')) {
          const attrs = _node.attrs as { src?: string; alt?: string; caption?: string; credit?: string };
          openMedia(
            (sel) => editor?.commands.command(({ tr }) => {
              tr.setNodeMarkup(nodePos, undefined, { ..._node.attrs, src: sel.src, alt: sel.alt, caption: sel.caption, credit: sel.credit });
              return true;
            }),
            { src: attrs.src ?? '', alt: attrs.alt ?? '', caption: attrs.caption ?? '', credit: attrs.credit ?? '' }
          );
          return true;
        }
        return false;
      },
    },
  });

  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkNewTab, setLinkNewTab] = useState(true);
  const [linkNofollow, setLinkNofollow] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const fontFileRef = useRef<HTMLInputElement>(null);
  const [tick, setTick] = useState(0);

  const utils = trpc.useUtils();
  const fontsQ = trpc.content.fontsList.useQuery();
  const uploadFont = trpc.content.uploadFont.useMutation();

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    const attrs = editor.getAttributes('link');
    setLinkUrl((attrs.href as string | undefined) ?? '');
    setLinkNewTab(attrs.target !== '_self');
    setLinkNofollow(((attrs.rel as string | undefined) ?? '').includes('nofollow'));
    setLinkOpen(true);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openLinkDialog();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [editor, openLinkDialog]);

  useEffect(() => {
    onEditor?.(editor);
    return () => onEditor?.(null);
  }, [editor, onEditor]);

  useEffect(() => {
    if (!editor) return;
    const rerender = () => setTick((t) => t + 1);
    editor.on('transaction', rerender);
    return () => { editor.off('transaction', rerender); };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    if (html !== editor.getHTML()) editor.commands.setContent(html);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html === '' ? html : null, editor]);

  useEffect(() => {
    if (linkOpen) setTimeout(() => linkInputRef.current?.focus(), 30);
  }, [linkOpen]);

  if (!editor) return null;
  void tick;

  /* ---------------------------------------------------------- link dialog */

  const applyLink = () => {
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({
          href,
          target: linkNewTab ? '_blank' : '_self',
          rel: `${linkNewTab ? 'noopener noreferrer' : ''}${linkNofollow ? ' nofollow' : ''}`.trim() || null,
        })
        .run();
    }
    setLinkOpen(false);
  };

  const addImage = () => {
    openMedia((sel) =>
      insertBlock(editor, { type: 'image', attrs: { src: sel.src, alt: sel.alt, caption: sel.caption, credit: sel.credit } })
    );
  };

  const addVideo = () => {
    const url = window.prompt('Paste a YouTube or Vimeo URL');
    if (!url) return;
    const src = normalizeVideoUrl(url);
    if (!src) {
      window.alert('That does not look like a YouTube or Vimeo link.');
      return;
    }
    insertBlock(editor, { type: 'videoEmbed', attrs: { src } });
  };

  /* -------------------------------------------------------- fonts & sizes */

  /** Set/clear textStyle attrs without wiping color or other attrs. */
  const applyTextStyle = (attrs: Record<string, string | null>) => {
    const chain = editor.chain().focus().setMark('textStyle', attrs) as any;
    if (typeof chain.removeEmptyTextStyle === 'function') chain.removeEmptyTextStyle();
    chain.run();
  };

  const onFontFile = (f: File | undefined) => {
    if (!f) return;
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    const mime = ({ woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf', otf: 'font/otf' } as Record<string, string>)[ext];
    if (!mime) {
      window.alert('Use a .woff2, .woff, .ttf or .otf font file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const data = dataUrl.slice(dataUrl.indexOf(',') + 1);
      const name = f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
      uploadFont.mutate(
        { name, fileName: f.name, mime, data },
        {
          onSuccess: async () => {
            await utils.content.fontsList.invalidate();
            const list = await utils.content.fontsList.fetch();
            injectCustomFonts(list); // @font-face available instantly, no reload needed
            const fam = name.replace(/[^a-zA-Z0-9 -]/g, '').trim() || name;
            applyTextStyle({ fontFamily: fam });
          },
          onError: (err) => window.alert(`Font upload failed: ${err.message}`),
        }
      );
    };
    reader.readAsDataURL(f);
  };

  /* --------------------------------------------------------- derived state */

  const $from = editor.state.selection.$from;
  const block = $from.parent.type.name;
  const align = (['left', 'center', 'right', 'justify'] as const).find((a) => editor.isActive({ textAlign: a })) ?? 'left';
  const currentColor = (editor.getAttributes('textStyle').color as string | undefined) ?? '';
  const currentHighlight = (editor.getAttributes('highlight').color as string | undefined) ?? '';
  const currentLineHeight = ($from.parent.attrs.lineHeight as string | undefined) || '';
  const currentFont = normFont(editor.getAttributes('textStyle').fontFamily as string | undefined);
  const currentSize = (editor.getAttributes('textStyle').fontSize as string | undefined) ?? '';
  const customFonts = fontsQ.data ?? [];
  const inTable = editor.isActive('table');

  const styleValue =
    editor.isActive('blockquote') ? 'quote' :
    editor.isActive('codeBlock') ? 'code' :
    editor.isActive('heading', { level: 1 }) ? 'h1' :
    editor.isActive('heading', { level: 2 }) ? 'h2' :
    editor.isActive('heading', { level: 3 }) ? 'h3' :
    editor.isActive('heading', { level: 4 }) ? 'h4' : 'p';

  const setStyle = (v: string) => {
    const c = editor.chain().focus();
    if (v === 'p') c.setParagraph().run();
    else if (v === 'quote') editor.chain().focus().setParagraph().toggleBlockquote().run();
    else if (v === 'code') c.toggleCodeBlock().run();
    else c.toggleHeading({ level: Number(v.slice(1)) as 1 | 2 | 3 | 4 }).run();
  };

  const selectCls =
    'h-8 shrink-0 rounded-lg border border-transparent bg-transparent px-1.5 text-[0.78rem] text-[#7a6a50] outline-none transition-colors hover:bg-[#f1e8d4] hover:text-[#2c2418] focus:border-[#b98a4a]';

  return (
    <div className="rounded-xl border border-[#ddcdab] bg-white focus-within:border-[#b98a4a]">
      {/* toolbar — grouped by function: style · font · marks · color · paragraph · insert · history */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-x-0.5 gap-y-1 rounded-t-xl border-b border-[#eee2ca] bg-[#fdfaf3] px-2.5 py-2">
        {/* 1 — block style */}
        <Tip label="Text style">
          <select
            aria-label="Text style"
            value={styleValue}
            onChange={(e) => setStyle(e.target.value)}
            className={selectCls + ' w-[104px] font-medium text-[#2c2418]'}
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="quote">Quote</option>
            <option value="code">Code block</option>
          </select>
        </Tip>
        <Bar />
        {/* 2 — font family + size */}
        <Tip label="Font family">
          <select
            aria-label="Font family"
            value={currentFont}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '__upload__') {
                fontFileRef.current?.click();
                e.target.value = currentFont;
                return;
              }
              applyTextStyle({ fontFamily: v || null });
            }}
            className={selectCls + ' max-w-[138px]'}
          >
            <option value="">Theme font</option>
            <optgroup label="Editorial fonts">
              {GOOGLE_FONTS.map((f) => (
                <option key={f.name} value={normFont(f.family)} style={{ fontFamily: f.family }}>
                  {f.name}
                </option>
              ))}
            </optgroup>
            {customFonts.length > 0 && (
              <optgroup label="Uploaded fonts">
                {customFonts.map((f) => (
                  <option key={f.id} value={f.family} style={{ fontFamily: f.family }}>
                    {f.name}
                  </option>
                ))}
              </optgroup>
            )}
            <optgroup label="·">
              <option value="__upload__">⇪ Upload a font…</option>
            </optgroup>
          </select>
        </Tip>
        <input
          ref={fontFileRef}
          type="file"
          accept=".woff2,.woff,.ttf,.otf"
          aria-label="Upload font file"
          className="hidden"
          onChange={(e) => {
            onFontFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <Tip label="Font size">
          <select
            aria-label="Font size"
            value={currentSize}
            onChange={(e) => applyTextStyle({ fontSize: e.target.value || null })}
            className={selectCls}
          >
            <option value="">Size</option>
            {FONT_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </Tip>
        <Bar />
        {/* 3 — inline marks */}
        <Tip label="Bold" keys="Ctrl+B"><button type="button" aria-label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold')) + ' font-bold'}>B</button></Tip>
        <Tip label="Italic" keys="Ctrl+I"><button type="button" aria-label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic')) + ' italic'}>I</button></Tip>
        <Tip label="Underline" keys="Ctrl+U"><button type="button" aria-label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive('underline')) + ' underline'}>U</button></Tip>
        <Tip label="Strikethrough"><button type="button" aria-label="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive('strike')) + ' line-through'}>S</button></Tip>
        <Bar />
        {/* 4 — color */}
        <Tip label="Text color">
          <span className="relative inline-flex items-center">
            <button type="button" aria-label="Text color" className={btn(!!currentColor)} onClick={(e) => (e.currentTarget.nextElementSibling as HTMLInputElement)?.click()}>
              <span className="flex flex-col items-center leading-none">
                <span style={{ color: currentColor || '#2c2418' }} className="text-[0.82rem] font-semibold">A</span>
                <span className="mt-[1px] h-[3px] w-4 rounded-sm" style={{ background: currentColor || '#2c2418' }} />
              </span>
            </button>
            <input
              type="color"
              aria-label="Pick text color"
              className="pointer-events-none absolute h-0 w-0 opacity-0"
              value={currentColor || '#2c2418'}
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            />
          </span>
        </Tip>
        <select
          aria-label="Theme text colors"
          value={currentColor}
          onChange={(e) => (e.target.value ? editor.chain().focus().setColor(e.target.value).run() : editor.chain().focus().unsetColor().run())}
          className={selectCls}
        >
          <option value="">Default color</option>
          {TEXT_COLORS.map((c) => <option key={c.value} value={c.value}>{c.name}</option>)}
        </select>
        <Tip label="Highlight">
          <select
            aria-label="Highlight color"
            value={currentHighlight}
            onChange={(e) =>
              e.target.value
                ? editor.chain().focus().toggleHighlight({ color: e.target.value }).run()
                : editor.chain().focus().unsetHighlight().run()
            }
            className={selectCls}
          >
            <option value="">No highlight</option>
            {HIGHLIGHTS.map((h) => <option key={h.value} value={h.value}>{h.name}</option>)}
          </select>
        </Tip>
        <Bar />
        {/* 5 — links & code */}
        <Tip label="Insert link" keys="Ctrl+K"><button type="button" aria-label="Insert link" onClick={openLinkDialog} className={btn(editor.isActive('link'))}>🔗</button></Tip>
        <Tip label="Remove link"><button type="button" aria-label="Remove link" onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()} className={btn(false)}>⛓✕</button></Tip>
        <Tip label="Inline code"><button type="button" aria-label="Inline code" onClick={() => editor.chain().focus().toggleCode().run()} className={btn(editor.isActive('code'))}>{'<>'}</button></Tip>
        <Bar />
        {/* 6 — paragraph structure */}
        <Tip label="Bullet list" keys="- + space"><button type="button" aria-label="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))}>•≡</button></Tip>
        <Tip label="Numbered list" keys="1. + space"><button type="button" aria-label="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))}>1≡</button></Tip>
        <Tip label="Alignment">
          <select
            aria-label="Text alignment"
            value={align}
            onChange={(e) => editor.chain().focus().setTextAlign(e.target.value).run()}
            className={selectCls}
          >
            <option value="left">⇤ Left</option>
            <option value="center">⇹ Center</option>
            <option value="right">⇥ Right</option>
            <option value="justify">☰ Justify</option>
          </select>
        </Tip>
        <Tip label="Line spacing">
          <select
            aria-label="Line spacing"
            value={currentLineHeight}
            onChange={(e) => {
              const v = e.target.value;
              if (v) (editor.chain().focus() as any).setLineHeight(v).run();
              else (editor.chain().focus() as any).unsetLineHeight().run();
            }}
            className={selectCls}
          >
            <option value="">Spacing</option>
            {LINE_SPACINGS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </Tip>
        <Bar />
        {/* 7 — inserts */}
        <Tip label="Insert image"><button type="button" aria-label="Insert image" onClick={addImage} className={btn(false)}>🖼</button></Tip>
        <Tip label="Video embed (YouTube/Vimeo)"><button type="button" aria-label="Video embed" onClick={addVideo} className={btn(false)}>▶</button></Tip>
        <Tip label="Table"><button type="button" aria-label="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className={btn(inTable)}>⊞</button></Tip>
        <Tip label="Divider"><button type="button" aria-label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btn(false)}>―</button></Tip>
        <Tip label="Callout box">
          <select
            aria-label="Insert callout"
            value=""
            onChange={(e) => {
              if (e.target.value) (editor.chain().focus() as any).setCallout(e.target.value).run();
              e.target.value = '';
            }}
            className={selectCls}
          >
            <option value="">Callout…</option>
            <option value="info">ℹ Information</option>
            <option value="note">✎ Note</option>
            <option value="warning">⚠ Warning</option>
            <option value="editorial">✦ Editorial note</option>
          </select>
        </Tip>
        <Tip label="Pull quote"><button type="button" aria-label="Pull quote" onClick={() => (editor.chain().focus() as any).setPullQuote().run()} className={btn(editor.isActive('pullQuote'))}>❞</button></Tip>
        {/* table controls — only when the cursor is inside a table */}
        {inTable && (
          <>
            <Bar />
            <span className="ml-1 mr-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#a08b66]">Table</span>
            <Tip label="Add row below"><button type="button" aria-label="Add row" onClick={() => editor.chain().focus().addRowAfter().run()} className={btn(false)}>+▤</button></Tip>
            <Tip label="Add column right"><button type="button" aria-label="Add column" onClick={() => editor.chain().focus().addColumnAfter().run()} className={btn(false)}>+▥</button></Tip>
            <Tip label="Delete row"><button type="button" aria-label="Delete row" onClick={() => editor.chain().focus().deleteRow().run()} className={btn(false)}>−▤</button></Tip>
            <Tip label="Delete column"><button type="button" aria-label="Delete column" onClick={() => editor.chain().focus().deleteColumn().run()} className={btn(false)}>−▥</button></Tip>
            <Tip label="Toggle header row"><button type="button" aria-label="Toggle header row" onClick={() => editor.chain().focus().toggleHeaderRow().run()} className={btn(false)}>▤ᵀ</button></Tip>
            <Tip label="Delete table"><button type="button" aria-label="Delete table" onClick={() => editor.chain().focus().deleteTable().run()} className={btn(false) + ' text-[#c05f4e]'}>⊠</button></Tip>
          </>
        )}
        <Bar />
        {/* 8 — history */}
        <Tip label="Undo" keys="Ctrl+Z"><button type="button" aria-label="Undo" onClick={() => editor.chain().focus().undo().run()} className={btn(false)}>↩</button></Tip>
        <Tip label="Redo" keys="Ctrl+Shift+Z"><button type="button" aria-label="Redo" onClick={() => editor.chain().focus().redo().run()} className={btn(false)}>↪</button></Tip>
        {block === 'codeBlock' && <span className="ml-1 text-[0.64rem] uppercase tracking-wider text-[#a08b66]">code block</span>}
      </div>

      {/* link dialog */}
      {linkOpen && (
        <div className="border-b border-[#eee2ca] bg-[#fdfaf3] px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={linkInputRef}
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
                if (e.key === 'Escape') setLinkOpen(false);
              }}
              placeholder="https://…"
              className="w-64 rounded-lg border border-[#ddcdab] bg-white px-3 py-1.5 text-sm text-[#2c2418] outline-none focus:border-[#b98a4a]"
            />
            <label className="flex items-center gap-1.5 text-[0.74rem] text-[#7a6a50]">
              <input type="checkbox" checked={linkNewTab} onChange={(e) => setLinkNewTab(e.target.checked)} className="accent-[#8a6224]" />
              Open in new tab
            </label>
            <label className="flex items-center gap-1.5 text-[0.74rem] text-[#7a6a50]">
              <input type="checkbox" checked={linkNofollow} onChange={(e) => setLinkNofollow(e.target.checked)} className="accent-[#8a6224]" />
              nofollow
            </label>
            <button type="button" onClick={() => setLinkOpen(false)} className="rounded-full px-3 py-1.5 text-[0.72rem] text-[#7a6a50] hover:text-[#2c2418]">Cancel</button>
            <button type="button" onClick={applyLink} className="rounded-full bg-[#8a6224] px-4 py-1.5 text-[0.72rem] font-semibold text-white hover:bg-[#75511c]">Apply</button>
          </div>
        </div>
      )}

      {/* writing surface */}
      <EditorContent editor={editor} className="rte-surface" style={{ minHeight }} />

      {/* stats footer */}
      <div className="flex items-center justify-between rounded-b-xl border-t border-[#eee2ca] bg-[#fdfaf3] px-4 py-1.5">
        <span className="text-[0.68rem] tracking-wide text-[#a08b66]">
          {editorStats(editor).words.toLocaleString()} words · {editorStats(editor).minutes} min read
        </span>
        <span className="text-[0.68rem] text-[#c4b291]">{editorStats(editor).chars.toLocaleString()} characters</span>
      </div>

      {/* media library dialog */}
      <MediaDialog
        open={mediaOpen}
        initial={mediaInitial}
        onPick={(sel) => mediaCbRef.current?.(sel)}
        onClose={() => setMediaOpen(false)}
      />
    </div>
  );
}
