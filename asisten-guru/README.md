# Asisten Mengajar untuk Guru

Aplikasi web SaaS yang membantu guru di Indonesia menyiapkan pembelajaran lebih
cepat dengan bantuan AI. Berisi sekumpulan **alat** yang mengubah input singkat
menjadi materi siap pakai sesuai **Kurikulum Merdeka** — modul ajar, bank soal,
LKPD, rubrik, komentar rapor, dan lainnya.

- **Mobile-first** (dioptimalkan untuk HP Android / Chrome).
- **Seluruh antarmuka dan output AI berbahasa Indonesia.**
- Desain **glassmorphic emerald & gold** dengan animasi halus (menghormati
  `prefers-reduced-motion`).
- **API key disimpan di server** lewat serverless function — tidak pernah ada di
  bundel frontend.

## Alat yang tersedia

1. **Modul Ajar** — modul Kurikulum Merdeka lengkap (tujuan, P3, kegiatan, asesmen).
2. **Bank Soal** — soal bernomor + KUNCI JAWABAN dan poin penilaian.
3. **LKPD** — Lembar Kerja Peserta Didik terstruktur.
4. **Rubrik Penilaian** — tabel rubrik + cara menghitung nilai akhir.
5. **Penyederhana Materi** — penjelasan ulang sesuai usia + inti yang harus diingat.
6. **Komentar Rapor** — 3 alternatif deskripsi capaian yang membangun.
7. **Ide Kegiatan & Ice Breaker** — 4 ide aman dan hemat biaya.
8. **Komunikasi Orang Tua** — draf pesan WhatsApp/surat yang sopan.

## Teknologi

Vite + React 18 + TypeScript (strict) · Tailwind CSS · Framer Motion ·
lucide-react · react-markdown. Backend berupa serverless function gaya Vercel di
folder `api/`.

## Menjalankan secara lokal

Prasyarat: **Node.js 18+**.

```bash
# 1. Pasang dependency
npm install

# 2. Salin contoh env, lalu isi kunci API Google Gemini Anda
cp .env.example .env
# buka .env dan isi:
#   GEMINI_API_KEY=...   (dari https://aistudio.google.com/app/apikey)
```

Karena aplikasi memerlukan fungsi `/api/generate`, cara termudah menjalankannya
secara lokal **lengkap dengan backend** adalah memakai Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

`vercel dev` akan menyajikan frontend Vite sekaligus fungsi `api/generate.ts`,
dan membaca variabel dari `.env`.

### Alternatif: hanya frontend (`npm run dev`)

```bash
npm run dev
```

Perintah ini menjalankan Vite saja **tanpa** backend, sehingga tombol "Buat"
akan menampilkan pesan error yang ramah (karena `/api/generate` belum ada). Untuk
menghubungkannya ke proxy yang sedang berjalan di tempat lain, jalankan:

```bash
VITE_DEV_API_PROXY=http://localhost:3000 npm run dev
```

## Build produksi

```bash
npm run build     # tsc -b && vite build  → menghasilkan folder dist/
npm run preview   # pratinjau hasil build
```

## Deploy ke Vercel

1. Push repositori ini ke GitHub.
2. Di [vercel.com](https://vercel.com), **Import Project** dari repo tersebut.
3. Pada **Settings → Environment Variables**, tambahkan:
   - `GEMINI_API_KEY` = kunci API Google Gemini Anda.
4. Vercel otomatis mendeteksi konfigurasi (`vercel.json`), membangun frontend,
   dan men-deploy fungsi `api/generate.ts`.

## Catatan keamanan

- `GEMINI_API_KEY` **hanya** dibaca di `api/generate.ts` (sisi server). Kunci
  ini tidak pernah dikirim ke browser dan tidak boleh diberi awalan `VITE_`.
- Frontend hanya memanggil `/api/generate` dengan `{ toolId, inputs }`; seluruh
  pemanggilan ke Gemini terjadi di server.
- `.env` sudah masuk `.gitignore` — jangan pernah meng-commit kunci asli.

## Struktur proyek

```
asisten-guru/
├─ api/
│  └─ generate.ts            # proxy ke Google Gemini API + builder prompt (inline)
├─ src/
│  ├─ components/            # UI reusable (GlassCard, Button, ToolForm, ...)
│  ├─ features/tools/        # types.ts, registry.ts (daftar alat)
│  ├─ services/ai.ts         # generate(toolId, inputs) -> POST /api/generate
│  ├─ lib/                   # cn, clipboard, download, storage
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ index.css
├─ index.html
├─ package.json
├─ tsconfig.json
├─ tailwind.config.ts
├─ postcss.config.js
├─ vite.config.ts
├─ vercel.json
├─ .env.example
└─ README.md
```

Menambah alat baru cukup menambahkan satu entri di `src/features/tools/registry.ts`
(skema field + metadata) dan satu builder prompt di `api/generate.ts` (builder
prompt di-inline langsung di file fungsi agar tidak ada modul terpisah yang
perlu di-resolve oleh runtime ESM Vercel).
