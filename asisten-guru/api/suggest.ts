/**
 * Serverless proxy ringan ke Google Gemini untuk "saran cepat" (isi otomatis).
 *
 * Menerima { instruction, context } dan mengembalikan { text } pendek.
 * KEAMANAN: GEMINI_API_KEY hanya dibaca di sisi server, tidak pernah ke frontend.
 */

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
const MAX_OUTPUT_TOKENS = 1024;

const SYSTEM_PROMPT =
  'Kamu asisten guru di Indonesia yang memahami Kurikulum Merdeka. ' +
  'Jawab ringkas dan langsung dalam Bahasa Indonesia, tanpa basa-basi, ' +
  'tanpa kalimat pembuka/penutup. Ikuti format yang diminta pada instruksi.';

interface RequestBody {
  instruction?: unknown;
  context?: unknown;
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

function buildPrompt(instruction: string, context: Record<string, string>): string {
  const lines = Object.entries(context)
    .filter(([, v]) => v.trim().length > 0)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');
  const ctxBlock = lines ? `Konteks:\n${lines}\n\n` : '';
  return `${ctxBlock}${instruction}`;
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

  const { instruction, context } = body;
  if (typeof instruction !== 'string' || instruction.trim().length === 0) {
    res.status(400).json({ error: 'Instruksi tidak valid.' });
    return;
  }
  const ctx = isStringRecord(context) ? context : {};

  const userPrompt = buildPrompt(instruction, ctx);

  const requestBody = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: {
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      thinkingConfig: { thinkingBudget: 0 }, // cap thinking gemini-2.5-flash → pangkas latensi
    },
  });

  const result = await fetchGeminiMultiKey(
    apiKeys,
    requestBody,
    'suggest',
    'saran',
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

  if (data.promptFeedback?.blockReason) {
    res.status(502).json({
      error: 'Permintaan tidak dapat diproses. Coba ubah input lalu ulangi.',
    });
    return;
  }

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
    res.status(502).json({ error: 'Saran kosong. Coba lagi.' });
    return;
  }

  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.status(200).json({ text });
}
