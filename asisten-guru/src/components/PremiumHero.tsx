import { useEffect, useState } from 'react';

interface PremiumHeroProps {
  onEnter?: () => void;
}

/** Profil guru untuk sapaan hero. Kosongkan = sapaan generik.
 *  Isi untuk personal, mis. { nama: 'Akhid', mapel: 'Bahasa Arab' }. */
const GURU = { nama: '', mapel: '' };

/** '/' di web/Vercel, './' di APK Capacitor. */
const BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env
  .BASE_URL;

function greetingByHour(h: number): string {
  if (h >= 4 && h < 11) return 'Selamat pagi';
  if (h >= 11 && h < 15) return 'Selamat siang';
  if (h >= 15 && h < 18) return 'Selamat sore';
  return 'Selamat malam';
}

export function PremiumHero({ onEnter }: PremiumHeroProps) {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const greeting = greetingByHour(now.getHours());
  const sapaan = (GURU.nama ? greeting + ', ' + GURU.nama : greeting).toUpperCase();
  const subtitle = GURU.nama
    ? GURU.nama + ' · Guru ' + GURU.mapel
    : 'Asisten mengajar Kurikulum Merdeka';
  const jam = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(now);
  const tanggal = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#04140c]">
      <div aria-hidden className="hero-bg absolute inset-0" style={{ zIndex: 0 }}>
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={`${BASE}hero-tunnel.mp4`}
          poster={`${BASE}hero-tunnel.jpg`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(900px 620px at 50% 40%, transparent, rgba(2,5,10,.32) 76%), linear-gradient(180deg, rgba(2,5,10,.32), transparent 36%, rgba(2,5,10,.72))',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 95% 92% at 50% 44%, transparent 50%, rgba(1,3,8,.6))',
          }}
        />
      </div>

      <div
        className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center"
        style={{ zIndex: 10 }}
      >
        <div
          className="hero-clock font-grotesk text-4xl font-bold tabular-nums tracking-tight text-white sm:text-5xl"
          style={{ textShadow: '0 2px 24px rgba(0,0,0,.55)' }}
        >
          {jam}
        </div>
        <div className="hero-date mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-deep sm:text-xs">
          {tanggal}
        </div>

        <h1
          className="hero-title mt-8 font-display text-[clamp(2rem,8vw,3.5rem)] font-bold uppercase leading-[1.1] tracking-wide text-white"
          style={{ textShadow: '0 2px 28px rgba(0,0,0,.6)' }}
        >
          {sapaan}
        </h1>
        <p
          className="hero-sub mt-3 text-sm text-white/70 sm:text-base"
          style={{ textShadow: '0 1px 16px rgba(0,0,0,.5)' }}
        >
          {subtitle}
        </p>

        <button
          type="button"
          onClick={onEnter}
          className="hero-cta mt-10 inline-flex items-center justify-center rounded-full bg-[#4CE896] px-8 py-4 text-base font-semibold text-[#04140c] transition-transform active:scale-95"
          style={{ boxShadow: '0 0 26px -8px rgba(102,255,176,.7)' }}
        >
          Masuk ke ruang kerja
        </button>
      </div>
    </div>
  );
}

export default PremiumHero;
