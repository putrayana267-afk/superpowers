import { cn } from '../lib/cn';

interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
}

/** Sakelar aksesibel (role switch) untuk opsi boolean. */
export function Toggle({ id, checked, onChange, label, hint }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/50 bg-white/50 px-3.5 py-2.5 backdrop-blur">
      <span className="flex flex-col">
        <label htmlFor={id} className="text-sm font-medium text-ink/80">
          {label}
        </label>
        {hint && <span className="text-xs text-ink/50">{hint}</span>}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-emerald-deep',
          checked ? 'bg-emerald-deep' : 'bg-ink/20',
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  );
}
