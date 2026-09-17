/* Media picker bridge: RichEditor registers the dialog opener; node views
   (gallery, image edit) call it without prop drilling through TipTap. */

export interface MediaSelection {
  src: string;
  alt: string;
  caption: string;
  credit: string;
  license: string;
}

export type MediaPickerOpen = (
  onPick: (sel: MediaSelection) => void,
  initial?: Partial<MediaSelection>
) => void;

let opener: MediaPickerOpen | null = null;

export const registerMediaPicker = (fn: MediaPickerOpen) => {
  opener = fn;
};

export const openMediaPicker: MediaPickerOpen = (onPick, initial) => {
  opener?.(onPick, initial);
};
