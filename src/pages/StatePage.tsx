import { Link, useParams } from 'react-router';
import PageShell from '../components/PageShell';
import { useContent } from '../content-provider';
import { ui } from '../components/Icons';
import { useLang } from '../i18n';
import { destTa, hierarchyTa } from '../content-ta';

export default function StatePage() {
  const { destId = '', stateId = '' } = useParams();
  const { lang, t } = useLang();
  const { destinations, destinationHierarchy } = useContent();
  const d0 = destinations.find((x) => x.id === destId);
  const d = d0 && { ...d0, name: (lang === 'ta' ? destTa[d0.id]?.name : undefined) ?? d0.name };
  const s = destinationHierarchy[destId]?.find((x) => x.id === stateId);

  if (!d || !s) {
    return (
      <PageShell crumbs={[{ label: t('crumb.home'), to: '/' }, { label: t('crumb.notFound') }]}>
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-8">
          <h1 className="font-display text-4xl text-parchbright">{t('state.notFound')}</h1>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      crumbs={[
        { label: t('crumb.home'), to: '/' },
        { label: t('crumb.destinations'), to: '/destinations' },
        { label: d.name, to: `/destinations/${d.id}` },
        { label: (lang === 'ta' ? hierarchyTa[s.id] : undefined) ?? s.name },
      ]}
    >
      <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-8">
        <p className="eyebrow mb-3">{d.name}</p>
        <h1 className="font-display text-[2.4rem] text-parchbright md:text-[3rem]">{(lang === 'ta' ? hierarchyTa[s.id] : undefined) ?? s.name}</h1>
        <p className="mt-2 text-sm text-mutedw">{t('state.docNote', { n: s.districts.length })}</p>

        <div className="mt-10 space-y-4">
          {s.districts.map((dist, i) => (
            <Link
              key={dist.id}
              to={`/destinations/${d.id}/states/${s.id}/${dist.id}`}
              className="card-ring group flex items-center justify-between rounded-xl bg-surf px-6 py-6 transition-colors hover:bg-surf2"
            >
              <div className="flex items-center gap-6">
                <span className="font-display text-2xl text-faint">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-display text-[1.5rem] text-parch transition-colors group-hover:text-bronze">{(lang === 'ta' ? hierarchyTa[dist.id] : undefined) ?? dist.name}</h3>
                  <p className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-muted2">
                    {t(dist.placeIds.length > 1 ? 'state.placesInAtlas' : 'state.placeInAtlas', { n: dist.placeIds.length })}
                  </p>
                </div>
              </div>
              <span className="text-mutedw transition-all group-hover:translate-x-1 group-hover:text-bronze">
                {ui.arrow({ className: 'h-5 w-5' })}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
