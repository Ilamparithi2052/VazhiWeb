import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { ReactRenderer } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import type { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';

/* Shared popup list for slash commands and @place mentions — rendered in a
   fixed-position portal at the caret, no external positioning library. */

export interface MenuEntry {
  title: string;
  hint?: string;
  icon?: string;
  payload?: unknown;
}

export interface MenuHandle {
  onKeyDown: (e: SuggestionKeyDownProps) => boolean;
}

const MenuList = forwardRef<MenuHandle, { items: MenuEntry[]; command: (e: MenuEntry) => void }>(
  ({ items, command }, ref) => {
    const [index, setIndex] = useState(0);
    useEffect(() => setIndex(0), [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowUp') {
          setIndex((i) => (i + items.length - 1) % items.length);
          return true;
        }
        if (event.key === 'ArrowDown') {
          setIndex((i) => (i + 1) % items.length);
          return true;
        }
        if (event.key === 'Enter') {
          const item = items[index];
          if (item) command(item);
          return true;
        }
        return false;
      },
    }));

    if (!items.length) {
      return (
        <div className="rounded-xl border border-[#ddcdab] bg-white px-4 py-2.5 text-[0.75rem] text-[#a08b66] shadow-xl">
          No matches
        </div>
      );
    }

    return (
      <div className="max-h-[300px] w-64 overflow-y-auto rounded-xl border border-[#ddcdab] bg-white py-1 shadow-xl">
        {items.map((item, i) => (
          <button
            key={`${item.title}-${i}`}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault(); // keep editor focus
              command(item);
            }}
            onMouseEnter={() => setIndex(i)}
            className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-[0.8rem] transition-colors ${
              i === index ? 'bg-[#f5ecd9] text-[#2c2418]' : 'text-[#7a6a50]'
            }`}
          >
            {item.icon && <span className="w-5 shrink-0 text-center text-[0.85rem]">{item.icon}</span>}
            <span className="min-w-0">
              <span className="block truncate font-medium">{item.title}</span>
              {item.hint && <span className="block truncate text-[0.66rem] text-[#b3a17f]">{item.hint}</span>}
            </span>
          </button>
        ))}
      </div>
    );
  }
);

/** Creates the suggestion render lifecycle: portal at caret + keyboard wiring. */
export function suggestionRender<T extends MenuEntry>(run: (item: T, props: SuggestionProps<T>) => void) {
  return () => {
    let renderer: ReactRenderer<MenuHandle> | null = null;
    let host: HTMLDivElement | null = null;
    let current: SuggestionProps<T> | null = null;
    let hidden = false;

    const place = () => {
      if (!host || !current) return;
      const rect = current.clientRect?.();
      if (!rect) return;
      const menuH = host.firstElementChild?.getBoundingClientRect().height ?? 300;
      const menuW = host.firstElementChild?.getBoundingClientRect().width ?? 256;
      // flip above the caret when there isn't room below; hard-clamp to the viewport
      const below = rect.bottom + 6 + menuH <= window.innerHeight;
      let top = below ? rect.bottom + 6 : Math.max(8, rect.top - menuH - 6);
      top = Math.min(top, Math.max(8, window.innerHeight - menuH - 8));
      const left = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - menuW - 8));
      host.style.left = `${left}px`;
      host.style.top = `${top}px`;
    };

    return {
      onStart: (props: SuggestionProps<T>) => {
        current = props;
        hidden = false;
        renderer = new ReactRenderer(MenuList, {
          props: { items: props.items, command: (item: T) => run(item, props) },
          editor: props.editor as Editor,
        });
        host = document.createElement('div');
        host.style.position = 'fixed';
        host.style.zIndex = '80';
        host.appendChild(renderer.element);
        document.body.appendChild(host);
        place();
      },
      onUpdate: (props: SuggestionProps<T>) => {
        current = props;
        if (hidden && host) {
          host.style.display = '';
          hidden = false;
        }
        renderer?.updateProps({ items: props.items, command: (item: T) => run(item, props) });
        place();
      },
      onKeyDown: (props: SuggestionKeyDownProps) => {
        if (props.event.key === 'Escape') {
          if (host) host.style.display = 'none';
          hidden = true;
          return true;
        }
        return renderer?.ref?.onKeyDown(props) ?? false;
      },
      onExit: () => {
        host?.remove();
        renderer?.destroy();
        host = null;
        renderer = null;
        current = null;
      },
    };
  };
}
