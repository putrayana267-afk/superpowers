import { motion } from 'framer-motion'

interface ToggleProps {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
}

export function Toggle({ id, label, checked, onChange, description }: ToggleProps) {
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        role="switch"
        type="button"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        style={{ backgroundColor: checked ? '#10B981' : 'rgba(255,255,255,0.15)' }}
      >
        <motion.span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      </button>
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor={id}
          onClick={() => onChange(!checked)}
          className="text-sm font-medium text-emerald-200 cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-emerald-400/70">{description}</p>
        )}
      </div>
    </div>
  )
}
