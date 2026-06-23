import type { LucideIcon } from 'lucide-react';

/** Tipe kolom input yang didukung oleh ToolForm. */
export type FieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'toggle'
  | 'kurikulum';

/** Opsi untuk kolom bertipe select. */
export interface FieldOption {
  label: string;
  value: string;
}

/** Konfigurasi tombol "Isi otomatis" berbasis AI pada sebuah field. */
export interface SuggestConfig {
  /** Teks tombol, mis. "✨ Sarankan". */
  label: string;
  /** 'replace' mengisi langsung; 'list' menampilkan pilihan yang bisa diklik. */
  mode: 'replace' | 'list';
  /** Instruksi inti untuk model AI (konteks ditambahkan otomatis). */
  instruction: string;
}

/** Definisi satu kolom input dari sebuah alat. */
export interface ToolField {
  /** Kunci yang dipakai pada objek inputs. */
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  /** Teks bantuan kecil di bawah label. */
  hint?: string;
  /** Wajib untuk type 'select'. */
  options?: FieldOption[];
  /** Nilai awal (mis. opsi select pertama atau 'false' untuk toggle). */
  defaultValue?: string;
  /** Untuk textarea: jumlah baris awal. */
  rows?: number;
  /** Tombol isi-otomatis AI untuk field ini (opsional). */
  suggest?: SuggestConfig;
  /** Isi default alokasi waktu otomatis menyesuaikan jenjang. */
  autoWaktu?: boolean;
}

/** Definisi lengkap sebuah alat. */
export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Kategori untuk pengelompokan di sidebar. */
  category: string;
  fields: ToolField[];
  /** Teks tombol generate khusus (opsional). */
  ctaLabel?: string;
}

/** Nilai input alat: selalu string (toggle disimpan 'true'/'false'). */
export type ToolInputs = Record<string, string>;

/** Satu entri riwayat hasil. */
export interface HistoryEntry {
  id: string;
  toolId: string;
  toolTitle: string;
  inputs: ToolInputs;
  result: string;
  createdAt: number;
  favorite: boolean;
}
