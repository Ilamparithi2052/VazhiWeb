import { useRef, useState } from 'react';
import { Link } from 'react-router';
import PageShell from '../components/PageShell';
import Pager from '../components/Pager';
import { IMG } from '../data';
import { useContent } from '../content-provider';
import { ui } from '../components/Icons';
import { useLang } from '../i18n';
import { destTa } from '../content-ta';

const PER_PAGE = 9; // 3 rows of 3

export default function DestinationsIndex() {
  const { lang, t } = useLang();
  const { destinations } = useContent();
  const [page, setPage] = useState(1);
  const top = useRef<HTMLDivElement>(null);
  const pages = Math.max(1, Math.ceil(destinations.length / PER_PAGE));
  const safePage = Math.min(page, pages);
  const pageDests = destinations.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const goto = (p: number) => {
    setPage(p);
    top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <PageShell crumbs={[{ label: t('crumb.home'), to: '/' }, { label: t('crumb.destinations') }]}>
      <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-8">
        <p className="eyebrow mb-3">{t('sect.dest.eyebrow')}</p>
        <h1 className="font-display text-[2.4rem] text-parchbright md:text-[3rem]">{t('sect.dest.title')}</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-mutedw">
          {t('destindex.blurb')}
        </p>

        <div ref={top} className="scroll-mt-24" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pageDests.map((d) => (
            <Link key={d.id} to={`/destinations/${d.id}`} className="group">
              <div className="card-ring relative h-[240px] overflow-hidden rounded-xl">
                <img
                  src={IMG(d.img)}
                  alt={d.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-page/85 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-xs text-soft">{(lang === 'ta' ? destTa[d.id]?.blurb : undefined) ?? d.blurb}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <h3 className="font-display text-[1.5rem] text-parch transition-colors group-hover:text-bronze">{(lang === 'ta' ? destTa[d.id]?.name : undefined) ?? d.name}</h3>
                <span className="flex items-center gap-1.5 text-[0.7rem] text-mutedw">
                  {ui.pin({ className: 'h-3 w-3' })} {(lang === 'ta' ? destTa[d.id]?.places : undefined) ?? d.places}
                </span>
              </div>
            </Link>
          ))}
        </div>
        <Pager page={safePage} pages={pages} onPage={goto} />
      </div>
    </PageShell>
  );
}
