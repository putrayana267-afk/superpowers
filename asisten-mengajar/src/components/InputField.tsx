import { Field } from './Field'
import { cn } from '../lib/cn'

interface InputFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
}

export function InputField({ id, label, value, onChange, placeholder, required, error }: InputFieldProps) {
  return (
    <Field id={id} label={label} required={required} error={error}>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={error ? 'true' : undefined}
        className={cn(
          'w-full rounded-xl px-3 py-2.5 text-sm',
          'bg-white/10 border border-white/20 text-white placeholder-white/40',
          'focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400',
          'transition-colors',
          error && 'border-red-400 focus:ring-red-400'
        )}
      />
    </Field>
  )
}
