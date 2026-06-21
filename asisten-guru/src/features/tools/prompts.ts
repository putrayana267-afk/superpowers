/**
 * Builder prompt — modul ini SENGAJA bebas dari import React/lucide sehingga
 * dapat diimpor oleh serverless function (`api/generate.ts`) maupun frontend.
 *
 * Alur: server menerima { toolId, inputs }, lalu memanggil buildSystemPrompt()
 * dan buildUserPrompt(toolId, inputs) untuk menyusun pesan ke Anthropic API.
 */

import type { ToolInputs } from './types';

/** System prompt dasar yang dipakai semua alat. */
export const BASE_SYSTEM_PROMPT =
  'Kamu asisten ahli untuk guru di Indonesia yang memahami Kurikulum Merdeka. ' +
  'Jawab dalam Bahasa Indonesia, langsung ke hasil, akurat secara pedagogis, lengkap, dan siap pakai. ' +
  'Gunakan format Markdown yang rapi (judul, daftar, tabel bila perlu). ' +
  'Jangan menambahkan basa-basi pembuka atau penutup di luar materi yang diminta.';

/** Apakah nilai toggle bernilai aktif. */
function isOn(value: string | undefined): boolean {
  return value === 'true' || value === 'on' || value === '1';
}

/** Ambil nilai input dengan fallback string kosong yang sudah di-trim. */
function val(inputs: ToolInputs, key: string): string {
  return (inputs[key] ?? '').trim();
}

/** Susun daftar konteks "Label: nilai" dari pasangan yang diberikan. */
function contextLines(pairs: Array<[string, string]>): string {
  return pairs
    .filter(([, value]) => value.length > 0)
    .map(([label, value]) => `- ${label}: ${value}`)
    .join('\n');
}

type Builder = (inputs: ToolInputs) => { instruction: string; context: string };

