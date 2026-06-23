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

// ---- Auto-retry untuk error sementara dari Gemini ------------------------

const MAX_ATTEMPTS = 4;
const PER_ATTEMPT_TIMEOUT_MS = 30_000;
/** Status yang layak diulang otomatis (error sementara). */
const RETRYABLE_STATUS = new Set([500, 503, 429]);

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

/** Penanda semua percobaan gagal di level jaringan/timeout. */
class GeminiNetworkError extends Error {}

/**
 * Panggil Gemini dengan auto-retry untuk error sementara (503/429/500 + gagal
 * jaringan/timeout). Mengembalikan Response terakhir (2xx, error non-retryable,
 * atau percobaan terakhir). Melempar GeminiNetworkError bila semua percobaan
 * gagal di level jaringan. `label` hanya untuk log; URL TIDAK di-log karena
 * memuat API key.
 */
async function fetchGeminiWithRetry(
  url: string,
  requestBody: string,
  label: string,
): Promise<Response> {
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
        `[${label}] gagal jaringan/timeout (percobaan ${attempt}/${MAX_ATTEMPTS}): ${reason}`,
      );
      if (attempt < MAX_ATTEMPTS) {
        await sleep(backoffMs(attempt));
        continue;
      }
      throw new GeminiNetworkError(reason);
    }
    clearTimeout(timeout);

    if (RETRYABLE_STATUS.has(response.status) && attempt < MAX_ATTEMPTS) {
      const peek = await response.text().catch(() => '');
      console.error(
        `[${label}] status ${response.status} (percobaan ${attempt}/${MAX_ATTEMPTS}): ${peek.slice(0, 300)}`,
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

/** Petakan status error Gemini → { status untuk client, pesan jelas }. */
function mapGeminiError(
  status: number,
  fallbackNoun: string,
): { status: number; error: string } {
  if (status === 503) {
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
  if (status === 500) {
    return {
      status: 503,
      error: 'Server AI sedang ramai. Mohon tunggu sebentar lalu coba lagi.',
    };
  }
  return {
    status: 502,
    error: `Terjadi kendala saat membuat ${fallbackNoun}. Silakan coba lagi.`,
  };
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
    generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
  });
  const url = `${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`;

  let geminiRes: Response;
  try {
    geminiRes = await fetchGeminiWithRetry(url, requestBody, 'suggest');
  } catch {
    res.status(503).json({
      error: 'Gagal menghubungi layanan AI. Periksa koneksi lalu coba lagi.',
    });
    return;
  }

  if (!geminiRes.ok) {
    const rawBody = await geminiRes.text().catch(() => '');
    console.error('Gemini error final', geminiRes.status, rawBody.slice(0, 1000));
    const mapped = mapGeminiError(geminiRes.status, 'saran');
    res.status(mapped.status).json({ error: mapped.error });
    return;
  }

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
