import { useEffect, useState } from 'react';

interface PremiumHeroProps {
  onEnter?: () => void;
}

/** Profil guru untuk sapaan hero — ganti nama/mapel di sini. */
const GURU = { nama: 'Akhid', mapel: 'Bahasa Arab' };

/** '/' di web/Vercel, './' di APK Capacitor. */
const BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env
  .BASE_URL;

function greetingByHour(h: number): string {
  if (h >= 4 && h < 11) return 'Selamat pagi';
  if (h >= 11 && h < 15) return 'Selamat siang';
  if (h >= 15 && h < 18) return 'Selamat sore';
  return 'Selamat malam';
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Hero "Akhid Noir": video terowongan + kartu jam kanan-atas, chip profil,
 * sapaan gradien, satu CTA outline. Data = jam perangkat + konstanta GURU
 * (data guru sendiri). Kontrak dijaga: named export + prop onEnter.
 */
export function PremiumHero({ onEnter }: PremiumHeroProps) {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const sapaan = (
    greetingByHour(now.getHours()) + (GURU.nama ? ', ' + GURU.nama : '')
  ).toUpperCase();
  const inisial =
    GURU.nama
      .split(/\s+/)
      .map((k) => k[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'G';
  const hari = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(now);
  const bulanTahun = (
    new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(now) +
    ' ' +
    now.getFullYear()
  ).toUpperCase();
  const jam =
    pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());

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
        className="relative flex min-h-[100dvh] flex-col px-5 pb-10 pt-5"
        style={{ zIndex: 10 }}
      >
        <div className="hero-top flex justify-end">
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#04140c]/55 px-5 py-3 backdrop-blur-md">
            <div className="text-center">
              <div className="font-grotesk text-3xl font-bold leading-none tabular-nums text-white">
                {now.getDate()}
              </div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-deep">
                {bulanTahun}
              </div>
            </div>
            <div className="h-10 w-px bg-white/15" />
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className="inline-block h-2 w-2 rounded-full bg-[#4CE896]" />
                {hari}
              </div>
              <div className="font-grotesk mt-0.5 text-2xl font-bold tabular-nums text-emerald-deep">
                {jam}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="hero-chip flex items-center gap-3 rounded-full border border-white/10 bg-[#04140c]/55 py-2 pl-2 pr-5 backdrop-blur-md">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#4CE896] to-violet font-grotesk text-sm font-bold text-[#04140c]">
              {inisial}
            </span>
            <span className="text-sm font-semibold uppercase tracking-wide text-white">
              {GURU.nama}
            </span>
            <span className="text-white/40">·</span>
            <span className="text-sm font-semibold text-white/80">
              Guru <span className="uppercase text-emerald-deep">{GURU.mapel}</span>
            </span>
          </div>

          <h1 className="hero-title mt-6 bg-gradient-to-r from-[#4CE896] via-[#8EFFCA] to-[#EAFFF4] bg-clip-text font-grotesk text-[clamp(2.1rem,9vw,3.6rem)] font-bold uppercase leading-[1.08] tracking-tight text-transparent">
            {sapaan}
          </h1>
          <p className="hero-sub mt-4 max-w-md text-base leading-relaxed text-white/75">
            Modul ajar, bank soal, dan LKPD-mu hari ini — semuanya dalam satu
            ruang kerja yang tenang.
          </p>

          <button
            type="button"
            onClick={onEnter}
            className="hero-cta mt-9 flex w-full max-w-md items-center justify-center gap-2 rounded-2xl border border-[#4CE896]/45 bg-[#04140c]/60 px-6 py-4 text-lg font-semibold text-emerald-deep backdrop-blur-md transition-transform active:scale-[0.98]"
            style={{
              boxShadow:
                '0 0 30px -12px rgba(76,232,150,.55), inset 0 0 22px -14px rgba(76,232,150,.5)',
            }}
          >
            Masuk ke ruang kerja
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PremiumHero;
