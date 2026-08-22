/**
 * Root application shell for PixelForge.
 *
 * Responsibilities:
 * - Own the browser router.
 * - Render persistent layout chrome such as navigation, global header, footer,
 *   legal modals, and FAQ chatbot.
 * - Lazily render page routes with lightweight suspense loaders.
 */

import { useEffect, useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { legalModalData } from './layout/legalModalData';
import routes from './routing/routes';

import Navbar from './layout/NavBar';
import GlobalHeader from './layout/GlobalHeader';
import Footer from './layout/Footer';
import AppModals from '@/shared/components/common/AppModals';
import FaqChatbotWidget from '@/features/chatbot/FaqChatbotWidget';
import { readThemePreference, resolveTheme, THEME_STORAGE_KEY } from './theme';

/**
 * Generic fallback shown while non-workspace pages are loading.
 *
 * @returns {JSX.Element} Centered loading spinner.
 */
const PageLoader = () => (
  <div
    className="flex min-h-75 w-full flex-1 items-center justify-center"
    role="status"
    aria-label="Loading page"
  >
    <div className="h-8 w-8 animate-spin rounded-full border-3 border-pf-line-inverse border-t-pf-accent-hover" />
  </div>
);

/**
 * Workspace-shaped fallback used for heavier tool pages.
 *
 * This keeps the layout stable while feature bundles are being downloaded.
 *
 * @returns {JSX.Element} Skeleton-like workspace loading panel.
 */
const WorkspaceLoader = () => (
  <div className="w-full flex-1">
    <section className="mx-auto w-full max-w-pf-workspace flex-1 px-pf-gutter pb-16 pt-4">
      <div
        className="flex min-h-96 w-full items-center justify-center rounded-pf-card border border-pf-line-inverse bg-pf-surface-inverse-subtle"
        role="status"
        aria-label="Loading workspace"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-pf-line-inverse border-t-pf-accent-hover" />
      </div>
    </section>
  </div>
);

/**
 * Main PixelForge application component.
 *
 * @returns {JSX.Element} Fully routed application shell.
 */
export default function App() {
  const [themePreference, setThemePreference] = useState(readThemePreference);
  const [prefersDark, setPrefersDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'privacy',
  });

  const openModal = (type) => setModalState({ isOpen: true, type });
  const closeModal = () =>
    setModalState((prev) => ({ ...prev, isOpen: false }));

  const activeModalData = legalModalData[modalState.type];
  const theme = resolveTheme(themePreference, prefersDark);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = (event) => setPrefersDark(event.matches);
    mediaQuery.addEventListener('change', updateSystemTheme);
    return () => mediaQuery.removeEventListener('change', updateSystemTheme);
  }, []);

  const changeTheme = (preference) => {
    setThemePreference(preference);
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  };

  return (
    <BrowserRouter>
      <div data-theme={theme} className="flex min-h-screen flex-col bg-pf-editorial-base text-pf-editorial-ink selection:bg-pf-editorial-accent-soft">
        <Navbar
          theme={theme}
          themePreference={themePreference}
          onThemeChange={changeTheme}
        />

        <main className="relative flex min-h-0 w-full flex-1 flex-col">
          <GlobalHeader />

          <Suspense fallback={<PageLoader />}>
            <Routes>
              {routes.map((r) => {
                const Component = r.component;
                const FallbackLoader =
                  r.path === '/upscale' ? WorkspaceLoader : PageLoader;

                return (
                  <Route
                    key={r.path}
                    path={r.path}
                    element={
                      <Suspense fallback={<FallbackLoader />}>
                        <Component />
                      </Suspense>
                    }
                  />
                );
              })}
            </Routes>
          </Suspense>
        </main>

        <FaqChatbotWidget />

        <div className="relative mt-auto w-full">
          <Footer openModal={openModal} />
        </div>

        <AppModals
          isOpen={modalState.isOpen}
          onClose={closeModal}
          title={activeModalData.title}
        >
          {activeModalData.content}
        </AppModals>
      </div>
    </BrowserRouter>
  );
}
