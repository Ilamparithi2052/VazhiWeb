/** Local profile: saved places + recently viewed, kept in localStorage (browser-only). */

const SAVED_KEY = 'vazhi-saved';
const RECENT_KEY = 'vazhi-recent';

function read(key: string): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export const getSaved = (): string[] => read(SAVED_KEY);

export function isSaved(id: string): boolean {
  return getSaved().includes(id);
}

export function toggleSaved(id: string): boolean {
  const list = getSaved();
  const next = list.includes(id) ? list.filter((x) => x !== id) : [id, ...list];
  localStorage.setItem(SAVED_KEY, JSON.stringify(next.slice(0, 50)));
  window.dispatchEvent(new CustomEvent('vazhi:profile-changed'));
  return next.includes(id);
}

export function removeSaved(id: string): void {
  localStorage.setItem(SAVED_KEY, JSON.stringify(getSaved().filter((x) => x !== id)));
  window.dispatchEvent(new CustomEvent('vazhi:profile-changed'));
}

export const getRecent = (): string[] => read(RECENT_KEY);

export function pushRecent(id: string): void {
  const next = [id, ...getRecent().filter((x) => x !== id)].slice(0, 8);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('vazhi:profile-changed'));
}

const SEARCH_KEY = 'vazhi-searches';

export const getRecentSearches = (): string[] => read(SEARCH_KEY);

export function pushSearch(q: string): void {
  const s = q.trim();
  if (!s) return;
  const next = [s, ...getRecentSearches().filter((x) => x.toLowerCase() !== s.toLowerCase())].slice(0, 6);
  localStorage.setItem(SEARCH_KEY, JSON.stringify(next));
}
