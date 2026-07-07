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

// Topik Bahasa Indonesia Fase B (Kelas 3 & 4) — diturunkan PERSIS dari CP 4 elemen
// (Kepka BSKAP 046/H/KR/2025, Ruang GTK): Menyimak, Membaca & Memirsa, Berbicara &
// Mempresentasikan, Menulis. Granularitas CP-murni: 1 kompetensi CP = 1 topik.
const BIND_FASE_B_TOPIK: Topik[] = [
  // A. Menyimak
  { id: "bindb-simak-idepokok", label: "Memahami ide pokok pesan lisan, media audio, teks aural, & instruksi lisan tentang hal menarik di lingkungan sekitar" },
  { id: "bindb-simak-narasi", label: "Memahami & memaknai teks narasi yang dibacakan atau dari media audio" },
  // B. Membaca dan Memirsa
  { id: "bindb-baca-katabaru", label: "Membaca kata-kata baru dengan pola kombinasi huruf yang dikenali dengan fasih" },
  { id: "bindb-baca-kosakata", label: "Memaknai kosakata baru & serapan bahasa daerah dari teks/tayangan tentang hal menarik di lingkungan sekitar" },
  { id: "bindb-baca-pesan", label: "Memahami pesan & informasi tentang kehidupan sehari-hari, teks narasi, & puisi anak (cetak/elektronik)" },
  { id: "bindb-baca-idepokok", label: "Memahami ide pokok & ide pendukung pada teks informatif & teks narasi" },
  // C. Berbicara dan Mempresentasikan
  { id: "bindb-bicara-santun", label: "Berbicara dengan pilihan kata & gestur santun, volume & intonasi tepat sesuai konteks" },
  { id: "bindb-bicara-diskusi", label: "Terlibat aktif dalam percakapan & diskusi sesuai tata cara" },
  { id: "bindb-bicara-ceritakembali", label: "Menceritakan kembali informasi dari teks narasi tentang hal menarik di lingkungan sekitar" },
  // D. Menulis
  { id: "bindb-tulis-teks", label: "Menulis berbagai teks sederhana dengan rangkaian kalimat beragam tentang hal menarik di lingkungan sekitar" },
  { id: "bindb-tulis-kaidah", label: "Menggunakan kaidah kebahasaan sederhana & kosakata baru bermakna denotatif untuk menulis teks sesuai konteks" },
  { id: "bindb-tulis-latin", label: "Terampil menulis kalimat dalam tulisan Latin & tegak bersambung" },
];

// Topik Bahasa Indonesia Fase C (Kelas 5 & 6) — diturunkan PERSIS dari CP 4 elemen
// (Kepka BSKAP 046/H/KR/2025, Ruang GTK). Granularitas CP-murni: 1 kompetensi = 1
// topik. CP mengulang 2 kompetensi verbatim antara Berbicara & Menulis (kosakata
// denotatif/konotatif/kiasan; perasaan-imajinasi karya sastra) → dipertahankan setia.
const BIND_FASE_C_TOPIK: Topik[] = [
  // A. Menyimak
  { id: "bindc-simak-analisis", label: "Menganalisis informasi: ciri objek, urutan proses kejadian, & nilai dari berbagai tipe teks nonfiksi & fiksi (lisan, teks aural, audio)" },
  // B. Membaca dan Memirsa
  { id: "bindc-baca-fasih", label: "Membaca kata-kata dengan berbagai pola kombinasi huruf dengan fasih & indah" },
  { id: "bindc-baca-kosakata", label: "Memahami informasi & kosakata baru bermakna denotatif, konotatif, & kiasan untuk mengidentifikasi objek, fenomena, & karakter" },
  { id: "bindc-baca-analisis", label: "Menganalisis informasi & nilai dalam teks sastra dari teks visual dan/atau audiovisual" },
  { id: "bindc-baca-pengamatan", label: "Membaca hasil pengamatan" },
  // C. Berbicara dan Mempresentasikan
  { id: "bindc-bicara-menghibur", label: "Menyampaikan informasi secara lisan untuk menghibur & meyakinkan mitra tutur sesuai kaidah & konteks" },
  { id: "bindc-bicara-kosakata", label: "Menggunakan kosakata baru bermakna denotatif, konotatif, & kiasan" },
  { id: "bindc-bicara-pilihkata", label: "Memilih kata yang tepat sesuai norma sosial budaya" },
  { id: "bindc-bicara-fasih", label: "Menyampaikan informasi dengan fasih & santun" },
  { id: "bindc-bicara-sastra", label: "Menyampaikan perasaan berdasarkan fakta & imajinasi secara indah & menarik dalam bentuk karya sastra dengan kosakata kreatif" },
  { id: "bindc-bicara-presentasi", label: "Mempresentasikan gagasan, hasil pengamatan, & pengalaman secara logis, sistematis, efektif, & kritis; mempresentasikan imajinasi secara kreatif" },
  // D. Menulis
  { id: "bindc-tulis-teks", label: "Menulis berbagai teks sederhana berdasarkan gagasan, hasil pengamatan, pengalaman, & imajinasi" },
  { id: "bindc-tulis-kausalitas", label: "Menuliskan hasil pengamatan yang menjelaskan hubungan kausalitas (sebab-akibat) untuk meyakinkan pembaca" },
  { id: "bindc-tulis-kaidah", label: "Menggunakan kaidah kebahasaan & kesastraan untuk menulis teks sesuai konteks & norma sosial budaya" },
  { id: "bindc-tulis-kosakata", label: "Menggunakan kosakata baru bermakna denotatif, konotatif, & kiasan" },
  { id: "bindc-tulis-sastra", label: "Menyampaikan perasaan berdasarkan fakta & imajinasi secara indah & menarik dalam bentuk karya sastra dengan kosakata kreatif" },
  { id: "bindc-tulis-latin", label: "Terampil menulis teks dalam tulisan Latin & tegak bersambung" },
];

