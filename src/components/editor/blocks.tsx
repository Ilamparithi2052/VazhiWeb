import { Node as TiptapNode, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { trpc } from '@/providers/trpc';
import { openMediaPicker } from './mediaPicker';

/* ================================================================ helpers */

const stopKeys = (e: React.KeyboardEvent) => e.stopPropagation();

const rowInput =
  'w-24 shrink-0 rounded-md border border-transparent bg-transparent px-2 py-1 text-[0.78rem] font-semibold text-[#8a6224] outline-none transition-colors placeholder:font-normal placeholder:text-[#c4b291] hover:border-[#e3d5b8] focus:border-[#b98a4a] focus:bg-white';

const delBtn =
  'absolute -right-2 -top-2 hidden h-5 w-5 items-center justify-center rounded-full bg-[#c05f4e] text-[0.6rem] text-white shadow group-hover/block:flex';

function DeleteBlockBtn({ onClick, title = 'Remove block' }: { onClick: () => void; title?: string }) {
  return (
    <button type="button" title={title} onClick={onClick} className={delBtn} contentEditable={false}>
      ✕
    </button>
  );
}

const addRowBtn =
  'mt-1 rounded-full border border-dashed border-[#cfbd97] px-3 py-1 text-[0.68rem] text-[#a08b66] transition-colors hover:border-[#b98a4a] hover:text-[#8a6224]';

/**
 * Enter on the trailing empty paragraph of the last entry lifts out of the
 * container (same feel as exiting a list or blockquote). Shared by
 * TimelineEntry and FactRow — `this.name` makes it generic.
 */
function exitOnEmptyEnter(this: { name: string }) {
  return {
    Enter: ({ editor }: { editor: any }) => {
      const { $from, empty } = editor.state.selection;
      if (!empty || $from.parent.type.name !== 'paragraph' || $from.parent.textContent.trim() !== '') return false;
      const entryDepth = $from.depth - 1;
      if (entryDepth < 1) return false;
      const entry = $from.node(entryDepth);
      if (entry.type.name !== this.name) return false;
      if ($from.index(entryDepth) !== entry.childCount - 1) return false; // not the entry's last paragraph
      const containerDepth = entryDepth - 1;
      if ($from.index(containerDepth) !== $from.node(containerDepth).childCount - 1) return false; // not the last entry
      const container = $from.node(containerDepth);
      const afterContainer = $from.after(containerDepth);
      // Case 1: the entry has real content paragraphs — just drop the trailing
      // empty paragraph and continue after the block.
      if (entry.childCount >= 2) {
        const removed = $from.after() - $from.before();
        const insertAt = afterContainer - removed;
        return editor
          .chain()
          .deleteRange({ from: $from.before(), to: $from.after() })
          .insertContentAt(insertAt, { type: 'paragraph' })
          .focus(insertAt + 1)
          .run();
      }
      // Case 2: single empty paragraph. If the entry carries data (a year, a
      // label), keep it and simply continue after the block — the empty
      // paragraph is harmless. Letting ProseMirror's default lift handle this
      // hollows the entry out and the schema then deletes it unpredictably.
      const hasData = Object.values(entry.attrs).some((v) => v != null && String(v).trim() !== '');
      if (hasData) {
        return editor.chain().insertContentAt(afterContainer, { type: 'paragraph' }).focus(afterContainer + 1).run();
      }
      // Case 3: a completely empty trailing entry — remove it (like an empty
      // list item). If it's the container's only entry, remove the container.
      if (container.childCount > 1) {
        const entryFrom = $from.before(entryDepth);
        const entryTo = $from.after(entryDepth);
        const insertAt = afterContainer - (entryTo - entryFrom);
        return editor
          .chain()
          .deleteRange({ from: entryFrom, to: entryTo })
          .insertContentAt(insertAt, { type: 'paragraph' })
          .focus(insertAt + 1)
          .run();
      }
      const containerFrom = $from.before(containerDepth);
      return editor
        .chain()
        .deleteRange({ from: containerFrom, to: afterContainer })
        .insertContentAt(containerFrom, { type: 'paragraph' })
        .focus(containerFrom + 1)
        .run();
    },
  };
}

/* ================================================================= timeline */

export const TimelineEntry = TiptapNode.create({
  name: 'timelineEntry',
  content: 'paragraph+',
  defining: true,
  addAttributes() {
    return {
      year: {
        default: '',
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-year') ?? '',
        renderHTML: (attrs) => ({ 'data-year': attrs.year }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-tentry]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-tentry': '', class: 'tentry' }), 0];
  },
  addKeyboardShortcuts() {
    return exitOnEmptyEnter.call(this as any);
  },
  addNodeView() {
    return ReactNodeViewRenderer(TimelineEntryView);
  },
});

function TimelineEntryView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  return (
    <NodeViewWrapper className="tentry group/block relative" data-tentry="" data-year={node.attrs.year}>
      <input
        value={node.attrs.year}
        onChange={(e) => updateAttributes({ year: e.target.value })}
        onKeyDown={stopKeys}
        placeholder="1003"
        aria-label="Year or period"
        className={rowInput + ' tentry-year'}
        contentEditable={false}
      />
      <NodeViewContent className="tentry-body min-w-0 flex-1" />
      <DeleteBlockBtn onClick={deleteNode} title="Remove entry" />
    </NodeViewWrapper>
  );
}

export const Timeline = TiptapNode.create({
  name: 'timeline',
  group: 'block',
  content: 'timelineEntry+',
  defining: true,
  parseHTML() {
    return [{ tag: 'div[data-timeline]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-timeline': '', class: 'timeline' }), 0];
  },
  addCommands() {
    return {
      setTimeline:
        () =>
        ({ commands }: { commands: any }) =>
          commands.insertContent({
            type: 'timeline',
            content: [
              { type: 'timelineEntry', attrs: { year: '' }, content: [{ type: 'paragraph' }] },
              { type: 'timelineEntry', attrs: { year: '' }, content: [{ type: 'paragraph' }] },
            ],
          }),
    } as any;
  },
  addNodeView() {
    return ReactNodeViewRenderer(TimelineView);
  },
});

function TimelineView({ node, editor, getPos, deleteNode }: NodeViewProps) {
  const append = () => {
    editor
      .chain()
      .insertContentAt(getPos() + node.nodeSize - 1, {
        type: 'timelineEntry',
        attrs: { year: '' },
        content: [{ type: 'paragraph' }],
      })
      .run();
  };
  return (
    <NodeViewWrapper className="timeline group/block relative" data-timeline="">
      <span className="block-label" contentEditable={false}>
        Timeline
      </span>
      <NodeViewContent className="timeline-entries" />
      <button type="button" onClick={append} className={addRowBtn} contentEditable={false}>
        + Add entry
      </button>
      <DeleteBlockBtn onClick={deleteNode} />
    </NodeViewWrapper>
  );
}

/* ================================================================ fact box */

export const FactRow = TiptapNode.create({
  name: 'factRow',
  content: 'paragraph+',
  defining: true,
  addAttributes() {
    return {
      label: {
        default: '',
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-label') ?? '',
        renderHTML: (attrs) => ({ 'data-label': attrs.label }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-factrow]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-factrow': '', class: 'factrow' }), 0];
  },
  addKeyboardShortcuts() {
    return exitOnEmptyEnter.call(this as any);
  },
  addNodeView() {
    return ReactNodeViewRenderer(FactRowView);
  },
});

function FactRowView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  return (
    <NodeViewWrapper className="factrow group/block relative" data-factrow="" data-label={node.attrs.label}>
      <input
        value={node.attrs.label}
        onChange={(e) => updateAttributes({ label: e.target.value })}
        onKeyDown={stopKeys}
        placeholder="Label"
        aria-label="Fact label"
        className={rowInput}
        contentEditable={false}
      />
      <NodeViewContent className="factrow-body min-w-0 flex-1" />
      <DeleteBlockBtn onClick={deleteNode} title="Remove row" />
    </NodeViewWrapper>
  );
}

export const FactBox = TiptapNode.create({
  name: 'factBox',
  group: 'block',
  content: 'factRow+',
  defining: true,
  parseHTML() {
    return [{ tag: 'div[data-factbox]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-factbox': '', class: 'factbox' }), 0];
  },
  addCommands() {
    return {
      setFactBox:
        () =>
        ({ commands }: { commands: any }) =>
          commands.insertContent({
            type: 'factBox',
            content: [
              { type: 'factRow', attrs: { label: '' }, content: [{ type: 'paragraph' }] },
              { type: 'factRow', attrs: { label: '' }, content: [{ type: 'paragraph' }] },
              { type: 'factRow', attrs: { label: '' }, content: [{ type: 'paragraph' }] },
            ],
          }),
    } as any;
  },
  addNodeView() {
    return ReactNodeViewRenderer(FactBoxView);
  },
});

function FactBoxView({ node, editor, getPos, deleteNode }: NodeViewProps) {
  const append = () => {
    editor
      .chain()
      .insertContentAt(getPos() + node.nodeSize - 1, {
        type: 'factRow',
        attrs: { label: '' },
        content: [{ type: 'paragraph' }],
      })
      .run();
  };
  return (
    <NodeViewWrapper className="factbox group/block relative" data-factbox="">
      <span className="block-label" contentEditable={false}>
        Fact box
      </span>
      <NodeViewContent className="factbox-rows" />
      <button type="button" onClick={append} className={addRowBtn} contentEditable={false}>
        + Add row
      </button>
      <DeleteBlockBtn onClick={deleteNode} />
    </NodeViewWrapper>
  );
}

/* =============================================================== place card */

interface PlaceOption {
  id: string;
  name: string;
  region: string;
}

export const PlaceCard = TiptapNode.create({
  name: 'placeCard',
  group: 'block',
  atom: true,
  defining: true,
  addAttributes() {
    return {
      pid: {
        default: '',
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-place-id') ?? '',
        renderHTML: (attrs) => ({ 'data-place-id': attrs.pid }),
      },
      name: { default: '' },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'div[data-place-card]',
        getAttrs: (el) => ({
          pid: (el as HTMLElement).getAttribute('data-place-id') ?? '',
          name: (el as HTMLElement).querySelector('.place-card-name')?.textContent ?? '',
        }),
      },
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    const pid = node.attrs.pid as string;
    const name = (node.attrs.name as string) || pid;
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-place-card': '', 'data-place-id': pid, class: 'place-card' }),
      ['span', { class: 'place-card-kicker' }, 'Place'],
      ['a', { href: `/place/${pid}`, class: 'place-card-name' }, name],
      ['span', { class: 'place-card-cta' }, 'Explore →'],
    ];
  },
  addCommands() {
    return {
      setPlaceCard:
        () =>
        ({ commands }: { commands: any }) =>
          commands.insertContent({ type: 'placeCard', attrs: { pid: '', name: '' } }),
    } as any;
  },
  addNodeView() {
    return ReactNodeViewRenderer(PlaceCardView);
  },
});

