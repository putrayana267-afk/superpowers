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

// Topik Bahasa Indonesia Fase B (Kelas 3 & 4) — diturunkan PERSIS dari teks CP
// 4 elemen pada salinan resmi PDF Kepka BSKAP No. 046/H/KR/2025 (Lampiran II,
// hlm. 95): Menyimak; Membaca dan Memirsa; Berbicara dan Mempresentasikan;
// Menulis. Granularitas CP-murni: 1 kompetensi CP = 1 topik.
const BIND_FASE_B_TOPIK: Topik[] = [
  // A. Menyimak
  { id: "bindb-simak-idepokok", label: "Memahami ide pokok informasi dari teks nonsastra berbentuk teks aural (dibacakan dan/atau didengarkan)" },
  { id: "bindb-simak-sastra", label: "Memahami isi teks sastra berbentuk teks aural" },
  // B. Membaca dan Memirsa
  { id: "bindb-baca-katabaru", label: "Membaca kata-kata baru dengan fasih dari bacaan dan/atau tayangan yang dipirsa" },
  { id: "bindb-baca-idepokok", label: "Memahami ide pokok, ide pendukung, pesan, & informasi dalam teks sastra & nonsastra berbentuk cetak dan/atau elektronik" },
  // C. Berbicara dan Mempresentasikan
  { id: "bindb-bicara-pendapat", label: "Menyajikan pendapat dengan pilihan kata & sikap tubuh/gestur yang sesuai, menggunakan volume & intonasi yang tepat sesuai konteks" },
  { id: "bindb-bicara-diskusi", label: "Menanggapi diskusi sesuai tata cara" },
  { id: "bindb-bicara-ceritakembali", label: "Menceritakan kembali isi dan/atau informasi dari berbagai tipe teks yang dibaca, dipirsa, atau didengar" },
  // D. Menulis
  { id: "bindb-tulis-teks", label: "Menulis berbagai tipe teks sederhana dengan rangkaian kalimat yang beragam" },
  { id: "bindb-tulis-kaidah", label: "Menggunakan kaidah kebahasaan & kosakata baru bermakna denotatif untuk menulis teks sesuai konteks" },
];

// Topik Bahasa Indonesia Fase C (Kelas 5 & 6) — diturunkan PERSIS dari teks CP
// 4 elemen pada salinan resmi PDF Kepka BSKAP No. 046/H/KR/2025 (Lampiran II,
// hlm. 96). Granularitas CP-murni: 1 kompetensi CP = 1 topik.
const BIND_FASE_C_TOPIK: Topik[] = [
  // A. Menyimak
  { id: "bindc-simak-nonsastra", label: "Menganalisis informasi dari teks nonsastra berbentuk teks aural (dibacakan dan/atau didengarkan)" },
  { id: "bindc-simak-sastra", label: "Menganalisis isi teks sastra berbentuk teks aural" },
  // B. Membaca dan Memirsa
  { id: "bindc-baca-fasih", label: "Membaca kata-kata dengan berbagai pola kombinasi huruf dengan fasih dari bacaan dan/atau tayangan yang dipirsa" },
  { id: "bindc-baca-analisis", label: "Menganalisis informasi serta nilai-nilai dalam teks sastra & nonsastra berwujud teks visual dan/atau audiovisual" },
  // C. Berbicara dan Mempresentasikan
  { id: "bindc-bicara-presentasi", label: "Mempresentasikan gagasan dari berbagai tipe teks dengan efektif & santun" },
  { id: "bindc-bicara-sastra", label: "Menyampaikan perasaan berdasarkan fakta & imajinasi (dari diri sendiri & orang lain) secara indah & menarik dalam bentuk teks sastra dengan penggunaan kosakata secara kreatif" },
  // D. Menulis
  { id: "bindc-tulis-teks", label: "Menulis berbagai tipe teks sederhana berdasarkan gagasan, hasil pengamatan, pengalaman, dan/atau imajinasi dengan rangkaian kalimat kompleks secara kreatif, menarik, dan/atau indah" },
  { id: "bindc-tulis-kaidah", label: "Menggunakan kaidah kebahasaan & kosakata baru bermakna denotatif & konotatif" },
];

// Topik Matematika Fase A (Kelas 1 & 2) — 5 elemen CP: Bilangan, Aljabar,
// Pengukuran, Geometri, Analisis Data dan Peluang. Diturunkan
// dari CP (Kepka BSKAP 046/H/KR/2025).
const MTK_FASE_A_TOPIK: Topik[] = [
  // A. Bilangan
  { id: "mtk-bil-cacah100", label: "Bilangan cacah sampai 100 (membaca, menulis, nilai tempat)" },
  { id: "mtk-bil-bandingurut", label: "Membandingkan dan mengurutkan bilangan cacah sampai 100" },
  { id: "mtk-bil-kompdekomp", label: "Komposisi dan dekomposisi bilangan cacah sampai 100" },
  { id: "mtk-bil-tambahkurang20", label: "Penjumlahan & pengurangan sampai 20 (benda konkret)" },
  { id: "mtk-bil-pecahan", label: "Pecahan (setengah & seperempat) sebagai bagian dari keseluruhan melalui pembagian benda/kumpulan benda sama banyak" },
  // B. Aljabar
  { id: "mtk-alj-pola", label: "Mengenali, meniru, dan melanjutkan pola bukan bilangan (gambar, warna, dan suara)" },
  { id: "mtk-alj-simbolsamadengan", label: "Memahami makna simbol \"=\" dalam kalimat penjumlahan & pengurangan sampai 20 (menggunakan gambar)" },
  // C. Pengukuran
  { id: "mtk-ukur-panjangberat", label: "Membandingkan panjang & berat secara langsung" },
  { id: "mtk-ukur-durasi", label: "Membandingkan durasi waktu" },
  { id: "mtk-ukur-panjangtakbaku", label: "Mengukur & mengestimasi panjang dengan satuan tidak baku" },
  // D. Geometri
  { id: "mtk-geo-bangundatar", label: "Mengenal bangun datar (segitiga, segiempat, segibanyak, lingkaran)" },
  { id: "mtk-geo-bangunruang", label: "Mengenal bangun ruang (balok, kubus, kerucut, bola)" },
  { id: "mtk-geo-kompdekomp", label: "Menyusun dan mengurai bangun datar (segitiga, segiempat, dan segibanyak)" },
  { id: "mtk-geo-posisi", label: "Menentukan posisi benda terhadap benda lain (kanan, kiri, depan, belakang)" },
  // E. Analisis Data dan Peluang
  { id: "mtk-dat-organisasi", label: "Mengelompokkan, menyortir, mengurutkan & membandingkan data banyak benda (maks. 4 kategori)" },
  { id: "mtk-dat-sajian", label: "Menyajikan data banyak benda dengan turus & piktogram (maks. 4 kategori)" },
];

