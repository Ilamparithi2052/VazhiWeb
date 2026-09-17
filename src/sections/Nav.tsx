import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ui } from '../components/Icons';
import SearchOverlay from '../components/SearchOverlay';
import { IMG } from '../data';
import { useContent } from '../content-provider';
import { useLang, useTheme, useThemeValue, type Lang, tagLabel } from '../i18n';
import { useLoc } from '../content-ta';
import { getRecent, getSaved, removeSaved } from '../lib/profile';
import { useAuth } from '../hooks/useAuth';
import SignInModal from '../components/SignInModal';
import { trpc } from '@/providers/trpc';

type NavItem = { id: string; label?: string; labelTa?: string; href?: string };
const DEFAULT_MENU: NavItem[] = [{ id: 'explore' }, { id: 'stories' }, { id: 'atlas' }, { id: 'about' }];

// top-level nav items route to their own pages, not home-page sections
const linkKeys = [
  { key: 'nav.stories', to: '/stories' },
  { key: 'nav.atlas', to: '/destinations' },
];

const topics: { key: string; href: string }[] = [
  { key: 'col.Destinations', href: '/destinations' },
  { key: 'nav.atlas', href: '#atlas' },
  { key: 'nav.heritage', href: '#heritage' },
  { key: 'nav.journeys', href: '#journeys' },
  { key: 'nav.stories', href: '/stories' },
  { key: 'menu.interests', href: '#interests' },
];

