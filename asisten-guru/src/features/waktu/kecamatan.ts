import type { Zona } from './kota';

/** Satu kecamatan dari dataset ter-pin (public/data/kecamatan.json). */
export interface Kecamatan {
  /** Nama kecamatan (Title Case). */
  n: string;
  /** Kabupaten/kota ("Kab. X" / "Kota X"). */
  k: string;
  z: Zona;
}

interface DatasetKecamatan {
  v: number;
  entri: Kecamatan[];
}

/** '/' di web/Vercel, './' di APK Capacitor. */
const BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env
  .BASE_URL;

let cache: Kecamatan[] | null = null;
let sedangMuat: Promise<Kecamatan[]> | null = null;

/**
 * Muat dataset kecamatan secara lazy (sekali per sesi, cache modul).
 * Melempar error bila fetch/parse gagal — pemanggil menangani fallback.
 */
export function muatKecamatan(): Promise<Kecamatan[]> {
  if (cache) return Promise.resolve(cache);
  if (!sedangMuat) {
    sedangMuat = fetch(`${BASE}data/kecamatan.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`kecamatan.json HTTP ${res.status}`);
        return res.json() as Promise<DatasetKecamatan>;
      })
      .then((data) => {
        if (!data || !Array.isArray(data.entri) || data.entri.length === 0) {
          throw new Error('kecamatan.json kosong/rusak');
        }
        cache = data.entri;
        return cache;
      })
      .catch((err) => {
        sedangMuat = null; // izinkan percobaan ulang pada sesi berikutnya
        throw err;
      });
  }
  return sedangMuat;
}

/** Cari kecamatan: cocokkan nama kecamatan ATAU kabupaten, case-insensitive. */
export function cariKecamatan(
  daftar: Kecamatan[],
  kueri: string,
): Kecamatan[] {
  const s = kueri.trim().toLowerCase();
  if (!s) return [];
  return daftar.filter(
    (e) => e.n.toLowerCase().includes(s) || e.k.toLowerCase().includes(s),
  );
}
