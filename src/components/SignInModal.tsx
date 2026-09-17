import { useEffect, useState } from 'react';
import { ui } from './Icons';
import { useLang } from '../i18n';

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);
  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set('client_id', appID);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'profile');
  url.searchParams.set('state', state);
  return url.toString();
}

/* brand glyphs drawn inline so we don't depend on an icon pack */
const googleG = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.25 1.3-1.66 3.8-5.5 3.8-3.3 0-6-2.75-6-6.1s2.7-6.1 6-6.1c1.9 0 3.16.8 3.9 1.5l2.65-2.55C16.9 3.1 14.7 2 12 2 6.9 2 2.7 6.2 2.7 11.8S6.9 21.6 12 21.6c5.8 0 9.3-4.05 9.3-9.75 0-.65-.07-1.15-.16-1.65H12z" />
  </svg>
);
const facebookF = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path fill="#1877F2" d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" />
  </svg>
);
const kimiK = (
  <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-bronze text-[0.6rem] font-bold text-bronzeink" aria-hidden="true">K</span>
);

type Props = { open: boolean; onClose: () => void };

export default function SignInModal({ open, onClose }: Props) {
  const { t } = useLang();
  const [tab, setTab] = useState<'social' | 'otp'>('social');
  const [contact, setContact] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) return;
    setTab('social');
    setContact('');
    setCodeSent(false);
    setCode('');
    setNote('');
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const providerNote = (name: string) => setNote(t('signin.providerSoon').replace('{provider}', name));

  const sendCode = () => {
    if (!contact.trim()) return;
    setCodeSent(true);
    setNote(t('signin.otpSoon'));
  };

  const socialBtn =
    'flex w-full items-center justify-center gap-3 rounded-full border border-bronze/30 bg-surf px-5 py-3 text-[0.82rem] font-medium text-parch transition-colors hover:border-bronze/70 hover:bg-surf2';
  const tabBtn = (id: 'social' | 'otp', label: string) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`rounded-full px-4 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] transition-colors ${
        tab === id ? 'bg-bronze text-bronzeink' : 'text-mutedw hover:text-parch'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/45 p-5 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={t('signin.title')}
    >
      <div className="card-ring menu-in w-full max-w-md rounded-2xl bg-page p-7 shadow-2xl">
        <div className="mb-1 flex items-start justify-between">
          <div>
            <p className="eyebrow mb-2">{t('signin.eyebrow')}</p>
            <h2 className="font-display text-[1.7rem] leading-tight text-parchbright">{t('signin.title')}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('signin.close')}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-bronze/25 text-mutedw transition-colors hover:border-bronze/60 hover:text-bronze"
          >
            {ui.close({ className: 'h-3.5 w-3.5' })}
          </button>
        </div>
        <p className="mb-5 text-[0.78rem] leading-relaxed text-mutedw">{t('signin.sub')}</p>

        <div className="mb-5 flex gap-2 rounded-full border border-bronze/20 bg-surf p-1">
          {tabBtn('social', t('signin.tabSocial'))}
          {tabBtn('otp', t('signin.tabOtp'))}
        </div>

        {tab === 'social' ? (
          <div className="space-y-2.5">
            <button type="button" className={socialBtn} onClick={() => (window.location.href = getOAuthUrl())}>
              {kimiK} {t('signin.kimi')}
            </button>
            <button type="button" className={socialBtn} onClick={() => providerNote('Google')}>
              {googleG} {t('signin.google')}
            </button>
            <button type="button" className={socialBtn} onClick={() => providerNote('Facebook')}>
              {facebookF} {t('signin.facebook')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-bronze">
              {t('signin.contactLabel')}
            </label>
            <div className="card-ring flex items-center rounded-full bg-surf p-1.5">
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={t('signin.contactPh')}
                aria-label={t('signin.contactLabel')}
                className="w-full bg-transparent px-4 py-2 text-sm text-parch placeholder-muted2 outline-none"
              />
              <button
                type="button"
                onClick={sendCode}
                className="shrink-0 rounded-full bg-bronze px-5 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-bronzeink transition-transform hover:scale-[1.03]"
              >
                {t('signin.sendCode')}
              </button>
            </div>
            {codeSent && (
              <>
                <label className="block pt-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-bronze">
                  {t('signin.codeLabel')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  aria-label={t('signin.codeLabel')}
                  className="card-ring w-full rounded-xl bg-surf px-4 py-3 text-center text-lg tracking-[0.5em] text-parch placeholder-muted2 outline-none"
                />
                <button
                  type="button"
                  className="w-full rounded-full bg-bronze px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-bronzeink transition-transform hover:scale-[1.01]"
                >
                  {t('signin.verify')}
                </button>
              </>
            )}
          </div>
        )}

        {note && <p className="mt-4 rounded-xl border border-bronze/25 bg-surf px-4 py-2.5 text-[0.72rem] leading-relaxed text-soft">{note}</p>}

        <p className="mt-5 text-center text-[0.66rem] leading-relaxed text-muted2">{t('signin.legal')}</p>
      </div>
    </div>
  );
}
