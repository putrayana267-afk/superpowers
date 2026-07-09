# SPEC EKSEKUSI CC — Bank Soal v2.1 (JSON) — PER TAHAP

Acuan desain: `SPEC-banksoal-v2.1-json-validator.md` (disetujui + 4 revisi).
Baseline: main = `bff6e0c` · branch kerja BARU: **`feat-banksoal-json-v2.1`** (dari `bff6e0c`).
Peran: CC eksekusi. Verifikator (chat) verifikasi LIVE tiap tahap. **CC TIDAK merge sampai Tahap 9.**

---

## ATURAN GLOBAL (berlaku semua tahap)
1. Semua kerja di branch `feat-banksoal-json-v2.1`. **JANGAN commit ke main, JANGAN merge, JANGAN hapus branch.**
2. **File FROZEN — DILARANG sentuh sama sekali (6, path root-relative):**
   - `CLAUDE.md`            (root)
   - `asisten-guru/CLAUDE.md`
   - `asisten-guru/api/suggest.ts`
   - `asisten-guru/src/data/struktur.ts`
   - `asisten-guru/src/data/kurikulum.ts`
   - `asisten-guru/src/index.css`
3. **`api/generate.ts` (beku-izin): boleh disentuh HANYA** untuk (a) blok parity schema+prompt bank-soal, (b) cabang `generationConfig` bank-soal, (c) system prompt bank-soal. **DILARANG** menyentuh: kumpul key env, multi-key failover, retry/backoff, timeout, error mapping. **BUKAN bagian frozen guard** — lindungan = diff PENUH tiap tahap yang menyentuhnya (item 9).
4. **Server tetap DUMB:** api hanya kirim ke Gemini + balikan `{ text }` (JSON string mentah). Parse/validasi/render **hanya di client**.
5. **Parity gate WAJIB HIJAU di setiap tahap ≥2.** Blok schema+prompt bank-soal harus tekstual identik di `bankSoal.ts` & `api/generate.ts`.
6. Tiap tahap = commit(s) sendiri di branch. **LAPOR MENTAH** (output git/build asli, bukan ringkasan). Klaim tanpa bukti = ditolak.
7. Tiap tahap CC **LAPOR MENTAH** (output asli, urut): `git log --oneline` commit tahap · `git status` · **`git diff --name-only <prev> HEAD`** · `git diff --stat <prev> HEAD` · `git hash-object <file baru/berubah>` · perintah cek yang dijalankan + outputnya. **Klaim tanpa output = ditolak.** Verifikator verifikasi live sebelum tahap berikut.
8. **CEK FROZEN TIAP TAHAP (wajib, tempel output) — DIJALANKAN DARI ROOT REPO:**
   ```
   git fetch origin main:refs/remotes/origin/main
   cd "$(git rev-parse --show-toplevel)"
   BASE="$(git merge-base origin/main HEAD)"
   git diff --name-only "$BASE" HEAD | grep -E '^(CLAUDE\.md|asisten-guru/(CLAUDE\.md|api/suggest\.ts|src/data/struktur\.ts|src/data/kurikulum\.ts|src/index\.css))$' \
     && { echo '⛔ FROZEN TERSENTUH — STOP'; exit 1; } \
     || echo '✅ frozen aman'
   ```
   Hasil HARUS `✅ frozen aman`. Bila `⛔`/exit 1 → BERHENTI, revert sentuhan frozen.
9. **Tiap tahap yang menyentuh `api/generate.ts` WAJIB tempel `git diff <prev> HEAD -- asisten-guru/api/generate.ts` PENUH** — reviewer memastikan hunk HANYA di blok parity + cabang `generationConfig` bank-soal; TIDAK ada perubahan di key/failover/retry/timeout/env.
10. **KONVENSI DIREKTORI (WAJIB):**
    - CEK FROZEN & semua `git diff` scope → dijalankan **dari ROOT repo** (path root-relative, mis. `asisten-guru/...`).
    - `npm`/`tsc`/`build` → dijalankan **dari folder `asisten-guru/`**. Command app-relative (mis. `npx tsc --noEmit`, `grep ... src/...`) boleh dipertahankan, TAPI tahap harus menyatakan jelas: dijalankan dari `asisten-guru/`.