// Topik Matematika Fase A (Kelas 1 & 2) — 4 elemen CP: Bilangan, Aljabar,
// Pengukuran, Geometri (Analisis Data & Peluang BELUM ada di Fase A). Diturunkan
// dari CP (Kepka BSKAP 046/H/KR/2025). Sudah diverifikasi (verified).
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

// Topik Matematika Fase B (Kelas 3 & 4) — diturunkan PERSIS dari CP (Kepka
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

// Topik Matematika Fase C (Kelas 5 & 6) — diturunkan PERSIS dari CP (Kepka
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

// Topik Pendidikan Pancasila Fase A (Kelas 1 & 2) — 4 elemen CP: Pancasila,
// UUD NRI 1945, Bhinneka Tunggal Ika, NKRI. Diturunkan dari CP (Kepka BSKAP
// 046/H/KR/2025). Sudah diverifikasi (verified).
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

// Topik Pendidikan Pancasila Fase B (Kelas 3 & 4) — diturunkan PERSIS dari
// CP 4 elemen (Kepka BSKAP 046/H/KR/2025, Ruang GTK): Pancasila, UUD NRI 1945,
// Bhinneka Tunggal Ika, NKRI. Granularitas per-kompetensi seperti Fase A.
const PPKN_FASE_B_TOPIK: Topik[] = [
  // A. Pancasila
  { id: "ppknb-pcs-makna", label: "Makna sila-sila Pancasila" },
  { id: "ppknb-pcs-penerapan", label: "Penerapan sila-sila Pancasila dalam kehidupan sehari-hari" },
  { id: "ppknb-pcs-perumus", label: "Mengenal karakter para perumus Pancasila" },
  { id: "ppknb-pcs-bangga", label: "Sikap bangga menjadi anak Indonesia & bahasa Indonesia sebagai bahasa persatuan" },
  // B. UUD NRI 1945
  { id: "ppknb-uud-aturan", label: "Mengidentifikasi & melaksanakan aturan di sekolah & lingkungan tempat tinggal" },
  { id: "ppknb-uud-hakkewajiban", label: "Mengidentifikasi & melaksanakan hak & kewajiban sebagai anggota keluarga & warga sekolah" },
  // C. Bhinneka Tunggal Ika
  { id: "ppknb-bti-identitas", label: "Membedakan & menghargai identitas diri, keluarga, & teman sesuai budaya, suku bangsa, bahasa, agama & kepercayaan" },
  // D. NKRI
  { id: "ppknb-nkri-wilayah", label: "Mengidentifikasi lingkungan tempat tinggal (RT, RW, desa/kelurahan, kecamatan) sebagai bagian NKRI" },
  { id: "ppknb-nkri-kerjasama", label: "Sikap kerja sama dalam keberagaman suku bangsa, sosial, & budaya yang terikat persatuan & kesatuan" },
];

// Topik Pendidikan Pancasila Fase C (Kelas 5 & 6) — diturunkan PERSIS dari
// CP 4 elemen (Kepka BSKAP 046/H/KR/2025, Ruang GTK). Granularitas seperti Fase A.
const PPKN_FASE_C_TOPIK: Topik[] = [
  // A. Pancasila
  { id: "ppknc-pcs-kronologi", label: "Memahami kronologi sejarah kelahiran Pancasila" },
  { id: "ppknc-pcs-teladan", label: "Meneladani sikap para perumus Pancasila & menerapkannya di lingkungan masyarakat" },
  { id: "ppknc-pcs-kesatuan", label: "Menghubungkan sila-sila Pancasila sebagai satu kesatuan yang utuh" },
  { id: "ppknc-pcs-nilaidasar", label: "Menguraikan makna nilai-nilai Pancasila sebagai dasar negara, pandangan hidup, & ideologi bangsa" },
  // B. UUD NRI 1945
  { id: "ppknc-uud-identifikasi", label: "Menyajikan hasil identifikasi bentuk norma, hak, & kewajiban sebagai anggota keluarga, warga sekolah, & warga negara" },
  { id: "ppknc-uud-praktik", label: "Mempraktikkan norma, hak, & kewajiban dalam kehidupan sehari-hari" },
  { id: "ppknc-uud-musyawarah", label: "Melaksanakan musyawarah untuk membuat kesepakatan & aturan bersama serta menerapkannya di keluarga & sekolah" },
  // C. Bhinneka Tunggal Ika
  { id: "ppknc-bti-keberagaman", label: "Menyajikan hasil identifikasi sikap menghormati, menjaga, & melestarikan keberagaman budaya dalam bingkai Bhinneka Tunggal Ika" },
  // D. NKRI
  { id: "ppknc-nkri-wilayah", label: "Mengenal wilayah (kabupaten/kota, provinsi) sebagai bagian NKRI" },
  { id: "ppknc-nkri-gotongroyong", label: "Perilaku gotong royong untuk menjaga persatuan sebagai wujud bela negara" },
];

// Topik PJOK Fase A (Kelas 1 & 2) — diturunkan PERSIS dari CP (Kepka BSKAP
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

