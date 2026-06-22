import type { LucideIcon } from 'lucide-react';

/** Tipe kolom input yang didukung oleh ToolForm. */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'toggle'
  | 'kurikulum';

/** Opsi untuk kolom bertipe select. */
export interface FieldOption {
  label: string;
  value: string;
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
