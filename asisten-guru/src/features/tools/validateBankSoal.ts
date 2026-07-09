/**
 * Validator struktural deterministik Bank Soal (client) — SPEC §4 + R3.
 *
 * Hanya cek STRUKTUR (bukan kebenaran isi/kunci/ayat). Guru tetap penentu.
 * TIDAK menyentuh status hasil (tetap "Draft AI", dikelola UI).
 *
 * Pin verifikasi (spike):
 *  1. Anti-placeholder men-scan NILAI STRING tiap field saja (bukan JSON.stringify),
 *     agar `isian: []` tak jadi false-positive pola "[]".
 *  2. Pola "contoh:" wajib bertitik-dua; kata "contoh" tanpa titik-dua LOLOS.
 *  3. NOMOR_DUP = keunikan PER-SEKSI (nomor boleh restart tiap seksi).
 */
import type {
  BankSoal,
  JumlahDiminta,
  KunciPg,
  ValidationIssue,
  ValidationResult,
} from './bankSoal';

const HURUF: KunciPg[] = ['A', 'B', 'C', 'D', 'E'];

const kosong = (v: unknown): boolean =>
  typeof v !== 'string' || v.trim().length === 0;

// Pin 2: "contoh:" (bertitik-dua). Pola lain sesuai SPEC §4.
const POLA_PLACEHOLDER = ['todo', 'contoh:', 'masukkan', 'xxx', 'lorem', '[]', '[…]'];
const adaPlaceholder = (s: string): boolean => {
  const low = s.toLowerCase();
  return POLA_PLACEHOLDER.some((p) => low.includes(p));
};

// Blok Arab (dalil/ayat) — jembatan Fase 2; deterministik TAK menilai benar/salah.
const RE_ARAB = /[؀-ۿ]/;

// Penanda rumpang isian: dua garis bawah beruntun atau lebih.
const RE_RUMPANG = /_{2,}/;

