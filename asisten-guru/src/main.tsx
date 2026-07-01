import {
  Component,
  StrictMode,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useState,
} from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ToastProvider } from './components/Toast';
import { WelcomeSplash } from './components/WelcomeSplash';
import { initDb } from './lib/db';
import './index.css';

// Hero hanya dimuat saat dibutuhkan agar tidak membebani bundel aplikasi utama.
const PremiumHero = lazy(() =>
  import('./components/PremiumHero').then((m) => ({ default: m.PremiumHero })),
);

const LANDING_SEEN_KEY = 'asisten-guru:landing-seen';

/** Error boundary root: tampilkan pesan, bukan layar kosong, bila app crash. */
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  override state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Aplikasi mengalami error:', error, info);
  }

  override render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-emerald-soft p-6 text-center">
          <h1 className="font-display text-xl font-bold text-emerald-deep">
            Terjadi kendala saat memuat aplikasi
          </h1>
          <p className="max-w-md text-sm text-ink/70">
            Coba muat ulang halaman. Jika tetap terjadi, bersihkan cache lalu
            buka kembali.
          </p>
          <pre className="max-w-md overflow-auto rounded-lg bg-white/5 p-3 text-left text-xs text-ink/60">
            {String(this.state.error?.message ?? this.state.error)}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-[#04140C]"
          >
            Muat ulang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Root: tampilkan landing PremiumHero saat kunjungan pertama (atau saat URL
 * berisi #showcase), lalu aplikasi. Pilihan "sudah masuk" diingat di localStorage
 * sehingga landing tidak muncul lagi; tombol Showcase di Header membukanya lagi.
 */
function Root() {
  // Inisialisasi DB di belakang layar — TIDAK memblokir render. Aman bila gagal.
  useEffect(() => {
    initDb().catch((err) =>
      console.error('Gagal inisialisasi database lokal:', err),
    );
  }, []);

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

  const [splashDone, setSplashDone] = useState(false);

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
    setSplashDone(false);
    setShowLanding(true);
    window.scrollTo(0, 0);
  }, []);

  if (showLanding) {
    if (!splashDone) {
      return <WelcomeSplash onDone={() => setSplashDone(true)} />;
    }
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

// Render DULU (tidak menunggu DB) agar app selalu mount, termasuk di web.
createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <Root />
    </ErrorBoundary>
  </StrictMode>,
);

