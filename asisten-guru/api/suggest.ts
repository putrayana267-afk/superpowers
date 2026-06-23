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
  const key: string = apiKey;

  const requestBody = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
  });

  async function callGemini(): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
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
    // Retry sederhana: bila 429, tunggu 2 detik lalu coba ulang 1x.
    if (geminiRes.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      geminiRes = await callGemini();
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      res.status(504).json({ error: 'Saran terlalu lama dibuat. Coba lagi.' });
      return;
    }
    res.status(502).json({
      error: 'Gagal menghubungi layanan AI. Periksa koneksi lalu coba lagi.',
    });
    return;
  }

  if (geminiRes.status === 429) {
    res.status(429).json({
      error: 'Terlalu banyak permintaan, coba sebentar lagi.',
    });
    return;
  }

  if (!geminiRes.ok) {
    const rawBody = await geminiRes.text().catch(() => '');
    console.error('Gemini error', geminiRes.status, rawBody);
    res.status(502).json({
      error: 'Terjadi kendala saat membuat saran. Silakan coba lagi.',
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
