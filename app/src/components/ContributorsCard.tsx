import { ui } from './Icons';
import { useLang } from '../i18n';
import type { Contributor } from '../wiki';

function photoSrc(photo?: string): string | undefined {
  if (!photo) return undefined;
  if (photo.startsWith('http') || photo.startsWith('/')) return photo;
  return `/img/final/${photo}`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

function linkLabel(link: string): string {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return link;
  }
}

/** Credited contributors on a story or place page — photo, role, bio, external link. */
export default function ContributorsCard({ contributors }: { contributors?: Contributor[] }) {
  const { t } = useLang();
  if (!contributors || contributors.length === 0) return null;
  return (
    <section className="mt-12 border-t border-bronze/12 pt-8">
      <p className="eyebrow mb-5">{t('contrib.heading')}</p>
      <div className="space-y-4">
        {contributors.map((c, i) => {
          const src = photoSrc(c.photo);
          return (
            <div key={`${c.name}-${i}`} className="card-ring flex gap-4 rounded-xl bg-surf p-5">
              {src ? (
                <span className="card-ring block h-14 w-14 shrink-0 overflow-hidden rounded-full">
                  <img
                    src={src}
                    alt={c.name}
                    className="h-full w-full object-cover"
                    style={{
                      objectPosition: `${c.photoX ?? 50}% ${c.photoY ?? 50}%`,
                      ...(c.photoZoom && c.photoZoom > 1 ? { transform: `scale(${c.photoZoom})` } : {}),
                    }}
                  />
                </span>
              ) : (
                <span className="card-ring flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surf3 font-display text-lg text-bronze">
                  {initials(c.name)}
                </span>
              )}
              <div className="min-w-0">
                <p className="font-display text-[1.15rem] leading-tight text-parchbright">{c.name}</p>
                {c.role && (
                  <p className="mt-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-bronze">{c.role}</p>
                )}
                {c.bio && <p className="mt-2 text-[0.8rem] leading-relaxed text-bodycopy">{c.bio}</p>}
                {c.link && (
                  <a
                    href={c.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-[0.72rem] font-medium text-bronze transition-colors hover:text-parchbright"
                  >
                    {linkLabel(c.link)}
                    {ui.arrowUpRight({ className: 'h-3 w-3' })}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
