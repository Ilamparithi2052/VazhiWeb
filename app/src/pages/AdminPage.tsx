import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import { IMG } from '../data';
import { ui } from '../components/Icons';
import type { Contributor, WikiFact } from '../wiki';
import RichEditor from '../components/RichEditor';
import MediaDialog from '../components/editor/MediaDialog';
import type { Editor } from '@tiptap/react';
import { toHtml } from '../richtext';

/* ================================================================== types */

type Section = 'home' | 'posts' | 'series' | 'places' | 'journeys' | 'destinations' | 'contributions' | 'newsletter' | 'gallery' | 'sections' | 'atlas' | 'settings';
type StatusFilter = 'published' | 'draft' | 'trash';

/* =================================================== studio palette (light) */

const C = {
  border: 'border-[#e3d5b8]',
  borderSoft: 'border-[#eee2ca]',
  th: 'text-[#a08b66]',
  muted: 'text-[#a08b66]',
  soft: 'text-[#7a6a50]',
  ink: 'text-[#2c2418]',
  faint: 'text-[#c4b291]',
};

const inputCls =
  'w-full rounded-lg border border-[#ddcdab] bg-white px-3.5 py-2.5 text-sm text-[#2c2418] outline-none transition-colors placeholder:text-[#c4b291] focus:border-[#b98a4a]';
const labelCls = `mb-1.5 block text-[0.62rem] font-semibold uppercase tracking-[0.2em] ${C.th}`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input {...rest} className={`${inputCls}${className ? ` ${className}` : ''}`} />;
}

function TextArea({ rows = 4, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} {...props} className={inputCls + ' resize-y leading-relaxed'} />;
}


/** Image field with a "Browse / upload" button — opens the media library
    dialog (pick an uploaded image, upload a new one, or paste an external URL). */
function ImagePickField({
  value, onChange, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex items-center gap-2">
        <TextInput value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? 'story-konya.jpg or /api/media/12'} />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-full border border-[#b98a4a]/40 px-3.5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#a6783c] transition-colors hover:border-[#b98a4a]/70"
        >
          Browse
        </button>
      </div>
      {value && (
        <img src={IMG(value)} alt="" className={`mt-2 h-20 w-32 rounded-lg border ${C.border} object-cover`} />
      )}
      <MediaDialog
        open={open}
        initial={{ src: value }}
        onClose={() => setOpen(false)}
        onPick={(sel) => { onChange(sel.src); setOpen(false); }}
      />
    </div>
  );
}



/* ======================================================= atlas builder */


/* ISO country list for the "add country" dropdown (name — slug auto-derived). */
const WORLD_COUNTRIES = ["Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahrain","Bangladesh","Belarus","Belgium","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Bulgaria","Cambodia","Canada","Chile","China","Colombia","Croatia","Cuba","Cyprus","Czechia","Denmark","Ecuador","Egypt","Estonia","Ethiopia","Finland","France","Georgia","Germany","Greece","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lithuania","Luxembourg","Malaysia","Maldives","Malta","Mexico","Mongolia","Morocco","Myanmar","Nepal","Netherlands","New Zealand","Norway","Oman","Pakistan","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Saudi Arabia","Singapore","South Africa","South Korea","Spain","Sri Lanka","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Thailand","Tunisia","Turkey","Turkmenistan","Ukraine","United Arab Emirates","United Kingdom","United States","Uzbekistan","Vietnam","Yemen"];