## REVISI JILL TERINTEGRASI (jangan sampai terlewat)
- **R1 Legacy fallback:** bank-soal lama (markdown, bukan JSON) saat dibuka → render sebagai Markdown + badge **"Legacy — belum tervalidasi struktur"**. BUKAN error. (Tahap 4 & 6)
- **R2 Metadata simpan:** simpan **envelope** `{ schemaVersion:"bank-soal-json-v1", jumlahDiminta:{pg,isian,esai}, soal:<BankSoal> }`. Metadata ditambah **client** setelah parse sukses, sebelum simpan. (Tahap 4)
- **R3 Unknown/extra field:** validator defensif — `opsi` pada isian/esai → ERROR; key top-level tak dikenal → WARNING. (Tahap 1)
- **R4 Perilaku validation-error:** JSON valid tapi ada error struktur → tampil **banner merah "Draft AI bermasalah"**, tetap Draft AI, **tak pernah** valid/verified. Boleh disimpan (riwayat draft bermasalah) & diekspor **dengan peringatan**. JSON **invalid** (parse gagal) → beda: error jujur + **tidak** disimpan. (Tahap 4)
- **A1 Token:** JANGAN naikkan `maxOutputTokens` global. **Soft-cap total 20 soal/request** (guard client); default 5/3/2. >20 → blok, arahkan ke "buat per bagian". (Tahap 4)
- **A2 Nomor:** RE-NUMBER saat render (1..N per seksi); nomor AI advisory. (Tahap 4/6)
- **A3 CI:** inspeksi `.github/workflows/` LIVE dulu; sisipkan `check:parity` di workflow yang ada, atau buat minimal baru. Jangan tebak nama file. (Tahap 8)
- **A4 Native APK:** tahap 1–4 cukup web/typecheck/build; tahap 5 pastikan typecheck/build lolos; **APK smoke test wajib di final** (Tahap 9) atau setelah wiring native bila ada akses.

---

# TAHAP 0 — Docs persistence (guard frozen tahan-sesi) — BRANCH TERPISAH
**Tujuan:** simpan runbook EXEC + SPEC (yang sudah ditambal) ke repo agar guard frozen & spec **tahan lintas sesi** + bisa diverifikasi live. DOCS-ONLY (bukan kode).
**Branch:** `docs-frozen-guard-v2` dari main.
**File BOLEH (buat):**
- BARU `asisten-guru/docs/EXEC-banksoal-v2.1-per-tahap-CC.md` (isi = EXEC ini, versi tertambal)
- BARU `asisten-guru/docs/SPEC-banksoal-v2.1-json-validator.md` (isi = SPEC, versi tertambal)
**File TERLARANG:** 6 file frozen · `api/generate.ts` · SEMUA kode app (`.ts`/`.tsx`/`.css`/`.json`). Docs-only.
**Guard:** commit HANYA menambah 2 file docs. JANGAN merge. JANGAN sentuh frozen/kode.
**Perintah cek (dari ROOT repo):**
```
cd "$(git rev-parse --show-toplevel)"
git diff --name-only main HEAD        # HARUS hanya 2 path: asisten-guru/docs/*.md
# lalu jalankan CEK FROZEN (ATURAN GLOBAL item 8) → HARUS: frozen aman
```
**Gate PASS:** diff = tepat 2 file docs · frozen aman · command lama TAK ADA di file docs · command baru ada (prefix `asisten-guru/`).
**Gate FAIL:** ada file non-docs tersentuh / frozen berubah / command lama tersisa.
**Verifikator (cek live dari branch):** diff docs-only · konfirmasi TAK ada sisa command frozen lama (verifikator jalankan signature-grep sendiri) · command baru (anchored, prefix `asisten-guru/`, exit 1) ada · 6 blob frozen identik main · `api/generate.ts` identik · induk branch = main.
**Setelah LULUS + merge (gerbang Docs manusia):** re-baseline main; fork `feat-banksoal-json-v2.1` dari **MAIN BARU** (bukan bff6e0c lagi).