// Topik Matematika Fase B (Kelas 3 & 4) — diturunkan PERSIS dari CP (Kepka
// BSKAP 046/H/KR/2025, Ruang GTK). 5 elemen: Bilangan, Aljabar, Pengukuran,
// Geometri, Analisis Data dan Peluang. Semua topik = CP-inti (tanpa turunan ATP).
const MTK_FASE_B_TOPIK: Topik[] = [
  // A. Bilangan
  { id: "mtkb-bil-cacah10rb", label: "Bilangan cacah sampai 10.000 (membaca, menulis, nilai tempat)" },
  { id: "mtkb-bil-bandingurut", label: "Membandingkan & mengurutkan bilangan cacah sampai 10.000" },
  { id: "mtkb-bil-kompdekomp", label: "Komposisi & dekomposisi bilangan cacah sampai 10.000" },
  { id: "mtkb-bil-tambahkurang1rb", label: "Penjumlahan & pengurangan bilangan cacah sampai 1.000" },
  { id: "mtkb-bil-kalibagi100", label: "Perkalian & pembagian bilangan cacah sampai 100 (benda konkret, gambar, simbol)" },
  { id: "mtkb-bil-kelipatanfaktor", label: "Mengenal kelipatan & faktor" },
  { id: "mtkb-bil-bandingpecahan", label: "Membandingkan & mengurutkan pecahan (pembilang satu / penyebut sama)" },
  { id: "mtkb-bil-pecahansenilai", label: "Mengenal & menerapkan pecahan senilai" },
  { id: "mtkb-bil-desimal", label: "Intuisi pecahan & desimal; menentukan pecahan sebagai desimal & persen" },
  // B. Aljabar
  { id: "mtkb-alj-nilaibelumdiketahui", label: "Mengisi nilai yang belum diketahui dalam kalimat matematika (penjumlahan & pengurangan sampai 100)" },
  { id: "mtkb-alj-pola", label: "Mengidentifikasi, meniru, dan mengembangkan pola gambar/objek sederhana serta pola bilangan membesar dan mengecil yang melibatkan penjumlahan dan pengurangan sampai 100." },
  // C. Pengukuran
  { id: "mtkb-ukur-panjangberat", label: "Mengukur panjang & berat (satuan baku); hubungan antar-satuan panjang (cm, m) & berat (g, kg)" },
  { id: "mtkb-ukur-luasvolume", label: "Mengukur dan mengestimasi luas dan volume menggunakan satuan tidak baku dan satuan baku berupa bilangan cacah" },
  // D. Geometri
  { id: "mtkb-geo-ciribangundatar", label: "Mendeskripsikan ciri bangun datar (segiempat, segitiga, segi banyak)" },
  { id: "mtkb-geo-kompdekomp", label: "Menyusun dan mengurai berbagai bangun datar dengan lebih dari satu cara jika memungkinkan" },
  // E. Analisis Data dan Peluang
  { id: "mtkb-dat-urutbanding", label: "Mengurutkan & membandingkan data (tabel, diagram gambar, piktogram, diagram batang skala satu satuan)" },
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
  { id: "mtkc-bil-desimal", label: "Mengubah pecahan menjadi berbagai bentuk pecahan lain; membandingkan & mengurutkan desimal (satu angka di belakang koma)" },
  // B. Aljabar
  { id: "mtkc-alj-nilaibelumdiketahui", label: "Mengisi nilai yang belum diketahui dalam kalimat matematika (+, −, ×, ÷ pada bilangan cacah sampai 1.000)" },
  { id: "mtkc-alj-pola", label: "Mengidentifikasi, meniru, & mengembangkan pola bilangan membesar/mengecil (perkalian & pembagian)" },
  { id: "mtkc-alj-proporsi", label: "Bernalar proporsional untuk menyelesaikan masalah sehari-hari dengan rasio satuan serta menggunakan perkalian dan pembagian dalam masalah sehari-hari terkait proporsi" },
  // C. Pengukuran
  { id: "mtkc-ukur-kelilingluas", label: "Menentukan keliling & luas bangun datar (segitiga, segiempat, segi banyak) serta gabungannya" },
  { id: "mtkc-ukur-durasi", label: "Menghitung durasi waktu" },
  { id: "mtkc-ukur-sudut", label: "Mengukur besar sudut (pada bangun datar atau dua garis berpotongan)" },
  // D. Geometri
  { id: "mtkc-geo-bangunruang", label: "Mengonstruksi dan mengurai bangun ruang (kubus, balok, dan gabungannya) serta mengenali visualisasi spasial (depan, atas, dan samping)" },
  { id: "mtkc-geo-bandingkarakteristik", label: "Membandingkan karakteristik antarbangun datar & antarbangun ruang" },
  { id: "mtkc-geo-lokasipeta", label: "Menentukan lokasi pada peta dengan sistem berpetak" },
  // E. Analisis Data dan Peluang
  { id: "mtkc-dat-urutbanding", label: "Mengurutkan dan membandingkan data banyak benda dan data hasil pengukuran dalam bentuk gambar, piktogram, diagram batang, dan tabel frekuensi." },
  { id: "mtkc-dat-sajianalisis", label: "Menyajikan dan menganalisis data banyak benda dan data hasil pengukuran dalam bentuk gambar, piktogram, diagram batang, dan tabel frekuensi untuk mendapatkan informasi." },
  { id: "mtkc-dat-peluang", label: "Menentukan kejadian berkemungkinan lebih besar atau lebih kecil dalam percobaan acak" },
];

// Topik Pendidikan Pancasila Fase A (Kelas 1 & 2) — 4 elemen CP: Pancasila,
// UUD NRI 1945, Bhinneka Tunggal Ika, NKRI. Diturunkan dari CP (Kepka BSKAP
// 046/H/KR/2025).
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
  { id: "ppkn-bti-semboyan", label: "Mengenal semboyan Bhinneka Tunggal Ika" },
  { id: "ppkn-bti-identitas", label: "Mengidentifikasi & menghargai identitas diri (jenis kelamin, hobi, bahasa, agama & kepercayaan)" },
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
  { id: "ppknc-pcs-nilaidasar", label: "Menguraikan makna nilai-nilai Pancasila sebagai dasar negara & pandangan hidup bangsa" },
  // B. UUD NRI 1945
  { id: "ppknc-uud-identifikasi", label: "Mengimplementasikan bentuk-bentuk norma, hak, & kewajiban dalam kedudukannya sebagai warga negara" },
  { id: "ppknc-uud-pembukaan", label: "Mengenal Pembukaan Undang-Undang Dasar Negara Republik Indonesia Tahun 1945" },
  { id: "ppknc-uud-musyawarah", label: "Melaksanakan musyawarah untuk membuat kesepakatan & aturan bersama serta menerapkannya di keluarga & sekolah" },
  // C. Bhinneka Tunggal Ika
  { id: "ppknc-bti-keberagaman", label: "Menyajikan hasil identifikasi sikap menghormati, menjaga, & melestarikan keberagaman budaya sesuai semboyan dalam bingkai Bhinneka Tunggal Ika di lingkungan sekitar" },
  // D. NKRI
  { id: "ppknc-nkri-wilayah", label: "Mengenal wilayah (kabupaten/kota, provinsi) sebagai bagian NKRI" },
  { id: "ppknc-nkri-gotongroyong", label: "Perilaku gotong royong untuk menjaga persatuan sebagai wujud bela negara" },
];

