import { icons } from '../components/Icons';
import Reveal from '../components/Reveal';
import { useLang } from '../i18n';
import { useSiteContent } from '../content-provider';

export interface InterestItem {
  label: string;
  icon: string;
}

const DEFAULT_ITEMS: InterestItem[] = [
  { label: 'History', icon: 'history' },
  { label: 'Architecture', icon: 'architecture' },
  { label: 'Art & Sculpture', icon: 'art' },
  { label: 'Food', icon: 'food' },
  { label: 'Nature', icon: 'nature' },
  { label: 'Religion', icon: 'religion' },
  { label: 'Fests & Culture', icon: 'fest' },
  { label: 'Literature', icon: 'literature' },
  { label: 'Archaeology', icon: 'archaeology' },
];

interface InterestsContent {
  eyebrow: string;
  items: InterestItem[];
}

const DEFAULTS: InterestsContent = { eyebrow: '', items: DEFAULT_ITEMS };

export default function Interests() {
  const { t } = useLang();
  const ic = useSiteContent<InterestsContent>('home_interests', DEFAULTS);
  const items = ic.items.length > 0 ? ic.items : DEFAULT_ITEMS;
  return (
    <section id="interests" className="scroll-mt-24 border-y border-bronze/12 bg-surf3">
      <div className="mx-auto max-w-[1280px] px-5 py-12 md:px-8">
        <p className="eyebrow mb-8">{ic.eyebrow || t('interests.eyebrow')}</p>
        <div className="grid grid-cols-3 gap-y-8 sm:grid-cols-5 md:grid-cols-9">
          {items.map((it, i) => {
            const Icon = icons[it.icon] ?? icons.history;
            return (
              <Reveal key={`${it.label}-${i}`} delay={i * 40}>
                <a href="#top" className="group flex flex-col items-center gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-bronze/20 transition-all duration-300 group-hover:border-bronze/60 group-hover:bg-bronze/8">
                    <Icon className="h-6 w-6 text-mutedw transition-colors group-hover:text-bronze" />
                  </span>
                  <span className="text-center text-[0.66rem] uppercase tracking-[0.14em] text-soft transition-colors group-hover:text-parch">
                    {t(`interest.${it.label}`) === `interest.${it.label}` ? it.label : t(`interest.${it.label}`)}
                  </span>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
