/**
 * Raw seed content — plain data only, no React/DOM imports.
 * Auto-extracted from src/wiki.ts, src/data.ts, src/content-ta.ts (Tamil maps)
 * so that db/seed.ts can run under the server tsconfig without browser libs.
 * The frontend reads content from the database at runtime (see content-provider.tsx);
 * this module is used only by the seed script.
 */

/* ---------- from src/wiki.ts ---------- */
/** Wiki content: place articles, destination hierarchy (states → districts → places), story essays. */

export interface WikiSection {
  heading: string;
  body: string[];
}

export interface WikiFact {
  label: string;
  value: string;
}

export interface PlaceArticle {
  id: string;
  name: string;
  region: string;
  country: string;
  destId: string;
  type: 'Heritage' | 'City' | 'Nature';
  img: string;
  summary: string;
  sections: WikiSection[];
  facts: WikiFact[];
  related: string[];
}

export const places: Record<string, PlaceArticle> = {
  brihadisvara: {
    id: 'brihadisvara',
    name: 'Brihadisvara Temple',
    region: 'Thanjavur, Tamil Nadu',
    country: 'India',
    destId: 'india',
    type: 'Heritage',
    img: 'hero.jpg',
    summary:
      'The Brihadisvara Temple, called Rajarajesvaram by its builder, is a Chola-era Hindu temple dedicated to Shiva on the south bank of the Kaveri. Completed in 1010 CE, it is one of the largest temples in India and a defining monument of Dravidian architecture.',
    sections: [
      {
        heading: 'History',
        body: [
          'Rajaraja I (r. 985–1014 CE) built the temple at the height of Chola power, and the main deity was consecrated in 1010 CE — the twenty-fifth year of his reign. Inscriptions on its walls record gifts of gold, jewels, land and entire villages in remarkable administrative detail, making the temple as much a historical archive as a shrine.',
          'The temple survived wars, the fall of the Cholas, and centuries of weather almost intact. In 1987 it was inscribed on the UNESCO World Heritage List, and in 2004 its listing was extended as part of the "Great Living Chola Temples" — living because worship has continued here, unbroken, for over a thousand years.',
        ],
      },
      {
        heading: 'Architecture',
        body: [
          'The vimana (sanctum tower) rises about 66 metres in thirteen diminishing tiers, built entirely of interlocked granite without mortar. A single capstone estimated at around 80 tonnes crowns the tower — how it was raised remains one of the great engineering debates of the period.',
          'Inside the circumambulatory passages, some of the finest surviving Chola murals depict Shiva in his various forms. The great Nandi in front of the sanctum, carved from a single rock, is among the largest in India at nearly 16 feet long.',
        ],
      },
      {
        heading: 'Visiting',
        body: [
          'The temple sits at the heart of Thanjavur city and opens at dawn and again in the evening; the hour before sunset, when the granite turns the colour of burnt honey, is the one the photographers wait for. Non-Hindus may walk the courtyards and cloisters freely. Dress modestly; leather items are discouraged inside the prakaram.',
        ],
      },
    ],
    facts: [
      { label: 'Built', value: '1003–1010 CE' },
      { label: 'Builder', value: 'Rajaraja Chola I' },
      { label: 'Dynasty', value: 'Chola' },
      { label: 'Style', value: 'Dravidian' },
      { label: 'Deity', value: 'Shiva (Peruvudaiyar)' },
      { label: 'Vimana height', value: '≈ 66 m, 13 tiers' },
      { label: 'Material', value: 'Granite' },
      { label: 'UNESCO', value: 'World Heritage, 1987 / 2004' },
    ],
    related: ['gangaikonda', 'airavatesvara', 'srirangam'],
  },

  gangaikonda: {
    id: 'gangaikonda',
    name: 'Gangaikonda Cholapuram',
    region: 'Ariyalur district, Tamil Nadu',
    country: 'India',
    destId: 'india',
    type: 'Heritage',
    img: 'place-gangaikonda.jpg',
    summary:
      'Gangaikonda Cholapuram — "the city of the Chola who took the Ganga" — was founded by Rajendra I around 1035 CE to commemorate his victorious northern expedition, and its Brihadisvara temple is the second of the three Great Living Chola Temples.',
    sections: [
      {
        heading: 'History',
        body: [
          'After his armies reached the Ganges around 1023 CE, Rajendra I moved the Chola capital from Thanjavur to this new city and poured the spoils of empire into its temple. For roughly 250 years it served as the Chola seat of power.',
        ],
      },
      {
        heading: 'Architecture',
        body: [
          'The vimana, at about 55 metres, is deliberately shorter than his father\'s at Thanjavur — but more refined: its gentle concave curves give it a feminine grace that scholars read as a conscious stylistic answer to Rajaraja\'s masculine massiveness. The lion-well (simhakeni), the Chandikesvara shrine and the weathered Nandi complete the complex.',
        ],
      },
      {
        heading: 'Visiting',
        body: [
          'The temple lies about 70 km northeast of Thanjavur and receives a fraction of its crowds. Come in the late afternoon; the lawns and enclosure walls make it one of the most peaceful of the great Chola sites.',
        ],
      },
    ],
    facts: [
      { label: 'Built', value: 'c. 1035 CE' },
      { label: 'Builder', value: 'Rajendra Chola I' },
      { label: 'Dynasty', value: 'Chola' },
      { label: 'Style', value: 'Dravidian' },
      { label: 'Vimana height', value: '≈ 55 m' },
      { label: 'UNESCO', value: 'World Heritage, 2004' },
    ],
    related: ['brihadisvara', 'airavatesvara', 'srirangam'],
  },

  airavatesvara: {
    id: 'airavatesvara',
    name: 'Airavatesvara Temple',
    region: 'Darasuram, near Kumbakonam, Tamil Nadu',
    country: 'India',
    destId: 'india',
    type: 'Heritage',
    img: 'place-airavatesvara.jpg',
    summary:
      'The Airavatesvara Temple at Darasuram, built by Rajaraja II in the 12th century, is the smallest and most exquisitely carved of the three Great Living Chola Temples — a jewel-box of stone where the mandapa is shaped like a chariot drawn by horses.',
    sections: [
      {
        heading: 'History',
        body: [
          'Rajaraja II (r. 1146–1173 CE) built the temple at Darasuram, then a suburb of the Chola heartland. Its name remembers the legend of Airavata, Indra\'s white elephant, who worshipped Shiva here to be released from a curse.',
        ],
      },
      {
        heading: 'Architecture',
        body: [
          'The Rajagambhira mandapa in front is conceived as a celestial chariot, its wheels and horses carved in the round. The balustraded steps are the famous "musical steps" that are said to ring with the seven notes when struck. Pillars carry miniature panels — the 63 Nayanmar saints, dance karanas, everyday scenes — carved with a jeweller\'s patience.',
        ],
      },
      {
        heading: 'Visiting',
        body: [
          'Darasuram is 4 km from Kumbakonam and pairs naturally with a day among the temple towns of the Kaveri delta. The complex is compact; an unhurried hour covers it, but the carvings reward a second loop.',
        ],
      },
    ],
    facts: [
      { label: 'Built', value: '12th century CE' },
      { label: 'Builder', value: 'Rajaraja Chola II' },
      { label: 'Dynasty', value: 'Chola' },
      { label: 'Style', value: 'Dravidian' },
      { label: 'Known for', value: 'Chariot mandapa, musical steps' },
      { label: 'UNESCO', value: 'World Heritage, 2004' },
    ],
    related: ['brihadisvara', 'gangaikonda', 'srirangam'],
  },

  meenakshi: {
    id: 'meenakshi',
    name: 'Meenakshi Amman Temple',
    region: 'Madurai, Tamil Nadu',
    country: 'India',
    destId: 'india',
    type: 'Heritage',
    img: 'dest-india.jpg',
    summary:
      'The Meenakshi Amman Temple is the beating heart of Madurai — a sprawling walled city-within-a-city dedicated to the fish-eyed goddess Meenakshi and her consort Sundareswarar, famous for its towering, sculpture-encrusted gopurams.',
    sections: [
      {
        heading: 'History',
        body: [
          'Madurai\'s temple is ancient — the city itself grew around it — but most of what stands today was raised under the Nayak rulers of the 16th and 17th centuries, above all Tirumala Nayak. The complex covers some 14 acres with four entrances aligned to the cardinal directions.',
        ],
      },
      {
        heading: 'Architecture',
        body: [
          'Fourteen gopurams rise over the complex, the southern tower reaching nearly 52 metres, each encrusted with thousands of painted stucco figures of gods, demons and celestial beings. Inside, the Hall of a Thousand Pillars (Ayiram Kaal Mandapam) is a forest of sculpted granite columns, no two alike.',
        ],
      },
      {
        heading: 'Visiting',
        body: [
          'The evening ceremony, when Sundareswarar is carried in procession to Meenakshi\'s shrine for the night, is one of the great daily rituals of South India. Arrive before 9 pm for the closing procession. The temple stays busy from before dawn until late night.',
        ],
      },
    ],
    facts: [
      { label: 'Rebuilt', value: '16th–17th century (Nayak)' },
      { label: 'Deities', value: 'Meenakshi & Sundareswarar' },
      { label: 'Gopurams', value: '14 towers' },
      { label: 'Style', value: 'Dravidian' },
      { label: 'Complex area', value: '≈ 14 acres' },
    ],
    related: ['srirangam', 'brihadisvara', 'mamallapuram'],
  },

  mamallapuram: {
    id: 'mamallapuram',
    name: 'Mamallapuram',
    region: 'Chengalpattu district, Tamil Nadu',
    country: 'India',
    destId: 'india',
    type: 'Heritage',
    img: 'story-sculptor.jpg',
    summary:
      'Mamallapuram, the Pallava port-city on the Bay of Bengal, is where South Indian stone architecture was effectively invented in the 7th century — its Shore Temple, monolithic rathas and the great bas-relief are UNESCO World Heritage.',
    sections: [
      {
        heading: 'History',
        body: [
          'Under Narasimhavarman I "Mamalla" (r. 630–668 CE), from whom the town takes its name, Pallava craftsmen began cutting temples out of living rock — experiments that became the grammar of Dravidian architecture for the next thousand years. The town was also a busy port trading with Southeast Asia and Rome.',
        ],
      },
      {
        heading: 'Monuments',
        body: [
          'The Pancha Rathas are five shrines each carved from a single boulder, unfinished at the Pallavas\' fall. The Descent of the Ganges — an enormous open-air bas-relief across two cliffs — teems with gods, ascetics, elephants and a cat performing mock penance. The Shore Temple, built a generation later in dressed stone, has watched the surf for thirteen centuries.',
        ],
      },
      {
        heading: 'Visiting',
        body: [
          'The monuments cluster within walking distance of each other, about 60 km south of Chennai. Go early for the bas-relief, end the day at the Shore Temple for sunset — and listen for the tap of chisels: the sculptors\' quarter still works stone as it did in Pallava times.',
        ],
      },
    ],
    facts: [
      { label: 'Flourished', value: '7th–8th century CE' },
      { label: 'Dynasty', value: 'Pallava' },
      { label: 'Key works', value: 'Shore Temple, Pancha Rathas' },
      { label: 'UNESCO', value: 'World Heritage, 1984' },
      { label: 'Location', value: 'Bay of Bengal coast' },
    ],
    related: ['brihadisvara', 'meenakshi', 'gangaikonda'],
  },

  srirangam: {
    id: 'srirangam',
    name: 'Srirangam',
    region: 'Tiruchirappalli, Tamil Nadu',
    country: 'India',
    destId: 'india',
    type: 'Heritage',
    img: 'story-kaveri.jpg',
    summary:
      'Srirangam is a temple island in the Kaveri whose Sri Ranganathaswamy Temple is the largest functioning Hindu temple complex in the world — 156 acres of concentric enclosures that are, in effect, a walled sacred city.',
    sections: [
      {
        heading: 'History',
        body: [
          'The shrine of the reclining Ranganatha is among the oldest continuously worshipped in India, praised in the earliest Tamil Sangam literature. Enlarged over centuries by the Cholas, Pandyas, Hoysalas, Vijayanagara kings and the Madurai Nayaks, it survived a 14th-century sack and was rebuilt grander still.',
        ],
      },
      {
        heading: 'Architecture',
        body: [
          'Seven concentric prakarams wrap the sanctum; the outer enclosures contain streets, houses, shops and entire neighbourhoods. Twenty-one gopurams crown the gateways — the southern rajagopuram, completed in 1987, rises 73 metres, the second-tallest temple tower in Asia.',
        ],
      },
      {
        heading: 'Visiting',
        body: [
          'Cross the Kaveri from Tiruchirappalli at dawn and walk the seven enclosures inward as the town wakes around you. The Vaikuntha Ekadasi festival in December–January draws over a million pilgrims; ordinary mornings are the island\'s gift.',
        ],
      },
    ],
    facts: [
      { label: 'Deity', value: 'Ranganatha (reclining Vishnu)' },
      { label: 'Complex area', value: '≈ 156 acres' },
      { label: 'Enclosures', value: '7 prakarams' },
      { label: 'Gopurams', value: '21' },
      { label: 'Rajagopuram', value: '73 m, completed 1987' },
    ],
    related: ['brihadisvara', 'meenakshi', 'gangaikonda'],
  },

  gudimallam: {
    id: 'gudimallam',
    name: 'Gudimallam',
    region: 'Chittoor district, Andhra Pradesh',
    country: 'India',
    destId: 'india',
    type: 'Heritage',
    img: 'place-gudimallam.jpg',
    summary:
      'The Parasurameswara Temple at Gudimallam houses what many scholars consider the earliest known anthropomorphic Shiva linga — a standing figure carved on a pillar-like linga dated to around the 2nd–1st century BCE.',
    sections: [
      {
        heading: 'History',
        body: [
          'Though the present modest temple is later, the linga it shelters is ancient beyond almost any other Shiva image: a two-armed figure standing on a yaksha-like crouching form, carved in deep relief on the shaft. It shows the moment when the aniconic pillar and the human-shaped god were still one idea.',
        ],
      },
      {
        heading: 'Significance',
        body: [
          'For students of religion, Gudimallam is a hinge-point: here the linga — abstract emblem of Shiva — carries the god\'s earliest known body. Later Bactrian, Kushana and Gupta comparisons only underline how early and how singular the image is. Worship has continued around it for over two thousand years.',
        ],
      },
      {
        heading: 'Visiting',
        body: [
          'The temple lies in a quiet village about 20 km from Tirupati, open morning and evening. It is small — the visit takes minutes — but standing before an image older than most of the world\'s religions is not a small experience.',
        ],
      },
    ],
    facts: [
      { label: 'Linga dated', value: 'c. 2nd–1st century BCE' },
      { label: 'Deity', value: 'Shiva (Parasurameswara)' },
      { label: 'Significance', value: 'Earliest anthropomorphic Shiva linga' },
      { label: 'Location', value: 'Near Tirupati' },
    ],
    related: ['brihadisvara', 'mamallapuram', 'srirangam'],
  },

  kyoto: {
    id: 'kyoto',
    name: 'Kyoto',
    region: 'Kansai',
    country: 'Japan',
    destId: 'japan',
    type: 'City',
    img: 'story-kyoto.jpg',
    summary:
      'Japan\'s imperial capital for over a thousand years, Kyoto holds some 1,600 Buddhist temples and 400 Shinto shrines — and in winter, when snow settles on the Yasaka pagoda, the old city returns to something like its twelfth century.',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Founded as Heian-kyō in 794, Kyoto was spared the bombing of the Pacific War and preserves the densest concentration of cultural treasures in Japan: Kinkaku-ji and Ginkaku-ji, the Zen gardens of Ryōan-ji and Daitoku-ji, the thousand torii of Fushimi Inari, and the preserved lanes of Higashiyama and Gion.',
          'Visit district by district, on foot, in the early morning. Winter strips the crowds and the colour, leaving rooflines, incense and silence.',
        ],
      },
    ],
    facts: [
      { label: 'Founded', value: '794 CE (Heian-kyō)' },
      { label: 'Known for', value: 'Temples, shrines, geisha districts' },
      { label: 'UNESCO', value: '17 component sites, 1994' },
    ],
    related: ['konya', 'brihadisvara', 'tatev'],
  },

  konya: {
    id: 'konya',
    name: 'Konya',
    region: 'Central Anatolia',
    country: 'Turkey',
    destId: 'turkey',
    type: 'City',
    img: 'story-konya.jpg',
    summary:
      'Capital of the Seljuk Sultanate of Rum and home of the poet-mystic Rumi, Konya is Turkey\'s most spiritual city — its green-tiled Mevlana Museum the destination of a pilgrimage that has never quite stopped.',
    sections: [
      {
        heading: 'Overview',
        body: [
          'As Iconium and then capital of the Seljuks, Konya gathered the finest stonework of 12th–13th century Anatolia: the Alaeddin Mosque, the Karatay and İnce Minare madrasas with their forests of carved portals.',
          'After the Mongol upheavals, the city became the home of Jalal al-Din Rumi and the Mevlevi order he inspired. His mausoleum, with its fluted turquoise dome, now houses the Mevlana Museum. In December the Şeb-i Arus ceremonies fill the city with the turning of the whirling dervishes.',
        ],
      },
    ],
    facts: [
      { label: 'Era', value: 'Seljuk capital, 12th–13th c.' },
      { label: 'Known for', value: 'Mevlana Museum, whirling dervishes' },
      { label: 'Region', value: 'Central Anatolia' },
    ],
    related: ['kyoto', 'brihadisvara', 'tatev'],
  },

  tatev: {
    id: 'tatev',
    name: 'Tatev Monastery',
    region: 'Syunik Province',
    country: 'Armenia',
    destId: 'armenia',
    type: 'Heritage',
    img: 'dest-armenia.jpg',
    summary:
      'Perched on a basalt shelf above the 500-metre Vorotan gorge, the 9th-century Tatev Monastery was medieval Armenia\'s greatest university — reached today by the Wings of Tatev, the world\'s longest reversible aerial tramway.',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Founded in 895, Tatev housed a university, scriptorium and fortress-treasury at the edge of the Vorotan canyon. Its Cathedral of Saints Peter and Paul, the Church of Saint Gregory, and the strange swaying Gavazan pillar survive in striking completeness.',
          'The 5.7 km ropeway from Halidzor drops you at the walls in twelve minutes; arriving by the old road, watching the monastery appear and vanish in the folds of the gorge, is slower and better.',
        ],
      },
    ],
    facts: [
      { label: 'Founded', value: '895 CE' },
      { label: 'Access', value: 'Wings of Tatev tramway, 5.7 km' },
      { label: 'Setting', value: 'Vorotan gorge, Syunik' },
    ],
    related: ['kyoto', 'brihadisvara', 'sigiriya'],
  },

  sigiriya: {
    id: 'sigiriya',
    name: 'Sigiriya',
    region: 'Central Province',
    country: 'Sri Lanka',
    destId: 'srilanka',
    type: 'Heritage',
    img: 'dest-srilanka.jpg',
    summary:
      'The Lion Rock of Sigiriya — a 200-metre column of granite crowned by the palace of King Kashyapa — is Sri Lanka\'s most dramatic site: moats, water gardens, cloud-maiden frescoes and a staircase that once entered through a lion\'s mouth.',
    sections: [
      {
        heading: 'Overview',
        body: [
          'In the late 5th century CE, Kashyapa I moved his capital to this rock and ringed it with some of the oldest landscaped gardens in the world. Halfway up, a sheltered pocket holds the famous frescoes of the Sigiriya maidens; the Mirror Wall beside them preserves visitors\' graffiti from the 8th to 10th centuries.',
          'Climb at opening time to beat both heat and crowds — the summit palace ruins and the 360-degree jungle horizon are the reward.',
        ],
      },
    ],
    facts: [
      { label: 'Built', value: '5th century CE' },
      { label: 'Builder', value: 'King Kashyapa I' },
      { label: 'UNESCO', value: 'World Heritage, 1982' },
    ],
    related: ['tatev', 'brihadisvara', 'kyoto'],
  },

  bruges: {
    id: 'bruges',
    name: 'Bruges',
    region: 'West Flanders',
    country: 'Belgium',
    destId: 'europe',
    type: 'City',
    img: 'dest-europe.jpg',
    summary:
      'The best-preserved medieval city in Europe: Bruges turned its back on modernity when its river silted up in the 15th century, and the canals, belfry and stepped gables have kept its Gothic face almost photographically intact.',
    sections: [
      {
        heading: 'Overview',
        body: [
          'As the northern hub of medieval trade, Bruges grew rich on wool and banking — the Bourse may be the world\'s first stock exchange. When the Zwin channel silted, the city slept for four centuries, which is precisely why its street pattern, brick Gothic houses and canal ring survive.',
          'See it at blue hour from the Rozenhoedkaai, climb the 83-metre Belfry, then lose the crowds in the beguinage and the streets east of the canal ring.',
        ],
      },
    ],
    facts: [
      { label: 'Golden age', value: '12th–15th century' },
      { label: 'Known for', value: 'Canals, Belfry, Gothic brickwork' },
      { label: 'UNESCO', value: 'Historic centre, 2000' },
    ],
    related: ['kyoto', 'konya', 'brihadisvara'],
  },
};