// Topik PJOK Fase A (Kelas 1 & 2) — diturunkan PERSIS dari teks CP pada salinan
// resmi PDF Kepka BSKAP No. 046/H/KR/2025 (Lampiran II, hlm. 310-311). 4 elemen:
// Terampil Bergerak, Belajar Melalui Gerak, Bergaya Hidup Aktif, Memilih Hidup
// yang Menyehatkan. 1 kompetensi CP = 1 topik.
const PJOK_FASE_A_TOPIK: Topik[] = [
  // A. Terampil Bergerak
  { id: "pjok-tb-fundamental", label: "Mempraktikkan keterampilan gerak fundamental & menerapkannya dalam berbagai situasi gerak yang berbeda" },
  { id: "pjok-tb-strategigerak", label: "Mengeksplorasi berbagai strategi gerak" },
  { id: "pjok-tb-konsepgerak", label: "Mengeksplorasi berbagai konsep gerak serta menyimpulkan efektivitasnya" },
  // B. Belajar Melalui Gerak
  { id: "pjok-bmg-fairplay", label: "Menaati peraturan untuk menumbuhkan fair play dalam berbagai aktivitas jasmani" },
  { id: "pjok-bmg-kolaborasi", label: "Menerapkan strategi kolaborasi ketika berpartisipasi dalam aktivitas jasmani" },
  // C. Bergaya Hidup Aktif
  { id: "pjok-bha-partisipasi", label: "Berpartisipasi dalam berbagai aktivitas jasmani & mengidentifikasi manfaatnya" },
  // D. Memilih Hidup yang Menyehatkan
  { id: "pjok-mhm-gayahidup", label: "Mengenali gaya hidup aktif & sehat" },
  { id: "pjok-mhm-gizi", label: "Mengenali manfaat komponen makanan bergizi seimbang" },
  { id: "pjok-mhm-risiko", label: "Mengenali situasi & potensi berisiko terhadap kesehatan & keselamatan serta strategi mencari bantuan kepada orang dewasa terpercaya" },
];
// Topik PJOK Fase B (Kelas 3 & 4) — diturunkan PERSIS dari teks CP pada salinan
// resmi PDF Kepka BSKAP No. 046/H/KR/2025 (Lampiran II, hlm. 311-312).
// 4 elemen; 1 kompetensi CP = 1 topik.
const PJOK_FASE_B_TOPIK: Topik[] = [
  // A. Terampil Bergerak
  { id: "pjokb-tb-haluskan", label: "Menghaluskan keterampilan gerak fundamental & menerapkannya dalam situasi gerak yang baru" },
  { id: "pjokb-tb-strategi", label: "Menyesuaikan strategi gerak untuk mendapatkan capaian keterampilan gerak" },
  { id: "pjokb-tb-konsep", label: "Memperagakan berbagai konsep gerak yang dapat diterapkan dalam rangkaian gerak" },
  // B. Belajar Melalui Gerak
  { id: "pjokb-bmg-masalah", label: "Menerapkan strategi gerak sederhana & memecahkan masalah gerak" },
  { id: "pjokb-bmg-fairplay", label: "Menerapkan peraturan untuk menumbuhkan fair play dalam berbagai aktivitas jasmani" },
  { id: "pjokb-bmg-partisipasipositif", label: "Berpartisipasi secara positif dalam kelompok atau tim dalam berbagai aktivitas jasmani" },
  // C. Bergaya Hidup Aktif
  { id: "pjokb-bha-partisipasi", label: "Berpartisipasi dalam berbagai aktivitas jasmani & mengenali faktor-faktor yang menyebabkan aktivitas jasmani menyenangkan" },
  // D. Memilih Hidup yang Menyehatkan
  { id: "pjokb-mhm-risiko", label: "Mengenali risiko kesehatan akibat gaya hidup & berbagai aktivitas jasmani untuk pencegahannya" },
  { id: "pjokb-mhm-gizi", label: "Mengidentifikasi pola makan sehat & bergizi seimbang sesuai rekomendasi kesehatan untuk menunjang aktivitas sehari-hari" },
  { id: "pjokb-mhm-cedera", label: "Mempraktikkan penanganan cedera ringan sesuai pemahaman tentang prinsip pertolongan pertama" },
];
// Topik PJOK Fase C (Kelas 5 & 6) — diturunkan PERSIS dari teks CP pada salinan
// resmi PDF Kepka BSKAP No. 046/H/KR/2025 (Lampiran II, hlm. 312-313).
// 4 elemen; 1 kompetensi CP = 1 topik.
const PJOK_FASE_C_TOPIK: Topik[] = [
  // A. Terampil Bergerak
  { id: "pjokc-tb-sesuaikan", label: "Menyesuaikan keterampilan gerak melintasi berbagai situasi gerak" },
  { id: "pjokc-tb-transfer", label: "Mentransfer strategi gerak yang sudah dikuasai ke dalam berbagai situasi gerak yang berbeda" },
  { id: "pjokc-tb-investigasi", label: "Menginvestigasi berbagai konsep gerak yang dapat diterapkan untuk meningkatkan capaian keterampilan gerak" },
  // B. Belajar Melalui Gerak
  { id: "pjokc-bmg-efektivitas", label: "Menguji efektivitas penerapan strategi gerak dalam berbagai situasi gerak" },
  { id: "pjokc-bmg-peraturan", label: "Merancang peraturan alternatif & modifikasi permainan untuk mendukung fair play & partisipasi inklusif" },
  { id: "pjokc-bmg-peran", label: "Menjalankan berbagai peran untuk mencapai keberhasilan kelompok atau tim dalam berbagai aktivitas jasmani" },
  // C. Bergaya Hidup Aktif
  { id: "pjokc-bha-pengaruh", label: "Berpartisipasi dalam aktivitas jasmani & menjelaskan pengaruh aktivitas jasmani yang teratur terhadap kesehatan" },
  { id: "pjokc-bha-sedenter", label: "Mengidentifikasi rekomendasi aktivitas jasmani serta pencegahan perilaku sedenter" },
  // D. Memilih Hidup yang Menyehatkan
  { id: "pjokc-mhm-risiko", label: "Mengidentifikasi & menghubungkan antara gaya hidup, risiko kesehatan, & aktivitas pencegahannya sesuai rekomendasi otoritas kesehatan" },
  { id: "pjokc-mhm-gizi", label: "Menjelaskan pola makan sehat untuk menunjang aktivitas jasmani berdasarkan informasi kandungan gizi pada makanan" },
  { id: "pjokc-mhm-cedera", label: "Mempraktikkan penanganan cedera sedang sesuai pemahaman tentang prinsip pertolongan pertama" },
];
// Topik IPAS Fase B (Kelas 3 & 4) — diturunkan PERSIS dari CP elemen
// "Pemahaman IPAS" pada salinan resmi PDF Kepka BSKAP No. 046/H/KR/2025
// (Lampiran II, hlm. 149-151). Tiap topik = satu klausa antar-titik-koma di CP.
// Elemen "Keterampilan proses" sengaja TIDAK dijadikan topik (metode
// lintas-materi, bukan pokok bahasan).
const IPAS_FASE_B_TOPIK: Topik[] = [
  { id: "ipasb-pancaindra", label: "Bentuk & fungsi pancaindra" },
  { id: "ipasb-siklushidup", label: "Siklus hidup makhluk hidup & upaya pelestariannya" },
  { id: "ipasb-sda-iklim", label: "Solusi masalah pelestarian sumber daya alam sebagai upaya mitigasi perubahan iklim" },
  { id: "ipasb-wujudzat", label: "Proses perubahan wujud zat" },
  { id: "ipasb-sumberenergi", label: "Sumber & bentuk energi serta proses perubahan bentuk energi dalam kehidupan sehari-hari" },
  { id: "ipasb-gaya", label: "Jenis gaya & pengaruhnya terhadap arah, gerak, & bentuk benda" },
  { id: "ipasb-perantugas-sosial", label: "Peran, tugas, & tanggung jawab serta interaksi sosial di sekitar tempat tinggal & sekolah" },
  { id: "ipasb-letakwilayah", label: "Letak kabupaten/kota & provinsi tempat tinggal melalui peta konvensional/digital" },
  { id: "ipasb-bentangalam", label: "Ragam bentang alam & keterkaitannya dengan profesi masyarakat, ragam budaya, serta upaya melestarikannya" },
  { id: "ipasb-sejarahmasyarakat", label: "Sejarah masyarakat di lingkungan tempat tinggal" },
  { id: "ipasb-uang", label: "Nilai mata uang & fungsinya serta cara mengelola keuangan secara bijak" },
];