// Topik PJOK Fase B (Kelas 3 & 4) — diturunkan PERSIS dari CP 4 elemen (Kepka
// BSKAP 046/H/KR/2025, Ruang GTK): Terampil Bergerak, Belajar Melalui Gerak,
// Bergaya Hidup Aktif, Memilih Hidup yang Menyehatkan. Granularitas seperti Fase A.
const PJOK_FASE_B_TOPIK: Topik[] = [
  // A. Terampil Bergerak
  { id: "pjokb-tb-haluskan", label: "Menghaluskan keterampilan gerak fundamental & menerapkannya dalam situasi gerak baru" },
  { id: "pjokb-tb-strategi", label: "Menerapkan & menyesuaikan strategi gerak untuk mencapai keterampilan gerak" },
  { id: "pjokb-tb-konsep", label: "Memeragakan konsep gerak dalam rangkaian gerak" },
  // B. Belajar Melalui Gerak
  { id: "pjokb-bmg-masalah", label: "Menerapkan strategi gerak sederhana & memecahkan masalah gerak" },
  { id: "pjokb-bmg-fairplay", label: "Menyusun bersama & menerapkan peraturan untuk fair play saat berpartisipasi/merancang aktivitas jasmani" },
  { id: "pjokb-bmg-peran", label: "Mempertunjukkan berbagai peran dengan cara terhormat untuk keberhasilan dalam aktivitas gerak kelompok/tim" },
  // C. Bergaya Hidup Aktif
  { id: "pjokb-bha-partisipasi", label: "Berpartisipasi dalam aktivitas jasmani & mengenali faktor yang membuatnya menyenangkan" },
  // D. Memilih Hidup yang Menyehatkan
  { id: "pjokb-mhm-risiko", label: "Mengenali risiko kesehatan akibat gaya hidup & aktivitas jasmani untuk pencegahannya" },
  { id: "pjokb-mhm-gizi", label: "Mengeksplorasi pola makan sehat & bergizi seimbang untuk menunjang aktivitas sehari-hari" },
  { id: "pjokb-mhm-cedera", label: "Mempraktikkan penanganan cedera ringan sesuai prinsip pertolongan pertama" },
];

// Topik PJOK Fase C (Kelas 5 & 6) — diturunkan PERSIS dari CP 4 elemen (Kepka
// BSKAP 046/H/KR/2025, Ruang GTK). Granularitas per-kompetensi seperti Fase A.
const PJOK_FASE_C_TOPIK: Topik[] = [
  // A. Terampil Bergerak
  { id: "pjokc-tb-modifikasi", label: "Menyesuaikan & memodifikasi keterampilan gerak melintasi berbagai situasi gerak" },
  { id: "pjokc-tb-transfer", label: "Mentransfer strategi gerak yang sudah dikuasai ke berbagai situasi gerak berbeda" },
  { id: "pjokc-tb-investigasi", label: "Menginvestigasi berbagai konsep gerak untuk meningkatkan capaian keterampilan gerak" },
  // B. Belajar Melalui Gerak
  { id: "pjokc-bmg-efektivitas", label: "Memprediksi & menguji efektivitas penerapan strategi gerak dalam berbagai situasi gerak" },
  { id: "pjokc-bmg-peraturan", label: "Merancang & menguji peraturan alternatif & modifikasi permainan untuk fair play & partisipasi inklusif" },
  { id: "pjokc-bmg-kontribusi", label: "Berpartisipasi positif dalam kelompok/tim: kontribusi, mendorong orang lain, & menegosiasikan peran & tanggung jawab" },
  // C. Bergaya Hidup Aktif
  { id: "pjokc-bha-pengaruh", label: "Berpartisipasi dalam aktivitas jasmani untuk menggambarkan pengaruh aktivitas jasmani teratur terhadap kesehatan" },
  { id: "pjokc-bha-luarruang", label: "Berpartisipasi dalam aktivitas jasmani di luar ruang/lingkungan alam & menggambarkan faktor yang mempengaruhi partisipasi" },
  { id: "pjokc-bha-sedenter", label: "Mengeksplorasi rekomendasi aktivitas jasmani & pencegahan perilaku sedenter serta strategi pencapaiannya" },
  // D. Memilih Hidup yang Menyehatkan
  { id: "pjokc-mhm-risiko", label: "Mengidentifikasi risiko kesehatan akibat gaya hidup & pencegahan melalui aktivitas jasmani (rekomendasi otoritas kesehatan)" },
  { id: "pjokc-mhm-gizi", label: "Memilih makanan sehat untuk menunjang aktivitas jasmani berdasarkan informasi kandungan gizi" },
  { id: "pjokc-mhm-cedera", label: "Mempraktikkan penanganan cedera sedang sesuai prinsip pertolongan pertama" },
];

// Topik IPAS Fase B (Kelas 3 & 4) — diturunkan PERSIS dari CP elemen
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

// Topik IPAS Fase C (Kelas 5 & 6) — diturunkan PERSIS dari CP elemen
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

