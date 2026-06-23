/**
 * Serverless proxy ringan ke Anthropic Claude untuk "saran cepat" (isi otomatis).
 *
 * Menerima { instruction, context } dan mengembalikan { text } pendek.
 * KEAMANAN: ANTHROPIC_API_KEY hanya dibaca di sisi server, tidak pernah ke frontend.
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

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 1024;

const SYSTEM_PROMPT =
  'Kamu asisten guru di Indonesia yang memahami Kurikulum Merdeka. ' +
  'Jawab ringkas dan langsung dalam Bahasa Indonesia, tanpa basa-basi, ' +
  'tanpa kalimat pembuka/penutup. Ikuti format yang diminta pada instruksi.';

interface RequestBody {
  instruction?: unknown;
  context?: unknown;
}

interface AnthropicTextBlock {
  type: string;
  text?: string;
}

interface AnthropicResponse {
  content?: AnthropicTextBlock[];
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

/** Petakan error dari Anthropic menjadi pesan ramah untuk client. */
function friendlyAnthropicError(status: number, rawBody: string): string {
  const lower = rawBody.toLowerCase();
  if (lower.includes('credit balance') || lower.includes('insufficient')) {
    return 'Saldo API Anthropic tidak mencukupi — isi saldo di platform.claude.com.';
  }
  if (status === 429 || lower.includes('rate_limit')) {
    return 'Terlalu banyak permintaan, coba sebentar lagi.';
  }
  return 'Terjadi kendala saat membuat saran. Silakan coba lagi.';
}

export default async function handler(
  req: ApiRequest,
  res: ApiResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metode tidak diizinkan.' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  let anthropicRes: Response;
  try {
    anthropicRes = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      res.status(504).json({ error: 'Saran terlalu lama dibuat. Coba lagi.' });
      return;
    }
    res.status(502).json({
      error: 'Gagal menghubungi layanan AI. Periksa koneksi lalu coba lagi.',
    });
    return;
  } finally {
    clearTimeout(timeout);
  }

  if (!anthropicRes.ok) {
    const rawBody = await anthropicRes.text().catch(() => '');
    console.error('Anthropic error', anthropicRes.status, rawBody);
    const status = anthropicRes.status === 429 ? 429 : 502;
    res
      .status(status)
      .json({ error: friendlyAnthropicError(anthropicRes.status, rawBody) });
    return;
  }

  let data: AnthropicResponse;
  try {
    data = (await anthropicRes.json()) as AnthropicResponse;
  } catch {
    res.status(502).json({ error: 'Respons dari layanan AI tidak valid.' });
    return;
  }

  const text = (data.content ?? [])
    .filter((block) => block.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text)
    .join('')
    .trim();

  if (!text) {
    res.status(502).json({ error: 'Saran kosong. Coba lagi.' });
    return;
  }

  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.status(200).json({ text });
}
