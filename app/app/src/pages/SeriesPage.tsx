import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import PageShell from '../components/PageShell';
import Pager from '../components/Pager';
import { IMG } from '../data';
import { useContent } from '../content-provider';
import { useLang, tagLabel } from '../i18n';
import { storiesTa } from '../content-ta';

/** /series/:seriesId — all stories grouped under one series. */
export default function SeriesPage() {
  const { seriesId } = useParams();
  const { lang, t } = useLang();
  const { stories, series } = useContent();

  const se = series.find((x) => x.id === seriesId);
  if (!se) {
    return (
      <PageShell crumbs={[{ label: t('crumb.home'), to: '/' }, { label: t('crumb.stories'), to: '/stories' }, { label: t('series.eyebrow') }]}>
        <div className="mx-auto max-w-[1280px] px-5 py-20 text-center md:px-8">
          <p className="text-mutedw">—</p>
          <Link to="/stories" className="mt-4 inline-block text-sm text-bronze underline">{t('seriespage.back')}</Link>
        </div>
      </PageShell>
    );
  }

  const name = (lang === 'ta' ? se.nameTa : null) ?? se.name;
  const desc = (lang === 'ta' ? se.descTa : null) ?? se.description;
  const inSeries = stories.filter((s) => s.seriesSlug === se.id);

  const [page, setPage] = useState(1);
  const listTop = useRef<HTMLDivElement>(null);
  const PER_PAGE = 9; // 3 rows of 3
  const pages = Math.max(1, Math.ceil(inSeries.length / PER_PAGE));
  const safePage = Math.min(page, pages);
  const pageStories = inSeries.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const goto = (p: number) => {
    setPage(p);
    listTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <PageShell crumbs={[{ label: t('crumb.home'), to: '/' }, { label: t('crumb.stories'), to: '/stories' }, { label: name }]}>
      {/* series hero */}
      <div className="relative overflow-hidden">
        {se.img && (
          <>
            <img src={IMG(se.img)} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[#120d08]/55" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#120d08]/90 via-[#120d08]/45 to-[#120d08]/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
          </>
        )}
        <div className="relative mx-auto max-w-[1280px] px-5 py-16 md:px-8 md:py-20">
          <p className="eyebrow mb-3">{t('series.eyebrow')}</p>
          <h1 className="font-display max-w-2xl text-[2.4rem] leading-tight text-parchbright md:text-[3.2rem]">{name}</h1>
          {desc && <p className="mt-4 max-w-xl text-sm leading-relaxed text-parch/85">{desc}</p>}
          <p className="mt-4 text-[0.68rem] uppercase tracking-[0.22em] text-bronze">
            {se.count === 1 ? t('series.one') : t('series.count', { count: se.count })}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-5 py-12 md:px-8">
        <div ref={listTop} className="scroll-mt-24" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        <Pager page={safePage} pages={pages} onPage={goto} />

        <Link to="/stories" className="mt-12 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-bronze transition-colors hover:text-parchbright">
          <span aria-hidden className="inline-block rotate-180">→</span> {t('seriespage.back')}
        </Link>
      </div>
    </PageShell>
  );
}