function PlaceCardView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const placesQ = trpc.content.places.useQuery();
  const places = (placesQ.data ?? []) as PlaceOption[];
  const { pid, name } = node.attrs as { pid: string; name: string };

  return (
    <NodeViewWrapper className={`place-card group/block relative ${selected ? 'ring-1 ring-[#b98a4a]' : ''}`} data-place-card="" data-place-id={pid}>
      {pid ? (
        <div className="flex items-center gap-3" contentEditable={false}>
          <span className="text-lg">📍</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.62rem] uppercase tracking-[0.16em] text-[#a08b66]">Place card</span>
            <span className="block truncate text-[0.95rem] font-semibold text-[#2c2418]">{name}</span>
          </span>
          <button
            type="button"
            onClick={() => updateAttributes({ pid: '', name: '' })}
            className="shrink-0 rounded-full border border-[#ddcdab] px-2.5 py-1 text-[0.66rem] text-[#7a6a50] hover:border-[#b98a4a]"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3" contentEditable={false}>
          <span className="text-lg">📍</span>
          <select
            aria-label="Choose a place"
            value=""
            onChange={(e) => {
              const p = places.find((x) => x.id === e.target.value);
              if (p) updateAttributes({ pid: p.id, name: p.name });
            }}
            className="h-8 flex-1 rounded-lg border border-[#ddcdab] bg-white px-2 text-[0.8rem] text-[#7a6a50] outline-none focus:border-[#b98a4a]"
          >
            <option value="">Choose a place to feature…</option>
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.region}
              </option>
            ))}
          </select>
        </div>
      )}
      <DeleteBlockBtn onClick={deleteNode} title="Remove place card" />
    </NodeViewWrapper>
  );
}

