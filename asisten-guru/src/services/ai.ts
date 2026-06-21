import type { ToolInputs } from '../features/tools/types';

/** Pesan error ramah berbahasa Indonesia untuk ditampilkan ke guru. */
export class GenerateError extends Error {}

const FRIENDLY_NETWORK =
  'Gagal membuat hasil. Periksa koneksi internet Anda lalu coba lagi.';
const FRIENDLY_TIMEOUT =
  'Pembuatan hasil memakan waktu terlalu lama. Coba lagi sebentar.';
const FRIENDLY_RATE =
  'Permintaan sedang ramai. Mohon tunggu beberapa saat lalu coba lagi.';
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
 * Versi streaming: memanggil `/api/generate` dengan flag stream, lalu memanggil
 * `onToken` untuk setiap potongan teks yang masuk. Mengembalikan teks lengkap.
 * Melempar GenerateError dengan pesan ramah bila gagal.
 */
export async function generateStream(
  toolId: string,
  inputs: ToolInputs,
  onToken: (chunk: string) => void,
): Promise<string> {
  let response: Response;
  try {
    response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ toolId, inputs, stream: true }),
    });
  } catch {
    throw new GenerateError(FRIENDLY_NETWORK);
  }

  if (response.status === 429) {
    throw new GenerateError(FRIENDLY_RATE);
  }

  // Error sebelum streaming dimulai dikirim sebagai JSON biasa.
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

  if (!response.body) {
    throw new GenerateError(FRIENDLY_SERVER);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  for (;;) {
    let chunk: ReadableStreamReadResult<Uint8Array>;
    try {
      chunk = await reader.read();
    } catch {
      throw new GenerateError(FRIENDLY_NETWORK);
    }
    if (chunk.done) break;

    buffer += decoder.decode(chunk.value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const evt of events) {
      for (const line of evt.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const dataStr = trimmed.slice(5).trim();
        if (!dataStr || dataStr === '[DONE]') continue;

        let payload: GenerateResponse;
        try {
          payload = JSON.parse(dataStr) as GenerateResponse;
        } catch {
          continue;
        }
        if (payload.error) {
          throw new GenerateError(payload.error);
        }
        if (typeof payload.text === 'string' && payload.text.length > 0) {
          full += payload.text;
          onToken(payload.text);
        }
      }
    }
  }

  full = full.trim();
  if (!full) {
    throw new GenerateError(
      'Hasil kosong diterima. Coba sesuaikan input lalu buat ulang.',
    );
  }
  return full;
}