// Topik Bahasa Inggris Fase B (Kelas 3 & 4) — diturunkan PERSIS dari CP 3 elemen
// (Kepka BSKAP 046/H/KR/2025, Ruang GTK): Menyimak–Berbicara, Membaca–Memirsa,
// Menulis–Mempresentasikan. Granularitas CP-murni: 1 kompetensi = 1 topik.
const BING_FASE_B_TOPIK: Topik[] = [
  // A. Menyimak – Berbicara
  { id: "bingb-sb-interaksi", label: "Berinteraksi dalam bahasa Inggris pada situasi sosial & kelas yang makin luas namun rutin, dengan kalimat berpola sesuai konteks" },
  { id: "bingb-sb-partisipasi", label: "Mengubah/mengganti sebagian elemen kalimat untuk berpartisipasi dalam rutinitas kelas (menyampaikan perasaan, kebutuhan, meminta pertolongan)" },
  { id: "bingb-sb-idepokok", label: "Memahami ide pokok informasi lisan dengan bantuan visual & kosakata sederhana" },
  { id: "bingb-sb-instruksi", label: "Mengikuti rangkaian instruksi sederhana terkait prosedur kelas & aktivitas belajar dengan bantuan visual" },
  // B. Membaca – Memirsa
  { id: "bingb-bm-kata", label: "Memahami kata-kata yang sering digunakan sehari-hari dengan bantuan gambar/ilustrasi" },
  { id: "bingb-bm-teks", label: "Membaca & memberikan respons terhadap teks pendek sederhana & familiar (tulisan/digital, termasuk visual, multimodal, atau interaktif)" },
  // C. Menulis – Mempresentasikan
  { id: "bingb-tm-ide", label: "Mengomunikasikan ide & pengalaman melalui gambar & salinan tulisan" },
  { id: "bingb-tm-teks", label: "Menghasilkan teks deskripsi & prosedur sederhana menggunakan kata/frasa sederhana & gambar (dengan bantuan guru)" },
  { id: "bingb-tm-kosakata", label: "Menulis kosakata sederhana terkait lingkungan kelas & rumah dengan ejaan ciptaan sendiri" },
];

// Topik Bahasa Inggris Fase C (Kelas 5 & 6) — diturunkan PERSIS dari CP 3 elemen
// (Kepka BSKAP 046/H/KR/2025, Ruang GTK). Granularitas CP-murni: 1 kompetensi = 1 topik.
const BING_FASE_C_TOPIK: Topik[] = [
  // A. Menyimak – Berbicara
  { id: "bingc-sb-interaksi", label: "Berinteraksi dengan kalimat berpola tertentu pada situasi sosial & kelas yang makin luas namun rutin" },
  { id: "bingc-sb-partisipasi", label: "Mengubah/mengganti sebagian elemen kalimat untuk berpartisipasi dalam aktivitas belajar (membuat pertanyaan sederhana, meminta klarifikasi & izin)" },
  { id: "bingc-sb-strategi", label: "Menggunakan strategi untuk mengidentifikasi informasi inti (meminta pengulangan, berbicara lebih pelan, atau bertanya arti kata)" },
  { id: "bingc-sb-instruksi", label: "Mengikuti rangkaian instruksi sederhana terkait prosedur kelas & aktivitas belajar" },
  // B. Membaca – Memirsa
  { id: "bingc-bm-kata", label: "Memahami kata sehari-hari & kata baru dengan bantuan gambar/ilustrasi serta kalimat dalam konteks yang dipahami" },
  { id: "bingc-bm-teks", label: "Membaca & memberikan respons terhadap beragam teks pendek sederhana & familiar (tulisan/digital, termasuk visual, multimodal, atau interaktif)" },
  { id: "bingc-bm-informasi", label: "Menemukan informasi dalam sebuah kalimat & menjelaskan topik teks yang dibaca atau diamati" },
  // C. Menulis – Mempresentasikan
  { id: "bingc-tm-ide", label: "Mengomunikasikan ide & pengalaman melalui salinan tulisan & tulisan sederhana sendiri serta menunjukkan perkembangan pemahaman proses menulis" },
  { id: "bingc-tm-kaidah", label: "Menunjukkan kesadaran awal bahwa teks bahasa Inggris ditulis dengan kaidah (konvensi) sesuai konteks & tujuannya" },
  { id: "bingc-tm-teks", label: "Menghasilkan teks deskripsi, cerita, & prosedur sederhana menggunakan kalimat berpola tertentu (dengan bantuan guru)" },
  { id: "bingc-tm-tandabaca", label: "Menunjukkan kesadaran pentingnya tanda baca dasar & penggunaan huruf kapital" },
  { id: "bingc-tm-bunyihuruf", label: "Menunjukkan pemahaman hubungan bunyi-huruf & ejaan kata-kata yang umum digunakan" },
  { id: "bingc-tm-kosakata", label: "Menggunakan kosakata terkait lingkungan kelas & rumah serta strategi dasar menulis (menyalin kata/frasa, menggunakan gambar, bertanya cara menulis kata)" },
];

