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

const GEMINI_MODEL = 'gemini-2.5-flash';
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

// ---- Multi-key + auto-retry untuk error sementara dari Gemini ------------

const MAX_ATTEMPTS = 4;
const PER_ATTEMPT_TIMEOUT_MS = 30_000;
/** Status yang diulang pada KEY YANG SAMA (error sementara di sisi server). */
const SAME_KEY_RETRYABLE = new Set([500, 503]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Backoff eksponensial ~1s, 2s, 4s + jitter acak 0–300ms. */
function backoffMs(attempt: number): number {
  return 1000 * 2 ** (attempt - 1) + Math.floor(Math.random() * 300);
}

/** Parse Retry-After (detik atau HTTP-date) → ms, dibatasi maksimal 10 detik. */
function parseRetryAfter(value: string | null): number | null {
  if (!value) return null;
  const secs = Number(value);
  if (Number.isFinite(secs)) return Math.min(Math.max(secs, 0) * 1000, 10_000);
  const date = Date.parse(value);
  if (!Number.isNaN(date)) return Math.max(0, Math.min(date - Date.now(), 10_000));
  return null;
}

/** Penanda semua percobaan pada satu key gagal di level jaringan/timeout. */
class GeminiNetworkError extends Error {}

/**
 * Kumpulkan daftar API key Gemini dari env (GEMINI_API_KEY_1..3 + GEMINI_API_KEY
 * lama sebagai fallback). Abaikan yang kosong, buang duplikat. Nilai key TIDAK
 * pernah di-log atau dikirim ke client.
 */
function collectGeminiKeys(): string[] {
  const candidates = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY,
  ];
  const keys: string[] = [];
  for (const c of candidates) {
    const v = (c ?? '').trim();
    if (v && !keys.includes(v)) keys.push(v);
  }
  return keys;
}

/**
 * Panggil Gemini memakai SATU key, dengan retry backoff untuk error sementara
 * (503/500 + gagal jaringan/timeout) pada key yang sama. 429/403/400/401 TIDAK
 * di-retry di sini (ditangani failover antar-key). Mengembalikan Response
 * terakhir; melempar GeminiNetworkError bila semua percobaan gagal di jaringan.
 * `keyIndex` (1-based) hanya untuk log — isi key tidak pernah di-log.
 */
async function fetchGeminiSingleKey(
  key: string,
  requestBody: string,
  label: string,
  keyIndex: number,
): Promise<Response> {
  const url = `${GEMINI_URL}?key=${encodeURIComponent(key)}`;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PER_ATTEMPT_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: requestBody,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      const reason = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      console.error(
        `[${label}] key #${keyIndex} gagal jaringan/timeout (percobaan ${attempt}/${MAX_ATTEMPTS}): ${reason}`,
      );
      if (attempt < MAX_ATTEMPTS) {
        await sleep(backoffMs(attempt));
        continue;
      }
      throw new GeminiNetworkError(reason);
    }
    clearTimeout(timeout);

    if (SAME_KEY_RETRYABLE.has(response.status) && attempt < MAX_ATTEMPTS) {
      const peek = await response.text().catch(() => '');
      console.error(
        `[${label}] key #${keyIndex} status ${response.status} (percobaan ${attempt}/${MAX_ATTEMPTS}): ${peek.slice(0, 300)}`,
      );
      const wait =
        parseRetryAfter(response.headers.get('retry-after')) ?? backoffMs(attempt);
      await sleep(wait);
      continue;
    }

    return response;
  }
  // Tidak tercapai (loop selalu return/throw); untuk kepuasan tipe.
  throw new GeminiNetworkError('habis percobaan');
}

type FailureKind = 'limit' | 'config' | 'temporary';

/** Klasifikasikan kegagalan sebuah key untuk menentukan pesan akhir + failover. */
function classifyFailure(status: number, body: string): FailureKind {
  const lower = body.toLowerCase();
  if (status === 429) return 'limit';
  if (status === 403) {
    const quota =
      lower.includes('quota') ||
      lower.includes('limit') ||
      lower.includes('exhausted') ||
      lower.includes('resource_exhausted');
    return quota ? 'limit' : 'config';
  }
  if (status === 400 || status === 401) return 'config';
  return 'temporary'; // 503/500/lainnya
}

