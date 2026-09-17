import { Link } from 'react-router';
import Nav from '../sections/Nav';
import Footer from '../sections/Footer';

export interface Crumb {
  label: string;
  to?: string;
}

export default function PageShell({
  crumbs,
  children,
}: {
  crumbs: Crumb[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-page text-parch">
      <Nav />
      <main className="pt-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-[0.66rem] uppercase tracking-[0.2em] text-muted2">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-faint">/</span>}
                {c.to ? (
                  <Link to={c.to} className="transition-colors hover:text-bronze">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-soft">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>
        {children}
      </main>
      <Footer />
    </div>
  );
}
