/**
 * Bank Soal v2.1 — pondasi PURE: tipe, schema JSON respons, prompt, parse, serialize.
 *
 * NODE-PURE: dilarang bergantung pada Capacitor / penyimpanan / DOM. Modul ini dipakai
 * kembar oleh jalur web (di-inline di api/generate.ts) & native (src). Acuan: SPEC §1–§3, §5, §7.
 * Tahap 1 = murni; belum ada wiring ke alur generate.
 */
import type { ToolInputs } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Tipe (SPEC §2)
// ─────────────────────────────────────────────────────────────────────────────
export type KunciPg = 'A' | 'B' | 'C' | 'D' | 'E';

export interface SoalPg {
  nomor: number;
  pertanyaan: string;
  opsi: Record<KunciPg, string>;
  kunci: KunciPg;
  pembahasan: string;
}
export interface SoalIsian {
  nomor: number;
  pertanyaan: string; // kalimat rumpang (mengandung _____)
  kunci: string;
  pembahasan: string;
}
export interface RubrikLevel {
  skor: number;
  deskriptor: string;
}
export interface SoalEsai {
  nomor: number;
  pertanyaan: string;
  rubrik: RubrikLevel[];
  pembahasan: string;
}
export interface BankSoal {
  sumber: string;
  pilihanGanda: SoalPg[];
  isian: SoalIsian[];
  esai: SoalEsai[];
}

export type Severity = 'error' | 'warning' | 'info';
export interface ValidationIssue {
  severity: Severity;
  code: string;
  message: string;
  lokasi?: string;
}
export interface ValidationResult {
  ok: boolean; // true = tidak ada issue 'error'
  issues: ValidationIssue[];
}

/** Jumlah yang diminta guru (dari inputs form). */
export interface JumlahDiminta {
  pg: number;
  isian: number;
  esai: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema respons Gemini — OpenAPI subset (SPEC §1). Dikirim hanya saat bank-soal.
// ─────────────────────────────────────────────────────────────────────────────
// <BANKSOAL-PARITY-START>
export const BANKSOAL_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    sumber: { type: 'STRING' },
    pilihanGanda: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          nomor: { type: 'INTEGER' },
          pertanyaan: { type: 'STRING' },
          opsi: {
            type: 'OBJECT',
            properties: {
              A: { type: 'STRING' },
              B: { type: 'STRING' },
              C: { type: 'STRING' },
              D: { type: 'STRING' },
              E: { type: 'STRING' },
            },
            required: ['A', 'B', 'C', 'D', 'E'],
            propertyOrdering: ['A', 'B', 'C', 'D', 'E'],
          },
          kunci: { type: 'STRING', enum: ['A', 'B', 'C', 'D', 'E'] },
          pembahasan: { type: 'STRING' },
        },
        required: ['nomor', 'pertanyaan', 'opsi', 'kunci', 'pembahasan'],
        propertyOrdering: ['nomor', 'pertanyaan', 'opsi', 'kunci', 'pembahasan'],
      },
    },
    isian: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          nomor: { type: 'INTEGER' },
          pertanyaan: { type: 'STRING' },
          kunci: { type: 'STRING' },
          pembahasan: { type: 'STRING' },
        },
        required: ['nomor', 'pertanyaan', 'kunci', 'pembahasan'],
        propertyOrdering: ['nomor', 'pertanyaan', 'kunci', 'pembahasan'],
      },
    },
    esai: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          nomor: { type: 'INTEGER' },
          pertanyaan: { type: 'STRING' },
          rubrik: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                skor: { type: 'INTEGER' },
                deskriptor: { type: 'STRING' },
              },
              required: ['skor', 'deskriptor'],
              propertyOrdering: ['skor', 'deskriptor'],
            },
          },
          pembahasan: { type: 'STRING' },
        },
        required: ['nomor', 'pertanyaan', 'rubrik', 'pembahasan'],
        propertyOrdering: ['nomor', 'pertanyaan', 'rubrik', 'pembahasan'],
      },
    },
  },
  required: ['sumber', 'pilihanGanda', 'isian', 'esai'],
  propertyOrdering: ['sumber', 'pilihanGanda', 'isian', 'esai'],
};

// ─────────────────────────────────────────────────────────────────────────────
// Prompt (SPEC §3). Format ditegakkan schema; prompt fokus ke KONTEN.
// ─────────────────────────────────────────────────────────────────────────────
export const SYSTEM_PROMPT_BANKSOAL =
  'Anda adalah asisten guru penyusun draft soal. Keluarkan HANYA satu objek JSON valid ' +
  'sesuai skema yang diminta. Tanpa markdown, tanpa blok kode, tanpa teks pembuka/penutup.';

