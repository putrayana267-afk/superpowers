import { useEffect, useRef, useState } from 'react';
import { useZonaWaktu } from '../features/waktu/useZonaWaktu';
import { useMediaQuery } from '../lib/useMediaQuery';
import { cn } from '../lib/cn';
import { DEFAULT_PROFIL, loadProfil, type Profil } from '../lib/profil';

interface PremiumHeroProps {
  onEnter?: () => void;
}

function greetingByHour(h: number): string {
  if (h >= 4 && h < 11) return 'Selamat pagi';
  if (h >= 11 && h < 15) return 'Selamat siang';
  if (h >= 15 && h < 18) return 'Selamat sore';
  return 'Selamat malam';
}

/** Satu sumber zona: semua bagian tanggal/jam dari satu formatToParts. */
function bagianWaktu(now: Date, timeZone: string | undefined) {
  const parts = new Intl.DateTimeFormat('id-ID', {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const ambil = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? '';
  return {
    hari: ambil('weekday'),
    tanggal: ambil('day'),
    bulanTahun: `${ambil('month')} ${ambil('year')}`,
    jam: `${ambil('hour')}:${ambil('minute')}:${ambil('second')}`,
    jamAngka: Number(ambil('hour')),
  };
}

/** Durasi animasi keluar "turn-left" panel di PC (ms) — sinkron dgn index.css. */
const TURN_LEFT_MS = 860;

/**
 * Hero "ClassMind" — kartu split dua tema (gelap "Emerald Noir" / terang
 * "Fresh Mint"; palet island di index.css blok .hero-*). PC: konten kiri +
 * panel gradasi kanan; klik CTA menyapukan panel ke kiri (turn-left) lalu
 * onEnter. HP: panel gradasi di atas, isi di bawah, tanpa 3D, CTA langsung
 * onEnter. prefers-reduced-motion: tanpa gerak, onEnter seketika.
 * Kontrak dijaga: named + default export, prop onEnter.
 */
export function PremiumHero({ onEnter }: PremiumHeroProps) {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Profil identitas tersimpan (async). Default aman tampil dulu saat loading
  // → tak ada "flash kosong" pada sapaan.
  const [profil, setProfil] = useState<Profil>(DEFAULT_PROFIL);
  useEffect(() => {
    let active = true;
    loadProfil()
      .then((p) => active && setProfil(p))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const { label, timeZone } = useZonaWaktu();
  const { hari, tanggal, bulanTahun, jam, jamAngka } = bagianWaktu(
    now,
    timeZone,
  );

  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  // Keluar: PC = mainkan turn-left panel dulu; HP / kurangi-gerak = seketika.
  const masuk = () => {
    if (leaving) return;
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (!isDesktop || reduce) {
      onEnter?.();
      return;
    }
    setLeaving(true);
    timerRef.current = window.setTimeout(() => onEnter?.(), TURN_LEFT_MS);
  };

  // Wordmark teks murni: "Class" polos + "Mind" gradient-clip (tanpa lambang).
  const wordmark = (
    <p className="font-grotesk text-2xl font-bold tracking-tight">
      <span className="hero-word-class">Class</span>
      <span className="hero-word-mind">Mind</span>
    </p>
  );

  return (
    <div className="hero-root relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <div
        className={cn(
          'hero-card glass w-full max-w-md overflow-hidden rounded-[28px] lg:grid lg:min-h-[480px] lg:max-w-4xl lg:grid-cols-2',
        )}
      >
        {/* Panel gradasi dekoratif — HP: atas (wordmark + tagline); PC: kanan. */}
        <div
          className={cn(
            'hero-panel relative z-10 flex h-[40dvh] min-h-[240px] flex-col justify-between overflow-hidden p-6 lg:order-2 lg:h-auto lg:min-h-0 lg:p-8',
            leaving && 'hero-panel-leave',
          )}
        >
          <div aria-hidden className="hero-blob hero-blob-1" />
          <div aria-hidden className="hero-blob hero-blob-2" />
          <div aria-hidden className="hero-ring" />
          <div className="relative lg:hidden">{wordmark}</div>
          <p className="hero-tagline relative max-w-xs text-base font-medium leading-relaxed lg:text-lg">
            Ruang kerja tenang untuk menyiapkan kelasmu.
          </p>
        </div>

        {/* Konten — HP: bawah; PC: kiri (wordmark kiri-atas). */}
        <div className="hero-body relative flex flex-col p-6 lg:order-1 lg:p-10">
          <div className="hidden lg:block">{wordmark}</div>
          <div className="flex flex-1 flex-col justify-center py-6 lg:py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-deep sm:text-sm">
              {greetingByHour(jamAngka)}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
              {profil.nama}
            </h1>
            <p className="mt-4 text-sm text-ink-2">
              {hari}, {tanggal} {bulanTahun}
              {label ? ` · ${label}` : ''}
            </p>
            <p className="font-grotesk mt-1 text-2xl font-bold tabular-nums text-emerald-deep">
              {jam}
            </p>
          </div>
          <button
            type="button"
            onClick={masuk}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-3.5 text-base font-semibold text-on-fill transition-colors hover:bg-brand-hover active:bg-brand-active"
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
