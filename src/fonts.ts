import { useEffect } from 'react';
import { trpc } from '@/providers/trpc';

/* Curated Google fonts offered in the studio font menu. The actual font files
   are only downloaded by the browser when text on screen uses the family. */
export const GOOGLE_FONTS: { name: string; family: string }[] = [
  { name: 'Cormorant Garamond', family: '"Cormorant Garamond", serif' },
  { name: 'EB Garamond', family: '"EB Garamond", serif' },
  { name: 'Lora', family: 'Lora, serif' },
  { name: 'Merriweather', family: 'Merriweather, serif' },
  { name: 'Playfair Display', family: '"Playfair Display", serif' },
  { name: 'Source Serif 4', family: '"Source Serif 4", serif' },
  { name: 'Inter', family: 'Inter, sans-serif' },
  { name: 'Noto Serif Tamil', family: '"Noto Serif Tamil", serif' },
  { name: 'Noto Sans Tamil', family: '"Noto Sans Tamil", sans-serif' },
];

const GOOGLE_LINK_ID = 'vazhi-google-fonts';

function ensureGoogleFonts() {
  if (document.getElementById(GOOGLE_LINK_ID)) return;
  const families = GOOGLE_FONTS.map((f) => `family=${f.name.replace(/ /g, '+')}:wght@400;500;600;700`).join('&');
  const link = document.createElement('link');
  link.id = GOOGLE_LINK_ID;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  document.head.appendChild(link);
}

const CUSTOM_STYLE_ID = 'vazhi-uploaded-fonts';

/** Injects @font-face rules for every uploaded custom font. */
export function injectCustomFonts(fonts: { id: number; family: string }[]) {
  let el = document.getElementById(CUSTOM_STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = CUSTOM_STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = fonts
    .map(
      (f) =>
        `@font-face { font-family: "${f.family.replace(/"/g, '')}"; src: url("/api/fonts/${f.id}"); font-display: swap; }`
    )
    .join('\n');
}

/**
 * Site-wide font loader: makes the curated Google set and any uploaded custom
 * fonts available everywhere (public pages render inline font-family styles).
 */
export function FontLoader() {
  const utils = trpc.useUtils();
  useEffect(() => {
    ensureGoogleFonts();
    let alive = true;
    utils.content.fontsList
      .fetch()
      .then((fonts) => { if (alive) injectCustomFonts(fonts); })
      .catch(() => { /* font list is best-effort — the theme fonts still apply */ });
    return () => { alive = false; };
  }, [utils]);
  return null;
}
