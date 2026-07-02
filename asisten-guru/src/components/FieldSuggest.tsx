import { useState } from 'react';
import { Sparkle, CircleNotch } from '@phosphor-icons/react';
import { suggest, GenerateError } from '../services/ai';
import { useToast } from './Toast';
import { cn } from '../lib/cn';

interface FieldSuggestProps {
  label: string;
  instruction: string;
  context: Record<string, string>;
  mode: 'replace' | 'list';
  onFill: (value: string) => void;
  disabled?: boolean;
  /** Pesan saat tombol dinonaktifkan (mis. konteks belum lengkap). */
  disabledHint?: string;
}

/** Pecah teks daftar menjadi item bersih (buang bullet/nomor). */
function parseList(text: string): string[] {
  const seen = new Set<string>();
  const items: string[] = [];
  for (const raw of text.split('\n')) {
    const cleaned = raw.replace(/^[\s*\-•·.\d)]+/, '').trim();
    if (cleaned && !seen.has(cleaned.toLowerCase())) {
      seen.add(cleaned.toLowerCase());
      items.push(cleaned);
    }
  }
  return items.slice(0, 8);
}

/** Tombol kecil "isi otomatis" berbasis AI di samping/di bawah sebuah field. */
export function FieldSuggest({
  label,
  instruction,
  context,
  mode,
  onFill,
  disabled,
  disabledHint,
}: FieldSuggestProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<string[]>([]);

  async function run() {
    if (loading || disabled) return;
    setLoading(true);
    setItems([]);
    try {
      const text = await suggest(instruction, context);
      if (mode === 'list') {
        const parsed = parseList(text);
        if (parsed.length === 0) onFill(text.trim());
        else setItems(parsed);
      } else {
        onFill(text.trim());
      }
    } catch (err) {
      const msg =
        err instanceof GenerateError
          ? err.message
          : 'Gagal membuat saran. Coba lagi.';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={run}
        disabled={loading || disabled}
        title={disabled ? disabledHint : undefined}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs font-semibold text-gold-deep transition',
          'hover:bg-gold/20 focus-visible:outline-2 focus-visible:outline-emerald-deep',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        {loading ? (
          <CircleNotch className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkle className="h-3.5 w-3.5" />
        )}
        {loading ? 'Memuat…' : label}
      </button>

      {items.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {items.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                onFill(item);
                setItems([]);
              }}
              className="rounded-full border border-emerald-deep/20 bg-white/5 px-2.5 py-1 text-xs text-emerald-deep transition hover:bg-emerald-deep/15"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
