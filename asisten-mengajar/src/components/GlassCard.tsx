import { cn } from '../lib/cn'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  goldBorder?: boolean
}

export function GlassCard({ children, className, goldBorder = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass rounded-2xl shadow-lg',
        goldBorder && 'border-gold/50',
        className
      )}
    >
      {children}
    </div>
  )
}
