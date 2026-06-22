import {
  BookOpen,
  ListChecks,
  ClipboardList,
  Table2,
  Sparkles,
  MessageSquareHeart,
  Lightbulb,
  Send,
  LayoutGrid,
} from 'lucide-react';
import type { Tool, ToolField } from './types';

/** Field pemilih kurikulum bertingkat (Jenjang → Kelompok → Mapel → Pokok). */
const KURIKULUM_FIELD: ToolField = {
  id: 'kurikulum',
  label: 'Kurikulum',
  type: 'kurikulum',
  required: true,
};

const PROFIL_OPTIONS = [
  { label: 'Beriman, Bertakwa & Berakhlak Mulia', value: 'Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia' },
  { label: 'Berkebinekaan Global', value: 'Berkebinekaan Global' },
  { label: 'Bergotong Royong', value: 'Bergotong Royong' },
  { label: 'Mandiri', value: 'Mandiri' },
  { label: 'Bernalar Kritis', value: 'Bernalar Kritis' },
  { label: 'Kreatif', value: 'Kreatif' },
];

const KESULITAN_OPTIONS = [
  { label: 'Mudah (C1–C2)', value: 'Mudah (C1-C2)' },
  { label: 'Sedang (C3–C4)', value: 'Sedang (C3-C4)' },
  { label: 'Sulit (C5–C6)', value: 'Sulit (C5-C6)' },
];

const METODE_OPTIONS = [
  { label: 'Diskusi Kelompok', value: 'Diskusi Kelompok' },
  { label: 'Inkuiri', value: 'Inkuiri' },
  { label: 'Discovery Learning', value: 'Discovery Learning' },
  { label: 'Problem Based Learning', value: 'Problem Based Learning' },
  { label: 'Project Based Learning', value: 'Project Based Learning' },
  { label: 'Eksperimen', value: 'Eksperimen' },
  { label: 'Demonstrasi', value: 'Demonstrasi' },
  { label: 'Tanya Jawab', value: 'Tanya Jawab' },
];

const LEVEL_SKOR_OPTIONS = [
  { label: '3 Level', value: '3 Level' },
  { label: '4 Level', value: '4 Level' },
  { label: '5 Level', value: '5 Level' },
];

const GAYA_OPTIONS = [
  { label: 'Bercerita/Storytelling', value: 'Bercerita/Storytelling' },
  { label: 'Formal', value: 'Formal' },
  { label: 'Sederhana', value: 'Sederhana' },
];

const JENIS_KEGIATAN_OPTIONS = [
  { label: 'Game Fisik & Kinestetik', value: 'Game Fisik & Kinestetik' },
  { label: 'Diskusi', value: 'Diskusi' },
  { label: 'Proyek', value: 'Proyek' },
  { label: 'Eksperimen', value: 'Eksperimen' },
];

const TUJUAN_PESAN_OPTIONS = [
  { label: 'Info Kemajuan Belajar', value: 'Info Kemajuan Belajar' },
  { label: 'Pengingat', value: 'Pengingat' },
  { label: 'Undangan', value: 'Undangan' },
  { label: 'Pemberitahuan', value: 'Pemberitahuan' },
  { label: 'Apresiasi', value: 'Apresiasi' },
  { label: 'Tindak Lanjut Perilaku', value: 'Tindak Lanjut Perilaku' },
];

const SALURAN_OPTIONS = [
  { label: 'WhatsApp', value: 'WhatsApp' },
  { label: 'Email', value: 'Email' },
];

const BENTUK_SOAL_OPTIONS = [
  { label: 'Pilihan Ganda', value: 'Pilihan Ganda' },
  { label: 'Esai', value: 'Esai' },
  { label: 'Campuran', value: 'Campuran' },
];

