import { useEffect, useRef, useState } from 'react';
import { trpc } from '@/providers/trpc';
import { resolveImgSrc } from '../../richtext';
import type { MediaSelection } from './mediaPicker';

/* Media library dialog — pick an uploaded image, upload a new one, or reference
   an existing public/img/final file or external URL. Carries rights metadata
   (alt, caption, credit, license) onto the inserted figure. */

interface Props {
  open: boolean;
  initial?: Partial<MediaSelection>;
  initialTab?: 'library' | 'upload' | 'external' | 'search';
  onPick: (sel: MediaSelection) => void;
  onClose: () => void;
}

const fieldCls =
  'w-full rounded-lg border border-[#ddcdab] bg-white px-3 py-1.5 text-[0.8rem] text-[#2c2418] outline-none focus:border-[#b98a4a]';
const labelCls = 'mb-1 block text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#a08b66]';

export default function MediaDialog({ open, initial, initialTab, onPick, onClose }: Props) {
  const utils = trpc.useUtils();
  const mediaQ = trpc.content.mediaList.useQuery(undefined, { enabled: open });
  const uploadMedia = trpc.content.uploadMedia.useMutation();
  const updateMedia = trpc.content.updateMedia.useMutation();

  const [tab, setTab] = useState<'library' | 'upload' | 'external' | 'search'>('library');
  const [freeQ, setFreeQ] = useState('');
  const [freeHits, setFreeHits] = useState<{ title: string; thumb: string; url: string; width: number; height: number; artist: string; license: string }[]>([]);
  const [freeSel, setFreeSel] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const searchFree = trpc.content.searchFreeImages.useQuery({ query: freeQ }, { enabled: false, retry: false });
  const importFree = trpc.content.importFreeImage.useMutation();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [external, setExternal] = useState('');
  const [upload, setUpload] = useState<{ fileName: string; mime: string; data: string } | null>(null);
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [credit, setCredit] = useState('');
  const [license, setLicense] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setSelectedId(null);
    setUpload(null);
    setErr(null);
    setBusy(false);
    setExternal('');
    setAlt(initial?.alt ?? '');
    setCaption(initial?.caption ?? '');
    setCredit(initial?.credit ?? '');
    setLicense(initial?.license ?? '');
    setTab(initialTab ?? (initial?.src && !initial.src.startsWith('/api/media/') ? 'external' : 'library'));
    if (initial?.src && !initial.src.startsWith('/api/media/')) setExternal(initial.src);
    if (initial?.src?.startsWith('/api/media/')) {
      const id = Number(initial.src.split('/').pop());
      if (Number.isInteger(id)) setSelectedId(id);
    }
  }, [open, initial, initialTab]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const items = mediaQ.data ?? [];
  const selectedItem = items.find((m) => m.id === selectedId) ?? null;

  const pickLibrary = (id: number) => {
    setSelectedId(id);
    const m = items.find((x) => x.id === id);
    if (m) {
      setAlt(m.alt);
      setCaption(m.caption);
      setCredit(m.credit);
      setLicense(m.license);
    }
  };

  const onFile = (f: File | undefined) => {
    if (!f) return;
    if (!/^image\/(jpeg|png|webp|gif|avif)$/.test(f.type)) {
      setErr('Use a JPG, PNG, WebP, GIF or AVIF image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUpload({ fileName: f.name, mime: f.type, data: dataUrl.slice(dataUrl.indexOf(',') + 1) });
      setErr(null);
    };
    reader.readAsDataURL(f);
  };

  const runFreeSearch = async () => {
    if (freeQ.trim().length < 2) return;
    setSearching(true);
    setErr(null);
    try {
      const r = await searchFree.refetch();
      if (r.error) {
        setErr('Could not reach the image library — the server needs internet access for search.');
      } else {
        setFreeHits(r.data ?? []);
      }
    } catch {
      setErr('Could not reach the image library — the server needs internet access for search.');
    } finally {
      setSearching(false);
    }
  };

  const insertFree = async () => {
    const hit = freeHits.find((h) => h.url === freeSel);
    if (!hit) { setErr('Pick a search result first.'); return; }
    setBusy(true);
    setErr(null);
    try {
      const res = await importFree.mutateAsync(hit);
      await utils.content.mediaList.invalidate();
      onPick({
        src: `/api/media/${res.id}`,
        alt: hit.title.replace(/\.[^.]+$/, ''),
        caption: '',
        credit: hit.artist ? `${hit.artist} — Wikimedia Commons` : 'Wikimedia Commons',
        license: hit.license,
      });
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? 'Import failed.');
      setBusy(false);
    }
  };

  const insert = async () => {
    if (tab === 'search') { await insertFree(); return; }
    setErr(null);
    setBusy(true);
    try {
      if (tab === 'upload') {
        if (!upload) {
          setErr('Choose an image file first.');
          setBusy(false);
          return;
        }
        const res = await uploadMedia.mutateAsync({ ...upload, alt, caption, credit, license });
        await utils.content.mediaList.invalidate();
        onPick({ src: `/api/media/${res.id}`, alt, caption, credit, license });
        onClose();
        return;
      }
      if (tab === 'external') {
        const src = resolveImgSrc(external);
        if (!src) {
          setErr('Use a file name like "kaveri.jpg" from public/img/final, or a full https:// URL.');
          setBusy(false);
          return;
        }
        onPick({ src, alt, caption, credit, license });
        onClose();
        return;
      }
      // library
      if (!selectedItem) {
        setErr('Pick an image from the library first.');
        setBusy(false);
        return;
      }
      const changed =
        alt !== selectedItem.alt || caption !== selectedItem.caption || credit !== selectedItem.credit || license !== selectedItem.license;
      if (changed) {
        await updateMedia.mutateAsync({ id: selectedItem.id, alt, caption, credit, license });
        await utils.content.mediaList.invalidate();
      }
      onPick({ src: `/api/media/${selectedItem.id}`, alt, caption, credit, license });
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const tabBtn = (t: typeof tab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(t)}
      className={`rounded-full px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] transition-colors ${
        tab === t ? 'bg-[#8a6224] text-white' : 'text-[#7a6a50] hover:bg-[#f1e8d4]'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 p-5" onClick={onClose}>
      <div
        className="flex max-h-[86vh] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl border border-[#ddcdab] bg-[#fdfaf3] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#eee2ca] px-5 py-3.5">
          <p className="font-display text-lg text-[#2c2418]">Insert image</p>
          <div className="flex items-center gap-2">
            {tabBtn('library', 'Library')}
            {tabBtn('upload', 'Upload')}
            {tabBtn('search', 'Free search')}
            {tabBtn('external', 'File / URL')}
            <button type="button" onClick={onClose} aria-label="Close" className="ml-2 text-[#a08b66] hover:text-[#2c2418]">
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === 'library' && (
            <>
              {items.length === 0 && (
                <p className="py-8 text-center text-[0.8rem] text-[#a08b66]">
                  {mediaQ.isLoading ? 'Loading library…' : 'The library is empty — upload your first image.'}
                </p>
              )}
              <div className="grid grid-cols-3 gap-2.5">
                {items.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => pickLibrary(m.id)}
                    className={`group relative overflow-hidden rounded-xl border-2 text-left transition-colors ${
                      selectedId === m.id ? 'border-[#b98a4a]' : 'border-transparent hover:border-[#ddcdab]'
                    }`}
                  >
                    <img src={`/api/media/${m.id}`} alt={m.alt} className="h-24 w-full object-cover" loading="lazy" />
                    <span className="block truncate bg-white px-2 py-1 text-[0.62rem] text-[#7a6a50]">{m.fileName}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {tab === 'search' && (
            <div>
              <div className="flex items-center gap-2">
                <input
                  value={freeQ}
                  onChange={(e) => setFreeQ(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runFreeSearch()}
                  placeholder="Search any place — e.g. Brihadeeswarar Temple, Kyoto, Cappadocia…"
                  className={fieldCls}
                />
                <button
                  type="button"
                  onClick={runFreeSearch}
                  disabled={searching}
                  className="shrink-0 rounded-full bg-[#8a6224] px-4 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-50"
                >
                  {searching ? 'Searching…' : 'Search'}
                </button>
              </div>
              <p className="mt-2 text-[0.68rem] leading-relaxed text-[#a08b66]">
                Results come from Wikimedia Commons — freely licensed, attribution filled in automatically. Picked images are compressed to web-sized WebP and stored in your library.
              </p>
              {freeHits.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2.5">
                  {freeHits.map((h) => (
                    <button
                      key={h.url}
                      type="button"
                      onClick={() => setFreeSel(h.url)}
                      className={`group relative overflow-hidden rounded-xl border-2 text-left transition-colors ${freeSel === h.url ? 'border-[#b98a4a]' : 'border-transparent hover:border-[#ddcdab]'}`}
                    >
                      <img src={h.thumb} alt={h.title} className="h-24 w-full object-cover" loading="lazy" />
                      <span className="block truncate bg-white px-2 py-1 text-[0.62rem] text-[#7a6a50]">{h.title}</span>
                      <span className="block truncate bg-white px-2 pb-1 text-[0.58rem] text-[#c4b291]">{h.license}</span>
                    </button>
                  ))}
                </div>
              )}
              {!searching && freeHits.length === 0 && freeQ.trim().length >= 2 && searchFree.isFetched && (
                <p className="py-6 text-center text-[0.78rem] text-[#a08b66]">No freely licensed photos found — try a simpler name.</p>
              )}
            </div>
          )}

          {tab === 'upload' && (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                aria-label="Choose image file"
                className="hidden"
                onChange={(e) => {
                  onFile(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              {upload ? (
                <div className="flex items-center gap-3">
                  <img src={`data:${upload.mime};base64,${upload.data}`} alt="" className="h-24 w-36 rounded-xl border border-[#eee2ca] object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-[0.8rem] font-medium text-[#2c2418]">{upload.fileName}</p>
                    <button type="button" onClick={() => fileRef.current?.click()} className="mt-1 text-[0.7rem] text-[#8a6224] underline">
                      Choose a different file
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#cfbd97] py-10 text-[#a08b66] transition-colors hover:border-[#b98a4a] hover:text-[#8a6224]"
                >
                  <span className="text-xl">⇪</span>
                  <span className="text-[0.78rem]">Choose an image — JPG, PNG, WebP, GIF or AVIF</span>
                  <span className="text-[0.66rem]">Stored in your media library for reuse</span>
                </button>
              )}
            </div>
          )}

          {tab === 'external' && (
            <div>
              <label className={labelCls}>File name (public/img/final) or full URL</label>
              <input value={external} onChange={(e) => setExternal(e.target.value)} placeholder="story-kaveri.jpg — or https://…" className={fieldCls} />
              {resolveImgSrc(external) && (
                <img src={resolveImgSrc(external)!} alt="" className="mt-3 h-32 rounded-xl border border-[#eee2ca] object-cover" />
              )}
            </div>
          )}

          {((tab === 'library' && selectedItem) || (tab === 'upload' && upload) || tab === 'external') && (
            <div className="mt-5 border-t border-[#eee2ca] pt-4">
              <p className="mb-3 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#a08b66]">Caption &amp; rights</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Alt text (accessibility)</label>
                  <input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Gopuram of the Srirangam temple at dawn" className={fieldCls} />
                </div>
                <div>
                  <label className={labelCls}>Caption (shown under image)</label>
                  <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="The main gopuram from the Kaveri bridge" className={fieldCls} />
                </div>
                <div>
                  <label className={labelCls}>Credit / photographer</label>
                  <input value={credit} onChange={(e) => setCredit(e.target.value)} placeholder="Photo: A. Rajan" className={fieldCls} />
                </div>
                <div>
                  <label className={labelCls}>License / source</label>
                  <input value={license} onChange={(e) => setLicense(e.target.value)} placeholder="Own work · CC BY-SA 4.0 · Wikimedia Commons" className={fieldCls} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#eee2ca] px-5 py-3">
          <span className="text-[0.72rem] text-[#c05f4e]">{err ?? ''}</span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-[0.72rem] font-semibold text-[#7a6a50] hover:text-[#2c2418]">
              Cancel
            </button>
            <button
              type="button"
              onClick={insert}
              disabled={busy}
              className="rounded-full bg-[#8a6224] px-5 py-2 text-[0.72rem] font-semibold text-white transition-colors hover:bg-[#75511c] disabled:opacity-50"
            >
              {busy ? 'Working…' : 'Insert image'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