// Topik Pendidikan Agama Islam & Budi Pekerti Fase A (Kelas 1 & 2) — diturunkan
// PERSIS dari CP (Kepka BKPDM No. 020 Tahun 2026, perubahan atas Kepka BSKAP
// 046/H/KR/2025). 5 elemen: Al-Qur'an Hadis, Akidah, Akhlak, Fikih, SPI.
// PAI Fase A — sumber: portal CP resmi Kemendikdasmen (Ruang GTK,
// guru.kemendikdasmen.go.id, tab "Rumusan CP"). Regulasi berlaku: Kepka BKPDM
// No. 020 Tahun 2026. Belum spot-check ke salinan PDF Kepka; nomor halaman
// lampiran belum tercatat (exception CLAUDE.md, disetujui pemilik repo).
const PAI_FASE_A_TOPIK: Topik[] = [
  // Al-Qur'an Hadis
  { id: "paia-quran-hadis", label: "Memahami huruf hijaiah berharakat, huruf hijaiah bersambung, Surah al-Fātiḥah, beberapa surah pendek Al-Qur'an, dan hadis tentang kebersihan." },
  // Akidah
  { id: "paia-akidah", label: "Memahami rukun iman, iman kepada Allah Swt., beberapa asmaulhusna, dan iman kepada malaikat." },
  // Akhlak
  { id: "paia-akhlak", label: "Memahami akhlak terhadap Allah Swt. dengan menyucikan dan memuji-Nya dan akhlak terhadap diri sendiri." },
  // Fikih
  { id: "paia-fikih", label: "Memahami rukun Islam, syahadatain, tata cara bersuci, salat fardu, azan, ikamah, zikir, dan berdoa setelah salat." },
  // Sejarah Peradaban Islam
  { id: "paia-spi", label: "Memahami kisah beberapa nabi dan rasul." },
];

// Topik PAI & Budi Pekerti Fase B (Kelas 3 & 4) — diturunkan PERSIS dari CP (Kepka
// BKPDM No. 020 Tahun 2026, perubahan atas Kepka BSKAP 046/H/KR/2025). 5 elemen.
// PAI Fase B — sumber: portal CP resmi Kemendikdasmen (Ruang GTK,
// guru.kemendikdasmen.go.id, tab "Rumusan CP"). Regulasi berlaku: Kepka BKPDM
// No. 020 Tahun 2026. Korroborasi: teks portal menyimpang dari CP era-046
// (terbukti via divergensi ATP guru) -> versi 020/2026. Belum spot-check ke
// salinan PDF Kepka; nomor halaman lampiran belum tercatat (exception CLAUDE.md).
const PAI_FASE_B_TOPIK: Topik[] = [
  // Al-Qur'an Hadis
  { id: "paib-quran-hadis", label: "Memahami beberapa surah pendek, ayat Al-Qur'an dan hadis tentang kewajiban salat dan menjaga hubungan baik dengan sesama." },
  // Akidah
  { id: "paib-akidah", label: "Memahami sifat-sifat Allah Swt., beberapa asmaulhusna, iman kepada kitab-kitab Allah Swt. dan rasul-rasul Allah Swt." },
  // Akhlak
  { id: "paib-akhlak", label: "Memahami akhlak terhadap Allah Swt. dengan berbaik sangka kepada-Nya, akhlak terhadap orang tua, keluarga, dan guru." },
  // Fikih
  { id: "paib-fikih", label: "Memahami puasa, salat jumat dan salat sunah, balig dan tanggung jawab yang menyertainya (taklīf)." },
  // Sejarah Peradaban Islam
  { id: "paib-spi", label: "Memahami kisah Nabi Muhammad saw. sebelum dan sesudah menjadi rasul periode Makkah." },
];

// Topik PAI & Budi Pekerti Fase C (Kelas 5 & 6) — diturunkan PERSIS dari CP (Kepka
// BKPDM No. 020 Tahun 2026, perubahan atas Kepka BSKAP 046/H/KR/2025). 5 elemen.
// PAI Fase C — sumber: portal CP resmi Kemendikdasmen (Ruang GTK,
// guru.kemendikdasmen.go.id, tab "Rumusan CP"). Regulasi berlaku: Kepka BKPDM
// No. 020 Tahun 2026. Korroborasi: teks portal menyimpang dari CP era-046
// (terbukti via divergensi ATP guru) -> versi 020/2026. Belum spot-check ke
// salinan PDF Kepka; nomor halaman lampiran belum tercatat (exception CLAUDE.md).
const PAI_FASE_C_TOPIK: Topik[] = [
  // Al-Qur'an dan Hadis
  { id: "paic-quran-hadis", label: "Memahami beberapa surah pendek dan ayat Al-Qur'an serta hadis tentang keragaman." },
  // Akidah
  { id: "paic-akidah", label: "Memahami beberapa asmaulhusna, iman kepada hari akhir, qadā' dan qadr." },
  // Akhlak
  { id: "paic-akhlak", label: "Memahami akhlak terhadap Allah Swt. dengan berdoa dan bertawakal kepada-Nya, akhlak terhadap teman, tetangga, non muslim, hewan, dan tumbuhan." },
  // Fikih
  { id: "paic-fikih", label: "Memahami puasa sunah, zakat, infak, sedekah, hadiah, makanan dan minuman yang halal dan haram." },
  // Sejarah Peradaban Islam
  { id: "paic-spi", label: "Memahami kisah Nabi Muhammad saw. periode Madinah dan khulafaurasyidin." },
];