---
# TAHAP 1 — Pondasi pure (nol wiring)
**Tujuan:** tipe + schema + prompt konstanta + validator + safeParse + serialize, murni, tanpa menyentuh alur generate.
**File BOLEH (buat/edit):**
- BARU `src/features/tools/bankSoal.ts` — tipe (SoalPg/Isian/Esai/Rubrik/BankSoal/ValidationResult/JumlahDiminta), `BANKSOAL_RESPONSE_SCHEMA`, `SYSTEM_PROMPT_BANKSOAL`, `buildBankSoalUserPrompt(inputs)`, `safeParseBankSoal(raw)`, `serializeBankSoal(data)`. **WAJIB Node-pure** (dilarang import Capacitor/db/DOM).
- BARU `src/features/tools/validateBankSoal.ts` — `validateBankSoal(data, diminta): ValidationResult`.
- EDIT `src/features/tools/types.ts` — re-export tipe (opsional).
**File TERLARANG:** semua frozen; `api/generate.ts`; `ai.ts`; `App.tsx`; `ResultPanel.tsx` (belum tahap ini).
**Guard:** tak ada wiring ke ai.ts/App/ResultPanel. Tak ada perubahan perilaku app. `bankSoal.ts` tak boleh punya dependency browser.
**Perintah cek:**
```
npx tsc --noEmit
grep -nE "@capacitor|from '.*db'|window|document|localStorage" src/features/tools/bankSoal.ts   # HARUS kosong
# Verifikasi validator: cek ada test runner
grep -E '"(vitest|jest)"' package.json || echo "TAK ADA runner"
#  → bila ada: tulis unit test src/features/tools/validateBankSoal.test.ts
#  → bila tidak: buat skrip tsx SEMENTARA (JANGAN commit), jalankan, tempel output, lalu hapus
```
Kasus uji validator WAJIB (harapkan hasil sesuai): valid bersih (ok=true) · PG kurang jumlah (PG_COUNT_MISMATCH) · opsi kosong (PG_OPSI_EMPTY) · kunci menunjuk opsi kosong (PG_KUNCI_NO_OPTION) · **isian disisipi field `opsi` (ISIAN_HAS_OPSI, error)** · esai rubrik 1 level (ESAI_RUBRIK_TOO_FEW) · string ada `TODO`/`[…]` (PLACEHOLDER_LEAK) · teks Arab (ARAB_PERLU_CEK, warning) · **key top-level asing (UNKNOWN_FIELD, warning)**.
**Gate PASS/FAIL:**
- ✅ PASS: `tsc --noEmit` bersih · `bankSoal.ts` Node-pure (grep kosong) · SEMUA kasus uji validator hasil sesuai.
- ❌ FAIL: typecheck error / ada import browser / ada kasus uji meleset.
**Lapor mentah:** output `tsc` · output grep purity · output test/skrip · `git hash-object` file baru · `git status`.

---

# TAHAP 2 — Twin schema/prompt + parity gate
**Tujuan:** blok schema+prompt bank-soal identik di 2 lokasi + gate hash. BELUM sambung config.
**File BOLEH:**
- EDIT `src/features/tools/bankSoal.ts` — bungkus blok parity dgn penanda `// <BANKSOAL-PARITY-START>` … `// <BANKSOAL-PARITY-END>` (isi: `BANKSOAL_RESPONSE_SCHEMA` + `SYSTEM_PROMPT_BANKSOAL` + template user-prompt).
- EDIT `api/generate.ts` — tambah blok parity **inline, PERSIS identik** (penanda sama). **Belum ubah generationConfig; belum ganti builder aktif.** (blok = dead code sementara)
- BARU `scripts/check-banksoal-parity.mjs` — ekstrak blok antar penanda di kedua file, `sha256`, assert sama, exit 1 bila beda.
- EDIT `package.json` — `"check:parity": "node scripts/check-banksoal-parity.mjs"`.
**File TERLARANG:** frozen; infra api (key/failover/retry/timeout); ai.ts/App/ResultPanel.
**Guard:** blok di 2 file **tekstual identik**. `api/generate.ts` perilaku belum berubah (config & builder aktif masih lama). Kode sekitar boleh beda; hanya blok penanda yang wajib sama.
**Perintah cek:**
```
node scripts/check-banksoal-parity.mjs     # HARUS exit 0 + "PARITY OK"
npx tsc --noEmit
git diff --stat <commit-tahap1> HEAD        # HANYA: bankSoal.ts, api/generate.ts, scripts/check-banksoal-parity.mjs, package.json
git hash-object api/generate.ts             # catat blob baru (beku-izin bergerak)
```
**Gate PASS/FAIL:**
- ✅ PASS: parity exit 0 · typecheck bersih · diff hanya 4 file di atas · frozen tak muncul di diff.
- ❌ FAIL: parity beda / typecheck error / file lain tersentuh / frozen berubah.
**Verifikator:** tarik branch, jalankan parity sendiri, hash `api/generate.ts`, konfirmasi frozen utuh.

