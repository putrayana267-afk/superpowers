import type {
  BankSoal,
  KunciPg,
  SoalEsai,
  SoalIsian,
  SoalPg,
  ValidationIssue,
  ValidationResult,
} from '../features/tools/bankSoal';

const HURUF: KunciPg[] = ['A', 'B', 'C', 'D', 'E'];

interface Props {
  data: BankSoal;
  validation: ValidationResult;
}

/**
 * Render deterministik hasil Bank Soal (mode JSON v2.1). Layout dikendalikan
 * komponen — TIDAK bergantung newline markdown. RE-NUMBER 1..N per seksi (nomor
 * dari AI hanya advisory). Token warna mengikuti "Akhid Noir" (src/index.css).
 */

/** Teks apa adanya dengan arah otomatis — aman untuk sisipan Arab/dalil. */
function Teks({ children }: { children: string }) {
  return <span dir="auto">{children}</span>;
}

function Banner({ issues }: { issues: ValidationIssue[] }) {
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  if (errors.length === 0 && warnings.length === 0) return null;

  const merah = errors.length > 0;
  const daftar = merah ? [...errors, ...warnings] : warnings;
  return (
    <div
      role="alert"
      className={
        merah
          ? 'mb-3 rounded-xl border border-red-400/50 bg-red-500/10 px-3 py-2 text-xs leading-relaxed text-red-200'
          : 'mb-3 rounded-xl border border-gold/40 bg-gold/10 px-3 py-2 text-xs leading-relaxed text-gold-text'
      }
    >
      <p className="font-semibold">
        {merah
          ? `Draft AI bermasalah — ${errors.length} masalah struktur perlu diperbaiki atau buat ulang.`
          : `${warnings.length} hal perlu dicek guru.`}
      </p>
      <ul className="mt-1 list-disc space-y-0.5 pl-4">
        {daftar.slice(0, 8).map((it, idx) => (
          <li key={idx}>
            {it.lokasi ? `${it.lokasi}: ` : ''}
            {it.message}
          </li>
        ))}
        {daftar.length > 8 && <li>…dan {daftar.length - 8} lainnya.</li>}
      </ul>
    </div>
  );
}

/** Disclaimer "Draft AI" — WAJIB tampil (SPEC §6). */
function DraftBadge() {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-xl border border-gold/40 bg-gold/10 px-3 py-2 text-xs leading-relaxed text-gold-text backdrop-blur">
      <span aria-hidden className="mt-px">
        ⚠️
      </span>
      <p>
        <strong>Draft AI</strong> — dibuat oleh AI, belum terverifikasi. Periksa
        &amp; sesuaikan sebelum dipakai, terutama kunci jawaban, dalil/teks Arab,
        dan kesesuaian kurikulum.
      </p>
    </div>
  );
}

