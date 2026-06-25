import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { Tournament, TournamentStatus, TournamentFormat } from '@/types';
import { Spinner, StatusBadge, SectionLabel } from '@/components/ui';

const FORMATS: TournamentFormat[] = ['SWISS','ROUND_ROBIN','KNOCKOUT','BLITZ','RAPID','CLASSICAL'];
const STATUSES: TournamentStatus[] = ['UPCOMING','OPEN','ONGOING','COMPLETED'];
const STATES = ['Tamil Nadu','Maharashtra','Karnataka','Delhi','Kerala','Telangana','West Bengal','Gujarat','Punjab'];

const emptyForm = {
  name:'', city:'', state:'Tamil Nadu', startDate:'', endDate:'',
  format:'SWISS' as TournamentFormat, rounds:9, timeControl:'90+30',
  category:'Open', fideRated:false, entryFee:'', prizePool:'', status:'UPCOMING' as TournamentStatus,
  emoji:'♟', about:'',
  detail: { venue:'', chiefArbiter:'', organizer:'', organizingCommittee:'',
    registrationLink:'', prizes:[{position:'1st Prize', amount:''}] },
};

const fieldCls = [
  'w-full glass-input rounded-xl px-3 py-2.5 text-sm outline-none border border-white/10',
  'focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors font-sans',
  'placeholder:text-white/30',
].join(' ');

