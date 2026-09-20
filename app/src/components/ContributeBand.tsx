import { useEffect, useState } from 'react';
import { ui } from './Icons';
import { useLang } from '../i18n';
import { trpc } from '@/providers/trpc';
import { useSiteContent } from '../content-provider';
import { IMG } from '../data';

type Kind = 'knowledge' | 'donation' | 'both';

interface JoinContent {
  img: string;
  kicker: string;
  title: string;
  sub: string;
  cta: string;
}

const JOIN_DEFAULTS: JoinContent = {
  img: 'footer-herd.jpg',
  kicker: '',
  title: '',
  sub: '',
  cta: '',
};

/** Full-width call to join Vazhi — contribute knowledge or support with a donation. */
export default function ContributeBand() {
  const { t } = useLang();
  const jc = useSiteContent<JoinContent>('home_join', JOIN_DEFAULTS);
  const [open, setOpen] = useState(false);
  return (
    <>
      <section className="relative overflow-hidden">
        <img
          src={IMG(jc.img || JOIN_DEFAULTS.img)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[50%_38%]"
          onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
        />
        <div className="absolute inset-0 bg-[#120d08]/74" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(12,8,5,0.82)_0%,rgba(12,8,5,0.46)_52%,rgba(12,8,5,0.68)_100%)]" />
        <div className="relative mx-auto max-w-[1280px] px-5 py-32 text-center md:px-8 md:py-48">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.3em] text-[#e8c07a]">
            {jc.kicker || t('band.kicker')}
          </p>
          <h2 className="font-display mx-auto mt-4 max-w-3xl text-[2.4rem] leading-[1.12] text-[#f8f1e2] md:text-[3.4rem]">
            {jc.title || t('band.title')}
          </h2>
          <div className="mx-auto mt-6 h-px w-16 bg-[#e8c07a]/60" />
          <p className="mx-auto mt-6 max-w-xl text-[0.95rem] leading-relaxed text-[#ded2bd]">
            {jc.sub || t('band.sub')}
          </p>
          <button
            onClick={() => setOpen(true)}
            className="group mt-9 inline-flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[#e8c07a] transition-colors hover:text-[#f8f1e2]"
          >
            {jc.cta || t('band.cta')}
            <span className="transition-transform duration-300 group-hover:translate-x-1.5">
              {ui.arrow({ className: 'h-4 w-4' })}
            </span>
          </button>
        </div>
      </section>
      {open && <ContributeDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function ContributeDialog({ onClose }: { onClose: () => void }) {
  const { t } = useLang();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [kind, setKind] = useState<Kind>('knowledge');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [done, setDone] = useState(false);
  const submit = trpc.content.submitContribution.useMutation({
    onSuccess: () => setDone(true),
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const kinds: Kind[] = ['knowledge', 'donation', 'both'];

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#120d08]/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card-ring max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-page p-7"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {done ? (
          <div className="py-10 text-center">
            <p className="font-display text-2xl text-bronze">{t('band.doneTitle')}</p>
            <p className="mt-3 text-sm leading-relaxed text-soft">{t('band.doneSub')}</p>
            <button
              onClick={onClose}
              className="mt-7 rounded-full border border-bronze/40 px-6 py-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-bronze transition-colors hover:bg-bronze hover:text-page"
            >
              {t('band.close')}
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow">{t('band.kicker')}</p>
            <h3 className="font-display mt-2 text-[1.7rem] text-parchbright">{t('band.formTitle')}</h3>
            <p className="mt-1.5 text-[0.8rem] leading-relaxed text-muted2">{t('band.formSub')}</p>
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                submit.mutate({ name: name.trim(), contact: contact.trim(), kind, message: message.trim(), link: link.trim() || undefined });
              }}
            >
              <div>
                <label className="mb-1.5 block text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted2">{t('band.fName')}</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} className="card-ring w-full rounded-lg bg-surf px-4 py-2.5 text-sm text-parch outline-none placeholder-muted2" placeholder={t('band.fNamePh')} />
              </div>
              <div>
                <label className="mb-1.5 block text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted2">{t('band.fContact')}</label>
                <input required value={contact} onChange={(e) => setContact(e.target.value)} className="card-ring w-full rounded-lg bg-surf px-4 py-2.5 text-sm text-parch outline-none placeholder-muted2" placeholder={t('band.fContactPh')} />
              </div>
              <div>
                <label className="mb-1.5 block text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted2">{t('band.fKind')}</label>
                <div className="flex flex-wrap gap-2">
                  {kinds.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKind(k)}
                      className={`rounded-full border px-4 py-2 text-[0.7rem] transition-colors ${
                        kind === k ? 'border-bronze bg-bronze text-page' : 'border-bronze/30 text-parch hover:border-bronze'
                      }`}
                    >
                      {t(`band.kind.${k}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted2">{t('band.fMsg')}</label>
                <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="card-ring w-full resize-none rounded-lg bg-surf px-4 py-2.5 text-sm text-parch outline-none placeholder-muted2" placeholder={t('band.fMsgPh')} />
              </div>
              <div>
                <label className="mb-1.5 block text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted2">{t('band.fLink')}</label>
                <input value={link} onChange={(e) => setLink(e.target.value)} className="card-ring w-full rounded-lg bg-surf px-4 py-2.5 text-sm text-parch outline-none placeholder-muted2" placeholder="https://…" />
              </div>
              {submit.error && <p className="text-[0.75rem] text-red-400">{t('band.err')}</p>}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted2 transition-colors hover:text-parch">
                  {t('band.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submit.isPending}
                  className="rounded-full bg-bronze px-7 py-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-page transition-transform hover:scale-[1.03] disabled:opacity-60"
                >
                  {submit.isPending ? t('band.sending') : t('band.send')}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
