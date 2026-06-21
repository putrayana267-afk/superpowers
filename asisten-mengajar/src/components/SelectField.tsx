import { Field } from './Field'
import { cn } from '../lib/cn'

interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  required?: boolean
  error?: string
}

export function SelectField({ id, label, value, onChange, options, required, error }: SelectFieldProps) {
  return (
    <Field id={id} label={label} required={required} error={error}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={error ? 'true' : undefined}
        className={cn(
          'w-full rounded-xl px-3 py-2.5 text-sm',
          'bg-white/10 border border-white/20 text-white',
          'focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400',
          'appearance-none cursor-pointer transition-colors',
          '[&>option]:bg-emerald-950 [&>option]:text-white',
          error && 'border-red-400 focus:ring-red-400'
        )}
      >
        <option value="">— Pilih —</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
