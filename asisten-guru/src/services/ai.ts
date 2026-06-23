import { Capacitor } from '@capacitor/core';
import type { ToolInputs } from '../features/tools/types';
import { getSetting } from '../lib/db';
import {
  buildSystemPrompt,
  buildUserPrompt,
  buildSuggestPrompt,
  SUGGEST_SYSTEM_PROMPT,
} from '../features/tools/promptBuilder';

/** Pesan error ramah berbahasa Indonesia untuk ditampilkan ke guru. */
export class GenerateError extends Error {}

/** Dilempar saat API key BYOK belum diisi (native) — UI mengarahkan ke Pengaturan. */
export class MissingApiKeyError extends GenerateError {}

/** Model yang dipakai sama dengan serverless (web). */
const GEMINI_MODEL = 'gemini-2.5-flash';
const SETTING_API_KEY = 'gemini_api_key';

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

/**
 * Panggil Gemini LANGSUNG dari app (native/BYOK). CapacitorHttp mem-bypass CORS,
 * jadi cukup pakai fetch biasa. Key dibaca dari SQLite settings.
 */
async function geminiDirect(
  systemPrompt: string,
  userPrompt: string,
  maxOutputTokens: number,
): Promise<string> {
  const apiKey = (await getSetting(SETTING_API_KEY))?.trim();
  if (!apiKey) {
    throw new MissingApiKeyError(
      'Tempelkan Gemini API key Anda di Pengaturan untuk mulai membuat materi.',
    );
  }

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}` +
    `:generateContent?key=${encodeURIComponent(apiKey)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { maxOutputTokens },
      }),
    });
  } catch {
    throw new GenerateError(FRIENDLY_NETWORK);
  }

  if (response.status === 429) {
    throw new GenerateError(
      'Kuota harian Gemini habis. Coba lagi besok atau pakai API key lain di Pengaturan.',
    );
  }
  if (!response.ok) {
    let body = '';
    try {
      body = await response.text();
    } catch {
      // abaikan
    }
    console.error('Gemini direct error', response.status, body.slice(0, 300));
    if (
      response.status === 400 ||
      response.status === 401 ||
      response.status === 403
    ) {
      throw new GenerateError(
        'API key Gemini bermasalah. Periksa kembali di Pengaturan.',
      );
    }
    throw new GenerateError(FRIENDLY_SERVER);
  }

  let data: GeminiResponse;
  try {
    data = (await response.json()) as GeminiResponse;
  } catch {
    throw new GenerateError(FRIENDLY_SERVER);
  }
  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? '')
    .join('')
    .trim();
  if (!text) {
    throw new GenerateError(
      'Hasil kosong diterima. Coba sesuaikan input lalu buat ulang.',
    );
  }
  return text;
}

const FRIENDLY_NETWORK =
  'Gagal membuat hasil. Periksa koneksi internet Anda lalu coba lagi.';
const FRIENDLY_TIMEOUT =
  'Pembuatan hasil memakan waktu terlalu lama. Coba lagi sebentar.';
const FRIENDLY_RATE = 'Terlalu banyak permintaan, coba sebentar lagi.';
const FRIENDLY_SERVER =
  'Terjadi kendala di server. Silakan coba lagi beberapa saat lagi.';

const TIMEOUT_MS = 60_000;

interface GenerateResponse {
  text?: string;
  error?: string;
}

/**
 * Kirim permintaan pembuatan materi ke proxy `/api/generate`.
 * Mengembalikan teks hasil, atau melempar GenerateError dengan pesan ramah.
 */
export async function generate(
  toolId: string,
  inputs: ToolInputs,
): Promise<string> {
  // Native (BYOK): panggil Gemini langsung memakai key pengguna.
  if (Capacitor.isNativePlatform()) {
    return geminiDirect(buildSystemPrompt(), buildUserPrompt(toolId, inputs), 8192);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ toolId, inputs }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new GenerateError(FRIENDLY_TIMEOUT);
    }
    throw new GenerateError(FRIENDLY_NETWORK);
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 429) {
    throw new GenerateError(FRIENDLY_RATE);
  }

  if (!response.ok) {
    // Coba ambil pesan error spesifik dari server, jika ada.
    let serverMessage = '';
    try {
      const data = (await response.json()) as GenerateResponse;
      if (data.error) serverMessage = data.error;
    } catch {
      // Abaikan body yang tidak bisa diparse.
    }
    throw new GenerateError(serverMessage || FRIENDLY_SERVER);
  }

  let data: GenerateResponse;
  try {
    data = (await response.json()) as GenerateResponse;
  } catch {
    throw new GenerateError(FRIENDLY_SERVER);
  }

  const text = (data.text ?? '').trim();
  if (!text) {
    throw new GenerateError(
      'Hasil kosong diterima. Coba sesuaikan input lalu buat ulang.',
    );
  }
  return text;
}

/**
 * Saran cepat (isi otomatis) untuk satu field: kirim instruksi + konteks ke
 * `/api/suggest`, kembalikan teks pendek. Melempar GenerateError yang ramah.
 */
export async function suggest(
  instruction: string,
  context: Record<string, string>,
): Promise<string> {
  // Native (BYOK): panggil Gemini langsung memakai key pengguna.
  if (Capacitor.isNativePlatform()) {
    return geminiDirect(
      SUGGEST_SYSTEM_PROMPT,
      buildSuggestPrompt(instruction, context),
      1024,
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35_000);

  let response: Response;
  try {
    response = await fetch('/api/suggest', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ instruction, context }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new GenerateError(FRIENDLY_TIMEOUT);
    }
    throw new GenerateError(FRIENDLY_NETWORK);
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 429) {
    throw new GenerateError('Terlalu banyak permintaan, coba sebentar lagi.');
  }

  if (!response.ok) {
    let serverMessage = '';
    try {
      const data = (await response.json()) as GenerateResponse;
      if (data.error) serverMessage = data.error;
    } catch {
      // abaikan
    }
    throw new GenerateError(serverMessage || FRIENDLY_SERVER);
  }

  let data: GenerateResponse;
  try {
    data = (await response.json()) as GenerateResponse;
  } catch {
    throw new GenerateError(FRIENDLY_SERVER);
  }

  const text = (data.text ?? '').trim();
  if (!text) {
    throw new GenerateError('Saran kosong. Coba lagi.');
  }
  return text;
}
