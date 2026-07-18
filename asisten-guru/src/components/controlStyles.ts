/** Kelas dasar bersama untuk kontrol input (text/textarea/select).
 *  Warna via token — gelap identik nilai lama; placeholder /40 di terang = EXEMPT. */
export const controlBase =
  'w-full rounded-xl border border-control-line bg-emerald-soft/70 px-3.5 py-2.5 text-sm text-ink ' +
  'placeholder:text-ink/40 shadow-sm backdrop-blur transition ' +
  'focus:border-brand-icon focus:bg-emerald-soft focus:outline-none focus:ring-2 focus:ring-brand-icon/30';

/** Kelas tambahan saat kontrol dalam keadaan error. */
export const controlError = 'border-red-400 focus:border-red-500 focus:ring-red-300/40';
