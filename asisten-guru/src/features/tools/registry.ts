import {
  BookOpen,
  ListChecks,
  ClipboardList,
  Table2,
  Sparkles,
  MessageSquareHeart,
  Lightbulb,
  Send,
} from 'lucide-react';
import type { Tool } from './types';

const KELAS_OPTIONS = [
  { label: 'Kelas 1', value: 'Kelas 1' },
  { label: 'Kelas 2', value: 'Kelas 2' },
  { label: 'Kelas 3', value: 'Kelas 3' },
  { label: 'Kelas 4', value: 'Kelas 4' },
  { label: 'Kelas 5', value: 'Kelas 5' },
  { label: 'Kelas 6', value: 'Kelas 6' },
  { label: 'Kelas 7', value: 'Kelas 7' },
  { label: 'Kelas 8', value: 'Kelas 8' },
  { label: 'Kelas 9', value: 'Kelas 9' },
  { label: 'Kelas 10', value: 'Kelas 10' },
  { label: 'Kelas 11', value: 'Kelas 11' },
  { label: 'Kelas 12', value: 'Kelas 12' },
];

const KELAS_FASE_OPTIONS = [
  { label: 'Fase A (Kelas 1–2)', value: 'Fase A (Kelas 1–2)' },
  { label: 'Fase B (Kelas 3–4)', value: 'Fase B (Kelas 3–4)' },
  { label: 'Fase C (Kelas 5–6)', value: 'Fase C (Kelas 5–6)' },
  { label: 'Fase D (Kelas 7–9)', value: 'Fase D (Kelas 7–9)' },
  { label: 'Fase E (Kelas 10)', value: 'Fase E (Kelas 10)' },
  { label: 'Fase F (Kelas 11–12)', value: 'Fase F (Kelas 11–12)' },
];

