# SPEC IMPLEMENTASI — Bank Soal v2.1 (JSON terstruktur + validator deterministik)

Status: **DRAFT SPEC — menunggu persetujuan. BELUM ADA EDIT ke repo.**
Baseline: main = `bff6e0c` · repo `putrayana267-afk/superpowers` · app `asisten-guru/`
Arah disetujui: **Server dumb** · **parse+validasi+render di client** · **TWIN + parity gate** (tanpa shared import src→api) · status hasil = **Draft AI** · validator **tak pernah** set Verified.

---

## 0. Prinsip (pagar keras)
1. `api/generate.ts` TETAP self-contained (nol import dari src). Serverless hanya: kirim ke Gemini + balikan JSON string mentah sebagai `{ text }`.
2. Semua parse, validasi deterministik, render → **client**.
3. Bank-soal: schema + prompt **KEMBAR** di 2 tempat, dijaga **parity gate (hash)**. Beda → gate GAGAL.
4. JSON invalid/terpotong → **error jujur + minta buat ulang**. Tak ada yang disimpan saat gagal.
5. Validator hanya cek **struktur** (bukan kebenaran isi/kunci/ayat). Guru tetap penentu. Aturan dalil/ayat **DITUNDA ke tugas #1 (prompt v2)** — TIDAK di spec ini.
6. Perubahan `api/generate.ts` DILARANG menyentuh: kumpul key env, multi-key failover, retry/backoff, timeout. Hanya: (a) cabang `generationConfig` untuk bank-soal, (b) builder bank-soal → mode JSON, (c) system prompt bank-soal.

---

## 1. JSON `responseSchema` bank-soal (format Gemini — OpenAPI subset)

Dikirim di `generationConfig.responseSchema` HANYA saat `toolId === 'bank-soal'`, bersama `responseMimeType: "application/json"`.

```json
{
  "type": "OBJECT",
  "properties": {
    "sumber": { "type": "STRING" },
    "pilihanGanda": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "nomor": { "type": "INTEGER" },
          "pertanyaan": { "type": "STRING" },
          "opsi": {
            "type": "OBJECT",
            "properties": {
              "A": { "type": "STRING" }, "B": { "type": "STRING" },
              "C": { "type": "STRING" }, "D": { "type": "STRING" }, "E": { "type": "STRING" }
            },
            "required": ["A", "B", "C", "D", "E"],
            "propertyOrdering": ["A", "B", "C", "D", "E"]
          },
          "kunci": { "type": "STRING", "enum": ["A", "B", "C", "D", "E"] },
          "pembahasan": { "type": "STRING" }
        },
        "required": ["nomor", "pertanyaan", "opsi", "kunci", "pembahasan"],
        "propertyOrdering": ["nomor", "pertanyaan", "opsi", "kunci", "pembahasan"]
      }
    },
    "isian": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "nomor": { "type": "INTEGER" },
          "pertanyaan": { "type": "STRING" },
          "kunci": { "type": "STRING" },
          "pembahasan": { "type": "STRING" }
        },
        "required": ["nomor", "pertanyaan", "kunci", "pembahasan"],
        "propertyOrdering": ["nomor", "pertanyaan", "kunci", "pembahasan"]
      }
    },
    "esai": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "nomor": { "type": "INTEGER" },
          "pertanyaan": { "type": "STRING" },
          "rubrik": {
            "type": "ARRAY",
            "items": {
              "type": "OBJECT",
              "properties": {
                "skor": { "type": "INTEGER" },
                "deskriptor": { "type": "STRING" }
              },
              "required": ["skor", "deskriptor"],
              "propertyOrdering": ["skor", "deskriptor"]
            }
          },
          "pembahasan": { "type": "STRING" }
        },
        "required": ["nomor", "pertanyaan", "rubrik", "pembahasan"],
        "propertyOrdering": ["nomor", "pertanyaan", "rubrik", "pembahasan"]
      }
    }
  },
  "required": ["sumber", "pilihanGanda", "isian", "esai"],
  "propertyOrdering": ["sumber", "pilihanGanda", "isian", "esai"]
}
```

