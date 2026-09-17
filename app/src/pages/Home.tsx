import Nav from '../sections/Nav';
import Hero from '../sections/Hero';
import Atlas from '../sections/Atlas';
import Destinations from '../sections/Destinations';
import Heritage from '../sections/Heritage';
import Journeys from '../sections/Journeys';
import Stories from '../sections/Stories';
import Interests from '../sections/Interests';
import Recent from '../sections/Recent';
import ContributeBand from '../components/ContributeBand';
import Footer from '../sections/Footer';
import { useContent } from '../content-provider';

export default function Home() {
  const { sectionVisibility, sectionOrder } = useContent();
  const vis = (id: string) => sectionVisibility[id] ?? true;

  const blocks: { id: string; node: React.ReactNode }[] = [
    { id: 'home.interests', node: <Interests /> },
    { id: 'home.atlas', node: <Atlas /> },
    { id: 'home.destinations', node: <Destinations /> },
    { id: 'home.heritage', node: <Heritage /> },
    { id: 'home.journeys', node: <Journeys /> },
    { id: 'home.stories', node: <Stories /> },
    { id: 'home.recent', node: <Recent /> },
    { id: 'home.join', node: <ContributeBand /> },
  ];
  const order = sectionOrder.filter((id) => id !== 'home.hero');
  const sorted = [...blocks].sort((a, b) => {
    const ia = order.indexOf(a.id);
    const ib = order.indexOf(b.id);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  return (
    <div className="min-h-screen bg-page text-parch">
      <Nav />
      <main>
        <Hero />
        {sorted.filter((b) => vis(b.id)).map((b) => (
          <div key={b.id}>{b.node}</div>
        ))}
      </main>
      <Footer />
    </div>
  );
}
