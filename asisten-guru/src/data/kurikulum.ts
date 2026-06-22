/**
 * Data kurikulum (Kurikulum Merdeka) untuk pemilih bertingkat:
 * Jenjang → Mata Pelajaran → Kelas/Fase.
 *
 * Dipakai oleh komponen KurikulumSelector. Tiap jenjang punya daftar kelas/fase
 * dan daftar mata pelajaran yang dikelompokkan (Umum, Madrasah, Pilihan, dll.).
 */

/** Satu kelompok mata pelajaran (mis. "Umum", "Madrasah (MI)"). */
export interface MapelGroup {
  label: string;
  mapel: string[];
}

/** Satu jenjang pendidikan beserta kelas/fase dan mata pelajarannya. */
export interface KurikulumJenjang {
  nama: string;
  /** Label untuk dropdown kelas (mis. "Kelas / Fase" atau "Tingkat"). */
  kelasLabel: string;
  kelas: string[];
  mapelGroups: MapelGroup[];
}

export const KURIKULUM: KurikulumJenjang[] = [
  {
    nama: 'SD/MI',
    kelasLabel: 'Kelas / Fase',
    kelas: [
      'Kelas 1 (Fase A)',
      'Kelas 2 (Fase A)',
      'Kelas 3 (Fase B)',
      'Kelas 4 (Fase B)',
      'Kelas 5 (Fase C)',
      'Kelas 6 (Fase C)',
    ],
    mapelGroups: [
      {
        label: 'Umum',
        mapel: [
          'Pendidikan Agama Islam dan Budi Pekerti',
          'Pendidikan Pancasila',
          'Bahasa Indonesia',
          'Matematika',
          'IPAS',
          'Seni Rupa',
          'Seni Musik',
          'Seni Tari',
          'Seni Teater',
          'PJOK',
          'Bahasa Inggris',
          'Muatan Lokal/Bahasa Daerah',
        ],
      },
      {
        label: 'Madrasah (MI)',
        mapel: [
          "Al-Qur'an Hadis",
          'Akidah Akhlak',
          'Fikih',
          'Sejarah Kebudayaan Islam (SKI)',
          'Bahasa Arab',
        ],
      },
    ],
  },
  {
    nama: 'SMP/MTs',
    kelasLabel: 'Kelas / Fase',
    kelas: ['Kelas 7 (Fase D)', 'Kelas 8 (Fase D)', 'Kelas 9 (Fase D)'],
    mapelGroups: [
      {
        label: 'Umum',
        mapel: [
          'Pendidikan Agama dan Budi Pekerti',
          'Pendidikan Pancasila',
          'Bahasa Indonesia',
          'Matematika',
          'IPA',
          'IPS',
          'Bahasa Inggris',
          'PJOK',
          'Informatika',
          'Seni Budaya',
          'Prakarya',
          'Muatan Lokal',
        ],
      },
      {
        label: 'Madrasah (MTs)',
        mapel: [
          "Al-Qur'an Hadis",
          'Akidah Akhlak',
          'Fikih',
          'SKI',
          'Bahasa Arab',
        ],
      },
    ],
  },
  {
    nama: 'SMA/MA',
    kelasLabel: 'Kelas / Fase',
    kelas: ['Kelas 10 (Fase E)', 'Kelas 11 (Fase F)', 'Kelas 12 (Fase F)'],
    mapelGroups: [
      {
        label: 'Umum',
        mapel: [
          'Pendidikan Agama dan Budi Pekerti',
          'Pendidikan Pancasila',
          'Bahasa Indonesia',
          'Matematika',
          'Bahasa Inggris',
          'PJOK',
          'Sejarah',
          'Informatika',
          'Seni Budaya',
          'Prakarya dan Kewirausahaan',
        ],
      },
      {
        label: 'Pilihan',
        mapel: [
          'Fisika',
          'Kimia',
          'Biologi',
          'Ekonomi',
          'Sosiologi',
          'Geografi',
          'Antropologi',
          'Matematika Tingkat Lanjut',
          'Bahasa Indonesia Tingkat Lanjut',
          'Bahasa Inggris Tingkat Lanjut',
          'Bahasa Arab',
          'Bahasa Mandarin',
          'Bahasa Jepang',
          'Bahasa Jerman',
          'Bahasa Prancis',
          'Bahasa Korea',
        ],
      },
      {
        label: 'Madrasah (MA)',
        mapel: [
          "Al-Qur'an Hadis",
          'Akidah Akhlak',
          'Fikih',
          'SKI',
          'Bahasa Arab',
        ],
      },
      {
        label: 'MA Keagamaan',
        mapel: [
          'Tafsir-Ilmu Tafsir',
          'Hadis-Ilmu Hadis',
          'Fikih-Ushul Fikih',
          'Ilmu Kalam',
          'Akhlak Tasawuf',
          'Bahasa Arab Lanjut',
        ],
      },
    ],
  },
  {
    nama: 'SMK',
    kelasLabel: 'Kelas / Fase',
    kelas: ['Kelas 10 (Fase E)', 'Kelas 11 (Fase F)', 'Kelas 12 (Fase F)'],
    mapelGroups: [
      {
        label: 'Umum',
        mapel: [
          'Pendidikan Agama dan Budi Pekerti',
          'Pendidikan Pancasila',
          'Bahasa Indonesia',
          'Matematika',
          'Bahasa Inggris',
          'PJOK',
          'Sejarah',
          'Seni Budaya',
        ],
      },
      {
        label: 'Kejuruan umum',
        mapel: [
          'Informatika',
          'Projek IPAS',
          'Dasar-dasar Program Keahlian',
          'Konsentrasi Keahlian',
          'Projek Kreatif dan Kewirausahaan (PKK)',
          'Praktik Kerja Lapangan (PKL)',
          'Mata Pelajaran Pilihan',
        ],
      },
    ],
  },
  {
    nama: 'Pondok/Diniyah',
    kelasLabel: 'Tingkat',
    kelas: ['Ula', 'Wustha', 'Ulya'],
    mapelGroups: [
      {
        label: 'Mata Pelajaran',
        mapel: [
          "Al-Qur'an (Tahfidz/Tajwid/Tilawah)",
          'Tafsir',
          'Hadis',
          'Akidah/Tauhid',
          'Fikih',
          'Ushul Fikih',
          'Akhlak/Tasawuf',
          'Tarikh/SKI',
          'Bahasa Arab',
          'Nahwu',
          'Shorof',
          'Balaghah',
          'Mahfudzot',
          "Muthola'ah",
          "Imla'",
        ],
      },
    ],
  },
];

/** Daftar nama jenjang untuk dropdown pertama. */
export const JENJANG_NAMES: string[] = KURIKULUM.map((j) => j.nama);

/** Cari jenjang berdasarkan nama (persis). */
export function findJenjang(nama: string): KurikulumJenjang | undefined {
  return KURIKULUM.find((j) => j.nama === nama);
}
