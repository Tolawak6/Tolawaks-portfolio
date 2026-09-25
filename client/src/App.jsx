import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Header } from './components/layout/Header.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { ScrollManager } from './components/layout/ScrollManager.jsx';
import { Spinner } from './components/ui/Spinner.jsx';
import { useRevealOnScroll } from './hooks/useRevealOnScroll.js';

import { PortfolioPage } from './pages/PortfolioPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

/**
 * The admin dashboard is only ever needed by the site owner, so it is split
 * into its own chunk and never downloaded by portfolio visitors.
 */
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));

function PageFallback() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <Spinner size="lg" label="Loading page" />
    </div>
  );
}

export function App() {
  // One observer for the whole app, set up after the first paint.
  useRevealOnScroll();

  return (
    <BrowserRouter>
      <ScrollManager />

      {/* Keyboard users can jump straight past the navigation. */}
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <Header />

      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route
            path="/"
            element={
              <main id="main">
                <PortfolioPage />
              </main>
            }
          />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
