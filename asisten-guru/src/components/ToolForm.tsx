import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import type { Tool, ToolInputs } from '../features/tools/types';
import { Field } from './Field';
import { Select } from './Select';
import { TextArea } from './TextArea';
import { Toggle } from './Toggle';
import { Button } from './Button';
import { KurikulumSelector } from './KurikulumSelector';
import { FieldSuggest } from './FieldSuggest';
import { cn } from '../lib/cn';
import { controlBase, controlError } from './controlStyles';
import { buildSuggestContext } from '../lib/suggestContext';

/** Kunci input yang dikelola oleh field bertipe 'kurikulum'. */
const KURIKULUM_KEYS = ['jenjang', 'kelompok', 'mapel', 'pokok'] as const;

/** Default alokasi waktu menyesuaikan jenjang. */
function defaultAlokasiWaktu(jenjang: string): string {
  if (jenjang.startsWith('SD')) return '2 × 35 menit';
  if (jenjang.startsWith('SMP')) return '2 × 40 menit';
  if (jenjang.startsWith('SMA') || jenjang.startsWith('SMK')) {
    return '2 × 45 menit';
  }
  return '';
}

interface ToolFormProps {
  tool: Tool;
  inputs: ToolInputs;
  onChange: (id: string, value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function ToolForm({
  tool,
  inputs,
  onChange,
  onSubmit,
  loading,
}: ToolFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Isi default alokasi waktu otomatis saat jenjang dipilih (bila masih kosong).
  const jenjang = inputs.jenjang ?? '';
  useEffect(() => {
    const waktuField = tool.fields.find((f) => f.autoWaktu);
    if (!waktuField) return;
    if (jenjang && !(inputs[waktuField.id] ?? '').trim()) {
      const def = defaultAlokasiWaktu(jenjang);
      if (def) onChange(waktuField.id, def);
    }
    // Hanya bereaksi terhadap perubahan jenjang & alat aktif.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jenjang, tool.id]);

  function validate(): boolean {
    const next: Record<string, string> = {};
    for (const field of tool.fields) {
      if (field.type === 'kurikulum') {
        for (const key of KURIKULUM_KEYS) {
          if (!(inputs[key] ?? '').trim()) {
            next[key] = 'Wajib dipilih.';
          }
        }
        continue;
      }
      if (field.required && field.type !== 'toggle') {
        const value = (inputs[field.id] ?? '').trim();
        if (!value) {
          next[field.id] = 'Kolom ini wajib diisi.';
        }
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (validate()) {
      onSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {tool.fields.map((field) => {
        const value = inputs[field.id] ?? '';
        const error = errors[field.id];
        const describedBy = error
          ? `${field.id}-error`
          : field.hint
            ? `${field.id}-hint`
            : undefined;

        if (field.type === 'kurikulum') {
          return (
            <KurikulumSelector
              key={field.id}
              value={{
                jenjang: inputs.jenjang ?? '',
                kelompok: inputs.kelompok ?? '',
                mapel: inputs.mapel ?? '',
                kelas: inputs.kelas ?? '',
                pokok: inputs.pokok ?? '',
              }}
              onChange={(key, val) => onChange(key, val)}
              errors={{
                jenjang: errors.jenjang,
                kelompok: errors.kelompok,
                mapel: errors.mapel,
                pokok: errors.pokok,
              }}
            />
          );
        }

        if (field.type === 'toggle') {
          return (
            <Toggle
              key={field.id}
              id={field.id}
              label={field.label}
              hint={field.hint}
              checked={value === 'true'}
              onChange={(checked) => onChange(field.id, String(checked))}
            />
          );
        }

        return (
          <Field
            key={field.id}
            id={field.id}
            label={field.label}
            required={field.required}
            hint={field.hint}
            error={error}
          >
            {field.type === 'select' && field.options ? (
              <Select
                id={field.id}
                options={field.options}
                value={value}
                invalid={Boolean(error)}
                aria-required={field.required}
                aria-describedby={describedBy}
                onChange={(e) => onChange(field.id, e.target.value)}
              />
            ) : field.type === 'textarea' ? (
              <TextArea
                id={field.id}
                value={value}
                rows={field.rows}
                placeholder={field.placeholder}
                invalid={Boolean(error)}
                aria-required={field.required}
                aria-describedby={describedBy}
                onChange={(e) => onChange(field.id, e.target.value)}
              />
            ) : field.type === 'number' ? (
              <input
                id={field.id}
                type="number"
                min={1}
                value={value}
                placeholder={field.placeholder}
                aria-required={field.required}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy}
                onChange={(e) => onChange(field.id, e.target.value)}
                className={cn(controlBase, error && controlError)}
              />
            ) : (
              <input
                id={field.id}
                type="text"
                value={value}
                placeholder={field.placeholder}
                aria-required={field.required}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy}
                onChange={(e) => onChange(field.id, e.target.value)}
                className={cn(controlBase, error && controlError)}
              />
            )}

            {field.suggest && (
              <FieldSuggest
                label={field.suggest.label}
                instruction={field.suggest.instruction}
                mode={field.suggest.mode}
                context={buildSuggestContext(tool, inputs, field.id)}
                onFill={(v) => onChange(field.id, v)}
              />
            )}
          </Field>
        );
      })}

      <Button
        type="submit"
        disabled={loading}
        className="mt-1 w-full cta-beam"
        icon={
          loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )
        }
      >
        {loading ? 'Sedang membuat…' : (tool.ctaLabel ?? 'Buat')}
      </Button>
    </form>
  );
}
