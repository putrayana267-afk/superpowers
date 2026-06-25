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

// Topik DRAFT Matematika Fase B (Kelas 3 & 4) — diturunkan PERSIS dari CP (Kepka
// BSKAP 046/H/KR/2025, Ruang GTK). 5 elemen: Bilangan, Aljabar, Pengukuran,
// Geometri, Analisis Data dan Peluang. Semua topik = CP-inti (tanpa turunan ATP).
const MTK_FASE_B_TOPIK: Topik[] = [
  // A. Bilangan
  { id: "mtkb-bil-cacah10rb", label: "Bilangan cacah sampai 10.000 (membaca, menulis, nilai tempat)" },
  { id: "mtkb-bil-bandingurut", label: "Membandingkan & mengurutkan bilangan cacah sampai 10.000" },
  { id: "mtkb-bil-kompdekomp", label: "Komposisi & dekomposisi bilangan cacah sampai 10.000" },
  { id: "mtkb-bil-uang", label: "Menyelesaikan masalah uang (ribuan sebagai satuan)" },
  { id: "mtkb-bil-tambahkurang1rb", label: "Penjumlahan & pengurangan bilangan cacah sampai 1.000" },
  { id: "mtkb-bil-kalibagi100", label: "Perkalian & pembagian bilangan cacah sampai 100 (benda konkret, gambar, simbol)" },
  { id: "mtkb-bil-kelipatanfaktor", label: "Menyelesaikan masalah kelipatan & faktor" },
  { id: "mtkb-bil-bandingpecahan", label: "Membandingkan & mengurutkan pecahan (pembilang satu / penyebut sama)" },
  { id: "mtkb-bil-pecahansenilai", label: "Mengenali pecahan senilai (gambar & simbol)" },
  { id: "mtkb-bil-desimal", label: "Bilangan desimal persepuluhan & perseratusan (hubungan dengan persen)" },
  // B. Aljabar
  { id: "mtkb-alj-nilaibelumdiketahui", label: "Mengisi nilai yang belum diketahui dalam kalimat matematika (penjumlahan & pengurangan sampai 100)" },
  { id: "mtkb-alj-pola", label: "Mengidentifikasi, meniru, & mengembangkan pola gambar/objek dan pola bilangan membesar/mengecil (sampai 100)" },
  // C. Pengukuran
  { id: "mtkb-ukur-panjangberat", label: "Mengukur panjang & berat (satuan baku) serta hubungan antar-satuan panjang (cm, m)" },
  { id: "mtkb-ukur-luasvolume", label: "Mengukur & mengestimasi luas & volume (satuan tidak baku & baku)" },
  // D. Geometri
  { id: "mtkb-geo-ciribangundatar", label: "Mendeskripsikan ciri bangun datar (segiempat, segitiga, segi banyak)" },
  { id: "mtkb-geo-kompdekomp", label: "Komposisi & dekomposisi bangun datar (lebih dari satu cara)" },
  // E. Analisis Data dan Peluang
  { id: "mtkb-dat-sajianalisis", label: "Menyajikan, menganalisis & menginterpretasi data (tabel, diagram gambar, piktogram, diagram batang skala satu satuan)" },
];