---

# TAHAP 3 — Wiring WEB (server config, dumb)
**Tujuan:** jalur web (`api/generate.ts`) emit JSON untuk bank-soal.
**File BOLEH:**
- EDIT `api/generate.ts` — untuk bank-soal: (a) pakai `SYSTEM_PROMPT_BANKSOAL` + user-prompt JSON dari blok parity, (b) **cabang `generationConfig`**: `toolId==='bank-soal'` → `{ maxOutputTokens, responseMimeType:'application/json', responseSchema: BANKSOAL_RESPONSE_SCHEMA }`; selain itu tetap `{ maxOutputTokens }`. Balikan tetap `{ text }`.
**File TERLARANG:** infra api (key/failover/retry/timeout) — TIDAK berubah; frozen; native/client.
**Guard:** blok parity **tidak berubah** (parity tetap hijau). Hanya wiring handler (system prompt + config cabang) yang berubah, di LUAR penanda parity. Tool lain (config text-mode) tak terpengaruh.
**Perintah cek:**
```
node scripts/check-banksoal-parity.mjs     # tetap exit 0
npx tsc --noEmit
npm run build                              # HARUS sukses (typecheck+bundle)
git diff --stat <commit-tahap2> HEAD        # HANYA api/generate.ts
```
Lalu deploy preview (push branch) → **Vercel preview READY** → uji manual: generate bank-soal 5/3/2 → response `text` berisi **JSON valid** (tempel potongan mentah / cek via devtools).
**Gate PASS/FAIL:**
- ✅ PASS: parity hijau · build sukses · Vercel preview READY · response bank-soal = JSON valid parse-able.
- ❌ FAIL: build gagal / preview ERROR / response bukan JSON / tool lain rusak.
**Verifikator:** hash `api/generate.ts`; Vercel preview state READY (via Vercel MCP) untuk commit tahap ini; frozen utuh.

---

# TAHAP 4 — Client: parse + validasi + render + error + storage + guard
**Tujuan:** tampilkan JSON sebagai UI, tangani error jujur, simpan envelope, guard input. (Diuji di preview web — jalur web sudah emit JSON dari Tahap 3.)
**File BOLEH:**
- BARU `src/components/BankSoalView.tsx` — render `{data, validation}`: banner validasi (🔴 "Draft AI bermasalah" / 🟡 "perlu cek guru" + list issue), disclaimer Draft AI, `sumber`, seksi PG/Isian/Esai **RE-NUMBER 1..N**, opsi A–E daftar, Kunci/Pembahasan/Rubrik terpisah, Arab `dir="auto"`. Ikuti token Akhid Noir per DESIGN.md. Jangan membuat token warna baru. Elemen integritas seperti Sumber, Draft AI, banner validasi, dan status data harus tetap jelas.
- EDIT `src/App.tsx` — cabang bank-soal:
  - **Guard sebelum generate:** total `pg+isian+esai===0` → cegah (pesan isi jumlah); **total>20** → cegah (`SOFT_CAP_TOTAL=20`, arahkan "buat per bagian").
  - Setelah `generate('bank-soal')`: `safeParseBankSoal(raw)`.
    - gagal parse → **error jujur** "Format hasil belum bisa dibaca ({reason}). Buat Ulang." + tombol Buat Ulang. **TIDAK simpan.**
    - sukses → `validateBankSoal(data, diminta)` → render `BankSoalView`. **Simpan diizinkan** (envelope, lihat bawah), termasuk bila ada error struktur (riwayat draft bermasalah).
  - **Envelope simpan (R2):** `output_text = JSON.stringify({ schemaVersion:'bank-soal-json-v1', jumlahDiminta:{pg,isian,esai}, soal:data })`.
  - Status hasil tetap **Draft AI**; JANGAN set verified.
