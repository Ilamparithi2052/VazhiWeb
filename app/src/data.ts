/** Resolves an image reference: media-library/absolute URLs pass through,
    bare filenames resolve to the bundled /img/final folder. */
export const IMG = (n: string) => (n.startsWith('/') || n.startsWith('http') ? n : `/img/final/${n}`);

export interface Destination {
  id: string;
  name: string;
  places: string;
  img: string;
  blurb: string;
}

export const destinations: Destination[] = [
  { id: 'india', name: 'India', places: '2,154 Places', img: 'dest-india.jpg', blurb: 'Temple towns, ghats and living rituals' },
  { id: 'japan', name: 'Japan', places: '487 Places', img: 'dest-japan.jpg', blurb: 'Pagodas, pilgrim trails and quiet seasons' },
  { id: 'turkey', name: 'Turkey', places: '358 Places', img: 'dest-turkey.jpg', blurb: 'Empires layered on one crossroads' },
  { id: 'armenia', name: 'Armenia', places: '152 Places', img: 'dest-armenia.jpg', blurb: 'Stone monasteries above deep gorges' },
  { id: 'srilanka', name: 'Sri Lanka', places: '312 Places', img: 'dest-srilanka.jpg', blurb: 'Fortresses, tea country and slow trains' },
  { id: 'europe', name: 'Europe', places: '1,025 Places', img: 'dest-europe.jpg', blurb: 'Canals, cathedrals and old squares' },
];

export interface Journey {
  title: string;
  meta: string;
  map: string;
  note: string;
}

export const journeys: Journey[] = [
  {
    title: 'Japan 2024',
    meta: '12 Days · 6 Cities · 42 Places',
    map: 'map-japan.png',
    note: 'Tokyo to Hiroshima along the old Tōkaidō — pagodas in autumn, one night in a temple lodging.',
  },
  {
    title: 'Turkey 2023',
    meta: '10 Days · 8 Cities · 31 Places',
    map: 'map-turkey.png',
    note: 'From the Bosphorus to Cappadocia, tracing Byzantium, the Seljuks and the Ottomans.',
  },
  {
    title: 'Armenia 2023',
    meta: '7 Days · 5 Cities · 18 Places',
    map: 'map-armenia.png',
    note: 'A loop from Yerevan through Sevan and Dilijan to the ropeway and silence of Tatev.',
  },
];

export interface Story {
  id: string;
  tag: string;
  title: string;
  time: string;
  img: string;
  seriesSlug?: string | null;
}

/** A named story series — groups several stories under one card. */
export interface Series {
  id: string;
  name: string;
  nameTa?: string | null;
  description?: string | null;
  descTa?: string | null;
  img: string;
  count: number;
}

export const stories: Story[] = [
  { id: 'sacred-geography-kaveri', tag: 'Essay', title: 'The Sacred Geography of the Kaveri', time: '5 min read', img: 'story-kaveri.jpg' },
  { id: 'night-in-konya', tag: 'Field Notes', title: 'A Night in Konya', time: '6 min read', img: 'story-konya.jpg' },
  { id: 'last-sculptor-mamallapuram', tag: 'History', title: 'The Last Sculptor of Mamallapuram', time: '7 min read', img: 'story-sculptor.jpg' },
  { id: 'kyoto-in-winter', tag: 'Photo Essay', title: 'Kyoto in Winter', time: '4 min read', img: 'story-kyoto.jpg' },
  { id: 'conversations-silk-route', tag: 'People', title: 'Conversations from the Silk Route', time: '6 min read', img: 'story-silkroute.jpg' },
];

export interface Place {
  id: string;
  name: string;
  region: string;
  type: 'Heritage' | 'City' | 'Nature';
  img: string;
}

export const recentlyAdded: Place[] = [
  { id: 'gudimallam', name: 'Gudimallam', region: 'Andhra Pradesh', type: 'Heritage', img: 'place-gudimallam.jpg' },
  { id: 'konya', name: 'Konya', region: 'Turkey', type: 'City', img: 'place-konya.jpg' },
  { id: 'fuji-five-lakes', name: 'Fuji Five Lakes', region: 'Japan', type: 'Nature', img: 'place-fuji.jpg' },
  { id: 'airavatesvara', name: 'Airavatesvara Temple', region: 'Tamil Nadu', type: 'Heritage', img: 'place-airavatesvara.jpg' },
  { id: 'yerevan', name: 'Yerevan', region: 'Armenia', type: 'City', img: 'place-yerevan.jpg' },
  { id: 'gangaikonda', name: 'Gangaikonda Cholapuram', region: 'Tamil Nadu', type: 'Heritage', img: 'place-gangaikonda.jpg' },
];

export interface MapMarker {
  count: number;
  lon: number;
  lat: number;
}

/** Marker positions as percentages over the equirectangular atlas map (lon −180…180, lat −58…84). */
const px = (lon: number) => ((lon + 180) / 360) * 100;
const py = (lat: number) => ((84 - lat) / 142) * 100;

export const atlasMarkers = [
  { count: 12, x: px(-102), y: py(39) },   // North America
  { count: 9, x: px(-61), y: py(-12) },    // South America
  { count: 28, x: px(14), y: py(49) },     // Europe
  { count: 18, x: px(21), y: py(7) },      // Africa
  { count: 46, x: px(86), y: py(33) },     // Asia
  { count: 7, x: px(134), y: py(-25) },    // Australia
] as const;

export const atlasFilters = [
  'All Places', 'Visited', 'Heritage', 'Nature', 'Cities', 'Temples', 'Culture', 'Stories',
] as const;

export const heritageKinds = [
  'Temples', 'Forts', 'Caves', 'Ancient Cities', 'Sculpture', 'Inscriptions', 'Sacred Places', 'UNESCO Sites',
] as const;

export const interests = [
  'History', 'Architecture', 'Art & Sculpture', 'Food', 'Nature', 'Religion', 'Fests & Culture', 'Literature', 'Archaeology',
] as const;
