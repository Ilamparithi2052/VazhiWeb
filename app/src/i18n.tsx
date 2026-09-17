import { createContext, useContext, useEffect, useState } from 'react';

export type Lang = 'en' | 'ta';

const dict = {
  en: {
    // nav
    'nav.explore': 'Explore',
    'nav.destinations': 'Destinations',
    'nav.heritage': 'Heritage',
    'nav.journeys': 'Journeys',
    'nav.stories': 'Stories',
    'nav.atlas': 'Atlas',
    'nav.tagline': 'Travel · Heritage · Stories',
    'nav.search': 'Search',
    'nav.saved': 'Saved places',
    'nav.theme': 'Switch between light and dark mode',
    'nav.lang': 'Change language',
    'nav.about': 'About',
    'nav.profile': 'Your profile',
    // explore mega menu
    'menu.topics': 'Topics',
    'menu.latest': 'Latest stories',
    'menu.featured': 'Featured',
    'menu.allDest': 'All destinations',
    'menu.allStories': 'All stories',
    'menu.interests': 'Interests',
    'menu.recent': 'Recently added',
    // sign-in modal
    'signin.open': 'Sign in',
    'signin.eyebrow': 'Membership',
    'signin.title': 'Sign in to Vazhi',
    'signin.sub': 'Save places across devices, follow journeys and get the monthly letter.',
    'signin.tabSocial': 'Social login',
    'signin.tabOtp': 'One-time code',
    'signin.kimi': 'Continue with Kimi',
    'signin.google': 'Continue with Google',
    'signin.facebook': 'Continue with Facebook',
    'signin.contactLabel': 'Email or phone',
    'signin.contactPh': 'you@example.com or +91 …',
    'signin.sendCode': 'Send code',
    'signin.codeLabel': '6-digit code',
    'signin.verify': 'Verify & sign in',
    'signin.close': 'Close',
    'signin.providerSoon': '{provider} sign-in is being connected — it will switch on as soon as the provider keys are configured.',
    'signin.otpSoon': 'Code delivery is being connected — OTP sign-in will switch on once the mail/SMS provider is configured.',
    'signin.legal': 'By continuing you agree to the Vazhi guidelines. Saved places stay in this browser until you sign in.',
    // search overlay
    'search.ph': 'Search places, stories, destinations…',
    'search.places': 'Places',
    'search.stories': 'Stories',
    'search.dests': 'Destinations',
    'search.empty': 'No matches — try a place, a story or a country.',
    'search.hint': 'Type to search the whole atlas · Esc to close',
    'search.recent': 'Recent searches',
    // profile
    'profile.traveller': 'Traveller',
    'profile.sub': 'Saved in this browser only',
    'profile.saved': 'Saved places',
    'profile.recent': 'Recently viewed',
    'profile.emptySaved': 'No saved places yet — tap “Save” on any place page.',
    'profile.emptyRecent': 'Places you open will appear here.',
    // place page
    'place.save': 'Save',
    'place.saved': 'Saved',
    // about page
    'about.eyebrow': 'About Vazhi',
    'about.title': 'A travel wiki, kept like a journal.',
    'about.p1':
      'Vazhi — வழி, “the way” — is a personal atlas and travel wiki: a slowly growing record of places, histories, cultures and journeys, written on the road rather than assembled from brochures.',
    'about.p2':
      'Every place gets a full article — its history, its architecture, and the practical notes that only come from standing there. The atlas beneath them is organised the way a country actually is: destinations open into maps, maps into states and districts, districts into places.',
    'about.p3':
      'The stories sit beside the places: essays, field notes, photo essays and conversations — the texture of travel that a fact box cannot hold. Journeys trace whole routes across the map, day by day.',
    'about.p4':
      'This is an independent project, written in two languages and set down slowly. New places are added as they are walked — not before.',
    'about.statPlaces': 'Places documented',
    'about.statCountries': 'Countries',
    'about.statJourneys': 'Journeys mapped',
    'about.statStories': 'Stories written',
    'about.howTitle': 'How the atlas is organised',
    'about.how1t': 'Destinations',
    'about.how1d': 'Each country opens as an interactive map of every documented place.',
    'about.how2t': 'States → Districts',
    'about.how2d': 'Maps drill down through states and districts, the way the land is actually arranged.',
    'about.how3t': 'Places & stories',
    'about.how3d': 'Every place is a full article; essays and journeys weave them together.',
    'about.cta': 'Start exploring',
    // hero
    'hero.eyebrow': 'A travel wiki · A personal atlas',
    'hero.h1a': 'Discover places.',
    'hero.h1b': 'Understand their stories.',
    'hero.h1c': 'Walk through time.',
    'hero.sub':
      'A travel wiki and personal atlas of places, histories, cultures and journeys — written slowly, on the road.',
    'hero.searchPh': 'Search places, people, cultures, histories…',
    'hero.popular': 'Popular:',
    'hero.featured': 'Featured place',
    'hero.featuredMeta': 'Thanjavur, India · Built 1010 CE',
    'cta.explore': 'Explore',
    // atlas
    'atlas.eyebrow': 'The Atlas',
    'atlas.title': "Explore the world you've seen and the stories that shaped it.",
    'atlas.cta': 'Open interactive map',
    // filters
    'filter.All Places': 'All Places',
    'filter.Visited': 'Visited',
    'filter.Heritage': 'Heritage',
    'filter.Nature': 'Nature',
    'filter.Cities': 'Cities',
    'filter.Temples': 'Temples',
    'filter.Culture': 'Culture',
    'filter.Stories': 'Stories',
    // sections
    'sect.dest.eyebrow': 'Destinations',
    'sect.dest.title': 'Explore places across the world',
    'sect.dest.link': 'View all destinations',
    'sect.heritage.eyebrow': 'Heritage',
    'sect.heritage.title': 'Discover our cultural legacy',
    'sect.heritage.link': 'Explore all heritage',
    'sect.journeys.eyebrow': 'Journeys',
    'sect.journeys.title': 'Follow the road',
    'sect.journeys.link': 'View all journeys',
    'sect.stories.eyebrow': 'Stories',
    'sect.stories.title': 'Travel beyond places',
    'sect.stories.link': 'View all stories',
    'sect.recent.eyebrow': 'Recently added',
    'sect.recent.title': 'New in the atlas',
    'sect.recent.link': 'View all',
    'interests.eyebrow': 'Explore by interest',
    // heritage kinds
    'heritage.Temples': 'Temples',
    'heritage.Forts': 'Forts',
    'heritage.Caves': 'Caves',
    'heritage.Ancient Cities': 'Ancient Cities',
    'heritage.Sculpture': 'Sculpture',
    'heritage.Inscriptions': 'Inscriptions',
    'heritage.Sacred Places': 'Sacred Places',
    'heritage.UNESCO Sites': 'UNESCO Sites',
    // interests
    'interest.History': 'History',
    'interest.Architecture': 'Architecture',
    'interest.Art & Sculpture': 'Art & Sculpture',
    'interest.Food': 'Food',
    'interest.Nature': 'Nature',
    'interest.Religion': 'Religion',
    'interest.Fests & Culture': 'Fests & Culture',
    'interest.Literature': 'Literature',
    'interest.Archaeology': 'Archaeology',
    // footer
    'footer.join': 'Join the journey',
    'footer.sub': 'Stories, places and journeys in your inbox. One letter a month, no noise.',
    'footer.done': 'Welcome aboard — the next letter reaches you soon.',
    'footer.emailPh': 'Enter your email',
    'footer.subscribe': 'Subscribe',
    'footer.privacy': 'We only write when there is something worth reading. No spam, unsubscribe anytime.',
    'footer.waTitle': 'Vazhi on WhatsApp',
    'footer.waSub': 'Follow our channel — new places and field notes, straight to your phone.',
    'footer.waShort': 'Follow our WhatsApp channel',
    'footer.blurb':
      'A travel wiki and personal atlas documenting places, histories, cultures and journeys across time and space.',
    'footer.rights': '© 2026 வழி (Vazhi). All rights reserved.',
    'footer.colophon': 'Written on the road · Set in Cormorant & Inter',
    'col.Explore': 'Explore',
    'col.Destinations': 'Destinations',
    'col.Heritage': 'Heritage',
    'col.Journeys': 'Journeys',
    'col.Stories': 'Stories',
    'col.More': 'More',
    'item.All Places': 'All Places',
    'item.Map': 'Map',
    'item.Categories': 'Categories',
    'item.Recently Added': 'Recently Added',
    'item.Countries': 'Countries',
    'item.States': 'States',
    'item.Cities': 'Cities',
    'item.Regions': 'Regions',
    'item.Temples': 'Temples',
    'item.Forts': 'Forts',
    'item.Caves': 'Caves',
    'item.Archaeology': 'Archaeology',
    'item.My Journeys': 'My Journeys',
    'item.Road Trips': 'Road Trips',
    'item.Pilgrimages': 'Pilgrimages',
    'item.Treks': 'Treks',
    'item.Essays': 'Essays',
    'item.Field Notes': 'Field Notes',
    'item.Photo Essays': 'Photo Essays',
    'item.Interviews': 'Interviews',
    'item.About': 'About',
    'item.Guidelines': 'Guidelines',
    'item.Contact': 'Contact',
    // breadcrumbs
    'crumb.home': 'Home',
    'crumb.destinations': 'Destinations',
    'crumb.stories': 'Stories',
    'crumb.notFound': 'Not found',
    // map panel
    'map.footer': '{n} mapped places · tap a marker to open its page',
    'map.loading': 'Drawing the map…',
    'map.legend': 'Place',
    // destination page
    'dest.eyebrow': 'Destination',
    'dest.docSuffix': 'documented in the atlas.',
    'dest.statesChip': '{n} States / Regions',
    'dest.placesChip': '{n} Places mapped',
    'dest.browse': 'Browse by state',
    'dest.hierarchy': 'States → districts → places.',
    'dest.districts': '{n} districts',
    'dest.district': '{n} district',
    'dest.places': '{n} places',
    'dest.placesIn': 'Places in {name}',
    'dest.notFound': 'Destination not found',
    'dest.allDest': '← All destinations',
    'destindex.blurb':
      'Choose a destination to open its atlas — an interactive map of documented places, and the states and districts beneath it.',
    // state page
    'state.docNote': '{n} districts documented · choose a district to see its places.',
    'state.placesInAtlas': '{n} places in the atlas',
    'state.placeInAtlas': '{n} place in the atlas',
    'state.notFound': 'State not found',
    // district page
    'district.note': 'Each place opens as a full atlas article.',
    'district.readArticle': 'Read the article →',
    'district.notFound': 'District not found',
    // place page
    'place.glance': 'At a glance',
    'place.related': 'Related places',
    'place.back': '← Back to the atlas',
    'place.notFound': 'Place not found',
    'place.expandMap': 'Expand',
    'place.directions': 'Get Directions',
    'place.nearby': 'Nearby Places',
    'place.guideEyebrow': 'Explore the destination guide',
    'place.guideTitle': '{dest}',
    'place.guideCounts': '{places} places · {stories} stories',
    'place.guideCta': 'Open the guide',
    'contrib.heading': 'Contributors',
    'band.kicker': 'Join Vazhi',
    'band.title': 'Travel with us — and help map what remains',
    'band.sub': 'Share your knowledge of places, rituals and histories — or support the atlas with a donation. Every field note keeps a memory alive.',
    'band.cta': 'Contribute or donate',
    'band.formTitle': 'Contribute to Vazhi',
    'band.formSub': 'Tell us how you would like to help — we read every note.',
    'band.fName': 'Your name',
    'band.fNamePh': 'Name',
    'band.fContact': 'Email or WhatsApp number',
    'band.fContactPh': 'you@example.com / +91 …',
    'band.fKind': 'I would like to',
    'band.kind.knowledge': 'Share knowledge',
    'band.kind.donation': 'Support with a donation',
    'band.kind.both': 'Both',
    'band.fMsg': 'Your note',
    'band.fMsgPh': 'A place you know well, a correction, a story to tell…',
    'band.fLink': 'Link (optional — profile, portfolio, reference)',
    'band.send': 'Send',
    'band.sending': 'Sending…',
    'band.cancel': 'Cancel',
    'band.close': 'Close',
    'band.doneTitle': 'Thank you',
    'band.doneSub': 'Your note has reached us. We will write back soon.',
    'band.err': 'Something went wrong — please try again.',
    // stories
    'storiesindex.blurb': 'Essays, field notes, photo essays and conversations gathered on the road.',
    'series.eyebrow': 'Series',
    'series.title': 'Travel stories told in parts',
    'series.blurb': 'Longer wanderings gathered into collections — open a series to read every story in it, from the first note to the last.',
    'series.count': '{count} stories',
    'series.one': '1 story',
    'series.cta': 'Read the series',
    'seriespage.back': 'All stories',
    'pager.prev': 'Prev',
    'pager.next': 'Next',
    'pager.of': 'of',
    'story.written': 'Written on the road',
    'story.fromAtlas': 'From the atlas',
    'story.openPlace': 'Open place →',
    'story.more': 'More stories',
    'story.notFound': 'Story not found',
    // types & tags
    'type.Heritage': 'Heritage',
    'type.City': 'City',
    'type.Nature': 'Nature',
    'tag.Essay': 'Essay',
    'tag.Field Notes': 'Field Notes',
    'tag.History': 'History',
    'tag.Photo Essay': 'Photo Essay',
    'tag.People': 'People',
    // language
    'lang.en': 'English',
    'lang.ta': 'தமிழ்',
  },
  ta: {
    // nav
    'nav.explore': 'ஆராய்க',
    'nav.destinations': 'இலக்குகள்',
    'nav.heritage': 'பாரம்பரியம்',
    'nav.journeys': 'பயணங்கள்',
    'nav.stories': 'கதைகள்',
    'nav.atlas': 'நிலப்படம்',
    'nav.tagline': 'பயணம் · பாரம்பரியம் · கதைகள்',
    'nav.search': 'தேடுக',
    'nav.saved': 'சேமித்த இடங்கள்',
    'nav.theme': 'ஒளி / இருள் நிலையை மாற்றுக',
    'nav.lang': 'மொழியை மாற்றுக',
    'nav.about': 'பற்றி',
    'nav.profile': 'உங்கள் சுயவிவரம்',
    // explore mega menu
    'menu.topics': 'தலைப்புகள்',
    'menu.latest': 'புதிய கதைகள்',
    'menu.featured': 'சிறப்பு',
    'menu.allDest': 'அனைத்து இலக்குகளும்',
    'menu.allStories': 'அனைத்துக் கதைகளும்',
    'menu.interests': 'ஆர்வங்கள்',
    'menu.recent': 'சமீபத்தில் சேர்ந்தவை',
    // sign-in modal
    'signin.open': 'உள்நுழைக',
    'signin.eyebrow': 'உறுப்பினர்',
    'signin.title': 'வழியில் உள்நுழைக',
    'signin.sub': 'இடங்களைச் சாதனங்களில் சேமிக்கவும், பயணங்களைப் பின்தொடரவும், மாதாந்திரக் கடிதம் பெறவும்.',
    'signin.tabSocial': 'சமூக உள்நுழைவு',
    'signin.tabOtp': 'ஒருமுறை குறியீடு',
    'signin.kimi': 'Kimi மூலம் தொடர்க',
    'signin.google': 'Google மூலம் தொடர்க',
    'signin.facebook': 'Facebook மூலம் தொடர்க',
    'signin.contactLabel': 'மின்னஞ்சல் அல்லது தொலைபேசி',
    'signin.contactPh': 'you@example.com அல்லது +91 …',
    'signin.sendCode': 'குறியீடு அனுப்புக',
    'signin.codeLabel': '6-இலக்கக் குறியீடு',
    'signin.verify': 'சரிபார்த்து உள்நுழைக',
    'signin.close': 'மூடுக',
    'signin.providerSoon': '{provider} உள்நுழைவு இணைக்கப்பட்டு வருகிறது — வழங்குநர் சாவிகள் அமைக்கப்பட்டவுடன் இயங்கும்.',
    'signin.otpSoon': 'குறியீடு வழங்கல் இணைக்கப்பட்டு வருகிறது — மின்னஞ்சல்/SMS வழங்குநர் அமைக்கப்பட்டவுடன் OTP உள்நுழைவு இயங்கும்.',
    'signin.legal': 'தொடர்வதன் மூலம் வழி வழிகாட்டுதல்களை ஏற்கிறீர்கள். உள்நுழையும் வரை சேமித்த இடங்கள் இந்த உலாவியிலேயே இருக்கும்.',
    // search overlay
    'search.ph': 'இடங்கள், கதைகள், இலக்குகளைத் தேடுக…',
    'search.places': 'இடங்கள்',
    'search.stories': 'கதைகள்',
    'search.dests': 'இலக்குகள்',
    'search.empty': 'பொருத்தங்கள் இல்லை — ஒரு இடம், கதை அல்லது நாட்டை முயற்சிக்கவும்.',
    'search.hint': 'நிலப்படம் முழுவதும் தேடத் தட்டச்சு செய்க · மூட Esc',
    'search.recent': 'சமீபத்திய தேடல்கள்',
    // profile
    'profile.traveller': 'பயணி',
    'profile.sub': 'இந்த உலாவியில் மட்டும் சேமிக்கப்படுகிறது',
    'profile.saved': 'சேமித்த இடங்கள்',
    'profile.recent': 'சமீபத்தில் பார்த்தவை',
    'profile.emptySaved': 'இன்னும் சேமித்த இடங்கள் இல்லை — எந்த இடப் பக்கத்திலும் “சேமி” என தட்டவும்.',
    'profile.emptyRecent': 'நீங்கள் திறக்கும் இடங்கள் இங்கே தோன்றும்.',
    // place page
    'place.save': 'சேமி',
    'place.saved': 'சேமிக்கப்பட்டது',
    // about page
    'about.eyebrow': 'வழி பற்றி',
    'about.title': 'நாட்குறிப்புப் போல பேணப்படும் ஒரு பயணக் கலைக்களஞ்சியம்.',
    'about.p1':
      'வழி — “the way” — ஒரு தனிப்பட்ட நிலப்படமும் பயணக் கலைக்களஞ்சியமும்: இடங்கள், வரலாறுகள், பண்பாடுகள், பயணங்களின் மெதுவாக வளரும் பதிவு; சிற்றிதழ்களிலிருந்து தொகுக்கப்படாமல் பாதையில் எழுதப்படுவது.',
    'about.p2':
      'ஒவ்வொரு இடமும் ஒரு முழுக் கட்டுரையாகும் — அதன் வரலாறு, கட்டிடக்கலை, அங்கு நின்றால் மட்டுமே கிடைக்கும் நடைமுறைக் குறிப்புகள். அவற்றின் கீழுள்ள நிலப்படம் நாடு அமைந்துள்ள விதமாகவே அமைகிறது: இலக்குகள் நிலப்படங்களாகத் திறக்கின்றன, நிலப்படங்கள் மாநிலங்களாகவும் மாவட்டங்களாகவும், மாவட்டங்கள் இடங்களாகவும்.',
    'about.p3':
      'கதைகள் இடங்களுடன் அருகருகே நிற்கின்றன: கட்டுரைகள், களக் குறிப்புகள், புகைப்படக் கட்டுரைகள், உரையாடல்கள் — உண்மைப் பெட்டியில் அடங்காத பயணத்தின் தடம். பயணங்கள் முழுப் பாதைகளையும் நாள் வாரியாக நிலப்படத்தில் வரைகின்றன.',
    'about.p4':
      'இது ஒரு சுயாதீன முயற்சி; இரு மொழிகளில், மெதுவாக எழுதப்படுவது. புதிய இடங்கள் நடந்து முடித்தபின் மட்டுமே சேர்க்கப்படுகின்றன — முன்னரே அல்ல.',
    'about.statPlaces': 'பதிவுசெய்யப்பட்ட இடங்கள்',
    'about.statCountries': 'நாடுகள்',
    'about.statJourneys': 'வரையப்பட்ட பயணங்கள்',
    'about.statStories': 'எழுதப்பட்ட கதைகள்',
    'about.howTitle': 'நிலப்படம் எவ்வாறு அமைக்கப்பட்டுள்ளது',
    'about.how1t': 'இலக்குகள்',
    'about.how1d': 'ஒவ்வொரு நாடும் பதிவுசெய்யப்பட்ட அனைத்து இடங்களின் ஊடாடும் நிலப்படமாகத் திறக்கிறது.',
    'about.how2t': 'மாநிலங்கள் → மாவட்டங்கள்',
    'about.how2d': 'நிலம் உண்மையில் அமைந்துள்ள விதமாகவே நிலப்படங்கள் மாநிலங்கள், மாவட்டங்கள் வழியே ஆழமாகச் செல்கின்றன.',
    'about.how3t': 'இடங்கள் & கதைகள்',
    'about.how3d': 'ஒவ்வொரு இடமும் ஒரு முழுக் கட்டுரை; கட்டுரைகளும் பயணங்களும் அவற்றை ஒன்றாக நெசவு செய்கின்றன.',
    'about.cta': 'ஆராயத் தொடங்கு',
    // hero
    'hero.eyebrow': 'ஒரு பயணக் கலைக்களஞ்சியம் · ஒரு தனிப்பட்ட நிலப்படம்',
    'hero.h1a': 'இடங்களைக் கண்டறிக.',
    'hero.h1b': 'அவற்றின் கதைகளை அறிக.',
    'hero.h1c': 'காலத்தில் நடந்து செல்.',
    'hero.sub':
      'இடங்கள், வரலாறுகள், பண்பாடுகள், பயணங்கள் — பாதையில், மெதுவாக எழுதப்படும் ஒரு பயணக் கலைக்களஞ்சியமும் தனிப்பட்ட நிலப்படமும்.',
    'hero.searchPh': 'இடங்கள், மனிதர்கள், பண்பாடுகள், வரலாறுகளைத் தேடுக…',
    'hero.popular': 'பிரபலம்:',
    'hero.featured': 'சிறப்பிடம்',
    'hero.featuredMeta': 'தஞ்சாவூர், இந்தியா · கி.பி. 1010-இல் கட்டப்பட்டது',
    'cta.explore': 'ஆராய்க',
    // atlas
    'atlas.eyebrow': 'நிலப்படம்',
    'atlas.title': 'நீங்கள் கண்ட உலகத்தையும் அதனை வடிவமைத்த கதைகளையும் ஆராயுங்கள்.',
    'atlas.cta': 'ஊடாடும் நிலப்படத்தைத் திற',
    // filters
    'filter.All Places': 'அனைத்திடங்கள்',
    'filter.Visited': 'சென்றவை',
    'filter.Heritage': 'பாரம்பரியம்',
    'filter.Nature': 'இயற்கை',
    'filter.Cities': 'நகரங்கள்',
    'filter.Temples': 'கோயில்கள்',
    'filter.Culture': 'பண்பாடு',
    'filter.Stories': 'கதைகள்',
    // sections
    'sect.dest.eyebrow': 'இலக்குகள்',
    'sect.dest.title': 'உலகெங்கிலுமுள்ள இடங்களை ஆராயுங்கள்',
    'sect.dest.link': 'அனைத்து இலக்குகளும்',
    'sect.heritage.eyebrow': 'பாரம்பரியம்',
    'sect.heritage.title': 'நமது பண்பாட்டு மரபைக் கண்டறியுங்கள்',
    'sect.heritage.link': 'அனைத்துப் பாரம்பரியமும்',
    'sect.journeys.eyebrow': 'பயணங்கள்',
    'sect.journeys.title': 'பாதையைப் பின்தொடருங்கள்',
    'sect.journeys.link': 'அனைத்துப் பயணங்களும்',
    'sect.stories.eyebrow': 'கதைகள்',
    'sect.stories.title': 'இடங்களுக்கு அப்பால் பயணம்',
    'sect.stories.link': 'அனைத்துக் கதைகளும்',
    'sect.recent.eyebrow': 'சமீபத்தில் சேர்க்கப்பட்டவை',
    'sect.recent.title': 'நிலப்படத்தில் புதிதாக',
    'sect.recent.link': 'அனைத்தும்',
    'interests.eyebrow': 'ஆர்வம் மூலம் ஆராய்க',
    // heritage kinds
    'heritage.Temples': 'கோயில்கள்',
    'heritage.Forts': 'கோட்டைகள்',
    'heritage.Caves': 'குகைகள்',
    'heritage.Ancient Cities': 'பண்டை நகரங்கள்',
    'heritage.Sculpture': 'சிற்பங்கள்',
    'heritage.Inscriptions': 'கல்வெட்டுகள்',
    'heritage.Sacred Places': 'புனித இடங்கள்',
    'heritage.UNESCO Sites': 'யுனெஸ்கோ தளங்கள்',
    // interests
    'interest.History': 'வரலாறு',
    'interest.Architecture': 'கட்டிடக்கலை',
    'interest.Art & Sculpture': 'கலை & சிற்பம்',
    'interest.Food': 'உணவு',
    'interest.Nature': 'இயற்கை',
    'interest.Religion': 'சமயம்',
    'interest.Fests & Culture': 'விழாக்கள் & பண்பாடு',
    'interest.Literature': 'இலக்கியம்',
    'interest.Archaeology': 'தொல்லியல்',
    // footer
    'footer.join': 'பயணத்தில் இணையுங்கள்',
    'footer.sub': 'கதைகள், இடங்கள், பயணங்கள் — உங்கள் மின்னஞ்சலில். மாதம் ஒரு கடிதம், இரைச்சலின்றி.',
    'footer.done': 'நல்வரவு — அடுத்த கடிதம் விரைவில் உங்களை அடையும்.',
    'footer.emailPh': 'மின்னஞ்சலை உள்ளிடுக',
    'footer.subscribe': 'சந்தா செலுத்த',
    'footer.privacy': 'வாசிக்கத் தக்கதொன்று இருக்கும்போது மட்டுமே எழுதுவோம். எப்போதும் நிறுத்தலாம்.',
    'footer.waTitle': 'வாட்ஸ்அப்பில் வழி',
    'footer.waSub': 'எங்கள் சேனலைப் பின்தொடருங்கள் — புதிய இடங்களும் களக் குறிப்புகளும் நேரே உங்கள் தொலைபேசிக்கு.',
    'footer.waShort': 'வாட்ஸ்அப் சேனலைப் பின்தொடரவும்',
    'footer.blurb':
      'காலத்துக்கும் வெளிக்கும் அப்பால் இடங்கள், வரலாறுகள், பண்பாடுகள், பயணங்களைப் பதிவு செய்யும் ஒரு பயணக் கலைக்களஞ்சியமும் தனிப்பட்ட நிலப்படமும்.',
    'footer.rights': '© 2026 வழி (Vazhi). அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    'footer.colophon': 'பாதையில் எழுதப்பட்டது · கோர்மோரன்ட் & இன்ட்டர் எழுத்துருக்களில்',
    'col.Explore': 'ஆராய்க',
    'col.Destinations': 'இலக்குகள்',
    'col.Heritage': 'பாரம்பரியம்',
    'col.Journeys': 'பயணங்கள்',
    'col.Stories': 'கதைகள்',
    'col.More': 'மேலும்',
    'item.All Places': 'அனைத்திடங்கள்',
    'item.Map': 'நிலப்படம்',
    'item.Categories': 'வகைகள்',
    'item.Recently Added': 'சமீபத்தில் சேர்ந்தவை',
    'item.Countries': 'நாடுகள்',
    'item.States': 'மாநிலங்கள்',
    'item.Cities': 'நகரங்கள்',
    'item.Regions': 'பிராந்தியங்கள்',
    'item.Temples': 'கோயில்கள்',
    'item.Forts': 'கோட்டைகள்',
    'item.Caves': 'குகைகள்',
    'item.Archaeology': 'தொல்லியல்',
    'item.My Journeys': 'என் பயணங்கள்',
    'item.Road Trips': 'சாலைப் பயணங்கள்',
    'item.Pilgrimages': 'தீர்த்தயாத்திரைகள்',
    'item.Treks': 'மலையேற்றங்கள்',
    'item.Essays': 'கட்டுரைகள்',
    'item.Field Notes': 'களக் குறிப்புகள்',
    'item.Photo Essays': 'புகைப்படக் கட்டுரைகள்',
    'item.Interviews': 'நேர்காணல்கள்',
    'item.About': 'எங்களைப் பற்றி',
    'item.Guidelines': 'வழிகாட்டுதல்கள்',
    'item.Contact': 'தொடர்பு',
    // breadcrumbs
    'crumb.home': 'முகப்பு',
    'crumb.destinations': 'இலக்குகள்',
    'crumb.stories': 'கதைகள்',
    'crumb.notFound': 'காணவில்லை',
    // map panel
    'map.footer': '{n} பதிவுசெய்யப்பட்ட இடங்கள் · குறியைத் தட்டி அதன் பக்கத்தைத் திறக்கவும்',
    'map.loading': 'வரைபடம் வரையப்படுகிறது…',
    'map.legend': 'இடம்',
    // destination page
    'dest.eyebrow': 'இலக்கு',
    'dest.docSuffix': 'நிலப்படத்தில் பதிவுசெய்யப்பட்டுள்ளன.',
    'dest.statesChip': '{n} மாநிலங்கள் / பிராந்தியங்கள்',
    'dest.placesChip': '{n} இடங்கள் குறிக்கப்பட்டுள்ளன',
    'dest.browse': 'மாநிலம் வாரியாக உலாவுக',
    'dest.hierarchy': 'மாநிலங்கள் → மாவட்டங்கள் → இடங்கள்.',
    'dest.districts': '{n} மாவட்டங்கள்',
    'dest.district': '{n} மாவட்டம்',
    'dest.places': '{n} இடங்கள்',
    'dest.placesIn': '{name} — இடங்கள்',
    'dest.notFound': 'இலக்கு காணவில்லை',
    'dest.allDest': '← அனைத்து இலக்குகளும்',
    'destindex.blurb':
      'ஒரு இலக்கைத் தேர்ந்தெடுத்து அதன் நிலப்படத்தைத் திறக்கவும் — பதிவுசெய்யப்பட்ட இடங்களின் ஊடாடும் நிலப்படம், அதற்குக் கீழே மாநிலங்களும் மாவட்டங்களும்.',
    // state page
    'state.docNote': '{n} மாவட்டங்கள் பதிவு செய்யப்பட்டுள்ளன · அதன் இடங்களைக் காண ஒரு மாவட்டத்தைத் தேர்ந்தெடுக்கவும்.',
    'state.placesInAtlas': '{n} இடங்கள் நிலப்படத்தில்',
    'state.placeInAtlas': '{n} இடம் நிலப்படத்தில்',
    'state.notFound': 'மாநிலம் காணவில்லை',
    // district page
    'district.note': 'ஒவ்வொரு இடமும் முழு நிலப்படக் கட்டுரையாகத் திறக்கிறது.',
    'district.readArticle': 'கட்டுரையைப் படிக்க →',
    'district.notFound': 'மாவட்டம் காணவில்லை',
    // place page
    'place.glance': 'ஒரு பார்வையில்',
    'place.related': 'தொடர்புடைய இடங்கள்',
    'place.back': '← நிலப்படத்திற்குத் திரும்ப',
    'place.notFound': 'இடம் காணவில்லை',
    'place.expandMap': 'விரி',
    'place.directions': 'வழி காட்டு',
    'place.nearby': 'அருகிலுள்ள இடங்கள்',
    'place.guideEyebrow': 'செல்லும் இட வழிகாட்டியை ஆராயுங்கள்',
    'place.guideTitle': '{dest}',
    'place.guideCounts': '{places} இடங்கள் · {stories} கதைகள்',
    'place.guideCta': 'வழிகாட்டியைத் திற',
    'contrib.heading': 'பங்களிப்பாளர்கள்',
    'band.kicker': 'வழியில் இணையுங்கள்',
    'band.title': 'எங்களுடன் பயணியுங்கள் — மீதமுள்ளதை வரையறுக்க உதவுங்கள்',
    'band.sub': 'இடங்கள், சடங்குகள், வரலாறுகள் பற்றிய உங்கள் அறிவைப் பகிருங்கள் — அல்லது நன்கொடையால் நிலப்படத்தை ஆதரியுங்கள். ஒவ்வொரு களக் குறிப்பும் ஒரு நினைவை உயிர்ப்பிக்கிறது.',
    'band.cta': 'பங்களியுங்கள் அல்லது நன்கொடை தாருங்கள்',
    'band.formTitle': 'வழிக்குப் பங்களியுங்கள்',
    'band.formSub': 'எப்படி உதவ விரும்புகிறீர்கள் என்று சொல்லுங்கள் — ஒவ்வொரு குறிப்பையும் படிப்போம்.',
    'band.fName': 'உங்கள் பெயர்',
    'band.fNamePh': 'பெயர்',
    'band.fContact': 'மின்னஞ்சல் அல்லது வாட்ஸ்அப் எண்',
    'band.fContactPh': 'you@example.com / +91 …',
    'band.fKind': 'நான் விரும்புவது',
    'band.kind.knowledge': 'அறிவைப் பகிர',
    'band.kind.donation': 'நன்கொடையால் ஆதரவு',
    'band.kind.both': 'இரண்டும்',
    'band.fMsg': 'உங்கள் குறிப்பு',
    'band.fMsgPh': 'நன்கு அறிந்த இடம், திருத்தம், சொல்ல வேண்டிய கதை…',
    'band.fLink': 'இணைப்பு (விருப்பம் — சுயவிவரம், குறிப்பு)',
    'band.send': 'அனுப்பு',
    'band.sending': 'அனுப்புகிறது…',
    'band.cancel': 'ரத்து',
    'band.close': 'மூடு',
    'band.doneTitle': 'நன்றி',
    'band.doneSub': 'உங்கள் குறிப்பு எங்களை அடைந்தது. விரைவில் பதிலெழுதுவோம்.',
    'band.err': 'ஏதோ தவறு நடந்தது — மீண்டும் முயற்சிக்கவும்.',
    // stories
    'storiesindex.blurb': 'பாதையில் சேகரிக்கப்பட்ட கட்டுரைகள், களக் குறிப்புகள், புகைப்படக் கட்டுரைகள், உரையாடல்கள்.',
    'series.eyebrow': 'தொடர்கள்',
    'series.title': 'பகுதிகளாகச் சொல்லப்படும் பயணக் கதைகள்',
    'series.blurb': 'நீண்ட அலைவுகள் தொகுப்புகளாக — ஒரு தொடரைத் திறந்து அதன் அனைத்துக் கதைகளையும் முதல் குறிப்பு முதல் இறுதிக் குறிப்பு வரை படியுங்கள்.',
    'series.count': '{count} கதைகள்',
    'series.one': '1 கதை',
    'series.cta': 'தொடரைப் படியுங்கள்',
    'seriespage.back': 'அனைத்துக் கதைகளும்',
    'pager.prev': 'முந்தையது',
    'pager.next': 'அடுத்தது',
    'pager.of': '/',
    'story.written': 'பாதையில் எழுதப்பட்டது',
    'story.fromAtlas': 'நிலப்படத்திலிருந்து',
    'story.openPlace': 'இடத்தைத் திற →',
    'story.more': 'மேலும் கதைகள்',
    'story.notFound': 'கதை காணவில்லை',
    // types & tags
    'type.Heritage': 'பாரம்பரியம்',
    'type.City': 'நகரம்',
    'type.Nature': 'இயற்கை',
    'tag.Essay': 'கட்டுரை',
    'tag.Field Notes': 'களக் குறிப்புகள்',
    'tag.History': 'வரலாறு',
    'tag.Photo Essay': 'புகைப்படக் கட்டுரை',
    'tag.People': 'மனிதர்கள்',
    // language
    'lang.en': 'English',
    'lang.ta': 'தமிழ்',
  },
} as const;