/** Concise stubs for map-only places. */
const stubs: [string, string, string, string, string, string, PlaceArticle['type']][] = [
  ['nara', 'Nara', 'Kansai', 'Japan', 'japan', 'dest-japan.jpg', 'Heritage'],
  ['tokyo', 'Tokyo', 'Kantō', 'Japan', 'japan', 'dest-japan.jpg', 'City'],
  ['fuji-five-lakes', 'Fuji Five Lakes', 'Yamanashi', 'Japan', 'japan', 'place-fuji.jpg', 'Nature'],
  ['hiroshima', 'Hiroshima', 'Chūgoku', 'Japan', 'japan', 'dest-japan.jpg', 'City'],
  ['istanbul', 'Istanbul', 'Marmara', 'Turkey', 'turkey', 'dest-turkey.jpg', 'City'],
  ['cappadocia', 'Cappadocia', 'Central Anatolia', 'Turkey', 'turkey', 'dest-turkey.jpg', 'Nature'],
  ['ephesus', 'Ephesus', 'Aegean', 'Turkey', 'turkey', 'dest-turkey.jpg', 'Heritage'],
  ['yerevan', 'Yerevan', 'Ararat plain', 'Armenia', 'armenia', 'place-yerevan.jpg', 'City'],
  ['sevan', 'Lake Sevan', 'Gegharkunik', 'Armenia', 'armenia', 'dest-armenia.jpg', 'Nature'],
  ['dilijan', 'Dilijan', 'Tavush', 'Armenia', 'armenia', 'dest-armenia.jpg', 'Nature'],
  ['kandy', 'Kandy', 'Central Province', 'Sri Lanka', 'srilanka', 'dest-srilanka.jpg', 'City'],
  ['anuradhapura', 'Anuradhapura', 'North Central', 'Sri Lanka', 'srilanka', 'dest-srilanka.jpg', 'Heritage'],
  ['ella', 'Ella', 'Uva Province', 'Sri Lanka', 'srilanka', 'dest-srilanka.jpg', 'Nature'],
  ['rome', 'Rome', 'Lazio', 'Italy', 'europe', 'dest-europe.jpg', 'City'],
  ['prague', 'Prague', 'Bohemia', 'Czechia', 'europe', 'dest-europe.jpg', 'City'],
  ['granada', 'Granada', 'Andalusia', 'Spain', 'europe', 'dest-europe.jpg', 'City'],
  ['athens', 'Athens', 'Attica', 'Greece', 'europe', 'dest-europe.jpg', 'City'],
];