**Keuntungan schema-level (lebih kuat dari prompt):**
- `opsi` = OBJECT dengan `required [A..E]` → **5 opsi A–E dijamin ada** oleh schema.
- `kunci` enum `[A..E]` → **kunci dijamin salah satu huruf valid**.
- `isian` & `esai` **tak punya field `opsi`** → "isian/esai tak boleh A–E" **dijamin oleh bentuk** (bukan sekadar prompt).
- Section dengan 0 soal → array kosong `[]` (tetap ada; validator cocokkan panjang vs diminta).

**Catatan Gemini:** `propertyOrdering` khusus Gemini (bantu determinisme + hemat token). Schema ini 3 level — aman untuk batas Gemini. Uji saat integrasi bahwa versi API menerima schema ini.

---

## 2. Tipe TypeScript (sumber kebenaran tipe di src)

Lokasi: `src/features/tools/bankSoal.ts` (baru) — di-re-export dari `types.ts` bila perlu.

```ts
export type KunciPg = 'A' | 'B' | 'C' | 'D' | 'E';

export interface SoalPg {
  nomor: number;
  pertanyaan: string;
  opsi: Record<KunciPg, string>;
  kunci: KunciPg;
  pembahasan: string;
}
export interface SoalIsian {
  nomor: number;
  pertanyaan: string;   // kalimat rumpang (mengandung _____)
  kunci: string;
  pembahasan: string;
}
export interface RubrikLevel {
  skor: number;
  deskriptor: string;
}
export interface SoalEsai {
  nomor: number;
  pertanyaan: string;
  rubrik: RubrikLevel[];
  pembahasan: string;
}
export interface BankSoal {
  sumber: string;
  pilihanGanda: SoalPg[];
  isian: SoalIsian[];
  esai: SoalEsai[];
}

// Hasil validasi
export type Severity = 'error' | 'warning' | 'info';
export interface ValidationIssue {
  severity: Severity;
  code: string;      // mis. 'PG_COUNT_MISMATCH'
  message: string;   // ramah bahasa Indonesia
  lokasi?: string;   // mis. 'PG #3'
}
export interface ValidationResult {
  ok: boolean;             // true = tidak ada issue 'error'
  issues: ValidationIssue[];
}

// Jumlah yang diminta guru (dari inputs form)
export interface JumlahDiminta {
  pg: number;
  isian: number;
  esai: number;
}
```

---

## 3. Prompt bank-soal (mode JSON) — KEMBAR

Isi builder bank-soal dibuat identik di kedua jalur. Ganti instruksi "Tulis dalam Markdown / TATA LETAK WAJIB" → instruksi **konten** (format ditegakkan schema, bukan prompt).

**System prompt bank-soal (konstanta twin `SYSTEM_PROMPT_BANKSOAL`):**
```
Anda adalah asisten guru penyusun draft soal. Keluarkan HANYA satu objek JSON valid
sesuai skema yang diminta. Tanpa markdown, tanpa blok kode, tanpa teks pembuka/penutup.
```

**User prompt bank-soal (isi builder, twin):**
```
Hasilkan soal dengan komposisi PERSIS: {nPg} Pilihan Ganda, {nIsian} Isian, {nEsai} Esai.
Isi setiap field sesuai skema JSON. Aturan konten:
- Pilihan Ganda: 5 opsi (A–E), TEPAT SATU benar. 'kunci' = huruf opsi yang benar.
  'pembahasan' ringkas menjelaskan mengapa benar.
- Isian: 'pertanyaan' berupa kalimat RUMPANG dengan penanda kosong (_____).
  'kunci' = jawaban sah (sebutkan variasi bila ada). TANPA opsi A–E.
- Esai: 'pertanyaan' terbuka. 'rubrik' = daftar level skor (skor + deskriptor), minimal 2 level.
  'pembahasan' = poin jawaban yang diharapkan.
- 'sumber' = dasar kurikulum/CP dari konteks di bawah.
- Sesuaikan tingkat kognitif ({kesulitan}) serta jenjang, mata pelajaran, dan pokok bahasan di konteks.
- JANGAN menambah teks di luar JSON. JANGAN mengarang data kurikulum.

Konteks:
{kurikulumContext + jumlah + kesulitan}
```
- Kasus total 0 soal: pertahankan perilaku lama (tolak sopan, minta isi jumlah) — TAPI di mode JSON ini seharusnya diblok di UI sebelum request (jumlah 0 → tak usah panggil AI). Rekomendasi: cegah di client (App) sebelum `generate()`.
- **CATATAN #1:** aturan anti-mengarang dalil/ayat Arab **menyusul di tugas #1 (prompt v2)**. Spec ini tidak menambahnya.