- EDIT `src/components/ResultPanel.tsx` — cabang render: `activeTool.id==='bank-soal'` & parse-ok → `BankSoalView`; else → ReactMarkdown (TETAP, tool lain tak berubah). Toolbar bank-soal (Salin/.txt/Word) tahap 7.
**File TERLARANG:** frozen; api infra; ai.ts (native — tahap 5).
**Guard:** tool NON-bank-soal **tidak berubah** (tetap ReactMarkdown, simpan markdown). Perubahan App/ResultPanel bercabang hanya untuk bank-soal.
**Perintah cek:**
```
node scripts/check-banksoal-parity.mjs     # tetap hijau
npx tsc --noEmit && npm run build
git diff --stat <commit-tahap3> HEAD        # HANYA BankSoalView.tsx, App.tsx, ResultPanel.tsx
```
Preview → **GERBANG (web):** (1) PG saja → opsi tumpuk, Kunci/Pembahasan TERPISAH (dari struktur). (2) Campur 5/3/2 → semua seksi benar, RE-NUMBER urut. (3) Esai → rubrik tabel. (4) total 0 → dicegah. (5) total >20 → dicegah. (6) JSON rusak (paksa: mis. minta jumlah ekstrem yang truncate) → **error jujur, tak tersimpan**. (7) tool lain (Modul Ajar) → tetap normal.
**Gate PASS/FAIL:**
- ✅ PASS: parity hijau · build sukses · ketujuh skenario sesuai · tool lain utuh.
- ❌ FAIL: salah satu skenario meleset / tool lain rusak / hasil error tersimpan diam-diam.
**Verifikator:** hash file berubah; diff scope; Vercel preview READY; frozen utuh.

---

# TAHAP 5 — Wiring NATIVE
**Tujuan:** jalur native (Capacitor BYOK) juga emit JSON. Parity tetap hijau.
**File BOLEH:**
- EDIT `src/services/ai.ts` — `geminiDirect(system, user, maxTokens, opts?)` terima opsi `{responseMimeType?, responseSchema?}` → masuk `generationConfig`. `generate()` cabang bank-soal: pakai `SYSTEM_PROMPT_BANKSOAL` + `BANKSOAL_RESPONSE_SCHEMA` (dari `bankSoal.ts`). Tambah cek `candidates[0].finishReason==='MAX_TOKENS'` → pesan "Output terpotong, kurangi jumlah soal."
- EDIT `src/features/tools/promptBuilder.ts` — builder `'bank-soal'` delegasi ke `buildBankSoalUserPrompt` (`bankSoal.ts`); buang blok markdown/TATA LETAK WAJIB. (native pakai blok parity yang sama)
**File TERLARANG:** frozen; api infra.
**Guard:** blok parity tetap identik (parity hijau). Native & web kini keduanya JSON, prompt/schema sama.
**Perintah cek:**
```
node scripts/check-banksoal-parity.mjs
npx tsc --noEmit && npm run build
git diff --stat <commit-tahap4> HEAD        # HANYA ai.ts, promptBuilder.ts
git hash-object src/features/tools/promptBuilder.ts
```
**Gate PASS/FAIL:**
- ✅ PASS: parity hijau · build sukses · diff hanya 2 file. (Uji APK: ditunda ke Tahap 9, atau smoke di sini bila ada APK preview.)
- ❌ FAIL: parity beda / build gagal / file lain tersentuh.
**Verifikator:** hash promptBuilder (blob baru — non-beku); parity; frozen utuh.