// Topik IPAS Fase C (Kelas 5 & 6) — diturunkan PERSIS dari CP elemen
// "Pemahaman IPAS" pada salinan resmi PDF Kepka BSKAP No. 046/H/KR/2025
// (Lampiran II, hlm. 151-153). Tiap topik = satu klausa antar-titik-koma di CP.
const IPAS_FASE_C_TOPIK: Topik[] = [
  { id: "ipasc-organ", label: "Sistem organ tubuh manusia & cara menjaga kesehatan tubuh" },
  { id: "ipasc-biotik-abiotik", label: "Hubungan komponen biotik & abiotik serta pengaruhnya terhadap ekosistem" },
  { id: "ipasc-bunyicahaya", label: "Fenomena gelombang bunyi & cahaya dalam kehidupan sehari-hari" },
  { id: "ipasc-hematenergi", label: "Penghematan energi & pemanfaatan sumber energi alternatif dari sumber daya di sekitar sebagai upaya mitigasi perubahan iklim" },
  { id: "ipasc-tatasurya", label: "Sistem tata surya serta kaitannya dengan rotasi & revolusi bumi" },
  { id: "ipasc-geografis-id", label: "Letak & kondisi geografis negara Indonesia melalui peta konvensional/digital" },
  { id: "ipasc-pahlawan", label: "Sejarah perjuangan para pahlawan di lingkungan sekitar tempat tinggal" },
  { id: "ipasc-budaya-kebinekaan", label: "Keragaman budaya nasional dalam konteks kebhinekaan berdasarkan nilai kearifan lokal di wilayah tempat tinggal" },
  { id: "ipasc-ekonomi", label: "Kegiatan ekonomi masyarakat di lingkungan sekitar" },
];

// Topik Bahasa Inggris Fase B (Kelas 3 & 4) — diturunkan PERSIS dari CP 3 elemen
// (Kepka BSKAP 046/H/KR/2025, Ruang GTK): Menyimak–Berbicara, Membaca–Memirsa,
// Menulis–Mempresentasikan. Granularitas CP-murni: 1 kompetensi = 1 topik.
const BING_FASE_B_TOPIK: Topik[] = [
  // A. Menyimak – Berbicara
  { id: "bingb-sb", label: "Memahami & merespon teks lisan atau teks multimodal sederhana tentang kehidupan sehari-hari (verbal/non-verbal) sesuai konteks" },
  // B. Membaca – Memirsa
  { id: "bingb-bm", label: "Memahami teks tulis pendek sederhana atau teks multimodal tentang kehidupan sehari-hari & meresponsnya (verbal/non-verbal) sesuai konteks" },
  // C. Menulis – Mempresentasikan
  { id: "bingb-tm", label: "Mengomunikasikan gagasan tentang topik sehari-hari dalam teks tulis pendek atau teks multimodal sesuai konteks" },
];