---

## 4. Validator struktural deterministik (client, `validateBankSoal.ts`)

Signature:
```ts
export function validateBankSoal(data: BankSoal, diminta: JumlahDiminta): ValidationResult;
```

Daftar cek (kode · severity · aturan):

**Global**
- `PG_COUNT_MISMATCH` 🔴 — `pilihanGanda.length === diminta.pg`
- `ISIAN_COUNT_MISMATCH` 🔴 — `isian.length === diminta.isian`
- `ESAI_COUNT_MISMATCH` 🔴 — `esai.length === diminta.esai`
- `SUMBER_EMPTY` 🔴 — `sumber` non-kosong (trim)
- `NOMOR_DUP` 🟡 — nomor unik & integer positif (app tetap RE-NUMBER saat render, jadi ini advisory)
- `UNKNOWN_FIELD` 🟡 — key top-level asing (selain sumber/pilihanGanda/isian/esai) → WARNING (defensif; walau schema membatasi bentuk) [R3]

**Per Pilihan Ganda**
- `PG_PERTANYAAN_EMPTY` 🔴 — pertanyaan non-kosong
- `PG_OPSI_EMPTY` 🔴 — setiap opsi A–E non-kosong
- `PG_KUNCI_INVALID` 🔴 — `kunci ∈ {A,B,C,D,E}` (schema jamin; cek ganda)
- `PG_KUNCI_NO_OPTION` 🔴 — opsi[kunci] non-kosong (kunci menunjuk opsi nyata)
- `PG_PEMBAHASAN_EMPTY` 🟡 — pembahasan non-kosong

**Per Isian**
- `ISIAN_PERTANYAAN_EMPTY` 🔴 — non-kosong
- `ISIAN_NO_RUMPANG` 🟡 — pertanyaan memuat penanda rumpang (`_` beruntun / `___`)
- `ISIAN_KUNCI_EMPTY` 🔴 — kunci non-kosong
- `ISIAN_PEMBAHASAN_EMPTY` 🟡 — non-kosong
- `ISIAN_HAS_OPSI` 🔴 — cek DEFENSIF: bila isian punya field `opsi` → ERROR (walau schema membatasi bentuk; jaga bila model menyelipkan) [R3]

**Per Esai**
- `ESAI_PERTANYAAN_EMPTY` 🔴 — non-kosong
- `ESAI_RUBRIK_TOO_FEW` 🔴 — `rubrik.length >= 2`
- `ESAI_RUBRIK_DESKRIPTOR_EMPTY` 🔴 — tiap level deskriptor non-kosong
- `ESAI_PEMBAHASAN_EMPTY` 🟡 — non-kosong
- `ESAI_HAS_OPSI` 🔴 — cek DEFENSIF: bila esai punya field `opsi` → ERROR [R3]

**Anti-placeholder (semua string)** 🔴 `PLACEHOLDER_LEAK`
- Deteksi pola: `TODO`, `contoh:`, `masukkan`, `xxx`, kurung siku kosong `[]`/`[…]`, `lorem`.

**Dalil/Arab (jembatan Fase 2)** 🟡 `ARAB_PERLU_CEK`
- Deteksi blok Arab (Unicode `\u0600–\u06FF`) di string mana pun → flag "cek dalil/ayat — guru". Deterministik TAK menilai benar/salah ayat.