/** Inline form: pick a country from the world list → creates a destination. */
function AddCountryForm({ existing, onCreated }: { existing: string[]; onCreated: (id: string) => void }) {
  const utils = trpc.useUtils();
  const upsertM = trpc.content.upsertDestination.useMutation({ onSuccess: () => utils.content.destinations.invalidate() });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [img, setImg] = useState('');
  const [mapImg, setMapImg] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const available = WORLD_COUNTRIES.filter((c) => !existing.includes(slugify(c)));

  const create = async () => {
    const id = slugify(name);
    if (!id) return;
    if (existing.includes(id)) { setErr(`${name} already exists.`); return; }
    setErr(null);
    try {
      await upsertM.mutateAsync({
        id, name, places: '0 Places',
        img: img.trim() || 'dest-india.jpg',
        blurb: `${name} — new to the atlas.`,
        mapImg: mapImg.trim() || null,
      });
      setName(''); setImg(''); setMapImg(''); setOpen(false);
      onCreated(id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to create');
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-full border border-[#b98a4a]/40 px-4 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-[#a6783c] transition-colors hover:border-[#b98a4a]/70">
        + Add country
      </button>
    );
  }
  return (
    <div className={`w-full max-w-xl space-y-3 rounded-xl border ${C.border} bg-[#fdfaf3] p-4`}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={miniLabel}>Country</label>
          <select value={name} onChange={(e) => setName(e.target.value)} className={inputCls}>
            <option value="">Choose from the world list…</option>
            {available.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={miniLabel}>Cover image (gallery / file)</label>
          <ImagePickField value={img} onChange={setImg} placeholder="dest-japan.jpg or /api/media/12" />
        </div>
      </div>
      <div>
        <label className={miniLabel}>Map image for pins (optional)</label>
        <ImagePickField value={mapImg} onChange={setMapImg} placeholder="map-japan.png or /api/media/12" />
      </div>
      {err && <p className="text-[0.75rem] text-[#c05f4e]">{err}</p>}
      <div className="flex items-center gap-3">
        <button onClick={create} disabled={!name || upsertM.isPending} className="rounded-full bg-[#b98a4a] px-5 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-50">
          {upsertM.isPending ? 'Creating…' : 'Create country'}
        </button>
        <button onClick={() => setOpen(false)} className="text-[0.68rem] text-[#a08b66] underline">Cancel</button>
      </div>
    </div>
  );
}

/** Atlas builder — Country → State → District hierarchy with map pin-dropping.
    Everything saved here appears live under /destinations instantly. */
function AtlasPanel({
  destinations, places,
}: {
  destinations: { id: string; name: string; mapImg: string }[];
  places: { id: string; name: string; destId: string }[];
}) {
  const utils = trpc.useUtils();
  const statesQ = trpc.content.states.useQuery();
  const markersQ = trpc.content.markers.useQuery();
  const upsertStateM = trpc.content.upsertState.useMutation({ onSuccess: () => utils.content.states.invalidate() });
  const deleteStateM = trpc.content.deleteState.useMutation({ onSuccess: () => utils.content.states.invalidate() });
  const upsertMarkerM = trpc.content.upsertMarker.useMutation({ onSuccess: () => utils.content.markers.invalidate() });
  const deleteMarkerM = trpc.content.deleteMarker.useMutation({ onSuccess: () => utils.content.markers.invalidate() });

  const [destId, setDestId] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [newState, setNewState] = useState('');
  const [newDistrict, setNewDistrict] = useState<Record<string, string>>({});
  const [placePick, setPlacePick] = useState<Record<string, string>>({});
  const [pinPlace, setPinPlace] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const dest = destinations.find((d) => d.id === destId) ?? destinations[0];
  useEffect(() => {
    if (!destId && destinations.length) setDestId(destinations[0].id);
  }, [destinations, destId]);

  const states = (statesQ.data ?? []).filter((x) => x.destSlug === dest?.id);
  const markers = (markersQ.data ?? []).filter((x) => x.destSlug === dest?.id);
  const destPlaces = places.filter((p) => p.destId === dest?.id);
  const unmarked = destPlaces.filter((p) => !markers.some((m) => m.placeSlug === p.id));

  const saveState = (st: { slug: string; name: string; districts: { id: string; name: string; placeIds: string[] }[] }, sort: number) => {
    setErr(null);
    upsertStateM.mutate({ destSlug: dest!.id, slug: st.slug, name: st.name, districts: st.districts, sort }, {
      onError: (e) => setErr(e.message),
    });
  };

  const addState = () => {
    const slug = slugify(newState);
    if (!slug || !dest) return;
    if (states.some((x) => x.slug === slug)) { setErr(`A state with slug "${slug}" already exists here.`); return; }
    saveState({ slug, name: newState.trim(), districts: [] }, states.length + 1);
    setNewState('');
  };

  const addDistrict = (st: (typeof states)[number], idx: number) => {
    const name = (newDistrict[st.slug] ?? '').trim();
    const id = slugify(name);
    if (!id) return;
    if (st.districts.some((d) => d.id === id)) { setErr(`District "${id}" already exists in ${st.name}.`); return; }
    saveState({ ...st, districts: [...st.districts, { id, name, placeIds: [] }] }, idx + 1);
    setNewDistrict((p) => ({ ...p, [st.slug]: '' }));
  };

  const removeDistrict = (st: (typeof states)[number], idx: number, distId: string) => {
    saveState({ ...st, districts: st.districts.filter((d) => d.id !== distId) }, idx + 1);
  };

  const assignPlace = (st: (typeof states)[number], idx: number, distId: string) => {
    const pid = placePick[`${st.slug}/${distId}`];
    if (!pid) return;
    saveState({
      ...st,
      districts: st.districts.map((d) => d.id === distId && !d.placeIds.includes(pid) ? { ...d, placeIds: [...d.placeIds, pid] } : d),
    }, idx + 1);
    setPlacePick((p) => ({ ...p, [`${st.slug}/${distId}`]: '' }));
  };

  const unassignPlace = (st: (typeof states)[number], idx: number, distId: string, pid: string) => {
    saveState({
      ...st,
      districts: st.districts.map((d) => d.id === distId ? { ...d, placeIds: d.placeIds.filter((x) => x !== pid) } : d),
    }, idx + 1);
  };

  const dropPin = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pinPlace || !dest) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    upsertMarkerM.mutate({ destSlug: dest.id, placeSlug: pinPlace, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  };

  if (!dest) return <p className="text-[0.85rem] text-[#a08b66]">Create a destination first (Destinations tab), then build its hierarchy here.</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <label className={labelCls + ' !mb-0'}>Country</label>
        <select value={dest.id} onChange={(e) => setDestId(e.target.value)} className={inputCls + ' !w-64'}>
          {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <AddCountryForm existing={destinations.map((d) => d.id)} onCreated={(id) => setDestId(id)} />
        <a href={`/destinations/${dest.id}`} target="_blank" rel="noreferrer" className="text-[0.72rem] text-[#a6783c] underline underline-offset-2">
          View live page →
        </a>
      </div>
      {err && <p className="rounded-lg border border-[#c05f4e]/30 bg-[#c05f4e]/10 px-4 py-2 text-[0.78rem] text-[#c05f4e]">{err}</p>}

      {/* ---------- hierarchy tree ---------- */}
      <div className={`rounded-xl border ${C.border} bg-white p-5`}>
        <p className={labelCls}>States & districts of {dest.name}</p>
        <p className="mb-4 text-[0.72rem] leading-relaxed text-[#a08b66]">
          States appear as cards on the country page; districts appear inside each state page. Assign places to a district and they slot into the atlas automatically.
        </p>
        <div className="space-y-3">
          {states.map((st, idx) => (
            <div key={st.slug} className={`rounded-lg border ${C.borderSoft}`}>
              <div className="flex items-center gap-2 px-4 py-3">
                <button onClick={() => setExpanded((p) => ({ ...p, [st.slug]: !p[st.slug] }))} className="text-[#a08b66]">
                  {expanded[st.slug] ? '▾' : '▸'}
                </button>
                <input
                  defaultValue={st.name}
                  onBlur={(e) => e.target.value.trim() && e.target.value !== st.name && saveState({ ...st, name: e.target.value.trim() }, idx + 1)}
                  className="flex-1 bg-transparent text-[0.9rem] font-medium text-[#2c2418] outline-none"
                />
                <span className="text-[0.68rem] text-[#c4b291]">
                  {st.districts.length} district{st.districts.length === 1 ? '' : 's'} · {st.districts.reduce((n, d) => n + d.placeIds.length, 0)} places
                </span>
                <a href={`/destinations/${dest.id}/states/${st.slug}`} target="_blank" rel="noreferrer" className="text-[0.66rem] text-[#a6783c] underline">view</a>
                <button
                  onClick={() => { if (confirm(`Delete ${st.name} and its districts? The places stay published, only the hierarchy is removed.`)) deleteStateM.mutate({ destSlug: dest.id, slug: st.slug }); }}
                  className="text-[0.62rem] uppercase tracking-[0.1em] text-[#c05f4e] hover:underline"
                >✕</button>
              </div>
              {expanded[st.slug] && (
                <div className="space-y-3 border-t border-[#f5edd9] px-4 py-3">
                  {st.districts.map((d) => (
                    <div key={d.id} className="rounded-lg bg-[#fdfaf3] p-3">
                      <div className="flex items-center gap-2">
                        <input
                          defaultValue={d.name}
                          onBlur={(e) => e.target.value.trim() && e.target.value !== d.name && saveState({ ...st, districts: st.districts.map((x) => x.id === d.id ? { ...x, name: e.target.value.trim() } : x) }, idx + 1)}
                          className="flex-1 bg-transparent text-[0.82rem] font-medium text-[#2c2418] outline-none"
                        />
                        <span className="text-[0.66rem] text-[#c4b291]">{d.placeIds.length} place{d.placeIds.length === 1 ? '' : 's'}</span>
                        <button onClick={() => removeDistrict(st, idx, d.id)} className="text-[0.62rem] text-[#c05f4e] hover:underline">✕</button>
                      </div>
                      {d.placeIds.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {d.placeIds.map((pid) => {
                            const pl = places.find((x) => x.id === pid);
                            return (
                              <span key={pid} className="inline-flex items-center gap-1.5 rounded-full border border-[#e3d5b8] bg-white px-2.5 py-1 text-[0.7rem] text-[#2c2418]">
                                {pl?.name ?? pid}
                                <button onClick={() => unassignPlace(st, idx, d.id, pid)} className="text-[#c05f4e]">✕</button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <select
                          value={placePick[`${st.slug}/${d.id}`] ?? ''}
                          onChange={(e) => setPlacePick((p) => ({ ...p, [`${st.slug}/${d.id}`]: e.target.value }))}
                          className="flex-1 rounded-lg border border-[#ddcdab] bg-white px-2.5 py-1.5 text-[0.76rem] outline-none"
                        >
                          <option value="">+ Assign a place…</option>
                          {destPlaces.filter((p) => !d.placeIds.includes(p.id)).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <button onClick={() => assignPlace(st, idx, d.id)} className="rounded-full bg-[#b98a4a] px-3.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-white">Add</button>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      value={newDistrict[st.slug] ?? ''}
                      onChange={(e) => setNewDistrict((p) => ({ ...p, [st.slug]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && addDistrict(st, idx)}
                      placeholder="New district name…"
                      className="flex-1 rounded-lg border border-[#ddcdab] bg-white px-3 py-1.5 text-[0.78rem] outline-none"
                    />
                    <button onClick={() => addDistrict(st, idx)} className="rounded-full border border-[#b98a4a]/40 px-3.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#a6783c]">+ District</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <input
              value={newState}
              onChange={(e) => setNewState(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addState()}
              placeholder={`New state / province in ${dest.name}…`}
              className="w-80 rounded-lg border border-[#ddcdab] bg-white px-3 py-2 text-[0.82rem] outline-none"
            />
            <button onClick={addState} disabled={upsertStateM.isPending} className="rounded-full bg-[#b98a4a] px-4 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-50">+ Add state</button>
          </div>
        </div>
      </div>

      {/* ---------- pin dropping ---------- */}
      <div className={`rounded-xl border ${C.border} bg-white p-5`}>
        <p className={labelCls}>Map markers for {dest.name}</p>
        <p className="mb-4 text-[0.72rem] leading-relaxed text-[#a08b66]">
          Pick a place, then click on the map to drop its pin. Click a different spot to move it. These pins appear on the live destination map.
        </p>
        <div className="mb-4 flex items-center gap-3">
          <select value={pinPlace} onChange={(e) => setPinPlace(e.target.value)} className={inputCls + ' !w-80'}>
            <option value="">Choose a place to pin…</option>
            {unmarked.length > 0 && <optgroup label="Not yet pinned">{unmarked.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</optgroup>}
            {markers.length > 0 && <optgroup label="Already pinned (re-position)">{markers.map((m) => { const p = places.find((x) => x.id === m.placeSlug); return <option key={m.placeSlug} value={m.placeSlug}>{p?.name ?? m.placeSlug}</option>; })}</optgroup>}
          </select>
          {pinPlace && <span className="text-[0.72rem] text-[#3e7d5a]">Now click the map to drop the pin ↓</span>}
        </div>
        {dest.mapImg ? (
          <div
            onClick={dropPin}
            className={`relative overflow-hidden rounded-xl border ${C.border} ${pinPlace ? 'cursor-crosshair' : 'cursor-default'}`}
          >
            <img src={IMG(dest.mapImg)} alt={`Map of ${dest.name}`} className="block h-auto w-full select-none" draggable={false} />
            {markers.map((m) => {
              const p = places.find((x) => x.id === m.placeSlug);
              return (
                <div key={m.placeSlug} className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${m.x}%`, top: `${m.y}%` }}>
                  <span className={`block h-3.5 w-3.5 rounded-full ring-2 ring-white ${m.placeSlug === pinPlace ? 'bg-[#c05f4e]' : 'bg-[#b98a4a]'}`} />
                  <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#2c2418] px-2 py-1 text-[0.62rem] text-[#f5edd9] opacity-0 transition-opacity group-hover:opacity-100">
                    {p?.name ?? m.placeSlug}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteMarkerM.mutate({ destSlug: dest.id, placeSlug: m.placeSlug }); }}
                    className="absolute -right-2 -top-2 hidden h-4 w-4 items-center justify-center rounded-full bg-[#c05f4e] text-[0.55rem] text-white group-hover:flex"
                    title="Remove pin"
                  >✕</button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[0.8rem] text-[#a08b66]">This destination has no map image yet — set one in the Destinations tab ("Map image").</p>
        )}
      </div>
    </div>
  );
}

/* ======================================================= media gallery */

/** Studio media gallery — upload images once, reuse them anywhere on the site.
    Files live in the database and are served from /api/media/:id. */
function GalleryPanel() {
  const utils = trpc.useUtils();
  const mediaQ = trpc.content.mediaList.useQuery();
  const uploadM = trpc.content.uploadMedia.useMutation({ onSuccess: () => utils.content.mediaList.invalidate() });
  const updateM = trpc.content.updateMedia.useMutation({ onSuccess: () => utils.content.mediaList.invalidate() });
  const deleteM = trpc.content.deleteMedia.useMutation({ onSuccess: () => { utils.content.mediaList.invalidate(); setSel(null); } });

  const [sel, setSel] = useState<number | null>(null);
  const [findOpen, setFindOpen] = useState(false);
  const [meta, setMeta] = useState({ alt: '', caption: '', credit: '', license: '' });
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const items = mediaQ.data ?? [];
  const current = items.find((m) => m.id === sel) ?? null;

  const onFile = (f: File | undefined) => {
    if (!f) return;
    if (!/^image\/(jpeg|png|webp|gif|avif)$/.test(f.type)) { setErr('Use a JPG, PNG, WebP, GIF or AVIF image.'); return; }
    if (f.size > 9 * 1024 * 1024) { setErr('Keep images under 9 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      uploadM.mutate({ fileName: f.name, mime: f.type, data: dataUrl.slice(dataUrl.indexOf(',') + 1), alt: '', caption: '', credit: '', license: '' });
      setErr(null);
    };
    reader.readAsDataURL(f);
  };

  const copyUrl = (id: number) => {
    navigator.clipboard?.writeText(`/api/media/${id}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="mt-1 max-w-xl text-[0.78rem] text-[#a08b66]">
            Upload images here once, then reuse them anywhere — author photos, story cards, hero, section art. Each image gets a permanent link like <code className="rounded bg-[#f5edd9] px-1">/api/media/12</code>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }} />
          <button
            onClick={() => setFindOpen(true)}
            className="rounded-full border border-[#b98a4a]/40 px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#a6783c] transition-colors hover:border-[#b98a4a]/70"
          >
            Find free images
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadM.isPending}
            className="rounded-full bg-[#b98a4a] px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white transition-transform hover:scale-[1.03] disabled:opacity-50"
          >
            {uploadM.isPending ? 'Uploading…' : '+ Upload image'}
          </button>
        </div>
      </div>
      {err && <p className="mb-4 rounded-lg border border-[#c05f4e]/30 bg-[#c05f4e]/10 px-4 py-2 text-[0.78rem] text-[#c05f4e]">{err}</p>}

      {items.length === 0 && !mediaQ.isLoading && (
        <div className={`rounded-xl border border-dashed ${C.border} px-6 py-16 text-center`}>
          <p className="font-display text-lg text-[#7a6a50]">No images yet</p>
          <p className="mt-1 text-[0.8rem] text-[#a08b66]">Upload your first image — it will appear here with a reusable link.</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid auto-rows-max grid-cols-2 gap-3 self-start sm:grid-cols-3 xl:grid-cols-4">
          {items.map((m) => (
            <button
              key={m.id}
              onClick={() => { setSel(m.id); setMeta({ alt: m.alt, caption: m.caption, credit: m.credit, license: m.license }); }}
              className={`group relative overflow-hidden rounded-xl border ${sel === m.id ? 'border-[#b98a4a] ring-2 ring-[#b98a4a]/30' : C.borderSoft} bg-white`}
            >
              <img src={`/api/media/${m.id}`} alt={m.alt} loading="lazy" className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
              <p className="truncate px-2.5 py-2 text-left text-[0.68rem] text-[#7a6a50]">{m.fileName}</p>
            </button>
          ))}
        </div>

        {current && (
          <div className={`h-fit rounded-xl border ${C.border} bg-white p-5`}>
            <img src={`/api/media/${current.id}`} alt={current.alt} className="h-40 w-full rounded-lg object-cover" />
            <div className="mt-3 flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg bg-[#f5edd9] px-2.5 py-1.5 text-[0.72rem] text-[#8a6224]">/api/media/{current.id}</code>
              <button onClick={() => copyUrl(current.id)} className="shrink-0 rounded-full border border-[#b98a4a]/40 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#a6783c] hover:border-[#b98a4a]/70">
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <Field label="Alt text"><TextInput value={meta.alt} onChange={(e) => setMeta({ ...meta, alt: e.target.value })} /></Field>
              <Field label="Caption"><TextInput value={meta.caption} onChange={(e) => setMeta({ ...meta, caption: e.target.value })} /></Field>
              <Field label="Credit"><TextInput value={meta.credit} onChange={(e) => setMeta({ ...meta, credit: e.target.value })} /></Field>
              <Field label="License"><TextInput value={meta.license} onChange={(e) => setMeta({ ...meta, license: e.target.value })} placeholder="e.g. CC BY-SA 4.0" /></Field>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => updateM.mutate({ id: current.id, ...meta })}
                disabled={updateM.isPending}
                className="rounded-full bg-[#b98a4a] px-5 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-50"
              >
                {updateM.isPending ? 'Saving…' : 'Save details'}
              </button>
              <button
                onClick={() => { if (confirm('Delete this image? Pages already using it will lose the image.')) deleteM.mutate({ id: current.id }); }}
                className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#c05f4e] hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
      <MediaDialog
        open={findOpen}
        initialTab="search"
        onClose={() => setFindOpen(false)}
        onPick={() => { setFindOpen(false); utils.content.mediaList.invalidate(); }}
      />
    </div>
  );
}

const fmtDate = (d: Date | null | undefined) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

const statusPill = (st: StatusFilter) =>
  st === 'published'
    ? 'bg-[#3e7d5a]/10 text-[#3e7d5a]'
    : st === 'draft'
      ? 'bg-[#b07f3c]/10 text-[#b07f3c]'
      : 'bg-[#c05f4e]/10 text-[#c05f4e]';

/* small inline icons not present in the shared set */

const ico = {
  home: (cls: string) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" />
    </svg>
  ),
  gear: (cls: string) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z" />
    </svg>
  ),
  image: (cls: string) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" /><circle cx="9" cy="10" r="1.8" /><path d="m4.5 18 5-5 3.5 3.5L17 12l3.5 3.5" />
    </svg>
  ),
};

/* ======================================================= editors (forms) */

interface PlaceSection {
  heading: string;
  body: string;
}

interface PlaceForm {
  id: string;
  name: string;
  region: string;
  country: string;
  destId: string;
  type: 'Heritage' | 'City' | 'Nature';
  img: string;
  summary: string;
  sections: PlaceSection[];
  facts: WikiFact[];
  related: string[];
  address: string;
  lat: string;
  lng: string;
  contributors: Contributor[];
  // Tamil translation — sections/facts kept from the loaded record, editable fields below
  taName: string;
  taRegion: string;
  taCountry: string;
  taSummary: string;
  taSections?: PlaceSection[];
  taFacts?: WikiFact[];
}

const emptyPlace = (): PlaceForm => ({
  id: '', name: '', region: '', country: '', destId: 'india', type: 'Heritage',
  img: '', summary: '', sections: [{ heading: 'Overview', body: '' }], facts: [], related: [],
  address: '', lat: '', lng: '', contributors: [],
  taName: '', taRegion: '', taCountry: '', taSummary: '',
});

/** Builds the place.ta payload from form fields, preserving existing Tamil sections/facts. */
function placeTaFromForm(f: PlaceForm) {
  const hasText = f.taName.trim() || f.taRegion.trim() || f.taCountry.trim() || f.taSummary.trim();
  if (!hasText && !f.taSections?.length && !f.taFacts?.length) return null;
  return {
    name: f.taName.trim() || f.name,
    region: f.taRegion.trim() || f.region,
    country: f.taCountry.trim() || f.country,
    summary: f.taSummary.trim() || f.summary,
    ...(f.taSections?.length ? { sections: f.taSections } : {}),
    ...(f.taFacts?.length ? { facts: f.taFacts } : {}),
  };
}

/** Compact contributor list editor for the settings rail (posts + places). */
function ContributorsRail({ value, onChange }: { value: Contributor[]; onChange: (v: Contributor[]) => void }) {
  const setC = (i: number, patch: Partial<Contributor>) =>
    onChange(value.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  return (
    <div className={`border-t pt-4 ${C.borderSoft}`}>
      <p className={labelCls}>Contributors</p>
      <p className="mb-2 text-[0.72rem] leading-relaxed text-[#a08b66]">
        Credited at the end of the page — guides, photographers, local experts.
      </p>
      <div className="space-y-3">
        {value.map((c, i) => (
          <div key={i} className={`space-y-2 rounded-lg border ${C.borderSoft} bg-[#fdfaf3] p-3`}>
            <div className="flex items-center gap-2">
              <TextInput value={c.name} onChange={(e) => setC(i, { name: e.target.value })} placeholder="Name" />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="shrink-0 text-[0.62rem] uppercase tracking-[0.12em] text-[#c05f4e] hover:underline"
              >
                ✕
              </button>
            </div>
            <TextInput value={c.role ?? ''} onChange={(e) => setC(i, { role: e.target.value })} placeholder="Role (e.g. Field researcher)" />
            <TextArea rows={2} value={c.bio ?? ''} onChange={(e) => setC(i, { bio: e.target.value })} placeholder="One or two lines about them…" />
            <ImagePickField value={c.photo ?? ''} onChange={(v) => setC(i, { photo: v })} placeholder="Photo — pick from gallery or paste a URL (optional)" />
            <TextInput value={c.link ?? ''} onChange={(e) => setC(i, { link: e.target.value })} placeholder="External link (optional)" />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...value, { name: '' }])}
        className="mt-3 rounded-full border border-[#b98a4a]/40 px-4 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#a6783c] transition-colors hover:border-[#b98a4a]/70"
      >
        + Add contributor
      </button>
    </div>
  );
}

function PlaceEditor({
  form, setForm, isNew, setRail,
}: {
  form: PlaceForm;
  setForm: (f: PlaceForm) => void;
  isNew: boolean;
  setRail: (r: React.ReactNode) => void;
}) {
  const set = <K extends keyof PlaceForm>(k: K, v: PlaceForm[K]) => setForm({ ...form, [k]: v });
  const setSection = (i: number, sc: PlaceSection) =>
    set('sections', form.sections.map((x, j) => (j === i ? sc : x)));

  // settings live in the right rail (Wix/WordPress style)
  useEffect(() => {
    setRail(
      <div className="space-y-5">
        <Field label="URL slug (lowercase, dashes)">
          <TextInput value={form.id} onChange={(e) => set('id', e.target.value)} placeholder="e.g. shore-temple" disabled={!isNew} className={!isNew ? 'opacity-50' : ''} />
        </Field>
        <Field label="Type">
          <select value={form.type} onChange={(e) => set('type', e.target.value as PlaceForm['type'])} className={inputCls}>
            <option>Heritage</option>
            <option>City</option>
            <option>Nature</option>
          </select>
        </Field>
        <Field label="Region"><TextInput value={form.region} onChange={(e) => set('region', e.target.value)} /></Field>
        <Field label="Country"><TextInput value={form.country} onChange={(e) => set('country', e.target.value)} /></Field>
        <Field label="Destination id"><TextInput value={form.destId} onChange={(e) => set('destId', e.target.value)} /></Field>
        <Field label="Image"><ImagePickField value={form.img} onChange={(v) => set('img', v)} /></Field>
        {form.img && <img src={IMG(form.img)} alt="" className={`h-28 w-full rounded-lg border ${C.border} object-cover`} />}
        <Field label="Related place slugs (comma separated)">
          <TextInput value={form.related.join(', ')} onChange={(e) => set('related', e.target.value.split(',').map((x) => x.trim()).filter(Boolean))} />
        </Field>
        <div className={`border-t pt-4 ${C.borderSoft}`}>
          <p className={labelCls}>Location (map panel)</p>
          <p className="mb-2 text-[0.72rem] leading-relaxed text-[#a08b66]">
            Shown in the sidebar with a map and directions button. Leave empty to hide the panel.
          </p>
          <div className="space-y-4">
            <Field label="Street address"><TextInput value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Membalam Road, Thanjavur…" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude"><TextInput value={form.lat} onChange={(e) => set('lat', e.target.value)} placeholder="10.7827" /></Field>
              <Field label="Longitude"><TextInput value={form.lng} onChange={(e) => set('lng', e.target.value)} placeholder="79.1316" /></Field>
            </div>
          </div>
        </div>
        <ContributorsRail value={form.contributors} onChange={(v) => set('contributors', v)} />
      </div>,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, isNew]);

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl border ${C.border} bg-white px-6 py-6 md:px-9 md:py-7`}>
        <input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Place name"
          className="w-full bg-transparent font-display text-3xl text-[#2c2418] outline-none placeholder:text-[#c4b291]"
        />
        <textarea
          rows={3}
          value={form.summary}
          onChange={(e) => set('summary', e.target.value)}
          placeholder="Summary — the italic standfirst that opens the page…"
          className="mt-3 w-full resize-y bg-transparent text-[1.02rem] italic leading-relaxed text-[#7a6a50] outline-none placeholder:text-[#c4b291]"
        />
      </div>

      <div className="space-y-5">
        {form.sections.map((sc, i) => (
          <div key={i} className={`rounded-2xl border ${C.border} bg-[#fdfaf3] p-4 md:p-5`}>
            <div className="mb-3 flex items-center gap-3">
              <TextInput value={sc.heading} onChange={(e) => setSection(i, { ...sc, heading: e.target.value })} placeholder="Section heading" />
              <button
                type="button"
                onClick={() => set('sections', form.sections.filter((_, j) => j !== i))}
                className="shrink-0 rounded-full border border-[#c05f4e]/40 px-3 py-2 text-[0.62rem] uppercase tracking-[0.14em] text-[#c05f4e] transition-colors hover:bg-[#c05f4e]/10"
              >
                Remove
              </button>
            </div>
            <RichEditor
              html={sc.body}
              onChange={(h) => setSection(i, { ...sc, body: h })}
              placeholder="Write this section — format with the toolbar above…"
              minHeight={220}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => set('sections', [...form.sections, { heading: '', body: '' }])}
          className="rounded-full border border-[#b98a4a]/40 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#a6783c] transition-colors hover:border-[#b98a4a]/70"
        >
          + Add section
        </button>
      </div>

      <div className={`rounded-2xl border ${C.border} bg-[#fdfaf3] px-6 py-5`}>
        <p className={labelCls}>Quick facts (label — value, one per line)</p>
        <TextArea
          rows={5}
          value={form.facts.map((f) => `${f.label} — ${f.value}`).join('\n')}
          onChange={(e) =>
            set('facts', e.target.value.split('\n').map((line) => {
              const [label, ...rest] = line.split(' — ');
              return { label: (label ?? '').trim(), value: rest.join(' — ').trim() };
            }).filter((f) => f.label))
          }
        />
      </div>

      <details className={`rounded-2xl border ${C.border} bg-white px-6 py-5`}>
        <summary className="cursor-pointer font-display text-lg text-[#2c2418]">தமிழ் translation (optional)</summary>
        <p className="mb-4 mt-1 text-[0.78rem] leading-relaxed text-[#a08b66]">
          Shown when a visitor switches the site to Tamil. Fields left empty fall back to English — saving here never deletes an existing translation.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name (Tamil)"><TextInput value={form.taName} onChange={(e) => set('taName', e.target.value)} placeholder={form.name || 'தமிழ் பெயர்'} /></Field>
          <Field label="Region (Tamil)"><TextInput value={form.taRegion} onChange={(e) => set('taRegion', e.target.value)} placeholder={form.region || 'தமிழ் பிரதேசம்'} /></Field>
          <Field label="Country (Tamil)"><TextInput value={form.taCountry} onChange={(e) => set('taCountry', e.target.value)} placeholder={form.country || 'தமிழ் நாடு'} /></Field>
        </div>
        <div className="mt-4">
          <Field label="Summary (Tamil)"><TextArea rows={3} value={form.taSummary} onChange={(e) => set('taSummary', e.target.value)} placeholder="தமிழ் சுருக்கம்…" /></Field>
        </div>
      </details>
    </div>
  );
}

interface StoryForm {
  id: string;
  tag: string;
  title: string;
  time: string;
  img: string;
  placeId: string;
  lede: string;
  body: string;
  seriesSlug: string;
  relatedPlaces: string[];
  contributors: Contributor[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  // Tamil translation (optional)
  taTitle: string;
  taTime: string;
  taLede: string;
  taBody: string;
}

const emptyStory = (): StoryForm => ({
  id: '', tag: 'Essay', title: '', time: '5 min read', img: '', placeId: '', lede: '', body: '',
  seriesSlug: '', relatedPlaces: [], contributors: [], seoTitle: '', seoDescription: '', seoKeywords: '',
  taTitle: '', taTime: '', taLede: '', taBody: '',
});

/** Builds the story.ta payload; empty form = no translation stored (existing one is preserved by pre-fill). */
function storyTaFromForm(f: StoryForm) {
  const has = f.taTitle.trim() || f.taLede.trim() || f.taBody.trim();
  if (!has) return null;
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const rawBody = f.taBody.trim();
  // plain-text paragraphs become HTML; content that already looks like HTML is kept as-is
  const body = rawBody
    ? (/<[a-z][\s\S]*>/i.test(rawBody) ? rawBody : rawBody.split(/\n+/).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join(''))
    : f.body;
  return {
    title: f.taTitle.trim() || f.title,
    time: f.taTime.trim() || f.time,
    lede: f.taLede.trim() || f.lede,
    body,
  };
}

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

/* Wix-style post editor: content first, settings in the right rail */
function StoryEditor({
  form, setForm, isNew, setRail, onEditor, existingSlugs = [],
}: {
  form: StoryForm;
  setForm: (f: StoryForm) => void;
  isNew: boolean;
  setRail: (r: React.ReactNode) => void;
  onEditor?: (e: Editor | null) => void;
  existingSlugs?: string[];
}) {
  const set = <K extends keyof StoryForm>(k: K, v: StoryForm[K]) => setForm({ ...form, [k]: v });
  const placesQ = trpc.content.places.useQuery();
  const places = placesQ.data ?? [];
  const seriesQ = trpc.content.series.useQuery();
  const seriesList = seriesQ.data ?? [];
  const storiesQ = trpc.content.adminStories.useQuery();
  const knownTags = Array.from(new Set((storiesQ.data ?? []).map((s) => s.tag).filter(Boolean)));
  const [seoOpen, setSeoOpen] = useState(false);
  const slugTouched = useRef(false);
  const slugTaken = isNew && !!form.id && existingSlugs.includes(form.id);

  const onTitleChange = (v: string) => {
    // name-based slugs are a real SEO signal — auto-build from the title until edited by hand
    if (isNew && !slugTouched.current) setForm({ ...form, title: v, id: slugify(v) });
    else set('title', v);
  };

  const toggleRelated = (slug: string) =>
    set('relatedPlaces', form.relatedPlaces.includes(slug)
      ? form.relatedPlaces.filter((x) => x !== slug)
      : [...form.relatedPlaces, slug]);

  // settings live in the right rail (Wix/WordPress style)
  useEffect(() => {
    setRail(
      <div className="space-y-5">
        <Field label="URL slug (lowercase, dashes)">
          <TextInput
            value={form.id}
            onChange={(e) => {
              slugTouched.current = true;
              set('id', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
            }}
            placeholder="e.g. monsoon-in-madurai"
            disabled={!isNew}
            className={!isNew ? 'opacity-50' : ''}
          />
        </Field>
        <p className="-mt-3 text-[0.7rem] leading-relaxed text-[#a08b66]">
          Auto-built from the post title — real words in the URL are a genuine ranking signal, so we deliberately don't use numeric post IDs. Editable until the post is first saved.
        </p>
        {slugTaken && (
          <p className="-mt-3 text-[0.7rem] font-semibold text-[#c05f4e]">⚠ This slug is already used by another post — pick a different one.</p>
        )}
        <Field label="Tag / category">
          <TextInput value={form.tag} onChange={(e) => set('tag', e.target.value)} list="story-tag-suggestions" placeholder="Essay, Field Notes, Japan…" />
          <datalist id="story-tag-suggestions">
            {knownTags.map((tg) => <option key={tg} value={tg} />)}
          </datalist>
        </Field>
        <p className="-mt-3 text-[0.7rem] leading-relaxed text-[#a08b66]">
          Free text — type any category name (a country, a theme, anything). Existing categories are suggested as you type.
        </p>
        <Field label="Read time"><TextInput value={form.time} onChange={(e) => set('time', e.target.value)} /></Field>
        <Field label="Series (optional)">
          <select value={form.seriesSlug} onChange={(e) => set('seriesSlug', e.target.value)} className={inputCls}>
            <option value="">— not in a series —</option>
            {seriesList.map((se) => <option key={se.id} value={se.id}>{se.name}</option>)}
          </select>
        </Field>
        <p className="-mt-3 text-[0.7rem] leading-relaxed text-[#a08b66]">
          Groups this story under a series card on the Stories page. Manage series from the Series section in the sidebar.
        </p>
        <Field label="Linked place (optional)">
          <select value={form.placeId} onChange={(e) => set('placeId', e.target.value)} className={inputCls}>
            <option value="">— none —</option>
            {places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Cover image file"><TextInput value={form.img} onChange={(e) => set('img', e.target.value)} /></Field>
        {form.img && <img src={IMG(form.img)} alt="" className={`h-28 w-full rounded-lg border ${C.border} object-cover`} />}

        <div className={`border-t pt-4 ${C.borderSoft}`}>
          <p className={labelCls}>Related places</p>
          <p className="mb-2 text-[0.72rem] leading-relaxed text-[#a08b66]">Tap to tag — shown as links at the end of the story.</p>
          <div className="flex flex-wrap gap-1.5">
            {places.map((p) => {
              const on = form.relatedPlaces.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleRelated(p.id)}
                  className={`rounded-full border px-2.5 py-1 text-[0.68rem] transition-colors ${
                    on
                      ? 'border-[#8a6224] bg-[#8a6224] text-white'
                      : 'border-[#ddcdab] bg-white text-[#7a6a50] hover:border-[#b98a4a]'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        <ContributorsRail value={form.contributors} onChange={(v) => set('contributors', v)} />

        <div className={`border-t pt-4 ${C.borderSoft}`}>
          <button
            type="button"
            onClick={() => setSeoOpen(!seoOpen)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className={labelCls + ' mb-0'}>SEO settings</span>
            <span className={`text-[#a08b66] transition-transform ${seoOpen ? 'rotate-180' : ''}`}>▾</span>
          </button>
          {seoOpen && (
            <div className="mt-3 space-y-4">
              <Field label="SEO title (defaults to post title)">
                <TextInput value={form.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} placeholder={form.title || 'Post title'} />
              </Field>
              <Field label={`Meta description (${form.seoDescription.length}/160)`}>
                <TextArea
                  rows={3}
                  value={form.seoDescription}
                  onChange={(e) => set('seoDescription', e.target.value.slice(0, 160))}
                  placeholder={form.lede || 'One or two sentences for search results…'}
                />
              </Field>
              <Field label="Keywords (comma separated)">
                <TextInput value={form.seoKeywords} onChange={(e) => set('seoKeywords', e.target.value)} placeholder="kaveri, chola temples, srirangam" />
              </Field>
              <div className={`rounded-lg border ${C.borderSoft} bg-[#fdfaf3] p-3`}>
                <p className="mb-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[#a08b66]">Search preview</p>
                <p className="truncate text-[0.82rem] text-[#1a0dab]">{(form.seoTitle || form.title || 'Post title') + ' — Vazhi'}</p>
                <p className="text-[0.72rem] text-[#3e7d5a]">vazhi.wiki/stories/{form.id || '…'}</p>
                <p className="mt-0.5 line-clamp-2 text-[0.74rem] leading-snug text-[#7a6a50]">{form.seoDescription || form.lede || 'Meta description appears here.'}</p>
              </div>
            </div>
          )}
        </div>
      </div>,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, isNew, seoOpen, places.length, seriesList.length, knownTags.length]);

  return (
    <div className={`rounded-2xl border ${C.border} bg-white px-6 py-6 md:px-10 md:py-8`}>
      <input
        value={form.title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Post title"
        className="w-full bg-transparent font-display text-3xl text-[#2c2418] outline-none placeholder:text-[#c4b291]"
      />
      <textarea
        rows={2}
        value={form.lede}
        onChange={(e) => set('lede', e.target.value)}
        placeholder="Lede — the italic standfirst that opens the piece…"
        className="mt-4 w-full resize-y bg-transparent text-[1.05rem] italic leading-relaxed text-[#7a6a50] outline-none placeholder:text-[#c4b291]"
      />
      <div className={`my-5 border-t ${C.borderSoft}`} />
      <RichEditor
        html={form.body}
        onChange={(h) => set('body', h)}
        placeholder="Write the story — type # for a heading, > for a quote, - for a list…"
        minHeight={460}
        onEditor={onEditor}
      />

      <details className={`mt-6 rounded-xl border ${C.borderSoft} bg-[#fdfaf3] px-5 py-4`}>
        <summary className="cursor-pointer font-display text-base text-[#2c2418]">தமிழ் translation (optional)</summary>
        <p className="mb-3 mt-1 text-[0.76rem] leading-relaxed text-[#a08b66]">
          Shown when a visitor switches to Tamil. Empty fields fall back to English — saving never deletes an existing translation.
        </p>
        <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
          <TextInput value={form.taTitle} onChange={(e) => set('taTitle', e.target.value)} placeholder={form.title || 'தமிழ் தலைப்பு'} />
          <TextInput value={form.taTime} onChange={(e) => set('taTime', e.target.value)} placeholder={form.time || '5 நிமிடம்'} />
        </div>
        <TextArea rows={2} value={form.taLede} onChange={(e) => set('taLede', e.target.value)} placeholder="தமிழ் அறிமுக வரி…" className="mt-3" />
        <TextArea
          rows={8}
          value={form.taBody}
          onChange={(e) => set('taBody', e.target.value)}
          placeholder="தமிழ் கட்டுரை — plain text, one paragraph per line…"
          className="mt-3 font-body"
        />
      </details>
    </div>
  );
}

interface JourneyForm { id?: number; title: string; meta: string; map: string; note: string; }
const emptyJourney = (): JourneyForm => ({ title: '', meta: '', map: '', note: '' });

function JourneyEditor({ form, setForm }: { form: JourneyForm; setForm: (f: JourneyForm) => void }) {
  const set = <K extends keyof JourneyForm>(k: K, v: JourneyForm[K]) => setForm({ ...form, [k]: v });
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Title"><TextInput value={form.title} onChange={(e) => set('title', e.target.value)} /></Field>
        <Field label="Meta (12 Days · 6 Cities · …)"><TextInput value={form.meta} onChange={(e) => set('meta', e.target.value)} /></Field>
        <Field label="Map image file"><TextInput value={form.map} onChange={(e) => set('map', e.target.value)} /></Field>
      </div>
      {form.map && <img src={IMG(form.map)} alt="" className={`h-32 w-52 rounded-lg border ${C.border} object-cover`} />}
      <Field label="Note"><TextArea value={form.note} onChange={(e) => set('note', e.target.value)} /></Field>
    </div>
  );
}

interface DestForm { id: string; name: string; places: string; img: string; blurb: string; mapImg: string; taName: string; taPlacesLabel: string; taBlurb: string; }
const emptyDest = (): DestForm => ({ id: '', name: '', places: '0 Places', img: '', blurb: '', mapImg: '', taName: '', taPlacesLabel: '', taBlurb: '' });

function DestEditor({ form, setForm, isNew }: { form: DestForm; setForm: (f: DestForm) => void; isNew: boolean }) {
  const set = <K extends keyof DestForm>(k: K, v: DestForm[K]) => setForm({ ...form, [k]: v });
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="URL slug"><TextInput value={form.id} onChange={(e) => set('id', e.target.value)} disabled={!isNew} className={!isNew ? 'opacity-50' : ''} /></Field>
        <Field label="Name"><TextInput value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="Places label (2,154 Places)"><TextInput value={form.places} onChange={(e) => set('places', e.target.value)} /></Field>
        <Field label="Card image"><TextInput value={form.img} onChange={(e) => set('img', e.target.value)} /></Field>
        <Field label="Map image"><TextInput value={form.mapImg} onChange={(e) => set('mapImg', e.target.value)} /></Field>
      </div>
      <Field label="Blurb"><TextArea rows={2} value={form.blurb} onChange={(e) => set('blurb', e.target.value)} /></Field>
      <details className={`rounded-xl border ${C.borderSoft} bg-[#fdfaf3] px-4 py-3`}>
        <summary className="cursor-pointer font-display text-base text-[#2c2418]">தமிழ் translation (optional)</summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="Name (Tamil)"><TextInput value={form.taName} onChange={(e) => set('taName', e.target.value)} placeholder={form.name || 'தமிழ் பெயர்'} /></Field>
          <Field label="Places label (Tamil)"><TextInput value={form.taPlacesLabel} onChange={(e) => set('taPlacesLabel', e.target.value)} placeholder="2,154 இடங்கள்" /></Field>
        </div>
        <div className="mt-3"><Field label="Blurb (Tamil)"><TextArea rows={2} value={form.taBlurb} onChange={(e) => set('taBlurb', e.target.value)} /></Field></div>
      </details>
    </div>
  );
}

interface SeriesForm { id: string; name: string; nameTa: string; description: string; descTa: string; img: string; }
const emptySeries = (): SeriesForm => ({ id: '', name: '', nameTa: '', description: '', descTa: '', img: '' });

function SeriesEditor({ form, setForm, isNew }: { form: SeriesForm; setForm: (f: SeriesForm) => void; isNew: boolean }) {
  const set = <K extends keyof SeriesForm>(k: K, v: SeriesForm[K]) => setForm({ ...form, [k]: v });
  const slugTouched = useRef(false);
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Series name">
          <TextInput
            value={form.name}
            onChange={(e) => {
              const v = e.target.value;
              if (isNew && !slugTouched.current) setForm({ ...form, name: v, id: slugify(v) });
              else set('name', v);
            }}
            placeholder="e.g. Japanese Days"
          />
        </Field>
        <Field label="URL slug">
          <TextInput
            value={form.id}
            onChange={(e) => { slugTouched.current = true; set('id', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')); }}
            placeholder="e.g. japanese-days"
            disabled={!isNew}
            className={!isNew ? 'opacity-50' : ''}
          />
        </Field>
        <Field label="Series name (Tamil, optional)"><TextInput value={form.nameTa} onChange={(e) => set('nameTa', e.target.value)} /></Field>
        <Field label="Card image"><ImagePickField value={form.img} onChange={(v) => set('img', v)} /></Field>
      </div>
      {form.img && <img src={IMG(form.img)} alt="" className={`h-32 w-52 rounded-lg border ${C.border} object-cover`} />}
      <Field label="Description"><TextArea rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="What ties these stories together…" /></Field>
      <Field label="Description (Tamil, optional)"><TextArea rows={2} value={form.descTa} onChange={(e) => set('descTa', e.target.value)} /></Field>
      <p className="text-[0.72rem] leading-relaxed text-[#a08b66]">
        The series appears as a card on the Stories page. Add stories to it from each post's settings rail (Series dropdown).
      </p>
    </div>
  );
}

/* ======================================================= main component */

/* Shortcuts & help dialog — closes on Esc, ✕, or backdrop click */
/* ------------------------- section content editors ------------------------- */

const miniLabel = `mb-1 block text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#a08b66]`;
const saveBtn = `rounded-full bg-[#b98a4a] px-5 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white transition-transform hover:scale-[1.03] disabled:opacity-50`;

function useSectionContent<T extends Record<string, unknown>>(key: 'home_hero' | 'home_interests' | 'home_join') {
  const utils = trpc.useUtils();
  const q = trpc.content.siteContent.useQuery();
  const saveM = trpc.content.setSiteContent.useMutation({
    onSuccess: () => utils.content.siteContent.invalidate(),
  });
  const current = (q.data?.[key] ?? {}) as Partial<T>;
  return { current, save: (value: T) => saveM.mutate({ key, value: JSON.stringify(value) }), saving: saveM.isPending, saved: saveM.isSuccess };
}

/** Navigation & header editor — toggles for header buttons + top-menu items (built-in + custom). */
type NavMenuItem = { id: string; label?: string; labelTa?: string; href?: string };
const BUILTIN_LABELS: Record<string, string> = { explore: 'Explore (mega menu)', stories: 'Stories', atlas: 'Atlas', about: 'About' };
function NavConfigEditor() {
  const utils = trpc.useUtils();
  const cfgQ = trpc.content.navConfig.useQuery();
  const saveM = trpc.content.setNavConfig.useMutation({ onSuccess: () => utils.content.navConfig.invalidate() });
  const [form, setForm] = useState<{ showLogin: boolean; showLang: boolean; showTheme: boolean; showSearch: boolean; menu: NavMenuItem[] } | null>(null);
  const [newItem, setNewItem] = useState({ label: '', labelTa: '', href: '' });
  useEffect(() => {
    if (!form && cfgQ.data !== undefined) {
      setForm({
        showLogin: cfgQ.data?.showLogin ?? true,
        showLang: cfgQ.data?.showLang ?? true,
        showTheme: cfgQ.data?.showTheme ?? true,
        showSearch: cfgQ.data?.showSearch ?? true,
        menu: (cfgQ.data?.menu?.length ? cfgQ.data.menu : [{ id: 'explore' }, { id: 'stories' }, { id: 'atlas' }, { id: 'about' }]) as NavMenuItem[],
      });
    }
  }, [cfgQ.data, form]);
  if (!form) return null;
  const set = (k: 'showLogin' | 'showLang' | 'showTheme' | 'showSearch', v: boolean) => setForm({ ...form, [k]: v });
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= form.menu.length) return;
    const next = [...form.menu];
    [next[i], next[j]] = [next[j], next[i]];
    setForm({ ...form, menu: next });
  };
  const itemName = (it: NavMenuItem) => it.href ? (it.label || it.href) : (BUILTIN_LABELS[it.id] ?? it.id);
  const addCustom = () => {
    const label = newItem.label.trim();
    const href = newItem.href.trim();
    if (!label || !href) return;
    const id = 'custom-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || `custom-${Date.now()}`;
    setForm({ ...form, menu: [...form.menu, { id, label, labelTa: newItem.labelTa.trim() || undefined, href }] });
    setNewItem({ label: '', labelTa: '', href: '' });
  };
  const Toggle = ({ k, label, hint }: { k: 'showLogin' | 'showLang' | 'showTheme' | 'showSearch'; label: string; hint: string }) => (
    <button
      type="button"
      onClick={() => set(k, !form[k])}
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${form[k] ? 'border-[#b98a4a]/50 bg-[#f5edd9]' : 'border-[#e3d5b8] bg-white'}`}
    >
      <span>
        <span className="block text-[0.85rem] font-medium text-[#2c2418]">{label}</span>
        <span className="block text-[0.72rem] text-[#a08b66]">{hint}</span>
      </span>
      <span className={`ml-4 inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${form[k] ? 'bg-[#b98a4a] justify-end' : 'bg-[#d9cba8] justify-start'}`}>
        <span className="h-5 w-5 rounded-full bg-white shadow" />
      </span>
    </button>
  );
  return (
    <div className={`rounded-2xl border ${C.border} bg-white p-6 md:p-8`}>
      <h2 className="font-display text-xl text-[#2c2418]">Navigation & header</h2>
      <p className={`mt-2 text-[0.85rem] leading-relaxed ${C.soft}`}>
        Control what appears in the top bar of the live site — no code changes needed. Changes apply instantly after saving.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Toggle k="showLogin" label="Sign-in / profile button" hint="The round person icon. Hide it if membership is not needed yet." />
        <Toggle k="showLang" label="Language switcher (EN / தமிழ்)" hint="Hide until your Tamil translations are ready." />
        <Toggle k="showTheme" label="Night / day toggle" hint="The moon-sun button that switches dark and light themes." />
        <Toggle k="showSearch" label="Search button" hint="The magnifier that opens site-wide search." />
      </div>
      <div className="mt-6">
        <p className={miniLabel}>Main menu items (left to right)</p>
        <div className="space-y-2">
          {form.menu.map((it, i) => (
            <div key={`${it.id}-${it.href ?? ''}`} className={`flex items-center gap-2 rounded-lg border ${C.border} bg-[#fdfaf3] px-3 py-2`}>
              <span className="flex-1 text-[0.85rem] text-[#2c2418]">
                {itemName(it)}
                {it.href && <span className="ml-2 text-[0.68rem] text-[#a08b66]">→ {it.href}{it.labelTa ? ` · தமிழ்: ${it.labelTa}` : ''}</span>}
              </span>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-md border border-[#e3d5b8] px-2 py-0.5 text-[#a6783c] disabled:opacity-30">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === form.menu.length - 1} className="rounded-md border border-[#e3d5b8] px-2 py-0.5 text-[#a6783c] disabled:opacity-30">↓</button>
              {it.href ? (
                <button type="button" onClick={() => setForm({ ...form, menu: form.menu.filter((_, j) => j !== i) })} className="rounded-md border border-[#c05f4e]/40 px-2 py-0.5 text-[#c05f4e]">✕</button>
              ) : (
                <span title="Built-in item — cannot be removed, only reordered" className="px-1 text-[0.62rem] uppercase tracking-[0.1em] text-[#c4b291]">built-in</span>
              )}
            </div>
          ))}
        </div>
        <div className={`mt-4 rounded-xl border ${C.borderSoft} bg-[#fdfaf3] p-4`}>
          <p className={miniLabel}>Add a custom menu item</p>
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr]">
            <TextInput value={newItem.label} onChange={(e) => setNewItem({ ...newItem, label: e.target.value })} placeholder="Label (English) — e.g. Gallery" />
            <TextInput value={newItem.labelTa} onChange={(e) => setNewItem({ ...newItem, labelTa: e.target.value })} placeholder="Label (Tamil, optional)" />
          </div>
          <div className="mt-2 flex gap-2">
            <TextInput value={newItem.href} onChange={(e) => setNewItem({ ...newItem, href: e.target.value })} placeholder="Link — /stories or https://…" className="flex-1" />
            <button type="button" onClick={addCustom} disabled={!newItem.label.trim() || !newItem.href.trim()} className="shrink-0 rounded-full border border-[#b98a4a]/50 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#a6783c] transition-colors hover:border-[#b98a4a] disabled:opacity-40">
              + Add
            </button>
          </div>
          <p className="mt-2 text-[0.72rem] leading-relaxed text-[#a08b66]">
            Use a site path like <code className="rounded bg-[#f5edd9] px-1">/stories</code> or a full URL like <code className="rounded bg-[#f5edd9] px-1">https://instagram.com/…</code> (opens in a new tab). Custom items can be removed; the four built-in items are fixed.
          </p>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button onClick={() => saveM.mutate(form)} disabled={saveM.isPending} className="rounded-full bg-[#2c2418] px-5 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#f0e6d2] transition-colors hover:bg-[#3a2c17] disabled:opacity-50">
          {saveM.isPending ? 'Saving…' : 'Save navigation'}
        </button>
        {saveM.isSuccess && <span className="text-[0.78rem] font-medium text-[#3e7d5a]">Saved — live on the site header.</span>}
        {saveM.isError && <span className="text-[0.78rem] font-medium text-[#c05f4e]">{saveM.error.message}</span>}
      </div>
    </div>
  );
}

/** Hero editor — image, headline lines, subline, search placeholder, popular chips, featured place. */
function HeroEditor() {
  const heroQ = trpc.content.heroImg.useQuery();
  const setHeroM = trpc.content.setHeroImg.useMutation({ onSuccess: () => trpc.useUtils().content.heroImg.invalidate() });
  const placesQ = trpc.content.adminPlaces.useQuery();
  const { current, save, saving, saved } = useSectionContent<{
    eyebrow: string; h1a: string; h1b: string; h1c: string; sub: string; searchPh: string;
    popular: { label: string; to: string }[]; featuredPlace: string;
  }>('home_hero');
  const [form, setForm] = useState({ eyebrow: '', h1a: '', h1b: '', h1c: '', sub: '', searchPh: '', popular: [
    { label: 'Chola Temples', to: '/destinations/india' },
    { label: 'Buddhist Sites', to: '/destinations/srilanka' },
    { label: 'Japan', to: '/destinations/japan' },
    { label: 'Turkey', to: '/destinations/turkey' },
    { label: 'Armenia', to: '/destinations/armenia' },
  ], featuredPlace: 'brihadisvara' });
  const [img, setImg] = useState('');
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!loaded && (current.eyebrow !== undefined || heroQ.data)) {
      setForm((f) => ({ ...f, ...current, popular: current.popular ?? f.popular }));
      setImg(heroQ.data ?? 'hero.jpg');
      setLoaded(true);
    }
  }, [current, heroQ.data, loaded]);
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const places = (placesQ.data ?? []).filter((p) => p.status === 'published');
  return (
    <div className="space-y-5">
      <div>
        <label className={miniLabel}>Hero image</label>
        <div className="flex items-end gap-3">
          <div className="flex-1"><ImagePickField value={img} onChange={setImg} placeholder="hero.jpg or /api/media/12" /></div>
          <button onClick={() => img.trim() && setHeroM.mutate({ img: img.trim() })} disabled={setHeroM.isPending} className={saveBtn}>
            {setHeroM.isPending ? 'Saving…' : 'Save image'}
          </button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className={miniLabel}>Eyebrow (small top line)</label><input value={form.eyebrow} onChange={(e) => set('eyebrow', e.target.value)} placeholder="A travel wiki · A personal atlas" className={inputCls} /></div>
        <div><label className={miniLabel}>Search placeholder</label><input value={form.searchPh} onChange={(e) => set('searchPh', e.target.value)} placeholder="Search places, stories, journeys…" className={inputCls} /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><label className={miniLabel}>Headline line 1</label><input value={form.h1a} onChange={(e) => set('h1a', e.target.value)} className={inputCls} /></div>
        <div><label className={miniLabel}>Headline line 2</label><input value={form.h1b} onChange={(e) => set('h1b', e.target.value)} className={inputCls} /></div>
        <div><label className={miniLabel}>Headline line 3 (accent)</label><input value={form.h1c} onChange={(e) => set('h1c', e.target.value)} className={inputCls} /></div>
      </div>
      <div><label className={miniLabel}>Subline</label><textarea rows={2} value={form.sub} onChange={(e) => set('sub', e.target.value)} className={inputCls} /></div>
      <div>
        <label className={miniLabel}>Featured place card (bottom-right)</label>
        <select value={form.featuredPlace} onChange={(e) => set('featuredPlace', e.target.value)} className={inputCls}>
          {places.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.region}</option>)}
        </select>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className={miniLabel + ' mb-0'}>Popular chips</label>
          <button onClick={() => set('popular', [...form.popular, { label: '', to: '' }])} className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#8a6224]">+ Add chip</button>
        </div>
        {form.popular.map((p, i) => (
          <div key={i} className="mb-2 flex items-center gap-2">
            <input value={p.label} onChange={(e) => set('popular', form.popular.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} placeholder="Label" className={inputCls} />
            <input value={p.to} onChange={(e) => set('popular', form.popular.map((x, j) => j === i ? { ...x, to: e.target.value } : x))} placeholder="/destinations/india" className={inputCls} />
            <button onClick={() => set('popular', form.popular.filter((_, j) => j !== i))} className="shrink-0 text-[#c05f4e]">✕</button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => save(form)} disabled={saving} className={saveBtn}>{saving ? 'Saving…' : 'Save hero content'}</button>
        {saved && <span className="text-[0.78rem] font-medium text-[#3e7d5a]">Saved — live on the homepage.</span>}
      </div>
    </div>
  );
}

/** Interests editor — label + icon per chip, add/remove. */
function InterestsEditor() {
  const { current, save, saving, saved } = useSectionContent<{ eyebrow: string; items: { label: string; icon: string }[] }>('home_interests');
  const defaultItems = [
    { label: 'History', icon: 'history' }, { label: 'Architecture', icon: 'architecture' }, { label: 'Art & Sculpture', icon: 'art' },
    { label: 'Food', icon: 'food' }, { label: 'Nature', icon: 'nature' }, { label: 'Religion', icon: 'religion' },
    { label: 'Fests & Culture', icon: 'fest' }, { label: 'Literature', icon: 'literature' }, { label: 'Archaeology', icon: 'archaeology' },
  ];
  const [eyebrow, setEyebrow] = useState('');
  const [items, setItems] = useState(defaultItems);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!loaded && current.items !== undefined) {
      setEyebrow(current.eyebrow ?? '');
      setItems(current.items ?? defaultItems);
      setLoaded(true);
    }
  }, [current, loaded]);
  const iconNames = ['history', 'architecture', 'art', 'food', 'nature', 'religion', 'fest', 'literature', 'archaeology', 'temple', 'fort', 'cave', 'city', 'sculpture', 'inscription', 'sacred', 'unesco'];
  const setItem = (i: number, k: 'label' | 'icon', v: string) => setItems(items.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <div className="space-y-5">
      <div><label className={miniLabel}>Eyebrow text</label><input value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} placeholder="Wander by interest" className={inputCls} /></div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className={miniLabel + ' mb-0'}>Chips (label + icon)</label>
          <button onClick={() => setItems([...items, { label: '', icon: 'history' }])} className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#8a6224]">+ Add</button>
        </div>
        {items.map((it, i) => (
          <div key={i} className="mb-2 flex items-center gap-2">
            <input value={it.label} onChange={(e) => setItem(i, 'label', e.target.value)} placeholder="Label" className={inputCls} />
            <select value={it.icon} onChange={(e) => setItem(i, 'icon', e.target.value)} className={inputCls + ' max-w-[160px]'}>
              {iconNames.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="shrink-0 text-[#c05f4e]">✕</button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => save({ eyebrow, items: items.filter((x) => x.label.trim()) })} disabled={saving} className={saveBtn}>{saving ? 'Saving…' : 'Save interests'}</button>
        {saved && <span className="text-[0.78rem] font-medium text-[#3e7d5a]">Saved — live on the homepage.</span>}
      </div>
    </div>
  );
}

/** Join band editor — background image, kicker, title, subline, CTA label. */
function JoinEditor() {
  const { current, save, saving, saved } = useSectionContent<{ img: string; kicker: string; title: string; sub: string; cta: string }>('home_join');
  const [form, setForm] = useState({ img: 'footer-herd.jpg', kicker: '', title: '', sub: '', cta: '' });
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!loaded && current.img !== undefined) {
      setForm((f) => ({ ...f, ...current }));
      setLoaded(true);
    }
  }, [current, loaded]);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="space-y-5">
      <div>
        <label className={miniLabel}>Background image</label>
        <ImagePickField value={form.img} onChange={(v) => set('img', v)} placeholder="footer-herd.jpg or /api/media/12" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className={miniLabel}>Kicker (small top line)</label><input value={form.kicker} onChange={(e) => set('kicker', e.target.value)} placeholder="Join Vazhi" className={inputCls} /></div>
        <div><label className={miniLabel}>Button label</label><input value={form.cta} onChange={(e) => set('cta', e.target.value)} placeholder="Contribute or donate" className={inputCls} /></div>
      </div>
      <div><label className={miniLabel}>Headline</label><input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Travel with us — and help map what remains" className={inputCls} /></div>
      <div><label className={miniLabel}>Subline</label><textarea rows={2} value={form.sub} onChange={(e) => set('sub', e.target.value)} placeholder="Share your knowledge of places, rituals and histories…" className={inputCls} /></div>
      <div className="flex items-center gap-3">
        <button onClick={() => save(form)} disabled={saving} className={saveBtn}>{saving ? 'Saving…' : 'Save join band'}</button>
        {saved && <span className="text-[0.78rem] font-medium text-[#3e7d5a]">Saved — live on the homepage.</span>}
      </div>
    </div>
  );
}

/** Homepage sections manager — toggle visibility, reorder blocks, edit section content. */
function SectionsPanel({
  sections, onToggle, onMove, error, C,
}: {
  sections: { id: string; page: string; label: string; blurb: string; visible: boolean; sort: number }[];
  onToggle: (id: string, visible: boolean) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  error?: string | null;
  C: Record<string, string>;
}) {
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const home = sections
    .filter((s) => s.page === 'home')
    .sort((a, b) => a.sort - b.sort)
    .map((s) => ({ ...s, visible: pending[s.id] ?? s.visible }));
  const toggle = (id: string, visible: boolean) => {
    setPending((p) => ({ ...p, [id]: visible }));
    onToggle(id, visible);
  };
  const toggleCls = (on: boolean) =>
    `relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${on ? 'bg-[#3e7d5a]' : 'bg-[#c9bda4]'}`;
  const EDITABLE = new Set(['home.hero', 'home.interests', 'home.join']);
  return (
    <div className="mt-7 max-w-[760px] space-y-4">
      <p className={`text-[0.85rem] leading-relaxed ${C.soft}`}>
        Click a section to edit its content, or toggle it on/off — hidden sections disappear from the live site instantly.
        Use the arrows to change their order. <span className={C.ink}>Hero</span> stays fixed at the top.
      </p>
      {error && (
        <p className="rounded-xl border border-[#c05f4e]/40 bg-[#c05f4e]/10 px-4 py-3 text-[0.8rem] text-[#c05f4e]">
          Couldn't save the change ({error}). Sign out and back in, then try again.
        </p>
      )}
      <div className={`rounded-2xl border ${C.border} bg-white`}>
        {home.map((s, i) => (
          <div key={s.id} className={i > 0 ? `border-t ${C.border}` : ''}>
            <div
              className={`flex items-center gap-4 px-5 py-4 ${EDITABLE.has(s.id) ? 'cursor-pointer transition-colors hover:bg-[#faf6ec]' : ''}`}
              onClick={() => EDITABLE.has(s.id) && setOpenId(openId === s.id ? null : s.id)}
            >
              <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onMove(s.id, -1)}
                  disabled={i <= 1}
                  className="text-[#a08b66] transition-colors hover:text-[#8a6224] disabled:opacity-25"
                  aria-label="Move up"
                >▲</button>
                <button
                  onClick={() => onMove(s.id, 1)}
                  disabled={i === home.length - 1 || i === 0}
                  className="text-[#a08b66] transition-colors hover:text-[#8a6224] disabled:opacity-25"
                  aria-label="Move down"
                >▼</button>
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-[0.92rem] font-medium ${s.visible ? 'text-[#2c2418]' : 'text-[#a08b66] line-through'}`}>
                  {s.label}
                  {EDITABLE.has(s.id) && <span className="ml-2 text-[0.62rem] uppercase tracking-[0.12em] text-[#b98a4a]">{openId === s.id ? 'Close editor ▴' : 'Edit ▾'}</span>}
                </p>
                <p className={`text-[0.72rem] ${C.muted}`}>{s.blurb}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.1em] ${s.visible ? 'bg-[#3e7d5a]/10 text-[#3e7d5a]' : 'bg-[#a08b66]/10 text-[#a08b66]'}`}>
                {s.visible ? 'Live' : 'Hidden'}
              </span>
              <button type="button" onClick={(e) => { e.stopPropagation(); toggle(s.id, !s.visible); }} className={toggleCls(s.visible)} aria-label={`Toggle ${s.label}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${s.visible ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
            {openId === s.id && (
              <div className={`border-t ${C.border} bg-[#faf6ec] px-5 py-6`}>
                {s.id === 'home.hero' && <HeroEditor />}
                {s.id === 'home.interests' && <InterestsEditor />}
                {s.id === 'home.join' && <JoinEditor />}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className={`text-[0.72rem] ${C.muted}`}>Ordering applies to the blocks between the Hero and the footer. Content edits go live immediately after saving.</p>
    </div>
  );
}

/** Newsletter manager — subscribers, weekly digest preview, manual send. */
function NewsletterPanel({
  subs, preview, onImport, importResult, importing, onRemove, onSendNow, sendResult, sendError, sending, C,
}: {
  subs: { id: number; email: string; name: string | null; active: boolean; createdAt: string | Date; sentCount: number }[];
  preview?: { empty: boolean; isFallback?: boolean; html?: string; subject?: string };
  onImport: (text: string) => void;
  importResult?: { added: number; skipped: number; invalid: number };
  importing: boolean;
  onRemove: (id: number) => void;
  onSendNow: () => void;
  sendResult?: { sent: number; failed: number; error?: string };
  sendError?: string;
  sending: boolean;
  C: Record<string, string>;
}) {
  const [bulk, setBulk] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const active = subs.filter((s) => s.active);
  return (
    <div className="mt-7 max-w-[860px] space-y-5">
      <p className={`text-[0.85rem] leading-relaxed ${C.soft}`}>
        The weekly letter goes out <span className={C.ink}>every Sunday</span>. If new places or stories were published during the week they're featured;
        otherwise a random story from the archive is sent — never one the reader has already received.
      </p>

      {/* digest preview + send */}
      <div className={`rounded-2xl border ${C.border} bg-white p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-[#2c2418]">This week's letter</h2>
            <p className={`mt-1 text-[0.78rem] ${C.muted}`}>
              {preview?.empty
                ? 'No active subscribers yet.'
                : preview?.isFallback
                  ? 'Nothing new this week — an archive pick goes to each reader.'
                  : 'Fresh content digest.'}
              {preview?.subject ? ` · Subject: “${preview.subject}”` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowPreview((v) => !v)}
              disabled={!preview || preview.empty}
              className={`rounded-full border ${C.border} px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#5d4f3a] transition-colors hover:bg-[#f1e8d4] disabled:opacity-50`}
            >
              {showPreview ? 'Hide preview' : 'Preview email'}
            </button>
            <button
              onClick={onSendNow}
              disabled={sending || !preview || preview.empty || active.length === 0}
              className="rounded-full bg-[#b98a4a] px-5 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white transition-transform hover:scale-[1.03] disabled:opacity-50"
            >
              {sending ? 'Sending…' : `Send now to ${active.length}`}
            </button>
          </div>
        </div>
        {sendResult && (
          <p className="mt-3 text-[0.8rem] text-[#3e7d5a]">
            Sent to {sendResult.sent} subscriber{sendResult.sent === 1 ? '' : 's'}
            {sendResult.failed > 0 ? ` · ${sendResult.failed} failed${sendResult.error ? ` (${sendResult.error})` : ''}` : ''}.
          </p>
        )}
        {sendError && <p className="mt-3 text-[0.8rem] text-[#c05f4e]">{sendError}</p>}
        {showPreview && preview?.html && (
          <iframe title="Newsletter preview" srcDoc={preview.html} className={`mt-5 h-[560px] w-full rounded-xl border ${C.border}`} />
        )}
      </div>

      {/* import */}
      <div className={`rounded-2xl border ${C.border} bg-white p-6`}>
        <h2 className="font-display text-xl text-[#2c2418]">Import subscribers</h2>
        <p className={`mt-1 text-[0.78rem] ${C.muted}`}>One email per line — optionally “email, name”. Duplicates are skipped automatically.</p>
        <textarea
          rows={5}
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          placeholder={'asha@example.com, Asha\nravi@example.com, Ravi'}
          className={`mt-4 w-full rounded-xl border ${C.border} bg-[#faf6ec] px-4 py-3 font-mono text-[0.8rem] text-[#2c2418] outline-none placeholder-[#b3a488]`}
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => { if (bulk.trim()) { onImport(bulk); setBulk(''); } }}
            disabled={importing || !bulk.trim()}
            className="rounded-full bg-[#2c2418] px-5 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#f7f2e8] transition-transform hover:scale-[1.03] disabled:opacity-50"
          >
            {importing ? 'Importing…' : 'Import'}
          </button>
          {importResult && (
            <p className="text-[0.8rem] text-[#3e7d5a]">
              {importResult.added} added · {importResult.skipped} already subscribed · {importResult.invalid} invalid
            </p>
          )}
        </div>
      </div>

      {/* list */}
      <div className={`rounded-2xl border ${C.border} bg-white`}>
        <div className={`flex items-center justify-between border-b ${C.border} px-6 py-4`}>
          <h2 className="font-display text-xl text-[#2c2418]">Subscribers</h2>
          <span className={`text-[0.72rem] ${C.muted}`}>{active.length} active · {subs.length - active.length} unsubscribed</span>
        </div>
        {subs.length === 0 && <p className="px-6 py-10 text-center text-sm text-[#a08b66]">No subscribers yet — import your list above, or readers can join from the footer form.</p>}
        <ul className="max-h-[420px] divide-y divide-[#e9dfc8] overflow-y-auto">
          {subs.map((s) => (
            <li key={s.id} className="flex items-center gap-4 px-6 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.86rem] text-[#2c2418]">{s.email}</p>
                <p className={`text-[0.68rem] ${C.muted}`}>
                  {s.name ? `${s.name} · ` : ''}{s.sentCount} letter{s.sentCount === 1 ? '' : 's'} sent · joined {fmtDate(new Date(s.createdAt))}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.1em] ${s.active ? 'bg-[#3e7d5a]/10 text-[#3e7d5a]' : 'bg-[#c05f4e]/10 text-[#c05f4e]'}`}>
                {s.active ? 'Active' : 'Unsubscribed'}
              </span>
              <button
                onClick={() => onRemove(s.id)}
                className="rounded-full border border-[#c05f4e]/40 px-3 py-1 text-[0.6rem] uppercase tracking-[0.12em] text-[#c05f4e] transition-colors hover:bg-[#c05f4e]/10"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function HelpDialog({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-5" onClick={onClose}>
      <div className={`w-full max-w-[460px] rounded-2xl border ${C.border} bg-white p-6 shadow-xl`} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-lg text-[#2c2418]">Shortcuts & writing tips</p>
          <button onClick={onClose} className="text-[#a08b66] hover:text-[#2c2418]">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[0.78rem]">
          {[
            ['Bold', 'Ctrl+B'], ['Italic', 'Ctrl+I'], ['Underline', 'Ctrl+U'],
            ['Strikethrough', 'Ctrl+Shift+S'], ['Insert link', 'Ctrl+K'], ['Save', 'Ctrl+S'],
            ['Code block', 'Ctrl+Alt+C'],
            ['Undo', 'Ctrl+Z'], ['Redo', 'Ctrl+Shift+Z'],
            ['Heading 2', '# + space'], ['Heading 3', '## + space'],
            ['Quote', '> + space'], ['Bullet list', '- + space'], ['Numbered list', '1. + space'],
          ].map(([label, keys]) => (
            <div key={label} className="flex items-center justify-between gap-2">
              <span className="text-[#7a6a50]">{label}</span>
              <kbd className="rounded border border-[#e3d5b8] bg-[#fdfaf3] px-1.5 py-0.5 text-[0.64rem] text-[#8a6224]">{keys}</kbd>
            </div>
          ))}
        </div>
        <p className="mt-4 border-t border-[#eee2ca] pt-3 text-[0.72rem] leading-relaxed text-[#a08b66]">
          Existing posts autosave a few seconds after you stop typing. Pasting from Google Docs or Word is cleaned automatically — headings, lists, links and basic formatting survive; everything else is stripped. The font menu also loads editorial typefaces on demand and accepts your own .woff2/.ttf uploads. Type / at the start of a line to insert structured blocks (timeline, fact box, gallery, place card, table, video…), and @ to mention a place as a linked chip.
        </p>
      </div>
    </div>
  );
}

/* Pre-publish checklist + search preview — the last step before a post goes live */
function PublishDialog({ form, busy, onConfirm, onClose }: { form: StoryForm; busy: boolean; onConfirm: () => void; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const checks: { ok: boolean; label: string }[] = [
    { ok: form.title.trim().length > 0, label: 'Title' },
    { ok: form.lede.trim().length > 0, label: 'Lede (intro paragraph)' },
    { ok: form.img.trim().length > 0, label: 'Cover image' },
    { ok: form.id.trim().length > 0, label: 'URL slug' },
    { ok: form.relatedPlaces.length > 0, label: 'Related places' },
    { ok: (form.seoDescription || form.lede).trim().length > 0, label: 'Search description' },
  ];
  const seoTitle = form.seoTitle || form.title;
  const seoDesc = form.seoDescription || form.lede;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-5" onClick={onClose}>
      <div className={`w-full max-w-[520px] rounded-2xl border ${C.border} bg-white p-6 shadow-xl`} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-lg text-[#2c2418]">Ready to publish?</p>
          <button onClick={onClose} className="text-[#a08b66] hover:text-[#2c2418]">✕</button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
          {checks.map((c) => (
            <p key={c.label} className={`flex items-center gap-2 text-[0.76rem] ${c.ok ? 'text-[#3e7d5a]' : 'text-[#c05f4e]'}`}>
              <span>{c.ok ? '✓' : '!'}</span> {c.label}
            </p>
          ))}
        </div>

        {/* how the post looks in search results */}
        <p className={`mb-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em] ${C.th}`}>Search preview</p>
        <div className="rounded-xl border border-[#eee2ca] bg-[#fdfaf3] px-4 py-3">
          <p className="text-[0.68rem] text-[#6b5b3e]">vazhi.world/stories/{form.id || '…'}</p>
          <p className="mt-0.5 truncate text-[0.95rem] font-medium text-[#1a0dab]">{seoTitle || 'Untitled'}</p>
          <p className="mt-0.5 line-clamp-2 text-[0.74rem] leading-snug text-[#4d5156]">{seoDesc || 'No description yet.'}</p>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button onClick={onClose} className="rounded-full border border-[#ddcdab] px-4 py-2 text-[0.72rem] font-medium text-[#7a6a50] transition-colors hover:border-[#b98a4a]">
            Keep editing
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="rounded-full bg-[#8a6224] px-5 py-2 text-[0.72rem] font-semibold text-white transition-colors hover:bg-[#75511c] disabled:opacity-50"
          >
            {busy ? 'Publishing…' : 'Publish now'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface VersionMeta { id: number; kind: string; title: string; lede: string; createdAt: string; size: number }

/* Version history — browse snapshots, preview one, restore it into the editor */
function HistoryDialog({ slug, onRestore, onClose }: { slug: string; onRestore: (v: { title: string; lede: string; body: string }) => void; onClose: () => void }) {
  const versionsQ = trpc.content.storyVersions.useQuery({ id: slug });
  const utils = trpc.useUtils();
  const [preview, setPreview] = useState<{ id: number; title: string; lede: string; body: string } | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const openPreview = async (id: number) => {
    if (preview?.id === id) { setPreview(null); return; }
    setLoadingId(id);
    try {
      const v = await utils.content.storyVersion.fetch({ id });
      if (v) setPreview({ id: v.id, title: v.title, lede: v.lede, body: v.body });
    } finally {
      setLoadingId(null);
    }
  };

  const versions = (versionsQ.data ?? []) as VersionMeta[];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-5" onClick={onClose}>
      <div className={`flex max-h-[85vh] w-full max-w-[720px] flex-col rounded-2xl border ${C.border} bg-white shadow-xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#eee2ca] px-6 py-4">
          <div>
            <p className="font-display text-lg text-[#2c2418]">Version history</p>
            <p className="text-[0.7rem] text-[#a08b66]">Snapshots are taken before each save and publish. Restoring loads the snapshot into the editor — nothing goes live until you save.</p>
          </div>
          <button onClick={onClose} className="text-[#a08b66] hover:text-[#2c2418]">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {versionsQ.isLoading && <p className="py-6 text-center text-[0.8rem] text-[#a08b66]">Loading versions…</p>}
          {!versionsQ.isLoading && versions.length === 0 && (
            <p className="py-6 text-center text-[0.8rem] text-[#a08b66]">No snapshots yet — they appear after the next save.</p>
          )}
          <ul className="space-y-1.5">
            {versions.map((v) => (
              <li key={v.id} className="rounded-xl border border-[#eee2ca]">
                <button
                  onClick={() => openPreview(v.id)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#fdfaf3]"
                >
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.14em] ${v.kind === 'publish' ? 'bg-[#e7f0e9] text-[#3e7d5a]' : 'bg-[#f4ecda] text-[#8a6224]'}`}>
                    {v.kind === 'publish' ? 'Publish' : 'Edit'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.82rem] font-medium text-[#2c2418]">{v.title}</span>
                    <span className="block text-[0.66rem] text-[#a08b66]">
                      {new Date(v.createdAt).toLocaleString()} · {(v.size / 1024).toFixed(1)} KB
                    </span>
                  </span>
                  <span className="shrink-0 text-[0.68rem] text-[#b98a4a]">{loadingId === v.id ? 'Loading…' : preview?.id === v.id ? 'Hide' : 'Preview'}</span>
                </button>
                {preview?.id === v.id && (
                  <div className="border-t border-[#eee2ca] px-4 py-3">
                    <p className="font-display text-[1.05rem] text-[#2c2418]">{preview.title}</p>
                    <p className="mt-0.5 text-[0.74rem] italic text-[#7a6a50]">{preview.lede}</p>
                    <div
                      className="rich mt-2 max-h-[38vh] overflow-y-auto rounded-lg border border-[#f0e5cd] bg-[#fdfaf3] p-3 text-[0.8rem]"
                      dangerouslySetInnerHTML={{ __html: preview.body }}
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => onRestore(preview)}
                        className="rounded-full bg-[#8a6224] px-4 py-2 text-[0.7rem] font-semibold text-white transition-colors hover:bg-[#75511c]"
                      >
                        Restore this version
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface Editing {
  section: Section;
  key: string | number | null; // null = creating new
  status: 'published' | 'draft' | 'trash';
}

export default function AdminPage() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [section, setSection] = useState<Section>('home');
  const [statusTab, setStatusTab] = useState<StatusFilter>('published');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Editing | null>(null);
  const [dirty, setDirty] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [heroInput, setHeroInput] = useState<string | null>(null);
  const [rail, setRail] = useState<React.ReactNode>(null);
  const [typoForm, setTypoForm] = useState<{ fontsUrl: string; bodyFont: string; displayFont: string } | null>(null);

  const utils = trpc.useUtils();

  // admin lists (include drafts)
  const storiesQ = trpc.content.adminStories.useQuery(undefined, { enabled: user?.role === 'admin' });
  const placesQ = trpc.content.adminPlaces.useQuery(undefined, { enabled: user?.role === 'admin' });
  const journeysQ = trpc.content.journeys.useQuery(undefined, { enabled: user?.role === 'admin' });
  const destsQ = trpc.content.destinations.useQuery(undefined, { enabled: user?.role === 'admin' });
  const heroQ = trpc.content.heroImg.useQuery(undefined, { enabled: user?.role === 'admin' });
  const typoQ = trpc.content.typography.useQuery(undefined, { enabled: user?.role === 'admin' });
  const contribsQ = trpc.content.contributions.useQuery(undefined, { enabled: user?.role === 'admin' });
  const subsQ = trpc.newsletter.subscribers.useQuery(undefined, { enabled: user?.role === 'admin' });
  const previewQ = trpc.newsletter.preview.useQuery(undefined, { enabled: user?.role === 'admin' });
  const importSubsM = trpc.newsletter.import.useMutation({ onSuccess: () => utils.newsletter.invalidate() });
  const removeSubM = trpc.newsletter.remove.useMutation({ onSuccess: () => utils.newsletter.invalidate() });
  const sendNowM = trpc.newsletter.sendNow.useMutation({ onSuccess: () => utils.newsletter.invalidate() });
  const sectionsQ = trpc.content.sections.useQuery(undefined, { enabled: user?.role === 'admin' });
  const updateSectionM = trpc.content.updateSection.useMutation({
    onSuccess: () => utils.content.sections.invalidate(),
  });
  const seriesQ = trpc.content.series.useQuery(undefined, { enabled: user?.role === 'admin' });

  const invalidate = () => utils.content.invalidate();
  const onOk = () => { invalidate(); setSavedFlash(true); setDirty(false); setErrMsg(null); };
  const onErr = (e: { message: string }) => setErrMsg(e.message);

  const upsertStory = trpc.content.upsertStory.useMutation({ onSuccess: onOk, onError: onErr });
  const upsertPlace = trpc.content.upsertPlace.useMutation({ onSuccess: onOk, onError: onErr });
  const upsertJourney = trpc.content.upsertJourney.useMutation({ onSuccess: onOk, onError: onErr });
  const upsertDest = trpc.content.upsertDestination.useMutation({ onSuccess: onOk, onError: onErr });
  const setStoryStatusM = trpc.content.setStoryStatus.useMutation({ onSuccess: onOk, onError: onErr });
  const setPlaceStatusM = trpc.content.setPlaceStatus.useMutation({ onSuccess: onOk, onError: onErr });
  const deleteJourneyM = trpc.content.deleteJourney.useMutation({ onSuccess: onOk, onError: onErr });
  const setHeroM = trpc.content.setHeroImg.useMutation({ onSuccess: onOk, onError: onErr });
  const deleteContribM = trpc.content.deleteContribution.useMutation({ onSuccess: onOk, onError: onErr });
  const setTypoM = trpc.content.setTypography.useMutation({ onSuccess: onOk, onError: onErr });
  const upsertSeriesM = trpc.content.upsertSeries.useMutation({ onSuccess: onOk, onError: onErr });
  const deleteSeriesM = trpc.content.deleteSeries.useMutation({ onSuccess: onOk, onError: onErr });

  const busy =
    upsertStory.isPending || upsertPlace.isPending || upsertJourney.isPending ||
    upsertDest.isPending || setStoryStatusM.isPending || setPlaceStatusM.isPending ||
    upsertSeriesM.isPending || setHeroM.isPending;

  // form states
  const [storyForm, setStoryFormS] = useState<StoryForm | null>(null);
  const [placeForm, setPlaceFormS] = useState<PlaceForm | null>(null);
  const [journeyForm, setJourneyFormS] = useState<JourneyForm | null>(null);
  const [destForm, setDestFormS] = useState<DestForm | null>(null);
  const [seriesForm, setSeriesFormS] = useState<SeriesForm | null>(null);

  // editor shell state (Phase 1: autosave, fullscreen, outline, help)
  const [saveState, setSaveState] = useState<'idle' | 'dirty' | 'saving' | 'saved' | 'failed'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [liveEditor, setLiveEditor] = useState<Editor | null>(null);
  const [editorEpoch, setEditorEpoch] = useState(0); // bump to remount the editor (version restore)
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storyFormRef = useRef<StoryForm | null>(null);
  storyFormRef.current = storyForm;
  const editingRef = useRef<Editing | null>(null);
  editingRef.current = editing;

  const wrapForm = <T,>(setter: (f: T | null) => void) => (f: T) => { setter(f); setDirty(true); setSavedFlash(false); setSaveState('dirty'); };
  const setStoryForm = wrapForm(setStoryFormS);
  const setPlaceForm = wrapForm(setPlaceFormS);
  const setJourneyForm = wrapForm(setJourneyFormS);
  const setDestForm = wrapForm(setDestFormS);
  const setSeriesForm = wrapForm(setSeriesFormS);

  /* ---------------------------------------------------- open / close */

  const openEditor = (ed: Editing) => {
    setEditing(ed); setDirty(false); setSavedFlash(false); setErrMsg(null); setMenuFor(null);
    if (ed.section === 'posts') {
      const s = ed.key === null ? null : storiesQ.data?.find((x) => x.id === ed.key);
      setStoryFormS(s
        ? { id: s.id, tag: s.tag, title: s.title, time: s.time, img: s.img, placeId: s.placeId ?? '', lede: s.lede, body: toHtml(s.body), seriesSlug: s.seriesSlug ?? '', relatedPlaces: s.relatedPlaces ?? [], contributors: s.contributors ?? [], seoTitle: s.seoTitle ?? '', seoDescription: s.seoDescription ?? '', seoKeywords: s.seoKeywords ?? '', taTitle: s.ta?.title ?? '', taTime: s.ta?.time ?? '', taLede: s.ta?.lede ?? '', taBody: s.ta ? toHtml(s.ta.body) : '' }
        : emptyStory());
    }
    if (ed.section === 'series') {
      const se = ed.key === null ? null : seriesQ.data?.find((x) => x.id === ed.key);
      setSeriesFormS(se
        ? { id: se.id, name: se.name, nameTa: se.nameTa ?? '', description: se.description ?? '', descTa: se.descTa ?? '', img: se.img }
        : emptySeries());
    }
    if (ed.section === 'places') {
      const p = ed.key === null ? null : placesQ.data?.find((x) => x.id === ed.key);
      setPlaceFormS(p
        ? { id: p.id, name: p.name, region: p.region, country: p.country, destId: p.destId, type: p.type, img: p.img, summary: p.summary, sections: p.sections.map((x) => ({ heading: x.heading, body: toHtml(x.body) })), facts: p.facts, related: p.related, address: p.address ?? '', lat: p.lat != null ? String(p.lat) : '', lng: p.lng != null ? String(p.lng) : '', contributors: p.contributors ?? [], taName: p.ta?.name ?? '', taRegion: p.ta?.region ?? '', taCountry: p.ta?.country ?? '', taSummary: p.ta?.summary ?? '', taSections: p.ta?.sections?.map((x) => ({ heading: x.heading, body: toHtml(x.body) })), taFacts: p.ta?.facts }
        : emptyPlace());
    }
    if (ed.section === 'journeys') {
      const j = ed.key === null ? null : journeysQ.data?.find((x) => x.id === ed.key);
      setJourneyFormS(j ? { id: j.id, title: j.title, meta: j.meta, map: j.map, note: j.note } : emptyJourney());
    }
    if (ed.section === 'destinations') {
      const d = ed.key === null ? null : destsQ.data?.find((x) => x.id === ed.key);
      setDestFormS(d
        ? { id: d.id, name: d.name, places: d.places, img: d.img, blurb: d.blurb, mapImg: d.mapImg ?? '', taName: d.taName ?? '', taPlacesLabel: d.taPlacesLabel ?? '', taBlurb: d.taBlurb ?? '' }
        : emptyDest());
    }
  };

  const closeEditor = () => {
    setEditing(null); setDirty(false); setSavedFlash(false); setErrMsg(null);
    setStoryFormS(null); setPlaceFormS(null); setJourneyFormS(null); setDestFormS(null); setSeriesFormS(null);
    setRail(null);
  };

  /* ---------------------------------------------------------- save */

  const slugOk = (v: string) => /^[a-z0-9-]+$/.test(v);

  const validate = (): string | null => {
    if (!editing) return null;
    if (editing.section === 'posts' && storyForm) {
      if (!slugOk(storyForm.id)) return 'URL slug is required — lowercase letters, numbers and dashes only.';
      if (editing.key === null && storiesQ.data?.some((s) => s.id === storyForm.id))
        return 'That slug already belongs to another post — pick a different one.';
      if (!storyForm.title.trim()) return 'Title is required.';
      if (!storyForm.img.trim()) return 'Image file is required (posts show as cards with thumbnails).';
      if (!storyForm.lede.trim()) return 'Lede is required.';
      if (!storyForm.body.replace(/<[^>]*>/g, '').trim()) return 'Body needs at least one paragraph.';
      if (storyForm.contributors.some((c) => !c.name.trim())) return 'Every contributor needs a name (or remove the empty one).';
    }
    if (editing.section === 'places' && placeForm) {
      if (!slugOk(placeForm.id)) return 'URL slug is required — lowercase letters, numbers and dashes only.';
      if (!placeForm.name.trim()) return 'Name is required.';
      if (!placeForm.region.trim()) return 'Region is required.';
      if (!placeForm.country.trim()) return 'Country is required.';
      if (!placeForm.img.trim()) return 'Image file is required.';
      if (!placeForm.summary.trim()) return 'Summary is required.';
      if (placeForm.lat.trim() && !Number.isFinite(Number(placeForm.lat))) return 'Latitude must be a number (e.g. 10.7827).';
      if (placeForm.lng.trim() && !Number.isFinite(Number(placeForm.lng))) return 'Longitude must be a number (e.g. 79.1316).';
      if (placeForm.contributors.some((c) => !c.name.trim())) return 'Every contributor needs a name (or remove the empty one).';
    }
    if (editing.section === 'journeys' && journeyForm) {
      if (!journeyForm.title.trim()) return 'Title is required.';
      if (!journeyForm.map.trim()) return 'Map image is required.';
    }
    if (editing.section === 'destinations' && destForm) {
      if (!slugOk(destForm.id)) return 'URL slug is required — lowercase letters, numbers and dashes only.';
      if (!destForm.name.trim()) return 'Name is required.';
      if (!destForm.img.trim()) return 'Card image is required.';
    }
    if (editing.section === 'series' && seriesForm) {
      if (!slugOk(seriesForm.id)) return 'URL slug is required — lowercase letters, numbers and dashes only.';
      if (editing.key === null && seriesQ.data?.some((x) => x.id === seriesForm.id))
        return 'That slug already belongs to another series — pick a different one.';
      if (!seriesForm.name.trim()) return 'Series name is required.';
      if (!seriesForm.img.trim()) return 'Card image is required (series show as cards with cover art).';
    }
    return null;
  };

  const save = (publish?: boolean) => {
    if (!editing) return;
    setErrMsg(null);
    const problem = validate();
    if (problem) {
      setErrMsg(problem);
      return;
    }
    const isNew = editing.key === null;
    if (editing.section === 'posts' && storyForm) {
      upsertStory.mutate(
        { ...storyForm, placeId: storyForm.placeId || null, seriesSlug: storyForm.seriesSlug || null, contributors: storyForm.contributors.filter((c) => c.name.trim()), ta: storyTaFromForm(storyForm), status: publish ? 'published' : isNew ? 'draft' : undefined, reason: publish ? 'publish' as const : 'manual' as const },
        {
          onSuccess: () => {
            // the record now exists — switch the editor to it so autosave engages
            if (isNew) setEditing({ ...editing, key: storyForm.id, status: publish ? 'published' : 'draft' });
            if (publish && !isNew) setStoryStatusM.mutate({ id: storyForm.id, status: 'published' });
            if (publish) setEditing((ed) => (ed ? { ...ed, status: 'published' } : ed));
          },
        },
      );
    }
    if (editing.section === 'places' && placeForm) {
      upsertPlace.mutate(
        {
          ...placeForm,
          address: placeForm.address.trim() || null,
          lat: placeForm.lat.trim() ? Number(placeForm.lat) : null,
          lng: placeForm.lng.trim() ? Number(placeForm.lng) : null,
          contributors: placeForm.contributors.filter((c) => c.name.trim()),
          ta: placeTaFromForm(placeForm),
          status: publish ? 'published' : isNew ? 'draft' : undefined,
        },
        {
          onSuccess: () => {
            if (isNew) setEditing({ ...editing, key: placeForm.id, status: publish ? 'published' : 'draft' });
            if (publish && !isNew) setPlaceStatusM.mutate({ id: placeForm.id, status: 'published' });
            if (publish) setEditing((ed) => (ed ? { ...ed, status: 'published' } : ed));
          },
        },
      );
    }
    if (editing.section === 'journeys' && journeyForm) upsertJourney.mutate(journeyForm);
    if (editing.section === 'series' && seriesForm) {
      upsertSeriesM.mutate(
        {
          id: seriesForm.id,
          name: seriesForm.name.trim(),
          nameTa: seriesForm.nameTa.trim() || null,
          description: seriesForm.description.trim() || null,
          descTa: seriesForm.descTa.trim() || null,
          img: seriesForm.img.trim(),
        },
        { onSuccess: () => { if (isNew) setEditing({ ...editing, key: seriesForm.id, status: 'published' }); } },
      );
    }
    if (editing.section === 'destinations' && destForm) {
      upsertDest.mutate(
        { ...destForm, mapImg: destForm.mapImg || null, taName: destForm.taName.trim() || null, taPlacesLabel: destForm.taPlacesLabel.trim() || null, taBlurb: destForm.taBlurb.trim() || null },
        { onSuccess: () => { if (isNew) setEditing({ ...editing, key: destForm.id, status: 'draft' }); } },
      );
    }
  };

  /* ---------------------------------------------- autosave (posts only) */

  const doAutosave = useCallback(() => {
    const ed = editingRef.current;
    const form = storyFormRef.current;
    if (!ed || ed.section !== 'posts' || !form || ed.key === null) return;
    if (validate()) return; // don't autosave invalid content
    setSaveState('saving');
    upsertStory.mutate(
      { ...form, placeId: form.placeId || null, seriesSlug: form.seriesSlug || null, contributors: form.contributors.filter((c) => c.name.trim()), ta: storyTaFromForm(form), reason: 'auto' as const },
      {
        onSuccess: () => {
          setSaveState('saved');
          setLastSavedAt(new Date());
          setDirty(false);
          setSavedFlash(true);
        },
        onError: () => setSaveState('failed'),
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scheduleAutosave = useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(doAutosave, 2500);
  }, [doAutosave]);

  // fire autosave shortly after the last edit on an existing post
  useEffect(() => {
    if (saveState !== 'dirty') return;
    if (editing?.section !== 'posts' || editing.key === null) return;
    scheduleAutosave();
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [saveState, storyForm, editing, scheduleAutosave]);

  // reset shell state when opening/closing records
  useEffect(() => {
    setSaveState('idle');
    setLastSavedAt(null);
    setFullscreen(false);
    setHelpOpen(false);
    setOutlineOpen(false);
    setLiveEditor(null);
  }, [editing?.section, editing?.key]);

  /* ------------------------------------------------- filtering */

  const query = search.trim().toLowerCase();

  const storyRows = useMemo(() => {
    const all = storiesQ.data ?? [];
    const filtered = all.filter((s) => (s.status ?? 'published') === statusTab);
    return query
      ? filtered.filter((s) => [s.title, s.tag, s.lede].join(' ').toLowerCase().includes(query))
      : filtered;
  }, [storiesQ.data, statusTab, query]);

  const storyCounts = useMemo(() => {
    const all = storiesQ.data ?? [];
    return {
      published: all.filter((s) => (s.status ?? 'published') === 'published').length,
      draft: all.filter((s) => s.status === 'draft').length,
      trash: all.filter((s) => s.status === 'trash').length,
    };
  }, [storiesQ.data]);

  const placeRows = useMemo(() => {
    const all = (placesQ.data ?? []).filter((p) => (p.status ?? 'published') === statusTab);
    return query
      ? all.filter((p) => [p.name, p.region, p.country].join(' ').toLowerCase().includes(query))
      : all;
  }, [placesQ.data, statusTab, query]);

  const placeCounts = useMemo(() => {
    const all = placesQ.data ?? [];
    return {
      published: all.filter((p) => (p.status ?? 'published') === 'published').length,
      draft: all.filter((p) => p.status === 'draft').length,
      trash: all.filter((p) => p.status === 'trash').length,
    };
  }, [placesQ.data]);

  const statusCounts = section === 'places' ? placeCounts : storyCounts;

  // close the row ⋯ menu on outside click
  useEffect(() => {
    if (!menuFor) return;
    const close = () => setMenuFor(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuFor]);

  /* ------------------------------------------------------------ gates */

  if (isLoading) {
    return (
      <div className="studio-root flex min-h-screen items-center justify-center bg-[#f7f2e8]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#b98a4a] border-t-transparent" />
      </div>
    );
  }
  if (!user) {
    navigate('/login');
    return null;
  }
  if (user.role !== 'admin') {
    return (
      <div className="studio-root flex min-h-screen items-center justify-center bg-[#f7f2e8] px-6">
        <div className={`max-w-md rounded-2xl border ${C.border} bg-white p-10 text-center`}>
          <h1 className="font-display text-3xl text-[#2c2418]">Editor access needed</h1>
          <p className="mt-4 text-sm leading-relaxed text-[#7a6a50]">
            You're signed in as <span className={C.ink}>{user.name ?? user.email ?? 'a traveller'}</span>,
            but this account doesn't have editor rights yet.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to="/" className="text-sm text-[#a6783c]">← Back to the site</Link>
            <button onClick={logout} className="text-sm text-[#7a6a50] underline">Sign out</button>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------- sidebar data */

  const contentItems: { id: Section; label: string; icon: (cls: string) => React.ReactNode; count?: number }[] = [
    { id: 'posts', label: 'Posts', icon: (cls) => ui.bookmark({ className: cls }), count: storiesQ.data?.filter((s) => s.status !== 'trash').length },
    { id: 'series', label: 'Series', icon: (cls) => ui.layers({ className: cls }), count: seriesQ.data?.length },
    { id: 'places', label: 'Places', icon: (cls) => ui.pin({ className: cls }), count: placesQ.data?.filter((p) => p.status !== 'trash').length },
    { id: 'journeys', label: 'Journeys', icon: (cls) => ui.globe({ className: cls }), count: journeysQ.data?.length },
    { id: 'destinations', label: 'Destinations', icon: (cls) => ui.arrowUpRight({ className: cls }), count: destsQ.data?.length },
  ];

  const goSection = (s: Section) => { setSection(s); setSearch(''); setStatusTab('published'); };

  const sideBtn = (active: boolean) =>
    `flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-[0.86rem] transition-colors ${
      active ? 'bg-[#b98a4a]/12 font-medium text-[#8a6224]' : 'text-[#5d4f3a] hover:bg-[#f1e8d4]'
    }`;

  /* ------------------------------------------------------ row menu */

  const RowMenu = ({ id, status, onEdit, onPreview, onStatus }: {
    id: string;
    status: 'published' | 'draft' | 'trash';
    onEdit: () => void;
    onPreview?: () => void;
    onStatus: (s: 'published' | 'draft' | 'trash') => void;
  }) => (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setMenuFor(menuFor === id ? null : id)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-[#a08b66] transition-colors hover:bg-[#f1e8d4] hover:text-[#8a6224]"
        aria-label="Row actions"
      >
        ⋯
      </button>
      {menuFor === id && (
        <div className={`absolute right-0 top-9 z-30 w-44 overflow-hidden rounded-xl border ${C.border} bg-white py-1.5 shadow-xl`}>
          <button onClick={() => { setMenuFor(null); onEdit(); }} className="block w-full px-4 py-2 text-left text-[0.82rem] text-[#2c2418] transition-colors hover:bg-[#f7f2e8]">Edit</button>
          {onPreview && <button onClick={() => { setMenuFor(null); onPreview(); }} className="block w-full px-4 py-2 text-left text-[0.82rem] text-[#2c2418] transition-colors hover:bg-[#f7f2e8]">Preview</button>}
          {status !== 'published' && <button onClick={() => { setMenuFor(null); onStatus('published'); }} className="block w-full px-4 py-2 text-left text-[0.82rem] text-[#3e7d5a] transition-colors hover:bg-[#f7f2e8]">Publish</button>}
          {status === 'published' && <button onClick={() => { setMenuFor(null); onStatus('draft'); }} className="block w-full px-4 py-2 text-left text-[0.82rem] text-[#2c2418] transition-colors hover:bg-[#f7f2e8]">Move to drafts</button>}
          {status !== 'trash'
            ? <button onClick={() => { setMenuFor(null); onStatus('trash'); }} className="block w-full px-4 py-2 text-left text-[0.82rem] text-[#c05f4e] transition-colors hover:bg-[#f7f2e8]">Move to trash</button>
            : <button onClick={() => { setMenuFor(null); onStatus('draft'); }} className="block w-full px-4 py-2 text-left text-[0.82rem] text-[#3e7d5a] transition-colors hover:bg-[#f7f2e8]">Restore from trash</button>}
        </div>
      )}
    </div>
  );

  /* shared bits */

  const ghostBtn =
    'whitespace-nowrap rounded-full border border-[#cfbd97] bg-white px-5 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#7a6a50] transition-colors hover:border-[#b98a4a] hover:text-[#8a6224] disabled:opacity-50';
  const primaryBtn =
    'rounded-full bg-[#b98a4a] px-6 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#a6783c] disabled:opacity-50';

  const statusTabs = (
    <div className={`mt-6 flex gap-7 border-b ${C.border}`}>
      {(['published', 'draft', 'trash'] as StatusFilter[]).map((st) => (
        <button
          key={st}
          onClick={() => setStatusTab(st)}
          className={`relative pb-3 text-[0.85rem] capitalize transition-colors ${
            statusTab === st ? 'font-medium text-[#8a6224]' : 'text-[#7a6a50] hover:text-[#2c2418]'
          }`}
        >
          {st === 'draft' ? 'Drafts' : st}
          <span className={`ml-2 rounded-full px-2 py-0.5 text-[0.68rem] ${
            statusTab === st ? 'bg-[#b98a4a]/12 text-[#8a6224]' : 'bg-[#efe6d0] text-[#a08b66]'
          }`}>{statusCounts[st]}</span>
          {statusTab === st && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#b98a4a]" />}
        </button>
      ))}
    </div>
  );

  const searchBar = (
    <div className="mt-5 flex items-center gap-3">
      <div className="relative w-full max-w-xs">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c4b291]">{ui.search({ className: 'h-3.5 w-3.5' })}</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className={`w-full rounded-full border ${C.border} bg-white py-2 pl-9 pr-4 text-sm text-[#2c2418] outline-none transition-colors placeholder:text-[#c4b291] focus:border-[#b98a4a]`}
        />
      </div>
    </div>
  );

  const tableCls = `mt-5 w-full overflow-hidden rounded-xl border ${C.border} bg-white`;
  const thCls = `px-5 py-3 text-left text-[0.62rem] font-semibold uppercase tracking-[0.18em] ${C.th}`;
  const tdCls = `px-5 py-3 align-middle`;
  const rowCls = `border-t ${C.borderSoft} transition-colors hover:bg-[#faf6ec]`;

  /* ========================================================= editor */

  if (editing) {
    const isNew = editing.key === null;
    const title =
      editing.section === 'posts' ? (storyForm?.title || 'Untitled post') :
      editing.section === 'places' ? (placeForm?.name || 'Untitled place') :
      editing.section === 'journeys' ? (journeyForm?.title || 'Untitled journey') :
      editing.section === 'series' ? (seriesForm?.name || 'Untitled series') :
      (destForm?.name || 'Untitled destination');
    const liveSlug = editing.section === 'posts' ? storyForm?.id : editing.section === 'places' ? placeForm?.id : undefined;
    const previewTo = editing.section === 'posts' ? `/stories/${liveSlug}` : editing.section === 'places' ? `/place/${liveSlug}` : '/';
    const canPreview = !isNew && (editing.section === 'posts' || editing.section === 'places');
    const currentStatus = editing.status;
    const supportsPublish = editing.section === 'posts' || editing.section === 'places';
    const isPost = editing.section === 'posts';
    const fs = isPost && fullscreen;

    /* save-state chip */
    const statusChip =
      saveState === 'saving' ? (
        <span className="hidden rounded-full bg-[#b07f3c]/12 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#b07f3c] sm:block">Saving…</span>
      ) : saveState === 'failed' ? (
        <button onClick={doAutosave} className="hidden items-center gap-1.5 rounded-full bg-[#c05f4e]/12 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#c05f4e] sm:flex">
          ⚠ Unable to save — Retry
        </button>
      ) : saveState === 'saved' || (savedFlash && !dirty) ? (
        <span className="hidden rounded-full bg-[#3e7d5a]/12 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#3e7d5a] sm:block">
          ✓ Saved{lastSavedAt ? ` ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
        </span>
      ) : dirty ? (
        <span className="hidden rounded-full bg-[#b07f3c]/12 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#b07f3c] sm:block">
          {isPost && !isNew ? 'Editing — autosaves' : 'Unpublished changes'}
        </span>
      ) : null;

    /* document outline from the live editor */
    const outline = liveEditor
      ? (() => {
          const items: { pos: number; level: number; text: string }[] = [];
          liveEditor.state.doc.descendants((node, pos) => {
            if (node.type.name === 'heading') items.push({ pos, level: node.attrs.level as number, text: node.textContent });
          });
          return items;
        })()
      : [];

    return (
      <div
        className="studio-root flex min-h-screen flex-col bg-[#f7f2e8] text-[#2c2418]"
        tabIndex={-1}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            save(false);
          }
          if (e.key === 'Escape' && fs) setFullscreen(false);
        }}
      >
        {/* editor top bar — Wix style */}
        <header className={`sticky top-0 z-40 border-b ${C.border} bg-[#f7f2e8]/95 backdrop-blur`}>
          <div className="flex items-center gap-4 px-5 py-3 md:px-8">
            <button onClick={closeEditor} className="flex items-center gap-1.5 text-sm text-[#7a6a50] transition-colors hover:text-[#8a6224]">
              <span className="inline-block rotate-180">{ui.arrow({ className: 'h-3.5 w-3.5' })}</span> Back
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg text-[#2c2418]">{isNew ? `New ${editing.section === 'posts' ? 'post' : editing.section === 'series' ? 'series' : editing.section.slice(0, -1)}` : title}</p>
            </div>
            {statusChip}
            {isPost && !fs && (
              <>
                <button
                  onClick={() => setOutlineOpen(!outlineOpen)}
                  title="Document outline"
                  className={`hidden rounded-full border px-3 py-2 text-[0.62rem] uppercase tracking-[0.14em] transition-colors lg:block ${outlineOpen ? 'border-[#8a6224] text-[#8a6224]' : 'border-[#ddcdab] text-[#7a6a50] hover:border-[#b98a4a]'}`}
                >
                  Outline
                </button>
                <button
                  onClick={() => setHelpOpen(true)}
                  title="Shortcuts & help"
                  className={`hidden rounded-full border px-3 py-2 text-[0.62rem] uppercase tracking-[0.14em] transition-colors lg:block ${'border-[#ddcdab] text-[#7a6a50] hover:border-[#b98a4a]'}`}
                >
                  ?
                </button>
                {editing.section === 'posts' && editing.key !== null && (
                  <button
                    onClick={() => setHistoryOpen(true)}
                    title="Version history"
                    className="hidden rounded-full border border-[#ddcdab] px-3 py-2 text-[0.62rem] uppercase tracking-[0.14em] text-[#7a6a50] transition-colors hover:border-[#b98a4a] lg:block"
                  >
                    History
                  </button>
                )}
              </>
            )}
            {isPost && (
              <button
                onClick={() => setFullscreen(!fullscreen)}
                title={fs ? 'Exit fullscreen (Esc)' : 'Distraction-free fullscreen'}
                className={`hidden rounded-full border px-3 py-2 text-[0.62rem] uppercase tracking-[0.14em] transition-colors lg:block ${fs ? 'border-[#8a6224] text-[#8a6224]' : 'border-[#ddcdab] text-[#7a6a50] hover:border-[#b98a4a]'}`}
              >
                {fs ? 'Exit ⤢' : 'Focus ⤢'}
              </button>
            )}
            <button onClick={() => save(false)} disabled={busy} className={ghostBtn}>
              {busy ? 'Saving…' : currentStatus === 'published' ? 'Save changes' : 'Save draft'}
            </button>
            {canPreview && !fs && (
              <a href={previewTo} target="_blank" rel="noreferrer" className={ghostBtn}>
                Preview
              </a>
            )}
            {supportsPublish && currentStatus !== 'published' && (
              <button
                onClick={() => (editing.section === 'posts' ? setPublishOpen(true) : save(true))}
                disabled={busy}
                className={primaryBtn}
              >
                Publish
              </button>
            )}
            {supportsPublish && currentStatus === 'published' && !fs && (
              <button
                onClick={() => {
                  if (editing.section === 'posts' && storyForm) setStoryStatusM.mutate({ id: storyForm.id, status: 'draft' });
                  if (editing.section === 'places' && placeForm) setPlaceStatusM.mutate({ id: placeForm.id, status: 'draft' });
                }}
                className={ghostBtn}
              >
                Unpublish
              </button>
            )}
          </div>
        </header>

        <div
          className="mx-auto flex w-full flex-1 items-start gap-8 px-5 py-8 md:px-8"
          style={fs ? { maxWidth: 900 } : { maxWidth: 1440 }}
        >
          {isPost && outlineOpen && !fs && (
            <aside className="sticky top-[76px] hidden max-h-[calc(100vh-100px)] w-[220px] shrink-0 overflow-y-auto lg:block" style={{ width: 220, flexShrink: 0 }}>
              <div className={`rounded-2xl border ${C.border} bg-white p-4`}>
                <p className={`mb-3 text-[0.6rem] font-semibold uppercase tracking-[0.2em] ${C.th}`}>Outline</p>
                {outline.length === 0 && <p className="text-[0.74rem] italic text-[#c4b291]">No headings yet — type # then space to add one.</p>}
                <ul className="space-y-1.5">
                  {outline.map((h, i) => (
                    <li key={i} style={{ paddingLeft: (h.level - 2) * 14 }}>
                      <button
                        type="button"
                        onClick={() => {
                          liveEditor?.chain().focus().setTextSelection(h.pos + 1).run();
                          const dom = liveEditor?.view.nodeDOM(h.pos) as HTMLElement | null;
                          dom?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className="w-full truncate text-left text-[0.76rem] text-[#7a6a50] transition-colors hover:text-[#8a6224]"
                      >
                        {h.text || 'Untitled heading'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
          <div className="min-w-0 flex-1" style={{ flex: '1 1 0%', minWidth: 0 }}>
            {errMsg && <p className="mb-5 rounded-lg border border-[#c05f4e]/40 bg-[#c05f4e]/8 px-4 py-3 text-sm text-[#c05f4e]">{errMsg}</p>}
            {editing.section === 'posts' && storyForm && <StoryEditor key={`${storyForm.id}:${editorEpoch}`} form={storyForm} setForm={setStoryForm} isNew={isNew} setRail={setRail} onEditor={setLiveEditor} existingSlugs={(storiesQ.data ?? []).map((s) => s.id)} />}
            {editing.section === 'places' && placeForm && <PlaceEditor form={placeForm} setForm={setPlaceForm} isNew={isNew} setRail={setRail} />}
            {editing.section === 'journeys' && journeyForm && <JourneyEditor form={journeyForm} setForm={setJourneyForm} />}
            {editing.section === 'series' && seriesForm && <SeriesEditor form={seriesForm} setForm={setSeriesForm} isNew={isNew} />}
            {editing.section === 'destinations' && destForm && <DestEditor form={destForm} setForm={setDestForm} isNew={isNew} />}
          </div>
          {rail && !fs && (
            <aside className="sticky top-[76px] hidden max-h-[calc(100vh-100px)] w-[300px] shrink-0 overflow-y-auto lg:block" style={{ width: 300, flexShrink: 0 }}>
              <div className={`rounded-2xl border ${C.border} bg-white p-5`}>
                <p className={`mb-4 text-[0.62rem] font-semibold uppercase tracking-[0.22em] ${C.th}`}>
                  {editing.section === 'posts' ? 'Post settings' : 'Place settings'}
                </p>
                {rail}
              </div>
            </aside>
          )}
        </div>

        {/* help / shortcuts dialog */}
        {helpOpen && <HelpDialog onClose={() => setHelpOpen(false)} />}

        {/* pre-publish checklist */}
        {publishOpen && storyForm && (
          <PublishDialog
            form={storyForm}
            busy={busy}
            onClose={() => setPublishOpen(false)}
            onConfirm={() => { setPublishOpen(false); save(true); }}
          />
        )}

        {/* version history */}
        {historyOpen && editing.section === 'posts' && storyForm && (
          <HistoryDialog
            slug={storyForm.id}
            onClose={() => setHistoryOpen(false)}
            onRestore={(v) => {
              // update the form, then remount the editor so it re-initializes
              // from the restored body (keeps DOM and document in lockstep)
              setStoryForm({ ...storyForm, title: v.title, lede: v.lede, body: v.body });
              setEditorEpoch((e) => e + 1);
              setHistoryOpen(false);
            }}
          />
        )}
      </div>
    );
  }

  /* ======================================================== dashboard */

  const sectionTitle: Record<Section, string> = {
    home: 'Home', posts: 'Posts', series: 'Series', places: 'Places', journeys: 'Journeys',
    destinations: 'Destinations', contributions: 'Contributions', newsletter: 'Newsletter', gallery: 'Gallery', sections: 'Sections', atlas: 'Atlas', settings: 'Settings',
  };
  const showStatusTabs = section === 'posts' || section === 'places';
  const canCreate = section === 'posts' || section === 'series' || section === 'places' || section === 'journeys' || section === 'destinations';
  const createLabel = section === 'posts' ? 'post' : section === 'series' ? 'series' : section.slice(0, -1);

  const homeCards: { id: Section; label: string; icon: (cls: string) => React.ReactNode; count?: number }[] = contentItems;

  return (
    <div className="studio-root flex min-h-screen bg-[#f7f2e8] text-[#2c2418]">
      {/* ------------------------------ left sidebar */}
      <aside className={`sticky top-0 flex h-screen w-[240px] shrink-0 flex-col border-r ${C.border} bg-[#faf5ea]`}>
        <Link to="/" className={`flex items-center gap-2.5 border-b ${C.borderSoft} px-6 py-5`}>
          <span className="font-display text-xl text-[#2c2418]">Vazhi</span>
          <span className="whitespace-nowrap rounded-full bg-[#b98a4a]/12 px-2.5 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[#8a6224]">Studio</span>
        </Link>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          <button onClick={() => goSection('home')} className={sideBtn(section === 'home')}>
            {ico.home('h-4 w-4')}
            <span className="flex-1 text-left">Home</span>
          </button>

          <p className={`px-3.5 pb-1.5 pt-5 text-[0.58rem] font-semibold uppercase tracking-[0.24em] ${C.faint}`}>Content</p>
          {contentItems.map((n) => (
            <button key={n.id} onClick={() => goSection(n.id)} className={sideBtn(section === n.id)}>
              {n.icon('h-4 w-4')}
              <span className="flex-1 text-left">{n.label}</span>
              {n.count !== undefined && <span className={`text-[0.68rem] ${C.faint}`}>{n.count}</span>}
            </button>
          ))}

          <p className={`px-3.5 pb-1.5 pt-5 text-[0.58rem] font-semibold uppercase tracking-[0.24em] ${C.faint}`}>Site</p>
          <button onClick={() => goSection('contributions')} className={sideBtn(section === 'contributions')}>
            {ui.mail({ className: 'h-4 w-4' })}
            <span className="flex-1 text-left">Contributions</span>
            {(contribsQ.data?.length ?? 0) > 0 && (
              <span className="rounded-full bg-[#b98a4a]/15 px-2 py-0.5 text-[0.68rem] text-[#8a6224]">{contribsQ.data?.length}</span>
            )}
          </button>
          <button onClick={() => goSection('newsletter')} className={sideBtn(section === 'newsletter')}>
            {ui.mail({ className: 'h-4 w-4' })}
            <span className="flex-1 text-left">Newsletter</span>
            {(subsQ.data?.filter((s) => s.active).length ?? 0) > 0 && (
              <span className="rounded-full bg-[#b98a4a]/15 px-2 py-0.5 text-[0.68rem] text-[#8a6224]">{subsQ.data?.filter((s) => s.active).length}</span>
            )}
          </button>
          <button onClick={() => goSection('gallery')} className={sideBtn(section === 'gallery')}>
            {ui.bookmark({ className: 'h-4 w-4' })}
            <span className="flex-1 text-left">Gallery</span>
          </button>
          <button onClick={() => goSection('atlas')} className={sideBtn(section === 'atlas')}>
            {ui.pin({ className: 'h-4 w-4' })}
            <span className="flex-1 text-left">Atlas</span>
          </button>
          <button onClick={() => goSection('sections')} className={sideBtn(section === 'sections')}>
            {ui.layers({ className: 'h-4 w-4' })}
            <span className="flex-1 text-left">Sections</span>
          </button>
          <button onClick={() => goSection('settings')} className={sideBtn(section === 'settings')}>
            {ico.gear('h-4 w-4')}
            <span className="flex-1 text-left">Settings</span>
          </button>
        </nav>
        <div className={`border-t ${C.border} px-5 py-4`}>
          <p className="truncate text-[0.8rem] text-[#2c2418]">{user.name ?? user.email}</p>
          <div className="mt-1.5 flex items-center gap-3">
            <Link to="/" className="text-[0.7rem] text-[#7a6a50] transition-colors hover:text-[#8a6224]">View site →</Link>
            <button onClick={logout} className="text-[0.7rem] text-[#a08b66] underline transition-colors hover:text-[#8a6224]">Sign out</button>
          </div>
        </div>
      </aside>

      {/* --------------------------------- main area */}
      <main className="min-w-0 flex-1 px-6 py-7 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-[1.9rem] text-[#2c2418]">{sectionTitle[section]}</h1>
          {canCreate && (
            <button
              onClick={() => openEditor({ section, key: null, status: 'draft' })}
              className="whitespace-nowrap rounded-full bg-[#b98a4a] px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#a6783c]"
            >
              + Create new {createLabel}
            </button>
          )}
        </div>

        {/* ------------------------------ home overview */}
        {section === 'home' && (
          <div className="mt-7 space-y-8">
            <div>
              <p className={`text-[0.66rem] font-semibold uppercase tracking-[0.22em] ${C.th}`}>Your content</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {homeCards.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => goSection(n.id)}
                    className={`rounded-2xl border ${C.border} bg-white p-5 text-left transition-shadow hover:shadow-md`}
                  >
                    <span className="text-[#b98a4a]">{n.icon('h-5 w-5')}</span>
                    <span className="mt-4 block font-display text-3xl text-[#2c2418]">{n.count ?? '—'}</span>
                    <span className={`mt-1 block text-[0.8rem] ${C.soft}`}>{n.label}</span>
                    <span className="mt-3 block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#a6783c]">Manage →</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className={`text-[0.66rem] font-semibold uppercase tracking-[0.22em] ${C.th}`}>Quick actions</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button onClick={() => openEditor({ section: 'posts', key: null, status: 'draft' })} className={primaryBtn}>+ New post</button>
                <button onClick={() => openEditor({ section: 'places', key: null, status: 'draft' })} className={ghostBtn}>+ New place</button>
                <button onClick={() => goSection('settings')} className={ghostBtn}>Change hero image</button>
                <Link to="/" className={ghostBtn}>View site →</Link>
              </div>
            </div>

            <div className={`rounded-2xl border ${C.border} bg-white p-6`}>
              <p className={`text-[0.66rem] font-semibold uppercase tracking-[0.22em] ${C.th}`}>How the studio works</p>
              <ul className={`mt-3 space-y-2 text-[0.86rem] leading-relaxed ${C.soft}`}>
                <li>· <span className={C.ink}>Save draft</span> keeps work hidden from the live site — publish only when ready.</li>
                <li>· The <span className={C.ink}>⋯ menu</span> on any row publishes, unpublishes or trashes an item instantly.</li>
                <li>· <span className={C.ink}>Trash</span> is recoverable — restore any time from the Trash tab.</li>
              </ul>
            </div>
          </div>
        )}

        {/* status tabs + search */}
        {showStatusTabs && statusTabs}
        {(section === 'posts' || section === 'places') && searchBar}

        {/* ------------------------------ posts table */}
        {section === 'posts' && (
          <div className={tableCls}>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#faf5ea]">
                  <th className={thCls}>Post</th>
                  <th className={`${thCls} w-[130px] max-lg:hidden`}>Published</th>
                  <th className={`${thCls} w-[120px] max-md:hidden`}>Category</th>
                  <th className={`${thCls} w-[110px]`}>Status</th>
                  <th className={`${thCls} w-[56px]`} />
                </tr>
              </thead>
              <tbody>
                {storyRows.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-[#a08b66]">
                    {statusTab === 'published' ? 'No published posts yet.' : statusTab === 'draft' ? 'No drafts.' : 'Trash is empty.'}
                  </td></tr>
                )}
                {storyRows.map((s) => {
                  const st = (s.status ?? 'published') as StatusFilter;
                  return (
                    <tr key={s.id} className={rowCls}>
                      <td className={tdCls}>
                        <button onClick={() => openEditor({ section: 'posts', key: s.id, status: st })} className="flex min-w-0 items-center gap-4 text-left">
                          <img src={IMG(s.img)} alt="" className={`h-11 w-16 shrink-0 rounded-md border ${C.border} object-cover`} />
                          <span className="min-w-0">
                            <span className="block truncate text-[0.92rem] font-medium text-[#2c2418]">{s.title}</span>
                            <span className={`block max-w-[420px] truncate text-[0.72rem] ${C.muted}`}>{s.lede}</span>
                          </span>
                        </button>
                      </td>
                      <td className={`${tdCls} text-[0.78rem] ${C.muted} max-lg:hidden`}>{fmtDate(s.publishedAt)}</td>
                      <td className={`${tdCls} max-md:hidden`}>
                        <span className="rounded-full bg-[#b98a4a]/10 px-2.5 py-1 text-[0.66rem] text-[#8a6224]">{s.tag}</span>
                      </td>
                      <td className={tdCls}>
                        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${statusPill(st)}`}>{st}</span>
                      </td>
                      <td className={`${tdCls} text-right`}>
                        <RowMenu
                          id={s.id}
                          status={st}
                          onEdit={() => openEditor({ section: 'posts', key: s.id, status: st })}
                          onPreview={() => window.open(`/stories/${s.id}`, '_blank')}
                          onStatus={(next) => setStoryStatusM.mutate({ id: s.id, status: next })}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ------------------------------ places table */}
        {section === 'places' && (
          <div className={tableCls}>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#faf5ea]">
                  <th className={thCls}>Place</th>
                  <th className={`${thCls} w-[160px] max-lg:hidden`}>Region</th>
                  <th className={`${thCls} w-[110px] max-md:hidden`}>Type</th>
                  <th className={`${thCls} w-[110px]`}>Status</th>
                  <th className={`${thCls} w-[56px]`} />
                </tr>
              </thead>
              <tbody>
                {placeRows.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-[#a08b66]">
                    {statusTab === 'published' ? 'No published places.' : statusTab === 'draft' ? 'No drafts.' : 'Trash is empty.'}
                  </td></tr>
                )}
                {placeRows.map((p) => {
                  const st = (p.status ?? 'published') as StatusFilter;
                  return (
                    <tr key={p.id} className={rowCls}>
                      <td className={tdCls}>
                        <button onClick={() => openEditor({ section: 'places', key: p.id, status: st })} className="flex min-w-0 items-center gap-4 text-left">
                          <img src={IMG(p.img)} alt="" className={`h-11 w-16 shrink-0 rounded-md border ${C.border} object-cover`} />
                          <span className="min-w-0">
                            <span className="block truncate text-[0.92rem] font-medium text-[#2c2418]">{p.name}</span>
                            <span className={`block truncate text-[0.72rem] ${C.muted}`}>{p.country}</span>
                          </span>
                        </button>
                      </td>
                      <td className={`${tdCls} truncate text-[0.78rem] ${C.muted} max-lg:hidden`}>{p.region}</td>
                      <td className={`${tdCls} max-md:hidden`}>
                        <span className="rounded-full bg-[#b98a4a]/10 px-2.5 py-1 text-[0.66rem] text-[#8a6224]">{p.type}</span>
                      </td>
                      <td className={tdCls}>
                        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${statusPill(st)}`}>{st}</span>
                      </td>
                      <td className={`${tdCls} text-right`}>
                        <RowMenu
                          id={p.id}
                          status={st}
                          onEdit={() => openEditor({ section: 'places', key: p.id, status: st })}
                          onPreview={() => window.open(`/place/${p.id}`, '_blank')}
                          onStatus={(next) => setPlaceStatusM.mutate({ id: p.id, status: next })}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ------------------------------ journeys table */}
        {section === 'journeys' && (
          <div className={tableCls}>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#faf5ea]">
                  <th className={thCls}>Journey</th>
                  <th className={`${thCls} w-[90px]`} />
                </tr>
              </thead>
              <tbody>
                {(journeysQ.data ?? []).length === 0 && (
                  <tr><td colSpan={2} className="px-5 py-12 text-center text-sm text-[#a08b66]">No journeys yet.</td></tr>
                )}
                {(journeysQ.data ?? []).map((j) => (
                  <tr key={j.id} className={rowCls}>
                    <td className={tdCls}>
                      <button onClick={() => openEditor({ section: 'journeys', key: j.id, status: 'published' })} className="flex min-w-0 items-center gap-4 text-left">
                        <img src={IMG(j.map)} alt="" className={`h-11 w-16 shrink-0 rounded-md border ${C.border} object-cover`} />
                        <span className="min-w-0">
                          <span className="block truncate text-[0.92rem] font-medium text-[#2c2418]">{j.title}</span>
                          <span className={`block truncate text-[0.72rem] ${C.muted}`}>{j.meta}</span>
                        </span>
                      </button>
                    </td>
                    <td className={`${tdCls} text-right`}>
                      <button
                        onClick={() => deleteJourneyM.mutate({ id: j.id })}
                        className="rounded-full border border-[#c05f4e]/40 px-3.5 py-1.5 text-[0.62rem] uppercase tracking-[0.12em] text-[#c05f4e] transition-colors hover:bg-[#c05f4e]/10"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ------------------------------ series table */}
        {section === 'series' && (
          <div className={tableCls}>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#faf5ea]">
                  <th className={thCls}>Series</th>
                  <th className={`${thCls} w-[110px]`}>Stories</th>
                  <th className={`${thCls} w-[170px]`} />
                </tr>
              </thead>
              <tbody>
                {(seriesQ.data ?? []).length === 0 && (
                  <tr><td colSpan={3} className="px-5 py-12 text-center text-sm text-[#a08b66]">No series yet — create one, then add stories to it from each post's settings rail.</td></tr>
                )}
                {(seriesQ.data ?? []).map((se) => (
                  <tr key={se.id} className={rowCls}>
                    <td className={tdCls}>
                      <button onClick={() => openEditor({ section: 'series', key: se.id, status: 'published' })} className="flex min-w-0 items-center gap-4 text-left">
                        {se.img
                          ? <img src={IMG(se.img)} alt="" className={`h-11 w-16 shrink-0 rounded-md border ${C.border} object-cover`} />
                          : <span className={`flex h-11 w-16 shrink-0 items-center justify-center rounded-md border ${C.border} bg-[#f1e8d4] text-[#a08b66]`}>{ui.layers({ className: 'h-4 w-4' })}</span>}
                        <span className="min-w-0">
                          <span className="block truncate text-[0.92rem] font-medium text-[#2c2418]">{se.name}</span>
                          <span className={`block max-w-[480px] truncate text-[0.72rem] ${C.muted}`}>{se.description || se.id}</span>
                        </span>
                      </button>
                    </td>
                    <td className={tdCls}>
                      <span className="rounded-full bg-[#b98a4a]/10 px-2.5 py-1 text-[0.66rem] text-[#8a6224]">{se.count} {se.count === 1 ? 'story' : 'stories'}</span>
                    </td>
                    <td className={`${tdCls} text-right`}>
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEditor({ section: 'series', key: se.id, status: 'published' })}
                          className="whitespace-nowrap text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#a6783c] transition-colors hover:text-[#8a6224]"
                        >
                          Edit →
                        </button>
                        <button
                          onClick={() => deleteSeriesM.mutate({ id: se.id })}
                          className="rounded-full border border-[#c05f4e]/40 px-3 py-1 text-[0.62rem] uppercase tracking-[0.12em] text-[#c05f4e] transition-colors hover:bg-[#c05f4e]/10"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ------------------------------ destinations table */}
        {section === 'destinations' && (
          <div className={tableCls}>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#faf5ea]">
                  <th className={thCls}>Destination</th>
                  <th className={`${thCls} w-[80px]`} />
                </tr>
              </thead>
              <tbody>
                {(destsQ.data ?? []).map((d) => (
                  <tr key={d.id} className={rowCls}>
                    <td className={tdCls}>
                      <button onClick={() => openEditor({ section: 'destinations', key: d.id, status: 'published' })} className="flex min-w-0 items-center gap-4 text-left">
                        <img src={IMG(d.img)} alt="" className={`h-11 w-16 shrink-0 rounded-md border ${C.border} object-cover`} />
                        <span className="min-w-0">
                          <span className="block truncate text-[0.92rem] font-medium text-[#2c2418]">{d.name}</span>
                          <span className={`block max-w-[480px] truncate text-[0.72rem] ${C.muted}`}>{d.places} · {d.blurb}</span>
                        </span>
                      </button>
                    </td>
                    <td className={`${tdCls} text-right`}>
                      <button
                        onClick={() => openEditor({ section: 'destinations', key: d.id, status: 'published' })}
                        className="whitespace-nowrap text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#a6783c] transition-colors hover:text-[#8a6224]"
                      >
                        Edit →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ------------------------------ contributions inbox */}
        {section === 'contributions' && (
          <div className="mt-7 max-w-[860px] space-y-4">
            <p className={`text-[0.85rem] leading-relaxed ${C.soft}`}>
              Notes from the <span className={C.ink}>Join Vazhi</span> band on the homepage — knowledge offers and donation interest from readers.
            </p>
            {(contribsQ.data ?? []).length === 0 && (
              <div className={`rounded-2xl border ${C.border} bg-white px-6 py-12 text-center text-sm text-[#a08b66]`}>
                No contributions yet.
              </div>
            )}
            {(contribsQ.data ?? []).map((c) => (
              <div key={c.id} className={`rounded-2xl border ${C.border} bg-white p-6`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#b98a4a]/12 font-display text-sm text-[#8a6224]">
                      {c.name.trim().slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-[0.92rem] font-medium text-[#2c2418]">{c.name}</p>
                      <p className={`text-[0.72rem] ${C.muted}`}>{c.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${
                      c.kind === 'donation' ? 'bg-[#3e7d5a]/10 text-[#3e7d5a]' : c.kind === 'both' ? 'bg-[#5a6ea8]/10 text-[#5a6ea8]' : 'bg-[#b98a4a]/10 text-[#8a6224]'
                    }`}>
                      {c.kind === 'donation' ? 'Donation' : c.kind === 'both' ? 'Knowledge + donation' : 'Knowledge'}
                    </span>
                    <span className={`text-[0.72rem] ${C.muted}`}>{fmtDate(new Date(c.createdAt))}</span>
                    <button
                      onClick={() => deleteContribM.mutate({ id: c.id })}
                      className="rounded-full border border-[#c05f4e]/40 px-3 py-1 text-[0.62rem] uppercase tracking-[0.12em] text-[#c05f4e] transition-colors hover:bg-[#c05f4e]/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-[0.86rem] leading-relaxed text-[#2c2418]">{c.message}</p>
                {c.link && (
                  <a href={c.link} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[0.78rem] text-[#8a6224] underline">
                    {c.link}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}


        {/* ------------------------------ newsletter */}
        {section === 'newsletter' && (
          <NewsletterPanel
            subs={subsQ.data ?? []}
            preview={previewQ.data}
            onImport={(text) => importSubsM.mutate({ text })}
            importResult={importSubsM.data}
            importing={importSubsM.isPending}
            onRemove={(id) => removeSubM.mutate({ id })}
            onSendNow={() => sendNowM.mutate()}
            sendResult={sendNowM.data}
            sendError={sendNowM.error?.message}
            sending={sendNowM.isPending}
            C={C}
          />
        )}

        {/* ------------------------------ gallery */}
        {section === 'gallery' && <GalleryPanel />}

        {/* ------------------------------ atlas */}
        {section === 'atlas' && (
          <AtlasPanel
            destinations={(destsQ.data ?? []).map((d) => ({ id: d.id, name: d.name, mapImg: d.mapImg ?? '' }))}
            places={(placesQ.data ?? []).filter((p) => p.status === 'published').map((p) => ({ id: p.id, name: p.name, destId: p.destId }))}
          />
        )}

        {/* ------------------------------ sections */}
        {section === 'sections' && (
          <SectionsPanel
            sections={sectionsQ.data ?? []}
            onToggle={(id, visible) => updateSectionM.mutate({ id, visible })}
            error={updateSectionM.error?.message ?? null}
            onMove={(id, dir) => {
              const list = (sectionsQ.data ?? []).filter((s) => s.page === 'home').sort((a, b) => a.sort - b.sort);
              const idx = list.findIndex((s) => s.id === id);
              const swapWith = list[idx + dir];
              if (!swapWith) return;
              const mine = list[idx];
              updateSectionM.mutate({ id: mine.id, sort: swapWith.sort });
              updateSectionM.mutate({ id: swapWith.id, sort: mine.sort });
            }}
            C={C}
          />
        )}

        {/* ------------------------------ settings */}
        {section === 'settings' && (
          <div className="mt-7 max-w-[720px] space-y-6">
            <NavConfigEditor />
            <div className={`rounded-2xl border ${C.border} bg-white p-6 md:p-8`}>
              <div className="flex items-center gap-3">
                <span className="text-[#b98a4a]">{ico.image('h-5 w-5')}</span>
                <h2 className="font-display text-xl text-[#2c2418]">Homepage hero image</h2>
              </div>
              <p className={`mt-2 text-[0.85rem] leading-relaxed ${C.soft}`}>
                The large photograph behind the homepage headline. Enter a file name from
                <span className={C.ink}> public/img/final</span> — the preview updates when you save.
              </p>
              <div className="mt-5 flex flex-wrap items-end gap-4">
                <div className="min-w-[260px] flex-1">
                  <Field label="Image file">
                    <TextInput
                      value={heroInput ?? heroQ.data ?? ''}
                      onChange={(e) => { setHeroInput(e.target.value); setSavedFlash(false); }}
                      placeholder="hero.jpg"
                    />
                  </Field>
                </div>
                <button
                  onClick={() => { const v = (heroInput ?? '').trim(); if (v) setHeroM.mutate({ img: v }); }}
                  disabled={busy || !heroInput?.trim()}
                  className={primaryBtn}
                >
                  {busy ? 'Saving…' : 'Save'}
                </button>
              </div>
              {(heroInput ?? heroQ.data) && (
                <img src={IMG(heroInput ?? heroQ.data ?? '')} alt="" className={`mt-5 h-44 w-full rounded-xl border ${C.border} object-cover`} />
              )}
              {savedFlash && <p className="mt-3 text-[0.78rem] font-medium text-[#3e7d5a]">Saved — the homepage now uses this image.</p>}
              {errMsg && <p className="mt-3 text-[0.78rem] font-medium text-[#c05f4e]">{errMsg}</p>}
            </div>

            <div className={`rounded-2xl border ${C.border} bg-white p-6 md:p-8`}>
              <div className="flex items-center gap-3">
                <span className="text-[#b98a4a]">{ui.bookmark({ className: 'h-5 w-5' })}</span>
                <h2 className="font-display text-xl text-[#2c2418]">Typography — your own fonts</h2>
              </div>
              <p className={`mt-2 text-[0.85rem] leading-relaxed ${C.soft}`}>
                Bring in any Google Font: open <span className={C.ink}>fonts.google.com</span>, pick a font, click
                <span className={C.ink}> Get font → Get embed code → @import</span> and paste the
                <span className={C.ink}> fonts.googleapis.com URL</span> below. It loads across the whole site — articles, pages and cards.
              </p>
              <div className="mt-5 space-y-5">
                <Field label="Google Fonts stylesheet URL">
                  <TextInput
                    value={typoForm?.fontsUrl ?? typoQ.data?.fontsUrl ?? ''}
                    onChange={(e) => { setTypoForm({ fontsUrl: e.target.value, bodyFont: typoForm?.bodyFont ?? typoQ.data?.bodyFont ?? '', displayFont: typoForm?.displayFont ?? typoQ.data?.displayFont ?? '' }); setSavedFlash(false); }}
                    placeholder="https://fonts.googleapis.com/css2?family=Kavivanar&display=swap"
                  />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Body font family (leave empty = Inter)">
                    <TextInput
                      value={typoForm?.bodyFont ?? typoQ.data?.bodyFont ?? ''}
                      onChange={(e) => { setTypoForm({ fontsUrl: typoForm?.fontsUrl ?? typoQ.data?.fontsUrl ?? '', bodyFont: e.target.value, displayFont: typoForm?.displayFont ?? typoQ.data?.displayFont ?? '' }); setSavedFlash(false); }}
                      placeholder="e.g. Kavivanar"
                    />
                  </Field>
                  <Field label="Display/headline font (leave empty = Cormorant)">
                    <TextInput
                      value={typoForm?.displayFont ?? typoQ.data?.displayFont ?? ''}
                      onChange={(e) => { setTypoForm({ fontsUrl: typoForm?.fontsUrl ?? typoQ.data?.fontsUrl ?? '', bodyFont: typoForm?.bodyFont ?? typoQ.data?.bodyFont ?? '', displayFont: e.target.value }); setSavedFlash(false); }}
                      placeholder="e.g. Anek Tamil"
                    />
                  </Field>
                </div>
                <button
                  onClick={() => {
                    const v = {
                      fontsUrl: (typoForm?.fontsUrl ?? typoQ.data?.fontsUrl ?? '').trim(),
                      bodyFont: (typoForm?.bodyFont ?? typoQ.data?.bodyFont ?? '').trim(),
                      displayFont: (typoForm?.displayFont ?? typoQ.data?.displayFont ?? '').trim(),
                    };
                    setTypoM.mutate(v);
                  }}
                  disabled={busy}
                  className={primaryBtn}
                >
                  {busy ? 'Saving…' : 'Save typography'}
                </button>
                {savedFlash && <p className="text-[0.78rem] font-medium text-[#3e7d5a]">Saved — refresh the site to see your fonts.</p>}
              </div>
            </div>

            <div className={`rounded-2xl border ${C.border} bg-white p-6 md:p-8`}>
              <div className="flex items-center gap-3">
                <span className="text-[#b98a4a]">{ui.user({ className: 'h-5 w-5' })}</span>
                <h2 className="font-display text-xl text-[#2c2418]">Account</h2>
              </div>
              <p className={`mt-3 text-[0.85rem] ${C.soft}`}>
                Signed in as <span className={C.ink}>{user.name ?? user.email}</span> — role: <span className={C.ink}>{user.role}</span>
              </p>
              <button onClick={logout} className={`mt-4 ${ghostBtn}`}>Sign out</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
