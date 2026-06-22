import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

/** Tampilan kosong yang mengundang aksi (bukan sekadar "tidak ada data"). */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-soft text-emerald-deep gold-edge">
        {icon}
      </div>
      <h3 className="font-display text-lg font-bold text-emerald-deep">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink/60">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