const builders: Record<string, Builder> = {
  'modul-ajar': (i) => ({
    context: contextLines([
      ['Mata pelajaran', val(i, 'mapel')],
      ['Kelas/Fase', val(i, 'kelas')],
      ['Topik', val(i, 'topik')],
      ['Alokasi waktu', val(i, 'waktu')],
      ['Catatan tambahan', val(i, 'catatan')],
    ]),
    instruction:
      'Buat MODUL AJAR Kurikulum Merdeka yang lengkap dan siap pakai. Sertakan bagian berurutan:\n' +
      '1. **Tujuan Pembelajaran** (poin-poin yang terukur).\n' +
      '2. **Profil Pelajar Pancasila** (dimensi yang relevan beserta alasan singkat).\n' +
      '3. **Media & Alat** yang dibutuhkan.\n' +
      '4. **Kegiatan Pembelajaran** dengan sub-bagian Pendahuluan, Inti, dan Penutup; ' +
      'cantumkan estimasi menit pada tiap sub-bagian agar total sesuai alokasi waktu.\n' +
      '5. **Asesmen** (jenis asesmen) disertai contoh instrumen/pertanyaan nyata.' +
      (isOn(val(i, 'islami'))
        ? '\nIntegrasikan nilai-nilai Islami secara wajar dan relevan pada tujuan dan kegiatan, tanpa memaksakan.'
        : ''),
  }),

  'bank-soal': (i) => ({
    context: contextLines([
      ['Mata pelajaran', val(i, 'mapel')],
      ['Kelas', val(i, 'kelas')],
      ['Topik', val(i, 'topik')],
      ['Jenis soal', val(i, 'jenis')],
      ['Jumlah soal', val(i, 'jumlah')],
      ['Tingkat kesulitan', val(i, 'kesulitan')],
    ]),
    instruction:
      'Buat BANK SOAL sesuai parameter di atas. Aturan:\n' +
      '- Tulis soal bernomor urut.\n' +
      '- Untuk soal Pilihan Ganda: sediakan 4 opsi (A, B, C, D) dengan tepat satu jawaban benar.\n' +
      '- Setelah seluruh soal, buat bagian terpisah dengan judul **KUNCI JAWABAN**.\n' +
      '- Untuk soal Esai/Isian/HOTS: pada kunci jawaban sertakan poin-poin penilaian atau jawaban acuan.\n' +
      '- Pastikan tingkat kesulitan konsisten dengan yang diminta (HOTS = analisis/evaluasi/mencipta).',
  }),

  lkpd: (i) => ({
    context: contextLines([
      ['Mata pelajaran', val(i, 'mapel')],
      ['Kelas', val(i, 'kelas')],
      ['Topik', val(i, 'topik')],
      ['Tujuan', val(i, 'tujuan')],
      ['Jenis aktivitas', val(i, 'aktivitas')],
    ]),
    instruction:
      'Buat LKPD (Lembar Kerja Peserta Didik) lengkap dengan struktur:\n' +
      '1. **Judul LKPD**.\n' +
      '2. **Tujuan**.\n' +
      '3. **Alat & Bahan**.\n' +
      '4. **Petunjuk Pengerjaan**.\n' +
      '5. **Langkah Kegiatan** (berurutan dan jelas).\n' +
      '6. **Pertanyaan Refleksi**.\n' +
      '7. **Kolom Jawaban** (sediakan ruang/garis kosong yang ditandai untuk diisi siswa).',
  }),

  rubrik: (i) => ({
    context: contextLines([
      ['Tugas/kegiatan dinilai', val(i, 'tugas')],
      ['Kelas', val(i, 'kelas')],
      ['Aspek yang dinilai', val(i, 'aspek')],
      ['Skala', val(i, 'skala')],
    ]),
    instruction:
      'Buat RUBRIK PENILAIAN dalam bentuk tabel Markdown. Aturan:\n' +
      '- Baris = kriteria/aspek penilaian; kolom = level pencapaian sesuai skala.\n' +
      '- Setiap sel berisi deskriptor yang jelas dan dapat diamati.\n' +
      '- Setelah tabel, jelaskan **Cara Menghitung Nilai Akhir** beserta contoh perhitungan.',
  }),

  sederhana: (i) => ({
    context: contextLines([
      ['Untuk kelas', val(i, 'kelas')],
      ['Gaya penyajian', val(i, 'gaya')],
      ['Materi asli', val(i, 'materi')],
    ]),
    instruction:
      'Sederhanakan materi di atas agar mudah dipahami siswa pada kelas yang dituju, ' +
      'menggunakan gaya penyajian yang diminta. Jaga keakuratan konsep. ' +
      'Akhiri dengan bagian berjudul **INTI YANG HARUS DIINGAT** berisi tepat 3 poin paling penting.',
  }),

  rapor: (i) => ({
    context: contextLines([
      ['Nama siswa', val(i, 'nama')],
      ['Aspek/mapel', val(i, 'aspek')],
      ['Catatan tentang siswa', val(i, 'catatan')],
      ['Nada', val(i, 'nada')],
    ]),
    instruction:
      'Buat 3 ALTERNATIF komentar rapor / deskripsi capaian. Aturan tiap alternatif:\n' +
      '- Panjang 2–3 kalimat.\n' +
      '- Sebutkan kekuatan siswa terlebih dahulu, lalu area pengembangan secara positif dan membangun.\n' +
      '- Gunakan nada yang diminta dan hindari kalimat yang menjatuhkan.\n' +
      '- Bila nama siswa kosong, gunakan frasa netral seperti "Ananda".' +
      (isOn(val(i, 'islami'))
        ? '\nSelipkan nuansa Islami yang santun bila relevan.'
        : ''),
  }),

  'ide-kegiatan': (i) => ({
    context: contextLines([
      ['Mapel/tema', val(i, 'tema')],
      ['Kelas', val(i, 'kelas')],
      ['Tujuan', val(i, 'tujuan')],
      ['Jenis kegiatan', val(i, 'jenis')],
    ]),
    instruction:
      'Buat tepat 4 IDE KEGIATAN. Untuk setiap ide tuliskan:\n' +
      '- **Nama kegiatan**.\n' +
      '- **Durasi** perkiraan.\n' +
      '- **Alat/Bahan** (utamakan yang murah dan mudah didapat).\n' +
      '- **Langkah** singkat 3–4 langkah.\n' +
      'Pastikan semua kegiatan aman untuk siswa dan hemat biaya.',
  }),

  'komunikasi-ortu': (i) => ({
    context: contextLines([
      ['Tujuan pesan', val(i, 'tujuan')],
      ['Konteks singkat', val(i, 'konteks')],
      ['Kanal', val(i, 'kanal')],
      ['Nada', val(i, 'nada')],
    ]),
    instruction:
      'Buat draf pesan komunikasi kepada orang tua yang siap kirim. Aturan:\n' +
      '- Sopan, jelas, ringkas, dan langsung pada tujuan.\n' +
      '- Sesuaikan dengan kanal: untuk WhatsApp gunakan gaya pesan singkat; ' +
      'untuk surat sertakan pembuka dan penutup formal.\n' +
      '- Gunakan nada yang diminta.',
  }),

  'kisi-kisi': (i) => ({
    context: contextLines([
      ['Mata pelajaran', val(i, 'mapel')],
      ['Kelas', val(i, 'kelas')],
      ['Materi/cakupan', val(i, 'materi')],
      ['Jumlah soal', val(i, 'jumlah')],
      ['Bentuk soal', val(i, 'bentuk')],
    ]),
    instruction:
      'Buat KISI-KISI SOAL dalam bentuk tabel Markdown. Aturan:\n' +
      '- Kolom tabel: No, Tujuan Pembelajaran/Kompetensi, Materi, Indikator Soal, ' +
      'Level Kognitif (C1–C6), Bentuk Soal, Nomor Soal.\n' +
      '- Jumlah baris sesuai jumlah soal yang diminta dan gunakan bentuk soal yang dipilih.\n' +
      '- Indikator soal harus operasional dan dapat diukur.\n' +
      '- Setelah tabel, beri ringkasan singkat **Sebaran Level Kognitif** (berapa soal per level).',
  }),
};

/** Daftar toolId yang valid (dipakai untuk validasi di server). */
export const VALID_TOOL_IDS = Object.keys(builders);

export function buildSystemPrompt(): string {
  return BASE_SYSTEM_PROMPT;
}

/**
 * Susun user prompt untuk sebuah alat. Melempar error bila toolId tidak dikenal.
 */
export function buildUserPrompt(toolId: string, inputs: ToolInputs): string {
  const builder = builders[toolId];
  if (!builder) {
    throw new Error(`toolId tidak dikenal: ${toolId}`);
  }
  const { instruction, context } = builder(inputs);
  const contextBlock = context
    ? `Berikut informasi dari guru:\n${context}\n\n`
    : '';
  return `${contextBlock}${instruction}`;
}