const stubText: Record<string, string> = {
  nara: 'Japan\'s first permanent capital (710–784), where Tōdai-ji\'s Great Buddha Hall — among the largest wooden buildings on earth — shelters a 15-metre bronze Buddha, and sacred deer roam the park between the shrines.',
  tokyo: 'From the incense of Sensō-ji in Asakusa to the forested calm of Meiji Shrine, Tokyo folds a 400-year pilgrimage city inside the world\'s largest metropolis.',
  'fuji-five-lakes': 'The five lakes at the northern foot of Mount Fuji — Kawaguchi, Yamanaka, Sai, Shōji and Motosu — hold the classic mirror views of the sacred mountain, best at dawn before the wind rises.',
  hiroshima: 'A city rebuilt as a monument to peace: the A-Bomb Dome, the Peace Memorial Park and Museum, and the island shrine of Itsukushima an hour down the bay.',
  istanbul: 'Constantinople for sixteen centuries: Hagia Sophia, the Blue Mosque, Topkapı Palace and the Grand Bazaar layered where Europe meets Asia across the Bosphorus.',
  cappadocia: 'A volcanic moonscape of fairy chimneys honeycombed with Byzantine cave churches, and at dawn a sky full of balloons drifting over Göreme.',
  ephesus: 'The most complete Greco-Roman city in the Mediterranean: the Library of Celsus, the 25,000-seat theatre, and marble streets walked by emperors and apostles.',
  yerevan: 'One of the world\'s oldest continuously inhabited cities (782 BCE), built of rose volcanic tuff, with Mount Ararat filling the horizon from the Cascade\'s terraces.',
  sevan: 'The blue eye of Armenia — a vast high-altitude lake whose peninsula monastery, Sevanavank, has watched the water since 874 CE.',
  dilijan: 'Forested spa town in the "Armenian Switzerland", gateway to the medieval monasteries of Haghartsin and Goshavank hidden in the beech woods.',
  kandy: 'The last royal capital of Sri Lanka, wrapped around a lake, guarding the Temple of the Sacred Tooth Relic — the island\'s holiest shrine.',
  anuradhapura: 'Capital of Sri Lanka for 1,300 years: colossal brick dagabas, the sacred Bodhi tree grown from the original at Bodh Gaya, and monastic ruins in the jungle.',
  ella: 'A hill-country village above the tea estates, where the Nine Arches Bridge carries blue trains through the mist to Demodara.',
  rome: 'Twenty-eight centuries in one streetscape: the Colosseum and Forum, the Pantheon\'s perfect dome, Bernini\'s squares and the Vatican across the Tiber.',
  prague: 'The city of a hundred spires — Charles Bridge at dawn, the castle above the Vltava, and a Gothic old town that survived the twentieth century intact.',
  granada: 'The last emirate of Al-Andalus, crowned by the Alhambra — Nasrid palaces of carved stucco and courtyards of water beneath the Sierra Nevada.',
  athens: 'The Acropolis above a living city: the Parthenon, the Agora where democracy argued itself into being, and tavernas in the lanes of Plaka.',
};

for (const [id, name, region, country, destId, img, type] of stubs) {
  places[id] = {
    id, name, region, country, destId, type, img,
    summary: stubText[id],
    sections: [{ heading: 'Overview', body: [stubText[id]] }],
    facts: [{ label: 'Country', value: country }, { label: 'Region', value: region }],
    related: ['brihadisvara', 'kyoto', 'konya'],
  };
}

/** Destination → states → districts hierarchy (India fully mapped). */
export interface District {
  id: string;
  name: string;
  placeIds: string[];
}
export interface StateEntry {
  id: string;
  name: string;
  districts: District[];
}

export const destinationHierarchy: Record<string, StateEntry[]> = {
  india: [
    {
      id: 'tamil-nadu',
      name: 'Tamil Nadu',
      districts: [
        { id: 'thanjavur', name: 'Thanjavur', placeIds: ['brihadisvara', 'gangaikonda', 'airavatesvara'] },
        { id: 'madurai', name: 'Madurai', placeIds: ['meenakshi'] },
        { id: 'chengalpattu', name: 'Chengalpattu', placeIds: ['mamallapuram'] },
        { id: 'tiruchirappalli', name: 'Tiruchirappalli', placeIds: ['srirangam'] },
      ],
    },
    {
      id: 'andhra-pradesh',
      name: 'Andhra Pradesh',
      districts: [{ id: 'chittoor', name: 'Chittoor', placeIds: ['gudimallam'] }],
    },
  ],
};

/** Markers for destination maps, positions as % of the rendered map image. */
export const destMarkers: Record<string, { id: string; x: number; y: number }[]> = {
  india: [
    { id: 'brihadisvara', x: 39.79, y: 80.06 },
    { id: 'meenakshi', x: 36.73, y: 82.59 },
    { id: 'airavatesvara', x: 40.52, y: 79.56 },
    { id: 'gangaikonda', x: 40.76, y: 78.79 },
    { id: 'mamallapuram', x: 43.0, y: 74.65 },
    { id: 'srirangam', x: 38.45, y: 79.82 },
    { id: 'gudimallam', x: 41.15, y: 71.82 },
  ],
  japan: [
    { id: 'kyoto', x: 41.76, y: 57.62 },
    { id: 'nara', x: 41.9, y: 60.15 },
    { id: 'tokyo', x: 60.43, y: 52.46 },
    { id: 'fuji-five-lakes', x: 55.86, y: 53.85 },
    { id: 'hiroshima', x: 25.95, y: 62.31 },
  ],
  turkey: [
    { id: 'istanbul', x: 18.95, y: 27.38 },
    { id: 'konya', x: 35.62, y: 66.63 },
    { id: 'cappadocia', x: 46.81, y: 57.0 },
    { id: 'ephesus', x: 11.14, y: 65.75 },
  ],
  armenia: [
    { id: 'yerevan', x: 46.23, y: 49.59 },
    { id: 'tatev', x: 59.62, y: 60.55 },
    { id: 'sevan', x: 50.0, y: 44.38 },
    { id: 'dilijan', x: 49.0, y: 41.92 },
  ],
  srilanka: [
    { id: 'sigiriya', x: 52.0, y: 54.91 },
    { id: 'kandy', x: 51.0, y: 61.0 },
    { id: 'anuradhapura', x: 49.23, y: 51.36 },
    { id: 'ella', x: 54.23, y: 64.82 },
  ],
  europe: [
    { id: 'bruges', x: 33.82, y: 36.26 },
    { id: 'rome', x: 54.4, y: 70.78 },
    { id: 'prague', x: 58.71, y: 40.44 },
    { id: 'granada', x: 18.67, y: 88.22 },
    { id: 'athens', x: 79.4, y: 85.26 },
  ],
};

export const destMapImages: Record<string, string> = {
  india: 'map-india.png',
  japan: 'map-dest-japan.png',
  turkey: 'map-dest-turkey.png',
  armenia: 'map-dest-armenia.png',
  srilanka: 'map-srilanka.png',
  europe: 'map-europe.png',
};

/** Long-form story essays. */
export interface StoryArticle {
  id: string;
  tag: string;
  title: string;
  time: string;
  img: string;
  placeId?: string;
  lede: string;
  body: string[];
}

export const storyArticles: Record<string, StoryArticle> = {
  'sacred-geography-kaveri': {
    id: 'sacred-geography-kaveri',
    tag: 'Essay',
    title: 'The Sacred Geography of the Kaveri',
    time: '5 min read',
    img: 'story-kaveri.jpg',
    placeId: 'srirangam',
    lede: 'Every river in India is a goddess, but the Kaveri is also an argument — about water, about empire, and about why the greatest temples of the south stand exactly where they do.',
    body: [
      'Follow the Kaveri east from Talakaveri and you follow, almost exactly, the axis of South Indian sacred history. At Srirangapatna the river splits around Tipu\'s island fortress; at Srirangam it splits again around the largest temple city on earth; and from Kumbakonam to the sea it threads a delta where a Chola temple rises, on average, every few kilometres.',
      'This is not coincidence. The Kaveri delta was the rice bowl that paid for the vimanas of Thanjavur, Gangaikonda Cholapuram and Darasuram. The Chola kings understood what every river civilisation learns: control the water and you can afford eternity. Their irrigation anicuts — some still functioning after a thousand years — and their temples are two faces of the same administration.',
      'At Srirangam the relationship is literal. The temple\'s seven enclosures occupy an island between the Kaveri and her distributary, the Kollidam, so that the pilgrim crosses water twice to reach the god. The river is the first prakaram.',
      'Stand on the bridge at dawn and the logic of the whole landscape announces itself: water, rice, temple, town. The sacred geography of the Kaveri is not mysticism layered over economics. It is economics, remembered as worship.',
    ],
  },
  'night-in-konya': {
    id: 'night-in-konya',
    tag: 'Field Notes',
    title: 'A Night in Konya',
    time: '6 min read',
    img: 'story-konya.jpg',
    placeId: 'konya',
    lede: 'The green dome is lit until late. Under it, in a city that has been praying in one form or another for three thousand years, Rumi still receives visitors after dark.',
    body: [
      'I reached the Mevlana Museum at blue hour, when the tour buses have gone and the courtyard belongs to cats and old men feeding them. The fluted turquoise dome above Rumi\'s tomb — the kubbe-i hadra, the Green Dome — holds the light longer than anything else in the city, as if reluctant to let the day end.',
      'Inside, the atmosphere is not museum but shrine. Visitors weep quietly before the great sarcophagus with its enormous turban. A guard who had worked there thirty years told me the evening shift was the one everyone wanted: "In the day they photograph. At night they talk to him."',
      'Konya rewards the night wanderer. The Seljuk portals of the İnce Minare madrasa are floodlit against the dark; the Alaeddin hill, oldest ground in the city, fills with families drinking tea. Nowhere in Turkey does the thirteenth century feel so casually present.',
      'I walked back past the museum near midnight. The dome was still lit. It is lit every night. Some cities keep a light on for their dead; Konya keeps one for a man who wrote that death is only the wedding night — the Şeb-i Arus — and eight centuries later the whole city still attends.',
    ],
  },
  'last-sculptor-mamallapuram': {
    id: 'last-sculptor-mamallapuram',
    tag: 'History',
    title: 'The Last Sculptor of Mamallapuram',
    time: '7 min read',
    img: 'story-sculptor.jpg',
    placeId: 'mamallapuram',
    lede: 'In a shed behind the Five Rathas, a man whose family has carved stone for forty generations explains why the chisel has not changed in thirteen hundred years.',
    body: [
      'The sound reaches you before the street does: tick-tick-tick, a dozen workshops keeping slightly different time. Mamallapuram has heard this sound continuously since the Pallava king Narasimhavarman first set masons against the granite boulders in the 630s CE.',
      'The Sthapathis — hereditary temple sculptors — still train the old way: years of drawing before stone, years of rough work before finishing, the proportions of the god memorised from the Shilpa Shastra rather than measured. "The measurements are in the hand," one master told me, holding up a palm calloused like the rock he works.',
      'What has changed is the market. The Pallavas ordered temples; today\'s orders are garden Ganeshas and export Natarajas. The great commissions — a gopuram restored, a new temple in the old style — come rarely now, and each one empties the town of its best hands for years.',
      'He calls himself the last sculptor the way fishermen call themselves the last fishermen — partly complaint, partly boast. His son, home from an engineering degree, was finishing a small Nandi in the corner of the shed. The chisel in the boy\'s hand, the father pointed out, was his grandfather\'s. The sound of Mamallapuram goes on.',
    ],
  },
  'kyoto-in-winter': {
    id: 'kyoto-in-winter',
    tag: 'Photo Essay',
    title: 'Kyoto in Winter',
    time: '4 min read',
    img: 'story-kyoto.jpg',
    placeId: 'kyoto',
    lede: 'Snow subtracts the crowds and the colour, and what remains of Kyoto is its skeleton: rooflines, stone, incense, and the sound water makes in temple gardens.',
    body: [
      'The Yasaka pagoda under fresh snow, photographed from the lane at Ninenzaka before seven in the morning, is the Kyoto of the postcards — except that in winter you can have it alone.',
      'At Ryōan-ji the fifteen stones of the karesansui garden sit in a field of white instead of raked gravel, and the garden finally shows you what it was always about: not the stones, but the space the stones are keeping.',
      'The crowds return by ten. The trick of winter Kyoto is simply to live by temple time — out at dawn, back for the long lunch, out again for the last hour when the light goes the colour of old gold on the wet eaves.',
      'What the season gives back is silence. In Gion at dusk you can hear a geiko\'s footsteps on stone a street away. In summer this city is a beautiful machine for tourism. In winter it is a twelfth-century capital that happens to have electricity.',
    ],
  },
  'conversations-silk-route': {
    id: 'conversations-silk-route',
    tag: 'People',
    title: 'Conversations from the Silk Route',
    time: '6 min read',
    img: 'story-silkroute.jpg',
    placeId: 'konya',
    lede: 'In the chaikhanas of Bukhara, Samarkand and Konya, the Silk Road is not a history lesson. It is the old man at the next table insisting you drink one more tea.',
    body: [
      'The Silk Road survives in Uzbekistan not in the restored madrasas — magnificent as they are — but in the chaikhana, the tea house, which is still organised exactly as it was for the caravans: low tables, endless pots, strangers seated together because that is what travellers are for.',
      'In Bukhara an old silversmith named Anvar told me his family had worked the same street for eleven generations, and that the tourists had simply replaced the merchants. "Before, they bought knives and rode away. Now they buy knives and fly away. The street does not care."',
      'Tea house talk runs on an old economy: information, gossip, news of the road. Within an hour of sitting down in Samarkand I knew which border crossing was slow, which shared-taxi driver overcharged, and whose daughter was marrying whose son in three cities I will never visit.',
      'This is the real monument of the route — not the tilework but the protocol. Two thousand years of strangers arriving dusty and leaving fed. The tea is still hot, the table is still low, and the old men still insist: one more. The road is long. Sit.',
    ],
  },
};

/* ---------- from src/data.ts ---------- */
export const IMG = (n: string) => `/img/final/${n}`;

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

