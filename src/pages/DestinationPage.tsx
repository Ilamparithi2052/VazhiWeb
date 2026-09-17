import { Link, useParams } from 'react-router';
import PageShell from '../components/PageShell';
import MapPanel from '../components/MapPanel';
import { IMG } from '../data';
import { useContent } from '../content-provider';
import { ui } from '../components/Icons';
import { useLang } from '../i18n';
import { destTa, hierarchyTa, useLoc } from '../content-ta';

export default function DestinationPage() {
  const { destId = '' } = useParams();
  const { lang, t } = useLang();
  const { destinations, destinationHierarchy, places } = useContent();
  const loc = useLoc();
  const d0 = destinations.find((x) => x.id === destId);
  const d = d0 && {
    ...d0,
    name: (lang === 'ta' ? destTa[d0.id]?.name : undefined) ?? d0.name,
    blurb: (lang === 'ta' ? destTa[d0.id]?.blurb : undefined) ?? d0.blurb,
    places: (lang === 'ta' ? destTa[d0.id]?.places : undefined) ?? d0.places,
  };
  const states = destinationHierarchy[destId] ?? [];
  const hasStates = states.length > 0;

  if (!d) {
    return (
      <PageShell crumbs={[{ label: t('crumb.home'), to: '/' }, { label: t('crumb.destinations'), to: '/destinations' }, { label: t('crumb.notFound') }]}>
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-8">
          <h1 className="font-display text-4xl text-parchbright">{t('dest.notFound')}</h1>
          <Link to="/destinations" className="mt-4 inline-block text-sm text-bronze">{t('dest.allDest')}</Link>
        </div>
      </PageShell>
    );
  }

  // All mapped places for destinations without a states hierarchy
  const flatPlaces = Object.values(places).filter((p) => p.destId === d.id);

  return (
    <PageShell crumbs={[{ label: t('crumb.home'), to: '/' }, { label: t('crumb.destinations'), to: '/destinations' }, { label: d.name }]}>
      <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-3">{t('dest.eyebrow')}</p>
            <h1 className="font-display text-[2.4rem] text-parchbright md:text-[3rem]">{d.name}</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-mutedw">{d.blurb} · {d.places} {t('dest.docSuffix')}</p>
          </div>
          <div className="card-ring rounded-lg bg-surf px-5 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-mutedw">
            {hasStates ? t('dest.statesChip', { n: states.length }) : t('dest.placesChip', { n: flatPlaces.length })}
          </div>
        </div>

        {/* interactive map */}
        <div className="mt-8">
          <MapPanel destId={d.id} />
        </div>

        {/* states hierarchy */}
        {hasStates ? (
          <section className="mt-14">
            <h2 className="font-display text-[1.8rem] text-parchbright">{t('dest.browse')}</h2>
            <p className="mt-1 text-sm text-mutedw">{t('dest.hierarchy')}</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {states.map((s) => (
                <Link
                  key={s.id}
                  to={`/destinations/${d.id}/states/${s.id}`}
                  className="card-ring group flex items-center justify-between rounded-xl bg-surf px-6 py-6 transition-colors hover:bg-surf2"
                >
                  <div>
                    <h3 className="font-display text-[1.5rem] text-parch transition-colors group-hover:text-bronze">{(lang === 'ta' ? hierarchyTa[s.id] : undefined) ?? s.name}</h3>
                    <p className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-muted2">
                      {t(s.districts.length > 1 ? 'dest.districts' : 'dest.district', { n: s.districts.length })} · {t('dest.places', { n: s.districts.reduce((n, x) => n + x.placeIds.length, 0) })}
                    </p>
                  </div>
                  <span className="text-mutedw transition-all group-hover:translate-x-1 group-hover:text-bronze">
                    {ui.arrow({ className: 'h-5 w-5' })}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <section className="mt-14">
            <h2 className="font-display text-[1.8rem] text-parchbright">{t('dest.placesIn', { name: d.name })}</h2>
            <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
              {flatPlaces.map((p0) => {
                const p = loc.place(p0.id, lang) ?? p0;
                return (
                <Link key={p.id} to={`/place/${p.id}`} className="group">
                  <div className="card-ring overflow-hidden rounded-xl">
                    <img src={IMG(p.img)} alt={p.name} loading="lazy" className="h-[130px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]" />
                  </div>
                  <h3 className="font-display mt-3 text-[1.05rem] leading-tight text-parch transition-colors group-hover:text-bronze">{p.name}</h3>
                  <p className="mt-0.5 text-[0.7rem] text-muted2">{p.region}</p>
                </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}