**Agregasi:** `ok = issues.every(i => i.severity !== 'error')`.
**Status:** validator TIDAK menyentuh status. Status hasil tetap "Draft AI" (dikelola App/UI). Validator hanya kembalikan `issues`.

---

## 5. Error handling JSON invalid (`safeParseBankSoal`)

```ts
export type ParseResult =
  | { ok: true; data: BankSoal }
  | { ok: false; reason: string };

export function safeParseBankSoal(raw: string): ParseResult;
```
Langkah:
1. `trim`; buang pagar ```` ```json ```` bila ada (defensif — mode JSON seharusnya tak berpagar).
2. `JSON.parse` dalam try/catch. Gagal → `{ ok:false, reason:'JSON tidak valid (mungkin terpotong).' }`.
3. **Shape guard:** pastikan `pilihanGanda`, `isian`, `esai` adalah array & `sumber` string. Tidak → `{ ok:false, reason:'Struktur hasil tidak sesuai.' }`.
4. (opsional) koersi ringan tipe nomor/skor ke number.

**Alur di App (bank-soal):**
```
raw = await generate('bank-soal', inputs)         // JSON string
p = safeParseBankSoal(raw)
if (!p.ok) -> tampilkan error jujur:
    "Format hasil belum bisa dibaca ({reason}). Silakan Buat Ulang."
    + tombol Buat Ulang (onRegenerate). JANGAN simpan. Status tetap draft.
else -> v = validateBankSoal(p.data, diminta)
    render <BankSoalView data=p.data validation=v/>   // tampil walau ada issue; issue ditandai
    simpan diizinkan (output_text = ENVELOPE R2: { schemaVersion:"bank-soal-json-v1", jumlahDiminta, soal:<BankSoal> } — BUKAN raw JSON string)
