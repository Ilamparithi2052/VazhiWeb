import { Link } from 'react-router';
import PageShell from '../components/PageShell';
import Reveal from '../components/Reveal';
import { ui, icons } from '../components/Icons';
import { useLang } from '../i18n';
import { useContent } from '../content-provider';

export default function AboutPage() {
  const { t } = useLang();
  const { places, storyArticles, journeys } = useContent();

  const stats: { n: string; key: string }[] = [
    { n: String(Object.keys(places).length), key: 'about.statPlaces' },
    { n: String(new Set(Object.values(places).map((p) => p.country)).size), key: 'about.statCountries' },
    { n: String(journeys.length), key: 'about.statJourneys' },
    { n: String(Object.keys(storyArticles).length), key: 'about.statStories' },
  ];

  const how: { icon: (p: { className?: string }) => React.ReactNode; tKey: string; dKey: string }[] = [
    { icon: (p) => ui.globe(p), tKey: 'about.how1t', dKey: 'about.how1d' },
    { icon: (p) => ui.pin(p), tKey: 'about.how2t', dKey: 'about.how2d' },
    { icon: (p) => icons.literature(p), tKey: 'about.how3t', dKey: 'about.how3d' },
  ];

  return (
    <PageShell crumbs={[{ label: t('crumb.home'), to: '/' }, { label: t('nav.about') }]}>
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        {/* intro */}
        <Reveal>
          <div className="max-w-3xl py-14">
            <p className="eyebrow mb-4">{t('about.eyebrow')}</p>
            <h1 className="font-display text-[2.6rem] leading-[1.08] text-parchbright md:text-[3.4rem]">
              {t('about.title')}
            </h1>
            <div className="mt-8 space-y-5 text-[0.98rem] leading-relaxed text-bodycopy">
              <p>{t('about.p1')}</p>
              <p>{t('about.p2')}</p>
              <p>{t('about.p3')}</p>
              <p>{t('about.p4')}</p>
            </div>
          </div>
        </Reveal>

        {/* stats */}
        <Reveal>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-bronze/20 card-ring md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.key} className="bg-surf px-6 py-8 text-center">
                <p className="font-display text-[2.4rem] leading-none text-bronze">{s.n}</p>
                <p className="mt-2 text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-mutedw">
                  {t(s.key)}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* how the atlas works */}
        <Reveal>
          <div className="py-14">
            <h2 className="font-display text-[1.9rem] text-parchbright">{t('about.howTitle')}</h2>
            <div className="mt-3 h-px w-14 bg-bronze/50" />
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {how.map((h) => (
                <div key={h.tKey} className="card-ring group rounded-2xl bg-surf p-7 transition-colors hover:bg-surf2">
                  <span className="text-bronze transition-colors group-hover:text-gold">
                    {h.icon({ className: 'h-7 w-7' })}
                  </span>
                  <h3 className="font-display mt-4 text-[1.3rem] text-parchbright">{t(h.tKey)}</h3>
                  <p className="mt-2 text-[0.85rem] leading-relaxed text-soft">{t(h.dKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* cta */}
        <Reveal>
          <div className="pb-16">
            <a
              href="/#atlas"
              className="group inline-flex items-center gap-3 rounded-full bg-bronze px-7 py-3.5 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-bronzeink shadow-md transition-all hover:bg-gold hover:shadow-lg"
            >
              {t('about.cta')}
              <span className="transition-transform group-hover:translate-x-1">
                {ui.arrow({ className: 'h-4 w-4' })}
              </span>
            </a>
            <Link
              to="/stories"
              className="ml-6 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-bronze transition-colors hover:text-gold"
            >
              {t('nav.stories')} →
            </Link>
          </div>
        </Reveal>
      </div>
    </PageShell>
  );
}
