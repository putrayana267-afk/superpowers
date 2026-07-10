import { serializeBankSoal } from '../features/tools/bankSoal';
import type { BankSoal } from '../features/tools/bankSoal';

/**
 * Teks pratinjau ringkas untuk daftar (Riwayat & Tersimpan).
 *
 * Bank Soal disimpan sebagai envelope JSON:
 *   { schemaVersion: 'bank-soal-json-v1', jumlahDiminta, soal }
 * Bila envelope terdeteksi -> render `soal` jadi teks terbaca (Sumber, soal, dst).
 * Selain itu (Markdown biasa) -> bersihkan tanda markdown lalu potong (perilaku lama).
 * Konten non-JSON gagal JSON.parse -> otomatis jatuh ke jalur lama.
 */
export function previewText(raw: string, maxLen: number): string {
  const s = (raw ?? '').trim();
  if (s.startsWith('{')) {
    try {
      const env = JSON.parse(s) as { schemaVersion?: unknown; soal?: BankSoal };
      if (env.schemaVersion === 'bank-soal-json-v1' && env.soal) {
        return serializeBankSoal(env.soal).replace(/[#*`>_-]/g, '').slice(0, maxLen);
      }
    } catch {
      // bukan JSON valid -> gunakan jalur Markdown di bawah
    }
  }
  return s.replace(/[#*`>_-]/g, '').slice(0, maxLen);
}
