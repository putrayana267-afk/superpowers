/**
 * Struktur pemilih kurikulum:
 * Jenjang → Kelompok Kurikulum → Mata Pelajaran/Rumpun Kitab.
 *
 * Dipakai oleh komponen KurikulumSelector. (Data POKOK PEMBAHASAN/topik ada di
 * file terpisah: `kurikulum.ts`.)
 */

/** Satu kelompok mata pelajaran (untuk optgroup pada dropdown). */
export interface MapelGroup {
  label: string;
  mapel: string[];
}

/** Satu jenjang pendidikan beserta daftar mapel umum/nasionalnya. */
export interface KurikulumJenjang {
  nama: string;
  umum: string[];
}

export const JENJANG: KurikulumJenjang[] = [
  {
    nama: 'SD/MI',
    umum: [
      'Pendidikan Agama Islam dan Budi Pekerti',
      'Pendidikan Pancasila',
      'Bahasa Indonesia',
      'Matematika',
      'IPAS',
      'Seni Musik',
      'Seni Rupa',
      'Seni Tari',
      'Seni Teater',
      'PJOK',
      'Bahasa Inggris',
      'Muatan Lokal',
    ],
  },
  {
    nama: 'SMP/MTs',
    umum: [
      'Pendidikan Agama dan Budi Pekerti',
      'Pendidikan Pancasila',
      'Bahasa Indonesia',
      'Matematika',
      'IPA',
      'IPS',
      'Bahasa Inggris',
      'Seni',
      'PJOK',
      'Informatika',
      'Prakarya',
      'Muatan Lokal',
    ],
  },
  {
    nama: 'SMA/MA',
    umum: [
      'Pendidikan Agama dan Budi Pekerti',
      'Pendidikan Pancasila',
      'Bahasa Indonesia',
      'Matematika',
      'Bahasa Inggris',
      'Sejarah',
      'Seni',
      'PJOK',
      'Informatika',
      'Fisika',
      'Kimia',
      'Biologi',
      'Ekonomi',
      'Sosiologi',
      'Geografi',
    ],
  },
  {
    nama: 'SMK',
    umum: [
      'Pendidikan Agama dan Budi Pekerti',
      'Pendidikan Pancasila',
      'Bahasa Indonesia',
      'Matematika',
      'Bahasa Inggris',
      'Sejarah',
      'Seni',
      'PJOK',
      'Informatika',
      'Projek IPAS',
      'Konsentrasi Keahlian',
    ],
  },
];

/** Nama kelompok kurikulum (dipakai sebagai value dropdown). */
export const KELOMPOK_UMUM = 'Umum/Nasional (Kemendikbud)';
export const KELOMPOK_MADRASAH = 'Madrasah (Kemenag/KMA)';
export const KELOMPOK_PESANTREN =
  'Kekhasan Pesantren (Kitab Kuning/Dirasah Islamiyah)';

export const KELOMPOK_NAMES: string[] = [
  KELOMPOK_UMUM,
  KELOMPOK_MADRASAH,
  KELOMPOK_PESANTREN,
];

/** Tambahan mata pelajaran khas Madrasah (di atas mapel umum). */
export const MADRASAH_TAMBAHAN: string[] = [
  "Al-Qur'an Hadis",
  'Akidah Akhlak',
  'Fikih',
  'Sejarah Kebudayaan Islam (SKI)',
  'Bahasa Arab',
];

/** Rumpun kitab/dirasah islamiyah khas pesantren (tidak tergantung jenjang). */
export const PESANTREN_MAPEL: string[] = [
  'Nahwu',
  'Shorof',
  'Balaghah',
  'Mantiq',
  'Fikih',
  'Ushul Fikih',
  'Tauhid/Aqidah',
  'Tafsir',
  'Hadis',
  'Akhlak/Tasawuf',
  'Tarikh',
  'Faraidh',
  "Tajwid/Qira'ah",
];

/** Daftar nama jenjang untuk dropdown pertama. */
export const JENJANG_NAMES: string[] = JENJANG.map((j) => j.nama);

/** Cari jenjang berdasarkan nama (persis). */
export function findJenjang(nama: string): KurikulumJenjang | undefined {
  return JENJANG.find((j) => j.nama === nama);
}

/**
 * Daftar mata pelajaran (dikelompokkan) sesuai jenjang + kelompok kurikulum.
 * Mengembalikan [] bila jenjang belum dipilih (untuk kelompok yang butuh jenjang).
 */
export function getMapelGroups(
  jenjangNama: string,
  kelompokNama: string,
): MapelGroup[] {
  if (kelompokNama === KELOMPOK_PESANTREN) {
    return [{ label: 'Rumpun Kitab', mapel: PESANTREN_MAPEL }];
  }
  const jenjang = findJenjang(jenjangNama);
  if (!jenjang) return [];
  if (kelompokNama === KELOMPOK_MADRASAH) {
    return [
      { label: 'Umum', mapel: jenjang.umum },
      { label: 'Kekhasan Madrasah', mapel: MADRASAH_TAMBAHAN },
    ];
  }
  return [{ label: 'Mata Pelajaran', mapel: jenjang.umum }];
}

/** Opsi kelas/tingkat menyesuaikan jenjang nasional. Kosong utk jenjang lain. */
export function getKelasOptions(jenjangNama: string): string[] {
  switch (jenjangNama) {
    case 'SD/MI':
      return ['1', '2', '3', '4', '5', '6'];
    case 'SMP/MTs':
      return ['7', '8', '9'];
    case 'SMA/MA':
    case 'SMK':
      return ['10', '11', '12'];
    default:
      return [];
  }
}
