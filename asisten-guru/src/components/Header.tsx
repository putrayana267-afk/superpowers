import { useState, useEffect } from 'react';
import { ClockCounterClockwise, List, GearSix } from '@phosphor-icons/react';
import { Button } from './Button';
import {
  loadProfil,
  loadFoto,
  inisialDari,
  DEFAULT_PROFIL,
  type Profil,
} from '../lib/profil';

interface HeaderProps {
  onOpenMenu: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  /** Buka halaman Pengaturan (opsional). */
  onOpenSettings?: () => void;
}

export function Header({
  onOpenMenu,
  onOpenHistory,
  historyCount,
  onOpenSettings,
}: HeaderProps) {
  // Profil identitas tersimpan (async). Default aman tampil dulu saat loading
  // → tak ada "flash kosong" pada avatar/nama.
  const [profil, setProfil] = useState<Profil>(DEFAULT_PROFIL);
  const [foto, setFoto] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    loadProfil()
      .then((p) => active && setProfil(p))
      .catch(() => {});
    loadFoto()
      .then((f) => active && setFoto(f))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-white/30 bg-white/5 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Buka daftar alat"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-emerald-deep hover:bg-white/10 lg:hidden"
        >
          <List className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 items-center gap-2.5">
          {foto ? (
            <img
              src={foto}
              alt=""
              className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#4CE896] to-violet font-grotesk text-sm font-bold text-[#04140C]">
              {inisialDari(profil.nama)}
            </span>
          )}
          <p className="min-w-0 max-w-[9rem] truncate font-display font-bold text-emerald-deep">
            {profil.nama}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenHistory}
            icon={<ClockCounterClockwise className="h-4 w-4" />}
            aria-label="Buka riwayat"
          >
            <span className="hidden sm:inline">Riwayat</span>
            {/* Teks GELAP di atas fill emas: aturan keras §14. text-ink di sini
                cuma 1.54:1 (gagal WCAG); #04140C = 11.77:1. */}
            {historyCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-xs font-bold text-[#04140C]">
                {historyCount}
              </span>
            )}
          </Button>
          {onOpenSettings && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenSettings}
              icon={<GearSix className="h-4 w-4" />}
              aria-label="Buka pengaturan"
            >
              <span className="hidden sm:inline">Pengaturan</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
