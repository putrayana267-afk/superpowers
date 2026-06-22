import { SYSTEM_PROMPT, promptBuilders } from '../src/features/tools/prompts.js'

interface RequestBody {
  toolId: string
  inputs: Record<string, string>
}

interface AnthropicMessage {
  role: 'user'
  content: string
}

interface AnthropicRequest {
  model: string
  max_tokens: number
  system: string
  messages: AnthropicMessage[]
}

interface AnthropicContentBlock {
  type: string
  text?: string
}

interface AnthropicResponse {
  content: AnthropicContentBlock[]
  error?: { message: string }
}

interface VercelReq {
  method: string
  body: RequestBody
}

interface VercelRes {
  status: (code: number) => VercelRes
  json: (data: unknown) => void
  setHeader: (name: string, value: string) => void
}

const FRIENDLY_ERRORS: Record<number, string> = {
  401: 'API key tidak valid. Periksa konfigurasi ANTHROPIC_API_KEY.',
  429: 'Permintaan terlalu banyak. Tunggu sebentar lalu coba lagi.',
  500: 'Server AI sedang bermasalah. Coba lagi dalam beberapa menit.',
  503: 'Layanan AI tidak tersedia sementara. Coba lagi nanti.',
}

export default async function handler(req: VercelReq, res: VercelRes) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).json({})
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metode tidak diizinkan.' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'Konfigurasi server tidak lengkap. Hubungi administrator.' })
    return
  }

  const { toolId, inputs } = req.body ?? {}

  if (!toolId || typeof toolId !== 'string' || !inputs || typeof inputs !== 'object') {
    res.status(400).json({ error: 'Data permintaan tidak valid.' })
    return
  }

  const builder = promptBuilders[toolId]
  if (!builder) {
    res.status(400).json({ error: `Alat "${toolId}" tidak dikenali.` })
    return
  }

  const userPrompt = builder(inputs as Record<string, string>)
  const model = process.env.MODEL ?? 'claude-sonnet-4-6'

  const payload: AnthropicRequest = {
    model,
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 55_000)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const friendlyMsg = FRIENDLY_ERRORS[response.status] ?? `Gagal menghasilkan konten (status ${response.status}). Coba lagi.`
      res.status(response.status).json({ error: friendlyMsg })
      return
    }

    const data = (await response.json()) as AnthropicResponse

    if (data.error) {
      res.status(500).json({ error: 'AI tidak dapat memproses permintaan ini. Coba lagi.' })
      return
    }

    const text = data.content
      .filter((block) => block.type === 'text' && block.text)
      .map((block) => block.text ?? '')
      .join('')

    res.status(200).json({ text })
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      res.status(504).json({ error: 'Permintaan memakan waktu terlalu lama. Coba lagi dengan koneksi yang lebih stabil.' })
    } else {
      res.status(500).json({ error: 'Gagal membuat hasil. Periksa koneksi internet lalu coba lagi.' })
    }
  }
}
