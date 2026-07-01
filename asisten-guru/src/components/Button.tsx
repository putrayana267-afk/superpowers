import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from '../lib/cn';

type Variant = 'primary' | 'ghost' | 'gold' | 'subtle';
type Size = 'sm' | 'md';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  children?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand text-[#04140C] hover:bg-brand-hover active:bg-brand-active shadow-glass disabled:opacity-60',
  gold: 'bg-gold text-[#04140C] hover:bg-gold-deep hover:text-white shadow-glass disabled:opacity-60',
  ghost:
    'bg-white/5 text-emerald-deep hover:bg-white/10 border border-white/10 backdrop-blur disabled:opacity-50',
  subtle:
    'bg-transparent text-emerald-deep hover:bg-emerald-deep/10 disabled:opacity-50',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = 'primary', size = 'md', icon, children, className, ...rest },
    ref,
  ) {
    const reduce = useReducedMotion();
    return (
      <motion.button
        ref={ref}
        whileTap={reduce ? undefined : { scale: 0.97 }}
        whileHover={reduce ? undefined : { y: -1 }}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-[background-color,box-shadow,transform] duration-150 ease-out',
          'disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...rest}
      >
        {icon}
        {children}
      </motion.button>
    );
  },
);
