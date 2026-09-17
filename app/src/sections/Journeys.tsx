import { Link } from 'react-router';
import { IMG } from '../data';
import { useContent } from '../content-provider';
import { ui } from '../components/Icons';
import SectionHead from '../components/SectionHead';
import Reveal from '../components/Reveal';
import { useLang } from '../i18n';
import { journeysTa } from '../content-ta';

const journeyDest: Record<string, string> = {
  'Japan 2024': 'japan',
  'Turkey 2023': 'turkey',
  'Armenia 2023': 'armenia',
};

export default function Journeys() {
  const { lang, t } = useLang();
  const { journeys } = useContent();
  return (
    <section id="journeys" className="mx-auto max-w-[1280px] scroll-mt-24 px-5 py-10 md:px-8 md:py-14">
      <Reveal>
        <SectionHead eyebrow={t('sect.journeys.eyebrow')} title={t('sect.journeys.title')} link={t('sect.journeys.link')} />
      </Reveal>

      <div className="grid gap-6 md:grid-cols-3">
        {journeys.map((j, i) => (
          <Reveal key={j.title} delay={i * 90}>
            <Link to={`/destinations/${journeyDest[j.title] ?? 'india'}`} className="group block">
              <div className="card-ring relative overflow-hidden rounded-xl bg-[#0c171d]">
                <img
                  src={IMG(j.map)}
                  alt={`${j.title} route map`}
                  loading="lazy"
                  className="h-[220px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <button
                  aria-label="Save journey"
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#14100b]/70 text-[#e8c07a] ring-1 ring-[#e8c07a]/40 backdrop-blur transition-colors hover:bg-[#14100b]/90"
                >
                  {ui.bookmark({ className: 'h-4 w-4' })}
                </button>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#14100b] via-[#14100b]/75 to-transparent p-5 pt-14">
                  <h3 className="font-display text-[1.6rem] text-[#f4ead9]">{(lang === 'ta' ? journeysTa[j.title]?.title : undefined) ?? j.title}</h3>
                  <p className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-[#e8c07a]">{(lang === 'ta' ? journeysTa[j.title]?.meta : undefined) ?? j.meta}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-mutedw">{(lang === 'ta' ? journeysTa[j.title]?.note : undefined) ?? j.note}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