```
**Truncation:** web (`api/generate.ts`) sudah map `finishReason==='MAX_TOKENS'` → error. **Tambahan (native):** `geminiDirect` perlu cek `finishReason==='MAX_TOKENS'` juga → pesan "Output terpotong, kurangi jumlah soal." Bila lolos tapi JSON terpotong → tetap tertangkap langkah (2).
**Token (DIPUTUSKAN):** JANGAN naikkan `maxOutputTokens` global. Soft-cap total 20 soal/request (guard client); default 5/3/2. >20 → arahkan "buat per bagian" (batching, fase lain).

---

## 6. Render `BankSoalView` (komponen baru)

`src/components/BankSoalView.tsx` — props `{ data: BankSoal; validation: ValidationResult }`.
Struktur:
- **Banner validasi** (atas): bila ada 🔴 → banner merah "N masalah struktur — perlu diperbaiki/buat ulang"; 🟡 → banner kuning "perlu dicek guru" (termasuk flag dalil). List issue ringkas.
- **Disclaimer "Draft AI"** (pertahankan teks lama).
- **Sumber:** tampil dari `data.sumber`.
- **Bagian Pilihan Ganda** (jika ada): header + nomor (RE-NUMBER 1..N), pertanyaan, opsi A–E sebagai daftar, "Kunci Jawaban: X", "Pembahasan". Layout dikendalikan komponen (deterministik — tak bergantung newline markdown).
- **Bagian Isian** (jika ada): nomor, pertanyaan rumpang, Kunci, Pembahasan.
- **Bagian Esai** (jika ada): nomor, pertanyaan, Rubrik (tabel kecil skor→deskriptor), Pembahasan.
- **Teks Arab:** bungkus span Arab dengan `dir="rtl"`/`dir="auto"` agar tampil benar.
- Ikuti token Akhid Noir per DESIGN.md. Jangan membuat token warna baru. Elemen integritas seperti Sumber, Draft AI, banner validasi, dan status data harus tetap jelas.

**Toolbar (Salin / .txt / Word / Simpan):** saat ini beroperasi pada `result` string. Untuk bank-soal, sediakan **serializer** `serializeBankSoal(data): string` (markdown rapi) untuk Salin/.txt/Word. **Simpan** menyimpan **envelope R2** (`output_text` = { schemaVersion:"bank-soal-json-v1", jumlahDiminta, soal:<BankSoal> }) agar bisa dimuat ulang & dirender — BUKAN raw JSON string.

---

## 7. Parity gate / hash (web vs native)

Tujuan: schema + prompt bank-soal di `api/generate.ts` (inline twin) dan di `src/features/tools/bankSoal.ts` (native) **tidak drift**.

Mekanisme:
1. Bungkus blok yang harus identik dengan **penanda komentar** di KEDUA file:
   ```
   // <BANKSOAL-PARITY-START>
   ... (schema object literal + string prompt bank-soal, PERSIS sama) ...
   // <BANKSOAL-PARITY-END>
   ```
2. Skrip `scripts/check-banksoal-parity.mjs`:
   - Baca kedua file, ekstrak teks antar penanda.
   - Normalisasi ringan (opsional: hapus whitespace tepi baris) — atau bandingkan mentah.
   - `sha256` masing-masing → **assert sama**. Beda → `process.exit(1)` + pesan "Schema/prompt bank-soal DRIFT antara api/ dan src/. Samakan."
3. `package.json`: `"check:parity": "node scripts/check-banksoal-parity.mjs"`.
4. Jalankan di **CI GitHub Actions** (langkah baru) + opsional pre-commit. Wajib lulus sebelum merge.
5. Agar hash cocok: blok di dua file harus **tekstual identik** (nama variabel, isi string sama). Kode sekitarnya boleh beda.

> Catatan: karena `api/generate.ts` self-contained, konstanta schema+prompt bank-soal **ditulis inline** di sana (bukan import). Sisi native menaruhnya di `bankSoal.ts`. Penanda parity membungkus blok yang sama di dua lokasi.

---

## 8. Daftar file yang disentuh

**BARU**
- `src/features/tools/bankSoal.ts` — tipe TS + `BANKSOAL_RESPONSE_SCHEMA` + `SYSTEM_PROMPT_BANKSOAL` + `buildBankSoalUserPrompt(inputs)` + `serializeBankSoal(data)` + `safeParseBankSoal(raw)`. Pure/Node-safe. (blok parity)
- `src/features/tools/validateBankSoal.ts` — `validateBankSoal(data, diminta)`.
- `src/components/BankSoalView.tsx` — render.
- `scripts/check-banksoal-parity.mjs` — parity gate.

**EDIT — NON-beku**
- `src/features/tools/promptBuilder.ts` — builder `'bank-soal'` delegasi ke `bankSoal.ts` (native), buang blok markdown/TATA LETAK WAJIB.
- `src/services/ai.ts` — `geminiDirect(system, user, maxTokens, opts?)` terima `responseMimeType`/`responseSchema` opsional; `generate()` cabang bank-soal (pakai system+schema bank-soal); + cek `finishReason` MAX_TOKENS.
- `src/App.tsx` — cabang bank-soal: `safeParseBankSoal` → `validateBankSoal` → render `BankSoalView`; error jujur bila gagal; jalur muat-ulang (baris 224/269) parse `output_text` bila toolId bank-soal; cegah generate saat total 0.
- `src/components/ResultPanel.tsx` — cabang render: `activeTool.id==='bank-soal'` & parse-ok → `BankSoalView`; selain itu → ReactMarkdown (tetap). Toolbar bank-soal pakai `serializeBankSoal` untuk Salin/.txt/Word.
- `src/features/tools/types.ts` — re-export tipe bank-soal (opsional).
- `package.json` — script `check:parity` (+ opsional di `build`).
- `.github/workflows/*.yml` — langkah jalankan `check:parity` (perlu cek nama file workflow saat implementasi).

**EDIT — BEKU (izin, RISIKO TERTINGGI)**
- `api/generate.ts` — (a) `BANKSOAL_RESPONSE_SCHEMA` inline (blok parity, identik `bankSoal.ts`); (b) cabang `generationConfig` bank-soal (`responseMimeType`+`responseSchema`); (c) builder `'bank-soal'` inline → mode JSON (blok parity); (d) system prompt bank-soal. **TIDAK menyentuh** key/failover/retry/timeout. Balikan tetap `{ text }` (JSON string).

**FROZEN — JANGAN sentuh (6):**
- `CLAUDE.md` (root)
- `asisten-guru/CLAUDE.md`
- `asisten-guru/api/suggest.ts`
- `asisten-guru/src/data/struktur.ts`
- `asisten-guru/src/data/kurikulum.ts`
- `asisten-guru/src/index.css`

---

## 9. Urutan implementasi aman (tiap tahap: verifikasi live + gate sebelum lanjut)

Semua di **branch baru** (mis. `feat-banksoal-json-v2.1`), BUKAN branch lama. Merge `--no-ff` di akhir.

1. **Pondasi pure (nol wiring):** `bankSoal.ts` (tipe, schema, prompt, serialize, safeParse) + `validateBankSoal.ts`. → TS compile ✓; unit test validator pada JSON contoh (valid, kurang jumlah, opsi kosong, isian-berisi-A–E mustahil krn bentuk, esai rubrik <2, placeholder, Arab) ✓. **Belum ada perubahan perilaku.**
2. **Twin + parity:** tulis blok parity di `bankSoal.ts` (native) & inline di `api/generate.ts`; tambah penanda; `scripts/check-banksoal-parity.mjs` + `npm run check:parity` → **lulus**. (Belum sambung config.)
3. **Sisi web (jalur mudah diuji preview):** cabang `generationConfig` bank-soal di `api/generate.ts` (server dumb, balik JSON string) + builder bank-soal JSON. → Vercel preview: generate bank-soal → JSON valid diterima client.
4. **Client parse/validasi/render:** `BankSoalView` + cabang `ResultPanel` + `App` (safeParse→validate→render; error jujur). → Preview gate: opsi tumpuk, Kunci/Pembahasan terpisah (dari struktur, bukan markdown), banner validasi muncul; JSON rusak → error jujur.
5. **Sisi native:** `ai.ts` `geminiDirect` opsi schema + cabang `generate()` bank-soal + cek MAX_TOKENS. → verifikasi via APK (GitHub Actions) bila memungkinkan; minimal pastikan parity & tipe.
6. **Simpan/muat-ulang:** `output_text` = JSON string; muat ulang parse+render. → uji Simpan → buka dari Tersimpan.
7. **Ekspor:** `serializeBankSoal` untuk Salin/.txt/Word. → uji ketiganya keluar teks terbaca.
8. **CI parity:** langkah `check:parity` di workflow → hijau.
9. **Gerbang visual multi-skenario** (PG saja / campur 5-3-2 / esai saja / jumlah 0 dicegah / JSON rusak → error) + verifikasi live (blob, twin parity, file beku utuh, Vercel preview READY) → **merge --no-ff** → re-baseline.

**De-risk:** perubahan terisolasi di branch; mudah revert (git). Bila mode JSON bermasalah di produksi, rollback = revert merge.

---

## 10. Yang DITUNDA (bukan di spec ini)
- Aturan anti-mengarang **dalil/ayat** + few-shot "natural seperti guru" → **tugas #1 (prompt v2)**.
- Sistem **status hasil per-soal** (Draft AI → Diedit → Verified, dgn atribusi) → **tugas #4**.
- Store dalil terverifikasi, cek kemiripan, multi-model → Fase 2/3.

---

## 11. Pertanyaan terbuka — SUDAH DIPUTUSKAN (selaras EXEC §REVISI JILL A1–A4)
1. `maxOutputTokens`: **TIDAK dinaikkan global.** Soft-cap total 20 soal/request; default 5/3/2 (A1).
2. Nomor soal: **RE-NUMBER saat render** (1..N per seksi); nomor AI advisory (A2).
3. CI: **inspeksi `.github/workflows/` LIVE dulu**, sisipkan `check:parity` di workflow yang ada / buat minimal baru (A3).
4. Uji native (APK): tahap 1–4 web/typecheck; tahap 5 typecheck/build; **APK smoke test wajib di final (Tahap 9)** (A4).