// Topik DRAFT Matematika Fase C (Kelas 5 & 6) — diturunkan PERSIS dari CP (Kepka
// BSKAP 046/H/KR/2025, Ruang GTK). 5 elemen: Bilangan, Aljabar, Pengukuran,
// Geometri, Analisis Data dan Peluang. Semua topik = CP-inti (tanpa turunan ATP).
const MTK_FASE_C_TOPIK: Topik[] = [
  // A. Bilangan
  { id: "mtkc-bil-cacah1jt", label: "Bilangan cacah sampai 1.000.000 (membaca, menulis, nilai tempat)" },
  { id: "mtkc-bil-bandingurut", label: "Membandingkan & mengurutkan bilangan cacah sampai 1.000.000" },
  { id: "mtkc-bil-kompdekomp", label: "Komposisi & dekomposisi bilangan cacah sampai 1.000.000" },
  { id: "mtkc-bil-uang", label: "Menyelesaikan masalah yang berkaitan dengan uang" },
  { id: "mtkc-bil-operasi100rb", label: "Penjumlahan, pengurangan, perkalian, & pembagian bilangan cacah sampai 100.000" },
  { id: "mtkc-bil-kpkfpb", label: "Menyelesaikan masalah KPK & FPB" },
  { id: "mtkc-bil-bandingpecahan", label: "Membandingkan & mengurutkan pecahan (termasuk pecahan campuran)" },
  { id: "mtkc-bil-tambahkurangpecahan", label: "Penjumlahan & pengurangan pecahan" },
  { id: "mtkc-bil-kalibagipecahan", label: "Perkalian & pembagian pecahan dengan bilangan asli" },
  { id: "mtkc-bil-desimal", label: "Mengubah pecahan menjadi desimal; membandingkan & mengurutkan desimal (satu angka di belakang koma)" },
  // B. Aljabar
  { id: "mtkc-alj-nilaibelumdiketahui", label: "Mengisi nilai yang belum diketahui dalam kalimat matematika (+, −, ×, ÷ pada bilangan cacah sampai 1.000)" },
  { id: "mtkc-alj-pola", label: "Mengidentifikasi, meniru, & mengembangkan pola bilangan membesar/mengecil (perkalian & pembagian)" },
  { id: "mtkc-alj-proporsi", label: "Bernalar proporsional & menyelesaikan masalah proporsi (rasio satuan, perkalian & pembagian)" },
  // C. Pengukuran
  { id: "mtkc-ukur-kelilingluas", label: "Menentukan keliling & luas bangun datar (segitiga, segiempat, segi banyak) serta gabungannya" },
  { id: "mtkc-ukur-durasi", label: "Menghitung durasi waktu" },
  { id: "mtkc-ukur-sudut", label: "Mengukur besar sudut" },
  // D. Geometri
  { id: "mtkc-geo-bangunruang", label: "Mengonstruksi & mengurai bangun ruang (kubus, balok, & gabungannya) serta visualisasi spasial (depan, atas, samping)" },
  { id: "mtkc-geo-bandingkarakteristik", label: "Membandingkan karakteristik antarbangun datar & antarbangun ruang" },
  { id: "mtkc-geo-lokasipeta", label: "Menentukan lokasi pada peta dengan sistem berpetak" },
  // E. Analisis Data dan Peluang
  { id: "mtkc-dat-sajianalisis", label: "Menyajikan & menganalisis data banyak benda & data hasil pengukuran (gambar, piktogram, diagram batang, tabel frekuensi)" },
  { id: "mtkc-dat-peluang", label: "Menentukan kejadian berkemungkinan lebih besar dalam percobaan acak" },
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

// Topik DRAFT PJOK Fase A (Kelas 1 & 2) — diturunkan PERSIS dari CP (Kepka BSKAP
// 046/H/KR/2025, Ruang GTK). 4 elemen: Terampil Bergerak, Belajar Melalui Gerak,
// Bergaya Hidup Aktif, Memilih Hidup yang Menyehatkan. Semua topik = CP-inti.
const PJOK_FASE_A_TOPIK: Topik[] = [
  // A. Terampil Bergerak
  { id: "pjok-tb-fundamental", label: "Mempraktikkan keterampilan gerak fundamental dalam berbagai situasi gerak" },
  { id: "pjok-tb-eksplorasigerak", label: "Mengeksplorasi berbagai cara menggerakkan tubuh" },
  { id: "pjok-tb-manipulasiobjek", label: "Memanipulasi objek dengan bagian tubuh & ruang yang berbeda serta menyimpulkan efektivitasnya" },
  // B. Belajar Melalui Gerak
  { id: "pjok-bmg-fairplay", label: "Mentaati & menerapkan peraturan untuk mengembangkan fair play dalam aktivitas jasmani" },
  { id: "pjok-bmg-kolaborasi", label: "Menerapkan strategi kolaborasi dalam aktivitas jasmani" },
  // C. Bergaya Hidup Aktif
  { id: "pjok-bha-partisipasi", label: "Berpartisipasi dalam berbagai aktivitas jasmani & mengeksplorasi manfaatnya" },
  // D. Memilih Hidup yang Menyehatkan
  { id: "pjok-mhm-gayahidup", label: "Mengenali gaya hidup aktif dan sehat" },
  { id: "pjok-mhm-gizi", label: "Mengenali manfaat makanan bergizi seimbang & informasi gizi pada produk makanan" },
  { id: "pjok-mhm-risiko", label: "Mengenali situasi/potensi berisiko terhadap kesehatan & keselamatan serta strategi mencari bantuan kepada orang dewasa terpercaya" },
];

// Topik DRAFT IPAS Fase B (Kelas 3 & 4) — diturunkan PERSIS dari CP elemen
// "Pemahaman IPAS" (Kepka BSKAP 046/H/KR/2025, Ruang GTK). Tiap topik = satu
// klausa antar-titik-koma di CP. Elemen "Keterampilan proses" sengaja TIDAK
// dijadikan topik (metode lintas-materi, bukan pokok bahasan).
const IPAS_FASE_B_TOPIK: Topik[] = [
  { id: "ipasb-pancaindra", label: "Bentuk & fungsi pancaindra" },
  { id: "ipasb-siklushidup", label: "Siklus hidup makhluk hidup & upaya pelestariannya" },
  { id: "ipasb-sda-iklim", label: "Pelestarian sumber daya alam sebagai upaya mitigasi perubahan iklim" },
  { id: "ipasb-wujudzat-energi", label: "Proses perubahan wujud zat & perubahan bentuk energi" },
  { id: "ipasb-sumberenergi", label: "Sumber & bentuk energi serta perubahan bentuk energi dalam kehidupan sehari-hari" },
  { id: "ipasb-magnet-gaya", label: "Gejala kemagnetan; jenis gaya & pengaruhnya terhadap arah, gerak, & bentuk benda" },
  { id: "ipasb-perantugas-sosial", label: "Peran, tugas, & tanggung jawab serta interaksi sosial di sekitar tempat tinggal & sekolah" },
  { id: "ipasb-letakwilayah", label: "Letak kota/kabupaten & provinsi tempat tinggal melalui peta konvensional/digital" },
  { id: "ipasb-bentangalam", label: "Ragam bentang alam serta keterkaitannya dengan profesi masyarakat" },
  { id: "ipasb-budayahayati", label: "Keanekaragaman hayati, keragaman budaya, kearifan lokal, sejarah keluarga & masyarakat, serta upaya pelestariannya" },
  { id: "ipasb-kebutuhan-uang", label: "Perbedaan kebutuhan & keinginan; nilai mata uang & fungsinya" },
];

// Topik DRAFT IPAS Fase C (Kelas 5 & 6) — diturunkan PERSIS dari CP elemen
// "Pemahaman IPAS" (Kepka BSKAP 046/H/KR/2025, Ruang GTK). Tiap topik = satu
// klausa antar-titik-koma di CP.
const IPAS_FASE_C_TOPIK: Topik[] = [
  { id: "ipasc-organ", label: "Sistem organ tubuh manusia & cara menjaga kesehatan tubuh" },
  { id: "ipasc-biotik-abiotik", label: "Hubungan komponen biotik & abiotik serta pengaruhnya terhadap ekosistem" },
  { id: "ipasc-siklusair", label: "Siklus air & kaitannya dengan upaya menjaga ketersediaan air" },
  { id: "ipasc-bunyicahaya", label: "Fenomena gelombang bunyi & cahaya dalam kehidupan sehari-hari" },
  { id: "ipasc-hematenergi", label: "Penghematan energi & pemanfaatan sumber energi alternatif sebagai upaya mitigasi perubahan iklim" },
  { id: "ipasc-tatasurya", label: "Sistem tata surya serta kaitannya dengan rotasi & revolusi bumi" },
  { id: "ipasc-geografis-id", label: "Letak & kondisi geografis negara Indonesia melalui peta konvensional/digital" },
  { id: "ipasc-pahlawan", label: "Sejarah perjuangan para pahlawan di lingkungan sekitar tempat tinggal" },
  { id: "ipasc-budaya-kebinekaan", label: "Keragaman budaya nasional dalam konteks kebinekaan & nilai kearifan lokal di wilayahnya" },
  { id: "ipasc-ekonomi", label: "Kegiatan ekonomi masyarakat & ekonomi kreatif di lingkungan sekitar" },
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
  // NASIONAL — SD/MI Matematika, FASE B (Kelas 3 & 4). Status: DRAFT.
  // Sumber: Kepka BSKAP No. 046/H/KR/2025 — CP Matematika Fase B (Ruang GTK).
  // 5 elemen: Bilangan, Aljabar, Pengukuran, Geometri, Analisis Data & Peluang.
  // Satu set topik (MTK_FASE_B_TOPIK) melayani kelas 3 & 4 — pola sama Fase A.
  // -------------------------------------------------------------------------
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Matematika",
    kelas: "3",
    status: "verified",
    sumber: "CP Matematika Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: MTK_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Matematika",
    kelas: "4",
    status: "verified",
    sumber: "CP Matematika Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: MTK_FASE_B_TOPIK,
  },

  // -------------------------------------------------------------------------
  // NASIONAL — SD/MI Matematika, FASE C (Kelas 5 & 6). Status: DRAFT.
  // Sumber: Kepka BSKAP No. 046/H/KR/2025 — CP Matematika Fase C (Ruang GTK).
  // 5 elemen: Bilangan, Aljabar, Pengukuran, Geometri, Analisis Data & Peluang.
  // Satu set topik (MTK_FASE_C_TOPIK) melayani kelas 5 & 6 — pola sama Fase A/B.
  // -------------------------------------------------------------------------
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Matematika",
    kelas: "5",
    status: "verified",
    sumber: "CP Matematika Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: MTK_FASE_C_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Matematika",
    kelas: "6",
    status: "verified",
    sumber: "CP Matematika Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: MTK_FASE_C_TOPIK,
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
    status: "verified",
    sumber: "CP Pendidikan Pancasila Fase A — Kepka BSKAP No. 046/H/KR/2025",
    topik: PPKN_FASE_A_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Pendidikan Pancasila",
    kelas: "2",
    status: "verified",
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
    status: "verified",
    sumber: "CP PJOK Fase A — Kepka BSKAP No. 046/H/KR/2025",
    topik: PJOK_FASE_A_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "PJOK",
    kelas: "2",
    status: "verified",
    sumber: "CP PJOK Fase A — Kepka BSKAP No. 046/H/KR/2025",
    topik: PJOK_FASE_A_TOPIK,
  },

  // -------------------------------------------------------------------------
  // NASIONAL — SD/MI IPAS, FASE B (Kelas 3 & 4) & FASE C (Kelas 5 & 6). DRAFT.
  // Sumber: Kepka BSKAP No. 046/H/KR/2025 — CP IPAS elemen "Pemahaman IPAS".
  // IPAS tidak memiliki Fase A (kelas 1 & 2 tetap fallback teks-bebas).
  // -------------------------------------------------------------------------
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "IPAS",
    kelas: "3",
    status: "verified",
    sumber: "CP IPAS Fase B - Kepka BSKAP No. 046/H/KR/2025",
    topik: IPAS_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "IPAS",
    kelas: "4",
    status: "verified",
    sumber: "CP IPAS Fase B - Kepka BSKAP No. 046/H/KR/2025",
    topik: IPAS_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "IPAS",
    kelas: "5",
    status: "verified",
    sumber: "CP IPAS Fase C - Kepka BSKAP No. 046/H/KR/2025",
    topik: IPAS_FASE_C_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "IPAS",
    kelas: "6",
    status: "verified",
    sumber: "CP IPAS Fase C - Kepka BSKAP No. 046/H/KR/2025",
    topik: IPAS_FASE_C_TOPIK,
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
 * Ambil SATU entri kurikulum untuk kombinasi (jenjang/kelompok/mapel).
 * `kelas` OPSIONAL: bila diberikan & jalur sensitif-kelas (national), entri yang
 * dikembalikan adalah yang cocok fase/kelasnya (badge status/sumber jadi akurat
 * untuk mapel multi-fase). Tanpa `kelas` → perilaku lama (kelas diabaikan).
 * Pesantren (entri tanpa `kelas`) tetap lolos apa pun nilai `kelas`. null bila tak ada.
 */
export function getEntri(
  jenjang: string,
  kelompok: string,
  mapel: string,
  kelas?: string
): KurikulumEntry | null {
  return cariEntri(jenjang, kelompok, mapel, kelas)[0] ?? null;
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
