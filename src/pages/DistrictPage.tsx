import { Link, useParams } from 'react-router';
import PageShell from '../components/PageShell';
import { IMG } from '../data';
import { useContent } from '../content-provider';
import { useLang } from '../i18n';
import { destTa, hierarchyTa, useLoc } from '../content-ta';

export default function DistrictPage() {
  const { destId = '', stateId = '', districtId = '' } = useParams();
  const { lang, t } = useLang();
  const { destinations, destinationHierarchy } = useContent();
  const loc = useLoc();
  const d0 = destinations.find((x) => x.id === destId);
  const d = d0 && { ...d0, name: (lang === 'ta' ? destTa[d0.id]?.name : undefined) ?? d0.name };
  const s = destinationHierarchy[destId]?.find((x) => x.id === stateId);
  const dist = s?.districts.find((x) => x.id === districtId);

  if (!d || !s || !dist) {
    return (
      <PageShell crumbs={[{ label: t('crumb.home'), to: '/' }, { label: t('crumb.notFound') }]}>
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-8">
          <h1 className="font-display text-4xl text-parchbright">{t('district.notFound')}</h1>
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
        { label: (lang === 'ta' ? hierarchyTa[s.id] : undefined) ?? s.name, to: `/destinations/${d.id}/states/${s.id}` },
        { label: (lang === 'ta' ? hierarchyTa[dist.id] : undefined) ?? dist.name },
      ]}
    >
      <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-8">
        <p className="eyebrow mb-3">{(lang === 'ta' ? hierarchyTa[s.id] : undefined) ?? s.name} · {d.name}</p>
        <h1 className="font-display text-[2.4rem] text-parchbright md:text-[3rem]">{(lang === 'ta' ? hierarchyTa[dist.id] : undefined) ?? dist.name}</h1>
        <p className="mt-2 text-sm text-mutedw">{t('district.note')}</p>

        <div className="mt-10 space-y-6">
          {dist.placeIds.map((pid) => {
            const p = loc.place(pid, lang);
            if (!p) return null;
            return (
              <Link
                key={pid}
                to={`/place/${pid}`}
                className="card-ring group flex flex-col overflow-hidden rounded-xl bg-surf transition-colors hover:bg-surf2 sm:flex-row"
              >
                <img src={IMG(p.img)} alt={p.name} className="h-52 w-full object-cover sm:h-auto sm:w-[280px]" />
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="flex items-center gap-3 text-[0.62rem] uppercase tracking-[0.22em]">
                      <span className="text-bronze">{t(`type.${p.type}`)}</span>
                      <span className="text-muted2">{p.region}</span>
                    </div>
                    <h3 className="font-display mt-2 text-[1.7rem] text-parch transition-colors group-hover:text-bronze">{p.name}</h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-mutedw">{p.summary}</p>
                  </div>
                  <p className="mt-4 text-[0.66rem] font-medium uppercase tracking-[0.22em] text-bronze">
                    {t('district.readArticle')}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
