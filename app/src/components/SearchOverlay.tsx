import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { IMG } from '../data';
import { useContent } from '../content-provider';
import { ui } from './Icons';
import { useLang, tagLabel } from '../i18n';
import { placesTa, storiesTa, destTa } from '../content-ta';
import { getRecentSearches, pushSearch } from '../lib/profile';

interface Hit {
  to: string;
  img?: string;
  title: string;
  sub: string;
}

export default function SearchOverlay({
  open,
  initial,
  onClose,
}: {
  open: boolean;
  initial: string;
  onClose: () => void;
}) {
  const { lang, t } = useLang();
  const { places, storyArticles, destinations } = useContent();
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ(initial);
      const raf = requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = 'hidden';
      return () => {
        cancelAnimationFrame(raf);
        document.body.style.overflow = '';
      };
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const query = q.trim().toLowerCase();

  const placeHits = useMemo<Hit[]>(() => {
    if (!query) return [];
    return Object.values(places)
      .filter((p) =>
        [p.name, p.region, p.country, p.summary].join(' ').toLowerCase().includes(query),
      )
      .slice(0, 6)
      .map((p) => {
        const ta = lang === 'ta' ? placesTa[p.id] : undefined;
        return {
          to: `/place/${p.id}`,
          img: p.img,
          title: ta?.name ?? p.name,
          sub: ta ? `${ta.region} · ${ta.country}` : `${p.region} · ${p.country}`,
        };
      });
  }, [query, lang, places]);

  const storyHits = useMemo<Hit[]>(() => {
    if (!query) return [];
    return Object.values(storyArticles)
      .filter((s) => [s.title, s.tag, s.lede].join(' ').toLowerCase().includes(query))
      .slice(0, 4)
      .map((s) => {
        const ta = lang === 'ta' ? storiesTa[s.id] : undefined;
        return { to: `/stories/${s.id}`, img: s.img, title: ta?.title ?? s.title, sub: tagLabel(t, s.tag) };
      });
  }, [query, lang, t, storyArticles]);

  const destHits = useMemo<Hit[]>(() => {
    if (!query) return [];
    return destinations
      .filter((d) => [d.name, d.blurb].join(' ').toLowerCase().includes(query))
      .slice(0, 3)
      .map((d) => ({
        to: `/destinations/${d.id}`,
        img: d.img,
        title: lang === 'ta' ? (destTa[d.id]?.name ?? d.name) : d.name,
        sub: d.places,
      }));
  }, [query, lang, destinations]);

  const total = placeHits.length + storyHits.length + destHits.length;
  const recentSearches = getRecentSearches();

  const commit = () => {
    if (q.trim()) pushSearch(q);
  };

  if (!open) return null;

  const group = (label: string, hits: Hit[]) =>
    hits.length > 0 && (
      <div className="px-4 pb-2 md:px-6">
        <p className="px-2 pb-2 pt-4 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-bronze">
          {label}
        </p>
        <ul className="space-y-1">
          {hits.map((h) => (
            <li key={h.to + h.title}>
              <Link
                to={h.to}
                onClick={() => {
                  commit();
                  onClose();
                }}
                className="group flex items-center gap-3.5 rounded-xl px-2 py-2 transition-colors hover:bg-surf2"
              >
                {h.img && (
                  <img
                    src={IMG(h.img)}
                    alt=""
                    className="card-ring h-11 w-14 shrink-0 rounded-lg object-cover"
                  />
                )}
                <span className="min-w-0">
                  <span className="block truncate text-[0.92rem] font-medium text-parch transition-colors group-hover:text-bronze">
                    {h.title}
                  </span>
                  <span className="block truncate text-xs text-mutedw">{h.sub}</span>
                </span>
                <span className="ml-auto shrink-0 text-faint transition-colors group-hover:text-bronze">
                  {ui.arrow({ className: 'h-3.5 w-3.5' })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-page/80 px-4 pt-[10vh] backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="menu-in card-ring w-full max-w-2xl overflow-hidden rounded-2xl bg-surf shadow-2xl">
        {/* input row */}
        <form
          className="flex items-center gap-3 border-b border-bronze/20 px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            commit();
          }}
        >
          <span className="text-bronze">{ui.search({ className: 'h-5 w-5' })}</span>
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('search.ph')}
            className="w-full bg-transparent text-[1.05rem] text-parchbright placeholder-muted2 outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-bronze/30 text-mutedw transition-colors hover:border-bronze/60 hover:text-bronze"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
              <path d="M6 6 L18 18 M18 6 L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </form>

        {/* results */}
        <div className="max-h-[56vh] overflow-y-auto pb-3">
          {query ? (
            total > 0 ? (
              <>
                {group(t('search.places'), placeHits)}
                {group(t('search.stories'), storyHits)}
                {group(t('search.dests'), destHits)}
              </>
            ) : (
              <p className="px-8 py-10 text-center text-sm text-mutedw">{t('search.empty')}</p>
            )
          ) : (
            <div className="px-6 py-5">
              {recentSearches.length > 0 && (
                <>
                  <p className="pb-2 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-bronze">
                    {t('search.recent')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQ(s)}
                        className="rounded-full border border-bronze/30 px-3.5 py-1.5 text-xs text-lede transition-colors hover:border-bronze/60 hover:text-bronze"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <p className="pt-4 text-xs text-faint">{t('search.hint')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
