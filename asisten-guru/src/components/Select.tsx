import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/cn';
import { controlBase, controlError } from './controlStyles';
import type { FieldOption } from '../features/tools/types';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: FieldOption[];
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ options, invalid, className, ...rest }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            controlBase,
            'cursor-pointer appearance-none pr-10',
            invalid && controlError,
            className,
          )}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-deep/70"
        />
      </div>
    );
  },
);
