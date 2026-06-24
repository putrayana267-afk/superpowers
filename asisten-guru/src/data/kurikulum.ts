// =============================================================================
// DATA KURIKULUM — POKOK PEMBAHASAN PER JENJANG / KELAS / MAPEL
// Pesantren: struktur kitab klasik (stabil). Nasional: WAJIB diverifikasi dari
// dokumen resmi Capaian Pembelajaran (CP)/ATP. Kombinasi tanpa data akan otomatis
// fallback ke input teks bebas — jadi AMAN dibiarkan kosong. JANGAN mengarang.
// =============================================================================

export interface Topik {
  id: string;
  label: string;
}

/** Status keandalan data sebuah entri kurikulum. */
export type StatusData = 'verified' | 'draft' | 'contoh' | 'kosong';

export interface KurikulumEntry {
  jenjang: string;   // "SD/MI" | "SMP/MTs" | "SMA/MA" | "Pesantren"
  kelompok: string;  // "Umum/Nasional (Kemendikbud)" | "Kekhasan Pesantren (Kitab Kuning)"
  mapel: string;
  kelas?: string;    // "1".."12" utk nasional; kosong = lintas kelas (mis. kitab pesantren)
  status: StatusData; // WAJIB: keandalan data
  sumber?: string;    // rujukan (kitab/dokumen) bila ada
  topik: Topik[];
}

