import { Link } from 'react-router';
import { IMG } from '../data';
import { useContent } from '../content-provider';
import SectionHead from '../components/SectionHead';
import Reveal from '../components/Reveal';
import { useLang, tagLabel } from '../i18n';
import { storiesTa } from '../content-ta';

export default function Stories() {
  const { lang, t } = useLang();
  const { stories } = useContent();
  return (
    <section id="stories" className="mx-auto max-w-[1280px] scroll-mt-24 px-5 py-10 md:px-8 md:py-14">
      <Reveal>
        <SectionHead eyebrow={t('sect.stories.eyebrow')} title={t('sect.stories.title')} link={t('sect.stories.link')} to="/stories" />
      </Reveal>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
        {stories.map((s, i) => (
          <Reveal key={s.title} delay={i * 70}>
            <Link to={`/stories/${s.id}`} className="group block">
              <div className="card-ring overflow-hidden rounded-xl">
                <img
                  src={IMG(s.img)}
                  alt={s.title}
                  loading="lazy"
                  className="h-[170px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.06] md:h-[185px]"
                />
              </div>
              <p className="mt-4 text-[0.62rem] uppercase tracking-[0.24em] text-bronze">{tagLabel(t, s.tag)}</p>
              <h3 className="font-display mt-1.5 text-[1.18rem] leading-snug text-parch transition-colors group-hover:text-bronze">
                {(lang === 'ta' ? storiesTa[s.id]?.title : undefined) ?? s.title}
              </h3>
              <p className="mt-1.5 text-[0.7rem] text-muted2">{(lang === 'ta' ? storiesTa[s.id]?.time : undefined) ?? s.time}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