/* ---------- Tamil maps from src/content-ta.ts ---------- */
/** Tamil translations of wiki content, merged over the English base at render time. */

export interface PlaceTa {
  name: string;
  region: string;
  country: string;
  summary: string;
  sections?: WikiSection[];
  facts?: WikiFact[];
}

export const placesTa: Record<string, PlaceTa> = {
  brihadisvara: {
    name: 'பிருகதீஸ்வரர் கோயில்',
    region: 'தஞ்சாவூர், தமிழ்நாடு',
    country: 'இந்தியா',
    summary:
      'கட்டியவரால் "ராஜராஜேஸ்வரம்" என அழைக்கப்பட்ட பிருகதீஸ்வரர் கோயில், காவேரியின் தென்கரையில் சிவனுக்கு அர்ப்பணிக்கப்பட்ட சோழர் கால இந்துக் கோயிலாகும். கி.பி. 1010-இல் நிறைவடைந்த இது இந்தியாவின் மிகப் பெரிய கோயில்களில் ஒன்றும் திராவிடக் கட்டிடக்கலையை வரையறுக்கும் நினைவுச்சின்னமும் ஆகும்.',
    sections: [
      {
        heading: 'வரலாறு',
        body: [
          'சோழர் வல்லரசின் உச்சத்தில் முதலாம் ராஜராஜன் (ஆட்சி கி.பி. 985–1014) இக்கோயிலைக் கட்டினார்; அவரது ஆட்சியின் இருபத்தி ஐந்தாம் ஆண்டான கி.பி. 1010-இல் மூலவர் குடமுழுக்கு நடந்தது. சுவர்களிலுள்ள கல்வெட்டுகள் தங்கம், நகைகள், நிலம், கிராமங்கள் முழுவதும் வழங்கப்பட்ட கொடைகளை அசாதாரண நிர்வாக விவரத்துடன் பதிவு செய்கின்றன — ஆலயம் என்பதையும் தாண்டி இது ஒரு வரலாற்றுக் காப்பகம்.',
          'போர்கள், சோழர் வீழ்ச்சி, பல நூற்றாண்டு வானிலை — அனைத்தையும் தாண்டி கோயில் கிட்டத்தட்ட முழுமையாக உயிர்வாழ்ந்தது. 1987-இல் யுனெஸ்கோ உலகப் பாரம்பரியப் பட்டியலில் சேர்க்கப்பட்டது; 2004-இல் "உயிரோட்டமுள்ள பெரும் சோழர் கோயில்கள்" என்ற பட்டியலில் விரிவாக்கப்பட்டது — ஆயிரம் ஆண்டுகளுக்கும் மேலாக இங்கு வழிபாடு தடையின்றி நடந்து வருவதால் "உயிரோட்டமுள்ள" எனப்படுகிறது.',
        ],
      },
      {
        heading: 'கட்டிடக்கலை',
        body: [
          'விமானம் (கருவறைக் கோபுரம்) பதின்மூன்று சுருங்கும் அடுக்குகளில் சுமார் 66 மீட்டர் உயர்ந்து நிற்கிறது; சாந்தின்றி பூட்டிணைக்கப்பட்ட பளிங்குப் பாறையால் முழுவதும் கட்டப்பட்டது. சுமார் 80 டன் என மதிப்பிடப்படும் ஒற்றை உச்சிக்கல் கோபுரத்தை முடிசூட்டுகிறது — அதை எப்படி ஏற்றினர் என்பது அக்காலத்தின் பெரும் பொறியியல் விவாதங்களில் ஒன்றாக உள்ளது.',
          'பிரதட்சிணப் பாதைகளுக்குள், சிவனின் பல வடிவங்களைக் காட்டும் சிறந்த சோழர் சுவரோவியங்களில் சில உயிர்ந்துள்ளன. கருவறைக்கு முன் ஒற்றைப் பாறையில் செதுக்கப்பட்ட பெரிய நந்தி, கிட்டத்தட்ட 16 அடி நீளத்துடன் இந்தியாவின் மிகப்பெரியவற்றில் ஒன்று.',
        ],
      },
      {
        heading: 'பார்வையிட',
        body: [
          'கோயில் தஞ்சாவூர் நகரின் நடுவில் அமைந்துள்ளது; அதிகாலையிலும் மாலையிலும் திறக்கப்படுகிறது. பளிங்குப் பாறை எரிந்த தேன் நிறமாக மாறும் சூரிய அஸ்தமனத்திற்கு முந்தைய ஒரு மணி நேரமே ஒளிப்படக்காரர்கள் காத்திருக்கும் நேரம். இந்துக்கள் அல்லாதவர்களும் முற்றங்களிலும் திண்ணைகளிலும் சுதந்திரமாக நடக்கலாம். அடக்கமாக உடுத்தவும்; பிரகாரத்திற்குள் தோல் பொருட்கள் விரும்பப்படுவதில்லை.',
        ],
      },
    ],
    facts: [
      { label: 'கட்டப்பட்டது', value: 'கி.பி. 1003–1010' },
      { label: 'கட்டியவர்', value: 'முதலாம் ராஜராஜ சோழன்' },
      { label: 'வம்சம்', value: 'சோழர்' },
      { label: 'பாணி', value: 'திராவிடம்' },
      { label: 'மூலவர்', value: 'சிவன் (பெருவுடையார்)' },
      { label: 'விமான உயரம்', value: '≈ 66 மீ, 13 அடுக்குகள்' },
      { label: 'பொருள்', value: 'பளிங்குப் பாறை' },
      { label: 'யுனெஸ்கோ', value: 'உலகப் பாரம்பரியம், 1987 / 2004' },
    ],
  },

  gangaikonda: {
    name: 'கங்கைகொண்ட சோழபுரம்',
    region: 'அரியலூர் மாவட்டம், தமிழ்நாடு',
    country: 'இந்தியா',
    summary:
      '"கங்கையைக் கொண்டுவந்த சோழனின் நகரம்" என்ற பொருள்கொண்ட கங்கைகொண்ட சோழபுரம், முதலாம் இராசேந்திரனால் அவரது வெற்றிகரமான வடநாட்டுப் படையெடுப்பை நினைவுகூரும் வகையில் கி.பி. 1035-இல் நிறுவப்பட்டது; இங்குள்ள பிருகதீஸ்வரர் கோயில் உயிரோட்டமுள்ள மூன்று பெரும் சோழர் கோயில்களில் இரண்டாவது.',
    sections: [
      {
        heading: 'வரலாறு',
        body: [
          'கி.பி. 1023-இல் அவரது படைகள் கங்கையை அடைந்த பிறகு, இராசேந்திரன் தலைநகரை தஞ்சாவூரிலிருந்து இப்புதிய நகருக்கு மாற்றி, பேரரசின் கொள்ளைப்பொருளை இக்கோயிலில் செலுத்தினார். சுமார் 250 ஆண்டுகள் இது சோழர்களின் அரசுரிமை இருக்கையாக விளங்கியது.',
        ],
      },
      {
        heading: 'கட்டிடக்கலை',
        body: [
          'சுமார் 55 மீட்டர் உயரமுள்ள விமானம், தஞ்சாவூரில் தந்தை கட்டியதைவிட வேண்டுமென்றே குறைவானது — ஆனால் மேலும் நுட்பமானது: அதன் மெல்லிய குழிவு வளைவுகள் பெண்மையான அழகைத் தருகின்றன; இராஜராஜனின் ஆண்மையான மாபெரும் தன்மைக்கு உணர்ந்து கொடுக்கப்பட்ட பாணிப் பதில் என அறிஞர்கள் பார்க்கிறார்கள். சிங்கக்கிணறு (சிம்மக்கேனி), சண்டிகேஸ்வரர் சன்னதி, வானிலையால் மங்கிய நந்தி ஆகியவை வளாகத்தை நிறைவு செய்கின்றன.',
        ],
      },
      {
        heading: 'பார்வையிட',
        body: [
          'கோயில் தஞ்சாவூரிலிருந்து வடகிழக்கே சுமார் 70 கி.மீ. தொலைவில் உள்ளது; தஞ்சாவூர் பெறும் கூட்டத்தில் சிறு பகுதியே இங்கு வருகிறது. பிற்பகலில் வாருங்கள்; புல்வெளிகளும் மதில்சுவர்களும் இதைப் பெரிய சோழர் தளங்களில் மிக அமைதியானதாக்குகின்றன.',
        ],
      },
    ],
    facts: [
      { label: 'கட்டப்பட்டது', value: 'சுமார் கி.பி. 1035' },
      { label: 'கட்டியவர்', value: 'முதலாம் இராசேந்திர சோழன்' },
      { label: 'வம்சம்', value: 'சோழர்' },
      { label: 'பாணி', value: 'திராவிடம்' },
      { label: 'விமான உயரம்', value: '≈ 55 மீ' },
      { label: 'யுனெஸ்கோ', value: 'உலகப் பாரம்பரியம், 2004' },
    ],
  },

  airavatesvara: {
    name: 'ஐராவதேஸ்வரர் கோயில்',
    region: 'தாராசுரம், கும்பகோணம் அருகில், தமிழ்நாடு',
    country: 'இந்தியா',
    summary:
      '12-ஆம் நூற்றாண்டில் இரண்டாம் இராஜராஜனால் தாராசுரத்தில் கட்டப்பட்ட ஐராவதேஸ்வரர் கோயில், உயிரோட்டமுள்ள மூன்று பெரும் சோழர் கோயில்களில் மிகச் சிறியதும் மிக நுணுக்கமாகச் செதுக்கப்பட்டதும் — குதிரைகள் இழுக்கும் தேர் வடிவ மண்டபம் கொண்ட கல்லின் நகைப்பெட்டி.',
    sections: [
      {
        heading: 'வரலாறு',
        body: [
          'இரண்டாம் இராஜராஜன் (ஆட்சி கி.பி. 1146–1173) சோழர் பெருநகரின் புறநகரான தாராசுரத்தில் இக்கோயிலைக் கட்டினார். சாபத்திலிருந்து விடுபட இந்திரனின் வெள்ளையானை ஐராவதம் இங்கு சிவனை வணங்கிய புராணத்தை இப்பெயர் நினைவுபடுத்துகிறது.',
        ],
      },
      {
        heading: 'கட்டிடக்கலை',
        body: [
          'முன்புள்ள இராஜகம்பீர மண்டபம் விண்ணகத் தேராகக் கற்பனை செய்யப்பட்டுள்ளது; அதன் சக்கரங்களும் குதிரைகளும் முழு உருவச் சிற்பங்களாகச் செதுக்கப்பட்டுள்ளன. முன்றில்படிகள் புகழ்பெற்ற "இசைப் படிகள்" — தட்டினால் ஏழு சுரங்கள் ஒலிக்கும் எனச் சொல்லப்படுகின்றன. தூண்களில் 63 நாயன்மார் துறவிகள், நடனக் கரணங்கள், அன்றாடக் காட்சிகள் போன்ற நுண்ணிய பலகைகள் ஒரு நகைச் செதுக்குவோனின் பொறுமையுடன் செதுக்கப்பட்டுள்ளன.',
        ],
      },
      {
        heading: 'பார்வையிட',
        body: [
          'தாராசுரம் கும்பகோணத்திலிருந்து 4 கி.மீ. தொலைவில் உள்ளது; காவேரி டெல்டா கோயில் நகரங்களின் ஒருநாள் பயணத்துடன் இயற்கையாக இணைகிறது. வளாகம் சிறியது; அவசரமின்றி ஒரு மணி நேரம் போதும் — ஆனால் சிற்பங்கள் மற்றொரு சுற்றுக்கு வெகுமதி தரும்.',
        ],
      },
    ],
    facts: [
      { label: 'கட்டப்பட்டது', value: 'கி.பி. 12-ஆம் நூற்றாண்டு' },
      { label: 'கட்டியவர்', value: 'இரண்டாம் ராஜராஜ சோழன்' },
      { label: 'வம்சம்', value: 'சோழர்' },
      { label: 'பாணி', value: 'திராவிடம்' },
      { label: 'புகழ்பெற்றது', value: 'தேர் மண்டபம், இசைப் படிகள்' },
      { label: 'யுனெஸ்கோ', value: 'உலகப் பாரம்பரியம், 2004' },
    ],
  },

  meenakshi: {
    name: 'மீனாட்சி அம்மன் கோயில்',
    region: 'மதுரை, தமிழ்நாடு',
    country: 'இந்தியா',
    summary:
      'மீனாட்சி அம்மன் கோயில் மதுரையின் துடிக்கும் இதயம் — மீன்போன்ற கண்களுடைய தெய்வம் மீனாட்சிக்கும் அவரது காவலன் சுந்தரேஸ்வரருக்கும் அர்ப்பணிக்கப்பட்ட, சிற்பங்கள் படர்ந்த உயர்ந்த கோபுரங்களுக்குப் புகழ்பெற்ற, மதில்சூழ்ந்த நகருக்குள் நகரம்.',
    sections: [
      {
        heading: 'வரலாறு',
        body: [
          'மதுரையின் கோயில் பண்டையது — நகரமே அதனைச் சுற்றி வளர்ந்தது — ஆனால் இன்று நிற்பவற்றில் பெரும்பாலானவை 16, 17-ஆம் நூற்றாண்டு நாயக்கர் ஆட்சியாளர்களால், முக்கியமாக திருமலை நாயக்கரால் எழுப்பப்பட்டவை. நான்கு திசைகளுக்கும் ஒத்த நுழைவுகளுடன் வளாகம் சுமார் 14 ஏக்கர் பரப்பில் பரவியுள்ளது.',
        ],
      },
      {
        heading: 'கட்டிடக்கலை',
        body: [
          'வளாகத்தின் மேல் பதினான்கு கோபுரங்கள் எழுகின்றன; தென் கோபுரம் கிட்டத்தட்ட 52 மீட்டரை அடைகிறது. ஒவ்வொன்றிலும் தெய்வங்கள், அரக்கர்கள், வானவர்கள் என ஆயிரக்கணக்கான வண்ணச் சுதை உருவங்கள் பதித்திருக்கின்றன. உள்ளே, ஆயிரங்கால் மண்டபம் ஒன்றுக்கொன்று ஒப்பில்லாத சிற்பப் பளிங்குத் தூண்களின் காடு.',
        ],
      },
      {
        heading: 'பார்வையிட',
        body: [
          'சுந்தரேஸ்வரர் இரவுக்காக மீனாட்சியின் சன்னதிக்கு ஊர்வலமாக எடுத்துச் செல்லப்படும் இரவுச் சடங்கு தென்னிந்தியாவின் பெரும் அன்றாடச் சடங்குகளில் ஒன்று. மூடும் ஊர்வலத்திற்கு இரவு 9 மணிக்கு முன் வருங்கள். கோயில் அதிகாலைக்கு முன்பிருந்து இரவு வரை துடிப்புடன் இருக்கும்.',
        ],
      },
    ],
    facts: [
      { label: 'மீண்டும் கட்டப்பட்டது', value: '16–17-ஆம் நூற்றாண்டு (நாயக்கர்)' },
      { label: 'மூலவர்கள்', value: 'மீனாட்சி & சுந்தரேஸ்வரர்' },
      { label: 'கோபுரங்கள்', value: '14 கோபுரங்கள்' },
      { label: 'பாணி', value: 'திராவிடம்' },
      { label: 'வளாகப் பரப்பு', value: '≈ 14 ஏக்கர்' },
    ],
  },

  mamallapuram: {
    name: 'மாமல்லபுரம்',
    region: 'செங்கல்பட்டு மாவட்டம், தமிழ்நாடு',
    country: 'இந்தியா',
    summary:
      'வங்கக் கடல் கரையிலுள்ள பல்லவர் துறைமுக நகரம் மாமல்லபுரம் — 7-ஆம் நூற்றாண்டில் தென்னிந்தியக் கல் கட்டிடக்கலை உண்மையில் கண்டுபிடிக்கப்பட்ட இடம்; கடற்கரைக் கோயில், ஒற்றைக்கல் ரதங்கள், மாபெரும் புறனிலைச் சிற்பம் ஆகியவை யுனெஸ்கோ உலகப் பாரம்பரியம்.',
    sections: [
      {
        heading: 'வரலாறு',
        body: [
          'நகரம் பெயர்பெற்ற முதலாம் நரசிம்மவர்மன் "மாமல்லன்" (ஆட்சி கி.பி. 630–668) காலத்தில், பல்லவர் கைவினைஞர்கள் உயிருள்ள பாறையிலிருந்தே கோயில்களை வெட்டத் தொடங்கினர் — அடுத்த ஆயிரம் ஆண்டுகளுக்குத் திராவிடக் கட்டிடக்கலையின் இலக்கணமான சோதனைகள் அவை. தென்கிழக்கு ஆசியாவுடனும் ரோமுடனும் வாணிபம் செய்த பரபரப்பான துறைமுகமும் இந்நகரம்.',
        ],
      },
      {
        heading: 'நினைவுச்சின்னங்கள்',
        body: [
          'பஞ்ச ரதங்கள் ஒவ்வொன்றும் ஒற்றைப் பாறையிலிருந்து செதுக்கப்பட்ட ஐந்து கோயில்கள்; பல்லவர் வீழ்ச்சியில் பாதியில் நின்றவை. இரண்டு மலைச்சரிவுகள் மீது பரந்த மாபெரும் புறனிலைச் சிற்பமான கங்கை அவதரணம் — தெய்வங்கள், துறவிகள், யானைகள், பாசாங்கு தவம் செய்யும் பூனை என நிரம்பியிருக்கிறது. ஒரு தலைமுறைக்குப் பின் வெட்டப்பட்ட கல்லால் கட்டப்பட்ட கடற்கரைக் கோயில் பதின்மூன்று நூற்றாண்டுகளாக அலைகளைக் கண்டு நிற்கிறது.',
        ],
      },
      {
        heading: 'பார்வையிட',
        body: [
          'சென்னையிலிருந்து தெற்கே சுமார் 60 கி.மீ. தொலைவில், நினைவுச்சின்னங்கள் நடந்து செல்லும் தூரத்தில் ஒன்றோடொன்று அணுக்கமாக உள்ளன. புறனிலைச் சிற்பத்திற்குக் காலையில் செல்லுங்கள்; சூரிய அஸ்தமனத்தைக் கடற்கரைக் கோயிலில் முடியுங்கள் — சுத்தியலின் தக்தக் ஒலியைக் கவனியுங்கள்: சிற்பிகளின் குடியிருப்பு இன்றும் பல்லவர் காலத்தைப் போலவே கல்லை வேலை செய்கிறது.',
        ],
      },
    ],
    facts: [
      { label: 'சிறந்த காலம்', value: 'கி.பி. 7–8-ஆம் நூற்றாண்டு' },
      { label: 'வம்சம்', value: 'பல்லவர்' },
      { label: 'முக்கியப் படைப்புகள்', value: 'கடற்கரைக் கோயில், பஞ்ச ரதங்கள்' },
      { label: 'யுனெஸ்கோ', value: 'உலகப் பாரம்பரியம், 1984' },
      { label: 'அமைவிடம்', value: 'வங்கக் கடல் கரை' },
    ],
  },

  srirangam: {
    name: 'ஸ்ரீரங்கம்',
    region: 'திருச்சிராப்பள்ளி, தமிழ்நாடு',
    country: 'இந்தியா',
    summary:
      'ஸ்ரீரங்கம் காவேரியிலுள்ள ஒரு கோயில் தீவு; அதன் ஸ்ரீ ரங்கநாதசுவாமி கோயில் உலகின் மிகப்பெரிய செயல்படும் இந்துக் கோயில் வளாகம் — 156 ஏக்கர் ஒன்றுக்கொன்றுள் அமைந்த பிரகாரங்கள், உண்மையில் ஒரு மதில்சூழ்ந்த புனித நகரம்.',
    sections: [
      {
        heading: 'வரலாறு',
        body: [
          'பள்ளிகொண்டிருக்கும் ரங்கநாதரின் சன்னதி இந்தியாவில் தொடர்ந்து வழிபடப்படும் பழமையான சன்னதிகளில் ஒன்று; தொடக்ககாலத் தமிழ்ச் சங்க இலக்கியத்தில் பாடப்பட்டது. நூற்றாண்டுகளாகச் சோழர், பாண்டியர், ஒய்சாலர், விசயநகர மன்னர்கள், மதுரை நாயக்கர்களால் விரிவாக்கப்பட்டது; 14-ஆம் நூற்றாண்டுச் சூறையாடலைத் தாண்டி மீண்டும் பெரிதாக எழுந்தது.',
        ],
      },
      {
        heading: 'கட்டிடக்கலை',
        body: [
          'ஏழு ஒன்றுக்கொன்றுள் அமைந்த பிரகாரங்கள் கருவறையைச் சுற்றுகின்றன; வெளிப் பிரகாரங்களில் தெருக்கள், வீடுகள், கடைகள், குடியிருப்புகள் முழுவதும் உள்ளன. நுழைவாயில்களின் மேல் இருபத்தொரு கோபுரங்கள் — 1987-இல் நிறைவடைந்த தென் ராஜகோபுரம் 73 மீட்டர் எழுகிறது; ஆசியாவின் இரண்டாவது உயரமான கோயில் கோபுரம்.',
        ],
      },
      {
        heading: 'பார்வையிட',
        body: [
          'அதிகாலையில் திருச்சிராப்பள்ளியிலிருந்து காவேரியைக் கடந்து, சுற்றிலும் நகரம் விழிக்க ஏழு பிரகாரங்களையும் உள்நோக்கி நடந்து செல்லுங்கள். டிசம்பர்–ஜனவரியில் வைகுண்ட ஏகாதசி விழா பத்து இலட்சத்திற்கும் மேற்பட்ட பக்தர்களைக் கவர்கிறது; சாதாரண காலைகளே தீவின் பரிசு.',
        ],
      },
    ],
    facts: [
      { label: 'மூலவர்', value: 'ரங்கநாதர் (பள்ளிகொண்ட விஷ்ணு)' },
      { label: 'வளாகப் பரப்பு', value: '≈ 156 ஏக்கர்' },
      { label: 'பிரகாரங்கள்', value: '7 பிரகாரங்கள்' },
      { label: 'கோபுரங்கள்', value: '21' },
      { label: 'ராஜகோபுரம்', value: '73 மீ, 1987-இல் நிறைவு' },
    ],
  },

  gudimallam: {
    name: 'குடிமல்லம்',
    region: 'சித்தூர் மாவட்டம், ஆந்திரப் பிரதேசம்',
    country: 'இந்தியா',
    summary:
      'குடிமல்லம் பரசுராமேஸ்வரர் கோயில் பல அறிஞர்களின் பார்வையில் அறியப்பட்ட மிகப் பழமையான மனித உருவ சிவலிங்கத்தைக் காக்கிறது — கி.மு. 2–1-ஆம் நூற்றாண்டைச் சேர்ந்த தூண்போன்ற லிங்கத்தில் நிற்கும் உருவம் செதுக்கப்பட்டுள்ளது.',
    sections: [
      {
        heading: 'வரலாறு',
        body: [
          'தற்போதைய எளிய கோயில் பிற்காலத்தியது எனினும், அது காக்கும் லிங்கம் மற்ற எந்த சிவ உருவத்தையும் விடப் பழமையானது: யட்சன் போன்ற குனிந்த உருவத்தின் மீது நிற்கும் இருகர உருவம், தண்டின் மீது ஆழ்ந்த உயர்தளச் சிற்பமாக வெட்டப்பட்டுள்ளது. சிலையற்ற தூணும் மனித வடிவத் தெய்வமும் இன்னும் ஒரே கருத்தாக இருந்த தருணத்தை இது காட்டுகிறது.',
        ],
      },
      {
        heading: 'முக்கியத்துவம்',
        body: [
          'சமயத்தை ஆய்வோருக்குக் குடிமல்லம் ஒரு திருப்புமுனை: சிவனின் அருவச் சின்னமான லிங்கம் இங்கே தெய்வத்தின் மிகப் பழமையான உடலைச் சுமக்கிறது. பின்னர் வந்த பாக்திரிய, குஷாண, குப்த ஒப்பீடுகள் இஉருவம் எவ்வளவு பழமையானது, எவ்வளவு தனித்தது என்பதையே அடிக்கோடிட்டுக் காட்டுகின்றன. இரண்டாயிரம் ஆண்டுகளுக்கும் மேலாக அதனைச் சுற்றி வழிபாடு நடந்து வருகிறது.',
        ],
      },
      {
        heading: 'பார்வையிட',
        body: [
          'திருப்பதியிலிருந்து சுமார் 20 கி.மீ. தொலைவிலுள்ள அமைதியான கிராமத்தில் கோயில் உள்ளது; காலையிலும் மாலையிலும் திறக்கப்படும். சிறியது — விஜயம் நிமிடங்களே — ஆனால் உலகின் பெரும்பாலான சமயங்களைவிடப் பழமையான உருவத்திற்கு முன் நிற்பது சிறிய அனுபவமல்ல.',
        ],
      },
    ],
    facts: [
      { label: 'லிங்கக் காலம்', value: 'கி.மு. 2–1-ஆம் நூற்றாண்டு' },
      { label: 'மூலவர்', value: 'சிவன் (பரசுராமேஸ்வரர்)' },
      { label: 'முக்கியத்துவம்', value: 'மிகப் பழமையான மனித உருவ சிவலிங்கம்' },
      { label: 'அமைவிடம்', value: 'திருப்பதி அருகில்' },
    ],
  },

  kyoto: {
    name: 'கியோட்டோ',
    region: 'கன்சாய்',
    country: 'ஜப்பான்',
    summary:
      'ஆயிரம் ஆண்டுகளுக்கும் மேலாக ஜப்பானின் பேரரசுத் தலைநகராக இருந்த கியோட்டோவில் சுமார் 1,600 புத்தக் கோயில்களும் 400 ஷின்டோ திருக்கோயில்களும் உள்ளன — யசாகா பகோடாவின் மீது பனி படரும் குளிர்காலத்தில் பழைய நகரம் தன் பன்னிரண்டாம் நூற்றாண்டுக்கே திரும்புகிறது.',
    sections: [
      {
        heading: 'கண்ணோட்டம்',
        body: [
          'கி.பி. 794-இல் ஹெயான்-கியோ என நிறுவப்பட்ட கியோட்டோ பசிபிக் போரின் குணமூட்டலிலிருந்து தப்பியது; ஜப்பானின் அடர்த்தியான பண்பாட்டுப் புதையல்களைக் காக்கிறது: கின்காகு-ஜி, கின்காகு-ஜி, ரியோன்-ஜி, தைத்தோகு-ஜியின் ஸென் தோட்டங்கள், ஃபுஷிமி இனாரியின் ஆயிரம் தொரிகள், ஹிகாஷியாமா, கியோனின் காக்கப்பட்ட சந்துகள்.',
          'மாவட்டம் வாரியாக, நடந்து, அதிகாலையில் பார்வையிடுங்கள். குளிர்காலம் கூட்டத்தையும் நிறத்தையும் உதறிவிட்டு கூரைக் கோடுகள், தூபம், அமைதி ஆகியவற்றை மட்டும் விட்டுச் செல்கிறது.',
        ],
      },
    ],
    facts: [
      { label: 'நிறுவப்பட்டது', value: 'கி.பி. 794 (ஹெயான்-கியோ)' },
      { label: 'புகழ்பெற்றது', value: 'கோயில்கள், திருக்கோயில்கள், கெய்ஷா மாவட்டங்கள்' },
      { label: 'யுனெஸ்கோ', value: '17 அங்கத் தளங்கள், 1994' },
    ],
  },

  konya: {
    name: 'கொன்யா',
    region: 'மத்திய அனடோலியா',
    country: 'துருக்கி',
    summary:
      'ரூம் செல்யுக் சுல்தானத்தின் தலைநகரமும் கவிஞர்-துறவி ரூமியின் இருப்பிடமுமான கொன்யா துருக்கியின் மிக ஆன்மீக நகரம் — அதன் பச்சை ஓட்டுக் குவிமாடமுள்ள மெவ்லானா அருங்காட்சியகம் ஒருபோதும் நின்றதில்லை என்ற தீர்த்தயாத்திரையின் இலக்கு.',
    sections: [
      {
        heading: 'கண்ணோட்டம்',
        body: [
          'ஐகோனியமாகவும் பின்னர் செல்யுக்குகளின் தலைநகராகவும் இருந்த கொன்யா, 12–13-ஆம் நூற்றாண்டு அனடோலியாவின் சிறந்த கல் வேலைகளைத் திரட்டியது: அலாயெத்தின் பள்ளிவாசல்; செதுக்கப்பட்ட நுழைவாயில்களின் காடுகளான கராத்தாய், இன்செ மினாரே மதரசாக்கள்.',
          'மங்கோலியக் குழப்பங்களுக்குப் பின், ஜலால் அல்-தின் ரூமியும் அவர் நிறுவிய மெவ்லெவி சபையும் இந்நகரை இருப்பிடமாக்கினர். குழல்வடிவ பர்கீசு நிறக் குவிமாடமுள்ள அவரது கல்லறை இன்று மெவ்லானா அருங்காட்சியகமாக உள்ளது. டிசம்பரில் ஷெப்-இ அரூஸ் விழாக்கள் நகரைச் சுழலும் தரவீஷ்களின் சுழற்சியால் நிரப்புகின்றன.',
        ],
      },
    ],
    facts: [
      { label: 'காலம்', value: 'செல்யுக் தலைநகரம், 12–13-ஆம் நூற்றாண்டு' },
      { label: 'புகழ்பெற்றது', value: 'மெவ்லானா அருங்காட்சியகம், சுழலும் தரவீஷ்கள்' },
      { label: 'பிராந்தியம்', value: 'மத்திய அனடோலியா' },
    ],
  },

  tatev: {
    name: 'தாதெவ் மடாலயம்',
    region: 'சியூனிக் மாகாணம்',
    country: 'ஆர்மீனியா',
    summary:
      '500 மீட்டர் ஆழமான வொரோத்தான் பள்ளத்தாக்கின் மேல் பாசால்ட் மேட்டில் அமர்ந்திருக்கும் 9-ஆம் நூற்றாண்டுத் தாதெவ் மடாலயம் இடைக்கால ஆர்மீனியாவின் மாபெரும் பல்கலைக்கழகம் — இன்று உலகின் மிக நீளமான திரும்பிச்செல்லும் கேபிள்கார் "தாதெவின் இறக்கைகள்" மூலம் அடையலாம்.',
    sections: [
      {
        heading: 'கண்ணோட்டம்',
        body: [
          'கி.பி. 895-இல் நிறுவப்பட்ட தாதெவ், வொரோத்தான் பள்ளத்தாக்கின் விளிம்பில் பல்கலைக்கழகம், எழுத்தறை, கோட்டை-கருவூலம் ஆகியவற்றைக் கொண்டிருந்தது. புனித பீதுரு-பவுல் பேராலயம், புனித கிரகோரி தேவாலயம், அசையும் வினோத கவாசான் தூண் ஆகியவை வியக்கத்தக்க முழுமையுடன் உயிர்ந்துள்ளன.',
          'ஹலிட்சோரிலிருந்து 5.7 கி.மீ. கேபிள்கார் பன்னிரண்டு நிமிடங்களில் உங்களை மதில்களில் இறக்கும்; பழைய சாலையில் வந்து, பள்ளத்தாக்கின் மடிப்புகளில் மடாலயம் தோன்றி மறைவதைப் பார்ப்பது மெதுவானது — மேலும் சிறந்தது.',
        ],
      },
    ],
    facts: [
      { label: 'நிறுவப்பட்டது', value: 'கி.பி. 895' },
      { label: 'அணுகல்', value: 'தாதெவின் இறக்கைகள் கேபிள்கார், 5.7 கி.மீ.' },
      { label: 'அமைவு', value: 'வொரோத்தான் பள்ளத்தாக்கு, சியூனிக்' },
    ],
  },

  sigiriya: {
    name: 'சிகிரியா',
    region: 'மத்திய மாகாணம்',
    country: 'இலங்கை',
    summary:
      'சிகிரியாவின் சிங்கப்பாறை — மன்னர் காசியப்பனின் அரண்மனையைத் தலையில் சுமக்கும் 200 மீட்டர் பளிங்குத் தூண் — இலங்கையின் மிக வியப்பான தளம்: அகழிகள், நீர்த் தோட்டங்கள், மேகமாதர் ஓவியங்கள், ஒருகாலத்தில் சிங்க வாயில் வழியே நுழைந்த படிக்கட்டு.',
    sections: [
      {
        heading: 'கண்ணோட்டம்',
        body: [
          'கி.பி. 5-ஆம் நூற்றாண்டின் இறுதியில், முதலாம் காசியப்பன் தலைநகரை இப்பாறைக்கு மாற்றி, உலகின் மிகப் பழமையான நில அமைப்புத் தோட்டங்களால் சுற்றினார். நடுவழியில், அடைப்புள்ள இடத்தில் புகழ்பெற்ற சிகிரியா மாதரின் சுவரோவியங்கள்; அருகிலுள்ள கண்ணாடிச் சுவர் 8–10-ஆம் நூற்றாண்டு வருவோரின் சுவரெழுத்துகளைக் காக்கிறது.',
          'வெப்பத்தையும் கூட்டத்தையும் முந்திக் கொள்ள திறக்கும் நேரத்தில் ஏறுங்கள் — உச்சி அரண்மனை இடிபாடுகளும் 360-பாகைக் காட்டுக் கண்டிகையும் வெகுமதி.',
        ],
      },
    ],
    facts: [
      { label: 'கட்டப்பட்டது', value: 'கி.பி. 5-ஆம் நூற்றாண்டு' },
      { label: 'கட்டியவர்', value: 'மன்னர் முதலாம் காசியப்பன்' },
      { label: 'யுனெஸ்கோ', value: 'உலகப் பாரம்பரியம், 1982' },
    ],
  },

  bruges: {
    name: 'புரூஸ்',
    region: 'மேற்கு ஃப்ளாண்டர்ஸ்',
    country: 'பெல்ஜியம்',
    summary:
      'ஐரோப்பாவின் மிக நன்றாகக் காக்கப்பட்ட இடைக்கால நகரம்: 15-ஆம் நூற்றாண்டில் அதன் ஆறு மணலால் அடைபட்டபோது புரூஸ் நவீனத்திற்கு முதுகு காட்டியது; கால்வாய்கள், மணிக்கோபுரம், படிப்படியான முகப்புகள் ஆகியவை அதன் கோதிக் முகத்தைக் கிட்டத்தட்ட புகைப்படம் போல மாறாமல் வைத்துள்ளன.',
    sections: [
      {
        heading: 'கண்ணோட்டம்',
        body: [
          'இடைக்கால வாணிபத்தின் வடக்கு மையமாக, புரூஸ் கம்பளியிலும் வங்கித் துறையிலும் செழித்தது — போர்ஸ் உலகின் முதல் பங்குச் சந்தையாக இருக்கலாம். ஸ்வின் கால்வாய் மணலால் அடைக்கப்பட்டபோது நகரம் நான்கு நூற்றாண்டுகள் உறங்கியது — அதன் தெரு அமைப்பு, செங்கல் கோதிக் வீடுகள், கால்வாய் வளையம் உயிர்ந்ததற்கான காரணமே அதுவும்.',
          'ரோசன்ஹூட்காயில் இருந்து நீல நேரத்தில் பாருங்கள்; 83 மீட்டர் மணிக்கோபுரத்தில் ஏறுங்கள்; பின்னர் பெகினாஜிலும் கால்வாய் வளையத்திற்குக் கிழக்கிலுள்ள தெருக்களிலும் கூட்டத்தை இழந்துவிடுங்கள்.',
        ],
      },
    ],
    facts: [
      { label: 'பொற்காலம்', value: '12–15-ஆம் நூற்றாண்டு' },
      { label: 'புகழ்பெற்றது', value: 'கால்வாய்கள், மணிக்கோபுரம், கோதிக் செங்கல் வேலை' },
      { label: 'யுனெஸ்கோ', value: 'வரலாற்று மையம், 2000' },
    ],
  },

  // ---- stubs: summary-only places ----
  nara: {
    name: 'நாரா',
    region: 'கன்சாய்',
    country: 'ஜப்பான்',
    summary:
      'ஜப்பானின் முதல் நிரந்தரத் தலைநகர் (710–784); தோதை-ஜியின் மாபெரும் புத்தர் மண்டபம் — பூமியின் மிகப்பெரிய மரக் கட்டிடங்களில் ஒன்று — 15 மீட்டர் வெண்கலப் புத்தரைக் காக்கிறது; திருக்கோயில்களுக்கிடையே புனித மான்கள் பூங்காவில் உலவுகின்றன.',
  },
  tokyo: {
    name: 'டோக்கியோ',
    region: 'காந்தோ',
    country: 'ஜப்பான்',
    summary:
      'அசாகுசாவில் சென்சோ-ஜியின் தூபம் முதல் மெய்ஜி திருக்கோயிலின் காடுபோன்ற அமைதி வரை — உலகின் மிகப்பெரிய பெருநகருக்குள் டோக்கியோ 400-ஆண்டு தீர்த்தயாத்திரை நகரை மடித்து வைத்திருக்கிறது.',
  },
  'fuji-five-lakes': {
    name: 'ஃபுஜி ஐந்து ஏரிகள்',
    region: 'யமனாஷி',
    country: 'ஜப்பான்',
    summary:
      'ஃபுஜி மலையின் வடக்கு அடிவாரத்திலுள்ள ஐந்து ஏரிகள் — கவாகுச்சி, யமனாகா, சாய், ஷோஜி, மொத்தோசு — புனித மலையின் கண்ணாடித் தோற்றங்களைக் கொடுக்கின்றன; காற்று எழுவதற்கு முன் விடியற்காலையில் மிகச் சிறந்தவை.',
  },
  hiroshima: {
    name: 'ஹிரோஷிமா',
    region: 'சூகோகு',
    country: 'ஜப்பான்',
    summary:
      'அமைதிக்கான நினைவுச்சின்னமாக மீண்டும் கட்டப்பட்ட நகரம்: அணுக்குண்டு குவிமாடம், அமைதி நினைவுப் பூங்காவும் அருங்காட்சியகமும், விரிகுடாவில் ஒரு மணி நேரத்தில் இத்சுகுஷிமா தீவுத் திருக்கோயில்.',
  },
  istanbul: {
    name: 'இசுதான்புல்',
    region: 'மர்மரா',
    country: 'துருக்கி',
    summary:
      'பதினாறு நூற்றாண்டுகள் கான்ஸ்டான்டினோப்பிள்: ஹாகியா சோஃபியா, நீலப் பள்ளிவாசல், தோப்காப்பி அரண்மனை, கிராண்ட் பஜார் — ஐரோப்பாவும் ஆசியாவும் பொஸ்போரசுக்கு இருபுறமும் சந்திக்கும் இடத்தில் அடுக்கடுக்காக.',
  },
  cappadocia: {
    name: 'கப்படோக்கியா',
    region: 'மத்திய அனடோலியா',
    country: 'துருக்கி',
    summary:
      'பைசான்டிய குகைக் கோயில்கள் துளைத்தெழும் கனவுருவச் சுண்ணாம்புக் கூம்புகளின் எரிமலை நிலாநிலத்திடல்; விடியற்காலையில் கோரெமேவின் மீது பலூன்கள் நிறைந்த வானம்.',
  },
  ephesus: {
    name: 'எஃபிசஸ்',
    region: 'ஏஜியன்',
    country: 'துருக்கி',
    summary:
      'மத்தியதரைக் கடலின் மிக முழுமையான கிரேக்க-ரோம நகரம்: செல்சஸ் நூலகம், 25,000 இருக்கை அரங்கம், பேரரசர்களும் தூதர்களும் நடந்த பளிங்குத் தெருக்கள்.',
  },
  yerevan: {
    name: 'யெரெவான்',
    region: 'அரராத் சமவெளி',
    country: 'ஆர்மீனியா',
    summary:
      'உலகின் தொடர்ந்து குடியேற்றமுள்ள பழமையான நகரங்களில் ஒன்று (கி.மு. 782); ரோஜா நிற எரிமலைக் கல்லால் கட்டப்பட்டது; காஸ்கேடின் மேடைகளிலிருந்து அரராத் மலை கண்டிகையை நிரப்புகிறது.',
  },
  sevan: {
    name: 'செவான் ஏரி',
    region: 'கெகார்குனிக்',
    country: 'ஆர்மீனியா',
    summary:
      'ஆர்மீனியாவின் நீலக் கண் — மலைமேட்டிலுள்ள பரந்த ஏரி; அதன் தீபகற்ப மடாலயம் செவானாவாங்க் கி.பி. 874 முதல் நீரைக் கண்டு நிற்கிறது.',
  },
  dilijan: {
    name: 'திலிஜான்',
    region: 'தாவுஷ்',
    country: 'ஆர்மீனியா',
    summary:
      '"ஆர்மீனிய சுவிட்சர்லாந்து" எனப்படும் காடுபோன்ற மலைநகரம்; பீச் காடுகளில் மறைந்திருக்கும் இடைக்கால மடாலயங்கள் ஹகார்த்சின், கோஷாவாங்க் ஆகியவற்றின் நுழைவாயில்.',
  },
  kandy: {
    name: 'கண்டி',
    region: 'மத்திய மாகாணம்',
    country: 'இலங்கை',
    summary:
      'இலங்கையின் கடைசி அரச தலைநகர்; ஏரியைச் சுற்றி அமைந்து, தீவின் மிகப் புனிதத் தலமான புனிதப் பல் பண்டைக் கோயிலைக் காவல் காக்கிறது.',
  },
  anuradhapura: {
    name: 'அனுராதபுரம்',
    region: 'வட மத்திய',
    country: 'இலங்கை',
    summary:
      '1,300 ஆண்டுகள் இலங்கையின் தலைநகர்: பிரமாண்டச் செங்கல் தாகோபாக்கள், போத்கயாவிலுள்ள மூல மரத்திலிருந்து வளர்ந்த புனித போதி மரம், காட்டில் ஆசிரம இடிபாடுகள்.',
  },
  ella: {
    name: 'எல்ல',
    region: 'ஊவா மாகாணம்',
    country: 'இலங்கை',
    summary:
      'தேயிலைத் தோட்டங்களின் மேலுள்ள மலைநாட்டுக் கிராமம்; ஒன்பது வளைவுகள் பாலம் நீல இரயில்களைப் பனிமூட்டத்தில் தெமொதாராவுக்குக் கொண்டு செல்கிறது.',
  },
  rome: {
    name: 'ரோம்',
    region: 'லாசியோ',
    country: 'இத்தாலி',
    summary:
      'ஒரே தெருவில் இருபத்தெட்டு நூற்றாண்டுகள்: கொலோசியமும் ஃபோரமும், பாந்தியனின் கச்சிதமான குவிமாடம், பெர்னினியின் சதுக்கங்கள், டைபருக்கு அப்பால் வாதிக்கன்.',
  },
  prague: {
    name: 'பிராக்',
    region: 'பொஹீமியா',
    country: 'செக்கியா',
    summary:
      'நூறு கோபுரங்களின் நகரம் — விடியற்காலையில் சார்லஸ் பாலம், வில்தாவாவின் மேல் கோட்டை, இருபதாம் நூற்றாண்டை முழுமையாக உயிர்வாழ்ந்த கோதிக் பழைய நகரம்.',
  },
  granada: {
    name: 'கிரனாடா',
    region: 'அந்தலூசியா',
    country: 'எசுப்பானியா',
    summary:
      'அல்-அந்தலூசின் கடைசி அமீரகம்; அல்ஹம்ப்ராவால் முடிசூட்டப்பட்டது — சியரா நெவாடாவின் கீழ் செதுக்கப்பட்ட சுதை நஸ்ரித் அரண்மனைகளும் நீர் முற்றங்களும்.',
  },
  athens: {
    name: 'ஏதன்ஸ்',
    region: 'அட்டிகா',
    country: 'கிரீஸ்',
    summary:
      'உயிரோட்டமுள்ள நகரின் மேல் அக்ரோபொலிஸ்: பார்த்தினன், ஜனநாயகம் தன்னை விவாதித்து உருவாக்கிக் கொண்ட அகோரா, பிளாகாவின் சந்துகளில் உணவகங்கள்.',
  },
};