type MultiKeyResult =
  | { ok: true; response: Response }
  | { ok: false; status: number; error: string };

/** Petakan status error Gemini → { status untuk client, pesan jelas }. */
function mapGeminiError(
  status: number,
  fallbackNoun: string,
): { status: number; error: string } {
  if (status === 503 || status === 500) {
    return {
      status: 503,
      error: 'Server AI sedang ramai. Mohon tunggu sebentar lalu coba lagi.',
    };
  }
  if (status === 429) {
    return {
      status: 429,
      error: 'Batas pemakaian sementara tercapai. Coba lagi beberapa saat.',
    };
  }
  if (status === 400 || status === 401 || status === 403) {
    return { status: 502, error: 'Konfigurasi AI bermasalah. Hubungi pengelola.' };
  }
  return {
    status: 502,
    error: `Terjadi kendala saat membuat ${fallbackNoun}. Silakan coba lagi.`,
  };
}

/**
 * Coba beberapa key secara berurutan (failover). Sukses (2xx) langsung
 * dikembalikan. Bila satu key kena 429/403-quota/400/401/503-500, lanjut ke key
 * berikutnya. Bila SEMUA key gagal, kembalikan pesan jelas sesuai kategori.
 */
async function fetchGeminiMultiKey(
  keys: string[],
  requestBody: string,
  label: string,
  fallbackNoun: string,
): Promise<MultiKeyResult> {
  const categories = new Set<FailureKind>();
  let lastStatus = 0;
  let lastBody = '';

  for (let i = 0; i < keys.length; i++) {
    const keyIndex = i + 1;
    let response: Response;
    try {
      response = await fetchGeminiSingleKey(keys[i], requestBody, label, keyIndex);
    } catch {
      categories.add('temporary');
      console.error(`[${label}] key #${keyIndex} gagal jaringan; coba key berikutnya`);
      continue;
    }

    if (response.ok) return { ok: true, response };

    const bodyText = await response.text().catch(() => '');
    lastStatus = response.status;
    lastBody = bodyText;
    const kind = classifyFailure(response.status, bodyText);
    categories.add(kind);
    console.error(
      `[${label}] key #${keyIndex} gagal (status ${response.status}, ${kind}); coba key berikutnya`,
    );
  }

  // Semua key gagal — tentukan pesan akhir (tanpa membocorkan isi key).
  console.error(`[${label}] semua ${keys.length} key Gemini gagal`, {
    categories: [...categories],
    lastStatus,
    lastBodyPreview: lastBody.slice(0, 300),
  });

  const list = [...categories];
  if (list.length === 1 && list[0] === 'limit') {
    return {
      ok: false,
      status: 429,
      error: 'Semua kuota AI sedang penuh. Coba lagi beberapa saat.',
    };
  }
  if (list.length === 1 && list[0] === 'config') {
    return {
      ok: false,
      status: 502,
      error: 'Konfigurasi AI bermasalah. Hubungi pengelola.',
    };
  }
  if (list.length >= 1 && list.every((c) => c === 'temporary')) {
    return {
      ok: false,
      status: 503,
      error: 'Server AI sedang ramai. Mohon tunggu sebentar lalu coba lagi.',
    };
  }
  const mapped = mapGeminiError(lastStatus, fallbackNoun);
  return { ok: false, status: mapped.status, error: mapped.error };
}

export default async function handler(
  req: ApiRequest,
  res: ApiResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metode tidak diizinkan.' });
    return;
  }

  const apiKeys = collectGeminiKeys();
  if (apiKeys.length === 0) {
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

  // Pemanggilan Gemini (non-streaming): multi-key failover + auto-retry.
  const requestBody = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
  });

  const result = await fetchGeminiMultiKey(
    apiKeys,
    requestBody,
    'generate',
    'hasil',
  );
  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  const geminiRes = result.response;

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