---

# TAHAP 6 — Simpan / muat-ulang + Legacy fallback (R1)
**Tujuan:** riwayat/tersimpan bank-soal muat ulang benar; hasil lama (markdown) tak error.
**File BOLEH:** EDIT `src/App.tsx` (jalur muat-ulang baris ~224/269), EDIT `ResultPanel.tsx`/`BankSoalView` bila perlu badge legacy.
**Langkah:**
- Pastikan record tersimpan menyertakan **toolId** (untuk cabang render). Bila belum, tambahkan (perubahan penyimpanan kecil — konfirmasi kolom).
- Muat ulang bank-soal: baca `output_text` → coba `JSON.parse` + shape-guard:
  - envelope v1 (ada `schemaVersion`/`soal`) → ambil `soal` + `jumlahDiminta` → `validateBankSoal` → `BankSoalView`.
  - JSON BankSoal-shape tanpa versi (transisi) → tetap render `BankSoalView` (guard bentuk).
  - **bukan JSON (R1 Legacy)** → render sebagai Markdown (ReactMarkdown) + badge **"Legacy — belum tervalidasi struktur"**. BUKAN error.
**File TERLARANG:** frozen; api; ai.ts.
**Perintah cek:**
```
npx tsc --noEmit && npm run build
node scripts/check-banksoal-parity.mjs
git diff --stat <commit-tahap5> HEAD
```
Preview: (1) Simpan bank-soal baru → buka dari Tersimpan → render struktur + jumlahDiminta benar. (2) Suntik record markdown lama (simulasi) → buka → **Legacy badge**, tak error. (3) Tool lain di Tersimpan → normal.
**Gate PASS/FAIL:** ✅ ketiga skenario sesuai + build + parity hijau. ❌ legacy dianggap error / struktur gagal muat / tool lain rusak.

---

# TAHAP 7 — Ekspor (Salin / .txt / Word) + peringatan (R4)
**Tujuan:** ekspor bank-soal keluar teks terbaca; hasil bermasalah diberi peringatan.
**File BOLEH:** EDIT `ResultPanel.tsx` (handler toolbar bank-soal pakai `serializeBankSoal(data)`), EDIT `bankSoal.ts` bila `serializeBankSoal` perlu disempurnakan.
**Langkah:** Salin/.txt/Word untuk bank-soal → `serializeBankSoal` (markdown rapi). Bila `validation.ok===false` → **prepend peringatan** di teks ekspor: "⚠ Draft AI bermasalah — periksa struktur sebelum dipakai."
**Perintah cek:** `npx tsc --noEmit && npm run build` · parity hijau · `git diff --stat`.
Preview: Salin/.txt/Word pada hasil bersih → teks rapi; pada hasil ber-error → ada baris peringatan.
**Gate PASS/FAIL:** ✅ ketiga ekspor keluar teks benar + peringatan muncul saat error. ❌ ekspor keluar JSON mentah / peringatan hilang.

---

# TAHAP 8 — CI parity (A3: inspeksi dulu)
**Tujuan:** parity gate jalan otomatis.
**Langkah:**
```
ls -la .github/workflows/                   # INSPEKSI LIVE dulu — jangan tebak
```
- Bila ada workflow build/test utama → sisipkan langkah `- run: npm run check:parity` (setelah `npm ci`, sebelum/berbarengan build).
- Bila tak ada yang cocok → BUAT workflow minimal baru `.github/workflows/parity.yml`: checkout → setup-node → `npm ci` → `npm run check:parity` → `npm run build`.
**File BOLEH:** `.github/workflows/*.yml` (edit/baru), `package.json` (bila perlu).
**File TERLARANG:** frozen; api infra.
**Perintah cek:** push → **Actions run HIJAU** (parity + build). Tempel link/hasil run.
**Gate PASS/FAIL:** ✅ CI run hijau, `check:parity` benar-benar tereksekusi. ❌ CI merah / langkah parity tak jalan.

---

