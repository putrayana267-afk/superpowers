/**
 * Builder prompt sisi-CLIENT untuk panggilan Gemini LANGSUNG di native (BYOK).
 *
 * Logikanya SAMA PERSIS dengan builder di `api/generate.ts` & `api/suggest.ts`.
 * Disalin di sini karena server (folder api/, Vercel) tidak bisa mengimpor dari
 * `src/`. Jalur web tetap memakai serverless; jalur native memakai modul ini.
 */

import type { ToolInputs } from './types';

export const BASE_SYSTEM_PROMPT =
  'Kamu asisten ahli untuk guru di Indonesia yang memahami Kurikulum Merdeka. ' +
  'Jawab dalam Bahasa Indonesia, langsung ke hasil, akurat secara pedagogis, lengkap, dan siap pakai. ' +
  'Gunakan format Markdown yang rapi (judul, daftar, tabel bila perlu). ' +
  'Jangan menambahkan basa-basi pembuka atau penutup di luar materi yang diminta.';

export const SUGGEST_SYSTEM_PROMPT =
  'Kamu asisten guru di Indonesia yang memahami Kurikulum Merdeka. ' +
  'Jawab ringkas dan langsung dalam Bahasa Indonesia, tanpa basa-basi, ' +
  'tanpa kalimat pembuka/penutup. Ikuti format yang diminta pada instruksi.';

function val(inputs: ToolInputs, key: string): string {
  return (inputs[key] ?? '').trim();
}

function contextLines(pairs: Array<[string, string]>): string {
  return pairs
    .filter(([, value]) => value.length > 0)
    .map(([label, value]) => `- ${label}: ${value}`)
    .join('\n');
}

type Builder = (inputs: ToolInputs) => { instruction: string; context: string };

/** Baris konteks kurikulum yang dipakai semua alat. */
function kurikulumContext(i: ToolInputs): Array<[string, string]> {
  return [
    ['Jenjang pendidikan', val(i, 'jenjang')],
    ['Kelas/Tingkat', val(i, 'kelas')],
    ['Kelompok kurikulum', val(i, 'kelompok')],
    ['Mata pelajaran/Rumpun kitab', val(i, 'mapel')],
    ['Pokok pembahasan (materi/kitab)', val(i, 'pokok')],
  ];
}

