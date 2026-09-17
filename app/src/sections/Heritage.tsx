import { heritageKinds } from '../data';
import { icons } from '../components/Icons';
import SectionHead from '../components/SectionHead';
import Reveal from '../components/Reveal';
import { useLang } from '../i18n';

const iconKeys = ['temple', 'fort', 'cave', 'city', 'sculpture', 'inscription', 'sacred', 'unesco'];

export default function Heritage() {
  const { t } = useLang();
  return (
    <section id="heritage" className="mx-auto max-w-[1280px] scroll-mt-24 px-5 py-10 md:px-8 md:py-14">
      <Reveal>
        <SectionHead eyebrow={t('sect.heritage.eyebrow')} title={t('sect.heritage.title')} link={t('sect.heritage.link')} />
      </Reveal>

      <div className="grid grid-cols-4 gap-px overflow-hidden rounded-xl bg-bronze/20 md:grid-cols-8">
        {heritageKinds.map((k, i) => {
          const Icon = icons[iconKeys[i]];
          return (
            <Reveal key={k} delay={i * 50}>
              <a
                href="#heritage"
                className="group flex h-full flex-col items-center justify-center gap-3 bg-page px-2 py-7 transition-colors hover:bg-surf"
              >
                <Icon className="h-8 w-8 text-bronze transition-colors duration-300 group-hover:text-gold" />
                <span className="text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-lede transition-colors group-hover:text-parchbright">
                  {t(`heritage.${k}`)}
                </span>
              </a>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
