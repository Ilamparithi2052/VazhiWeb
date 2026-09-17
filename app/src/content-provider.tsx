import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { trpc } from '@/providers/trpc';
import type { PlaceArticle, StoryArticle, StateEntry, District } from './wiki';
import type { Destination, Journey, Story, Place, Series } from './data';
import { placesTa, storiesTa, destTa } from './content-ta';

/**
 * ContentContext — delivers all site content from the database via the
 * content API, in exactly the same shapes the static wiki.ts/data.ts used
 * to provide. Components keep their existing lookups (Record maps, arrays)
 * so nothing downstream changes.
 */

interface ContentValue {
  ready: boolean;
  places: Record<string, PlaceArticle>;
  storyArticles: Record<string, StoryArticle>;
  stories: Story[];
  series: Series[];
  destinations: Destination[];
  destinationHierarchy: Record<string, StateEntry[]>;
  destMarkers: Record<string, { id: string; x: number; y: number }[]>;
  destMapImages: Record<string, string>;
  journeys: Journey[];
  recentlyAdded: Place[];
  heroImg: string;
  typography: { fontsUrl: string; bodyFont: string; displayFont: string };
  /** sectionId -> visible? (defaults true when a section isn't in the list yet) */
  sectionVisibility: Record<string, boolean>;
  /** homepage section ids in display order */
  sectionOrder: string[];
  /** studio-edited section content (hero texts, interests items, join band, …) */
  siteContent: Record<string, unknown>;
}

const EMPTY: ContentValue = {
  ready: false,
  places: {},
  storyArticles: {},
  stories: [],
  series: [],
  destinations: [],
  destinationHierarchy: {},
  destMarkers: {},
  destMapImages: {},
  journeys: [],
  recentlyAdded: [],
  heroImg: 'hero.jpg',
  typography: { fontsUrl: '', bodyFont: '', displayFont: '' },
  sectionVisibility: {},
  sectionOrder: [],
  siteContent: {},
};

const ContentContext = createContext<ContentValue>(EMPTY);