// Normalisasi agar pencocokan tahan beda spasi/kapital.
const norm = (s: string | undefined | null): string =>
  (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");

// Topik DRAFT Bahasa Indonesia Fase A (Kelas 1 & 2) — diturunkan dari TEMA &
// JENIS TEKS yang tersurat di CP (Kepka BSKAP 046/H/KR/2025). BUKAN daftar bab
// resmi per kelas → status 'draft' sampai diverifikasi ke ATP/buku teks.
const BIND_FASE_A_TOPIK: Topik[] = [
  // A. Tema (konteks wajib di CP)
  { id: "bind-a-diriku", label: "Diriku (perkenalan diri)" },
  { id: "bind-a-keluarga", label: "Keluargaku" },
  { id: "bind-a-kesehatan", label: "Kesehatan & kebersihan diri" },
  { id: "bind-a-lingkungan", label: "Lingkungan sekitar" },
  // B. Keterampilan dasar (fondasi literasi)
  { id: "bind-c-fonemik", label: "Kesadaran fonemik (bunyi huruf)" },
  { id: "bind-c-membaca", label: "Membaca permulaan (kata-kata sederhana)" },
  { id: "bind-c-menulis", label: "Menulis permulaan (memegang alat tulis, tulisan tangan)" },
  // C. Jenis teks sederhana (dari ATP referensi Kemendikdasmen)
  { id: "bind-b-deskripsi", label: "Teks deskripsi" },
  { id: "bind-b-rekon", label: "Teks rekon (pengalaman diri)" },
  { id: "bind-b-narasi", label: "Teks narasi" },
  { id: "bind-b-puisi", label: "Puisi anak" },
  { id: "bind-b-prosedur", label: "Teks prosedur" },
  { id: "bind-b-eksposisi", label: "Teks eksposisi" },
];

// Topik DRAFT Matematika Fase A (Kelas 1 & 2) — 4 elemen CP: Bilangan, Aljabar,
// Pengukuran, Geometri (Analisis Data & Peluang BELUM ada di Fase A). Diturunkan
// dari CP (Kepka BSKAP 046/H/KR/2025) → status 'draft' sampai diverifikasi ke ATP.
const MTK_FASE_A_TOPIK: Topik[] = [
  // A. Bilangan
  { id: "mtk-bil-cacah100", label: "Bilangan cacah sampai 100 (membaca, menulis, nilai tempat)" },
  { id: "mtk-bil-bandingurut", label: "Membandingkan & mengurutkan bilangan" },
  { id: "mtk-bil-kompdekomp", label: "Komposisi & dekomposisi bilangan" },
  { id: "mtk-bil-tambahkurang20", label: "Penjumlahan & pengurangan sampai 20 (benda konkret)" },
  { id: "mtk-bil-pecahan", label: "Pecahan sederhana (setengah & seperempat)" },
  // B. Aljabar
  { id: "mtk-alj-pola", label: "Pola bilangan & pola gambar/objek" },
  { id: "mtk-alj-nilaibelumdiketahui", label: "Mencari nilai yang belum diketahui dalam kalimat matematika" },
  // C. Pengukuran
  { id: "mtk-ukur-panjangberat", label: "Mengukur panjang & berat (satuan baku: cm, m, g, kg)" },
  { id: "mtk-ukur-luasvolume", label: "Mengestimasi luas & volume (satuan tidak baku & baku)" },
  // D. Geometri
  { id: "mtk-geo-bangundatar", label: "Mengenal bangun datar (segitiga, segiempat, segibanyak, lingkaran)" },
  { id: "mtk-geo-bangunruang", label: "Mengenal bangun ruang (balok, kubus)" },
  { id: "mtk-geo-kompdekomp", label: "Komposisi & dekomposisi bangun datar" },
  { id: "mtk-geo-posisi", label: "Posisi benda (kanan/kiri/depan/belakang/atas/bawah)" },
];

// Topik DRAFT Pendidikan Pancasila Fase A (Kelas 1 & 2) — 4 elemen CP: Pancasila,
// UUD NRI 1945, Bhinneka Tunggal Ika, NKRI. Diturunkan dari CP (Kepka BSKAP
// 046/H/KR/2025) → status 'draft' sampai diverifikasi ke ATP/buku teks.
const PPKN_FASE_A_TOPIK: Topik[] = [
  // A. Pancasila
  { id: "ppkn-pcs-benderalagu", label: "Bendera negara & lagu kebangsaan Indonesia" },
  { id: "ppkn-pcs-garuda", label: "Lambang negara Garuda Pancasila" },
  { id: "ppkn-pcs-simbolsila", label: "Simbol & bunyi sila-sila Pancasila" },
  { id: "ppkn-pcs-nilaikeluarga", label: "Menerapkan nilai Pancasila di lingkungan keluarga" },
  // B. UUD NRI 1945
  { id: "ppkn-uud-aturankeluarga", label: "Mengenal aturan di lingkungan keluarga" },
  { id: "ppkn-uud-patuhcerita", label: "Mematuhi & menceritakan aturan keluarga" },
  // C. Bhinneka Tunggal Ika
  { id: "ppkn-bti-semboyan", label: "Semboyan Bhinneka Tunggal Ika" },
  { id: "ppkn-bti-identitas", label: "Menghargai identitas diri (jenis kelamin, hobi, bahasa, agama)" },
  // D. NKRI
  { id: "ppkn-nkri-rumahsekolah", label: "Lingkungan rumah & sekolah sebagai bagian NKRI" },
  { id: "ppkn-nkri-kerjasama", label: "Bekerja sama menjaga lingkungan dalam keberagaman" },
];

// Topik DRAFT PJOK Fase A (Kelas 1 & 2) — diturunkan dari CP (Kepka BSKAP
// 046/H/KR/2025). Elemen: keterampilan gerak (lokomotor/non-lokomotor/
// manipulatif), aktivitas senam/berirama/air, kebugaran, & pola hidup sehat.
const PJOK_FASE_A_TOPIK: Topik[] = [
  // A. Keterampilan gerak
  { id: "pjok-gerak-lokomotor", label: "Pola gerak dasar lokomotor (jalan, lari, lompat)" },
  { id: "pjok-gerak-nonlokomotor", label: "Pola gerak dasar non-lokomotor (memutar, mengayun, menekuk)" },
  { id: "pjok-gerak-manipulatif", label: "Pola gerak dasar manipulatif (melempar, menangkap, menendang)" },
  // B. Aktivitas
  { id: "pjok-akt-senam", label: "Aktivitas senam sederhana" },
  { id: "pjok-akt-berirama", label: "Aktivitas gerak berirama" },
  { id: "pjok-akt-air", label: "Aktivitas permainan & olahraga air (kondisional)" },
  // C. Kebugaran & pola hidup sehat
  { id: "pjok-sehat-kebugaran", label: "Kebugaran jasmani terkait kesehatan" },
  { id: "pjok-sehat-polahidup", label: "Pola hidup sehat & bersih" },
];

export const KURIKULUM: KurikulumEntry[] = [
  // -------------------------------------------------------------------------
  // PESANTREN — NAHWU (Matan Al-Jurumiyah). Sesuai contoh gambar pengguna.
  // -------------------------------------------------------------------------
  {
    jenjang: "Pesantren",
    kelompok: "Kekhasan Pesantren (Kitab Kuning)",
    mapel: "Nahwu (Gramatika - Rumpun Alat)",
    status: "verified",
    sumber: "Matan Al-Jurumiyah",
    topik: [
      { id: "nh-kalam",     label: "Bab Kalam (Pengertian Kalam & Pembagian Kalimat: Isim, Fi'il, Harf)" },
      { id: "nh-irab",      label: "Bab I'rab (Rafa', Nashab, Khafadh/Jar, Jazm)" },
      { id: "nh-alamat",    label: "Bab Tanda-tanda I'rab ('Alamat al-I'rab)" },
      { id: "nh-afal",      label: "Bab Fi'il (Madhi, Mudhari', Amr & I'rab Fi'il Mudhari')" },
      { id: "nh-marfuat",   label: "Marfu'at al-Asma' (Fa'il, Naib Fa'il, Mubtada', Khabar)" },
      { id: "nh-fail",      label: "Bab Fa'il" },
      { id: "nh-naibfail",  label: "Bab Naib al-Fa'il" },
      { id: "nh-mubtada",   label: "Bab Mubtada' dan Khabar" },
      { id: "nh-nawasikh",  label: "'Awamil Nawasikh (Kana wa Akhawatuha, Inna wa Akhawatuha)" },
      { id: "nh-tawabi",    label: "Tawabi' (Na't/Sifat, 'Athaf, Taukid, Badal)" },
      { id: "nh-manshubat", label: "Manshubat al-Asma' (Maf'ul Bih, Mashdar, Zharf, Hal, Tamyiz, Istitsna', Munada)" },
      { id: "nh-makhfudat", label: "Makhfudat al-Asma' (Jar dengan Huruf & Idhafah)" },
    ],
  },

  // -------------------------------------------------------------------------
  // PESANTREN — SHOROF (Al-Amtsilah at-Tashrifiyah).
  // -------------------------------------------------------------------------
  {
    jenjang: "Pesantren",
    kelompok: "Kekhasan Pesantren (Kitab Kuning)",
    mapel: "Shorof (Morfologi - Rumpun Alat)",
    status: "verified",
    sumber: "Al-Amtsilah at-Tashrifiyah",
    topik: [
      { id: "sh-pengertian", label: "Pengertian Tashrif (Istilahi & Lughawi)" },
      { id: "sh-tsulatsi",   label: "Fi'il Tsulatsi Mujarrad (Wazan Fa'ala-Yaf'ulu, dst.)" },
      { id: "sh-mazid",      label: "Fi'il Tsulatsi Mazid (Tambahan 1, 2, 3 Huruf)" },
      { id: "sh-musytaqat",  label: "Isim Musytaq (Isim Fa'il, Isim Maf'ul, Mashdar)" },
      { id: "sh-zaman-alat", label: "Isim Zaman, Isim Makan, dan Isim Alat" },
      { id: "sh-amr-nahi",   label: "Fi'il Amr dan Fi'il Nahi" },
      { id: "sh-mutal",      label: "Fi'il Mu'tal (Mitsal, Ajwaf, Naqish) & Kaidah I'lal" },
    ],
  },

  // -------------------------------------------------------------------------
  // PESANTREN — FIQIH (Kitab Safinatun Naja). Set bab dasar yang masyhur.
  // -------------------------------------------------------------------------
  {
    jenjang: "Pesantren",
    kelompok: "Kekhasan Pesantren (Kitab Kuning)",
    mapel: "Fiqih (Kitab Safinatun Naja)",
    status: "verified",
    sumber: "Kitab Safinatun Naja",
    topik: [
      { id: "fq-rukun",        label: "Rukun Islam dan Rukun Iman" },
      { id: "fq-thaharah",     label: "Thaharah (Bersuci) & Macam-macam Air" },
      { id: "fq-najis",        label: "Najis dan Cara Menyucikannya (Istinja')" },
      { id: "fq-wudhu",        label: "Wudhu (Fardhu, Sunnah, Pembatal)" },
      { id: "fq-mandi",        label: "Mandi Wajib (Ghusl) & Penyebabnya" },
      { id: "fq-tayamum",      label: "Tayamum" },
      { id: "fq-haid",         label: "Haid, Nifas, dan Istihadhah" },
      { id: "fq-shalat",       label: "Shalat (Syarat, Rukun, Sunnah, Pembatal)" },
      { id: "fq-jamaah",       label: "Shalat Berjamaah & Shalat Jum'at" },
    ],
  },

  // -------------------------------------------------------------------------
  // PESANTREN — TAUHID/AQIDAH (Kitab Aqidatul Awam).
  // -------------------------------------------------------------------------
  {
    jenjang: "Pesantren",
    kelompok: "Kekhasan Pesantren (Kitab Kuning)",
    mapel: "Tauhid / Aqidah (Kitab Aqidatul Awam)",
    status: "verified",
    sumber: "Kitab Aqidatul Awam",
    topik: [
      { id: "tw-wajib",     label: "20 Sifat Wajib bagi Allah" },
      { id: "tw-mustahil",  label: "20 Sifat Mustahil bagi Allah" },
      { id: "tw-jaiz",      label: "Sifat Jaiz bagi Allah" },
      { id: "tw-rasul",     label: "Sifat Wajib, Mustahil, dan Jaiz bagi Rasul" },
      { id: "tw-25nabi",    label: "Mengenal 25 Nabi dan Rasul" },
      { id: "tw-malaikat",  label: "10 Malaikat dan Tugasnya" },
      { id: "tw-isramiraj", label: "Kisah Isra' Mi'raj (Ringkas)" },
    ],
  },

  // =========================================================================
  // NASIONAL (KEMENDIKBUD) — Kurikulum Merdeka.
  // PENTING: blok di bawah HANYA CONTOH POLA. WAJIB diverifikasi & dilengkapi
  // dari CP/ATP resmi per fase-kelas. Yang belum diisi akan fallback ke input
  // teks — AMAN. JANGAN menambah topik dari kira-kira.
  // =========================================================================
  // -------------------------------------------------------------------------
  // NASIONAL — SD/MI Bahasa Indonesia, FASE A (Kelas 1 & 2). Status: DRAFT.
  // Sumber: Kepka BSKAP No. 046/H/KR/2025 — CP Bahasa Indonesia Fase A.
  // (Menggantikan entri [CONTOH] lama untuk slot yang sama.)
  // -------------------------------------------------------------------------
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Bahasa Indonesia",
    kelas: "1",
    status: "verified",
    sumber: "CP Bahasa Indonesia Fase A — Kepka BSKAP No. 046/H/KR/2025 (+ referensi ATP Kemendikdasmen)",
    topik: BIND_FASE_A_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Bahasa Indonesia",
    kelas: "2",
    status: "verified",
    sumber: "CP Bahasa Indonesia Fase A — Kepka BSKAP No. 046/H/KR/2025 (+ referensi ATP Kemendikdasmen)",
    topik: BIND_FASE_A_TOPIK,
  },

  // -------------------------------------------------------------------------
  // NASIONAL — SD/MI Matematika, FASE A (Kelas 1 & 2). Status: VERIFIED.
  // Sumber: Kepka BSKAP No. 046/H/KR/2025 — CP Matematika Fase A.
  // 4 elemen: Bilangan, Aljabar, Pengukuran, Geometri.
  // -------------------------------------------------------------------------
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Matematika",
    kelas: "1",
    status: "verified",
    sumber: "CP Matematika Fase A — Kepka BSKAP No. 046/H/KR/2025",
    topik: MTK_FASE_A_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Matematika",
    kelas: "2",
    status: "verified",
    sumber: "CP Matematika Fase A — Kepka BSKAP No. 046/H/KR/2025",
    topik: MTK_FASE_A_TOPIK,
  },

  // -------------------------------------------------------------------------
  // NASIONAL — SD/MI Pendidikan Pancasila, FASE A (Kelas 1 & 2). Status: DRAFT.
  // Sumber: Kepka BSKAP No. 046/H/KR/2025 — CP Pendidikan Pancasila Fase A.
  // 4 elemen: Pancasila, UUD NRI 1945, Bhinneka Tunggal Ika, NKRI.
  // -------------------------------------------------------------------------
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Pendidikan Pancasila",
    kelas: "1",
    status: "draft",
    sumber: "CP Pendidikan Pancasila Fase A — Kepka BSKAP No. 046/H/KR/2025",
    topik: PPKN_FASE_A_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Pendidikan Pancasila",
    kelas: "2",
    status: "draft",
    sumber: "CP Pendidikan Pancasila Fase A — Kepka BSKAP No. 046/H/KR/2025",
    topik: PPKN_FASE_A_TOPIK,
  },

  // -------------------------------------------------------------------------
  // NASIONAL — SD/MI PJOK, FASE A (Kelas 1 & 2). Status: DRAFT.
  // Sumber: Kepka BSKAP No. 046/H/KR/2025 — CP PJOK Fase A.
  // -------------------------------------------------------------------------
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "PJOK",
    kelas: "1",
    status: "draft",
    sumber: "CP PJOK Fase A — Kepka BSKAP No. 046/H/KR/2025",
    topik: PJOK_FASE_A_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "PJOK",
    kelas: "2",
    status: "draft",
    sumber: "CP PJOK Fase A — Kepka BSKAP No. 046/H/KR/2025",
    topik: PJOK_FASE_A_TOPIK,
  },
];

