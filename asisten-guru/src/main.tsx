import { StrictMode, Suspense, lazy, useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ToastProvider } from './components/Toast';
import { initDb } from './lib/db';
import './index.css';

// Hero hanya dimuat saat dibutuhkan agar tidak membebani bundel aplikasi utama.
const PremiumHero = lazy(() =>
  import('./components/PremiumHero').then((m) => ({ default: m.PremiumHero })),
);

const LANDING_SEEN_KEY = 'asisten-guru:landing-seen';

/**
 * Root: tampilkan landing PremiumHero saat kunjungan pertama (atau saat URL
 * berisi #showcase), lalu aplikasi. Pilihan "sudah masuk" diingat di localStorage
 * sehingga landing tidak muncul lagi; tombol Showcase di Header membukanya lagi.
 */
function Root() {
  const [showLanding, setShowLanding] = useState(() => {
    const forced = window.location.hash === '#showcase';
    let seen = false;
    try {
      seen = localStorage.getItem(LANDING_SEEN_KEY) === '1';
    } catch {
      seen = false;
    }
    return forced || !seen;
  });

  const enterApp = useCallback(() => {
    try {
      localStorage.setItem(LANDING_SEEN_KEY, '1');
    } catch {
      // abaikan kegagalan storage
    }
    if (window.location.hash === '#showcase') {
      history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search,
      );
    }
    setShowLanding(false);
    window.scrollTo(0, 0);
  }, []);

  const openShowcase = useCallback(() => {
    setShowLanding(true);
    window.scrollTo(0, 0);
  }, []);

  if (showLanding) {
    return (
      <Suspense
        fallback={<div className="min-h-screen bg-[#0F1115]" aria-hidden />}
      >
        <PremiumHero onEnter={enterApp} />
      </Suspense>
    );
  }

  return (
    <ToastProvider>
      <App onOpenShowcase={openShowcase} />
    </ToastProvider>
  );
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Elemen #root tidak ditemukan di index.html');
}

// Inisialisasi SQLite SEBELUM render, lalu render. Kegagalan DB tidak boleh
// membuat aplikasi blank — cukup catat dan tetap render (jalur lama jalan).
async function bootstrap(): Promise<void> {
  try {
    await initDb();
  } catch (err) {
    console.error('Gagal inisialisasi database lokal:', err);
  }
  createRoot(container as HTMLElement).render(
    <StrictMode>
      <Root />
    </StrictMode>,
  );
}

void bootstrap();