// Topik Seni Musik Fase A (Kelas 1 & 2) — diturunkan PERSIS dari Rumusan CP
// (portal Ruang GTK, guru.kemendikdasmen.go.id, tab "Rumusan CP", Seni Musik Fase A).
// 5 elemen: Mengalami, Merefleksikan, Berpikir & Bekerja Secara Artistik,
// Menciptakan, Berdampak. Granularitas: tiap kalimat "Peserta didik…" = 1 topik
// (sama pola spt B.Indonesia/Pancasila). Nama elemen tercatat di slug id.
// STATUS: draft — naik 'verified' HANYA setelah render diuji di app + spot-check manusia.
const SENIMUSIK_FASE_A_TOPIK: Topik[] = [
  // Mengalami (Experiencing)
  { id: "senimusik-a-mengalami-unsurbunyi", label: "Mengidentifikasi & merespons unsur-unsur bunyi musik (nada & irama), baik dengan anggota tubuh maupun alat musik ritmis & melodis" },
  // Merefleksikan (Reflecting)
  { id: "senimusik-a-merefleksikan-tanggapan", label: "Memberi tanggapan/umpan balik atas praktik bermusik diri sendiri atau orang lain dengan bahasa sehari-hari" },
  // Berpikir & Bekerja Secara Artistik (Thinking and Working Artistically)
  { id: "senimusik-a-artistik-imitasi", label: "Mengimitasi pola irama & bunyi dasar ragam alat musik ritmis atau melodis" },
  { id: "senimusik-a-artistik-identifikasialat", label: "Mengidentifikasi ragam alat musik & bunyi yang dihasilkannya" },
  { id: "senimusik-a-artistik-mainkanrawat", label: "Mengetahui cara memainkan & membersihkan instrumen musik yang digunakan" },
  // Menciptakan (Creating)
  { id: "senimusik-a-menciptakan-produksibunyi", label: "Memproduksi bunyi & mengimitasi pola irama dengan anggota tubuh atau alat musik ritmis/melodis yang tersedia di lingkungan sekitar" },
  // Berdampak (Impacting)
  { id: "senimusik-a-berdampak-praktikpositif", label: "Menjalankan praktik bermusik yang memberikan dampak positif bagi dirinya" },
];

// Topik Seni Rupa Fase A (Kelas 1 & 2) — diturunkan PERSIS dari Rumusan CP
// (portal Ruang GTK, guru.kemendikdasmen.go.id, tab "Rumusan CP", Seni Rupa Fase A).
const SENIRUPA_FASE_A_TOPIK: Topik[] = [
  // Mengalami (Experiencing)
  { id: "senirupa-a-mengalami-unsurrupa", label: "Memahami unsur rupa di lingkungan sekitar & menyimpulkan hasil pemahaman atas dua unsur rupa" },
  // Merefleksikan (Reflecting)
  { id: "senirupa-a-merefleksikan-menilai", label: "Menilai karya & penciptaan karya seni rupa menggunakan kosakata sehari-hari" },
  // Berpikir & Bekerja Secara Artistik (Thinking and Working Artistically)
  { id: "senirupa-a-artistik-pengalamanvisual", label: "Menggunakan pengalaman visual sebagai sumber gagasan dalam berkarya" },
  { id: "senirupa-a-artistik-eksplorasialatbahan", label: "Mengeksplorasi alat & bahan dasar yang tersedia di lingkungan sekitar" },
  // Menciptakan (Making/Creating)
  { id: "senirupa-a-menciptakan-karyapengamatan", label: "Membuat karya seni rupa dari hasil pengamatan lingkungan, menggunakan unsur garis, bentuk, dan/atau warna" },
  // Berdampak (Impacting)
  { id: "senirupa-a-berdampak-responspositif", label: "Memberi respons terhadap kejadian sehari-hari & keadaan lingkungan sekitar melalui karya seni rupa yang berdampak positif bagi dirinya" },
];

