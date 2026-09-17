import { Routes, Route, useLocation } from 'react-router'
import { useEffect } from 'react'
import { LangProvider } from './i18n'
import { ContentProvider, ContentGate, useSiteTypography } from './content-provider'
import Home from './pages/Home'
import PlacePage from './pages/PlacePage'
import DestinationsIndex from './pages/DestinationsIndex'
import DestinationPage from './pages/DestinationPage'
import StatePage from './pages/StatePage'
import DistrictPage from './pages/DistrictPage'
import StoriesIndex from './pages/StoriesIndex'
import SeriesPage from './pages/SeriesPage'
import StoryPage from './pages/StoryPage'
import AboutPage from './pages/AboutPage'
import AdminPage from './pages/AdminPage'
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import ScrollToTop from './components/ScrollToTop'
import { FontLoader } from './fonts'
import { initAnalytics, trackPageview } from './analytics'

function SiteTypography() {
  useSiteTypography();
  return null;
}

/* records one view per route + dwell time on exit (skips /admin) */
function AnalyticsTracker() {
  const location = useLocation();
  useEffect(() => initAnalytics(), []);
  useEffect(() => trackPageview(location.pathname), [location.pathname]);
  return null;
}

export default function App() {
  return (
    <LangProvider>
      <ContentProvider>
        <SiteTypography />
        <FontLoader />
        <ScrollToTop />
        <AnalyticsTracker />
        <Routes>
          {/* admin sits outside the content gate — it manages the content itself */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="*"
            element={
              <ContentGate>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/place/:placeId" element={<PlacePage />} />
                  <Route path="/destinations" element={<DestinationsIndex />} />
                  <Route path="/destinations/:destId" element={<DestinationPage />} />
                  <Route path="/destinations/:destId/states/:stateId" element={<StatePage />} />
                  <Route path="/destinations/:destId/states/:stateId/:districtId" element={<DistrictPage />} />
                  <Route path="/stories" element={<StoriesIndex />} />
                  <Route path="/series/:seriesId" element={<SeriesPage />} />
                  <Route path="/stories/:storyId" element={<StoryPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ContentGate>
            }
          />
        </Routes>
      </ContentProvider>
    </LangProvider>
  )
}
