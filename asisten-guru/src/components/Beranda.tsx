import { LayoutDashboard, Users, ClipboardCheck, Award } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface DashTile {
  id: string;
  label: string;
  icon: LucideIcon;
}

// Tile dashboard shell. SENGAJA empty-state jujur: TANPA angka palsu, TANPA
// data siswa. Lapisan data menyusul di modul nyata pertama, bukan di sini.
const TILES: DashTile[] = [
  { id: 'siswa', label: 'Siswa', icon: Users },
  { id: 'absensi', label: 'Absensi', icon: ClipboardCheck },
  { id: 'nilai', label: 'Nilai', icon: Award },
];

/**
 * Beranda — dashboard placeholder (rangka shell). Reuse GlassCard + token noir
 * yang sudah ada; tidak memperkenalkan font/warna baru. Aesthetic Akhid Noir
 * (Cormorant dsb.) menyusul di fase lain.
 */
export function Beranda() {
  return (
    <>
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-soft text-emerald-deep gold-edge">
            <LayoutDashboard className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-xl font-extrabold text-emerald-deep sm:text-2xl">
              Beranda
            </h1>
            <p className="text-sm text-ink/60">
              Ringkasan kelas Anda. Modul data sedang disiapkan.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map(({ id, label, icon: Icon }) => (
          <GlassCard
            key={id}
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-soft text-emerald-deep gold-edge">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="font-display text-lg font-bold text-emerald-deep">
              {label}
            </h2>
            <span className="mt-2 inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
              Segera hadir
            </span>
          </GlassCard>
        ))}
      </div>
    </>
  );
}
