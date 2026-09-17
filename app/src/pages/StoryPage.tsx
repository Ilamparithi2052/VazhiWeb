import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import PageShell from '../components/PageShell';
import ContributorsCard from '../components/ContributorsCard';
import { IMG } from '../data';
import { useContent } from '../content-provider';
import { useLang, tagLabel } from '../i18n';
import { useLoc } from '../content-ta';
import { toHtml } from '../richtext';

export default function StoryPage() {
  const { storyId = '' } = useParams();
  const { lang, t } = useLang();
  const { storyArticles, series } = useContent();
  const loc = useLoc();
  const s = loc.story(storyId, lang);

  // SEO: reflect per-post settings into the document head
  useEffect(() => {
    if (!s) return;
    const prevTitle = document.title;
    document.title = `${s.seoTitle || s.title} — Vazhi`;
    const setMeta = (name: string, content: string) => {
      if (!content) return;
      let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    setMeta('description', s.seoDescription || s.lede || '');
    setMeta('keywords', s.seoKeywords || '');
    return () => { document.title = prevTitle; };
  }, [s?.id, s?.seoTitle, s?.seoDescription, s?.seoKeywords, s?.title, s?.lede]);

  if (!s) {
    return (
      <PageShell crumbs={[{ label: t('crumb.home'), to: '/' }, { label: t('crumb.stories'), to: '/stories' }, { label: t('crumb.notFound') }]}>
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-8">
          <h1 className="font-display text-4xl text-parchbright">{t('story.notFound')}</h1>
        </div>
      </PageShell>
    );
  }

  const relatedPlace = s.placeId ? loc.place(s.placeId, lang) : undefined;
  const parentSeries = s.seriesSlug ? series.find((x) => x.id === s.seriesSlug) : undefined;
  const taggedPlaces = (s.relatedPlaces ?? [])
    .map((id) => loc.place(id, lang))
    .filter((p): p is NonNullable<typeof p> => !!p && p.id !== s.placeId);
  // related reading: same series first, then stories sharing places, then the rest
  const relatedScore = (x: (typeof storyArticles)[string]) =>
    (s.seriesSlug && x.seriesSlug === s.seriesSlug ? 2 : 0) +
    (s.placeId && x.placeId === s.placeId ? 1 : 0) +
    ((x.relatedPlaces ?? []).some((id) => id === s.placeId || (s.relatedPlaces ?? []).includes(id)) ? 1 : 0);
  const others = Object.values(storyArticles)
    .filter((x) => x.id !== s.id)
    .sort((a, b) => relatedScore(b) - relatedScore(a))
    .slice(0, 3);

  return (
    <PageShell crumbs={[{ label: t('crumb.home'), to: '/' }, { label: t('crumb.stories'), to: '/stories' }, { label: s.title }]}>
      <div className="mx-auto max-w-[820px] px-5 py-10 md:px-8">
        <p className="text-[0.64rem] uppercase tracking-[0.26em] text-bronze">{tagLabel(t, s.tag)}</p>
        {parentSeries && (
          <Link
            to={`/series/${parentSeries.id}`}
            className="mt-2 inline-flex items-center gap-1.5 text-[0.64rem] uppercase tracking-[0.2em] text-mutedw transition-colors hover:text-bronze"
          >
            {t('series.eyebrow')} · <span className="underline underline-offset-4">{(lang === 'ta' ? parentSeries.nameTa : null) ?? parentSeries.name}</span>
          </Link>
        )}
        <h1 className="font-display mt-3 text-[2.4rem] leading-[1.12] text-parchbright md:text-[3.2rem]">{s.title}</h1>
        <p className="mt-4 text-[0.72rem] uppercase tracking-[0.2em] text-muted2">{s.time} · {t('story.written')}</p>

        <figure className="card-ring mt-8 overflow-hidden rounded-2xl">
          <img src={IMG(s.img)} alt={s.title} className="max-h-[440px] w-full object-cover" />
        </figure>

        <p className="font-display mt-10 border-l-2 border-bronze/60 pl-5 text-[1.3rem] italic leading-relaxed text-lede">
          {s.lede}
        </p>
        <div
          className="rich mt-6 text-[0.98rem] leading-[1.9] text-bodycopy"
          dangerouslySetInnerHTML={{ __html: toHtml(s.body) }}
        />

        <ContributorsCard contributors={s.contributors} />

        {relatedPlace && (
          <Link
            to={`/place/${relatedPlace.id}`}
            className="card-ring group mt-12 flex items-center gap-5 rounded-xl bg-surf p-5 transition-colors hover:bg-surf2"
          >
            <img src={IMG(relatedPlace.img)} alt={relatedPlace.name} className="card-ring h-20 w-28 rounded-lg object-cover" />
            <div className="flex-1">
              <p className="text-[0.62rem] uppercase tracking-[0.22em] text-muted2">{t('story.fromAtlas')}</p>
              <p className="font-display mt-1 text-[1.4rem] text-parch transition-colors group-hover:text-bronze">
                {relatedPlace.name}
              </p>
              <p className="text-[0.75rem] text-mutedw">{relatedPlace.region}</p>
            </div>
            <span className="pr-2 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-bronze">{t('story.openPlace')}</span>
          </Link>
        )}

        {taggedPlaces.length > 0 && (
          <div className="mt-10 border-t border-bronze/12 pt-6">
            <p className="text-[0.62rem] uppercase tracking-[0.22em] text-muted2">Places in this story</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {taggedPlaces.map((p) => (
                <Link
                  key={p.id}
                  to={`/place/${p.id}`}
                  className="rounded-full border border-bronze/30 px-4 py-1.5 text-[0.78rem] text-parch transition-colors hover:border-bronze hover:text-bronze"
                >
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-[1280px] px-5 pb-8 pt-6 md:px-8">
        <div className="border-t border-bronze/12 pt-10">
          <p className="eyebrow mb-6">{parentSeries ? `More from ${parentSeries.name}` : t('story.more')}</p>
          <div className="grid gap-6 sm:grid-cols-3">
            {others.map((o0) => {
              const o = loc.story(o0.id, lang) ?? o0;
              return (
              <Link key={o.id} to={`/stories/${o.id}`} className="group">
                <div className="card-ring overflow-hidden rounded-xl">
                  <img src={IMG(o.img)} alt={o.title} loading="lazy" className="h-[150px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
                </div>
                <p className="mt-3 text-[0.6rem] uppercase tracking-[0.24em] text-bronze">{tagLabel(t, o.tag)}</p>
                <h3 className="font-display mt-1 text-[1.2rem] leading-snug text-parch transition-colors group-hover:text-bronze">{o.title}</h3>
              </Link>
              );
            })}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
