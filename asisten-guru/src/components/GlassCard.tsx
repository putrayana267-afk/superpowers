import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../lib/cn';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** Tambahkan garis tepi emas tipis untuk elemen kunci. */
  gold?: boolean;
  /** Aktifkan animasi reveal saat muncul. */
  animate?: boolean;
}

export function GlassCard({
  children,
  className,
  gold = false,
  animate = true,
}: GlassCardProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={animate && !reduce ? { opacity: 0, y: 10 } : false}
      animate={animate && !reduce ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cn('glass p-5 sm:p-6', gold && 'gold-edge', className)}
    >
      {children}
    </motion.div>
  );
}