// Topik Seni Tari Fase A (Kelas 1 & 2) — VERBATIM dari Rumusan CP
// (portal Ruang GTK, guru.kemendikdasmen.go.id, tab "Rumusan CP", Seni Tari Fase A).
// Label = teks capaian per elemen apa adanya; belum diverifikasi ke PDF primer → draft.
const SENITARI_FASE_A_TOPIK: Topik[] = [
  // Mengalami (Experiencing)
  { id: "senitari-a-mengalami", label: "Peserta didik mengamati bentuk tari sebagai media komunikasi serta mengembangkan kesadaran diri dalam mengeksplorasi unsur utama tari meliputi gerak, ruang, tenaga, waktu, gerak di tempat dan gerak berpindah." },
  // Merefleksikan (Reflecting)
  { id: "senitari-a-merefleksikan", label: "Peserta didik mengenal dan menilai dengan mengidentifikasi unsur utama tari meliputi gerak, ruang, tenaga, waktu, gerak di tempat dan gerak berpindah, serta mengemukakan pencapaian diri secara lisan, tulisan, dan kinestetik." },
  // Berpikir dan Bekerja Artistik (Thinking and Working Artistically)
  { id: "senitari-a-artistik", label: "Peserta didik meragakan hasil gerak berdasarkan norma/perilaku yang sesuai dalam menari dengan keyakinan dan percaya diri saat mengekspresikan ide, perasaan kepada penonton atau lingkungan sekitar." },
  // Menciptakan (Creating)
  { id: "senitari-a-menciptakan", label: "Peserta didik mengembangkan unsur utama tari (gerak, ruang, waktu, dan tenaga), gerak di tempat, dan gerak berpindah untuk membuat gerak sederhana yang memiliki kesatuan gerak yang indah." },
  // Berdampak (Impacting)
  { id: "senitari-a-berdampak", label: "Peserta didik menerima proses pembelajaran sehingga tumbuh rasa ingin tahu dan dapat menunjukkan antusiasme yang berdampak pada kemampuan diri dalam menyelesaikan aktivitas pembelajaran tari." },
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
  // NASIONAL — SD/MI Bahasa Indonesia, FASE B (Kelas 3 & 4) & FASE C (Kelas 5 &
  // 6). Status: DRAFT. Sumber: Kepka BSKAP No. 046/H/KR/2025 — CP (Ruang GTK).
  // CP-murni (tanpa ATP). 4 elemen: Menyimak, Membaca & Memirsa, Berbicara &
  // Mempresentasikan, Menulis.
  // -------------------------------------------------------------------------
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Bahasa Indonesia",
    kelas: "3",
    status: "verified",
    sumber: "CP Bahasa Indonesia Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: BIND_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Bahasa Indonesia",
    kelas: "4",
    status: "verified",
    sumber: "CP Bahasa Indonesia Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: BIND_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Bahasa Indonesia",
    kelas: "5",
    status: "verified",
    sumber: "CP Bahasa Indonesia Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: BIND_FASE_C_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Bahasa Indonesia",
    kelas: "6",
    status: "verified",
    sumber: "CP Bahasa Indonesia Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: BIND_FASE_C_TOPIK,
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
  // NASIONAL — SD/MI Matematika, FASE B (Kelas 3 & 4). Status: VERIFIED.
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
  // NASIONAL — SD/MI Matematika, FASE C (Kelas 5 & 6). Status: VERIFIED.
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
  // NASIONAL — SD/MI Pendidikan Pancasila, FASE A (Kelas 1 & 2). Status: VERIFIED.
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
  // NASIONAL — SD/MI Pendidikan Pancasila, FASE B (Kelas 3 & 4) & FASE C
  // (Kelas 5 & 6). Status: VERIFIED. Sumber: Kepka BSKAP No. 046/H/KR/2025.
  // -------------------------------------------------------------------------
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Pendidikan Pancasila",
    kelas: "3",
    status: "verified",
    sumber: "CP Pendidikan Pancasila Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: PPKN_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Pendidikan Pancasila",
    kelas: "4",
    status: "verified",
    sumber: "CP Pendidikan Pancasila Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: PPKN_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Pendidikan Pancasila",
    kelas: "5",
    status: "verified",
    sumber: "CP Pendidikan Pancasila Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: PPKN_FASE_C_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Pendidikan Pancasila",
    kelas: "6",
    status: "verified",
    sumber: "CP Pendidikan Pancasila Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: PPKN_FASE_C_TOPIK,
  },

  // -------------------------------------------------------------------------
  // NASIONAL — SD/MI PJOK, FASE A (Kelas 1 & 2). Status: VERIFIED.
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
  // NASIONAL — SD/MI PJOK, FASE B (Kelas 3 & 4) & FASE C (Kelas 5 & 6). DRAFT.
  // Sumber: Kepka BSKAP No. 046/H/KR/2025 — CP PJOK (Ruang GTK).
  // -------------------------------------------------------------------------
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "PJOK",
    kelas: "3",
    status: "verified",
    sumber: "CP PJOK Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: PJOK_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "PJOK",
    kelas: "4",
    status: "verified",
    sumber: "CP PJOK Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: PJOK_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "PJOK",
    kelas: "5",
    status: "verified",
    sumber: "CP PJOK Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: PJOK_FASE_C_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "PJOK",
    kelas: "6",
    status: "verified",
    sumber: "CP PJOK Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: PJOK_FASE_C_TOPIK,
  },

  // -------------------------------------------------------------------------
  // NASIONAL — SD/MI IPAS, FASE B (Kelas 3 & 4) & FASE C (Kelas 5 & 6). VERIFIED.
  // Sumber: Kepka BSKAP No. 046/H/KR/2025 — CP IPAS elemen "Pemahaman IPAS".
  // IPAS tidak memiliki Fase A (kelas 1 & 2 tetap fallback teks-bebas).
  // -------------------------------------------------------------------------
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "IPAS",
    kelas: "3",
    status: "verified",
    sumber: "CP IPAS Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: IPAS_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "IPAS",
    kelas: "4",
    status: "verified",
    sumber: "CP IPAS Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: IPAS_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "IPAS",
    kelas: "5",
    status: "verified",
    sumber: "CP IPAS Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: IPAS_FASE_C_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "IPAS",
    kelas: "6",
    status: "verified",
    sumber: "CP IPAS Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: IPAS_FASE_C_TOPIK,
  },

  // -------------------------------------------------------------------------
  // NASIONAL — SD/MI Bahasa Inggris, FASE B (Kelas 3 & 4) & FASE C (Kelas 5 &
  // 6). Status: DRAFT. Sumber: Kepka BSKAP No. 046/H/KR/2025 — CP (Ruang GTK).
  // CP-murni. 3 elemen: Menyimak–Berbicara, Membaca–Memirsa, Menulis–
  // Mempresentasikan. Fase A (kelas 1 & 2) ditunda → fallback teks-bebas.
  // -------------------------------------------------------------------------
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Bahasa Inggris",
    kelas: "3",
    status: "verified",
    sumber: "CP Bahasa Inggris Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: BING_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Bahasa Inggris",
    kelas: "4",
    status: "verified",
    sumber: "CP Bahasa Inggris Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: BING_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Bahasa Inggris",
    kelas: "5",
    status: "verified",
    sumber: "CP Bahasa Inggris Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: BING_FASE_C_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Bahasa Inggris",
    kelas: "6",
    status: "verified",
    sumber: "CP Bahasa Inggris Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: BING_FASE_C_TOPIK,
  },

  // -------------------------------------------------------------------------
  // NASIONAL — SD/MI Pendidikan Agama Islam & Budi Pekerti, FASE A (Kelas 1 &
  // 2). Status: DRAFT. Sumber: Kepka BKPDM No. 020 Tahun 2026 (perubahan atas
  // Kepka BSKAP No. 046/H/KR/2025). 5 elemen.
  // -------------------------------------------------------------------------
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Pendidikan Agama Islam dan Budi Pekerti",
    kelas: "1",
    status: "verified",
    sumber: "CP Pendidikan Agama Islam dan Budi Pekerti Fase A — Kepka BKPDM No. 020 Tahun 2026 (perubahan atas Kepka BSKAP No. 046/H/KR/2025)",
    topik: PAI_FASE_A_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Pendidikan Agama Islam dan Budi Pekerti",
    kelas: "2",
    status: "verified",
    sumber: "CP Pendidikan Agama Islam dan Budi Pekerti Fase A — Kepka BKPDM No. 020 Tahun 2026 (perubahan atas Kepka BSKAP No. 046/H/KR/2025)",
    topik: PAI_FASE_A_TOPIK,
  },

  // -------------------------------------------------------------------------
  // NASIONAL — SD/MI Pendidikan Agama Islam & Budi Pekerti, FASE B (Kelas 3 &
  // 4) & FASE C (Kelas 5 & 6). Status: DRAFT. Sumber: Kepka BKPDM No. 020 Tahun
  // 2026 (perubahan atas Kepka BSKAP No. 046/H/KR/2025).
  // -------------------------------------------------------------------------
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Pendidikan Agama Islam dan Budi Pekerti",
    kelas: "3",
    status: "verified",
    sumber: "CP Pendidikan Agama Islam dan Budi Pekerti Fase B — Kepka BKPDM No. 020 Tahun 2026 (perubahan atas Kepka BSKAP No. 046/H/KR/2025)",
    topik: PAI_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Pendidikan Agama Islam dan Budi Pekerti",
    kelas: "4",
    status: "verified",
    sumber: "CP Pendidikan Agama Islam dan Budi Pekerti Fase B — Kepka BKPDM No. 020 Tahun 2026 (perubahan atas Kepka BSKAP No. 046/H/KR/2025)",
    topik: PAI_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Pendidikan Agama Islam dan Budi Pekerti",
    kelas: "5",
    status: "verified",
    sumber: "CP Pendidikan Agama Islam dan Budi Pekerti Fase C — Kepka BKPDM No. 020 Tahun 2026 (perubahan atas Kepka BSKAP No. 046/H/KR/2025)",
    topik: PAI_FASE_C_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Pendidikan Agama Islam dan Budi Pekerti",
    kelas: "6",
    status: "verified",
    sumber: "CP Pendidikan Agama Islam dan Budi Pekerti Fase C — Kepka BKPDM No. 020 Tahun 2026 (perubahan atas Kepka BSKAP No. 046/H/KR/2025)",
    topik: PAI_FASE_C_TOPIK,
  },

  // ── Seni Musik SD/MI (Fase A) — draft, sumber portal Ruang GTK ──
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Musik",
    kelas: "1",
    status: "verified",
    sumber: "Portal Ruang GTK (guru.kemendikdasmen.go.id) — Rumusan CP Seni Musik Fase A.",
    topik: SENIMUSIK_FASE_A_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Musik",
    kelas: "2",
    status: "verified",
    sumber: "Portal Ruang GTK (guru.kemendikdasmen.go.id) — Rumusan CP Seni Musik Fase A.",
    topik: SENIMUSIK_FASE_A_TOPIK,
  },

  // ── Seni Rupa SD/MI (Fase A) — draft, sumber portal Ruang GTK ──
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Rupa",
    kelas: "1",
    status: "verified",
    sumber: "Portal Ruang GTK (guru.kemendikdasmen.go.id) — Rumusan CP Seni Rupa Fase A. Berlaku via Kepka BSKAP No. 046/H/KR/2025 (perubahan atas 032/H/KR/2024); Seni Rupa tidak terdampak Kepka BKPDM No. 020 Tahun 2026.",
    topik: SENIRUPA_FASE_A_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Rupa",
    kelas: "2",
    status: "verified",
    sumber: "Portal Ruang GTK (guru.kemendikdasmen.go.id) — Rumusan CP Seni Rupa Fase A. Berlaku via Kepka BSKAP No. 046/H/KR/2025 (perubahan atas 032/H/KR/2024); Seni Rupa tidak terdampak Kepka BKPDM No. 020 Tahun 2026.",
    topik: SENIRUPA_FASE_A_TOPIK,
  },

  // ── Seni Tari SD/MI (Fase A) — draft, sumber portal Ruang GTK ──
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Tari",
    kelas: "1",
    status: "draft",
    sumber: "Portal Ruang GTK (guru.kemendikdasmen.go.id) — Rumusan CP, Capaian per Elemen, Seni Tari Fase A. Berlaku via Kepka BSKAP No. 046/H/KR/2025 (perubahan atas 032/H/KR/2024); Seni Tari tidak terdampak Kepka BKPDM No. 020 Tahun 2026. Nomor halaman PDF primer belum diverifikasi.",
    topik: SENITARI_FASE_A_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Tari",
    kelas: "2",
    status: "draft",
    sumber: "Portal Ruang GTK (guru.kemendikdasmen.go.id) — Rumusan CP, Capaian per Elemen, Seni Tari Fase A. Berlaku via Kepka BSKAP No. 046/H/KR/2025 (perubahan atas 032/H/KR/2024); Seni Tari tidak terdampak Kepka BKPDM No. 020 Tahun 2026. Nomor halaman PDF primer belum diverifikasi.",
    topik: SENITARI_FASE_A_TOPIK,
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
