import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { IMG } from '../data';
import { useContent } from '../content-provider';
import { useLang } from '../i18n';
import { placesTa } from '../content-ta';

/** Stylized destination map with clickable, labelled place markers. */
export default function MapPanel({ destId }: { destId: string }) {
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const { destMapImages, destMarkers, places } = useContent();
  const img = destMapImages[destId];
  const markers = destMarkers[destId] ?? [];
  const [loaded, setLoaded] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    setLoaded(false);
    setRetry(0);
  }, [img]);

  return (
    <div className="card-ring grain relative overflow-hidden rounded-2xl bg-[#0c171d]">
      {!loaded && (
        <div className="absolute inset-0 flex min-h-[280px] items-center justify-center">
          <span className="text-[0.66rem] uppercase tracking-[0.24em] text-muted2">{t('map.loading')}</span>
        </div>
      )}
      <div className={`relative transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <img
          key={`${img}-${retry}`}
          src={IMG(img)}
          alt={`Map of ${destId}`}
          loading="eager"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setTimeout(() => setRetry((n) => n + 1), 1200)}
          className="block h-auto w-full"
        />
        {markers.map((m) => {
          const base = places[m.id];
          if (!base) return null;
          const ta = lang === 'ta' ? placesTa[m.id] : undefined;
          const p = ta ? { ...base, name: ta.name, region: ta.region } : base;
          return (
            <button
              key={m.id}
              onClick={() => navigate(`/place/${m.id}`)}
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              aria-label={p.name}
            >
              <span className="marker-pulse block h-3.5 w-3.5 rounded-full bg-gold ring-2 ring-page transition-transform group-hover:scale-125" />
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-page/90 px-3 py-1.5 text-[0.68rem] font-medium text-parch opacity-0 ring-1 ring-bronze/30 backdrop-blur transition-all duration-200 group-hover:-translate-y-1 group-hover:opacity-100">
                {p.name}
                <span className="block text-[0.6rem] font-normal text-mutedw">{p.region}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between border-t border-bronze/15 bg-page/60 px-6 py-3.5">
        <p className="text-[0.66rem] uppercase tracking-[0.22em] text-mutedw">
          {t('map.footer', { n: markers.length })}
        </p>
        <span className="hidden items-center gap-2 text-[0.66rem] text-muted2 sm:flex">
          <span className="block h-2.5 w-2.5 rounded-full bg-gold" /> {t('map.legend')}
        </span>
      </div>
    </div>
  );
}
