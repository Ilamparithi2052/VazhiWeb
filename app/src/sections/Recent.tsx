import { Link } from 'react-router';
import { IMG } from '../data';
import { useContent } from '../content-provider';
import SectionHead from '../components/SectionHead';
import Reveal from '../components/Reveal';
import { useLang } from '../i18n';
import { placesTa } from '../content-ta';

const typeColor: Record<string, string> = {
  Heritage: 'text-bronze border-bronze/45',
  City: 'text-city border-city/40',
  Nature: 'text-nature border-nature/40',
};

export default function Recent() {
  const { lang, t } = useLang();
  const { recentlyAdded } = useContent();
  return (
    <section id="recent" className="mx-auto max-w-[1280px] scroll-mt-24 px-5 py-10 md:px-8 md:py-14">
      <Reveal>
        <SectionHead eyebrow={t('sect.recent.eyebrow')} title={t('sect.recent.title')} link={t('sect.recent.link')} />
      </Reveal>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
        {recentlyAdded.map((p, i) => (
          <Reveal key={p.name} delay={i * 60}>
            <Link to={`/place/${p.id}`} className="group block">
              <div className="card-ring overflow-hidden rounded-xl">
                <img
                  src={IMG(p.img)}
                  alt={p.name}
                  loading="lazy"
                  className="h-[130px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                />
              </div>
              <h3 className="font-display mt-3 text-[1.05rem] leading-tight text-parch transition-colors group-hover:text-bronze">
                {(lang === 'ta' ? placesTa[p.id]?.name : undefined) ?? p.name}
              </h3>
              <p className="mt-0.5 text-[0.7rem] text-muted2">{(lang === 'ta' ? placesTa[p.id]?.region : undefined) ?? p.region}</p>
              <span
                className={`mt-2 inline-block rounded-full border px-2.5 py-0.5 text-[0.58rem] uppercase tracking-[0.18em] ${typeColor[p.type]}`}
              >
                {t(`type.${p.type}`)}
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
