import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ToastProvider } from './components/Toast';
import './index.css';

// Hero hanya dimuat saat dibutuhkan agar tidak membebani bundel aplikasi utama.
const PremiumHero = lazy(() =>
  import('./components/PremiumHero').then((m) => ({ default: m.PremiumHero })),
);

const container = document.getElementById('root');
if (!container) {
  throw new Error('Elemen #root tidak ditemukan di index.html');
}

// Landing showcase opsional: buka dengan #showcase pada URL. Default tetap aplikasi.
const showLanding = window.location.hash === '#showcase';

createRoot(container).render(
  <StrictMode>
    {showLanding ? (
      <Suspense
        fallback={<div className="min-h-screen bg-[#0F1115]" aria-hidden />}
      >
        <PremiumHero />
      </Suspense>
    ) : (
      <ToastProvider>
        <App />
      </ToastProvider>
    )}
  </StrictMode>,
);
