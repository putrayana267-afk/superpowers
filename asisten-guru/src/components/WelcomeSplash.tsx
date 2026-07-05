import { useEffect } from 'react';

interface WelcomeSplashProps {
  /** Dipanggil saat urutan selesai. TANPA lewati — timer satu-satunya jalan
   *  keluar (maks 10.5s; dipangkas ~2s saat kurangi-gerak). */
  onDone: () => void;
}

/** '/' di web/Vercel, './' di APK Capacitor. */
const BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env
  .BASE_URL;

/**
 * Layar sambutan sinematik sebelum hero — SENGAJA tanpa tombol lewati.
 * Presentasi murni; tanpa data/aset/dependency. Urutan: eyebrow "Asisten
 * Mengajar" masked-rise & settle → judul "Selamat Datang" naik → diam → teks
 * keluar → loader elegan di tengah → layar larut ke hero. Kelas .splash-* di
 * index.css; hanya transform/opacity/filter; aman saat prefers-reduced-motion
 * (statis, tanpa gerak/loader). Loader menutup lazy-load hero + initDb.
 */
export function WelcomeSplash({ onDone }: WelcomeSplashProps) {
  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const timer = window.setTimeout(onDone, reduced ? 2000 : 10500);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="splash-root relative min-h-screen w-full overflow-hidden bg-[#101c13]">
      <div
        aria-hidden
        className="splash-glow pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(900px 520px at 50% 40%, rgba(76, 232, 150, 0.16), transparent 62%)',
        }}
      />

      <div className="splash-text absolute inset-0 grid place-items-center px-6">
        <div className="text-center">
          <div className="overflow-hidden pb-[0.14em]">
            <p className="splash-eyebrow text-xs font-semibold uppercase tracking-[0.3em] text-emerald-deep sm:text-sm">
              Asisten Mengajar
            </p>
          </div>
          <h1 className="splash-title mt-5 bg-gradient-to-r from-emerald-deep to-violet bg-clip-text font-display text-5xl font-bold italic text-transparent sm:text-6xl">
            Selamat Datang
          </h1>
          <div className="splash-divider mx-auto mt-6 h-px w-16 bg-emerald-deep/40" />
        </div>
      </div>

      <div
        aria-hidden
        className="splash-loader-wrap absolute inset-0 grid place-items-center"
      >
        <div className="relative grid place-items-center">
          <div className="splash-loader-glow" />
          <div className="splash-loader" />
        </div>
      </div>

      {/* Preload aset hero selama splash agar transisi ke hero tanpa pop. */}
      <video
        aria-hidden
        muted
        playsInline
        preload="auto"
        src={`${BASE}hero-tunnel.mp4`}
        style={{ display: 'none' }}
      />
      <img
        aria-hidden
        alt=""
        src={`${BASE}hero-tunnel.jpg`}
        style={{ display: 'none' }}
      />

      <span className="sr-only" role="status">
        Menyiapkan aplikasi…
      </span>
    </div>
  );
}
