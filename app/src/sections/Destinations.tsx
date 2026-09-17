import { useRef } from 'react';
import { Link } from 'react-router';
import { IMG } from '../data';
import { useContent } from '../content-provider';
import { ui } from '../components/Icons';
import SectionHead from '../components/SectionHead';
import Reveal from '../components/Reveal';
import { useLang, useThemeValue } from '../i18n';
import { destTa } from '../content-ta';

export default function Destinations() {
  const { lang, t } = useLang();
  const { destinations } = useContent();
  const theme = useThemeValue();
  const arrowBtn =
    'card-ring absolute top-[38%] hidden h-11 w-11 items-center justify-center rounded-full shadow-lg transition-colors lg:flex ' +
    (theme === 'dark'
      ? 'bg-[#f2e9d8] text-[#1c130b] hover:bg-bronze hover:text-bronzeink'
      : 'bg-bronze text-bronzeink hover:bg-gold');
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) =>
    track.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });

  return (
    <section id="destinations" className="mx-auto max-w-[1280px] scroll-mt-24 px-5 py-10 md:px-8 md:py-14">
      <Reveal>
        <SectionHead eyebrow={t('sect.dest.eyebrow')} title={t('sect.dest.title')} link={t('sect.dest.link')} to="/destinations" />
      </Reveal>

      <div className="relative">
        <div
          ref={track}
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
        >
          {destinations.map((d, i) => (
            <Reveal key={(lang === 'ta' ? destTa[d.id]?.name : undefined) ?? d.name} delay={i * 70} className="snap-start">
              <Link
                to={`/destinations/${d.id}`}
                className="group block w-[240px] md:w-[264px]"
              >
                <div className="card-ring relative h-[300px] overflow-hidden rounded-xl md:h-[330px]">
                  <img
                    src={IMG(d.img)}
                    alt={(lang === 'ta' ? destTa[d.id]?.name : undefined) ?? d.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120d08]/85 via-[#120d08]/20 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                  <p className="absolute bottom-4 left-4 right-4 text-xs font-medium leading-snug text-[#f2e9d8] opacity-0 transition-all duration-500 group-hover:opacity-100">
                    {(lang === 'ta' ? destTa[d.id]?.blurb : undefined) ?? d.blurb}
                  </p>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <h3 className="font-display text-[1.35rem] text-parch transition-colors group-hover:text-bronze">
                    {(lang === 'ta' ? destTa[d.id]?.name : undefined) ?? d.name}
                  </h3>
                  <span className="flex items-center gap-1.5 text-[0.68rem] font-medium text-mutedw">
                    {ui.pin({ className: 'h-3 w-3' })}
                    {(lang === 'ta' ? destTa[d.id]?.places : undefined) ?? d.places}
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <button
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className={`-left-3 ${arrowBtn}`}
        >
          {ui.chevronL({ className: 'h-5 w-5' })}
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className={`-right-3 ${arrowBtn}`}
        >
          {ui.chevronR({ className: 'h-5 w-5' })}
        </button>
      </div>
    </section>
  );
}
