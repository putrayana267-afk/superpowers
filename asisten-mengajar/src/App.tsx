import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TOOLS } from './features/tools/registry'
import { generate } from './services/ai'
import { saveEntry, toggleFavorite, type HistoryEntry } from './lib/storage'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { ToolForm, type ToolFormHandle } from './components/ToolForm'
import { ResultPanel } from './components/ResultPanel'
import { HistoryDrawer } from './components/HistoryDrawer'
import { useToast } from './components/Toast'

export function App() {
  const [selectedToolId, setSelectedToolId] = useState(TOOLS[0].id)
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null)
  const [restoreKey, setRestoreKey] = useState(0)
  const [initialInputs, setInitialInputs] = useState<Record<string, string> | undefined>()
  const [pendingInputs, setPendingInputs] = useState<Record<string, string> | null>(null)

  const formRef = useRef<ToolFormHandle>(null)
  const { showToast } = useToast()

  const selectedTool = TOOLS.find((t) => t.id === selectedToolId) ?? TOOLS[0]

  const handleGenerate = async (inputs: Record<string, string>) => {
    setPendingInputs(inputs)
    setIsLoading(true)
    setResult('')

    try {
      const text = await generate(selectedToolId, inputs)
      setResult(text)

      const entry = saveEntry({
        toolId: selectedToolId,
        toolTitle: selectedTool.title,
        inputs,
        result: text,
      })
      setCurrentEntryId(entry.id)
      setIsFavorite(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.'
      showToast(msg, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerate = () => {
    if (pendingInputs) {
      handleGenerate(pendingInputs)
    } else {
      formRef.current?.submit()
    }
  }

  const handleToggleFavorite = () => {
    if (!currentEntryId) return
    const newState = toggleFavorite(currentEntryId)
    setIsFavorite(newState)
    showToast(newState ? 'Disimpan ke favorit.' : 'Dihapus dari favorit.', 'success')
  }

  const handleSelectTool = (id: string) => {
    setSelectedToolId(id)
    setResult('')
    setCurrentEntryId(null)
    setIsFavorite(false)
    setPendingInputs(null)
    setInitialInputs(undefined)
  }

  const handleRestoreHistory = (entry: HistoryEntry) => {
    setSelectedToolId(entry.toolId)
    setResult(entry.result)
    setInitialInputs(entry.inputs)
    setPendingInputs(entry.inputs)
    setCurrentEntryId(entry.id)
    setIsFavorite(entry.isFavorite)
    setRestoreKey((k) => k + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-900">
      <Header
        onMenuToggle={() => setIsSidebarOpen(true)}
        onHistoryToggle={() => setIsHistoryOpen(true)}
        currentToolTitle={selectedTool.title}
      />

      <Sidebar
        tools={TOOLS}
        selectedToolId={selectedToolId}
        onSelectTool={handleSelectTool}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex pt-16 min-h-screen">
        {/* Desktop sidebar spacer */}
        <div className="hidden md:block w-72 flex-shrink-0" />

        {/* Main work area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedToolId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start"
            >
              <ToolForm
                ref={formRef}
                key={`${selectedToolId}-${restoreKey}`}
                tool={selectedTool}
                isLoading={isLoading}
                initialInputs={initialInputs}
                onSubmit={handleGenerate}
              />
              <ResultPanel
                result={result}
                toolTitle={selectedTool.title}
                isLoading={isLoading}
                isFavorite={isFavorite}
                onRegenerate={handleRegenerate}
                onToggleFavorite={handleToggleFavorite}
              />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onRestore={handleRestoreHistory}
      />
    </div>
  )
}