const builders: Record<string, Builder> = {
  'modul-ajar': (i) => ({
    context: contextLines([
      ...kurikulumContext(i),
      ['Alokasi waktu', val(i, 'waktu')],
      ['Profil Pelajar Pancasila yang ditekankan', val(i, 'profil')],
    ]),
    instruction:
      'Buat MODUL AJAR Kurikulum Merdeka yang lengkap dan siap pakai untuk pokok pembahasan di atas. Sertakan bagian berurutan:\n' +
      '1. **Tujuan Pembelajaran** (poin-poin yang terukur).\n' +
      '2. **Profil Pelajar Pancasila** (tonjolkan dimensi yang ditekankan beserta alasan singkat).\n' +
      '3. **Media & Alat** yang dibutuhkan.\n' +
      '4. **Kegiatan Pembelajaran** dengan sub-bagian Pendahuluan, Inti, dan Penutup; ' +
      'cantumkan estimasi menit pada tiap sub-bagian agar total sesuai alokasi waktu.\n' +
      '5. **Asesmen** (jenis asesmen) disertai contoh instrumen/pertanyaan nyata.\n' +
      'Sesuaikan kedalaman materi dengan jenjang dan kelompok kurikulum yang dipilih ' +
      '(untuk Kekhasan Pesantren, gunakan pendekatan kitab kuning/dirasah islamiyah).',
  }),

  'bank-soal': (i) => {
    const clampInt = (v: string): number => {
      const n = Math.floor(Number(v));
      return Number.isFinite(n) && n > 0 ? n : 0;
    };
    const nPg = clampInt(val(i, 'jumlahPg'));
    const nIsian = clampInt(val(i, 'jumlahIsian'));
    const nEsai = clampInt(val(i, 'jumlahEsai'));
    const total = nPg + nIsian + nEsai;

    const context = contextLines([
      ...kurikulumContext(i),
      ['Jumlah Pilihan Ganda', String(nPg)],
      ['Jumlah Isian', String(nIsian)],
      ['Jumlah Esai', String(nEsai)],
      ['Total soal', String(total)],
      ['Tingkat kesulitan kognitif', val(i, 'kesulitan')],
    ]);

    if (total === 0) {
      return {
        context,
        instruction:
          'Tidak ada soal yang diminta (jumlah Pilihan Ganda, Isian, dan Esai semuanya 0). ' +
          'Nyatakan dengan sopan bahwa belum ada soal yang dapat dibuat, lalu minta guru mengisi ' +
          'setidaknya satu jumlah soal. Jangan mengarang soal.',
      };
    }

    const pakaiHeader = [nPg, nIsian, nEsai].filter((n) => n > 0).length > 1;

    const formatPg = (n: number): string =>
      (pakaiHeader ? `### Pilihan Ganda (${n} soal)\n` : '') +
      'Format tiap butir soal:\n' +
      '- Nomor urut dan pertanyaan yang jelas.\n' +
      '- 5 pilihan jawaban berlabel A, B, C, D, E (tepat satu yang benar).\n' +
      '- **Kunci Jawaban**: tulis hurufnya.\n' +
      '- **Pembahasan**: penjelasan ringkas mengapa jawaban itu benar.\n' +
      `Hasilkan TEPAT ${n} soal untuk bagian ini, dengan penomoran berurutan.\n`;
    const formatIsian = (n: number): string =>
      (pakaiHeader ? `### Isian (${n} soal)\n` : '') +
      'Format tiap butir soal:\n' +
      '- Nomor urut dan kalimat/pertanyaan RUMPANG dengan penanda kosong (mis. _____) untuk diisi siswa.\n' +
      '- **Kunci Jawaban**: jawaban yang diterima; bila ada, sebutkan variasi jawaban yang sah.\n' +
      '- **Pembahasan**: penjelasan ringkas mengapa jawaban itu benar.\n' +
      'TANPA pilihan A–E dan TANPA kunci berupa huruf.\n' +
      `Hasilkan TEPAT ${n} soal untuk bagian ini, dengan penomoran berurutan.\n`;
    const formatEsai = (n: number): string =>
      (pakaiHeader ? `### Esai (${n} soal)\n` : '') +
      'Format tiap butir soal:\n' +
      '- Nomor urut dan pertanyaan TERBUKA yang jelas.\n' +
      '- **Rubrik/Kriteria Penilaian**: kriteria penilaian (atau jawaban model beserta poin).\n' +
      '- **Pembahasan**: penjelasan ringkas poin-poin jawaban yang diharapkan.\n' +
      'TANPA pilihan A–E dan TANPA kunci berupa huruf.\n' +
      `Hasilkan TEPAT ${n} soal untuk bagian ini, dengan penomoran berurutan.\n`;

    const seksi: string[] = [];
    if (nPg > 0) seksi.push(formatPg(nPg));
    if (nIsian > 0) seksi.push(formatIsian(nIsian));
    if (nEsai > 0) seksi.push(formatEsai(nEsai));

    const pembuka =
      `Hasilkan soal dengan komposisi PERSIS: ${nPg} Pilihan Ganda, ${nIsian} Isian, ${nEsai} Esai (total ${total} soal). ` +
      'Jangan menyingkat dan jangan berhenti sebelum SEMUA soal selesai.\n\n';
    const penutup =
      '\nSesuaikan dengan tingkat kesulitan kognitif yang diminta (C1–C2 mudah, C3–C4 sedang, C5–C6 sulit) ' +
      'serta jenjang, mata pelajaran, dan pokok pembahasan di atas. ' +
      'Tulis dalam Markdown rapi dengan penomoran yang jelas.\n\n' +
      'TATA LETAK WAJIB (Markdown): pisahkan tiap butir soal dengan satu baris kosong; ' +
      'untuk pilihan ganda, tulis kelima pilihan A, B, C, D, E sebagai daftar Markdown, SATU pilihan per baris (tiap baris diawali "- "); ' +
      'tulis "Kunci Jawaban", "Pembahasan", dan "Rubrik" masing-masing pada baris tersendiri, dipisahkan dari badan soal oleh baris kosong; ' +
      'JANGAN menaruh beberapa pilihan atau beberapa label pada satu baris yang sama.';

    return {
      context,
      instruction: pembuka + seksi.join('\n') + penutup,
    };
  },

  lkpd: (i) => ({
    context: contextLines([
      ...kurikulumContext(i),
      ['Metode pembelajaran', val(i, 'metode')],
      ['Petunjuk singkat kegiatan', val(i, 'petunjuk')],
    ]),
    instruction:
      'Buat LKPD (Lembar Kerja Peserta Didik) lengkap, selaras dengan metode pembelajaran dan petunjuk singkat di atas, dengan struktur:\n' +
      '1. **Judul LKPD**.\n' +
      '2. **Tujuan**.\n' +
      '3. **Alat & Bahan**.\n' +
      '4. **Petunjuk Pengerjaan**.\n' +
      '5. **Langkah Kegiatan** (berurutan dan jelas, mencerminkan metode pembelajaran).\n' +
      '6. **Pertanyaan Refleksi**.\n' +
      '7. **Kolom Jawaban** (sediakan ruang/garis kosong yang ditandai untuk diisi siswa).',
  }),

  rubrik: (i) => {
    const levelRaw = val(i, 'level') || '4 Level';
    const levelNum = levelRaw.match(/\d+/)?.[0] ?? '4';
    return {
      context: contextLines([
        ...kurikulumContext(i),
        ['Tugas/proyek yang dinilai', val(i, 'tugas')],
        ['Fokus kriteria', val(i, 'fokus')],
        ['Jumlah level skor', levelRaw],
      ]),
      instruction:
        'Buat RUBRIK PENILAIAN dalam bentuk tabel Markdown. Aturan:\n' +
        `- Gunakan tepat ${levelNum} level pencapaian sebagai kolom skor.\n` +
        '- Baris = kriteria penilaian (turunkan dari fokus kriteria di atas).\n' +
        '- Setiap sel berisi deskriptor yang jelas dan dapat diamati.\n' +
        '- Setelah tabel, jelaskan **Cara Menghitung Nilai Akhir** beserta contoh perhitungan.',
    };
  },

  sederhana: (i) => ({
    context: contextLines([
      ...kurikulumContext(i),
      ['Gaya bahasa/tone', val(i, 'gaya')],
    ]),
    instruction:
      'Jelaskan ulang POKOK PEMBAHASAN di atas agar mudah dipahami siswa pada jenjang yang dituju, ' +
      'menggunakan gaya bahasa/tone yang diminta. Jaga keakuratan konsep. ' +
      'Akhiri dengan bagian berjudul **INTI YANG HARUS DIINGAT** berisi tepat 3 poin paling penting.',
  }),

  rapor: (i) => ({
    context: contextLines([
      ...kurikulumContext(i),
      ['Nama siswa', val(i, 'nama')],
      ['Capaian terbaik', val(i, 'capaian')],
      ['Aspek perlu ditingkatkan', val(i, 'peningkatan')],
    ]),
    instruction:
      'Buat 3 ALTERNATIF komentar rapor / deskripsi capaian. Aturan tiap alternatif:\n' +
      '- Panjang 2–3 kalimat.\n' +
      '- Sebutkan capaian terbaik terlebih dahulu, lalu aspek yang perlu ditingkatkan secara positif dan membangun.\n' +
      '- Kaitkan dengan mata pelajaran/pokok pembahasan bila relevan.\n' +
      '- Bila nama siswa kosong, gunakan frasa netral seperti "Ananda".',
  }),

  'ide-kegiatan': (i) => ({
    context: contextLines([
      ...kurikulumContext(i),
      ['Jenis kegiatan', val(i, 'jenis')],
    ]),
    instruction:
      'Buat tepat 4 IDE KEGIATAN bertipe sesuai jenis kegiatan yang dipilih, relevan dengan pokok pembahasan di atas. ' +
      'Untuk setiap ide tuliskan:\n' +
      '- **Nama kegiatan**.\n' +
      '- **Durasi** perkiraan.\n' +
      '- **Alat/Bahan** (utamakan yang murah dan mudah didapat).\n' +
      '- **Langkah** singkat 3–4 langkah.\n' +
      'Pastikan semua kegiatan aman untuk siswa dan hemat biaya.',
  }),

  'komunikasi-ortu': (i) => ({
    context: contextLines([
      ...kurikulumContext(i),
      ['Nama murid', val(i, 'nama')],
      ['Tujuan pesan', val(i, 'tujuan')],
      ['Saluran', val(i, 'saluran')],
      ['Catatan spesifik', val(i, 'catatan')],
    ]),
    instruction:
      'Buat draf pesan komunikasi kepada orang tua/wali yang siap kirim. Aturan:\n' +
      '- Sopan, jelas, ringkas, dan langsung pada tujuan.\n' +
      '- Sesuaikan dengan saluran: untuk WhatsApp gunakan gaya pesan singkat dan hangat; ' +
      'untuk Email sertakan baris subjek, salam pembuka, isi, dan penutup formal.\n' +
      '- Sebut nama murid dan kaitkan dengan catatan spesifik di atas.',
  }),

  'kisi-kisi': (i) => ({
    context: contextLines([
      ...kurikulumContext(i),
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

export function buildSystemPrompt(): string {
  return BASE_SYSTEM_PROMPT;
}

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

/** Susun prompt untuk "saran cepat" (autofill field) — sama dengan api/suggest. */
export function buildSuggestPrompt(
  instruction: string,
  context: Record<string, string>,
): string {
  const lines = Object.entries(context)
    .filter(([, v]) => v.trim().length > 0)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');
  const ctxBlock = lines ? `Konteks:\n${lines}\n\n` : '';
  return `${ctxBlock}${instruction}`;
}
