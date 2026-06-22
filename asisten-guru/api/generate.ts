/**
 * Serverless proxy ke Google Gemini API.
 *
 * KEAMANAN: GEMINI_API_KEY hanya dibaca di sini (sisi server) dari environment
 * variable dan TIDAK PERNAH dikirim ke frontend. Frontend hanya memanggil
 * endpoint ini dengan { toolId, inputs }.
 */

// ---------------------------------------------------------------------------
// Builder prompt (di-inline di sini, BUKAN diimpor dari file lain).
// Alasan: runtime ESM Vercel tidak dapat me-resolve impor relatif tanpa
// ekstensi (mis. './_prompts'), sehingga seluruh logika prompt ditaruh langsung
// di file fungsi ini agar tidak ada modul terpisah yang perlu di-resolve.
// ---------------------------------------------------------------------------

type ToolInputs = Record<string, string>;

const BASE_SYSTEM_PROMPT =
  'Kamu asisten ahli untuk guru di Indonesia yang memahami Kurikulum Merdeka. ' +
  'Jawab dalam Bahasa Indonesia, langsung ke hasil, akurat secara pedagogis, lengkap, dan siap pakai. ' +
  'Gunakan format Markdown yang rapi (judul, daftar, tabel bila perlu). ' +
  'Jangan menambahkan basa-basi pembuka atau penutup di luar materi yang diminta.';

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
    const jumlah = val(i, 'jumlah') || '5';
    return {
      context: contextLines([
        ...kurikulumContext(i),
        ['Jumlah soal', jumlah],
        ['Tingkat kesulitan kognitif', val(i, 'kesulitan')],
      ]),
      instruction:
        `Hasilkan TEPAT ${jumlah} butir soal LENGKAP (pertanyaan + pilihan A-E + kunci jawaban + pembahasan). ` +
        `Jangan berhenti sebelum SEMUA ${jumlah} soal selesai. Jangan menyingkat.\n\n` +
        'Format tiap butir soal:\n' +
        '- Nomor urut dan pertanyaan yang jelas.\n' +
        '- 5 pilihan jawaban berlabel A, B, C, D, E (tepat satu yang benar).\n' +
        '- **Kunci Jawaban**: tulis hurufnya.\n' +
        '- **Pembahasan**: penjelasan ringkas mengapa jawaban itu benar.\n' +
        'Sesuaikan dengan tingkat kesulitan kognitif yang diminta (C1–C2 mudah, C3–C4 sedang, C5–C6 sulit) ' +
        'serta jenjang, mata pelajaran, dan pokok pembahasan di atas.',
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

const VALID_TOOL_IDS = Object.keys(builders);

function buildSystemPrompt(): string {
  return BASE_SYSTEM_PROMPT;
}

function buildUserPrompt(toolId: string, inputs: ToolInputs): string {
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

// Tipe minimal agar tidak bergantung pada paket @vercel/node.
interface ApiRequest {
  method?: string;
  body?: unknown;
}

interface ApiResponse {
  status(code: number): ApiResponse;
  json(data: unknown): void;
  setHeader(name: string, value: string): void;
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MAX_OUTPUT_TOKENS = 8192;

interface RequestBody {
  toolId?: unknown;
  inputs?: unknown;
}

interface GeminiPart {
  text?: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
}

function isStringRecord(value: unknown): value is Record<string, string> {
  if (typeof value !== 'object' || value === null) return false;
  return Object.values(value as Record<string, unknown>).every(
    (v) => typeof v === 'string',
  );
}

export default async function handler(
  req: ApiRequest,
  res: ApiResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metode tidak diizinkan.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'Server belum dikonfigurasi. Hubungi pengelola aplikasi.',
    });
    return;
  }

  // Body sudah diparse oleh runtime bila content-type application/json.
  let body: RequestBody;
  if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body) as RequestBody;
    } catch {
      res.status(400).json({ error: 'Permintaan tidak valid.' });
      return;
    }
  } else {
    body = (req.body ?? {}) as RequestBody;
  }

  const { toolId, inputs } = body;

  if (typeof toolId !== 'string' || !VALID_TOOL_IDS.includes(toolId)) {
    res.status(400).json({ error: 'Alat yang diminta tidak dikenal.' });
    return;
  }
  if (!isStringRecord(inputs)) {
    res.status(400).json({ error: 'Data input tidak valid.' });
    return;
  }

  const systemPrompt = buildSystemPrompt();

  let userPrompt: string;
  try {
    userPrompt = buildUserPrompt(toolId, inputs);
  } catch {
    res.status(400).json({ error: 'Alat yang diminta tidak dikenal.' });
    return;
  }

  // Satu kali pemanggilan Gemini dengan timeout sisi server.
  const requestBody = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
  });

  const key: string = apiKey;
  async function callGemini(): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55_000);
    try {
      return await fetch(`${GEMINI_URL}?key=${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: requestBody,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  let geminiRes: Response;
  try {
    geminiRes = await callGemini();
    // Retry sederhana: bila kena 429, tunggu 2 detik lalu coba ulang 1x.
    if (geminiRes.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      geminiRes = await callGemini();
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      res.status(504).json({
        error: 'Pembuatan hasil memakan waktu terlalu lama. Coba lagi.',
      });
      return;
    }
    res.status(502).json({
      error: 'Gagal menghubungi layanan AI. Periksa koneksi lalu coba lagi.',
    });
    return;
  }

  if (geminiRes.status === 429) {
    res.status(429).json({
      error: 'Batas pemakaian gratis Gemini tercapai, coba lagi sebentar.',
    });
    return;
  }

  if (!geminiRes.ok) {
    // Jangan bocorkan detail internal ke client.
    res.status(502).json({
      error: 'Terjadi kendala saat membuat hasil. Silakan coba lagi.',
    });
    return;
  }

  let data: GeminiResponse;
  try {
    data = (await geminiRes.json()) as GeminiResponse;
  } catch {
    res.status(502).json({ error: 'Respons dari layanan AI tidak valid.' });
    return;
  }

  // Bila prompt diblokir oleh filter keamanan Gemini.
  if (data.promptFeedback?.blockReason) {
    res.status(502).json({
      error: 'Permintaan tidak dapat diproses. Coba ubah input lalu ulangi.',
    });
    return;
  }

  // Output terpotong karena mencapai batas token.
  if (data.candidates?.[0]?.finishReason === 'MAX_TOKENS') {
    res.status(502).json({
      error: 'Output terpotong, kurangi jumlah soal atau coba lagi.',
    });
    return;
  }

  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text ?? '')
    .join('')
    .trim();

  if (!text) {
    res.status(502).json({
      error: 'Hasil kosong diterima dari layanan AI. Coba buat ulang.',
    });
    return;
  }

  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.status(200).json({ text });
}
