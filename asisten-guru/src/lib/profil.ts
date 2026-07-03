/**
 * Profil identitas guru (lokal). Persist via getSetting/setSetting (db.ts):
 * SQLite di native, localStorage 'asisten-guru:setting:*' di web — pola sama
 * seperti API key. Teks (nama/mapel/bio) di kunci 'profil'; foto avatar
 * terkompres di kunci terpisah 'profil_foto'. TANPA dependensi baru.
 */
import { getSetting, setSetting } from './db';

export interface Profil {
  nama: string;
  mapel: string;
  bio: string;
}

/** Default aman — pertahankan identitas lama saat profil belum diisi. */
export const DEFAULT_PROFIL: Profil = {
  nama: 'Akhid',
  mapel: 'Bahasa Arab',
  bio: '',
};

const PROFIL_KEY = 'profil';
const FOTO_KEY = 'profil_foto';

/** Ukuran sisi maksimum foto avatar setelah resize (px). */
const FOTO_MAKS = 384;

/** Inisial 1–2 huruf dari nama (logika PremiumHero lama). Fallback 'G'. */
export function inisialDari(nama: string): string {
  return (
    nama
      .split(/\s+/)
      .map((k) => k[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'G'
  );
}

/** Baca profil teks; gabung dengan default bila kosong/rusak (tak pernah throw). */
export async function loadProfil(): Promise<Profil> {
  try {
    const raw = await getSetting(PROFIL_KEY);
    if (!raw) return { ...DEFAULT_PROFIL };
    const parsed = JSON.parse(raw) as Partial<Profil> | null;
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_PROFIL };
    return {
      nama:
        typeof parsed.nama === 'string' && parsed.nama.trim() !== ''
          ? parsed.nama
          : DEFAULT_PROFIL.nama,
      mapel:
        typeof parsed.mapel === 'string' && parsed.mapel.trim() !== ''
          ? parsed.mapel
          : DEFAULT_PROFIL.mapel,
      bio: typeof parsed.bio === 'string' ? parsed.bio : '',
    };
  } catch {
    return { ...DEFAULT_PROFIL };
  }
}

/** Simpan profil teks. Error dibiarkan merambat (pemanggil tampilkan toast). */
export async function saveProfil(p: Profil): Promise<void> {
  await setSetting(PROFIL_KEY, JSON.stringify(p));
}

/** Baca foto avatar; null bila kosong/bukan data URL (tak pernah throw). */
export async function loadFoto(): Promise<string | null> {
  try {
    const raw = await getSetting(FOTO_KEY);
    return raw && raw.startsWith('data:') ? raw : null;
  } catch {
    return null;
  }
}

export async function saveFoto(dataUrl: string): Promise<void> {
  await setSetting(FOTO_KEY, dataUrl);
}

/** Hapus foto → kembali ke inisial. */
export async function hapusFoto(): Promise<void> {
  await setSetting(FOTO_KEY, '');
}

/**
 * Kompres File gambar → data URL JPEG (sisi maks FOTO_MAKS, kualitas 0.7).
 * Resize di klien via <canvas> agar hemat kuota storage (~5MB localStorage web).
 * Menolak bila bukan gambar / gagal decode. Tanpa dependensi baru.
 */
export function kompresGambar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Berkas bukan gambar.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memuat gambar.'));
      img.onload = () => {
        const skala = Math.min(1, FOTO_MAKS / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * skala));
        const h = Math.max(1, Math.round(img.height * skala));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Kanvas tak tersedia.'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