/* ================================================================== gallery */

export interface GalleryImage {
  src: string;
  alt: string;
  credit: string;
}

const parseImages = (raw: string): GalleryImage[] => {
  try {
    const v = JSON.parse(raw || '[]');
    return Array.isArray(v) ? v.filter((i) => i && typeof i.src === 'string') : [];
  } catch {
    return [];
  }
};

export const Gallery = TiptapNode.create({
  name: 'gallery',
  group: 'block',
  atom: true,
  defining: true,
  addAttributes() {
    return {
      images: {
        default: '[]',
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-images') ?? '[]',
        renderHTML: (attrs) => ({ 'data-images': attrs.images }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-gallery]' }];
  },
  renderHTML({ node, HTMLAttributes }) {
    const images = parseImages(node.attrs.images as string);
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-gallery': '', class: 'gallery' }),
      ...images.map((img): [string, Record<string, string>, ...(unknown[])] => {
        const children: unknown[] = [['img', { src: img.src, alt: img.alt || '' }]];
        if (img.credit) children.push(['figcaption', {}, img.credit]);
        return ['figure', {}, ...children];
      }),
    ];
  },
  addCommands() {
    return {
      setGallery:
        () =>
        ({ commands }: { commands: any }) =>
          commands.insertContent({ type: 'gallery', attrs: { images: '[]' } }),
    } as any;
  },
  addNodeView() {
    return ReactNodeViewRenderer(GalleryView);
  },
});

function GalleryView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const images = parseImages(node.attrs.images as string);
  const save = (next: GalleryImage[]) => updateAttributes({ images: JSON.stringify(next) });

  const add = () =>
    openMediaPicker((sel) => {
      save([...images, { src: sel.src, alt: sel.alt, credit: sel.credit }]);
    });

  return (
    <NodeViewWrapper className={`gallery-edit group/block relative ${selected ? 'ring-1 ring-[#b98a4a]' : ''}`} data-gallery="" data-images={node.attrs.images}>
      <span className="block-label" contentEditable={false}>
        Gallery · {images.length} image{images.length === 1 ? '' : 's'}
      </span>
      <div className="grid grid-cols-3 gap-2" contentEditable={false}>
        {images.map((img, i) => (
          <div key={`${img.src}-${i}`} className="group/img relative">
            <img src={img.src} alt={img.alt} className="h-20 w-full rounded-lg border border-[#eee2ca] object-cover" />
            <button
              type="button"
              title="Remove image"
              onClick={() => save(images.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-[#c05f4e] text-[0.6rem] text-white group-hover/img:flex"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="flex h-20 items-center justify-center rounded-lg border border-dashed border-[#cfbd97] text-[0.7rem] text-[#a08b66] transition-colors hover:border-[#b98a4a] hover:text-[#8a6224]"
        >
          + Add image
        </button>
      </div>
      <DeleteBlockBtn onClick={deleteNode} title="Remove gallery" />
    </NodeViewWrapper>
  );
}

/* ============================================================= video embed */

/** Normalize a pasted YouTube/Vimeo URL into a privacy-friendly embed URL. */
export function normalizeVideoUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (u.pathname === '/watch') {
        const id = u.searchParams.get('v');
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
      const m = u.pathname.match(/^\/(shorts|embed)\/([\w-]+)/);
      if (m) return `https://www.youtube-nocookie.com/embed/${m[2]}`;
    }
    if (host === 'vimeo.com') {
      const m = u.pathname.match(/^\/(\d+)/);
      if (m) return `https://player.vimeo.com/video/${m[1]}`;
    }
    if (host === 'player.vimeo.com') return raw.trim();
  } catch {
    /* not a URL */
  }
  return null;
}

export const VideoEmbed = TiptapNode.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  defining: true,
  addAttributes() {
    return {
      src: {
        default: '',
        parseHTML: (el) => (el as HTMLElement).getAttribute('src') ?? '',
        renderHTML: (attrs) => ({ src: attrs.src }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'iframe[data-video]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { 'data-video-embed': '', class: 'video-embed' },
      [
        'iframe',
        mergeAttributes(HTMLAttributes, {
          'data-video': 'true',
          allowfullscreen: 'true',
          loading: 'lazy',
          frameborder: '0',
          referrerpolicy: 'strict-origin-when-cross-origin',
        }),
      ],
    ];
  },
  addCommands() {
    return {
      setVideoEmbed:
        (src: string) =>
        ({ commands }: { commands: any }) =>
          commands.insertContent({ type: 'videoEmbed', attrs: { src } }),
    } as any;
  },
  addNodeView() {
    return ReactNodeViewRenderer(VideoEmbedView);
  },
});

function VideoEmbedView({ node, deleteNode, selected }: NodeViewProps) {
  const src = node.attrs.src as string;
  const host = src.includes('vimeo') ? 'Vimeo' : 'YouTube';
  return (
    <NodeViewWrapper className={`video-embed-edit group/block relative ${selected ? 'ring-1 ring-[#b98a4a]' : ''}`} data-video-embed="">
      <div className="video-embed" contentEditable={false}>
        <iframe src={src} title={`${host} embed`} style={{ pointerEvents: 'none' }} loading="lazy" frameBorder="0" />
      </div>
      <span className="block-label" contentEditable={false}>
        {host} embed
      </span>
      <DeleteBlockBtn onClick={deleteNode} title="Remove video" />
    </NodeViewWrapper>
  );
}
