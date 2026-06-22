# Asisten Mengajar

Alat bantu AI untuk guru Indonesia — buat modul ajar, soal, LKPD, rubrik, komentar rapor, dan lebih banyak lagi dalam hitungan detik, sesuai Kurikulum Merdeka.

## Fitur

| Alat | Deskripsi |
|---|---|
| Modul Ajar | Modul Kurikulum Merdeka lengkap dengan PPP, kegiatan, dan asesmen |
| Bank Soal | PG, Esai, Isian, atau Campuran + kunci jawaban |
| LKPD | Lembar Kerja Peserta Didik siap cetak |
| Rubrik Penilaian | Tabel rubrik dengan deskriptor objektif |
| Penyederhana Materi | Ubah teks rumit menjadi penjelasan ramah siswa |
| Komentar Rapor | 3 alternatif deskripsi capaian per siswa |
| Ide Kegiatan | Ice breaker, permainan edukatif, proyek mini |
| Komunikasi Orang Tua | Pesan WhatsApp atau surat resmi siap kirim |

## Prasyarat

- Node.js 20+
- Akun Anthropic dan API key — dapatkan di [console.anthropic.com](https://console.anthropic.com)
- Vercel CLI (untuk dev lokal + deploy): `npm i -g vercel`

## Instalasi & Pengembangan Lokal

```bash
# 1. Masuk ke direktori proyek
cd asisten-mengajar

# 2. Install dependencies
npm install

# 3. Siapkan environment variable
cp .env.example .env
# Buka .env dan isi ANTHROPIC_API_KEY=sk-ant-...

# 4. Login Vercel (hanya pertama kali)
vercel login

# 5. Jalankan dev server (frontend + API proxy)
npm run dev
# Buka http://localhost:3000
```

> **Catatan:** `npm run dev` menjalankan `vercel dev` yang menangani frontend (Vite) dan serverless function (`/api`) secara bersamaan. Tanpa Vercel CLI, jalankan `npm run dev:frontend` untuk frontend saja (API tidak akan berfungsi).

## Deploy ke Vercel

```bash
# Deploy ke production
vercel --prod
```

Vercel otomatis mendeteksi framework Vite dan folder `api/`. Pastikan environment variable `ANTHROPIC_API_KEY` sudah diset di dashboard Vercel (Settings → Environment Variables).

## Keamanan

- **API key tidak pernah menyentuh browser.** Kunci hanya ada di environment variable server (Vercel) dan hanya digunakan di `api/generate.ts`.
- Frontend hanya mengirim `{ toolId, inputs }` ke `/api/generate` — tidak ada kunci atau data sensitif yang keluar dari server.
- Semua request ke Anthropic API dilakukan dari serverless function, bukan dari klien.

## Konfigurasi Model

Secara default menggunakan `claude-sonnet-4-6`. Untuk menghemat biaya, ganti ke `claude-haiku-4-5-20251001`:

```env
MODEL=claude-haiku-4-5-20251001
```

## Struktur Proyek

```
asisten-mengajar/
├── api/generate.ts          # Serverless proxy → Anthropic API
├── src/
│   ├── components/          # UI components (GlassCard, Button, dll.)
│   ├── features/tools/      # Definisi 8 alat + prompt builders
│   ├── services/ai.ts       # Client untuk memanggil /api/generate
│   └── lib/                 # Utilitas (storage, clipboard, download)
└── ...config files
```
