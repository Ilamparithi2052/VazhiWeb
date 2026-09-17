import { Link } from 'react-router';
import { IMG, atlasFilters, atlasMarkers } from '../data';
import { ui } from '../components/Icons';
import Reveal from '../components/Reveal';
import { useLang } from '../i18n';

export default function Atlas() {
  const { t } = useLang();
  return (
    <section id="atlas" className="mx-auto max-w-[1280px] scroll-mt-24 px-5 py-16 md:px-8 md:py-20">
      <Reveal>
        <div className="card-ring grain relative overflow-hidden rounded-2xl bg-[#0c171d]">
          {/* map */}
          <div className="relative">
            <img src={IMG('map-world.png')} alt="World atlas" className="h-[420px] w-full object-cover md:h-[520px]" />

            {/* markers */}
            {atlasMarkers.map((m, i) => (
              <button
                key={i}
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
                className="marker-pulse group absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-page/85 text-[0.72rem] font-semibold text-bronze ring-1 ring-bronze/70 backdrop-blur-sm transition-transform hover:scale-110"
                aria-label={`${m.count} places`}
              >
                {m.count}
              </button>
            ))}

            {/* zoom controls */}
            <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col overflow-hidden rounded-lg bg-page/80 ring-1 ring-bronze/25 backdrop-blur-sm md:flex">
              <button className="px-3 py-2.5 text-lg leading-none text-soft transition-colors hover:text-bronze">+</button>
              <div className="h-px bg-bronze/20" />
              <button className="px-3 py-2.5 text-lg leading-none text-soft transition-colors hover:text-bronze">−</button>
              <div className="h-px bg-bronze/20" />
              <button className="px-3 py-2.5 text-soft transition-colors hover:text-bronze" aria-label="Locate">
                {ui.pin({ className: 'mx-auto h-4 w-4' })}
              </button>
            </div>

            {/* overlay copy */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c171d]/90 via-[#0c171d]/35 to-transparent" />
            <div className="absolute left-6 top-1/2 max-w-sm -translate-y-1/2 md:left-10">
              <p className="eyebrow mb-4">{t('atlas.eyebrow')}</p>
              <h2 className="font-display text-[2rem] leading-[1.12] text-parchbright md:text-[2.7rem]">
                {t('atlas.title')}
              </h2>
              <Link
                to="/destinations/india"
                className="mt-7 inline-flex items-center gap-3 rounded-full border border-bronze/50 px-6 py-3 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-bronze transition-all hover:bg-bronze hover:text-page"
              >
                {t('atlas.cta')} {ui.arrow({ className: 'h-4 w-4' })}
              </Link>
            </div>
          </div>

          {/* filter row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-bronze/15 bg-page/60 px-6 py-4 md:px-10">
            {atlasFilters.map((f, i) => (
              <button
                key={f}
                className={`flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.18em] transition-colors ${
                  i === 0 ? 'text-bronze' : 'text-mutedw hover:text-parch'
                }`}
              >
                {ui.pin({ className: 'h-3.5 w-3.5' })}
                {t(`filter.${f}`)}
              </button>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
