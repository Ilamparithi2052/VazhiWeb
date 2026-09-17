/** Wiki content: place articles, destination hierarchy (states → districts → places), story essays. */

/** Rich text: HTML string; legacy static entries use paragraph arrays. */
export type RichBody = string | string[];

export interface WikiSection {
  heading: string;
  body: RichBody;
}

export interface WikiFact {
  label: string;
  value: string;
}

/** A credited contributor (guide, photographer, local expert…) on a page. */
export interface Contributor {
  name: string;
  role?: string;
  bio?: string;
  photo?: string;
  link?: string;
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
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  contributors?: Contributor[];
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
  body: RichBody;
  seriesSlug?: string | null;
  relatedPlaces?: string[];
  contributors?: Contributor[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
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
