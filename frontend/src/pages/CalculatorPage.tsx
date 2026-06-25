import { useState, useCallback } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { CalcOpponent, CalcResult } from '@/types';
import { calculateRating, getKFactor } from '@/lib/fide';
import { PageHeader, SectionLabel, RatingDelta } from '@/components/ui';

function uid() { return Math.random().toString(36).slice(2); }

// Glassmorphic input classes
const inputCls = [
  'w-full glass-input rounded-xl px-3 py-2.5 font-mono text-xs border border-white/10 outline-none',
  'focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors font-sans',
  'placeholder:text-white/30 cursor-pointer select-none',
].join(' ');

export default function CalculatorPage() {
  const [myRating, setMyRating]     = useState(1650);
  const [kOverride, setKOverride]   = useState<number | undefined>(undefined);
  const [opponents, setOpponents]   = useState<CalcOpponent[]>([
    { id: uid(), rating: 1700, result: 1   },
    { id: uid(), rating: 1800, result: 0.5 },
    { id: uid(), rating: 1600, result: 0   },
  ]);
  const [result, setResult]         = useState<CalcResult | null>(null);

  const kFactor = getKFactor(myRating, kOverride);

  const addOpponent    = () => setOpponents(o => [...o, { id: uid(), rating: 1500, result: 0.5 }]);
  const removeOpponent = (id: string) => setOpponents(o => o.filter(x => x.id !== id));
  const updateOpponent = (id: string, key: keyof CalcOpponent, value: number) =>
    setOpponents(o => o.map(x => x.id === id ? { ...x, [key]: value } : x));

  const calculate = useCallback(() => {
    if (opponents.length === 0) return;
    setResult(calculateRating(myRating, opponents, kOverride));
  }, [myRating, opponents, kOverride]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-fade-in relative z-10">
      {/* Background glow blobs */}
      <div className="absolute top-[5%] left-[-15%] w-[350px] h-[350px] bg-primary/5 rounded-full filter blur-[100px] pointer-events-none animate-pulse-slow -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-secondary/5 rounded-full filter blur-[120px] pointer-events-none -z-10" />

      <PageHeader title="FIDE Rating Calculator" subtitle="Official Elo formula for rating change estimation" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5 items-start">
        {/* MAIN */}
        <div className="flex flex-col gap-4">
          {/* Step 1 - Your Details */}
          <div className="glass-panel rounded-xl p-5 border border-white/10 shadow-sm">
            <span className="block text-xs font-bold text-primary uppercase tracking-widest mb-3">
              Your Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-2xs font-semibold text-white/60 uppercase tracking-wider block mb-1.5">Rating</label>
                <input type="number" value={myRating} onChange={e => setMyRating(Number(e.target.value))}
                  className={`${inputCls} w-full`} placeholder="1650" min={100} max={3000} />
              </div>
              <div>
                <label className="text-2xs font-semibold text-white/60 uppercase tracking-wider block mb-1.5">
                  K-Factor <span className="font-mono text-primary">K={kFactor}</span>
                </label>
                <select value={kOverride ?? 'auto'} onChange={e => setKOverride(e.target.value === 'auto' ? undefined : Number(e.target.value))}
                  className={`${inputCls} w-full cursor-pointer`}>
                  <option className="bg-[#101418] text-white" value="auto">Auto (Recommended)</option>
                  <option className="bg-[#101418] text-white" value={40}>K=40 — New Player</option>
                  <option className="bg-[#101418] text-white" value={20}>K=20 — Standard</option>
                  <option className="bg-[#101418] text-white" value={10}>K=10 — 2400+</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 2 — Opponents */}
          <div className="glass-panel rounded-xl p-5 border border-white/10 shadow-sm">
            <span className="block text-xs font-bold text-primary uppercase tracking-widest mb-3">
              Opponents
            </span>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-xs min-w-[360px]">
                <thead>
                  <tr className="text-white/40 border-b border-white/10 text-left">
                    <th className="pb-2 pl-1 font-semibold w-6">#</th>
                    <th className="pb-2 font-semibold">Rating</th>
                    <th className="pb-2 px-2 font-semibold">Result</th>
                    <th className="pb-2 font-semibold">Expected</th>
                    <th className="pb-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {opponents.map((opp, i) => {
                    const expected = 1 / (1 + Math.pow(10, (opp.rating - myRating) / 400));
                    return (
                      <tr key={opp.id} className="border-b border-white/5">
                        <td className="py-3.5 pl-1 text-white/30">{i + 1}</td>
                        <td className="py-2 pr-2">
                          <input type="number" value={opp.rating}
                            onChange={e => updateOpponent(opp.id, 'rating', Number(e.target.value))}
                            className={`${inputCls} w-24`} min={100} max={3000} />
                        </td>
                        <td className="py-2 px-2">
                          <select value={opp.result}
                            onChange={e => updateOpponent(opp.id, 'result', Number(e.target.value) as 1 | 0.5 | 0)}
                            className={`${inputCls} w-24 cursor-pointer`}>
                            <option className="bg-[#101418] text-white" value={1}>Win</option>
                            <option className="bg-[#101418] text-white" value={0.5}>Draw</option>
                            <option className="bg-[#101418] text-white" value={0}>Loss</option>
                          </select>
                        </td>
                        <td className="py-2 font-mono text-white/60">{expected.toFixed(3)}</td>
                        <td className="py-2 pl-2">
                          <button onClick={() => removeOpponent(opp.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 active:scale-90 transition-all">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button onClick={addOpponent}
              className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs text-primary border border-dashed border-primary/30 rounded-xl hover:bg-primary/10 hover:border-primary/50 transition-all font-semibold active:scale-95">
              <Plus size={13} /> Add Opponent
            </button>
          </div>

          {/* Calculate */}
          <button onClick={calculate} disabled={opponents.length === 0}
            className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(180,197,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all">
            Calculate Rating Change
          </button>

          {/* Results */}
          {result && (
            <div className="glass-panel rounded-xl p-5 border border-white/10 animate-slide-up">
              <span className="block text-xs font-bold text-primary uppercase tracking-widest mb-3">
                Result
              </span>

              <div className="flex items-center justify-between mb-5 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                <div>
                  <p className="text-2xs text-white/60 uppercase tracking-widest mb-0.5">New Rating</p>
                  <p className="font-serif text-3xl font-bold text-white leading-tight">{result.newRating}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xs text-white/60 uppercase tracking-widest mb-0.5">Change</p>
                  <p className={`text-2xl font-bold font-serif ${result.delta >= 0 ? 'text-green-400' : 'text-red-400'} leading-tight`}>
                    {result.delta >= 0 ? '+' : ''}{result.delta}
                  </p>
                  <p className="text-2xs text-white/40 mt-0.5">K={result.kFactor}</p>
                </div>
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr className="text-white/40 border-b border-white/10 text-left">
                    <th className="pb-2 font-semibold">Rating</th>
                    <th className="pb-2 font-semibold">Result</th>
                    <th className="pb-2 font-semibold">Expected</th>
                    <th className="pb-2 font-semibold text-right">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 text-white/80">
                      <td className="py-2.5 font-mono">{row.rating}</td>
                      <td className="py-2.5">
                        <span className={`font-bold ${row.result === 1 ? 'text-green-400' : row.result === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                          {row.result === 1 ? 'W' : row.result === 0.5 ? 'D' : 'L'}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-white/60">{row.expected.toFixed(3)}</td>
                      <td className="py-2.5 text-right"><RatingDelta delta={Math.round(row.delta)} /></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/10 font-bold">
                    <td colSpan={3} className="pt-3 text-white">Total</td>
                    <td className="pt-3 text-right"><RatingDelta delta={result.delta} /></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="flex flex-col gap-3.5 lg:sticky lg:top-20">
          {/* Live preview */}
          <div className="glass-panel rounded-xl p-5 border border-white/10 shadow-sm">
            <span className="block text-xs font-bold text-primary uppercase tracking-widest mb-3">
              Preview
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ['Rating',     String(myRating),           'text-white'   ],
                ['K-Factor',   `K=${kFactor}`,              'text-primary' ],
                ['Opponents',  String(opponents.length),    'text-white'   ],
              ].map(([label, val, cls]) => (
                <div key={label} className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
                  <p className={`font-mono text-sm font-bold ${cls}`}>{val}</p>
                  <p className="text-[10px] text-white/40 mt-0.5 uppercase tracking-wider font-semibold">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Formula */}
          <div className="glass-panel rounded-xl p-5 border border-white/10 shadow-sm">
            <span className="block text-xs font-bold text-primary uppercase tracking-widest mb-3">
              Formula
            </span>
            <div className="bg-white/[0.02] rounded-xl p-4 font-mono text-xs text-center mb-3.5 border border-white/5 shadow-sm">
              <div className="text-primary font-bold mb-1.5">Rn = Ro + K(W − We)</div>
              <div className="text-2xs text-white/50">We = 1 / (1 + 10^(ΔR/400))</div>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-2xs text-white/60">
              <div><span className="text-white font-bold">Rn</span> New rating</div>
              <div><span className="text-white font-bold">Ro</span> Old rating</div>
              <div><span className="text-white font-bold">K</span> K-factor</div>
              <div><span className="text-white font-bold">W</span> Actual score</div>
              <div className="col-span-2"><span className="text-white font-bold">We</span> Expected score</div>
            </div>
          </div>

          {/* K-Factor guide */}
          <div className="glass-panel rounded-xl p-5 border border-white/10 shadow-sm">
            <span className="block text-xs font-bold text-primary uppercase tracking-widest mb-3">
              K-Factor Guide
            </span>
            <div className="flex flex-col gap-2.5 text-xs">
              {[
                { k: 'K=40', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', desc: 'New player / <30 games' },
                { k: 'K=20', cls: 'text-primary bg-primary/10 border-primary/20',             desc: 'Standard active player' },
                { k: 'K=10', cls: 'text-red-400 bg-red-500/10 border-red-500/20',             desc: 'Rating ≥ 2400' },
              ].map(({ k, cls, desc }) => (
                <div key={k} className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-2xs border ${cls}`}>{k}</span>
                  <span className="text-white/60 font-medium">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