function PgItem({ soal, no }: { soal: SoalPg; no: number }) {
  return (
    <li className="rounded-xl border border-emerald-deep/15 bg-emerald-soft/40 p-3">
      <p className="font-semibold text-ink">
        {no}. <Teks>{soal.pertanyaan}</Teks>
      </p>
      <ul className="mt-2 space-y-1">
        {HURUF.map((h) => (
          <li
            key={h}
            className={
              h === soal.kunci
                ? 'text-sm font-semibold text-emerald-deep'
                : 'text-sm text-ink/85'
            }
          >
            <span className="font-semibold">{h}.</span>{' '}
            <Teks>{soal.opsi?.[h] ?? ''}</Teks>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm">
        <span className="font-semibold text-emerald-deep">Kunci Jawaban:</span>{' '}
        <span className="text-ink">{soal.kunci}</span>
      </p>
      <p className="mt-1 text-sm text-ink/85">
        <span className="font-semibold text-emerald-deep">Pembahasan:</span>{' '}
        <Teks>{soal.pembahasan}</Teks>
      </p>
    </li>
  );
}

function IsianItem({ soal, no }: { soal: SoalIsian; no: number }) {
  return (
    <li className="rounded-xl border border-emerald-deep/15 bg-emerald-soft/40 p-3">
      <p className="font-semibold text-ink">
        {no}. <Teks>{soal.pertanyaan}</Teks>
      </p>
      <p className="mt-2 text-sm">
        <span className="font-semibold text-emerald-deep">Kunci Jawaban:</span>{' '}
        <span className="text-ink">
          <Teks>{soal.kunci}</Teks>
        </span>
      </p>
      <p className="mt-1 text-sm text-ink/85">
        <span className="font-semibold text-emerald-deep">Pembahasan:</span>{' '}
        <Teks>{soal.pembahasan}</Teks>
      </p>
    </li>
  );
}

function EsaiItem({ soal, no }: { soal: SoalEsai; no: number }) {
  const rubrik = Array.isArray(soal.rubrik) ? soal.rubrik : [];
  return (
    <li className="rounded-xl border border-emerald-deep/15 bg-emerald-soft/40 p-3">
      <p className="font-semibold text-ink">
        {no}. <Teks>{soal.pertanyaan}</Teks>
      </p>
      {rubrik.length > 0 && (
        <div className="mt-2 overflow-x-auto">
          <p className="mb-1 text-sm font-semibold text-emerald-deep">
            Rubrik Penilaian:
          </p>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-emerald-deep/20 px-2 py-1 text-left font-semibold text-emerald-deep">
                  Skor
                </th>
                <th className="border border-emerald-deep/20 px-2 py-1 text-left font-semibold text-emerald-deep">
                  Deskriptor
                </th>
              </tr>
            </thead>
            <tbody>
              {rubrik.map((r, j) => (
                <tr key={j}>
                  <td className="border border-emerald-deep/20 px-2 py-1 align-top text-ink">
                    {r.skor}
                  </td>
                  <td className="border border-emerald-deep/20 px-2 py-1 align-top text-ink/85">
                    <Teks>{r.deskriptor}</Teks>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-2 text-sm text-ink/85">
        <span className="font-semibold text-emerald-deep">Pembahasan:</span>{' '}
        <Teks>{soal.pembahasan}</Teks>
      </p>
    </li>
  );
}

export function BankSoalView({ data, validation }: Props) {
  const pg = Array.isArray(data.pilihanGanda) ? data.pilihanGanda : [];
  const isian = Array.isArray(data.isian) ? data.isian : [];
  const esai = Array.isArray(data.esai) ? data.esai : [];

  return (
    <div className="flex-1 overflow-y-auto">
      <Banner issues={validation.issues} />
      <DraftBadge />

      {typeof data.sumber === 'string' && data.sumber.trim().length > 0 && (
        <p className="mb-4 text-sm text-ink/80">
          <span className="font-semibold text-emerald-deep">Sumber:</span>{' '}
          <Teks>{data.sumber}</Teks>
        </p>
      )}

      {pg.length > 0 && (
        <section className="mb-5">
          <h3 className="mb-2 font-display text-lg font-bold text-emerald-deep">
            Pilihan Ganda
          </h3>
          <ol className="space-y-3">
            {pg.map((s, i) => (
              <PgItem key={i} soal={s} no={i + 1} />
            ))}
          </ol>
        </section>
      )}

      {isian.length > 0 && (
        <section className="mb-5">
          <h3 className="mb-2 font-display text-lg font-bold text-emerald-deep">
            Isian
          </h3>
          <ol className="space-y-3">
            {isian.map((s, i) => (
              <IsianItem key={i} soal={s} no={i + 1} />
            ))}
          </ol>
        </section>
      )}

      {esai.length > 0 && (
        <section className="mb-5">
          <h3 className="mb-2 font-display text-lg font-bold text-emerald-deep">
            Esai
          </h3>
          <ol className="space-y-3">
            {esai.map((s, i) => (
              <EsaiItem key={i} soal={s} no={i + 1} />
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

export default BankSoalView;
