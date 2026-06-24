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

export interface KurikulumEntry {
  jenjang: string;   // "SD/MI" | "SMP/MTs" | "SMA/MA" | "Pesantren"
  kelompok: string;  // "Umum/Nasional (Kemendikbud)" | "Kekhasan Pesantren (Kitab Kuning)"
  mapel: string;
  kelas?: string;    // "1".."12" utk nasional; kosong = lintas kelas (mis. kitab pesantren)
  topik: Topik[];
}

// Normalisasi agar pencocokan tahan beda spasi/kapital.
const norm = (s: string | undefined | null): string =>
  (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");

export const KURIKULUM: KurikulumEntry[] = [
  // -------------------------------------------------------------------------
  // PESANTREN — NAHWU (Matan Al-Jurumiyah). Sesuai contoh gambar pengguna.
  // -------------------------------------------------------------------------
  {
    jenjang: "Pesantren",
    kelompok: "Kekhasan Pesantren (Kitab Kuning)",
    mapel: "Nahwu (Gramatika - Rumpun Alat)",
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
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Bahasa Indonesia",
    kelas: "1", // CONTOH — verifikasi dengan ATP Fase A sekolah Anda
    topik: [
      { id: "bi1-huruf",     label: "[CONTOH] Mengenal Bunyi & Bentuk Huruf" },
      { id: "bi1-suku-kata", label: "[CONTOH] Membaca Suku Kata & Kata Sederhana" },
      { id: "bi1-benda",     label: "[CONTOH] Mengenal Nama Benda di Sekitar" },
    ],
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
 * Ambil daftar topik untuk kombinasi terpilih.
 * - Cocokkan kelompok & mapel via kategori kanonik (tahan beda label/ejaan).
 * - Kelompok Pesantren/Kitab Kuning: kitab bersifat lintas-jenjang → jenjang
 *   DIABAIKAN. Untuk kelompok lain (nasional/madrasah) jenjang harus cocok.
 * - Jika entri punya `kelas`, cocokkan juga dengan kelas terpilih.
 * - Gabungkan & dedup; kembalikan [] jika tak ada → pemanggil HARUS fallback.
 */
export function getTopik(
  jenjang: string,
  kelompok: string,
  mapel: string,
  kelas?: string
): Topik[] {
  const j = norm(jenjang);
  const ck = canonKelompok(kelompok);
  const cm = canonMapel(mapel);
  const kl = norm(kelas);
  const pesantren = ck === "pesantren";

  const cocok = KURIKULUM.filter((e) => {
    if (canonKelompok(e.kelompok) !== ck) return false;
    if (canonMapel(e.mapel) !== cm) return false;
    // Pesantren/kitab kuning lintas jenjang → abaikan jenjang.
    if (!pesantren && norm(e.jenjang) !== j) return false;
    if (e.kelas != null && e.kelas !== "") return norm(e.kelas) === kl;
    return true;
  });

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