const featuredPicks = ['gangaikonda', 'sigiriya'];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInitial, setSearchInitial] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  const sectionHref = (hash: string) => (onHome ? hash : `/${hash}`);
  const { lang, setLang, t } = useLang();
  const { isAuthenticated } = useAuth();
  const { theme, toggle } = useTheme();
  const activeTheme = useThemeValue();
  // header chrome is configurable from Studio → Settings (stored in DB)
  const navCfgQ = trpc.content.navConfig.useQuery();
  const cfg = navCfgQ.data;
  const showSearch = cfg?.showSearch ?? true;
  const showTheme = cfg?.showTheme ?? true;
  const showLang = cfg?.showLang ?? true;
  const showLogin = cfg?.showLogin ?? true;
  const menu = (cfg?.menu?.length ? cfg.menu : DEFAULT_MENU) as NavItem[];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close transient panels on navigation
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
    setLangOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // mega menu closes once the visitor starts scrolling (NatGeo behaviour)
  useEffect(() => {
    if (!menuOpen) return;
    const onScroll = () => setMenuOpen(false);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [menuOpen]);

  // hero search asks us to open the overlay
  useEffect(() => {
    const onOpen = (e: Event) => {
      setSearchInitial((e as CustomEvent<string>).detail ?? '');
      setSearchOpen(true);
    };
    window.addEventListener('vazhi:open-search', onOpen);
    return () => window.removeEventListener('vazhi:open-search', onOpen);
  }, []);

  // outside-click + Esc for dropdowns / mega menu
  useEffect(() => {
    if (!langOpen && !menuOpen && !profileOpen) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (langOpen && !langRef.current?.contains(target)) setLangOpen(false);
      if (profileOpen && !profileRef.current?.contains(target)) setProfileOpen(false);
      if (menuOpen && !(e.target as HTMLElement).closest('[data-explore]')) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLangOpen(false);
        setMenuOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [langOpen, menuOpen, profileOpen]);

  // profile data — refresh when panel opens or data changes
  useEffect(() => {
    const refresh = () => {
      setSavedIds(getSaved());
      setRecentIds(getRecent());
    };
    refresh();
    window.addEventListener('vazhi:profile-changed', refresh);
    return () => window.removeEventListener('vazhi:profile-changed', refresh);
  }, [profileOpen]);

  const langs: { id: Lang; label: string }[] = [
    { id: 'en', label: t('lang.en') },
    { id: 'ta', label: t('lang.ta') },
  ];

  const navLinkCls =
    'group relative text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-soft transition-colors hover:text-bronze';

  const { stories } = useContent();
  const loc = useLoc();
  const featured = loc.place('brihadisvara', lang);

  const profileRow = (id: string, onRemove?: (id: string) => void) => {
    const p = loc.place(id, lang);
    if (!p) return null;
    return (
      <li key={id} className="group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-surf2">
        <Link to={`/place/${id}`} onClick={() => setProfileOpen(false)} className="flex min-w-0 flex-1 items-center gap-3">
          <img src={IMG(p.img)} alt="" className="card-ring h-9 w-11 shrink-0 rounded-md object-cover" />
          <span className="min-w-0">
            <span className="block truncate text-[0.82rem] font-medium text-parch group-hover:text-bronze">{p.name}</span>
            <span className="block truncate text-[0.68rem] text-mutedw">{p.region}</span>
          </span>
        </Link>
        {onRemove && (
          <button
            aria-label="Remove"
            onClick={() => onRemove(id)}
            className="shrink-0 p-1 text-faint transition-colors hover:text-bronze"
          >
            {ui.close({ className: 'h-3 w-3' })}
          </button>
        )}
      </li>
    );
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled || !onHome || theme === 'light' || menuOpen
            ? 'bg-page/85 backdrop-blur-md shadow-[0_1px_0_rgba(217,164,92,0.14)]'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-2.5 md:px-8">
          <Link to="/" className="group flex items-center">
            <img
              src="/img/final/logo-black.png"
              alt="வழி — Vazhi"
              className="h-14 w-auto object-contain transition-all group-hover:opacity-80"
              style={{ filter: activeTheme === 'light' ? 'none' : 'invert(0.92) sepia(0.18)' }}
            />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {menu.map((item) => {
              if (item.id === 'explore' && !item.href) {
                return (
                  <button
                    key="explore"
                    data-explore
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-expanded={menuOpen}
                    className={`${navLinkCls} flex items-center gap-1.5 ${menuOpen ? 'text-bronze' : ''}`}
                  >
                    {t('nav.explore')}
                    <span className={`transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`}>
                      {ui.chevronD({ className: 'h-3 w-3' })}
                    </span>
                    <span className={`absolute -bottom-1.5 left-0 h-px bg-bronze transition-all duration-300 ${menuOpen ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </button>
                );
              }
              // custom item added from Studio — own label (+ optional Tamil) and link
              if (item.href) {
                const label = (lang === 'ta' && item.labelTa) ? item.labelTa : (item.label ?? item.id);
                const external = /^https?:\/\//.test(item.href);
                return external ? (
                  <a key={item.id + item.href} href={item.href} target="_blank" rel="noreferrer" className={navLinkCls}>
                    {label}
                    <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-bronze transition-all duration-300 group-hover:w-full" />
                  </a>
                ) : (
                  <Link key={item.id + item.href} to={item.href} className={navLinkCls}>
                    {label}
                    <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-bronze transition-all duration-300 group-hover:w-full" />
                  </Link>
                );
              }
              const link = linkKeys.find((l) => l.key === `nav.${item.id}`);
              const to = item.id === 'about' ? '/about' : link?.to;
              const labelKey = item.id === 'about' ? 'nav.about' : link?.key;
              if (!to || !labelKey) return null;
              return (
                <Link key={item.id} to={to} className={navLinkCls}>
                  {t(labelKey)}
                  <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-bronze transition-all duration-300 group-hover:w-full" />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 text-soft">
            {showSearch && (
            <button
              aria-label={t('nav.search')}
              title={t('nav.search')}
              onClick={() => {
                setSearchInitial('');
                setSearchOpen(true);
              }}
              className="text-lede transition-colors hover:text-bronze"
            >
              {ui.search({ className: 'h-[18px] w-[18px]' })}
            </button>
            )}

            {/* light / dark */}
            {showTheme && (
            <button
              aria-label={t('nav.theme')}
              title={t('nav.theme')}
              onClick={toggle}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-bronze/40 text-bronze transition-colors hover:bg-bronze/10"
            >
              {theme === 'dark'
                ? ui.sun({ className: 'h-[15px] w-[15px]' })
                : ui.moon({ className: 'h-[15px] w-[15px]' })}
            </button>
            )}

            {/* language */}
            {showLang && (
            <div ref={langRef} className="relative">
              <button
                aria-label={t('nav.lang')}
                title={t('nav.lang')}
                onClick={() => setLangOpen((v) => !v)}
                className="flex h-8 items-center gap-1.5 rounded-full border border-bronze/40 px-3 text-[0.7rem] font-medium text-bronze transition-colors hover:bg-bronze/10"
              >
                {ui.globe({ className: 'h-[14px] w-[14px]' })}
                {lang === 'en' ? 'EN' : 'தமிழ்'}
              </button>
              {langOpen && (
                <div className="card-ring absolute right-0 top-full mt-2 w-36 overflow-hidden rounded-xl bg-surf py-1.5 shadow-xl">
                  {langs.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        setLang(l.id);
                        setLangOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[0.78rem] transition-colors ${
                        lang === l.id ? 'text-bronze' : 'text-parch hover:bg-surf2'
                      }`}
                    >
                      {l.label}
                      {lang === l.id && <span className="text-[0.6rem]">●</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* profile */}
            {showLogin && (
            <div ref={profileRef} className="relative">
              <button
                aria-label={isAuthenticated ? t('nav.profile') : t('signin.open')}
                title={isAuthenticated ? t('nav.profile') : t('signin.open')}
                onClick={() => (isAuthenticated ? setProfileOpen((v) => !v) : setSignInOpen(true))}
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                  profileOpen
                    ? 'border-bronze bg-bronze/10 text-bronze'
                    : 'border-bronze/40 text-bronze hover:bg-bronze/10'
                }`}
              >
                {ui.user({ className: 'h-[15px] w-[15px]' })}
              </button>
              {profileOpen && (
                <div className="menu-in card-ring absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl bg-surf shadow-xl">
                  <div className="flex items-center gap-3 border-b border-bronze/20 px-4 py-3.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bronze text-bronzeink">
                      {ui.user({ className: 'h-5 w-5' })}
                    </span>
                    <div>
                      <p className="text-[0.9rem] font-semibold text-parchbright">{t('profile.traveller')}</p>
                      <p className="text-[0.66rem] text-mutedw">{t('profile.sub')}</p>
                    </div>
                  </div>
                  <div className="max-h-[52vh] overflow-y-auto px-2 py-2">
                    <p className="px-2 pb-1 pt-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-bronze">
                      {t('profile.saved')}
                    </p>
                    {savedIds.length ? (
                      <ul>{savedIds.map((id) => profileRow(id, removeSaved))}</ul>
                    ) : (
                      <p className="px-2 pb-2 text-[0.74rem] leading-relaxed text-mutedw">{t('profile.emptySaved')}</p>
                    )}
                    <p className="px-2 pb-1 pt-2.5 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-bronze">
                      {t('profile.recent')}
                    </p>
                    {recentIds.length ? (
                      <ul>{recentIds.slice(0, 5).map((id) => profileRow(id))}</ul>
                    ) : (
                      <p className="px-2 pb-2 text-[0.74rem] leading-relaxed text-mutedw">{t('profile.emptyRecent')}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        </div>

        {/* Explore mega menu */}
        {menuOpen && (
          <div
            data-explore
            className="menu-in absolute inset-x-0 top-full border-t border-bronze/20 bg-surf shadow-2xl"
          >
            <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-9 md:px-8 lg:grid-cols-[1fr_1.5fr_1fr]">
              {/* topics */}
              <div>
                <p className="mb-5 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-mutedw">
                  {t('menu.topics')} —
                </p>
                <ul className="space-y-3.5">
                  {topics.map((tp) =>
                    tp.href.startsWith('/') ? (
                      <li key={tp.key}>
                        <Link
                          to={tp.href}
                          onClick={() => setMenuOpen(false)}
                          className="font-display text-[1.45rem] leading-tight text-parchbright transition-colors hover:text-bronze"
                        >
                          {t(tp.key)}
                        </Link>
                      </li>
                    ) : (
                      <li key={tp.key}>
                        <a
                          href={sectionHref(tp.href)}
                          onClick={() => setMenuOpen(false)}
                          className="font-display text-[1.45rem] leading-tight text-parchbright transition-colors hover:text-bronze"
                        >
                          {t(tp.key)}
                        </a>
                      </li>
                    ),
                  )}
                </ul>
              </div>

              {/* latest stories */}
              <div>
                <p className="mb-5 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-mutedw">
                  {t('menu.latest')} —
                </p>
                <ul className="space-y-4">
                  {stories.slice(0, 4).map((s) => {
                    const ls = loc.story(s.id, lang);
                    return (
                      <li key={s.id}>
                        <Link
                          to={`/stories/${s.id}`}
                          onClick={() => setMenuOpen(false)}
                          className="group flex items-center gap-4"
                        >
                          <img
                            src={IMG(s.img)}
                            alt=""
                            className="card-ring h-16 w-24 shrink-0 rounded-lg object-cover"
                          />
                          <span className="min-w-0">
                            <span className="block text-[0.6rem] uppercase tracking-[0.2em] text-bronze">
                              {tagLabel(t, s.tag)} · {s.time}
                            </span>
                            <span className="mt-1 block truncate text-[0.95rem] font-medium text-parch transition-colors group-hover:text-bronze">
                              {ls?.title ?? s.title}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <Link
                  to="/stories"
                  onClick={() => setMenuOpen(false)}
                  className="mt-7 inline-flex items-center gap-2 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-bronze transition-colors hover:text-gold"
                >
                  {t('menu.allStories')} {ui.arrow({ className: 'h-3.5 w-3.5' })}
                </Link>
              </div>

              {/* recommends — text links + one feature image, like the reference */}
              <div>
                <p className="mb-5 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-mutedw">
                  {t('menu.featured')} —
                </p>
                <ul className="space-y-2">
                  {featuredPicks.map((id) => {
                    const p = loc.place(id, lang);
                    if (!p) return null;
                    return (
                      <li key={id}>
                        <Link
                          to={`/place/${id}`}
                          onClick={() => setMenuOpen(false)}
                          className="group flex items-center justify-between gap-2 text-[0.85rem] text-soft transition-colors hover:text-bronze"
                        >
                          <span className="truncate">{p.name}</span>
                          <span className="text-faint transition-colors group-hover:text-bronze">
                            {ui.arrowUpRight({ className: 'h-3.5 w-3.5' })}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                {featured && (
                  <Link
                    to="/place/brihadisvara"
                    onClick={() => setMenuOpen(false)}
                    className="card-ring group relative mt-4 block overflow-hidden rounded-xl"
                  >
                    <img src={IMG(featured.img)} alt={featured.name} className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#120d08]/90 via-[#120d08]/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="text-[0.58rem] uppercase tracking-[0.22em] text-[#e8c07a]">{t('hero.featured')}</p>
                      <p className="font-display mt-0.5 text-[1.15rem] leading-tight text-[#f8f1e2]">{featured.name}</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <SearchOverlay open={searchOpen} initial={searchInitial} onClose={() => setSearchOpen(false)} />
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}