export type UIKey = keyof (typeof dict)['en'];

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'en',
  setLang: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('vazhi-lang');
    return saved === 'ta' ? 'ta' : 'en';
  });
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('vazhi-lang', l);
  };
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const { lang, setLang } = useContext(LangCtx);
  const t = (key: string, vars?: Record<string, string | number>): string => {
    const table = dict[lang] as Record<string, string>;
    let s = table[key] ?? (dict.en as Record<string, string>)[key] ?? key;
    if (vars) for (const k of Object.keys(vars)) s = s.replaceAll(`{${k}}`, String(vars[k]));
    return s;
  };
  return { lang, setLang, t };
}

/** Story tag label — translates known tags, shows custom backend-created tags as-is. */
export function tagLabel(t: (key: string) => string, tag: string): string {
  const v = t(`tag.${tag}`);
  return v === `tag.${tag}` ? tag : v;
}

/** Light/dark theme, persisted; toggles `light` class on <html>. */
/** Reads the active theme from the <html> classes — always in sync, no extra state. */
export function useThemeValue(): 'dark' | 'light' {
  const read = () =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('light')
      ? ('light' as const)
      : ('dark' as const);
  const [v, setV] = useState<'dark' | 'light'>(read);
  useEffect(() => {
    const obs = new MutationObserver(() => setV(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return v;
}

export function useTheme() {
  const [theme, setThemeState] = useState<'dark' | 'light'>(() =>
    localStorage.getItem('vazhi-theme') === 'light' ? 'light' : 'dark',
  );
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('vazhi-theme', theme);
  }, [theme]);
  const toggle = () => setThemeState((x) => (x === 'dark' ? 'light' : 'dark'));
  return { theme, toggle };
}