// -----------------------------------------------------------------------------
// ALIAS / KANONIKALISASI
// Nilai opsi <select> di app TIDAK selalu sama persis dengan label di data ini
// (mis. app: "Kekhasan Pesantren (Kitab Kuning/Dirasah Islamiyah)" & "Nahwu";
// data: "Kekhasan Pesantren (Kitab Kuning)" & "Nahwu (Gramatika - Rumpun Alat)").
// Maka cocokkan via kategori kanonik, bukan string mentah. (Data topik TETAP.)
// -----------------------------------------------------------------------------

/** Kategori kelompok kanonik dari nilai app maupun data. */
function canonKelompok(s: string): string {
  const n = norm(s);
  if (n.includes("pesantren") || n.includes("kitab kuning")) return "pesantren";
  if (n.includes("madrasah")) return "madrasah";
  if (n.includes("nasional") || n.includes("kemendikbud") || n.includes("umum"))
    return "umum";
  return n;
}

/** Rumpun mapel kanonik (toleran variasi ejaan Nahwu/Shorof/Fiqih/Tauhid, dll). */
function canonMapel(s: string): string {
  const n = norm(s);
  if (n.includes("nahwu")) return "nahwu";
  if (n.includes("shorof") || n.includes("sharaf") || n.includes("saraf"))
    return "shorof";
  if (n.includes("fiqih") || n.includes("fikih")) return "fiqih";
  if (n.includes("tauhid") || n.includes("aqidah") || n.includes("akidah"))
    return "tauhid";
  // Mapel nasional dicocokkan apa adanya (sudah seragam antara app & data).
  return n;
}