# TAHAP 9 — Gerbang final + verifikasi + MERGE
**Tujuan:** validasi menyeluruh lalu masuk produksi.
**Langkah:**
1. **APK smoke test (A4):** build APK (GitHub Actions) → pasang → generate bank-soal 5/3/2 di native → render benar, simpan/muat ulang OK. (Wajib sebelum merge.)
2. **Gerbang visual multi-skenario (web + native) — WAJIB semua:** PG saja · campur 5/3/2 · esai saja · total 0 dicegah · >20 dicegah · **JSON rusak → error jujur (TAK tersimpan)** · **simpan → muat ulang benar** · **legacy markdown → badge "Legacy"** · **Salin / .txt / Word keluar teks terbaca (+ peringatan bila hasil ber-error)** · tool lain (Modul Ajar/LKPD/Rapor/Sederhana) utuh.
3. **Verifikasi live (Verifikator):** parity hijau · `git diff --stat main HEAD` = hanya file yang direncanakan (tak ada frozen) · blob file kunci sesuai · **6 file beku (lihat ATURAN GLOBAL item 2) identik main** · Vercel preview READY.
4. **MERGE:** `git merge --no-ff feat-banksoal-json-v2.1` via CLI. Kunci `tree(main)==tree(branch)`. Push.
5. **Re-baseline** ringkasan sesi (main baru, blob baru, dep `remark-breaks` + tak ada dep baru lain kecuali yang tercatat).
**Gate PASS/FAIL:** ✅ semua skenario lulus + APK smoke OK + verifikasi live bersih → merge. ❌ ada yang gagal → jangan merge; perbaiki di branch.

---

## LAMPIRAN A — Kode cek validator (final, dgn R3)
Global: `PG_COUNT_MISMATCH`🔴 `ISIAN_COUNT_MISMATCH`🔴 `ESAI_COUNT_MISMATCH`🔴 `SUMBER_EMPTY`🔴 `NOMOR_DUP`🟡 `UNKNOWN_FIELD`🟡(key top-level asing)
PG: `PG_PERTANYAAN_EMPTY`🔴 `PG_OPSI_EMPTY`🔴 `PG_KUNCI_INVALID`🔴 `PG_KUNCI_NO_OPTION`🔴 `PG_PEMBAHASAN_EMPTY`🟡
Isian: `ISIAN_PERTANYAAN_EMPTY`🔴 `ISIAN_NO_RUMPANG`🟡 `ISIAN_KUNCI_EMPTY`🔴 `ISIAN_PEMBAHASAN_EMPTY`🟡 **`ISIAN_HAS_OPSI`🔴(R3)**
Esai: `ESAI_PERTANYAAN_EMPTY`🔴 `ESAI_RUBRIK_TOO_FEW`🔴 `ESAI_RUBRIK_DESKRIPTOR_EMPTY`🔴 `ESAI_PEMBAHASAN_EMPTY`🟡 **`ESAI_HAS_OPSI`🔴(R3)**
Semua string: `PLACEHOLDER_LEAK`🔴 · `ARAB_PERLU_CEK`🟡
`ok = issues.every(i => i.severity !== 'error')`. Validator TIDAK set status.

## LAMPIRAN B — Envelope simpan (R2)
```json
{ "schemaVersion": "bank-soal-json-v1",
  "jumlahDiminta": { "pg": 5, "isian": 3, "esai": 2 },
  "soal": { "sumber": "...", "pilihanGanda": [...], "isian": [...], "esai": [...] } }
```
Metadata ditambah client setelah parse sukses. `output_text` = string envelope ini.

## LAMPIRAN C — Konstanta guard (client)
`SOFT_CAP_TOTAL = 20` (A1) · default form 5/3/2 · re-number render per seksi (A2) · schemaVersion `"bank-soal-json-v1"`.

## LAMPIRAN D — Dua mode kegagalan (jangan tertukar)
- **JSON invalid (parse gagal / truncate):** error jujur + Buat Ulang + **TIDAK disimpan**.
- **JSON valid + error struktur:** tampil banner merah "Draft AI bermasalah", tetap Draft AI, **boleh** disimpan (riwayat draft) & ekspor **dengan peringatan**. Tak pernah verified.
