import { useEffect } from 'react';

interface WelcomeSplashProps {
  /** Dipanggil saat sambutan selesai (auto 2.2s) atau di-tap untuk dilewati. */
  onDone: () => void;
}

/**
 * Layar sambutan singkat sebelum hero. Presentasi murni — tanpa data, aset, atau
 * dependency baru. Reuse token noir + keyframe `fade-up` (motion-reduce dihormati
 * global via index.css). Auto-lanjut 2.2 detik; tap/keyboard untuk melewati.
 */
export function WelcomeSplash({ onDone }: WelcomeSplashProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 2200);
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
      style={{
        backgroundImage:
          'radial-gradient(900px 500px at 50% 30%, rgba(76, 232, 150, 0.12), transparent 60%)',
      }}
    >
      <div className="animate-fade-up text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-deep">
          Asisten Mengajar
        </p>
        <h1 className="mt-4 bg-gradient-to-r from-emerald-deep to-violet bg-clip-text font-display text-5xl font-bold italic text-transparent sm:text-6xl">
          Selamat Datang
        </h1>
        <div className="mx-auto mt-5 h-px w-16 bg-emerald-deep/30" />
      </div>
    </div>
  );
}