/**
 * Inti pencocokan: kembalikan SEMUA entri yang cocok untuk kombinasi.
 * - Cocokkan kelompok & mapel via kategori kanonik (tahan beda label/ejaan).
 * - Kelompok Pesantren/Kitab Kuning: kitab lintas-jenjang → jenjang DIABAIKAN.
 *   Untuk kelompok lain (nasional/madrasah) jenjang harus cocok.
 * - `kelas` opsional: bila diberikan, entri ber-`kelas` harus cocok kelasnya;
 *   bila tak diberikan (undefined), filter kelas dilewati.
 */
function cariEntri(
  jenjang: string,
  kelompok: string,
  mapel: string,
  kelas?: string
): KurikulumEntry[] {
  const j = norm(jenjang);
  const ck = canonKelompok(kelompok);
  const cm = canonMapel(mapel);
  const kl = norm(kelas);
  const pesantren = ck === "pesantren";

  return KURIKULUM.filter((e) => {
    if (canonKelompok(e.kelompok) !== ck) return false;
    if (canonMapel(e.mapel) !== cm) return false;
    // Pesantren/kitab kuning lintas jenjang → abaikan jenjang.
    if (!pesantren && norm(e.jenjang) !== j) return false;
    // Filter kelas hanya bila kelas diberikan (untuk getEntri, kelas diabaikan).
    if (kelas !== undefined && e.kelas != null && e.kelas !== "") {
      return norm(e.kelas) === kl;
    }
    return true;
  });
}

