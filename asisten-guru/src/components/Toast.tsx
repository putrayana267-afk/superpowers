import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../lib/cn';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Hook untuk memunculkan toast dari komponen mana pun. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast harus dipakai di dalam ToastProvider');
  }
  return ctx;
}

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-primary" />,
  error: <AlertTriangle className="h-5 w-5 text-red-500" />,
  info: <Info className="h-5 w-5 text-emerald-deep" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = ++counter.current;
      setItems((prev) => [...prev, { id, type, message }]);
      window.setTimeout(() => remove(id), 3500);
    },
    [remove],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4"
        role="region"
        aria-live="polite"
        aria-label="Notifikasi"
      >
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-white/50 bg-white/90 px-4 py-3 shadow-glass-lg backdrop-blur-xl',
              )}
            >
              <span className="mt-0.5">{icons[item.type]}</span>
              <p className="flex-1 text-sm font-medium text-ink/90">
                {item.message}
              </p>
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label="Tutup notifikasi"
                className="rounded-md p-0.5 text-ink/40 hover:bg-ink/5 hover:text-ink/70"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
