interface GenerateResponse {
  text?: string
  error?: string
}

export async function generate(
  toolId: string,
  inputs: Record<string, string>
): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60_000)

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolId, inputs }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    const data = (await response.json()) as GenerateResponse

    if (!response.ok || data.error) {
      throw new Error(data.error ?? 'Gagal membuat hasil. Periksa koneksi lalu coba lagi.')
    }

    if (!data.text) {
      throw new Error('Hasil kosong diterima dari server. Coba lagi.')
    }

    return data.text
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Permintaan memakan waktu terlalu lama. Periksa koneksi internet lalu coba lagi.')
      }
      throw err
    }
    throw new Error('Gagal membuat hasil. Periksa koneksi lalu coba lagi.')
  }
}
