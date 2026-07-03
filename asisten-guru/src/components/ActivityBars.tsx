import type { HistoryEntry } from '../features/tools/types';

const DAY_MS = 86_400_000;
const HARI = 14;

/**
 * Aktivitas 14 hari terakhir — dihitung MURNI dari `history[].createdAt`
 * (tanpa data baru, tanpa pustaka, tanpa animasi). Bucket per hari lokal,
 * hari ini di paling kanan. Semua-nol → section disembunyikan (return null).
 */
export function ActivityBars({ history }: { history: HistoryEntry[] }) {
  const now = new Date();
  const startToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();

  const counts = new Array<number>(HARI).fill(0);
  for (const entry of history) {
    const d = new Date(entry.createdAt);
    const startDay = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
    ).getTime();
    // Math.round meredam pergeseran DST (selisih milidetik non-bulat).
    const selisih = Math.round((startToday - startDay) / DAY_MS);
    if (selisih >= 0 && selisih < HARI) counts[HARI - 1 - selisih] += 1;
  }

  const total = counts.reduce((a, b) => a + b, 0);
  if (total === 0) return null; // tak ada aktivitas 14 hari → sembunyikan section

  const max = Math.max(...counts);

  return (
    <div>
      <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">
        Aktivitas
      </h2>
      <div className="rounded-2xl border border-white/10 bg-emerald-soft/60 p-5">
        <div className="flex h-20 items-end gap-1.5">
          {counts.map((n, i) => {
            const hariIni = i === HARI - 1;
            if (n === 0) {
              return (
                <div
                  key={i}
                  aria-hidden
                  className="h-1 flex-1 rounded-full bg-white/10"
                />
              );
            }
            const tinggi = Math.max(12, Math.round((n / max) * 100));
            return (
              <div
                key={i}
                aria-hidden
                className={`flex-1 rounded-full ${
                  hariIni ? 'bg-emerald-primary' : 'bg-emerald-primary/60'
                }`}
                style={{ height: `${tinggi}%` }}
              />
            );
          })}
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-xs text-ink/60">14 hari terakhir</span>
          <span className="font-grotesk text-sm font-bold tabular-nums text-emerald-deep">
            {total}
          </span>
        </div>
      </div>
    </div>
  );
}
