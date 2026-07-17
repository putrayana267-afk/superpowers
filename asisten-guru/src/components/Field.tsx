import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

/** Pembungkus label + kontrol + pesan bantuan/error yang konsisten & aksesibel. */
export function Field({
  id,
  label,
  required,
  hint,
  error,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink/80">
        {label}
        {required && <span className="ml-1 text-gold-deep-text">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-ink/50">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
