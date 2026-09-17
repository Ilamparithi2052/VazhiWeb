import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';

/* Generic slash-command host — the item list and renderer are supplied via
   configure() from the editor component (they need React state and dialogs). */
export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {},
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
