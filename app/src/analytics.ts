/* Privacy-friendly analytics tracker. No cookies, no IP logging, no
   fingerprinting: we record the page path, a coarse country inferred from
   the visitor's timezone, and how long the page was actually viewed.
   Data goes to our own /api/beacon — nothing leaves to third parties. */

const TZ_TO_COUNTRY: Record<string, string> = {
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Asia/Colombo': 'LK', 'Asia/Tokyo': 'JP',
  'Asia/Shanghai': 'CN', 'Asia/Singapore': 'SG', 'Asia/Dubai': 'AE', 'Asia/Bangkok': 'TH',
  'Asia/Hong_Kong': 'HK', 'Asia/Seoul': 'KR', 'Asia/Jakarta': 'ID', 'Asia/Karachi': 'PK',
  'Asia/Dhaka': 'BD', 'Asia/Kathmandu': 'NP', 'Asia/Riyadh': 'SA', 'Asia/Tehran': 'IR',
  'Asia/Jerusalem': 'IL', 'Asia/Istanbul': 'TR', 'Asia/Yerevan': 'AM', 'Asia/Tbilisi': 'GE',
  'Asia/Kuala_Lumpur': 'MY', 'Asia/Manila': 'PH', 'Asia/Ho_Chi_Minh': 'VN', 'Asia/Yangon': 'MM',
  'Asia/Taipei': 'TW', 'Asia/Doha': 'QA', 'Asia/Kuwait': 'KW', 'Asia/Muscat': 'OM',
  'Europe/London': 'GB', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE', 'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT', 'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE', 'Europe/Zurich': 'CH',
  'Europe/Vienna': 'AT', 'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO', 'Europe/Copenhagen': 'DK',
  'Europe/Helsinki': 'FI', 'Europe/Dublin': 'IE', 'Europe/Lisbon': 'PT', 'Europe/Athens': 'GR',
  'Europe/Warsaw': 'PL', 'Europe/Prague': 'CZ', 'Europe/Budapest': 'HU', 'Europe/Moscow': 'RU',
  'Europe/Kyiv': 'UA', 'Europe/Bucharest': 'RO', 'Europe/Istanbul': 'TR',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
  'America/Los_Angeles': 'US', 'America/Anchorage': 'US', 'Pacific/Honolulu': 'US',
  'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Montreal': 'CA',
  'America/Mexico_City': 'MX', 'America/Sao_Paulo': 'BR', 'America/Argentina/Buenos_Aires': 'AR',
  'America/Santiago': 'CL', 'America/Bogota': 'CO', 'America/Lima': 'PE',
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Perth': 'AU',
  'Australia/Brisbane': 'AU', 'Pacific/Auckland': 'NZ', 'Pacific/Fiji': 'FJ',
  'Africa/Cairo': 'EG', 'Africa/Lagos': 'NG', 'Africa/Nairobi': 'KE',
  'Africa/Johannesburg': 'ZA', 'Africa/Casablanca': 'MA',
};

let country = '';
try {
  country = TZ_TO_COUNTRY[Intl.DateTimeFormat().resolvedOptions().timeZone] ?? '';
} catch { /* ignore */ }

let currentPath = '';
let startedAt = 0;
let visibleAt = 0;
let accumulated = 0;

function send(dwellSeconds: number) {
  if (!currentPath) return;
  const payload = JSON.stringify({ p: currentPath, c: country, d: Math.round(dwellSeconds) });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/beacon', new Blob([payload], { type: 'application/json' }));
    } else {
      fetch('/api/beacon', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true });
    }
  } catch { /* never break the site */ }
}

function flush() {
  if (!currentPath || !startedAt) return;
  let dwell = accumulated;
  if (visibleAt) dwell += (Date.now() - visibleAt) / 1000;
  send(dwell);
  accumulated = 0;
}

function onVisibility() {
  if (document.hidden) {
    if (visibleAt) accumulated += (Date.now() - visibleAt) / 1000;
    visibleAt = 0;
  } else {
    visibleAt = Date.now();
  }
}

/** Call once on app start, then on every route change with the new path. */
export function trackPageview(path: string) {
  if (path.startsWith('/admin')) { currentPath = ''; return; }
  if (path === currentPath) return; // StrictMode double-effect guard
  flush(); // close out the previous page
  currentPath = path;
  startedAt = Date.now();
  visibleAt = document.hidden ? 0 : Date.now();
}

export function initAnalytics() {
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', flush);
}
