import { Link } from 'react-router';
import { ui } from './Icons';

export default function SectionHead({
  eyebrow,
  title,
  link,
  to,
}: {
  eyebrow: string;
  title: string;
  link?: string;
  to?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 md:mb-10">
      <div>
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h2 className="font-display text-[1.9rem] leading-tight text-parchbright md:text-[2.5rem]">{title}</h2>
      </div>
      {link && (
        <Link
          to={to ?? '/'}
          className="group hidden shrink-0 items-center gap-2 rounded-full bg-bronze px-5 py-2.5 text-[0.66rem] font-bold uppercase tracking-[0.2em] text-bronzeink shadow-md transition-all hover:bg-gold hover:shadow-lg sm:inline-flex"
        >
          {link}
          {ui.arrow({ className: 'h-3.5 w-3.5 transition-transform group-hover:translate-x-1' })}
        </Link>
      )}
    </div>
  );
}
