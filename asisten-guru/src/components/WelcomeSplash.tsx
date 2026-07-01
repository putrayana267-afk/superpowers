import { useEffect } from 'react';

interface WelcomeSplashProps {
  /** Dipanggil saat sambutan selesai (urutan 10s; dipangkas bila kurangi-gerak).
   *  Tap/keyboard untuk melewati. */
  onDone: () => void;
}

/**
 * Layar sambutan sinematik sebelum hero. Presentasi murni — tanpa data/aset/
 * dependency. Urutan lambat & halus: fade-in berlapis 3s → diam 4s (glow
 * bernapas) → fade-out 3s (konten melayang & melembut). Kelas .splash-* di
 * index.css; hanya transform/opacity/filter (GPU-friendly), aman saat
 * prefers-reduced-motion (durasi juga dipangkas via matchMedia).
 */
export function WelcomeSplash({ onDone }: WelcomeSplashProps) {
  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const timer = window.setTimeout(onDone, reduced ? 700 : 10000);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Lewati sambutan"
      onClick={onDone}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onDone();
      }}
      className="relative flex min-h-screen w-full cursor-pointer items-center justify-center overflow-hidden bg-[#04140c] px-6"
    >
      <div className="splash-exit absolute inset-0 flex items-center justify-center">
        <div
          aria-hidden
          className="splash-glow pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(900px 520px at 50% 34%, rgba(76, 232, 150, 0.16), transparent 62%)',
          }}
        />
        <div
          aria-hidden
          className="splash-sheen pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(75deg, transparent 42%, rgba(255, 255, 255, 0.08) 50%, transparent 58%)',
          }}
        />
        <div className="relative text-center">
          <p className="splash-eyebrow text-xs font-semibold uppercase tracking-[0.3em] text-emerald-deep">
            Asisten Mengajar
          </p>
          <h1 className="splash-title mt-4 bg-gradient-to-r from-emerald-deep to-violet bg-clip-text font-display text-5xl font-bold italic text-transparent sm:text-6xl">
            Selamat Datang
          </h1>
          <div className="splash-divider mx-auto mt-5 h-px w-16 bg-emerald-deep/40" />
        </div>
      </div>
    </div>
  );
}