/** Tamil versions of the long-form story essays. */
export interface StoryTa {
  title: string;
  time: string;
  lede: string;
  body: string[];
}

export const storiesTa: Record<string, StoryTa> = {
  'sacred-geography-kaveri': {
    title: 'காவேரியின் புனித நிலப்படம்',
    time: '5 நிமிட வாசிப்பு',
    lede: 'இந்தியாவின் ஒவ்வொரு நதியும் ஒரு தேவி; ஆனால் காவேரி ஒரு வாதமும் கூட — நீர் பற்றியும், பேரரசு பற்றியும், தென்னாட்டின் மாபெரும் கோயில்கள் ஏன் அங்கங்கேயே நிற்கின்றன என்பது பற்றியும்.',
    body: [
      'தலைகாவேரியிலிருந்து கிழக்கே காவேரியைப் பின்தொடர்ந்தால், தென்னிந்தியப் புனித வரலாற்றின் அச்சையே கிட்டத்தட்ட நீங்கள் பின்தொடர்கிறீர்கள். ஸ்ரீரங்கப்பட்டினத்தில் நதி டிப்புவின் தீவுக் கோட்டையைச் சுற்றிப் பிரிகிறது; ஸ்ரீரங்கத்தில் பூமியின் மிகப்பெரிய கோயில் நகரைச் சுற்றி மீண்டும் பிரிகிறது; கும்பகோணம் முதல் கடல் வரை, சராசரியாக ஒவ்வொரு சில கிலோமீட்டருக்கும் ஒரு சோழர் கோயில் எழும் டெல்டாவின் வழியே நூல்போலச் செல்கிறது.',
      'இது தற்செயல் அல்ல. தஞ்சாவூர், கங்கைகொண்ட சோழபுரம், தாராசுரம் ஆகியவற்றின் விமானங்களுக்குப் பணம் கொடுத்த நெல் களஞ்சியமே காவேரி டெல்டா. ஒவ்வொரு நதி நாகரிகமும் கற்கும் பாடத்தைச் சோழர் மன்னர்கள் அறிந்திருந்தார்கள்: நீரைக் கட்டுப்படுத்தினால் நித்தியத்தை வாங்கலாம். ஆயிரம் ஆண்டுகளுக்குப் பின்னும் செயல்படும் அவர்களின் அணைக்கட்டுகளும் கோயில்களும் ஒரே நிர்வாகத்தின் இரு முகங்கள்.',
      'ஸ்ரீரங்கத்தில் இந்த உறவு நேரடியானது. காவேரிக்கும் அதன் கிளைநதி கொள்ளிடத்திற்கும் இடையிலுள்ள தீவில் கோயிலின் ஏழு பிரகாரங்கள் அமைந்துள்ளன — தெய்வத்தை அடைய பக்தர் இருமுறை நீரைக் கடக்க வேண்டும். நதியே முதல் பிரகாரம்.',
      'விடியற்காலையில் பாலத்தின் மேல் நின்றால் முழு நிலத்திடலின் யுக்தி தன்னை அறிவிக்கிறது: நீர், நெல், கோயில், நகரம். காவேரியின் புனித நிலப்படம் பொருளாதாரத்தின் மேல் பூசப்பட்ட மாயையல்ல; வழிபாடாக நினைவில் கொள்ளப்பட்ட பொருளாதாரம்.',
    ],
  },
  'night-in-konya': {
    title: 'கொன்யாவில் ஓர் இரவு',
    time: '6 நிமிட வாசிப்பு',
    lede: 'பச்சைக் குவிமாடம் இரவுவரை ஒளிர்கிறது. மூவாயிரம் ஆண்டுகளாக ஏதேனும் ஒரு வடிவில் ஜெபித்துக் கொண்டிருக்கும் நகரில், அதன் கீழ் ரூமி இரவுக்குப் பின்னும் விருந்தினர்களை வரவேற்கிறார்.',
    body: [
      'சுற்றுலாப் பேருந்துகள் சென்ற பின், முற்றம் பூனைகளுக்கும் அவற்றுக்கு உணவிடும் வயதானவர்களுக்கும் சொந்தமாகும் நீல நேரத்தில் மெவ்லானா அருங்காட்சியகத்தை அடைந்தேன். ரூமியின் கல்லறைக்கு மேலுள்ள குழல்வடிவ பர்கீசு நிறக் குவிமாடம் — குப்பே-இ ஹத்ரா, பச்சைக் குவிமாடம் — நகரில் வேறெதையும் விட நீளமாக ஒளியைப் பிடித்து வைக்கிறது; நாள் முடிவதை விட்டுவிட விரும்பாதவனைப் போல.',
      'உள்ளே சூழ்நிலை அருங்காட்சியகம் அல்ல — திருத்தலம். பிரமாண்ட தலைப்பாகை அணிந்த பெரிய பெட்டிக்கல்லறைக்கு முன் வருவோர் அமைதியாக அழுகிறார்கள். மூப்பது ஆண்டுகள் அங்கு பணியாற்றிய காவலர் ஒருவர், இரவு ஷிஃப்ட்தான் எல்லோருக்கும் விருப்பமானது என்றார்: "பகலில் அவர்கள் படம் பிடிக்கிறார்கள். இரவில் அவருடன் பேசுகிறார்கள்."',
      'கொன்யா இரவில் உலவுபவனுக்கு வெகுமதி தருகிறது. இன்செ மினாரே மதரசாவின் செல்யுக் நுழைவாயில்கள் இருட்டில் வெளிச்சமூட்டப்பட்டு நிற்கின்றன; நகரின் பழமையான தரையான அலாயெத்தின் மலை தேநீர் குடிக்கும் குடும்பங்களால் நிரம்புகிறது. துருக்கியில் வேறெங்கும் பதின்மூன்றாம் நூற்றாண்டு இவ்வளவு சாதாரணமாக நடமாடுவதில்லை.',
      'நள்ளிரவுக்கு அருகில் அருங்காட்சியகத்தைக் கடந்து நடந்து திரும்பினேன். குவிமாடம் இன்னும் ஒளிர்ந்தது. ஒவ்வொரு இரவும் ஒளிர்கிறது. சில நகரங்கள் தம் இறந்தவர்களுக்காக விளக்கேற்றி வைக்கின்றன; கொன்யா, மரணம் திருமண இரவு மட்டுமே — ஷெப்-இ அரூஸ் — என எழுதிய மனிதனுக்காக விளக்கேற்றுகிறது; எண்ணூறு ஆண்டுகளுக்குப் பின்னும் நகரமே அந்தத் திருமணத்திற்கு வருகிறது.',
    ],
  },
  'last-sculptor-mamallapuram': {
    title: 'மாமல்லபுரத்தின் கடைசி சிற்பி',
    time: '7 நிமிட வாசிப்பு',
    lede: 'பஞ்ச ரதங்களுக்குப் பின்னுள்ள கொட்டகையில், நாற்பது தலைமுறைகளாகக் கல் செதுக்கும் குடும்பத்தைச் சேர்ந்த ஒருவர், பதின்மூன்று நூற்றாண்டுகளாகச் சுத்தியல் ஏன் மாறவில்லை என விளக்குகிறார்.',
    body: [
      'தெருவைவிட ஒலி முன்னரே உங்களை அடைகிறது: டிக்-டிக்-டிக் — ஒரு டஜன் பட்டறைகள் சற்று வேறுபட்ட தாளத்தில். கி.பி. 630-களில் பல்லவர் மன்னர் நரசிம்மவர்மன் பளிங்குப் பாறைகள் மீது கல்தச்சர்களை ஏவியதில் இருந்து இஒலியை மாமல்லபுரம் தொடர்ந்து கேட்டு வருகிறது.',
      'ஸ்தபதிகள் — வம்சாவழி கோயில் சிற்பிகள் — இன்றும் பழைய முறையில் பயிற்சி பெறுகிறார்கள்: கல்லுக்கு முன் ஆண்டுகள் வரைதல்; முடிச்செதுக்கலுக்கு முன் ஆண்டுகள் கரடு வேலை; தெய்வத்தின் அளவுகோல்கள் அளவிடப்படாமல் சில்ப சாஸ்திரத்திலிருந்து மனனம் செய்யப்படுகின்றன. "அளவுகள் கையில் உள்ளன" என்றார் ஒரு மாஸ்தர் — தான் வேலை செய்யும் பாறை போலவே தடித்த தன் உள்ளங்கையை உயர்த்திக் காட்டி.',
      'மாறியிருப்பது சந்தை. பல்லவர் கோயில்களை ஆர்டர் செய்தார்கள்; இன்றைய ஆர்டர்கள் தோட்ட விநாயகர்களும் ஏற்றுமதி நடராஜர்களும். பெரிய ஆணைகள் — புதுப்பிக்கப்படும் கோபுரம், பழைய பாணியில் புதிய கோயில் — இப்போது அரிதில் வருகின்றன; ஒவ்வொன்றும் ஆண்டுகளுக்கு நகரின் சிறந்த கைகளை வெறிதாக்குகிறது.',
      'மீனவர்கள் தங்களைக் கடைசி மீனவர்கள் என அழைப்பதுபோல அவர் தன்னைக் கடைசி சிற்பி என்கிறார் — பாதி புகார், பாதி பெருமை. பொறியியல் பட்டத்துடன் வீடு திரும்பிய அவரது மகன், கொட்டகை மூலையில் சிறிய நந்தியை முடித்துக் கொண்டிருந்தான். சிறுவனின் கையிலிருந்த சுத்தியல் அவரது பாட்டனுடையது என தந்தை சுட்டிக்காட்டினார். மாமல்லபுரத்தின் ஒலி தொடர்கிறது.',
    ],
  },
  'kyoto-in-winter': {
    title: 'குளிர்காலத்தில் கியோட்டோ',
    time: '4 நிமிட வாசிப்பு',
    lede: 'பனி கூட்டத்தையும் நிறத்தையும் கழட்டிவிடுகிறது; கியோட்டோவில் மீதமிருப்பது அதன் எலும்புக்கூடு: கூரைக் கோடுகள், கல், தூபம், கோயில் தோட்டங்களில் நீர் எழுப்பும் ஒலி.',
    body: [
      'காலை ஏழுக்கு முன் நினென்சாகா சந்திலிருந்து படம்பிடிக்கப்படும் புதுப் பனியில் யசாகா பகோடா — அஞ்சல் அட்டைகளின் கியோட்டோதான்; வேறுபாடு என்னவென்றால், குளிர்காலத்தில் அதைத் தனியாக வைத்திருக்கலாம்.',
      'ரியோன்-ஜியில், கரெசன்சுயி தோட்டத்தின் பதினைந்து கற்கள் சரளைக்குப் பதிலாக வெண்மை வயலில் அமர்கின்றன; தோட்டம் எப்போதும் சொல்ல வந்ததை இப்போது காட்டுகிறது: கற்கள் அல்ல, கற்கள் காத்து வைக்கும் இடைவெளிதான் கரு.',
      'பத்து மணிக்குள் கூட்டம் திரும்புகிறது. குளிர்காலக் கியோட்டோவின் தந்திரம் வெறுமனே கோயில் நேரப்படி வாழ்வதுதான் — விடியற்காலையில் வெளியே, நீண்ட மதிய உணவுக்கு உள்ளே, ஈரப்பட்ட முன்கூரைகளில் ஒளி பழைய தங்க நிறமாகும் கடைசி மணி நேரத்திற்கு மீண்டும் வெளியே.',
      'பருவம் திருப்பித் தருவது அமைதி. பொழுதுபோகும் கியோனில், ஒரு தெரு தள்ளி கெய்கோவின் காலடி ஒலியைக் கல்லின் மேல் கேட்கலாம். கோடையில் இந்நகரம் சுற்றுலாவிற்கான அழகிய இயந்திரம். குளிர்காலத்தில், மின்சாரம் நிறைந்த ஒரு பன்னிரண்டாம் நூற்றாண்டுத் தலைநகர்.',
    ],
  },
  'conversations-silk-route': {
    title: 'பட்டுப் பாதையிலிருந்து உரையாடல்கள்',
    time: '6 நிமிட வாசிப்பு',
    lede: 'புகாரா, சமர்கந்த், கொன்யா ஆகியவற்றின் சாய்கானாக்களில், பட்டுப் பாதை வரலாற்றுப் பாடமல்ல. அடுத்த மேசையிலிருக்கும் மூதாட்டி, இன்னொரு தேநீர் குடிக்க வேண்டும் என வற்புறுத்துவதுதான் அது.',
    body: [
      'புதுப்பிக்கப்பட்ட மதரசாக்களில் அல்ல — அவை எவ்வளவு அற்புதமாக இருந்தாலும் — சாய்கானாவில்தான், தேநீர் வீட்டில்தான், பட்டுப் பாதை உஸ்பெகிஸ்தானில் உயிர்வாழ்கிறது; ஊர்திகளுக்காக அமைக்கப்பட்டதுபோலவே இன்றும் அமைந்திருக்கிறது: தாழ்ந்த மேசைகள், முடிவிலா குடங்கள், அந்நியர்கள் ஒன்றாக அமர்தல் — பயணிகள் அதற்காகத்தானே.',
      'புகாராவில் அன்வார் என்ற முதிய வெள்ளிச் செதுக்குவோர், தன் குடும்பம் பதினொரு தலைமுறைகளாக அதே தெருவில் வேலை செய்து வருவதாகவும், சுற்றுலாப் பயணிகள் வெறுமனே வாணிகர்களின் இடத்தைப் பிடித்திருப்பதாகவும் சொன்னார். "முன்பு, கத்திகளை வாங்கிக் குதிரையில் சென்றார்கள். இப்போது கத்திகளை வாங்கி விமானத்தில் செல்கிறார்கள். தெருவிற்குக் கவலையில்லை."',
      'தேநீர் வீட்டுப் பேச்சு ஒரு பழைய பொருளாதாரத்தில் ஓடுகிறது: தகவல், வதந்தி, பாதை செய்திகள். சமர்கந்தில் அமர்ந்து ஒரு மணி நேரத்திற்குள் எந்த எல்லைக் கடவை மெதுவானது, எந்த சேர்-டாக்ஸி ஓட்டுநர் அதிகம் வசூலிக்கிறார், நான் ஒருபோதும் செல்லாத மூன்று நகரங்களில் யார் மகள் யார் மகனை மணக்கிறாள் எனத் தெரிந்துவிட்டது.',
      'பாதையின் உண்மையான நினைவுச்சின்னம் இதுவே — ஓட்டுகள் அல்ல, ஒழுங்குமுறை. புழுதி படிந்து வந்து திருப்தியுடன் புறப்பட்ட இரண்டாயிரம் ஆண்டுகளின் அந்நியர்கள். தேநீர் இன்னும் சூடாக உள்ளது, மேசை இன்னும் தாழ்வாக உள்ளது, மூதாட்டிகள் இன்னும் வற்புறுத்துகிறார்கள்: இன்னொன்று. பாதை நீளமானது. அமருங்கள்.',
    ],
  },
};

