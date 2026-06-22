import type { Tool, ToolInputs } from '../features/tools/types';

/** Label ramah untuk kunci kurikulum (yang dikelola KurikulumSelector). */
const KURIKULUM_LABELS: Record<string, string> = {
  jenjang: 'Jenjang',
  kelompok: 'Kelompok Kurikulum',
  mapel: 'Mata Pelajaran',
  pokok: 'Pokok Pembahasan',
};

/**
 * Bangun konteks (label → nilai) dari input alat aktif untuk dikirim ke
 * /api/suggest. `excludeKey` menghilangkan field target agar tidak membiasi.
 */
export function buildSuggestContext(
  tool: Tool,
  inputs: ToolInputs,
  excludeKey?: string,
): Record<string, string> {
  const ctx: Record<string, string> = {};

  for (const [key, label] of Object.entries(KURIKULUM_LABELS)) {
    if (key === excludeKey) continue;
    const value = (inputs[key] ?? '').trim();
    if (value) ctx[label] = value;
  }

  for (const field of tool.fields) {
    if (field.type === 'kurikulum' || field.type === 'toggle') continue;
    if (field.id === excludeKey) continue;
    const value = (inputs[field.id] ?? '').trim();
    if (value) ctx[field.label] = value;
  }

  return ctx;
}
