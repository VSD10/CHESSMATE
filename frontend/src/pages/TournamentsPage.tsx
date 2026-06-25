import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, Trophy, MapPin, Calendar, Award, Activity, Hourglass, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { TournamentsResponse } from '@/types';
import TournamentCard from '@/components/tournaments/TournamentCard';
import { Spinner, EmptyState } from '@/components/ui';

const LIMIT = 9;

const STATES = ['Tamil Nadu','Maharashtra','Karnataka','Delhi','Kerala','Telangana','West Bengal','Gujarat','Punjab','Rajasthan'];
const FORMATS = ['SWISS','ROUND_ROBIN','KNOCKOUT','BLITZ','RAPID','CLASSICAL'];

type ActiveTab = 'ALL' | 'ONGOING' | 'UPCOMING' | 'COMPLETED';

export default function TournamentsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('ALL');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  
  // Advanced filters
  const [stateFilter, setStateFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [fideRatedFilter, setFideRatedFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);



  // Reset page when switching tabs or filters
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1);
  };

  const clearFilters = () => {
    setStateFilter('');
    setFormatFilter('');
    setFideRatedFilter('');
    setSearchInput('');
    setPage(1);
  };

  // Primary paginated query
  const { data, isLoading, isError, error } = useQuery<TournamentsResponse>({
    queryKey: ['tournaments-catalog', activeTab, page, searchInput, stateFilter, formatFilter, fideRatedFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: LIMIT };
      
      if (activeTab !== 'ALL') {
        params.status = activeTab;
      }
      
      if (searchInput) params.q = searchInput;
      if (stateFilter) params.state = stateFilter;
      if (formatFilter) params.format = formatFilter;
      if (fideRatedFilter) params.fideRated = fideRatedFilter;
      
      const res = await api.get('/tournaments', { params });
      return res.data;
    },
    placeholderData: prev => prev,
  });

  // Query all tournaments to compile stats counts for dashboard
  const { data: statsData } = useQuery<TournamentsResponse>({
    queryKey: ['tournaments-stats-dashboard'],
    queryFn: async () => {
      const res = await api.get('/tournaments', { params: { limit: 50 } });
      return res.data;
    }
  });

  const tournaments = data?.data || [];
  const meta = data?.meta;

  const allTourneys = statsData?.data || [];
  const liveCount = allTourneys.filter(t => t.status === 'ONGOING').length;
  const upcomingCount = allTourneys.filter(t => t.status === 'UPCOMING' || t.status === 'OPEN').length;
  const completedCount = allTourneys.filter(t => t.status === 'COMPLETED').length;

  return (
    <div className="relative text-on-background bg-background min-h-screen pb-20">
      {/* Mesh Glow Background */}
      <div className="absolute top-[5%] left-[-10%] w-[450px] h-[450px] bg-primary/5 rounded-full filter blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[-10%] w-[450px] h-[450px] bg-secondary/5 rounded-full filter blur-[130px] pointer-events-none" />

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 relative z-10">
        
        {/* Header Block */}
        <div className="mb-12 text-center md:text-left scroll-reveal active">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4 shadow-[0_0_15px_rgba(192,193,255,0.05)]">
            <Award size={14} className="text-primary animate-pulse" />
            <span className="text-2xs font-bold text-primary tracking-widest uppercase font-mono">FIDE Rated Arenas</span>
          </div>
          <h1 className="font-headline-xl text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight leading-none">
            Championships <span className="gradient-text">Arena</span>
          </h1>
          <p className="font-body-lg text-sm sm:text-base text-on-surface-variant max-w-2xl font-medium leading-relaxed">
            Discover active chess circuits across India. Track ongoing matches, register securely, and compete on the boards.
          </p>
        </div>

        {/* Stats Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 scroll-reveal active">
          {/* Card 1: Live Ongoing */}
          <div className="glass-panel p-6 rounded-custom border border-white/10 hover:border-red-500/20 transition-all duration-300 group flex items-start gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-red-950/50 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
              <Activity size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-xl text-3xl font-extrabold text-white leading-none">
                  {liveCount}
                </span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
              </div>
              <p className="text-xs font-bold text-white/80 mt-1 uppercase tracking-wider font-mono">Live Matches</p>
              <p className="text-2xs text-on-surface-variant mt-1.5 leading-normal">
                Tournaments currently in play. Click to watch live board feeds.
              </p>
            </div>
          </div>

          {/* Card 2: Upcoming Open */}
          <div className="glass-panel p-6 rounded-custom border border-white/10 hover:border-emerald-500/20 transition-all duration-300 group flex items-start gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Hourglass size={20} className="animate-spin-slow" />
            </div>
            <div>
              <span className="font-headline-xl text-3xl font-extrabold text-white leading-none">
                {upcomingCount}
              </span>
              <p className="text-xs font-bold text-white/80 mt-1 uppercase tracking-wider font-mono">Upcoming Circuits</p>
              <p className="text-2xs text-on-surface-variant mt-1.5 leading-normal">
                Scheduled chess festivals. Registration open online.
              </p>
            </div>
          </div>

          {/* Card 3: Completed Archives */}
          <div className="glass-panel p-6 rounded-custom border border-white/10 hover:border-primary/20 transition-all duration-300 group flex items-start gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <CheckCircle size={20} />
            </div>
            <div>
              <span className="font-headline-xl text-3xl font-extrabold text-white leading-none">
                {completedCount}
              </span>
              <p className="text-xs font-bold text-white/80 mt-1 uppercase tracking-wider font-mono">Archives</p>
              <p className="text-2xs text-on-surface-variant mt-1.5 leading-normal">
                Concluded events. View standings, results, and rating deltas.
              </p>
            </div>
          </div>
        </div>

        {/* Search & Tabs Controls Header */}
        <div className="glass-panel p-5 rounded-custom border border-white/10 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5 scroll-reveal active shadow-xl">
          {/* Tabs Navigation */}
          <div className="relative flex flex-wrap gap-1 p-1 bg-white/5 border border-white/5 rounded-2xl w-fit">
            {[
              { id: 'ALL', label: 'All Events', color: 'bg-primary' },
              { id: 'ONGOING', label: 'Live Arenas', color: 'bg-red-500' },
              { id: 'UPCOMING', label: 'Upcoming', color: 'bg-emerald-400' },
              { id: 'COMPLETED', label: 'Concluded', color: 'bg-white/40' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as ActiveTab)}
                className={`relative px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-300 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-primary text-on-primary shadow-lg font-black scale-102'
                    : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.id !== 'ALL' && (
                  <span className={`w-1.5 h-1.5 rounded-full ${tab.color} ${tab.id === 'ONGOING' ? 'animate-pulse shadow-[0_0_6px_#ef4444]' : ''}`} />
                )}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="flex items-center gap-3 w-full lg:max-w-md">
            <div className="flex-1 flex items-center rounded-xl overflow-hidden glass-input p-1">
              <div className="pl-3.5 text-white/30">
                <Search size={15} />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search by city, state or tournament..."
                className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none min-w-0 font-medium"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-primary text-on-primary text-2xs font-bold rounded-lg hover:opacity-90 transition-all active:scale-[0.98]"
              >
                Search
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                showFilters || stateFilter || formatFilter || fideRatedFilter
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-white/10 bg-white/5 text-on-surface-variant hover:text-white'
              }`}
              title="Advanced Filters"
            >
              <SlidersHorizontal size={15} />
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filters */}
        {showFilters && (
          <div className="glass-panel p-6 sm:p-8 rounded-custom border border-white/10 mb-8 animate-slide-down scroll-reveal active shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* State Filter */}
              <div className="space-y-2">
                <label className="text-2xs text-on-surface-variant uppercase tracking-wider font-extrabold font-mono">State</label>
                <select
                  value={stateFilter}
                  onChange={e => { setStateFilter(e.target.value); setPage(1); }}
                  className="w-full glass-select text-white text-xs rounded-xl px-4 py-3 cursor-pointer outline-none focus:border-primary/50"
                >
                  <option value="">All States</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Format Filter */}
              <div className="space-y-2">
                <label className="text-2xs text-on-surface-variant uppercase tracking-wider font-extrabold font-mono">Format</label>
                <select
                  value={formatFilter}
                  onChange={e => { setFormatFilter(e.target.value); setPage(1); }}
                  className="w-full glass-select text-white text-xs rounded-xl px-4 py-3 cursor-pointer outline-none focus:border-primary/50"
                >
                  <option value="">All Formats</option>
                  {FORMATS.map(f => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
                </select>
              </div>

              {/* FIDE Rated Filter */}
              <div className="space-y-2">
                <label className="text-2xs text-on-surface-variant uppercase tracking-wider font-extrabold font-mono">FIDE Rating</label>
                <select
                  value={fideRatedFilter}
                  onChange={e => { setFideRatedFilter(e.target.value); setPage(1); }}
                  className="w-full glass-select text-white text-xs rounded-xl px-4 py-3 cursor-pointer outline-none focus:border-primary/50"
                >
                  <option value="">All Events</option>
                  <option value="true">FIDE Rated</option>
                  <option value="false">Unrated</option>
                </select>
              </div>
            </div>

            {(stateFilter || formatFilter || fideRatedFilter || searchInput) && (
              <div className="mt-6 pt-6 border-t border-white/5 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 border border-red-500/20 rounded-xl text-red-400 bg-red-950/10 text-xs font-bold hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results Info Grid */}
        <div className="mb-6 flex justify-between items-center scroll-reveal active">
          <p className="text-2xs text-on-surface-variant font-bold uppercase tracking-widest font-mono">
            {isLoading ? 'Fetching Tournaments…' : meta ? `${meta.total} tournament${meta.total !== 1 ? 's' : ''} found` : ''}
          </p>
        </div>

        {/* Dynamic Catalog Grid with Staggered Entries */}
        <div className="relative z-10 min-h-[40vh] scroll-reveal active">
          {isLoading ? (
            <div className="flex items-center justify-center py-36">
              <Spinner className="w-9 h-9 text-primary" />
            </div>
          ) : isError ? (
            <div className="glass-panel rounded-custom border border-white/10 p-16 text-center">
              <EmptyState 
                icon="⚠" 
                title="Failed to load tournaments" 
                subtitle={error instanceof Error ? `Error: ${error.message}` : `Error: ${JSON.stringify(error)}`} 
              />
            </div>
          ) : tournaments.length === 0 ? (
            <div className="glass-panel rounded-custom border border-white/10 p-16 text-center">
              <EmptyState icon="♟" title="No tournaments found" subtitle="Try modifying your state, format, or search query." />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {tournaments.map((t) => (
                <div key={t.id}>
                  <TournamentCard tournament={t} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Pagination Controls */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-16 scroll-reveal active">
            <button
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:border-primary hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => {
              const total = meta.totalPages;
              if (total <= 7) return i + 1;
              if (i === 0) return 1;
              if (i === 6) return total;
              if (page <= 4) return i + 1;
              if (page >= total - 3) return total - 6 + i;
              return page - 3 + i;
            }).map((p, idx, arr) => {
              const prev = arr[idx - 1] as number | undefined;
              const showEllipsis = prev !== undefined && (p as number) - prev > 1;
              return (
                <span key={idx} className="flex items-center gap-2">
                  {showEllipsis && <span className="text-white/20 px-1 font-mono">…</span>}
                  <button
                    onClick={() => { setPage(p as number); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      p === page
                        ? 'bg-primary border-primary text-on-primary shadow-lg font-black'
                        : 'bg-white/5 border-white/10 text-white/60 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {p}
                  </button>
                </span>
              );
            })}

            <button
              onClick={() => { setPage(p => Math.min(meta.totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page === meta.totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:border-primary hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
