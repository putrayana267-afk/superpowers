/**
 * Tema tampilan: gelap (default, identitas Akhid Noir) atau terang.
 *
 * Nilai warnanya sendiri ada di CSS var (`src/index.css`); modul ini hanya
 * mengurus PILIHAN: baca, simpan, dan pasang `data-theme` di <html>.
 *
 * Penting: pemasangan PERTAMA terjadi lebih dulu lewat skrip inline di
 * `index.html` — sebelum paint, supaya tak ada kedip gelap→terang saat reload.
 * Modul ini dipakai setelah React hidup. Keduanya sengaja memakai kunci
 * localStorage yang sama.
 */

export type Theme = 'dark' | 'light';

/**
 * Gerbang fitur tema terang. Migrasi token terang selesai (slice 1–7) dan lolos
 * gerbang visual manusia 3 ronde (2026-07-18) — tema terang DIBUKA untuk guru.
 * Boot tetap DEFAULT_THEME (gelap); terang murni opt-in via kartu "Tampilan".
 * `false` = sembunyikan kembali kartu Tampilan (tree-shaken) & paksa gelap.
 */
export const TEMA_TERANG_AKTIF = true;

/** Dipakai juga oleh skrip inline di index.html — ubah keduanya bila diganti. */
export const THEME_KEY = 'akhid-theme';

/** Gelap = identitas app; dipakai bila belum pernah memilih / storage diblokir. */
export const DEFAULT_THEME: Theme = 'dark';

const isTheme = (v: unknown): v is Theme => v === 'dark' || v === 'light';

/** Pilihan tersimpan; DEFAULT_THEME bila belum ada atau storage tak bisa dibaca. */
export function loadTheme(): Theme {
  // Fitur ditutup → abaikan apa pun yang tersimpan, termasuk 'light' yang
  // terlanjur dipilih sebelum gerbang ini dipasang.
  if (!TEMA_TERANG_AKTIF) return DEFAULT_THEME;
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return isTheme(stored) ? stored : DEFAULT_THEME;
  } catch {
    // Storage diblokir (mode privat/WebView ketat) — jangan sampai app mati.
    return DEFAULT_THEME;
  }
}

/**
 * Pasang tema ke DOM. Gelap = tanpa atribut, karena :root SUDAH gelap —
 * atribut hanya dipasang untuk terang agar selektor [data-theme="light"] aktif.
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'light') {
    root.dataset.theme = 'light';
  } else {
    delete root.dataset.theme;
  }
}

/** Simpan pilihan. Gagal menyimpan tidak boleh membatalkan perubahan tampilan. */
export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // abaikan: tema tetap berlaku untuk sesi ini
  }
}

/** Pasang + simpan sekaligus. Dipakai tombol toggle. */
export function setTheme(theme: Theme): void {
  applyTheme(theme);
  saveTheme(theme);
}