export default function AdminPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState<string | null>(null);
  const [form,     setForm]     = useState(emptyForm);
  const [tab,      setTab]      = useState<'tournaments'|'analytics'>('tournaments');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tournaments'],
    queryFn: () => api.get('/tournaments', { params: { limit: 50 } }).then(r => r.data),
  });

  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get('/analytics/dashboard').then(r => r.data),
    enabled: tab === 'analytics',
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => editId ? api.put(`/tournaments/${editId}`, d) : api.post('/tournaments', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tournaments'] });
      qc.invalidateQueries({ queryKey: ['tournaments'] });
      setShowForm(false); setEditId(null); setForm(emptyForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tournaments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tournaments'] }),
  });

  const handleEdit = (t: Tournament) => {
    setEditId(t.id);
    setForm({
      ...emptyForm, ...t,
      startDate: t.startDate.slice(0, 10),
      endDate: t.endDate.slice(0, 10),
      detail: t.detail ? { ...emptyForm.detail, ...t.detail, prizes: (t.detail.prizes as any) || emptyForm.detail.prizes } : emptyForm.detail,
    });
    setShowForm(true);
  };

  const sf = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));
  const sd = (key: string, val: any) => setForm(f => ({ ...f, detail: { ...f.detail, [key]: val } }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 animate-fade-in relative z-10">
      {/* Background glow blobs */}
      <div className="absolute top-[5%] left-[-15%] w-[350px] h-[350px] bg-primary/5 rounded-full filter blur-[100px] pointer-events-none animate-pulse-slow -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-secondary/5 rounded-full filter blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-white">Admin</h1>
          <p className="text-on-surface-variant text-xs mt-1">Manage tournaments and analytics</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs hover:shadow-[0_0_20px_rgba(180,197,255,0.4)] transition-all active:scale-[0.98]"
        >
          <Plus size={13} /> New
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5">
        {(['tournaments', 'analytics'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize active:scale-95 ${
              tab === t 
                ? 'bg-primary text-on-primary shadow-md' 
                : 'glass-panel text-white/70 hover:bg-white/10 hover:text-white border-white/10 bg-transparent'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Analytics */}
      {tab === 'analytics' && analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-slide-up">
          {[
            { label: 'Tournaments',     value: analytics.totalTournaments },
            { label: 'Page Views',      value: analytics.totalViews       },
            { label: 'Register Clicks', value: analytics.totalClicks      },
            { label: 'Recent',          value: analytics.recentTournaments?.length || 0 },
          ].map(({ label, value }) => (
            <div key={label} className="glass-panel rounded-xl p-5 border border-white/10 text-center shadow-md">
              <div className="font-serif text-2xl font-bold text-primary">{value}</div>
              <div className="text-2xs text-white/60 mt-0.5 uppercase tracking-widest font-semibold">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tournaments table */}
      {tab === 'tournaments' && (
        isLoading ? (
          <div className="flex items-center justify-center py-16"><Spinner className="w-7 h-7" /></div>
        ) : (
          <div className="glass-panel rounded-xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Mobile: card list */}
            <div className="sm:hidden divide-y divide-white/5">
              {(data?.data || []).map((t: Tournament) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg flex-shrink-0">{t.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{t.name}</p>
                      <div className="mt-1"><StatusBadge status={t.status} /></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    <button onClick={() => handleEdit(t)} className="p-1.5 rounded-lg text-white/40 hover:text-primary hover:bg-primary/10 transition-all active:scale-90">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(t.id); }}
                      className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all active:scale-90">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <table className="hidden sm:table w-full text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest text-left bg-white/[0.01]">
                  <th className="px-4 py-3 font-semibold">Tournament</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">City</th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell">Format</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(data?.data || []).map((t: Tournament) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{t.emoji}</span>
                        <span className="font-semibold text-white truncate max-w-[200px]">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/60 hidden md:table-cell">{t.city}</td>
                    <td className="px-4 py-3 text-white/60 hidden lg:table-cell">{t.format.replace('_',' ')}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(t)} className="p-1.5 rounded-lg text-white/40 hover:text-primary hover:bg-primary/10 transition-all active:scale-90">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => { if (confirm('Delete this tournament?')) deleteMutation.mutate(t.id); }}
                          className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all active:scale-90">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto animate-fade-in"
          onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="glass-panel rounded-2xl w-full max-w-2xl shadow-3xl my-4 border border-white/10 overflow-hidden">
            {/* Modal header */}
            <div className="sticky top-0 bg-[#12161b] border-b border-white/10 px-5 py-4 flex items-center justify-between z-10 rounded-t-2xl">
              <h2 className="font-serif text-lg font-bold text-white">{editId ? 'Edit' : 'New'} Tournament</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[calc(90vh-60px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  { label:'Name', key:'name', type:'text', span:2 },
                  { label:'City', key:'city', type:'text' },
                  { label:'Entry Fee', key:'entryFee', type:'text' },
                  { label:'Prize Pool', key:'prizePool', type:'text' },
                  { label:'Time Control', key:'timeControl', type:'text' },
                  { label:'Rounds', key:'rounds', type:'number' },
                  { label:'Start Date', key:'startDate', type:'date' },
                  { label:'End Date', key:'endDate', type:'date' },
                  { label:'Category', key:'category', type:'text' },
                  { label:'Emoji', key:'emoji', type:'text' },
                ] as Array<{label:string;key:string;type:string;span?:number}>).map(({ label, key, type, span }) => (
                  <div key={key} className={span === 2 ? 'sm:col-span-2' : ''}>
                    <label className="text-2xs font-semibold text-white/60 uppercase tracking-wider block mb-1.5">{label}</label>
                    <input type={type} value={(form as any)[key]}
                      onChange={e => sf(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                      className={fieldCls} />
                  </div>
                ))}

                <div>
                  <label className="text-2xs font-semibold text-white/60 uppercase tracking-wider block mb-1.5">State</label>
                  <select value={form.state} onChange={e => sf('state', e.target.value)} className={`${fieldCls} cursor-pointer`}>
                    {STATES.map(s => <option className="bg-[#101418] text-white" key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-2xs font-semibold text-white/60 uppercase tracking-wider block mb-1.5">Format</label>
                  <select value={form.format} onChange={e => sf('format', e.target.value)} className={`${fieldCls} cursor-pointer`}>
                    {FORMATS.map(f => <option className="bg-[#101418] text-white" key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-2xs font-semibold text-white/60 uppercase tracking-wider block mb-1.5">Status</label>
                  <select value={form.status} onChange={e => sf('status', e.target.value)} className={`${fieldCls} cursor-pointer`}>
                    {STATUSES.map(s => <option className="bg-[#101418] text-white" key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2.5 pt-4">
                  <input type="checkbox" id="fideRated" checked={form.fideRated} onChange={e => sf('fideRated', e.target.checked)} className="w-4 h-4 accent-primary cursor-pointer" />
                  <label htmlFor="fideRated" className="text-sm text-white cursor-pointer select-none">FIDE Rated</label>
                </div>
              </div>

              <div>
                <label className="text-2xs font-semibold text-white/60 uppercase tracking-wider block mb-1.5">About</label>
                <textarea value={form.about} onChange={e => sf('about', e.target.value)} rows={3}
                  className={`${fieldCls} resize-none`} />
              </div>

              <div className="border-t border-white/5 pt-4">
                <SectionLabel>Venue & Organizer</SectionLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {([
                    { label:'Venue', key:'venue' },
                    { label:'Chief Arbiter', key:'chiefArbiter' },
                    { label:'Organizer', key:'organizer' },
                    { label:'Registration Link', key:'registrationLink' },
                  ] as Array<{label:string;key:string}>).map(({ label, key }) => (
                    <div key={key}>
                      <label className="text-2xs font-semibold text-white/60 uppercase tracking-wider block mb-1.5">{label}</label>
                      <input value={(form.detail as any)[key] || ''} onChange={e => sd(key, e.target.value)} className={fieldCls} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 glass-panel text-white rounded-xl text-sm font-semibold hover:bg-white/10 transition-all border border-white/10 active:scale-95">
                  Cancel
                </button>
                <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending}
                  className="flex-1 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:shadow-[0_0_20px_rgba(180,197,255,0.4)] transition-all disabled:opacity-50 active:scale-[0.99]">
                  {createMutation.isPending ? 'Saving…' : editId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
