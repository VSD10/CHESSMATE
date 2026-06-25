import { ReactNode, ButtonHTMLAttributes } from 'react';
import { TournamentStatus } from '@/types';

// ── Button ──────────────────────────────────────────────────────────────────
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}
export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: BtnProps) {
  const base = 'inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';
  const variants = {
    primary: 'bg-cm-accent text-white hover:bg-cm-accent-l active:scale-[0.98] shadow-sm',
    ghost:   'bg-white border border-cm-border text-cm-text hover:border-cm-accent/40 hover:text-cm-accent',
    outline: 'bg-white border border-cm-accent/60 text-cm-accent hover:bg-cm-accent/8',
    danger:  'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm' };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ── StatusBadge ──────────────────────────────────────────────────────────────
const statusMap: Record<TournamentStatus, { label: string; cls: string }> = {
  UPCOMING:  { label: 'Upcoming',  cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  OPEN:      { label: 'Open',      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ONGOING:   { label: 'Live',      cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  COMPLETED: { label: 'Done',      cls: 'bg-gray-50 text-gray-400 border-gray-200' },
};
export function StatusBadge({ status }: { status: TournamentStatus }) {
  const { label, cls } = statusMap[status] || statusMap.UPCOMING;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {status === 'OPEN'    && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />}
      {status === 'ONGOING' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />}
      {label}
    </span>
  );
}

// ── FormatBadge ──────────────────────────────────────────────────────────────
export function FormatBadge({ format, fideRated }: { format: string; fideRated: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-xs border border-gray-200">
      {format.replace('_', ' ')}
      {fideRated && <span className="text-cm-accent font-bold">·F</span>}
    </span>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', hover = false }: { children: ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={`bg-white rounded-xl border border-cm-border shadow-sm ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  );
}

// ── SectionLabel ─────────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="block text-xs font-bold text-cm-accent uppercase tracking-widest mb-3">
      {children}
    </span>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-cm-accent ${className}`} />
  );
}

// ── Input ────────────────────────────────────────────────────────────────────
export function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full bg-white border border-cm-border text-cm-text rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cm-accent/70 focus:ring-2 focus:ring-cm-accent/10 transition-all placeholder:text-gray-400 font-sans ${className}`}
      {...props}
    />
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select
      className={`w-full bg-white border border-cm-border text-cm-text rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cm-accent/70 focus:ring-2 focus:ring-cm-accent/10 transition-all font-sans cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

// ── RatingDelta ───────────────────────────────────────────────────────────────
export function RatingDelta({ delta }: { delta: number }) {
  if (delta === 0) return <span className="text-gray-400 font-mono text-sm">±0</span>;
  return (
    <span className={`font-mono text-sm font-bold ${delta > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
      {delta > 0 ? '+' : ''}{delta}
    </span>
  );
}

// ── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = '♟', title, subtitle }: { icon?: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-4xl mb-3 opacity-30">{icon}</div>
      <p className="text-cm-text font-medium">{title}</p>
      {subtitle && <p className="text-gray-500 text-sm mt-1.5">{subtitle}</p>}
    </div>
  );
}

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-white">{title}</h1>
      {subtitle && <p className="text-on-surface-variant text-sm mt-1.5">{subtitle}</p>}
    </div>
  );
}

// ── Pill ─────────────────────────────────────────────────────────────────────
export function Pill({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      active ? 'bg-cm-accent/10 border-cm-accent/40 text-cm-accent' : 'bg-white border-cm-border text-gray-500'
    }`}>
      {children}
    </span>
  );
}