/**
 * Ambil SATU entri kurikulum untuk kombinasi (jenjang/kelompok/mapel), tanpa
 * memandang kelas. Berguna untuk membaca status/sumber data. null bila tak ada.
 */
export function getEntri(
  jenjang: string,
  kelompok: string,
  mapel: string
): KurikulumEntry | null {
  return cariEntri(jenjang, kelompok, mapel)[0] ?? null;
}

/**
 * Ambil daftar topik untuk kombinasi terpilih (gabung & dedup berdasarkan id).
 * Tanda tangan & perilaku TIDAK berubah; kembalikan [] jika tak ada (fallback).
 */
export function getTopik(
  jenjang: string,
  kelompok: string,
  mapel: string,
  kelas?: string
): Topik[] {
  const cocok = cariEntri(jenjang, kelompok, mapel, kelas);

  const out: Topik[] = [];
  const seen = new Set<string>();
  for (const e of cocok) {
    for (const t of e.topik) {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        out.push(t);
      }
    }
  }
  return out;
}

/** True jika ada data topik tetap untuk kombinasi ini (penentu dropdown vs input teks). */
export function adaTopik(
  jenjang: string,
  kelompok: string,
  mapel: string,
  kelas?: string
): boolean {
  return getTopik(jenjang, kelompok, mapel, kelas).length > 0;
}
