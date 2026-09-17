import { useState } from 'react';
import { Link } from 'react-router';
import { ui } from '../components/Icons';
import Reveal from '../components/Reveal';
import { useLang, useThemeValue } from '../i18n';
import { trpc } from '@/providers/trpc';

const columns: { head: string; items: string[] }[] = [
  { head: 'Explore', items: ['All Places', 'Map', 'Categories', 'Recently Added'] },
  { head: 'Destinations', items: ['Countries', 'States', 'Cities', 'Regions'] },
  { head: 'Heritage', items: ['Temples', 'Forts', 'Caves', 'Archaeology'] },
  { head: 'Journeys', items: ['My Journeys', 'Road Trips', 'Pilgrimages', 'Treks'] },
  { head: 'Stories', items: ['Essays', 'Field Notes', 'Photo Essays', 'Interviews'] },
  { head: 'More', items: ['About', 'Guidelines', 'Contact'] },
];

function TempleSkyline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* gopuram */}
      <path d="M36 116 V96 h10 V84 h8 V70 h8 V56 h8 V40 h8 V26 h8 V12 h6 V4 h4 V12 h6 V26 h8 V40 h8 V56 h8 V70 h8 V84 h8 V96 h10 v20" />
      <path d="M70 116 v-14 a10 10 0 0 1 20 0 v14" />
      <path d="M52 96 h56 M60 84 h40 M68 70 h24 M76 56 h8 M76 40 h8 M84 26 h12" opacity="0.55" />
      {/* mandapa */}
      <path d="M140 116 V100 h12 V88 h44 v12 h12 v16" />
      <path d="M152 88 l16 -10 h12 l16 10" />
      <path d="M174 78 v-8 m-4 0 h8" />
      <path d="M160 116 v-10 m20 10 v-10 m20 10 v-10" opacity="0.55" />
      {/* small shrine */}
      <path d="M222 116 V104 h10 V94 l10 -8 10 8 v10 h10 v12" />
      <path d="M242 86 v-6 m-3 0 h6" />
      {/* trees */}
      <path d="M18 116 v-12 m0 0 c-6 0 -9 -4 -9 -8 c4 0 6 1 9 4 c0 -6 3 -10 8 -10 c0 5 -2 8 -6 10 m4 4 c3 -3 6 -4 10 -3 c-1 4 -4 7 -10 7" />
      <path d="M286 116 v-14 m0 0 c-7 0 -10 -5 -10 -9 c5 0 7 2 10 5 c0 -7 3 -11 9 -11 c0 6 -2 9 -7 11 m5 5 c4 -3 8 -5 12 -4 c-1 5 -5 8 -12 8" />
      <path d="M4 116 H316" />
    </svg>
  );
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const { t } = useLang();
  const theme = useThemeValue();
  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: (r) => r.ok && setDone(true),
  });

  return (
    <footer className="relative overflow-hidden border-t border-bronze/25 bg-footbg">
      <div className="relative">
      {/* subscribe — text left, email + whatsapp right, one sleek row */}
      <div className="mx-auto max-w-[1280px] px-5 pb-14 pt-16 md:px-8">
        <Reveal>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-sm">
              <h2 className="font-display text-[2rem] leading-tight text-parchbright md:text-[2.4rem]">{t('footer.join')}</h2>
              <p className="mt-2 text-sm leading-relaxed text-soft">{t('footer.sub')}</p>
            </div>
            {done ? (
              <p className="font-display text-xl text-bronze">{t('footer.done')}</p>
            ) : (
              <div>
                <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
                  <form
                    className="card-ring flex w-full max-w-md items-center rounded-full bg-surf p-1.5 lg:w-[380px]"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (email.trim()) subscribe.mutate({ email: email.trim() });
                    }}
                  >
                    <span className="pl-4 text-muted2">{ui.mail({ className: 'h-4 w-4' })}</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('footer.emailPh')}
                      className="w-full bg-transparent px-3 py-2.5 text-sm text-parch placeholder-muted2 outline-none"
                    />
                    <button
                      type="submit"
                      className="shrink-0 rounded-full bg-bronze px-6 py-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-page transition-transform hover:scale-[1.03]"
                    >
                      {t('footer.subscribe')}
                    </button>
                  </form>
                  <a
                    href="https://whatsapp.com/channel/0029VazhiHeritage"
                    target="_blank"
                    rel="noreferrer"
                    title={t('footer.waTitle')}
                    aria-label={t('footer.waTitle')}
                    className="group flex shrink-0 items-center gap-2.5 whitespace-nowrap text-[0.82rem] text-soft transition-colors hover:text-bronze"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#25d366]" aria-hidden="true">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.03c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
                    </svg>
                    <span>{t('footer.waShort')}</span>
                  </a>
                </div>
                <p className="mt-2.5 max-w-md text-[0.68rem] leading-relaxed text-muted2 lg:max-w-[380px]">{t('footer.privacy')}</p>
              </div>
            )}
          </div>
        </Reveal>
      </div>

      {/* link columns */}
      <div className="border-t border-bronze/20">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-14 md:grid-cols-[1.4fr_repeat(6,1fr)] md:px-8">
          <div>
            <img
              src="/img/final/logo-black.png"
              alt="வழி — Vazhi"
              className="h-20 w-auto object-contain"
              style={{ filter: theme === 'light' ? 'none' : 'invert(0.92) sepia(0.18)' }}
            />
            <p className="mt-3 max-w-[220px] text-xs leading-relaxed text-muted2">
              {t('footer.blurb')}
            </p>
            <div className="mt-5 flex gap-3 text-muted2">
              {[ui.globe, ui.mail, ui.bookmark].map((Icon, i) => (
                <a
                  key={i}
                  href="#top"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-bronze/20 transition-colors hover:border-bronze/60 hover:text-bronze"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {columns.map((c) => (
            <div key={c.head}>
              <p className="mb-4 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-mutedw">{t(`col.${c.head}`)}</p>
              <ul className="space-y-2.5">
                {c.items.map((it) => (
                  <li key={it}>
                    {it === 'About' ? (
                      <Link to="/about" className="text-[0.8rem] text-soft transition-colors hover:text-bronze">
                        {it}
                      </Link>
                    ) : (
                      <a href="#top" className="text-[0.8rem] text-soft transition-colors hover:text-bronze">
                        {it}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* skyline + bottom bar */}
      <div className="relative">
        <TempleSkyline className="mx-auto h-24 w-full max-w-xl text-bronze/25" />
        <div className="border-t border-bronze/10">
          <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-5 py-6 text-[0.68rem] text-muted2 sm:flex-row md:px-8">
            <p>{t('footer.rights')}</p>
            <p className="tracking-wide">{t('footer.colophon')}</p>
            <Link to="/admin" className="tracking-wide transition-colors hover:text-bronze">
              Studio ↗
            </Link>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}
