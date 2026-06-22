import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ToolDefinition } from '../features/tools/types'
import { cn } from '../lib/cn'

interface SidebarProps {
  tools: ToolDefinition[]
  selectedToolId: string
  onSelectTool: (id: string) => void
  isOpen: boolean
  onClose: () => void
}

function NavList({
  tools,
  selectedToolId,
  onSelectTool,
  onClose,
}: {
  tools: ToolDefinition[]
  selectedToolId: string
  onSelectTool: (id: string) => void
  onClose?: () => void
}) {
  return (
    <nav aria-label="Menu alat" className="flex flex-col gap-1 p-3">
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-400/60">
        Alat Mengajar
      </p>
      {tools.map((tool) => {
        const Icon = tool.Icon
        const isActive = tool.id === selectedToolId
        return (
          <button
            key={tool.id}
            onClick={() => {
              onSelectTool(tool.id)
              onClose?.()
            }}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400',
              isActive
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-white'
                : 'text-emerald-200/70 hover:bg-white/10 hover:text-white border border-transparent'
            )}
          >
            <Icon
              className={cn(
                'w-5 h-5 flex-shrink-0',
                isActive ? 'text-emerald-400' : 'text-emerald-400/50'
              )}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className={cn('text-sm font-medium truncate', isActive && 'text-white')}>
                {tool.title}
              </p>
              <p className="text-xs text-emerald-400/50 truncate hidden lg:block">
                {tool.description}
              </p>
            </div>
            {isActive && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            )}
          </button>
        )
      })}
    </nav>
  )
}

export function Sidebar({ tools, selectedToolId, onSelectTool, isOpen, onClose }: SidebarProps) {
  const prefersReducedMotion = useReducedMotion()
  const slideX = prefersReducedMotion ? 0 : '-100%'

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:top-16 md:w-72 md:border-r md:border-white/10 md:overflow-y-auto">
        <div className="glass h-full">
          <NavList tools={tools} selectedToolId={selectedToolId} onSelectTool={onSelectTool} />
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.aside
              className="fixed inset-y-0 left-0 w-72 z-50 md:hidden flex flex-col overflow-y-auto"
              initial={{ x: slideX }}
              animate={{ x: 0 }}
              exit={{ x: slideX }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              aria-label="Menu navigasi"
            >
              <div className="glass h-full">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <span className="font-display font-bold text-white">Menu</span>
                  <button
                    onClick={onClose}
                    aria-label="Tutup menu"
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <NavList
                  tools={tools}
                  selectedToolId={selectedToolId}
                  onSelectTool={onSelectTool}
                  onClose={onClose}
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
