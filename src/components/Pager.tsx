import { useLang } from '../i18n';

/** Numbered pagination bar — hidden when everything fits on one page. */
export default function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  const { t } = useLang();
  if (pages <= 1) return null;
  const btn =
    'flex h-9 min-w-9 items-center justify-center rounded-full border border-[#3a2f1e] px-3 text-[0.72rem] transition-colors';
  const idle = 'text-mutedw hover:border-bronze hover:text-bronze';
  const active = 'border-bronze bg-bronze text-ink font-semibold';
  return (
    <nav className="mt-9 flex items-center justify-center gap-2" aria-label="Pagination">
      <button onClick={() => onPage(page - 1)} disabled={page === 1} className={`${btn} ${idle} disabled:opacity-35`}>
        ← {t('pager.prev')}
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button key={n} onClick={() => onPage(n)} className={`${btn} ${n === page ? active : idle}`} aria-current={n === page ? 'page' : undefined}>
          {n}
        </button>
      ))}
      <button onClick={() => onPage(page + 1)} disabled={page === pages} className={`${btn} ${idle} disabled:opacity-35`}>
        {t('pager.next')} →
      </button>
    </nav>
  );
}