// Topik Bahasa Inggris Fase C (Kelas 5 & 6) — diturunkan PERSIS dari CP 3 elemen
// (Kepka BSKAP 046/H/KR/2025, Ruang GTK). Granularitas CP-murni: 1 kompetensi = 1 topik.
const BING_FASE_C_TOPIK: Topik[] = [
  // A. Menyimak – Berbicara
  { id: "bingc-sb", label: "Memahami alur informasi teks secara keseluruhan & merespon teks lisan atau teks multimodal sederhana tentang topik sehari-hari secara lisan dengan kalimat pendek & sederhana sesuai konteks" },
  // B. Membaca – Memirsa
  { id: "bingc-bm", label: "Memahami alur informasi secara keseluruhan, gagasan utama & informasi rinci dari beragam teks pendek atau teks multimodal tentang topik sehari-hari & meresponnya sesuai konteks" },
  // C. Menulis – Mempresentasikan
  { id: "bingc-tm", label: "Mengomunikasikan ide & pengalaman melalui berbagai jenis teks tulis sederhana atau teks multimodal tentang topik sehari-hari sesuai konteks" },
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

// Topik Seni Musik Fase A (Kelas 1 & 2) — diturunkan PERSIS dari teks CP pada
// salinan resmi PDF Kepka BSKAP No. 046/H/KR/2025 (Lampiran II, hlm. 238-239).
// 5 elemen: Mengalami, Merefleksikan, Berpikir & Bekerja Artistik, Menciptakan,
// Berdampak. 1 kompetensi CP = 1 topik.
const SENIMUSIK_FASE_A_TOPIK: Topik[] = [
  // Mengalami (Experiencing)
  { id: "senimusik-a-mengalami-unsur", label: "Mengenali unsur-unsur musik (nada & irama) menggunakan anggota tubuh maupun alat musik" },
  // Merefleksikan (Reflecting)
  { id: "senimusik-a-merefleksikan-umpanbalik", label: "Melakukan umpan balik mengenai praktik bermain musik diri sendiri atau orang lain menggunakan bahasa sehari-hari" },
  // Berpikir & Bekerja Artistik (Thinking and Working Artistically)
  { id: "senimusik-a-artistik-imitasi", label: "Menirukan pola irama & nada menggunakan alat musik ritmis atau melodis" },
  { id: "senimusik-a-artistik-ragamalat", label: "Mengenali ragam alat musik & bunyi yang dihasilkan" },
  { id: "senimusik-a-artistik-mainbersih", label: "Mengenali cara memainkan & membersihkan instrumen/alat musik" },
  // Menciptakan (Creating)
  { id: "senimusik-a-menciptakan-polairama", label: "Membuat pola irama menggunakan anggota tubuh atau alat musik ritmis yang tersedia di lingkungan sekitar" },
  // Berdampak (Impacting)
  { id: "senimusik-a-berdampak-senang", label: "Menunjukkan ekspresi senang dalam kegiatan bermusik" },
];

// Topik Seni Rupa Fase A (Kelas 1 & 2) — diturunkan PERSIS dari teks CP pada
// salinan resmi PDF Kepka BSKAP No. 046/H/KR/2025 (Lampiran II, hlm. 246-247).
// 5 elemen; 1 kompetensi CP = 1 topik.
const SENIRUPA_FASE_A_TOPIK: Topik[] = [
  // Mengalami (Experiencing)
  { id: "senirupa-a-mengalami-unsur", label: "Mengenali & menyebutkan unsur-unsur rupa dalam benda-benda di sekitar/karya seni rupa" },
  // Merefleksikan (Reflecting)
  { id: "senirupa-a-merefleksikan-apresiasi", label: "Merefleksikan & mengapresiasi karya diri sendiri" },
  // Berpikir & Bekerja Artistik (Thinking and Working Artistically)
  { id: "senirupa-a-artistik-alatbahan", label: "Mengenali & menguji coba alat dan/atau bahan yang dimiliki" },
  // Menciptakan (Making/Creating)
  { id: "senirupa-a-menciptakan-pengamatan", label: "Membuat karya seni rupa berdasarkan pengalaman & hasil pengamatan terhadap lingkungan sekitar" },
  // Berdampak (Impacting)
  { id: "senirupa-a-berdampak-perasaan", label: "Menghasilkan karya seni rupa yang berdampak pada perasaan dirinya" },
];

// Topik Seni Rupa Fase B (Kelas 3 & 4) — diturunkan PERSIS dari teks CP pada
// salinan resmi PDF Kepka BSKAP No. 046/H/KR/2025 (Lampiran II, hlm. 247).
// 5 elemen; 1 kompetensi CP = 1 topik.
const SENIRUPA_FASE_B_TOPIK: Topik[] = [
  // Mengalami (Experiencing)
  { id: "senirupa-b-mengalami-unsurprinsip", label: "Mengidentifikasi unsur rupa & prinsip desain dalam benda-benda di sekitar/karya seni rupa" },
  // Merefleksikan (Reflecting)
  { id: "senirupa-b-merefleksikan-apresiasi", label: "Merefleksikan & mengapresiasi karya diri sendiri & teman sekelas menggunakan kosa kata seni rupa yang sesuai" },
  // Berpikir & Bekerja Artistik (Thinking and Working Artistically)
  { id: "senirupa-b-artistik-prosedur", label: "Mengenali & menguji coba alat dan/atau bahan yang dimiliki serta prosedur penggunaannya" },
  // Menciptakan (Making/Creating)
  { id: "senirupa-b-menciptakan-pengamatan", label: "Membuat karya seni rupa berdasarkan pengalaman & hasil pengamatan terhadap lingkungan sekitar" },
  // Berdampak (Impacting)
  { id: "senirupa-b-berdampak-harapan", label: "Menghasilkan karya seni rupa yang berdampak pada perasaan atau mewakili harapannya" },
];

// Topik Seni Rupa Fase C (Kelas 5 & 6) — diturunkan PERSIS dari teks CP pada
// salinan resmi PDF Kepka BSKAP No. 046/H/KR/2025 (Lampiran II, hlm. 247-248).
// 5 elemen; 1 kompetensi CP = 1 topik.
const SENIRUPA_FASE_C_TOPIK: Topik[] = [
  // Mengalami (Experiencing)
  { id: "senirupa-c-mengalami-jelaskan", label: "Menjelaskan unsur rupa & prinsip desain dalam benda-benda di sekitar/karya seni rupa" },
  // Merefleksikan (Reflecting)
  { id: "senirupa-c-merefleksikan-apresiasi", label: "Merefleksikan & mengapresiasi karya diri sendiri & teman sekelas menggunakan kosa kata seni rupa yang sesuai" },
  // Berpikir & Bekerja Artistik (Thinking and Working Artistically)
  { id: "senirupa-c-artistik-variasiteknik", label: "Mengenali & menguji coba variasi teknik penggunaan alat dan/atau bahan" },
  // Menciptakan (Making/Creating)
  { id: "senirupa-c-menciptakan-imajinasi", label: "Membuat karya seni rupa berdasarkan pengalaman dan/atau hasil pengamatan terhadap lingkungan sekitar melalui pengembangan imajinasi" },
  // Berdampak (Impacting)
  { id: "senirupa-c-berdampak-minat", label: "Menghasilkan karya seni rupa yang mewakili minatnya" },
];

// Topik Seni Tari Fase A (Kelas 1 & 2) — diturunkan PERSIS dari teks CP pada
// salinan resmi PDF Kepka BSKAP No. 046/H/KR/2025 (Lampiran II, hlm. 256-257).
// 5 elemen; 1 kompetensi CP = 1 topik (kalimat ber-"serta" dipecah per kompetensi).
const SENITARI_FASE_A_TOPIK: Topik[] = [
  // Mengalami (Experiencing)
  { id: "senitari-a-mengalami-bentuktari", label: "Mengenal bentuk tari sebagai media komunikasi" },
  { id: "senitari-a-mengalami-unsurutama", label: "Mengembangkan kesadaran diri dalam bereksplorasi unsur utama tari meliputi gerak, ruang, tenaga, waktu, gerak di tempat & gerak berpindah" },
  // Merefleksikan (Reflecting)
  { id: "senitari-a-merefleksikan-identifikasi", label: "Mengidentifikasi unsur utama tari meliputi gerak, ruang, tenaga, waktu, gerak di tempat & gerak berpindah" },
  { id: "senitari-a-merefleksikan-pencapaian", label: "Mengemukakan pencapaian diri secara lisan, tulisan, & kinestetik" },
  // Berpikir & Bekerja Artistik (Thinking and Working Artistically)
  { id: "senitari-a-artistik-meragakan", label: "Meragakan hasil gerak berdasarkan etika sebagai penampil & penonton dengan keyakinan & percaya diri saat mengekspresikan ide, perasaan kepada penonton atau lingkungan sekitar" },
  // Menciptakan (Creating)
  { id: "senitari-a-menciptakan-kesatuangerak", label: "Mengembangkan unsur utama tari (gerak, ruang, waktu, & tenaga), gerak di tempat, & gerak berpindah untuk membuat gerak sederhana yang memiliki kesatuan gerak yang indah" },
  // Berdampak (Impacting)
  { id: "senitari-a-berdampak-antusias", label: "Menerima proses pembelajaran sehingga tumbuh rasa ingin tahu & dapat menunjukkan antusiasme yang berdampak pada kemampuan diri dalam menyelesaikan aktivitas pembelajaran tari" },
];

// Topik Seni Tari Fase B (Kelas 3 & 4) — diturunkan PERSIS dari teks CP pada
// salinan resmi PDF Kepka BSKAP No. 046/H/KR/2025 (Lampiran II, hlm. 257).
// 5 elemen; 1 kompetensi CP = 1 topik (kalimat ber-"serta" dipecah per kompetensi).
const SENITARI_FASE_B_TOPIK: Topik[] = [
  // Mengalami (Experiencing)
  { id: "senitari-b-mengalami-penyajian", label: "Mengamati bentuk penyajian tari berdasarkan latar belakang" },
  { id: "senitari-b-mengalami-levelarah", label: "Mengeksplorasi unsur utama tari sesuai level gerak & perubahan arah hadap" },
  // Merefleksikan (Reflecting)
  { id: "senitari-b-merefleksikan-identifikasi", label: "Mengidentifikasi unsur utama tari sesuai level gerak & perubahan arah hadap" },
  { id: "senitari-b-merefleksikan-pencapaian", label: "Menilai pencapaian diri saat melakukan aktivitas pembelajaran tari" },
  // Berpikir & Bekerja Artistik (Thinking and Working Artistically)
  { id: "senitari-b-artistik-kooperatif", label: "Meragakan hasil tari dengan bekerja secara kooperatif untuk mengembangkan kemampuan bekerja sama & saling menghargai demi tercapainya tujuan bersama" },
  // Menciptakan (Creating)
  { id: "senitari-b-menciptakan-kembanggerak", label: "Mengembangkan gerak dengan unsur utama tari, level, & perubahan arah hadap" },
  // Berdampak (Impacting)
  { id: "senitari-b-berdampak-usaha", label: "Menerima proses pembelajaran sehingga tumbuh rasa ingin tahu & dapat menunjukkan usaha yang berdampak pada kemampuan diri dalam menyelesaikan aktivitas pembelajaran tari" },
];

// Topik Seni Tari Fase C (Kelas 5 & 6) — diturunkan PERSIS dari teks CP pada
// salinan resmi PDF Kepka BSKAP No. 046/H/KR/2025 (Lampiran II, hlm. 258).
// 5 elemen; 1 kompetensi CP = 1 topik (kalimat ber-"serta" dipecah per kompetensi).
// Ejaan "menunjukan" (elemen 3.3) mengikuti dokumen 046 apa adanya.
const SENITARI_FASE_C_TOPIK: Topik[] = [
  // Mengalami (Experiencing)
  { id: "senitari-c-mengalami-taritradisi", label: "Mengamati berbagai bentuk tari tradisi yang dapat digunakan untuk mengekspresikan diri melalui unsur pendukung tari" },
  // Merefleksikan (Reflecting)
  { id: "senitari-c-merefleksikan-unsurpendukung", label: "Mengidentifikasi unsur pendukung tari dalam tari tradisi" },
  { id: "senitari-c-merefleksikan-pencapaian", label: "Menghargai hasil pencapaian diri dengan mempertimbangkan pendapat orang lain" },
  // Berpikir & Bekerja Artistik (Thinking and Working Artistically)
  { id: "senitari-c-artistik-rangkaiangerak", label: "Meragakan hasil rangkaian gerak tari menggunakan unsur pendukung tari dengan menunjukan kerja sama & berperan aktif dalam kelompok" },
  // Menciptakan (Creating)
  { id: "senitari-c-menciptakan-desainkelompok", label: "Merangkai gerak tari yang berpijak pada tradisi/kreasi dengan menerapkan desain kelompok" },
  // Berdampak (Impacting)
  { id: "senitari-c-berdampak-menanggapi", label: "Menanggapi kejadian-kejadian di lingkungan sekitar melalui tari yang disajikan kepada penonton atau masyarakat sekitar" },
];

// Topik Seni Teater Fase A (Kelas 1 & 2) — diturunkan PERSIS dari teks CP pada
// salinan resmi PDF Kepka BSKAP No. 046/H/KR/2025 (Lampiran II, hlm. 263-264).
// 5 elemen; 1 kompetensi CP = 1 topik (kalimat ber-"serta" dipecah per kompetensi).
const SENITEATER_FASE_A_TOPIK: Topik[] = [
  // Mengalami (Experiencing)
  { id: "seniteater-a-mengalami-geraksuara", label: "Mengamati, merespons, & meniru gerak tubuh dan suara sebagai media untuk mengomunikasikan emosi" },
  // Merefleksikan (Reflection)
  { id: "seniteater-a-merefleksikan-pengalaman", label: "Mengenali pengalaman & emosi selama proses berseni teater" },
  { id: "seniteater-a-merefleksikan-ceritakarya", label: "Menceritakan sebuah karya dengan kosakata sehari-hari" },
  // Berpikir & Bekerja Artistik (Thinking and Working Artistically)
  { id: "seniteater-a-artistik-properti", label: "Mengenal jenis-jenis properti/alat bantu yang dapat mendukung cerita/permainan peran" },
  // Menciptakan (Creating)
  { id: "seniteater-a-menciptakan-peranlakon", label: "Mengeksplorasi beragam peran mengenai tokoh di sekitar atau rekaan & memainkan sebuah lakon pertunjukan" },
  // Berdampak (Impacting)
  { id: "seniteater-a-berdampak-geraklagu", label: "Memainkan gerak & lagu sesuai arahan dari pendidik" },
];

// Topik Seni Teater Fase B (Kelas 3 & 4) — diturunkan PERSIS dari teks CP pada
// salinan resmi PDF Kepka BSKAP No. 046/H/KR/2025 (Lampiran II, hlm. 264-265).
// 5 elemen; 1 kompetensi CP = 1 topik.
const SENITEATER_FASE_B_TOPIK: Topik[] = [
  // Mengalami (Experiencing)
  { id: "seniteater-b-mengalami-teknikakting", label: "Mengenal teknik dasar akting (pemeranan) melalui proses meniru (mimesis), mengenal gerak tubuh, suara/vokal sesuai tokoh/peran atau perilaku objek sekitar" },
  // Merefleksikan (Reflection)
  { id: "seniteater-b-merefleksikan-lingkungan", label: "Mengenali lingkungan sekitarnya & pengalaman dalam bermain teater" },
  // Bekerja Secara Artistik (Thinking and Working Artistically)
  { id: "seniteater-b-artistik-properti", label: "Menggunakan properti yang sesuai dengan tokoh yang diperankan" },
  // Menciptakan (Creating)
  { id: "seniteater-b-menciptakan-lakon", label: "Mengamati berbagai peran, mengenal tokoh di sekitar, & memainkan sebuah lakon dalam cerita" },
  // Berdampak (Impacting)
  { id: "seniteater-b-berdampak-bentuklakon", label: "Mengenal bentuk lakon dalam bermain teater" },
];

// Topik Seni Teater Fase C (Kelas 5 & 6) — diturunkan PERSIS dari teks CP pada
// salinan resmi PDF Kepka BSKAP No. 046/H/KR/2025 (Lampiran II, hlm. 265-266).
// 5 elemen; 1 kompetensi CP = 1 topik (kalimat ", dan melakukan" dipecah per kompetensi).
const SENITEATER_FASE_C_TOPIK: Topik[] = [
  // Mengalami (Experiencing)
  { id: "seniteater-c-mengalami-improvisasi", label: "Melakukan permainan peran berkelompok, seperti improvisasi untuk melatih aksi & reaksi dalam mengelaborasi cerita atau tokoh" },
  { id: "seniteater-c-mengalami-karakter", label: "Melakukan pengenalan karakter melalui pengamatan kebiasaan tokoh yang diperankan" },
  // Merefleksikan (Reflection)
  { id: "seniteater-c-merefleksikan-pendapat", label: "Menceritakan pendapatnya tentang sebuah cerita sederhana (penokohan, perwatakan)" },
  // Berpikir & Bekerja Artistik (Thinking and Working Artistically)
  { id: "seniteater-c-artistik-properti", label: "Mengidentifikasi properti sederhana berdasarkan cerita yang akan dimainkan" },
  // Menciptakan (Creating)
  { id: "seniteater-c-menciptakan-ragamperan", label: "Mengenal & memainkan ragam peran dari cerita sederhana berdasarkan hasil pengamatan" },
  // Berdampak (Impacting)
  { id: "seniteater-c-berdampak-memerankan", label: "Memerankan lakon secara individu maupun berkelompok berdasarkan minat, pengamatan, & pengalaman" },
];

// Topik Seni Musik Fase C (Kelas 5 & 6) — diturunkan PERSIS dari teks CP pada
// salinan resmi PDF Kepka BSKAP No. 046/H/KR/2025 (Lampiran II, hlm. 240-241).
// 5 elemen; 1 kompetensi CP = 1 topik.
const SENIMUSIK_FASE_C_TOPIK: Topik[] = [
  // Mengalami (Experiencing)
  { id: "senimusik-c-mengalami-terapkan", label: "Mengenali & menerapkan unsur-unsur musik (nada, irama & melodi) menggunakan alat musik ritmis & melodis" },
  { id: "senimusik-c-mengalami-kepekaan", label: "Menunjukkan tingkat kepekaan akan unsur-unsur musik dengan alat musik ritmis & melodis" },
  // Merefleksikan (Reflecting)
  { id: "senimusik-c-merefleksikan-umpanbalik", label: "Melakukan umpan balik mengenai karya & kemampuan bermusik diri sendiri atau orang lain menggunakan istilah musik yang tepat" },
  // Berpikir & Bekerja Artistik (Thinking and Working Artistically)
  { id: "senimusik-c-artistik-eksplorasi", label: "Mengeksplorasi variasi pola irama, tempo & melodi dengan alat musik ritmis & melodis menggunakan notasi musik & teknik dasar yang telah dipelajari" },
  { id: "senimusik-c-artistik-alternatif", label: "Menemukan alternatif untuk menghasilkan bunyi musik sederhana melalui eksplorasi material yang tersedia di lingkungan sekitar" },
  { id: "senimusik-c-artistik-mainrawat", label: "Menerapkan cara memainkan & merawat alat musik dengan teknik yang tepat sesuai spesifikasi bahan alat musik" },
  // Menciptakan (Creating)
  { id: "senimusik-c-menciptakan-kembangkan", label: "Membuat & mengembangkan pola irama menggunakan anggota tubuh atau alat musik ritmis yang tersedia berdasarkan nilai kearifan lokal daerahnya" },
  // Berdampak (Impacting)
  { id: "senimusik-c-berdampak-minat", label: "Menunjukkan minat & rasa ingin tahu dalam kegiatan bermusik" },
];

// Topik Seni Musik Fase B (Kelas 3 & 4) — diturunkan PERSIS dari teks CP pada
// salinan resmi PDF Kepka BSKAP No. 046/H/KR/2025 (Lampiran II, hlm. 239-240).
// 5 elemen; 1 kompetensi CP = 1 topik.
const SENIMUSIK_FASE_B_TOPIK: Topik[] = [
  // Mengalami (Experiencing)
  { id: "senimusik-b-mengalami-nadairama", label: "Mengenali nada & pola irama menggunakan anggota tubuh maupun alat musik" },
  // Merefleksikan (Reflecting)
  { id: "senimusik-b-merefleksikan-istilah", label: "Melakukan umpan balik mengenai praktik bermusik diri sendiri atau orang lain menggunakan istilah musik" },
  // Berpikir & Bekerja Artistik (Thinking and Working Artistically)
  { id: "senimusik-b-artistik-imitasi", label: "Menirukan pola irama & melodi menggunakan alat musik ritmis atau melodis" },
  { id: "senimusik-b-artistik-karakteristik", label: "Menyebutkan karakteristik ragam alat musik & bunyi yang dihasilkan" },
  { id: "senimusik-b-artistik-mainrawat", label: "Mengetahui cara memainkan & merawat alat musik" },
  // Menciptakan (Creating)
  { id: "senimusik-b-menciptakan-buatbunyi", label: "Membuat bunyi menggunakan anggota tubuh atau alat musik ritmis & melodis yang tersedia di lingkungan sekitar" },
  // Berdampak (Impacting)
  { id: "senimusik-b-berdampak-minat", label: "Menunjukkan minat dalam kegiatan bermusik" },
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
  // NASIONAL — SD/MI Bahasa Indonesia, FASE A (Kelas 1 & 2).
  // Sumber: Kepka BSKAP No. 046/H/KR/2025 — CP Bahasa Indonesia Fase A.
  // (Menggantikan entri [CONTOH] lama untuk slot yang sama.)
  // -------------------------------------------------------------------------
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Bahasa Indonesia",
    kelas: "1",
    status: "draft",
    sumber: "CP Bahasa Indonesia Fase A — Kepka BSKAP No. 046/H/KR/2025 (+ referensi ATP Kemendikdasmen)",
    topik: BIND_FASE_A_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Bahasa Indonesia",
    kelas: "2",
    status: "draft",
    sumber: "CP Bahasa Indonesia Fase A — Kepka BSKAP No. 046/H/KR/2025 (+ referensi ATP Kemendikdasmen)",
    topik: BIND_FASE_A_TOPIK,
  },

  // -------------------------------------------------------------------------
  // NASIONAL — SD/MI Bahasa Indonesia, FASE B (Kelas 3 & 4) & FASE C (Kelas 5 &
  // 6). Sumber: Kepka BSKAP No. 046/H/KR/2025 — CP (Ruang GTK).
  // CP-murni (tanpa ATP). 4 elemen: Menyimak, Membaca & Memirsa, Berbicara &
  // Mempresentasikan, Menulis.
  // -------------------------------------------------------------------------
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Bahasa Indonesia",
    kelas: "3",
    status: "draft",
    sumber: "CP Bahasa Indonesia Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: BIND_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Bahasa Indonesia",
    kelas: "4",
    status: "draft",
    sumber: "CP Bahasa Indonesia Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: BIND_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Bahasa Indonesia",
    kelas: "5",
    status: "draft",
    sumber: "CP Bahasa Indonesia Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: BIND_FASE_C_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Bahasa Indonesia",
    kelas: "6",
    status: "draft",
    sumber: "CP Bahasa Indonesia Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: BIND_FASE_C_TOPIK,
  },

  // -------------------------------------------------------------------------
  // NASIONAL — SD/MI Matematika, FASE A (Kelas 1 & 2).
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
  // NASIONAL — SD/MI Matematika, FASE B (Kelas 3 & 4).
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
  // NASIONAL — SD/MI Matematika, FASE C (Kelas 5 & 6).
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
  // NASIONAL — SD/MI Pendidikan Pancasila, FASE A (Kelas 1 & 2).
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
  // (Kelas 5 & 6). Sumber: Kepka BSKAP No. 046/H/KR/2025.
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
  // NASIONAL — SD/MI PJOK, FASE A (Kelas 1 & 2).
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

  // -------------------------------------------------------------------------
  // NASIONAL — SD/MI PJOK, FASE B (Kelas 3 & 4) & FASE C (Kelas 5 & 6).
  // Sumber: Kepka BSKAP No. 046/H/KR/2025 — CP PJOK (Ruang GTK).
  // -------------------------------------------------------------------------
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "PJOK",
    kelas: "3",
    status: "draft",
    sumber: "CP PJOK Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: PJOK_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "PJOK",
    kelas: "4",
    status: "draft",
    sumber: "CP PJOK Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: PJOK_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "PJOK",
    kelas: "5",
    status: "draft",
    sumber: "CP PJOK Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: PJOK_FASE_C_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "PJOK",
    kelas: "6",
    status: "draft",
    sumber: "CP PJOK Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: PJOK_FASE_C_TOPIK,
  },

  // -------------------------------------------------------------------------
  // NASIONAL — SD/MI IPAS, FASE B (Kelas 3 & 4) & FASE C (Kelas 5 & 6).
  // Sumber: Kepka BSKAP No. 046/H/KR/2025 — CP IPAS elemen "Pemahaman IPAS".
  // IPAS tidak memiliki Fase A (kelas 1 & 2 tetap fallback teks-bebas).
  // -------------------------------------------------------------------------
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "IPAS",
    kelas: "3",
    status: "draft",
    sumber: "CP IPAS Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: IPAS_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "IPAS",
    kelas: "4",
    status: "draft",
    sumber: "CP IPAS Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: IPAS_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "IPAS",
    kelas: "5",
    status: "draft",
    sumber: "CP IPAS Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: IPAS_FASE_C_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "IPAS",
    kelas: "6",
    status: "draft",
    sumber: "CP IPAS Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: IPAS_FASE_C_TOPIK,
  },

  // -------------------------------------------------------------------------
  // NASIONAL — SD/MI Bahasa Inggris, FASE B (Kelas 3 & 4) & FASE C (Kelas 5 &
  // 6). Sumber: Kepka BSKAP No. 046/H/KR/2025 — CP (Ruang GTK).
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
  // 2). Sumber: Kepka BKPDM No. 020 Tahun 2026 (perubahan atas
  // Kepka BSKAP No. 046/H/KR/2025). 5 elemen.
  // -------------------------------------------------------------------------
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Pendidikan Agama Islam dan Budi Pekerti",
    kelas: "1",
    status: "draft",
    sumber: "CP Pendidikan Agama Islam dan Budi Pekerti Fase A — Kepka BKPDM No. 020 Tahun 2026 (perubahan atas Kepka BSKAP No. 046/H/KR/2025)",
    topik: PAI_FASE_A_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Pendidikan Agama Islam dan Budi Pekerti",
    kelas: "2",
    status: "draft",
    sumber: "CP Pendidikan Agama Islam dan Budi Pekerti Fase A — Kepka BKPDM No. 020 Tahun 2026 (perubahan atas Kepka BSKAP No. 046/H/KR/2025)",
    topik: PAI_FASE_A_TOPIK,
  },

  // -------------------------------------------------------------------------
  // NASIONAL — SD/MI Pendidikan Agama Islam & Budi Pekerti, FASE B (Kelas 3 &
  // 4) & FASE C (Kelas 5 & 6). Sumber: Kepka BKPDM No. 020 Tahun
  // 2026 (perubahan atas Kepka BSKAP No. 046/H/KR/2025).
  // -------------------------------------------------------------------------
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Pendidikan Agama Islam dan Budi Pekerti",
    kelas: "3",
    status: "draft",
    sumber: "CP Pendidikan Agama Islam dan Budi Pekerti Fase B — Kepka BKPDM No. 020 Tahun 2026 (perubahan atas Kepka BSKAP No. 046/H/KR/2025)",
    topik: PAI_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Pendidikan Agama Islam dan Budi Pekerti",
    kelas: "4",
    status: "draft",
    sumber: "CP Pendidikan Agama Islam dan Budi Pekerti Fase B — Kepka BKPDM No. 020 Tahun 2026 (perubahan atas Kepka BSKAP No. 046/H/KR/2025)",
    topik: PAI_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Pendidikan Agama Islam dan Budi Pekerti",
    kelas: "5",
    status: "draft",
    sumber: "CP Pendidikan Agama Islam dan Budi Pekerti Fase C — Kepka BKPDM No. 020 Tahun 2026 (perubahan atas Kepka BSKAP No. 046/H/KR/2025)",
    topik: PAI_FASE_C_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Pendidikan Agama Islam dan Budi Pekerti",
    kelas: "6",
    status: "draft",
    sumber: "CP Pendidikan Agama Islam dan Budi Pekerti Fase C — Kepka BKPDM No. 020 Tahun 2026 (perubahan atas Kepka BSKAP No. 046/H/KR/2025)",
    topik: PAI_FASE_C_TOPIK,
  },

  // ── Seni Musik SD/MI (Fase A) — draft, sumber portal Ruang GTK ──
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Musik",
    kelas: "1",
    status: "draft",
    sumber: "CP Seni Musik Fase A — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENIMUSIK_FASE_A_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Musik",
    kelas: "2",
    status: "draft",
    sumber: "CP Seni Musik Fase A — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENIMUSIK_FASE_A_TOPIK,
  },

  // ── Seni Musik SD/MI (Fase B) — draft, sumber portal Ruang GTK ──
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Musik",
    kelas: "3",
    status: "draft",
    sumber: "CP Seni Musik Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENIMUSIK_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Musik",
    kelas: "4",
    status: "draft",
    sumber: "CP Seni Musik Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENIMUSIK_FASE_B_TOPIK,
  },

  // ── Seni Musik SD/MI (Fase C) — draft, sumber portal Ruang GTK ──
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Musik",
    kelas: "5",
    status: "draft",
    sumber: "CP Seni Musik Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENIMUSIK_FASE_C_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Musik",
    kelas: "6",
    status: "draft",
    sumber: "CP Seni Musik Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENIMUSIK_FASE_C_TOPIK,
  },

  // ── Seni Rupa SD/MI (Fase A) — sumber CP Kepka BSKAP No. 046/H/KR/2025 ──
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Rupa",
    kelas: "1",
    status: "draft",
    sumber: "CP Seni Rupa Fase A — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENIRUPA_FASE_A_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Rupa",
    kelas: "2",
    status: "draft",
    sumber: "CP Seni Rupa Fase A — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENIRUPA_FASE_A_TOPIK,
  },

  // ── Seni Rupa SD/MI (Fase B) — sumber CP Kepka BSKAP No. 046/H/KR/2025 ──
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Rupa",
    kelas: "3",
    status: "draft",
    sumber: "CP Seni Rupa Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENIRUPA_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Rupa",
    kelas: "4",
    status: "draft",
    sumber: "CP Seni Rupa Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENIRUPA_FASE_B_TOPIK,
  },

  // ── Seni Rupa SD/MI (Fase C) — sumber CP Kepka BSKAP No. 046/H/KR/2025 ──
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Rupa",
    kelas: "5",
    status: "draft",
    sumber: "CP Seni Rupa Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENIRUPA_FASE_C_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Rupa",
    kelas: "6",
    status: "draft",
    sumber: "CP Seni Rupa Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENIRUPA_FASE_C_TOPIK,
  },

  // ── Seni Tari SD/MI (Fase A) — sumber CP Kepka BSKAP No. 046/H/KR/2025 ──
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Tari",
    kelas: "1",
    status: "draft",
    sumber: "CP Seni Tari Fase A — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENITARI_FASE_A_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Tari",
    kelas: "2",
    status: "draft",
    sumber: "CP Seni Tari Fase A — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENITARI_FASE_A_TOPIK,
  },

  // ── Seni Tari SD/MI (Fase B) — sumber CP Kepka BSKAP No. 046/H/KR/2025 ──
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Tari",
    kelas: "3",
    status: "draft",
    sumber: "CP Seni Tari Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENITARI_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Tari",
    kelas: "4",
    status: "draft",
    sumber: "CP Seni Tari Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENITARI_FASE_B_TOPIK,
  },

  // ── Seni Tari SD/MI (Fase C) — sumber CP Kepka BSKAP No. 046/H/KR/2025 ──
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Tari",
    kelas: "5",
    status: "draft",
    sumber: "CP Seni Tari Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENITARI_FASE_C_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Tari",
    kelas: "6",
    status: "draft",
    sumber: "CP Seni Tari Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENITARI_FASE_C_TOPIK,
  },

  // ── Seni Teater SD/MI (Fase A) — sumber CP Kepka BSKAP No. 046/H/KR/2025 ──
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Teater",
    kelas: "1",
    status: "draft",
    sumber: "CP Seni Teater Fase A — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENITEATER_FASE_A_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Teater",
    kelas: "2",
    status: "draft",
    sumber: "CP Seni Teater Fase A — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENITEATER_FASE_A_TOPIK,
  },

  // ── Seni Teater SD/MI (Fase B) — sumber CP Kepka BSKAP No. 046/H/KR/2025 ──
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Teater",
    kelas: "3",
    status: "draft",
    sumber: "CP Seni Teater Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENITEATER_FASE_B_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Teater",
    kelas: "4",
    status: "draft",
    sumber: "CP Seni Teater Fase B — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENITEATER_FASE_B_TOPIK,
  },

  // ── Seni Teater SD/MI (Fase C) — sumber CP Kepka BSKAP No. 046/H/KR/2025 ──
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Teater",
    kelas: "5",
    status: "draft",
    sumber: "CP Seni Teater Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENITEATER_FASE_C_TOPIK,
  },
  {
    jenjang: "SD/MI",
    kelompok: "Umum/Nasional (Kemendikbud)",
    mapel: "Seni Teater",
    kelas: "6",
    status: "draft",
    sumber: "CP Seni Teater Fase C — Kepka BSKAP No. 046/H/KR/2025",
    topik: SENITEATER_FASE_C_TOPIK,
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