/** Tamil names/blurbs for destinations (keyed by destination id). */
export const destTa: Record<string, { name: string; places: string; blurb: string }> = {
  india: { name: 'இந்தியா', places: '2,154 இடங்கள்', blurb: 'கோயில் நகரங்கள், காட்கள், உயிரோட்டமுள்ள சடங்குகள்' },
  japan: { name: 'ஜப்பான்', places: '487 இடங்கள்', blurb: 'பகோடாக்கள், யாத்திரைப் பாதைகள், அமைதியான பருவங்கள்' },
  turkey: { name: 'துருக்கி', places: '358 இடங்கள்', blurb: 'ஒரே சந்திப்பில் அடுக்கப்பட்ட பேரரசுகள்' },
  armenia: { name: 'ஆர்மீனியா', places: '152 இடங்கள்', blurb: 'ஆழமான பள்ளத்தாக்குகளின் மேல் கல் மடாலயங்கள்' },
  srilanka: { name: 'இலங்கை', places: '312 இடங்கள்', blurb: 'கோட்டைகள், தேயிலை நாடு, மெல்லோடும் இரயில்கள்' },
  europe: { name: 'ஐரோப்பா', places: '1,025 இடங்கள்', blurb: 'கால்வாய்கள், பேராலயங்கள், பழைய சதுக்கங்கள்' },
};