export function ContentProvider({ children }: { children: ReactNode }) {
  const placesQ = trpc.content.places.useQuery();
  const storiesQ = trpc.content.stories.useQuery();
  const destsQ = trpc.content.destinations.useQuery();
  const statesQ = trpc.content.states.useQuery();
  const markersQ = trpc.content.markers.useQuery();
  const journeysQ = trpc.content.journeys.useQuery();
  const recentQ = trpc.content.recentSlugs.useQuery();
  const heroQ = trpc.content.heroImg.useQuery();
  const typoQ = trpc.content.typography.useQuery();
  const seriesQ = trpc.content.series.useQuery();
  const sectionsQ = trpc.content.sections.useQuery();
  const siteContentQ = trpc.content.siteContent.useQuery();

  const value = useMemo<ContentValue>(() => {
    const ready =
      !!placesQ.data && !!storiesQ.data && !!destsQ.data && !!statesQ.data &&
      !!markersQ.data && !!journeysQ.data && !!recentQ.data && !!heroQ.data && !!typoQ.data &&
      !!seriesQ.data && !!sectionsQ.data && !!siteContentQ.data;
    if (!ready) return EMPTY;

    const places: Record<string, PlaceArticle> = {};
    for (const p of placesQ.data) {
      const { ta: _ta, ...article } = p;
      places[p.id] = article;
      if (_ta) placesTa[p.id] = _ta;
    }

    const storyArticles: Record<string, StoryArticle> = {};
    for (const s of storiesQ.data) {
      const { ta: _ta, placeId, ...rest } = s;
      storyArticles[s.id] = placeId ? { ...rest, placeId } : rest;
      if (_ta) storiesTa[s.id] = _ta;
    }

    const stories: Story[] = storiesQ.data.map((s) => ({
      id: s.id, tag: s.tag, title: s.title, time: s.time, img: s.img,
      seriesSlug: s.seriesSlug ?? null,
    }));

    const series: Series[] = seriesQ.data.map((s) => ({
      id: s.id, name: s.name, nameTa: s.nameTa, description: s.description,
      descTa: s.descTa, img: s.img, count: s.count,
    }));

    const destinations: Destination[] = destsQ.data.map((d) => ({
      id: d.id, name: d.name, places: d.places, img: d.img, blurb: d.blurb,
    }));
    const destMapImages: Record<string, string> = {};
    for (const d of destsQ.data) {
      if (d.mapImg) destMapImages[d.id] = d.mapImg;
      if (d.taName || d.taPlacesLabel || d.taBlurb) {
        destTa[d.id] = {
          name: d.taName ?? d.name,
          places: d.taPlacesLabel ?? d.places,
          blurb: d.taBlurb ?? d.blurb,
        };
      }
    }

    const destinationHierarchy: Record<string, StateEntry[]> = {};
    for (const st of statesQ.data) {
      (destinationHierarchy[st.destSlug] ??= []).push({
        id: st.slug,
        name: st.name,
        districts: st.districts as District[],
      });
    }

    const destMarkers: Record<string, { id: string; x: number; y: number }[]> = {};
    for (const m of markersQ.data) {
      (destMarkers[m.destSlug] ??= []).push({ id: m.placeSlug, x: m.x, y: m.y });
    }

    const journeys: Journey[] = journeysQ.data.map((j) => ({
      title: j.title, meta: j.meta, map: j.map, note: j.note,
    }));

    const recentlyAdded: Place[] = recentQ.data
      .map((slug) => places[slug])
      .filter((p): p is PlaceArticle => !!p)
      .map((p) => ({ id: p.id, name: p.name, region: p.region, type: p.type, img: p.img }));

    return {
      ready: true,
      places,
      storyArticles,
      stories,
      series,
      destinations,
      destinationHierarchy,
      destMarkers,
      destMapImages,
      journeys,
      recentlyAdded,
      heroImg: heroQ.data,
      typography: typoQ.data,
      sectionVisibility: Object.fromEntries(sectionsQ.data.map((s) => [s.id, s.visible])),
      sectionOrder: sectionsQ.data.filter((s) => s.page === 'home').map((s) => s.id),
      siteContent: siteContentQ.data,
    };
  }, [
    placesQ.data, storiesQ.data, destsQ.data, statesQ.data,
    markersQ.data, journeysQ.data, recentQ.data, heroQ.data, typoQ.data,
    seriesQ.data, sectionsQ.data, siteContentQ.data,
  ]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): ContentValue {
  return useContext(ContentContext);
}

/** Is a page section visible? Defaults to true for unregistered sections. */
export function useSectionVisible(id: string): boolean {
  const { sectionVisibility } = useContent();
  return sectionVisibility[id] ?? true;
}

/** Studio-edited section content with per-field fallbacks. */
export function useSiteContent<T extends object>(key: string, defaults: T): T {
  const { siteContent } = useContent();
  const v = siteContent[key];
  if (!v || typeof v !== 'object') return defaults;
  return { ...defaults, ...(v as T) };
}

/** Loads the studio-configured custom fonts and applies them site-wide. */
export function useSiteTypography() {
  const { typography } = useContent();
  useEffect(() => {
    const { fontsUrl, bodyFont, displayFont } = typography;
    const id = 'vazhi-custom-fonts';
    document.getElementById(id)?.remove();
    document.getElementById('vazhi-custom-fonts-style')?.remove();
    if (fontsUrl.trim()) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = fontsUrl.trim();
      document.head.appendChild(link);
    }
    const rules: string[] = [];
    if (bodyFont.trim()) rules.push(`body { font-family: '${bodyFont.trim()}', 'Inter', system-ui, sans-serif; }`);
    if (displayFont.trim()) rules.push(`.font-display { font-family: '${displayFont.trim()}', 'Cormorant Garamond', serif; }`);
    if (rules.length) {
      const style = document.createElement('style');
      style.id = 'vazhi-custom-fonts-style';
      style.textContent = rules.join('\n');
      document.head.appendChild(style);
    }
  }, [typography]);
}

/** Gate: renders children only once content is loaded; shows a quiet loader otherwise. */
export function ContentGate({ children }: { children: ReactNode }) {
  const { ready } = useContent();
  if (!ready) {
    return (
      <div className="bg-base text-ink flex min-h-screen items-center justify-center">
        <img
          src="/img/final/logo-black.png"
          alt="வழி — Vazhi"
          className="w-56 animate-pulse object-contain"
        />
      </div>
    );
  }
  return <>{children}</>;
}
