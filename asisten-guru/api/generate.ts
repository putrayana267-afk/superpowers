/**
 * Serverless proxy ke Anthropic API.
 *
 * KEAMANAN: ANTHROPIC_API_KEY hanya dibaca di sini (sisi server) dari environment
 * variable dan TIDAK PERNAH dikirim ke frontend. Frontend hanya memanggil
 * endpoint ini dengan { toolId, inputs }.
 */

import {
  buildSystemPrompt,
  buildUserPrompt,
  VALID_TOOL_IDS,
} from '../src/features/tools/prompts';

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
const DEFAULT_MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 2000;

interface RequestBody {
  toolId?: unknown;
  inputs?: unknown;
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

  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
  const systemPrompt = buildSystemPrompt();

  let userPrompt: string;
  try {
    userPrompt = buildUserPrompt(toolId, inputs);
  } catch {
    res.status(400).json({ error: 'Alat yang diminta tidak dikenal.' });
    return;
  }

  // Timeout sisi server agar fungsi tidak menggantung.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);

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
        model,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
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
  } finally {
    clearTimeout(timeout);
  }

  if (anthropicRes.status === 429) {
    res.status(429).json({
      error: 'Permintaan sedang ramai. Mohon tunggu lalu coba lagi.',
    });
    return;
  }

  if (!anthropicRes.ok) {
    // Jangan bocorkan detail internal ke client.
    res.status(502).json({
      error: 'Terjadi kendala saat membuat hasil. Silakan coba lagi.',
    });
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
    .join('\n')
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