/** Tamil names for states and districts (keyed by id). */
export const hierarchyTa: Record<string, string> = {
  'tamil-nadu': 'தமிழ்நாடு',
  'andhra-pradesh': 'ஆந்திரப் பிரதேசம்',
  thanjavur: 'தஞ்சாவூர்',
  madurai: 'மதுரை',
  chengalpattu: 'செங்கல்பட்டு',
  tiruchirappalli: 'திருச்சிராப்பள்ளி',
  chittoor: 'சித்தூர்',
};

/** Tamil journey cards (keyed by English title). */
export const journeysTa: Record<string, { title: string; meta: string; note: string }> = {
  'Japan 2024': {
    title: 'ஜப்பான் 2024',
    meta: '12 நாட்கள் · 6 நகரங்கள் · 42 இடங்கள்',
    note: 'பழைய தோக்கைதோ வழியே டோக்கியோ முதல் ஹிரோஷிமா வரை — இலையுதிர்காலப் பகோடாக்கள், கோயில் தங்குமிடத்தில் ஓர் இரவு.',
  },
  'Turkey 2023': {
    title: 'துருக்கி 2023',
    meta: '10 நாட்கள் · 8 நகரங்கள் · 31 இடங்கள்',
    note: 'பொஸ்போரசில் இருந்து கப்படோக்கியா வரை — பைசாந்தியம், செல்யுக்குகள், ஒட்டோமான்களைத் தடமறிந்து.',
  },
  'Armenia 2023': {
    title: 'ஆர்மீனியா 2023',
    meta: '7 நாட்கள் · 5 நகரங்கள் · 18 இடங்கள்',
    note: 'யெரெவானிலிருந்து செவான், திலிஜான் வழியே தாதெவின் கேபிள்காருக்கும் அமைதிக்கும் ஒரு சுற்று.',
  },
};

/** Tamil labels for the hero's popular search chips. */
export const popularTa: Record<string, string> = {
  'Chola Temples': 'சோழர் கோயில்கள்',
  'Buddhist Sites': 'புத்தத் தளங்கள்',
  Japan: 'ஜப்பான்',
  Turkey: 'துருக்கி',
  Armenia: 'ஆர்மீனியா',
};