export function buildBankSoalUserPrompt(inputs: ToolInputs): string {
  const g = (k: string): string => (inputs[k] ?? '').trim();
  const nPg = g('jumlahPg') || '0';
  const nIsian = g('jumlahIsian') || '0';
  const nEsai = g('jumlahEsai') || '0';
  const kesulitan = g('kesulitan');

  const konteks = ([
    ['Jenjang pendidikan', g('jenjang')],
    ['Kelas/Tingkat', g('kelas')],
    ['Kelompok kurikulum', g('kelompok')],
    ['Mata pelajaran/Rumpun kitab', g('mapel')],
    ['Pokok pembahasan (materi/kitab)', g('pokok')],
    ['Jumlah Pilihan Ganda', nPg],
    ['Jumlah Isian', nIsian],
    ['Jumlah Esai', nEsai],
    ['Tingkat kesulitan kognitif', kesulitan],
  ] as Array<[string, string]>)
    .filter(([, v]) => v.length > 0)
    .map(([label, v]) => `- ${label}: ${v}`)
    .join('\n');

  return (
    `Hasilkan soal dengan komposisi PERSIS: ${nPg} Pilihan Ganda, ${nIsian} Isian, ${nEsai} Esai.\n` +
    'Isi setiap field sesuai skema JSON. Aturan konten:\n' +
    "- Pilihan Ganda: 5 opsi (A–E), TEPAT SATU benar. 'kunci' = huruf opsi yang benar.\n" +
    "  'pembahasan' ringkas menjelaskan mengapa benar.\n" +
    "- Isian: 'pertanyaan' berupa kalimat RUMPANG dengan penanda kosong (_____).\n" +
    "  'kunci' = jawaban sah (sebutkan variasi bila ada). TANPA opsi A–E.\n" +
    "- Esai: 'pertanyaan' terbuka. 'rubrik' = daftar level skor (skor + deskriptor), minimal 2 level.\n" +
    "  'pembahasan' = poin jawaban yang diharapkan.\n" +
    "- 'sumber' = dasar kurikulum/CP dari konteks di bawah.\n" +
    `- Sesuaikan tingkat kognitif (${kesulitan}) serta jenjang, mata pelajaran, dan pokok bahasan di konteks.\n` +
    '- JANGAN menambah teks di luar JSON. JANGAN mengarang data kurikulum.\n' +
    '\n' +
    'Konteks:\n' +
    konteks
  );
}
// <BANKSOAL-PARITY-END>

// ─────────────────────────────────────────────────────────────────────────────
// Parse aman (SPEC §5)
// ─────────────────────────────────────────────────────────────────────────────
export type ParseResult =
  | { ok: true; data: BankSoal }
  | { ok: false; reason: string };

export function safeParseBankSoal(raw: string): ParseResult {
  let s = (raw ?? '').trim();
  // Buang pagar ```json ... ``` bila ada (defensif — mode JSON seharusnya tak berpagar).
  if (s.startsWith('```')) {
    s = s.replace(/^```[a-zA-Z]*\s*/, '').replace(/```$/, '').trim();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(s);
  } catch {
    return { ok: false, reason: 'JSON tidak valid (mungkin terpotong).' };
  }

  const o = parsed as Record<string, unknown> | null;
  if (
    typeof o !== 'object' ||
    o === null ||
    typeof o.sumber !== 'string' ||
    !Array.isArray(o.pilihanGanda) ||
    !Array.isArray(o.isian) ||
    !Array.isArray(o.esai)
  ) {
    return { ok: false, reason: 'Struktur hasil tidak sesuai.' };
  }

  const data = parsed as BankSoal;
  // Koersi ringan tipe nomor/skor ke number (tanpa membuang field lain).
  data.pilihanGanda.forEach((p) => { if (p) p.nomor = Number(p.nomor); });
  data.isian.forEach((it) => { if (it) it.nomor = Number(it.nomor); });
  data.esai.forEach((e) => {
    if (!e) return;
    e.nomor = Number(e.nomor);
    if (Array.isArray(e.rubrik)) e.rubrik.forEach((r) => { if (r) r.skor = Number(r.skor); });
  });

  return { ok: true, data };
}

// ─────────────────────────────────────────────────────────────────────────────
// Serialisasi ke Markdown rapi (SPEC §7) — untuk Salin/.txt/Word (disempurnakan Tahap 7).
// ─────────────────────────────────────────────────────────────────────────────
export function serializeBankSoal(data: BankSoal): string {
  const huruf: KunciPg[] = ['A', 'B', 'C', 'D', 'E'];
  const lines: string[] = [];

  if (typeof data.sumber === 'string' && data.sumber.trim().length > 0) {
    lines.push(`**Sumber:** ${data.sumber.trim()}`, '');
  }

  if (Array.isArray(data.pilihanGanda) && data.pilihanGanda.length > 0) {
    lines.push('## Pilihan Ganda', '');
    data.pilihanGanda.forEach((s, i) => {
      lines.push(`${i + 1}. ${s.pertanyaan}`);
      for (const h of huruf) lines.push(`   ${h}. ${s.opsi?.[h] ?? ''}`);
      lines.push(`   **Kunci Jawaban:** ${s.kunci}`);
      lines.push(`   **Pembahasan:** ${s.pembahasan}`, '');
    });
  }

  if (Array.isArray(data.isian) && data.isian.length > 0) {
    lines.push('## Isian', '');
    data.isian.forEach((s, i) => {
      lines.push(`${i + 1}. ${s.pertanyaan}`);
      lines.push(`   **Kunci Jawaban:** ${s.kunci}`);
      lines.push(`   **Pembahasan:** ${s.pembahasan}`, '');
    });
  }

  if (Array.isArray(data.esai) && data.esai.length > 0) {
    lines.push('## Esai', '');
    data.esai.forEach((s, i) => {
      lines.push(`${i + 1}. ${s.pertanyaan}`);
      lines.push('   **Rubrik Penilaian:**');
      for (const r of s.rubrik ?? []) lines.push(`   - Skor ${r.skor}: ${r.deskriptor}`);
      lines.push(`   **Pembahasan:** ${s.pembahasan}`, '');
    });
  }

  return lines.join('\n').trim();
}