export const TOOLS: Tool[] = [
  {
    id: 'modul-ajar',
    title: 'Modul Ajar',
    description: 'Susun modul ajar Kurikulum Merdeka lengkap dalam hitungan detik.',
    icon: BookOpen,
    category: 'Perencanaan',
    fields: [
      KURIKULUM_FIELD,
      {
        id: 'waktu',
        label: 'Alokasi Waktu',
        type: 'text',
        required: true,
        placeholder: 'mis. 2 × 40 menit',
        autoWaktu: true,
        suggest: {
          label: 'Sarankan',
          mode: 'replace',
          instruction:
            "Sarankan satu alokasi waktu pembelajaran yang wajar untuk konteks di atas. " +
            "Jawab singkat dalam format seperti '2 × 40 menit' atau '3 JP'. Hanya jawabannya, tanpa penjelasan.",
        },
      },
      { id: 'profil', label: 'Profil Pelajar Pancasila', type: 'select', required: true, options: PROFIL_OPTIONS, defaultValue: PROFIL_OPTIONS[4].value },
    ],
    ctaLabel: 'Buat Modul Ajar',
  },
  {
    id: 'bank-soal',
    title: 'Bank Soal',
    description: 'Hasilkan soal lengkap dengan kunci jawaban dan pembahasan.',
    icon: ListChecks,
    category: 'Asesmen',
    fields: [
      KURIKULUM_FIELD,
      { id: 'jumlah', label: 'Jumlah Soal', type: 'number', required: true, defaultValue: '5', placeholder: '5' },
      { id: 'kesulitan', label: 'Tingkat Kesulitan Kognitif', type: 'select', required: true, options: KESULITAN_OPTIONS, defaultValue: 'Sedang (C3-C4)' },
    ],
    ctaLabel: 'Buat Soal',
  },
  {
    id: 'kisi-kisi',
    title: 'Kisi-kisi Soal',
    description: 'Susun tabel kisi-kisi lengkap dengan indikator & level kognitif.',
    icon: LayoutGrid,
    category: 'Asesmen',
    fields: [
      KURIKULUM_FIELD,
      { id: 'jumlah', label: 'Jumlah Soal', type: 'number', required: true, defaultValue: '10', placeholder: '10' },
      { id: 'bentuk', label: 'Bentuk Soal', type: 'select', required: true, options: BENTUK_SOAL_OPTIONS, defaultValue: 'Pilihan Ganda' },
    ],
    ctaLabel: 'Buat Kisi-kisi',
  },
  {
    id: 'lkpd',
    title: 'LKPD',
    description: 'Lembar Kerja Peserta Didik yang terstruktur dan siap cetak.',
    icon: ClipboardList,
    category: 'Perencanaan',
    fields: [
      KURIKULUM_FIELD,
      { id: 'metode', label: 'Metode Pembelajaran', type: 'select', required: true, options: METODE_OPTIONS, defaultValue: 'Diskusi Kelompok' },
      {
        id: 'petunjuk',
        label: 'Petunjuk Singkat Kegiatan',
        type: 'textarea',
        required: true,
        placeholder: 'mis. siswa berkelompok merangkai rangkaian listrik sederhana',
        rows: 3,
        suggest: {
          label: '✨ Buat otomatis',
          mode: 'replace',
          instruction:
            'Susun petunjuk singkat kegiatan LKPD (2-4 kalimat) berdasarkan mata pelajaran, ' +
            'pokok pembahasan, dan metode pembelajaran di atas. Praktis dan langsung diterapkan. Hanya petunjuknya.',
        },
      },
    ],
    ctaLabel: 'Buat LKPD',
  },
  {
    id: 'rubrik',
    title: 'Rubrik Penilaian',
    description: 'Tabel rubrik dengan deskriptor jelas dan cara hitung nilai.',
    icon: Table2,
    category: 'Asesmen',
    fields: [
      KURIKULUM_FIELD,
      {
        id: 'tugas',
        label: 'Tugas/Proyek yang Dinilai',
        type: 'text',
        required: true,
        placeholder: 'mis. Presentasi Kelompok',
        suggest: {
          label: '✨ Sarankan',
          mode: 'replace',
          instruction:
            'Usulkan SATU judul tugas/proyek yang relevan untuk dinilai sesuai konteks di atas. ' +
            'Jawab singkat dalam satu baris, hanya judul tugasnya.',
        },
      },
      {
        id: 'fokus',
        label: 'Fokus Kriteria',
        type: 'textarea',
        required: true,
        placeholder: 'mis. isi, penyampaian, kerja sama',
        rows: 2,
        suggest: {
          label: '✨ Sarankan',
          mode: 'replace',
          instruction:
            'Usulkan poin-poin fokus kriteria penilaian (3-5 poin) untuk tugas dan konteks di atas. ' +
            'Jawab sebagai daftar singkat, satu poin per baris.',
        },
      },
      { id: 'level', label: 'Jumlah Level Skor', type: 'select', required: true, options: LEVEL_SKOR_OPTIONS, defaultValue: '4 Level' },
    ],
    ctaLabel: 'Buat Rubrik',
  },
  {
    id: 'sederhana',
    title: 'Penyederhana Materi',
    description: 'Ubah materi rumit menjadi penjelasan yang mudah dipahami.',
    icon: Sparkles,
    category: 'Materi',
    fields: [
      KURIKULUM_FIELD,
      { id: 'gaya', label: 'Gaya Bahasa / Tone', type: 'select', required: true, options: GAYA_OPTIONS, defaultValue: 'Sederhana' },
    ],
    ctaLabel: 'Sederhanakan',
  },
  {
    id: 'rapor',
    title: 'Komentar Rapor',
    description: 'Deskripsi capaian yang apresiatif dan membangun.',
    icon: MessageSquareHeart,
    category: 'Komunikasi',
    fields: [
      KURIKULUM_FIELD,
      { id: 'nama', label: 'Nama Siswa', type: 'text', placeholder: 'opsional' },
      { id: 'capaian', label: 'Capaian Terbaik', type: 'textarea', required: true, placeholder: 'mis. aktif bertanya, cepat memahami konsep', rows: 3 },
      { id: 'peningkatan', label: 'Aspek Perlu Ditingkatkan', type: 'textarea', required: true, placeholder: 'mis. perlu latihan menulis rapi', rows: 3 },
    ],
    ctaLabel: 'Buat Komentar',
  },
  {
    id: 'ide-kegiatan',
    title: 'Ide Kegiatan & Ice Breaker',
    description: 'Empat ide kegiatan seru, aman, dan hemat biaya.',
    icon: Lightbulb,
    category: 'Materi',
    fields: [
      KURIKULUM_FIELD,
      { id: 'jenis', label: 'Jenis Kegiatan', type: 'select', required: true, options: JENIS_KEGIATAN_OPTIONS, defaultValue: 'Game Fisik & Kinestetik' },
    ],
    ctaLabel: 'Buat Ide',
  },
  {
    id: 'komunikasi-ortu',
    title: 'Komunikasi Orang Tua',
    description: 'Draf pesan WhatsApp atau email yang sopan dan jelas.',
    icon: Send,
    category: 'Komunikasi',
    fields: [
      KURIKULUM_FIELD,
      { id: 'nama', label: 'Nama Murid', type: 'text', required: true, placeholder: 'mis. Ahmad' },
      { id: 'tujuan', label: 'Tujuan Pesan', type: 'select', required: true, options: TUJUAN_PESAN_OPTIONS, defaultValue: 'Info Kemajuan Belajar' },
      { id: 'saluran', label: 'Saluran', type: 'select', required: true, options: SALURAN_OPTIONS, defaultValue: 'WhatsApp' },
      { id: 'catatan', label: 'Catatan Spesifik', type: 'textarea', required: true, placeholder: 'mis. nilai membaik, kehadiran perlu diperhatikan', rows: 3 },
    ],
    ctaLabel: 'Buat Pesan',
  },
];

/** Cari alat berdasarkan id. */
export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id);
}

/** Daftar kategori unik sesuai urutan kemunculan. */
export function getCategories(): string[] {
  const seen: string[] = [];
  for (const tool of TOOLS) {
    if (!seen.includes(tool.category)) seen.push(tool.category);
  }
  return seen;
}
