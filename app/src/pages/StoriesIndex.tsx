import { useRef, useState } from 'react';
import { Link } from 'react-router';
import PageShell from '../components/PageShell';
import Pager from '../components/Pager';
import { IMG } from '../data';
import { useContent } from '../content-provider';
import { useLang, tagLabel } from '../i18n';
import { storiesTa } from '../content-ta';

const STORIES_PER_PAGE = 9; // 3 rows of 3
const SERIES_PER_PAGE = 4;

export default function StoriesIndex() {
  const { lang, t } = useLang();
  const { stories, series } = useContent();
  const [storyPage, setStoryPage] = useState(1);
  const [seriesPage, setSeriesPage] = useState(1);
  const storiesTop = useRef<HTMLDivElement>(null);

  const storyPages = Math.max(1, Math.ceil(stories.length / STORIES_PER_PAGE));
  const safeStoryPage = Math.min(storyPage, storyPages);
  const pageStories = stories.slice((safeStoryPage - 1) * STORIES_PER_PAGE, safeStoryPage * STORIES_PER_PAGE);

  const seriesPages = Math.max(1, Math.ceil(series.length / SERIES_PER_PAGE));
  const safeSeriesPage = Math.min(seriesPage, seriesPages);
  const pageSeries = series.slice((safeSeriesPage - 1) * SERIES_PER_PAGE, safeSeriesPage * SERIES_PER_PAGE);

  const gotoStoryPage = (p: number) => {
    setStoryPage(p);
    storiesTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <PageShell crumbs={[{ label: t('crumb.home'), to: '/' }, { label: t('crumb.stories') }]}>
      <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-8">
        <p className="eyebrow mb-3">{t('sect.stories.eyebrow')}</p>
        <h1 className="font-display text-[2.4rem] text-parchbright md:text-[3rem]">{t('sect.stories.title')}</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-mutedw">
          {t('storiesindex.blurb')}
        </p>

        {/* ------------ all stories — 9 per page (3 rows) ------------ */}
        <div ref={storiesTop} className="scroll-mt-24" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pageStories.map((s) => (
            <Link key={s.id} to={`/stories/${s.id}`} className="group">
              <div className="card-ring overflow-hidden rounded-xl">
                <img
                  src={IMG(s.img)}
                  alt={s.title}
                  loading="lazy"
                  className="h-[200px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
              </div>
              <p className="mt-4 text-[0.62rem] uppercase tracking-[0.24em] text-bronze">{tagLabel(t, s.tag)}</p>
              <h3 className="font-display mt-1.5 text-[1.4rem] leading-snug text-parch transition-colors group-hover:text-bronze">
                {(lang === 'ta' ? storiesTa[s.id]?.title : undefined) ?? s.title}
              </h3>
              <p className="mt-1.5 text-[0.72rem] text-muted2">{(lang === 'ta' ? storiesTa[s.id]?.time : undefined) ?? s.time}</p>
            </Link>
          ))}
        </div>
        <Pager page={safeStoryPage} pages={storyPages} onPage={gotoStoryPage} />

        {/* ------------ series shelf — 4 per page, below the stories ------------ */}
        {series.length > 0 && (
          <section className="mt-24 pt-16">
            <p className="eyebrow mb-2">{t('series.eyebrow')}</p>
            <h2 className="font-display text-[1.8rem] text-parchbright md:text-[2.1rem]">{t('series.title')}</h2>
            <p className="mt-2 max-w-lg text-[0.82rem] leading-relaxed text-mutedw">{t('series.blurb')}</p>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {pageSeries.map((se) => (
                <Link
                  key={se.id}
                  to={`/series/${se.id}`}
                  className="group card-ring relative block h-[240px] overflow-hidden rounded-xl"
                >
                  {se.img && (
                    <img
                      src={IMG(se.img)}
                      alt={se.name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120d08]/90 via-[#120d08]/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-[0.6rem] uppercase tracking-[0.24em] text-bronze">
                      {se.count === 1 ? t('series.one') : t('series.count', { count: se.count })}
                    </p>
                    <h3 className="font-display mt-1.5 text-[1.45rem] leading-snug text-parchbright transition-colors group-hover:text-bronze">
                      {(lang === 'ta' ? se.nameTa : null) ?? se.name}
                    </h3>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-parch/80 transition-colors group-hover:text-bronze">
                      {t('series.cta')} <span aria-hidden>→</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <Pager page={safeSeriesPage} pages={seriesPages} onPage={setSeriesPage} />
          </section>
        )}
      </div>
    </PageShell>
  );
}
