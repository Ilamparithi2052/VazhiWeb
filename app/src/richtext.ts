/* Rich text storage helpers.
   Bodies/sections are stored as HTML strings. Legacy plain-text paragraphs
   are upgraded on the fly so nothing written before the editor breaks. */

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Some rows reach the client JSON-encoded: a string that is itself JSON
   (an array of paragraphs, or a quoted HTML string). Unwrap iteratively. */
function unwrapJson(s: string): unknown {
  const v = s.trim();
  if (!(v.startsWith('["') || (v.startsWith('"') && v.endsWith('"')))) return s;
  try {
    return JSON.parse(v);
  } catch {
    return s;
  }
}

const INLINE = /<\/(p|h1|h2|h3|h4|h5|h6|blockquote|li|ul|ol|figure|figcaption|table|tr|td|th|div|hr)>|<img|<a\s|<strong>|<em>|<u>|<mark|<code|<s>/i;

export const looksLikeHtml = (s: string) => INLINE.test(s);

export function parasToHtml(paras: string[]): string {
  return paras.map((p) => `<p>${esc(p)}</p>`).join('');
}

/** Accepts stored HTML or a legacy plain-text array; returns HTML. */
export function toHtml(stored: unknown): string {
  if (typeof stored === 'string') {
    const unwrapped = unwrapJson(stored);
    if (unwrapped !== stored) return toHtml(unwrapped);
    return stored;
  }
  if (Array.isArray(stored)) {
    const paras = stored.filter((x): x is string => typeof x === 'string');
    // array of ready HTML fragments (rare) — join as-is
    if (paras.length > 0 && paras.every(looksLikeHtml)) return paras.join('');
    return parasToHtml(paras);
  }
  return '';
}

/** Stored value -> string for the DB JSON column. */
export function htmlToStored(html: string): string {
  return html;
}

const ALLOWED_IMG = /^[a-z0-9\-_.]+\.(jpg|jpeg|png|webp|gif)$/i;

/** Turn a bare file name into the site's image path; pass paths/URLs through. */
export function resolveImgSrc(input: string): string | null {
  const v = input.trim();
  if (!v) return null;
  if (ALLOWED_IMG.test(v)) return `/img/final/${v}`;
  if (/^\/?[\w\-./]+$/.test(v) || /^https?:\/\//i.test(v)) return v;
  return null;
}
