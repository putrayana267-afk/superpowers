import { useCallback, useState } from 'react';
import type { Zona } from './kota';
import { ZONA_TZ } from './kota';

/** Pilihan zona: otomatis ikut perangkat, kota kurasi, atau manual. */
export type PilihanZona =
  | { mode: 'auto' }
  | { mode: 'kota' | 'manual'; nama: string; zona: Zona };

const STORAGE_KEY = 'am.zonaWaktu';

/** Baca pilihan dari localStorage (aman jika kosong/rusak — pola storage.ts). */
function loadPilihan(): PilihanZona {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { mode: 'auto' };
    const parsed = JSON.parse(raw) as Partial<PilihanZona> | null;
    if (parsed && parsed.mode === 'auto') return { mode: 'auto' };
    if (
      parsed &&
      (parsed.mode === 'kota' || parsed.mode === 'manual') &&
      typeof parsed.nama === 'string' &&
      parsed.nama.trim() !== '' &&
      typeof parsed.zona === 'string' &&
      parsed.zona in ZONA_TZ
    ) {
      return { mode: parsed.mode, nama: parsed.nama, zona: parsed.zona };
    }
    return { mode: 'auto' };
  } catch {
    return { mode: 'auto' };
  }
}

function savePilihan(p: PilihanZona): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // Abaikan kegagalan kuota/storage — tidak boleh membuat aplikasi crash.
  }
}

/**
 * Zona waktu & kota terpilih (persist localStorage 'am.zonaWaktu').
 * `timeZone` = identifier IANA untuk Intl, atau undefined saat otomatis
 * (Intl memakai zona perangkat). `label` = nama kota, null saat otomatis.
 */
export function useZonaWaktu() {
  const [pilihan, setPilihanState] = useState<PilihanZona>(loadPilihan);

  const setPilihan = useCallback((p: PilihanZona) => {
    setPilihanState(p);
    savePilihan(p);
  }, []);

  const label = pilihan.mode === 'auto' ? null : pilihan.nama;
  const timeZone = pilihan.mode === 'auto' ? undefined : ZONA_TZ[pilihan.zona];

  return { label, timeZone, pilihan, setPilihan };
}
