import { X, SlidersHorizontal } from 'lucide-react';

export interface Filters {
  q: string; state: string; format: string; status: string; fideRated: string;
}

interface Props { filters: Filters; onChange: (f: Filters) => void; }

const STATES  = ['Tamil Nadu','Maharashtra','Karnataka','Delhi','Kerala','Telangana','West Bengal','Gujarat','Punjab','Rajasthan'];
const FORMATS = ['SWISS','ROUND_ROBIN','KNOCKOUT','BLITZ','RAPID','CLASSICAL'];
const STATUSES = [
  { value: 'OPEN',      label: 'Open'      },
  { value: 'UPCOMING',  label: 'Upcoming'  },
  { value: 'ONGOING',   label: 'Ongoing'   },
  { value: 'COMPLETED', label: 'Completed' },
];

const selectCls = [
  'glass-select text-white/80 text-xs rounded-lg px-3 py-1.5',
  'cursor-pointer font-sans min-w-0 flex-shrink-0',
  'max-w-[130px] sm:max-w-none shadow-sm',
].join(' ');

export default function TournamentFilters({ filters, onChange }: Props) {
  const set = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value });
  const hasActive = Object.values(filters).some(Boolean);

  return (
    /* Glassmorphic filter bar */
    <div className="sticky top-14 z-40 backdrop-blur-md bg-[#07090e]/80 border-b border-white/[0.05] shadow-[0_4px_20px_0_rgba(0,0,0,0.3)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <SlidersHorizontal size={13} className="text-cm-accent flex-shrink-0 mr-1" />

          <select value={filters.state}     onChange={e => set('state',     e.target.value)} className={selectCls}>
            <option value="">All States</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select value={filters.format}    onChange={e => set('format',    e.target.value)} className={selectCls}>
            <option value="">Format</option>
            {FORMATS.map(f => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
          </select>

          <select value={filters.status}    onChange={e => set('status',    e.target.value)} className={selectCls}>
            <option value="">Status</option>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <select value={filters.fideRated} onChange={e => set('fideRated', e.target.value)} className={selectCls}>
            <option value="">FIDE?</option>
            <option value="true">FIDE Rated</option>
            <option value="false">Unrated</option>
          </select>

          {hasActive && (
            <button
              onClick={() => onChange({ q: '', state: '', format: '', status: '', fideRated: '' })}
              className="ml-auto flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors bg-red-950/20 shadow-sm"
            >
              <X size={11} /> Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