export const TOOLS: Tool[] = [
  {
    id: 'modul-ajar',
    title: 'Modul Ajar',
    description: 'Susun modul ajar Kurikulum Merdeka lengkap dalam hitungan detik.',
    icon: BookOpen,
    category: 'Perencanaan',
    fields: [
      { id: 'mapel', label: 'Mata pelajaran', type: 'text', required: true, placeholder: 'mis. IPA' },
      { id: 'kelas', label: 'Kelas / Fase', type: 'select', required: true, options: KELAS_FASE_OPTIONS, defaultValue: KELAS_FASE_OPTIONS[3].value },
      { id: 'topik', label: 'Topik', type: 'text', required: true, placeholder: 'mis. Sistem Pencernaan Manusia' },
      { id: 'waktu', label: 'Alokasi waktu', type: 'text', required: true, placeholder: 'mis. 2 x 40 menit' },
      { id: 'catatan', label: 'Catatan tambahan', type: 'textarea', placeholder: 'mis. kelas inklusif, fokus pada praktik', rows: 3 },
      { id: 'islami', label: 'Integrasi nilai Islami', type: 'toggle', hint: 'Sisipkan nilai keislaman yang relevan', defaultValue: 'false' },
    ],
    ctaLabel: 'Buat Modul Ajar',
  },
  {
    id: 'bank-soal',
    title: 'Bank Soal',
    description: 'Hasilkan soal lengkap dengan kunci jawaban dan poin penilaian.',
    icon: ListChecks,
    category: 'Asesmen',
    fields: [
      { id: 'mapel', label: 'Mata pelajaran', type: 'text', required: true, placeholder: 'mis. Matematika' },
      { id: 'kelas', label: 'Kelas', type: 'select', required: true, options: KELAS_OPTIONS, defaultValue: 'Kelas 7' },
      { id: 'topik', label: 'Topik', type: 'text', required: true, placeholder: 'mis. Bilangan Bulat' },
      {
        id: 'jenis',
        label: 'Jenis soal',
        type: 'select',
        required: true,
        options: [
          { label: 'Pilihan Ganda', value: 'Pilihan Ganda' },
          { label: 'Esai', value: 'Esai' },
          { label: 'Isian', value: 'Isian' },
          { label: 'Campuran', value: 'Campuran' },
        ],
        defaultValue: 'Pilihan Ganda',
      },
      {
        id: 'jumlah',
        label: 'Jumlah soal',
        type: 'select',
        required: true,
        options: [
          { label: '5 soal', value: '5' },
          { label: '10 soal', value: '10' },
          { label: '15 soal', value: '15' },
        ],
        defaultValue: '10',
      },
      {
        id: 'kesulitan',
        label: 'Tingkat kesulitan',
        type: 'select',
        required: true,
        options: [
          { label: 'Mudah', value: 'Mudah' },
          { label: 'Sedang', value: 'Sedang' },
          { label: 'Sulit', value: 'Sulit' },
          { label: 'HOTS', value: 'HOTS' },
        ],
        defaultValue: 'Sedang',
      },
    ],
    ctaLabel: 'Buat Soal',
  },
  {
    id: 'lkpd',
    title: 'LKPD',
    description: 'Lembar Kerja Peserta Didik yang terstruktur dan siap cetak.',
    icon: ClipboardList,
    category: 'Perencanaan',
    fields: [
      { id: 'mapel', label: 'Mata pelajaran', type: 'text', required: true, placeholder: 'mis. IPA' },
      { id: 'kelas', label: 'Kelas', type: 'select', required: true, options: KELAS_OPTIONS, defaultValue: 'Kelas 5' },
      { id: 'topik', label: 'Topik', type: 'text', required: true, placeholder: 'mis. Rangkaian Listrik Sederhana' },
      { id: 'tujuan', label: 'Tujuan', type: 'textarea', required: true, placeholder: 'mis. siswa dapat merangkai lampu seri & paralel', rows: 2 },
      {
        id: 'aktivitas',
        label: 'Jenis aktivitas',
        type: 'select',
        required: true,
        options: [
          { label: 'Individu', value: 'Individu' },
          { label: 'Kelompok', value: 'Kelompok' },
          { label: 'Eksperimen', value: 'Eksperimen' },
        ],
        defaultValue: 'Kelompok',
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
      { id: 'tugas', label: 'Tugas/kegiatan yang dinilai', type: 'text', required: true, placeholder: 'mis. Presentasi Kelompok' },
      { id: 'kelas', label: 'Kelas', type: 'select', required: true, options: KELAS_OPTIONS, defaultValue: 'Kelas 8' },
      { id: 'aspek', label: 'Aspek yang ingin dinilai', type: 'textarea', required: true, placeholder: 'mis. isi, penyampaian, kerja sama', rows: 2 },
      { id: 'skala', label: 'Skala penilaian', type: 'text', required: true, placeholder: 'mis. 1–4', defaultValue: '1–4' },
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
      { id: 'materi', label: 'Materi yang ingin disederhanakan', type: 'textarea', required: true, placeholder: 'Tempel materi di sini...', rows: 6 },
      { id: 'kelas', label: 'Untuk kelas', type: 'select', required: true, options: KELAS_OPTIONS, defaultValue: 'Kelas 4' },
      {
        id: 'gaya',
        label: 'Gaya penjelasan',
        type: 'select',
        required: true,
        options: [
          { label: 'Penjelasan sederhana', value: 'Penjelasan sederhana' },
          { label: 'Analogi', value: 'Analogi' },
          { label: 'Poin ringkas', value: 'Poin ringkas' },
          { label: 'Cerita', value: 'Cerita' },
        ],
        defaultValue: 'Penjelasan sederhana',
      },
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
      { id: 'nama', label: 'Nama siswa', type: 'text', placeholder: 'opsional' },
      { id: 'aspek', label: 'Aspek / mata pelajaran', type: 'text', required: true, placeholder: 'mis. Bahasa Indonesia' },
      { id: 'catatan', label: 'Catatan tentang siswa', type: 'textarea', required: true, placeholder: 'mis. aktif bertanya, perlu latihan menulis', rows: 3 },
      {
        id: 'nada',
        label: 'Nada',
        type: 'select',
        required: true,
        options: [
          { label: 'Apresiatif', value: 'Apresiatif' },
          { label: 'Membangun', value: 'Membangun' },
          { label: 'Formal', value: 'Formal' },
        ],
        defaultValue: 'Apresiatif',
      },
      { id: 'islami', label: 'Nuansa Islami', type: 'toggle', hint: 'Sisipkan nuansa keislaman yang santun', defaultValue: 'false' },
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
      { id: 'tema', label: 'Mapel / tema', type: 'text', required: true, placeholder: 'mis. Kerja Sama' },
      { id: 'kelas', label: 'Kelas', type: 'select', required: true, options: KELAS_OPTIONS, defaultValue: 'Kelas 3' },
      { id: 'tujuan', label: 'Tujuan', type: 'text', required: true, placeholder: 'mis. mencairkan suasana & melatih fokus' },
      {
        id: 'jenis',
        label: 'Jenis kegiatan',
        type: 'select',
        required: true,
        options: [
          { label: 'Ice breaker', value: 'Ice breaker' },
          { label: 'Kelompok', value: 'Kegiatan kelompok' },
          { label: 'Permainan edukatif', value: 'Permainan edukatif' },
          { label: 'Proyek mini', value: 'Proyek mini' },
        ],
        defaultValue: 'Ice breaker',
      },
    ],
    ctaLabel: 'Buat Ide',
  },
  {
    id: 'komunikasi-ortu',
    title: 'Komunikasi Orang Tua',
    description: 'Draf pesan WhatsApp atau surat yang sopan dan jelas.',
    icon: Send,
    category: 'Komunikasi',
    fields: [
      { id: 'tujuan', label: 'Tujuan pesan', type: 'text', required: true, placeholder: 'mis. info kemajuan belajar' },
      { id: 'konteks', label: 'Konteks singkat', type: 'textarea', required: true, placeholder: 'mis. nilai membaik, kehadiran perlu diperhatikan', rows: 3 },
      {
        id: 'kanal',
        label: 'Kanal',
        type: 'select',
        required: true,
        options: [
          { label: 'WhatsApp', value: 'WhatsApp' },
          { label: 'Surat', value: 'Surat' },
        ],
        defaultValue: 'WhatsApp',
      },
      {
        id: 'nada',
        label: 'Nada',
        type: 'select',
        required: true,
        options: [
          { label: 'Ramah', value: 'Ramah' },
          { label: 'Formal', value: 'Formal' },
        ],
        defaultValue: 'Ramah',
      },
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