export function validateBankSoal(
  data: BankSoal,
  diminta: JumlahDiminta,
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const err = (code: string, message: string, lokasi?: string): void => {
    issues.push({ severity: 'error', code, message, lokasi });
  };
  const warn = (code: string, message: string, lokasi?: string): void => {
    issues.push({ severity: 'warning', code, message, lokasi });
  };

  const pg = Array.isArray(data.pilihanGanda) ? data.pilihanGanda : [];
  const isian = Array.isArray(data.isian) ? data.isian : [];
  const esai = Array.isArray(data.esai) ? data.esai : [];

  // ── Global ──
  if (pg.length !== diminta.pg) {
    err('PG_COUNT_MISMATCH', `Jumlah Pilihan Ganda ${pg.length}, diminta ${diminta.pg}.`);
  }
  if (isian.length !== diminta.isian) {
    err('ISIAN_COUNT_MISMATCH', `Jumlah Isian ${isian.length}, diminta ${diminta.isian}.`);
  }
  if (esai.length !== diminta.esai) {
    err('ESAI_COUNT_MISMATCH', `Jumlah Esai ${esai.length}, diminta ${diminta.esai}.`);
  }
  if (kosong(data.sumber)) {
    err('SUMBER_EMPTY', 'Sumber kosong.');
  }

  // UNKNOWN_FIELD (R3) — key top-level asing → WARNING
  const dikenal = new Set(['sumber', 'pilihanGanda', 'isian', 'esai']);
  for (const k of Object.keys((data as unknown as Record<string, unknown>) ?? {})) {
    if (!dikenal.has(k)) {
      warn('UNKNOWN_FIELD', `Field tak dikenal di tingkat atas: "${k}".`, k);
    }
  }

  // NOMOR_DUP (Pin 3) — keunikan PER-SEKSI, bukan global.
  const cekNomor = (arr: Array<{ nomor?: unknown }>, seksi: string): void => {
    const seen = new Set<number>();
    arr.forEach((it, i) => {
      const n = it?.nomor;
      if (typeof n !== 'number' || !Number.isInteger(n) || n <= 0) {
        warn('NOMOR_DUP', 'Nomor tidak valid (harus bilangan bulat positif).', `${seksi} #${i + 1}`);
        return;
      }
      if (seen.has(n)) {
        warn('NOMOR_DUP', `Nomor ${n} duplikat dalam seksi.`, `${seksi} #${i + 1}`);
      }
      seen.add(n);
    });
  };
  cekNomor(pg, 'PG');
  cekNomor(isian, 'Isian');
  cekNomor(esai, 'Esai');

  // ── Per Pilihan Ganda ──
  pg.forEach((s, i) => {
    const lok = `PG #${i + 1}`;
    if (kosong(s?.pertanyaan)) err('PG_PERTANYAAN_EMPTY', 'Pertanyaan PG kosong.', lok);

    const opsi = (s?.opsi ?? {}) as Record<string, string>;
    let opsiKosong = false;
    for (const h of HURUF) if (kosong(opsi[h])) opsiKosong = true;
    if (opsiKosong) err('PG_OPSI_EMPTY', 'Ada opsi A–E yang kosong.', lok);

    const k = s?.kunci;
    if (typeof k !== 'string' || !HURUF.includes(k as KunciPg)) {
      err('PG_KUNCI_INVALID', 'Kunci bukan salah satu A–E.', lok);
    } else if (kosong(opsi[k])) {
      err('PG_KUNCI_NO_OPTION', `Kunci ${k} menunjuk opsi kosong.`, lok);
    }

    if (kosong(s?.pembahasan)) warn('PG_PEMBAHASAN_EMPTY', 'Pembahasan PG kosong.', lok);
  });

  // ── Per Isian ──
  isian.forEach((s, i) => {
    const lok = `Isian #${i + 1}`;
    if (kosong(s?.pertanyaan)) {
      err('ISIAN_PERTANYAAN_EMPTY', 'Pertanyaan isian kosong.', lok);
    } else if (!RE_RUMPANG.test(s.pertanyaan)) {
      warn('ISIAN_NO_RUMPANG', 'Pertanyaan isian tak memuat penanda rumpang (_____).', lok);
    }
    if (kosong(s?.kunci)) err('ISIAN_KUNCI_EMPTY', 'Kunci isian kosong.', lok);
    if (kosong(s?.pembahasan)) warn('ISIAN_PEMBAHASAN_EMPTY', 'Pembahasan isian kosong.', lok);
    // R3 defensif: isian TIDAK boleh punya field opsi.
    if (s && Object.prototype.hasOwnProperty.call(s, 'opsi')) {
      err('ISIAN_HAS_OPSI', 'Isian tidak boleh punya field opsi (A–E).', lok);
    }
  });

  // ── Per Esai ──
  esai.forEach((s, i) => {
    const lok = `Esai #${i + 1}`;
    if (kosong(s?.pertanyaan)) err('ESAI_PERTANYAAN_EMPTY', 'Pertanyaan esai kosong.', lok);

    const rubrik = Array.isArray(s?.rubrik) ? s.rubrik : [];
    if (rubrik.length < 2) err('ESAI_RUBRIK_TOO_FEW', 'Rubrik esai kurang dari 2 level.', lok);
    rubrik.forEach((r, j) => {
      if (kosong(r?.deskriptor)) {
        err('ESAI_RUBRIK_DESKRIPTOR_EMPTY', 'Deskriptor rubrik kosong.', `${lok} rubrik #${j + 1}`);
      }
    });

    if (kosong(s?.pembahasan)) warn('ESAI_PEMBAHASAN_EMPTY', 'Pembahasan esai kosong.', lok);
    // R3 defensif: esai TIDAK boleh punya field opsi.
    if (s && Object.prototype.hasOwnProperty.call(s, 'opsi')) {
      err('ESAI_HAS_OPSI', 'Esai tidak boleh punya field opsi (A–E).', lok);
    }
  });

  // ── Anti-placeholder & Arab (Pin 1: scan NILAI STRING tiap field, bukan stringify) ──
  const strings: Array<{ v: string; lok: string }> = [];
  const tambah = (v: unknown, lok: string): void => {
    if (typeof v === 'string') strings.push({ v, lok });
  };
  tambah(data.sumber, 'sumber');
  pg.forEach((s, i) => {
    const lok = `PG #${i + 1}`;
    tambah(s?.pertanyaan, lok);
    const opsi = (s?.opsi ?? {}) as Record<string, string>;
    for (const h of HURUF) tambah(opsi[h], `${lok} opsi ${h}`);
    tambah(s?.pembahasan, lok);
  });
  isian.forEach((s, i) => {
    const lok = `Isian #${i + 1}`;
    tambah(s?.pertanyaan, lok);
    tambah(s?.kunci, lok);
    tambah(s?.pembahasan, lok);
  });
  esai.forEach((s, i) => {
    const lok = `Esai #${i + 1}`;
    tambah(s?.pertanyaan, lok);
    tambah(s?.pembahasan, lok);
    (Array.isArray(s?.rubrik) ? s.rubrik : []).forEach((r, j) => {
      tambah(r?.deskriptor, `${lok} rubrik #${j + 1}`);
    });
  });

  for (const { v, lok } of strings) {
    if (adaPlaceholder(v)) {
      err('PLACEHOLDER_LEAK', 'Terdeteksi teks placeholder yang harus dilengkapi.', lok);
    }
    if (RE_ARAB.test(v)) {
      warn('ARAB_PERLU_CEK', 'Terdapat teks Arab — perlu dicek guru (dalil/ayat).', lok);
    }
  }

  const ok = issues.every((it) => it.severity !== 'error');
  return { ok, issues };
}
