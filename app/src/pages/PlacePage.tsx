import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import PageShell from '../components/PageShell';
import ContributorsCard from '../components/ContributorsCard';
import { IMG } from '../data';
import { ui } from '../components/Icons';
import { useLang } from '../i18n';
import { locPlaceFrom, useLoc } from '../content-ta';
import { useContent } from '../content-provider';
import { toHtml } from '../richtext';
import { isSaved, pushRecent, toggleSaved } from '../lib/profile';
import type { PlaceArticle } from '../wiki';

/** great-circle distance in km */
function haversine(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export default function PlacePage() {
  const { placeId = '' } = useParams();
  const { lang, t } = useLang();
  const loc = useLoc();
  const { places, storyArticles, destinations } = useContent();
  const p = loc.place(placeId, lang);
  const [saved, setSaved] = useState(() => isSaved(placeId));

  useEffect(() => {
    if (p) pushRecent(placeId);
    setSaved(isSaved(placeId));
  }, [placeId, p]);

  if (!p) {
    return (
      <PageShell crumbs={[{ label: t('crumb.home'), to: '/' }, { label: t('crumb.notFound') }]}>
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-8">
          <h1 className="font-display text-4xl text-parchbright">{t('place.notFound')}</h1>
          <Link to="/" className="mt-4 inline-block text-sm text-bronze">{t('place.back')}</Link>
        </div>
      </PageShell>
    );
  }

  const hasGeo = typeof p.lat === 'number' && typeof p.lng === 'number';
  const lat = p.lat ?? 0;
  const lng = p.lng ?? 0;
  const gmapsEmbed = `https://www.google.com/maps?q=${lat},${lng}&z=14&output=embed`;
  const gmapsBig = `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  // nearby: same-coordinate places sorted by distance; falls back to curated "related"
  let nearby: { place: PlaceArticle; km: number | null }[] = [];
  if (hasGeo) {
    nearby = Object.values(places)
      .filter((q) => q.id !== p.id && typeof q.lat === 'number' && typeof q.lng === 'number')
      .map((q) => ({ place: q, km: haversine(lat, lng, q.lat as number, q.lng as number) }))
      .filter((n) => (n.km as number) <= 400)
      .sort((a, b) => (a.km as number) - (b.km as number))
      .slice(0, 5);
  }
  if (nearby.length === 0) {
    nearby = p.related
      .map((rid) => places[rid])
      .filter((r): r is PlaceArticle => !!r)
      .map((place) => ({ place, km: null }));
  }

  const dest = destinations.find((x) => x.id === p.destId);
  const destPlaceCount = Object.values(places).filter((q) => q.destId === p.destId).length;
  const storyCount = Object.keys(storyArticles).length;

  return (
    <PageShell
      crumbs={[
        { label: t('crumb.home'), to: '/' },
        { label: t('crumb.destinations'), to: '/destinations' },
        { label: p.country, to: `/destinations/${p.destId}` },
        { label: p.name },
      ]}
    >
      {/* hero */}
      <div className="mx-auto mt-6 max-w-[1280px] px-5 md:px-8">
        <div className="card-ring relative overflow-hidden rounded-2xl">
          <img src={IMG(p.img)} alt={p.name} className="h-[52vh] min-h-[340px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120d08]/90 via-[#120d08]/40 to-[#120d08]/10" />
          <button
            onClick={() => setSaved(toggleSaved(placeId))}
            aria-pressed={saved}
            className={`absolute right-5 top-5 flex items-center gap-2 rounded-full px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.18em] backdrop-blur-sm transition-all md:right-8 md:top-8 ${
              saved
                ? 'bg-bronze text-bronzeink shadow-lg'
                : 'bg-[#120d08]/60 text-[#e8c07a] ring-1 ring-[#e8c07a]/40 hover:bg-[#120d08]/80'
            }`}
          >
            {ui.bookmark({ className: 'h-3.5 w-3.5' })}
            {saved ? t('place.saved') : t('place.save')}
          </button>
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <div className="flex items-center gap-3 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-[#e8c07a]">
              <span>{t(`type.${p.type}`)}</span>
              <span className="text-[#b3a28b]">·</span>
              <span className="flex items-center gap-1.5 text-[#ded2bd]">
                {ui.pin({ className: 'h-3 w-3' })} {p.region} · {p.country}
              </span>
            </div>
            <h1 className="font-display mt-3 text-[3rem] leading-[1.05] text-[#f8f1e2] md:text-[4.6rem]">{p.name}</h1>
          </div>
        </div>
      </div>

      {/* body */}
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-12 md:px-8 min-[720px]:grid-cols-[1fr_300px] lg:grid-cols-[1fr_340px]">
        <article>
          <p className="font-display border-l-2 border-bronze/60 pl-5 text-[1.25rem] italic leading-relaxed text-lede">
            {p.summary}
          </p>
          {p.sections.map((s) => (
            <section key={s.heading} className="mt-10">
              <h2 className="font-display text-[1.7rem] text-parchbright">{s.heading}</h2>
              <div className="mt-1 h-px w-12 bg-bronze/50" />
              <div
                className="rich mt-4 text-[0.95rem] leading-[1.85] text-bodycopy"
                dangerouslySetInnerHTML={{ __html: toHtml(s.body) }}
              />
            </section>
          ))}
          <ContributorsCard contributors={p.contributors} />
        </article>

        {/* location sidebar — right panel from 720px up; capped + tidy when stacked */}
        <aside className="mx-auto w-full max-w-[440px] min-[720px]:sticky min-[720px]:top-24 min-[720px]:mx-0 min-[720px]:max-w-none min-[720px]:self-start">
          {hasGeo && (
            <div className="card-ring overflow-hidden rounded-xl bg-surf">
              <div className="relative">
                <iframe
                  title={`${p.name} — map`}
                  src={gmapsEmbed}
                  className="h-[190px] w-full border-0"
                  loading="lazy"
                />
                <a
                  href={gmapsBig}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-md bg-[#120d08]/80 px-2.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#e8c07a] backdrop-blur-sm transition-colors hover:bg-[#120d08]"
                >
                  {ui.arrowUpRight({ className: 'h-3 w-3' })}
                  {t('place.expandMap')}
                </a>
              </div>
              <div className="p-5">
                <p className="font-display text-[1.25rem] leading-tight text-parchbright">{p.name}</p>
                {p.address && <p className="mt-1.5 text-[0.78rem] leading-relaxed text-muted2">{p.address}</p>}
                <p className="mt-2.5 text-[0.68rem] tracking-[0.08em] text-faint">
                  {lat.toFixed(4)}°, {lng.toFixed(4)}°
                </p>
                <a
                  href={directions}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 rounded-full bg-bronze px-5 py-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-page transition-transform hover:scale-[1.02]"
                >
                  {ui.pin({ className: 'h-3.5 w-3.5' })}
                  {t('place.directions')}
                </a>
              </div>
            </div>
          )}

          <div className="card-ring mt-6 rounded-xl bg-surf p-6">
            <p className="eyebrow mb-4">{t('place.glance')}</p>
            <dl>
              {p.facts.map((f) => (
                <div key={f.label} className="flex justify-between gap-4 border-b border-bronze/10 py-2.5 last:border-0">
                  <dt className="text-[0.7rem] uppercase tracking-[0.14em] text-muted2">{f.label}</dt>
                  <dd className="text-right text-[0.8rem] text-parch">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {nearby.length > 0 && (
            <div className="mt-6">
              <p className="eyebrow mb-3">{t('place.nearby')}</p>
              {/* horizontal scroll row when stacked, vertical list in the side panel */}
              <div className="flex gap-3 overflow-x-auto pb-2 min-[720px]:flex-col min-[720px]:gap-0 min-[720px]:space-y-3 min-[720px]:overflow-visible min-[720px]:pb-0">
                {nearby.map(({ place, km }) => {
                  const r = locPlaceFrom(places, place.id, lang) ?? place;
                  return (
                    <Link key={place.id} to={`/place/${place.id}`} className="group flex w-[210px] shrink-0 items-center gap-3 rounded-lg p-1 transition-colors hover:bg-surf min-[720px]:w-auto min-[720px]:shrink">
                      <img src={IMG(r.img)} alt={r.name} className="card-ring h-14 w-20 shrink-0 rounded-md object-cover" />
                      <div className="min-w-0">
                        <p className="truncate text-sm text-parch transition-colors group-hover:text-bronze">{r.name}</p>
                        <p className="truncate text-[0.7rem] text-muted2">
                          {r.region}
                          {km !== null && <span className="text-faint"> · {km < 10 ? km.toFixed(1) : Math.round(km)} km</span>}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {dest && (
            <Link
              to={`/destinations/${dest.id}`}
              className="card-ring group mt-6 block rounded-xl bg-surf p-6 transition-colors hover:bg-surf2"
            >
              <p className="eyebrow">{t('place.guideEyebrow')}</p>
              <p className="font-display mt-2 text-[1.35rem] leading-tight text-parchbright transition-colors group-hover:text-bronze">
                {t('place.guideTitle', { dest: dest.name })}
              </p>
              <p className="mt-2 text-[0.72rem] uppercase tracking-[0.16em] text-muted2">
                {t('place.guideCounts', { places: String(destPlaceCount), stories: String(storyCount) })}
              </p>
              <p className="mt-3 flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-bronze">
                {t('place.guideCta')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">{ui.arrow({ className: 'h-3.5 w-3.5' })}</span>
              </p>
            </Link>
          )}
        </aside>
      </div>
    </PageShell>
  );
}
