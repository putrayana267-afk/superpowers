export const SYSTEM_PROMPT = `Kamu adalah asisten ahli untuk guru di Indonesia yang memahami Kurikulum Merdeka. \
Jawab dalam Bahasa Indonesia, langsung ke hasil, akurat secara pedagogis, lengkap, dan siap pakai. \
Gunakan format Markdown yang rapi (judul dengan ##, daftar, tabel bila perlu). \
Jangan tambahkan perkenalan atau penutup yang tidak perlu — langsung sajikan materi.`

export type PromptBuilder = (inputs: Record<string, string>) => string

export const promptBuilders: Record<string, PromptBuilder> = {
  'modul-ajar': (inputs) => {
    const islamiNote = inputs.islami === 'true'
      ? '\n- Sisipkan nilai-nilai Islami yang relevan secara alami dan kontekstual dalam kegiatan pembelajaran.'
      : ''
    const catatanNote = inputs.catatan
      ? `\n- Catatan Tambahan: ${inputs.catatan}`
      : ''

    return `Buat **Modul Ajar Kurikulum Merdeka** yang lengkap dan siap pakai untuk:
- Mata Pelajaran: ${inputs.mapel}
- Kelas / Fase: ${inputs.kelas}
- Topik: ${inputs.topik}
- Alokasi Waktu: ${inputs.waktu}${catatanNote}${islamiNote}

Susun modul ajar dengan format berikut secara lengkap:

## Identitas Modul
Isi dengan: Nama Sekolah (kosong untuk diisi guru), Mata Pelajaran, Kelas/Fase, Topik, Alokasi Waktu, Penyusun (kosong).

## Tujuan Pembelajaran
Tulis 2–3 tujuan pembelajaran menggunakan format: "Peserta didik mampu [aktivitas] [objek] [kondisi/keterangan]" sesuai taksonomi Bloom.

## Profil Pelajar Pancasila
Sebutkan 2–3 dimensi yang relevan dan jelaskan secara konkret bagaimana kegiatan mengintegrasikannya.

## Sarana, Prasarana, dan Media Pembelajaran
Daftar alat, bahan, dan media yang dibutuhkan.

## Kegiatan Pembelajaran

### Pendahuluan (estimasi menit dari total waktu ~10-15%)
Langkah-langkah pembuka: salam, apersepsi, motivasi, penyampaian tujuan.

### Kegiatan Inti (estimasi menit ~65-75%)
Langkah-langkah pembelajaran utama yang aktif, berpusat pada siswa, dengan variasi metode.

### Penutup (estimasi menit ~10-15%)
Refleksi, rangkuman, tindak lanjut, salam penutup.

## Asesmen
Rincikan: jenis asesmen (diagnostik/formatif/sumatif), teknik, instrumen, dan berikan 1–2 contoh konkret.`
  },

  'bank-soal': (inputs) => {
    const isPG = inputs.jenisSoal === 'Pilihan Ganda' || inputs.jenisSoal === 'Campuran (PG + Esai)'
    const isEsai = inputs.jenisSoal === 'Esai' || inputs.jenisSoal === 'Campuran (PG + Esai)'
    const isHOTS = inputs.tingkat === 'HOTS'

    const pgNote = isPG ? '\n- Soal Pilihan Ganda: sediakan 4 opsi (A, B, C, D) dengan 1 jawaban benar yang jelas. Pengecoh harus masuk akal.' : ''
    const hotsNote = isHOTS ? '\n- Soal HOTS: gunakan stimulus berupa kasus, data, grafik, atau teks pendek. Tuntut kemampuan analisis (C4), evaluasi (C5), atau kreasi (C6).' : ''
    const esaiNote = isEsai ? '\n- Soal Esai: berikan petunjuk yang jelas tentang cakupan jawaban yang diharapkan.' : ''

    return `Buat **${inputs.jumlah} soal ${inputs.jenisSoal}** untuk:
- Mata Pelajaran: ${inputs.mapel}
- Kelas: ${inputs.kelas}
- Topik: ${inputs.topik}
- Tingkat Kesulitan: ${inputs.tingkat}
${pgNote}${hotsNote}${esaiNote}

**Format output:**

Tulis soal bernomor 1 sampai ${inputs.jumlah}. Setiap soal harus jelas, tidak ambigu, dan sesuai tingkat perkembangan siswa ${inputs.kelas}.

Setelah semua soal, tambahkan bagian:

---

## KUNCI JAWABAN

Untuk setiap nomor tulis:
- PG: Nomor. Jawaban: [Huruf] — [opsional: penjelasan singkat mengapa jawaban ini benar]
- Esai/Isian: Nomor. Kunci: [jawaban/poin utama] | Skor: [x poin]`
  },

  'lkpd': (inputs) => `Buat **Lembar Kerja Peserta Didik (LKPD)** yang lengkap dan siap cetak untuk:
- Mata Pelajaran: ${inputs.mapel}
- Kelas: ${inputs.kelas}
- Topik: ${inputs.topik}
- Tujuan Pembelajaran: ${inputs.tujuan}
- Jenis Aktivitas: ${inputs.jenisAktivitas}

Susun LKPD dengan komponen berikut:

## LEMBAR KERJA PESERTA DIDIK
### ${inputs.mapel} — ${inputs.topik}

**Identitas Peserta Didik**
Nama : ___________________________
Kelas : _____________ | Tanggal: _____________
${inputs.jenisAktivitas === 'Kelompok' ? 'Kelompok : ___________________________\nAnggota : ___________________________' : ''}

---

## Tujuan Pembelajaran
[Tulis tujuan berdasarkan input]

## Alat dan Bahan
[Daftar alat/bahan yang dibutuhkan]

## Petunjuk Pengerjaan
[Instruksi yang jelas, singkat, dan mudah dipahami siswa]

## Langkah Kegiatan
[Langkah-langkah bernomor yang logis dan terstruktur]

## Pertanyaan Refleksi
[3–4 pertanyaan yang mendorong siswa berpikir kritis dan merefleksikan pengalaman belajar]

## Kolom Jawaban
[Sediakan kotak/garis kosong yang cukup untuk setiap pertanyaan/langkah yang memerlukan jawaban tertulis]`,

  'rubrik-penilaian': (inputs) => `Buat **rubrik penilaian** yang lengkap dan objektif untuk:
- Tugas / Kegiatan: ${inputs.tugas}
- Kelas: ${inputs.kelas}
- Aspek yang Dinilai: ${inputs.aspek}
- Skala: ${inputs.skala}

Sajikan dalam **tabel Markdown** dengan struktur:
| Kriteria | Level ${inputs.skala === '1–4' ? '1 (Perlu Bimbingan)' : inputs.skala === '1–5' ? '1 (Sangat Kurang)' : inputs.skala === 'A/B/C/D' ? 'D' : 'Kurang'} | Level 2 | Level 3 | Level ${inputs.skala === '1–4' ? '4 (Mahir)' : inputs.skala === '1–5' ? '5 (Sangat Baik)' : inputs.skala === 'A/B/C/D' ? 'A' : 'Sangat Baik'} |

Setiap sel berisi deskriptor perilaku yang **spesifik, terukur, dan dapat diamati** — bukan hanya kata sifat umum.

Setelah tabel, tambahkan:

## Cara Menghitung Nilai Akhir
Berikan rumus yang jelas dan contoh perhitungan konkret untuk 1 siswa hipotetis.`,

  'penyederhana-materi': (inputs) => `Sederhanakan materi berikut agar mudah dipahami oleh siswa ${inputs.kelas}:

---
${inputs.materi}
---

**Gaya penyampaian yang diminta: ${inputs.gaya}**

Tulis ulang seluruh konten dengan:
- Bahasa yang sesuai usia dan tingkat kognitif siswa ${inputs.kelas}
- Kalimat pendek dan jelas
- Contoh dari kehidupan sehari-hari yang dekat dengan siswa Indonesia
- Hindari jargon ilmiah tanpa penjelasan

Di bagian akhir, tambahkan:

## INTI YANG HARUS DIINGAT
1. [Poin paling penting pertama — satu kalimat singkat]
2. [Poin paling penting kedua — satu kalimat singkat]
3. [Poin paling penting ketiga — satu kalimat singkat]`,

  'komentar-rapor': (inputs) => {
    const namaNote = inputs.namaSiswa ? `Nama siswa: **${inputs.namaSiswa}**\n` : ''
    const islamiNote = inputs.islami === 'true'
      ? '\n- Sertakan satu kalimat bernuansa Islami yang positif dan membangun (misalnya doa atau nilai akhlak) pada salah satu alternatif.'
      : ''

    return `Buat **3 alternatif komentar rapor / deskripsi capaian** untuk:
${namaNote}- Aspek / Mata Pelajaran: ${inputs.aspek}
- Catatan tentang siswa: ${inputs.catatan}
- Nada: ${inputs.nada}${islamiNote}

Ketentuan setiap alternatif:
- Panjang: 2–3 kalimat
- Sebutkan kekuatan atau prestasi siswa terlebih dahulu
- Kemudian sampaikan area pengembangan secara **positif dan membangun** (bukan negatif)
- Hindari kata yang merendahkan
- Gunakan variasi kalimat yang berbeda di setiap alternatif

**Format:**

**Alternatif 1:**
[komentar]

**Alternatif 2:**
[komentar]

**Alternatif 3:**
[komentar]`
  },

  'ide-kegiatan': (inputs) => `Buat **4 ide ${inputs.jenisKegiatan}** untuk:
- Mapel / Tema: ${inputs.mapelTema}
- Kelas: ${inputs.kelas}
- Tujuan: ${inputs.tujuan}

Ketentuan setiap ide:
- Aman untuk semua siswa
- Hemat biaya (tidak butuh peralatan mahal)
- Sesuai konteks kelas di Indonesia
- Menyenangkan dan efektif mencapai tujuan

**Format setiap ide:**

### Ide [N]: [Nama Kegiatan]

**Durasi:** [estimasi waktu]
**Alat / Bahan:** [daftar singkat, hemat]

**Langkah-langkah:**
1. [langkah 1]
2. [langkah 2]
3. [langkah 3]
4. [langkah 4]

**Mengapa efektif:** [1 kalimat penjelasan pedagogis]`,

  'komunikasi-ortu': (inputs) => {
    const isWA = inputs.kanal === 'WhatsApp'

    return `Buat **draf pesan untuk orang tua/wali** dengan spesifikasi berikut:
- Tujuan: ${inputs.tujuanPesan}
- Konteks: ${inputs.konteks}
- Kanal: ${inputs.kanal}
- Nada: ${inputs.nada}

${isWA
  ? `**Format WhatsApp:**
- Mulai dengan salam yang hangat dan perkenalan singkat sebagai guru
- Sampaikan tujuan dengan jelas dan ringkas
- Gunakan paragraf pendek (2–3 kalimat per paragraf)
- Akhiri dengan ucapan terima kasih dan nama pengirim (bisa diisi guru)
- Boleh menggunakan 1–2 emoji yang sopan jika nadanya ramah`
  : `**Format Surat Resmi:**
Susun dengan komponen lengkap:
1. Kop surat (tempat, tanggal)
2. Nomor surat (opsional)
3. Perihal
4. Alamat tujuan
5. Salam pembuka
6. Isi surat (3–4 paragraf yang jelas)
7. Salam penutup
8. Tanda tangan dan nama guru`}

Pastikan pesan sopan, mudah dipahami, dan tidak menimbulkan kekhawatiran berlebihan pada orang tua.`
  },
}
