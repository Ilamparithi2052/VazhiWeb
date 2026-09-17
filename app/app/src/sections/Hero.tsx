import { useState } from 'react';
import { Link } from 'react-router';
import { IMG } from '../data';
import { useContent, useSiteContent } from '../content-provider';
import { ui } from '../components/Icons';
import { useLang } from '../i18n';
import { popularTa, placesTa } from '../content-ta';

const defaultPopular: { label: string; to: string }[] = [
  { label: 'Chola Temples', to: '/destinations/india' },
  { label: 'Buddhist Sites', to: '/destinations/srilanka' },
  { label: 'Japan', to: '/destinations/japan' },
  { label: 'Turkey', to: '/destinations/turkey' },
  { label: 'Armenia', to: '/destinations/armenia' },
];

interface HeroContent {
  eyebrow: string;
  h1a: string;
  h1b: string;
  h1c: string;
  sub: string;
  searchPh: string;
  popular: { label: string; to: string }[];
  featuredPlace: string;
}

const HERO_DEFAULTS: HeroContent = {
  eyebrow: '',
  h1a: '',
  h1b: '',
  h1c: '',
  sub: '',
  searchPh: '',
  popular: defaultPopular,
  featuredPlace: 'brihadisvara',
};

export default function Hero() {
  const { lang, t } = useLang();
  const { heroImg, places } = useContent();
  const hc = useSiteContent<HeroContent>('home_hero', HERO_DEFAULTS);
  const [q, setQ] = useState('');
  const chip = (label: string) => (lang === 'ta' ? (popularTa[label] ?? label) : label);
  const featured = places[hc.featuredPlace] ?? places.brihadisvara;

  return (
    <section id="top" className="relative mt-[76px] flex min-h-[calc(92vh-76px)] items-end overflow-hidden">
      {/* backdrop — starts below the fixed header so the image is never cropped by it */}
      <div className="absolute inset-0">
        <img
          src={IMG(heroImg)}
          alt="Brihadisvara Temple at golden hour"
          className="hero-drift h-full w-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-page via-page/55 to-page/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-page/80 via-page/25 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 pb-24 pt-40 md:px-8">
        <p className="eyebrow mb-5">{hc.eyebrow || t('hero.eyebrow')}</p>
        <h1 className="font-display max-w-3xl text-[2.9rem] leading-[1.04] text-parchbright md:text-[4.4rem]">
          {hc.h1a || t('hero.h1a')}
          <br />
          {hc.h1b || t('hero.h1b')}
          <br />
          <em className="text-bronze">{hc.h1c || t('hero.h1c')}</em>
        </h1>
        <p className="mt-6 max-w-xl text-[0.95rem] leading-relaxed text-soft">{hc.sub || t('hero.sub')}</p>

        {/* search — opens the atlas-wide search overlay */}
        <form
          className="card-ring mt-9 flex max-w-lg items-center gap-3 rounded-full bg-page/85 py-1.5 pl-6 pr-1.5 backdrop-blur-md transition-shadow focus-within:shadow-[inset_0_0_0_1px_rgba(217,165,92,0.55)]"
          onSubmit={(e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('vazhi:open-search', { detail: q }));
          }}
        >
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={hc.searchPh || t('hero.searchPh')}
            className="w-full bg-transparent text-sm text-parch placeholder-muted2 outline-none"
          />
          <button
            type="submit"
            aria-label={t('nav.search')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bronze text-bronzeink transition-transform hover:scale-105"
          >
            {ui.search({ className: 'h-[17px] w-[17px]' })}
          </button>
        </form>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-[0.7rem] tracking-wide">
          <span className="mr-1 uppercase tracking-[0.2em] text-lede">{t('hero.popular')}</span>
          {hc.popular.map((p) => (
            <Link
              key={p.label}
              to={p.to}
              className="rounded-full border border-bronze/45 bg-page/60 px-3.5 py-1.5 font-medium text-lede backdrop-blur-sm transition-colors hover:border-bronze/70 hover:text-parchbright"
            >
              {chip(p.label)}
            </Link>
          ))}
        </div>
      </div>

      {/* featured place card */}
      <aside className="card-ring absolute bottom-24 right-5 z-10 hidden w-64 rounded-xl bg-page/85 p-5 backdrop-blur-md md:right-8 lg:block">
        <div className="mb-2 flex items-center gap-2 text-bronze">
          {ui.pin({ className: 'h-4 w-4' })}
          <span className="text-[0.62rem] uppercase tracking-[0.24em]">{t('hero.featured')}</span>
        </div>
        <h3 className="font-display text-xl text-parch">
          {lang === 'ta' ? (placesTa[featured.id]?.name ?? featured.name) : featured.name}
        </h3>
        <p className="mt-0.5 text-xs text-mutedw">{featured.region} · {featured.type}</p>
        <Link
          to={`/place/${featured.id}`}
          className="mt-4 inline-flex items-center gap-2 text-[0.66rem] font-medium uppercase tracking-[0.22em] text-bronze transition-colors hover:text-parch"
        >
          {t('cta.explore')} {ui.arrow({ className: 'h-3.5 w-3.5' })}
        </Link>
      </aside>
    </section>
  );
}
