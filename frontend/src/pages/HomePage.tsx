import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, Trophy, MapPin, Calendar, ArrowRight, Sparkles, SlidersHorizontal, Calculator, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { TournamentsResponse } from '@/types';
import TournamentCard from '@/components/tournaments/TournamentCard';
import TournamentFilters, { Filters } from '@/components/tournaments/TournamentFilters';
import { Spinner, EmptyState } from '@/components/ui';
import ThreeChessKing from '@/components/ui/ThreeChessKing';
import { useNavigate, Link } from 'react-router-dom';

const LIMIT = 9;

export default function HomePage() {
  const navigate = useNavigate();
  const tournamentsRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<Filters>({ q: '', state: '', format: '', status: '', fideRated: '' });

  // Interactive K-factor Elo calculator states for Bento grid card
  const [opponentRating, setOpponentRating] = useState(1800);
  const myRating = 1840;
  const K = 32;
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - myRating) / 400));
  const change = Math.round(K * (1 - expectedScore)); // Assuming win
  const projectedRating = myRating + change;

  const { data, isLoading, isError } = useQuery<TournamentsResponse>({
    queryKey: ['tournaments', filters, page],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: LIMIT };
      if (filters.q)         params.q         = filters.q;
      if (filters.state)     params.state     = filters.state;
      if (filters.format)    params.format    = filters.format;
      if (filters.status)    params.status    = filters.status;
      if (filters.fideRated) params.fideRated = filters.fideRated;
      const res = await api.get('/tournaments', { params });
      return res.data;
    },
    placeholderData: prev => prev,
  });

  const handleSearch = useCallback(() => {
    setFilters(f => ({ ...f, q: searchInput }));
    setPage(1);
  }, [searchInput]);

  const handleFilters = useCallback((f: Filters) => {
    setFilters(f); setPage(1);
  }, []);

  const tournaments = data?.data || [];
  const meta = data?.meta;

  // Scroll reveal trigger hook
  useEffect(() => {
    const observerOptions = {
      threshold: 0.05,
      rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [tournaments, page]);

  const handleExploreClick = () => {
    tournamentsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative text-on-background bg-background min-h-screen">
      {/* Global Background Glow Shaders */}
      <div className="absolute top-[5%] left-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full filter blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full filter blur-[150px] pointer-events-none" />

      {/* ── HERO SECTION ── */}
      <section className="min-h-[calc(100vh-80px)] flex items-center px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative overflow-hidden pt-8 lg:pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-gutter items-center w-full">
          <div className="z-20 text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#c0c1ff]"></span>
              <span className="font-label-sm text-xs text-primary tracking-widest uppercase font-bold">Trusted by FIDE Arbiters</span>
            </div>
            
            <h1 className="font-headline-xl text-4xl sm:text-5xl lg:text-headline-xl mb-6 leading-tight tracking-tight text-white">
              India's <span className="gradient-text">Smartest</span> Chess Tournament Platform
            </h1>
            
            <p className="font-body-lg text-sm sm:text-base lg:text-body-lg text-on-surface-variant mb-10 max-w-xl font-medium leading-relaxed">
              Discover tournaments across India, analyze games with Stockfish 16, track real-time FIDE ratings, and accelerate your journey to Grandmaster.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handleExploreClick}
                className="px-8 sm:px-10 py-4 sm:py-5 bg-primary text-on-primary rounded-custom font-semibold text-base sm:text-lg hover:shadow-[0_0_40px_rgba(180,197,255,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                Explore Tournaments
                <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => navigate('/analysis')}
                className="px-8 sm:px-10 py-4 sm:py-5 glass-panel text-white rounded-custom font-semibold text-base sm:text-lg hover:bg-white/10 transition-all border border-white/10 active:scale-95"
              >
                Analyze a Game
              </button>
            </div>
          </div>

          {/* 3D King Canvas Side */}
          <div className="relative w-full h-[320px] sm:h-[450px] lg:h-[650px]">
            <ThreeChessKing />
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY STRIP ── */}
      <section className="py-16 md:py-24 border-y border-white/5 bg-surface-container-lowest/30 backdrop-blur-md">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <p className="font-label-sm text-2xs sm:text-xs text-on-surface-variant uppercase tracking-[0.2em] mb-12 opacity-80 font-bold">
            Official Partners & Associations
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-16 md:gap-20 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 max-w-4xl mx-auto px-4">
            <img alt="FIDE logo" className="h-10 sm:h-12 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfI_Ax5hkXsbfkW5R9XNcUn4D7oARLuFTHccdMM1rb_UU0uwAj5gRDThSYyWsrCGNqSiVsnFS9korvgi38g4CCpdPn3RTqhNUCI0WnYQtdgYiZQ4p1yT-qAjidRq3pjnYtE-kHb2qeTjDfwiSN_j7IhrX2-I1epCBq7wCbbr4T76yDz6MYif1dT3bYY3qC4O0RxuQ_wll79QfM-fC8bYL1e4q0l9giCBWMNpOh9rCxDEIj2w2XrIRezfwZ22blOyhEZMKJYSIb74VA"/>
            <img alt="AICF logo" className="h-12 sm:h-14 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQxEXK1kkDIgNEIZNcMtA4qiai7JwYrZnaT2uDcPzNHJNGKdb320f59g3GJjo0udxO7Dxhm6_nTnEL8IuHt2_2VbwivT7EBaKP34gGDuibSGPuHNTJRYf8JUwfFMXTZdeMnjIhQYutC1Yg7BjdebhFmIFrip-EJCfRlmfvPQ7tBP9Hsol4b7Mhm3JsbVb1DirjIMYwplrWWdwIEobYokzVPZLsdIVR7HzhVwCbQa0ImMzuxdU1FOdQKrISUenpwi6-7_-hENZhj5A8"/>
            <img alt="ChessBase logo" className="h-8 sm:h-10 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAW6Ax5vdp7tdo1TcuE5-Ce13neQpBl0QXb_6mAIad3eSgNyFdwCerS8g9Kcl2dvhzlWGKzxh0MtHS_TKKI8FP5vCfoOTfdYpXb7v3LpI_aHYaqW2QRU_JyJvgjD0M33RN-eqjrkmjcYauK5ReQECCDkyDIamAhW_ekqZNnpF3RXjrMRO_v0HWrjxWvWx4VTWwAyUzB_mBU-z-9lQDzQg8E4qDYtFnP5cnweEcM4GLN14XSyBYXoUCzi5t125dGKEot-4dDfE-Ty4zY"/>
            <img alt="Stockfish logo" className="h-10 sm:h-12 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYrO-CYBozIst7PD4HDbfSB_E2_mZlJIVRD6nPNrhTjoIrXXRuLU-zfgCVpjtlC780mJue3cnYfVa670OxF-85tU4cge2SnMSe3nELsFgd3tklfTNebUwYUftQBOo-Urz_vGlcGr35wF4ZxYDWh3lZhn_i0wBuBp6zY0O-thHWsHluP9BFMgFq2aZ0sQvDDd6-1lyMtuZB07C1cOueLpQIQZLYBsFTlDBWoL4pzN6FVLyG5EHa12vZmMbUQUWqOukG9g6PF035W4HM"/>
            <img alt="Lichess logo" className="h-10 sm:h-12 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2oQzrnKRouxfdkMPmSI-_Ek2tt2DMbUU6FrBsQ3Qoo89LlAbVrVD1EtTemefvbq_xv-mTYys4NsO88dFwwP0K7IbvaiNTUzc2gxECuDIeFFpRrmsMJfLZ3nVH1sKi2CorvqOUDBdBnkxIeJZ66yZPgqC5CHU8qYAZXuxmWqKHBTMTqzOiETTW8GGY4c6aGkHboaYPu2WBW9OvFQF1SWKmL9LGex7bJ-f0GwZt4TCANbcAHwKfDiEwrIB3Siot0Lc2yIrTHF0i085m"/>
          </div>
        </div>
      </section>

      {/* ── FEATURES BENTO GRID ── */}
      <section className="py-24 md:py-36 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="text-center mb-20 md:mb-24 scroll-reveal">
          <h2 className="font-headline-lg text-3xl sm:text-headline-lg mb-6 text-white">
            Precision Tools for the Modern <span className="gradient-text">Player</span>
          </h2>
          <p className="font-body-lg text-sm sm:text-base lg:text-body-lg text-on-surface-variant max-w-2xl mx-auto font-medium">
            Everything you need to manage your career and improve your game, powered by cutting-edge chess technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
          {/* Card 1: Tournament Discovery */}
          <div className="md:col-span-8 glass-panel rounded-custom p-8 sm:p-10 gradient-border glass-card-hover transition-all scroll-reveal group">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20">
                  <Trophy className="text-primary w-6 h-6" />
                </div>
                <h3 className="font-headline-md text-2xl font-bold text-white mb-4">Tournament Discovery</h3>
                <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-md font-medium leading-relaxed mb-8">
                  Browse hundreds of FIDE rated and open tournaments across 28 states. Filter by prize pool, location, and format categories.
                </p>
              </div>
              <div className="bg-surface-container/50 p-6 sm:p-8 rounded-[20px] border border-white/5 backdrop-blur-md">
                <div className="flex justify-between items-center text-xs sm:text-sm font-label-md mb-6">
                  <span className="text-on-surface-variant uppercase tracking-wider font-semibold">Live Tournament Map</span>
                  <span className="text-primary flex items-center gap-2 font-semibold">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#c0c1ff]"></span> 
                    42 Active Now
                  </span>
                </div>
                <div className="h-32 bg-surface-dim/50 rounded-xl overflow-hidden relative border border-white/5 flex items-center justify-center">
                  <div className="w-full h-full opacity-35 bg-primary/5 absolute inset-0" />
                  <span className="text-xs text-primary/40 font-mono tracking-widest z-10">INTEGRATED MAP MODULE</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Interactive Rating Calculator */}
          <div className="md:col-span-4 glass-panel rounded-custom p-8 sm:p-10 gradient-border glass-card-hover transition-all scroll-reveal" style={{ transitionDelay: '0.1s' }}>
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-8 border border-secondary/20">
              <Calculator className="text-secondary w-6 h-6" />
            </div>
            <h3 className="font-headline-md text-2xl font-bold text-white mb-4">Rating Calculator</h3>
            <p className="font-body-md text-sm sm:text-base text-on-surface-variant mb-8 font-medium leading-relaxed">
              Predict your FIDE rating changes instantly with our precise K-factor calculator. Drag the opponent slider:
            </p>

            <div className="space-y-6 bg-white/5 p-5 rounded-2xl border border-white/5">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-on-surface-variant font-bold">
                  <span>Opponent Rating</span>
                  <span className="text-secondary font-mono">{opponentRating}</span>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="2600"
                  step="10"
                  value={opponentRating}
                  onChange={(e) => setOpponentRating(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-secondary focus:outline-none"
                />
              </div>

              <div className="h-[1px] bg-white/5" />

              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xs text-on-surface-variant uppercase tracking-wider font-semibold">Your Rating</div>
                  <div className="text-lg font-bold text-white mt-0.5">{myRating}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xs text-secondary uppercase tracking-wider font-semibold">Projected Win</div>
                  <div className="text-lg font-bold text-secondary mt-0.5">{projectedRating} <span className="text-xs text-green-400 font-semibold">(+{change})</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Organizer Dashboard */}
          <div className="md:col-span-4 glass-panel rounded-custom p-8 sm:p-10 gradient-border glass-card-hover transition-all scroll-reveal" style={{ transitionDelay: '0.2s' }}>
            <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center mb-8 border border-tertiary/20">
              <Sparkles className="text-tertiary w-6 h-6" />
            </div>
            <h3 className="font-headline-md text-2xl font-bold text-white mb-4">Organizer Portal</h3>
            <p className="font-body-md text-sm sm:text-base text-on-surface-variant font-medium leading-relaxed">
              Host, manage, and livestream tournaments with seamless Swiss Manager integrations and digital arbitration forms.
            </p>
            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-tertiary font-bold tracking-wider uppercase">FIDE Compliant</span>
              <div className="w-2.5 h-2.5 rounded-full bg-tertiary shadow-[0_0_8px_#d2bbff]" />
            </div>
          </div>

          {/* Card 4: AI Analysis Preview */}
          <div className="md:col-span-8 glass-panel rounded-custom p-8 sm:p-10 gradient-border glass-card-hover transition-all scroll-reveal group" style={{ transitionDelay: '0.3s' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center h-full">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20">
                    <Sparkles className="text-primary w-6 h-6" />
                  </div>
                  <h3 className="font-headline-md text-2xl font-bold text-white mb-4">AI Game Analysis</h3>
                  <p className="font-body-md text-sm sm:text-base text-on-surface-variant font-medium leading-relaxed">
                    Upload PGNs and get deep insights. Identify blunders, missed wins, and tactical patterns with Stockfish 16.1 at 30+ depth.
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/analysis')}
                  className="mt-8 text-primary font-bold text-sm sm:text-base flex items-center gap-2 hover:gap-4 transition-all"
                >
                  Try Analysis Tool <ArrowRight size={16} />
                </button>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl blur-[80px] absolute inset-0 -z-10 opacity-60"></div>
                <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 rotate-2 group-hover:rotate-0 transition-transform duration-700 shadow-xl bg-surface/90">
                  <div className="flex gap-1.5 mb-5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                  </div>
                  <div className="space-y-3 font-mono text-2xs text-white/50">
                    <div className="flex justify-between text-green-400">
                      <span>1. e4 e5</span>
                      <span>Book</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>2. Nf3 Nc6</span>
                      <span>Best</span>
                    </div>
                    <div className="flex justify-between text-primary font-semibold">
                      <span>3. Bb5 a6</span>
                      <span>96.4% Acc</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOURNAMENT SHOWCASE (DYNAMIC QUERY) ── */}
      <section ref={tournamentsRef} className="py-24 relative bg-surface-container-lowest/10 border-y border-white/5">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6 scroll-reveal">
            <div>
              <h2 className="font-headline-lg text-3xl sm:text-headline-lg mb-4 text-white">
                Featured <span className="gradient-text">Tournaments</span>
              </h2>
              <p className="font-body-lg text-sm sm:text-base text-on-surface-variant max-w-xl font-medium">
                Join the best upcoming events and compete for grand prize pools across India.
              </p>
            </div>
          </div>

          {/* Dynamic search bar inside container */}
          <div className="mb-8 max-w-lg scroll-reveal">
            <div className="flex items-center rounded-xl overflow-hidden glass-input p-1">
              <div className="pl-3.5 text-white/30">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search by city, state or tournament..."
                className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none min-w-0"
              />
              <button
                onClick={handleSearch}
                className="px-5 py-2 bg-primary text-on-primary text-xs font-bold rounded-lg hover:opacity-90 transition-all active:scale-[0.98]"
              >
                Search
              </button>
            </div>
          </div>

          {/* Sticky filter bar inside dynamic showcase block */}
          <div className="mb-10 scroll-reveal">
            <TournamentFilters filters={filters} onChange={handleFilters} />
          </div>

          {/* Dynamic Grid Results */}
          <div className="relative z-10 scroll-reveal">
            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Spinner className="w-8 h-8 text-primary" />
              </div>
            ) : isError ? (
              <div className="backdrop-blur-md bg-white/[0.01] border border-white/5 rounded-2xl p-12 text-center">
                <EmptyState icon="⚠" title="Failed to load" subtitle="Please check your database connection and try again." />
              </div>
            ) : tournaments.length === 0 ? (
              <div className="backdrop-blur-md bg-white/[0.01] border border-white/5 rounded-2xl p-12 text-center">
                <EmptyState icon="♟" title="No tournaments found" subtitle="Try adjusting your filters or search query." />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                {tournaments.map(t => (
                  <TournamentCard key={t.id} tournament={t} />
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 scroll-reveal">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:border-primary hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-all"
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
                    {showEllipsis && <span className="text-white/20 px-1">…</span>}
                    <button
                      onClick={() => setPage(p as number)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-bold transition-all border ${
                        p === page
                          ? 'bg-primary border-primary text-on-primary shadow-md'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                );
              })}

              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:border-primary hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── PATH TO MASTERY TIMELINE ── */}
      <section className="py-24 md:py-36 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto overflow-hidden">
        <h2 className="font-headline-lg text-3xl sm:text-headline-lg mb-20 md:mb-32 text-center text-white scroll-reveal">
          Your Path to <span className="gradient-text">Mastery</span>
        </h2>
        <div className="relative">
          {/* Horizontal Line (Desktop only) */}
          <div className="absolute top-12 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent hidden md:block"></div>

          {/* Timeline Grid (Stacked on mobile, row on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-8 relative z-10">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center group scroll-reveal">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full glass-panel flex items-center justify-center mb-8 border border-primary/40 group-hover:bg-primary group-hover:text-on-primary group-hover:scale-110 transition-all duration-500 shadow-xl relative">
                <Search size={28} className="group-hover:text-on-primary text-primary transition-colors" />
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold border-4 border-background">
                  01
                </div>
              </div>
              <h4 className="font-headline-md text-lg sm:text-xl font-bold text-white mb-2">Find Tournament</h4>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant font-medium leading-relaxed px-4">
                Explore events by date, location, format, and rating.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center group scroll-reveal" style={{ transitionDelay: '0.1s' }}>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full glass-panel flex items-center justify-center mb-8 border border-primary/20 group-hover:bg-primary group-hover:text-on-primary group-hover:scale-110 transition-all duration-500 shadow-xl relative">
                <Check size={28} className="group-hover:text-on-primary text-primary transition-colors" />
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold border-4 border-background">
                  02
                </div>
              </div>
              <h4 className="font-headline-md text-lg sm:text-xl font-bold text-white mb-2">One-Click Register</h4>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant font-medium leading-relaxed px-4">
                Secure your tournament spot with integrated UPI gateways.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center group scroll-reveal" style={{ transitionDelay: '0.2s' }}>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full glass-panel flex items-center justify-center mb-8 border border-primary/20 group-hover:bg-primary group-hover:text-on-primary group-hover:scale-110 transition-all duration-500 shadow-xl relative">
                <Trophy size={28} className="group-hover:text-on-primary text-primary transition-colors" />
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold border-4 border-background">
                  03
                </div>
              </div>
              <h4 className="font-headline-md text-lg sm:text-xl font-bold text-white mb-2">Play & Compete</h4>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant font-medium leading-relaxed px-4">
                Join the venue and battle on the 64 squares.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center group scroll-reveal" style={{ transitionDelay: '0.3s' }}>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full glass-panel flex items-center justify-center mb-8 border border-primary/20 group-hover:bg-primary group-hover:text-on-primary group-hover:scale-110 transition-all duration-500 shadow-xl relative">
                <Sparkles size={28} className="group-hover:text-on-primary text-primary transition-colors" />
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold border-4 border-background">
                  04
                </div>
              </div>
              <h4 className="font-headline-md text-lg sm:text-xl font-bold text-white mb-2">Analyze Games</h4>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant font-medium leading-relaxed px-4">
                Review your matches with Stockfish and official arbiters.
              </p>
            </div>

            {/* Step 5 */}
            <div className="flex flex-col items-center text-center group scroll-reveal" style={{ transitionDelay: '0.4s' }}>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full glass-panel flex items-center justify-center mb-8 border border-primary/20 group-hover:bg-primary group-hover:text-on-primary group-hover:scale-110 transition-all duration-500 shadow-xl relative">
                <Trophy size={28} className="group-hover:text-on-primary text-primary transition-colors" />
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold border-4 border-background">
                  05
                </div>
              </div>
              <h4 className="font-headline-md text-lg sm:text-xl font-bold text-white mb-2">Improve Rating</h4>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant font-medium leading-relaxed px-4">
                Watch your FIDE progress with real-time analytics updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI PREVIEW PANEL ── */}
      <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="glass-panel rounded-[32px] sm:rounded-[40px] p-2 border border-white/10 shadow-3xl relative overflow-hidden scroll-reveal">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-[28px] sm:rounded-[36px]">
            {/* Left Box: Image representation */}
            <div className="lg:col-span-7 bg-[#0f1217] p-8 sm:p-12 flex items-center justify-center relative min-h-[300px] sm:min-h-[450px]">
              <div className="absolute top-6 left-6 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse shadow-[0_0_10px_#ffb4ab]"></div>
                <span className="text-2xs font-bold text-white/60 tracking-widest uppercase">Live Engine Active</span>
              </div>
              <img 
                alt="Chess AI Interface" 
                className="w-full max-w-[420px] aspect-square rounded-xl shadow-2xl border border-white/5 object-cover" 
                src="/chess-ai-interface.png"
              />
            </div>
            
            {/* Right Box: Engine Stats */}
            <div className="lg:col-span-5 bg-surface-container-high/80 backdrop-blur-xl p-8 sm:p-12 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-10">
                  <h3 className="font-headline-md text-2xl font-bold text-white">Stockfish Analysis</h3>
                  <div className="bg-primary/20 text-primary px-4 py-1.5 rounded-lg text-sm font-bold border border-primary/20">+2.45</div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex justify-between text-xs sm:text-sm mb-3 font-bold">
                      <span className="text-on-surface-variant uppercase tracking-wider">Accuracy</span>
                      <span className="text-primary font-mono">94.2%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-secondary w-[94%]"></div>
                    </div>
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center text-xs sm:text-sm font-bold">
                    <span className="text-on-surface-variant uppercase tracking-wider">Great Moves</span>
                    <span className="text-tertiary font-mono">12</span>
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/15 flex justify-between items-center text-xs sm:text-sm font-bold">
                    <span className="text-red-400 uppercase tracking-wider">Blunders</span>
                    <span className="text-red-400 font-bold font-mono">0</span>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <p className="font-body-md text-on-surface-variant mb-8 italic leading-relaxed text-base sm:text-lg">
                  "White's position is dominant. The knight on f5 creates overwhelming pressure on the g7 square."
                </p>
                <button 
                  onClick={() => navigate('/analysis')}
                  className="w-full py-4 sm:py-5 rounded-2xl bg-primary text-on-primary font-bold text-base hover:shadow-[0_10px_30px_rgba(180,197,255,0.3)] transition-all active:scale-95"
                >
                  Export Detailed Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS COUNTERS ── */}
      <section className="py-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          <div className="scroll-reveal">
            <div className="font-headline-xl text-4xl sm:text-5xl lg:text-7xl font-bold gradient-text mb-3">5M+</div>
            <div className="font-label-md text-2xs sm:text-xs text-on-surface-variant uppercase tracking-[0.2em] font-bold">Moves Analyzed</div>
          </div>
          <div className="scroll-reveal" style={{ transitionDelay: '0.1s' }}>
            <div className="font-headline-xl text-4xl sm:text-5xl lg:text-7xl font-bold gradient-text mb-3">28</div>
            <div className="font-label-md text-2xs sm:text-xs text-on-surface-variant uppercase tracking-[0.2em] font-bold">Indian States</div>
          </div>
          <div className="scroll-reveal" style={{ transitionDelay: '0.2s' }}>
            <div className="font-headline-xl text-4xl sm:text-5xl lg:text-7xl font-bold gradient-text mb-3">150+</div>
            <div className="font-label-md text-2xs sm:text-xs text-on-surface-variant uppercase tracking-[0.2em] font-bold">FIDE Arbiters</div>
          </div>
          <div className="scroll-reveal" style={{ transitionDelay: '0.3s' }}>
            <div className="font-headline-xl text-4xl sm:text-5xl lg:text-7xl font-bold gradient-text mb-3">95%</div>
            <div className="font-label-md text-2xs sm:text-xs text-on-surface-variant uppercase tracking-[0.2em] font-bold">User Accuracy</div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <h2 className="font-headline-lg text-3xl sm:text-headline-lg mb-20 text-center text-white scroll-reveal">
          Voices of the <span className="gradient-text">Prodigies</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Testimonial 1 */}
          <div className="glass-panel p-8 sm:p-12 rounded-custom scroll-reveal border border-white/5 flex flex-col justify-between">
            <p className="font-body-lg text-on-surface-variant italic leading-relaxed text-base sm:text-lg lg:text-xl font-medium mb-8">
              "ChessMate changed how I prepare for national tournaments. The tournament discovery is seamless, and the AI analysis is easily the most accurate I've used on any platform."
            </p>
            <div className="flex items-center gap-6">
              <img 
                alt="Aditya V." 
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/30" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAlx0Bj06Dkg3X-M2w1F2zfCIYxaSZJDM4wRBiU1NvKbc3UDxdrJUHrY0zifoYhiB_lVcqZ1L71loWzJazjXapdcAe1krQHZ2oPQ_x402BCG3vxXeon2fqKPg6PoqdaSsBErGT7AUinBwc4dNfftktKrST3CXjuANBiFZCBRBNy8J1F91_1ugDqZQ6aUGaTQKnox6OuttSDYVwat5Tii0fq2Lrb69df6wrFxFvNJEdCcv5CrWy4ot3rbNJylg2LUsJDZ2wwB1TeRHc"
              />
              <div>
                <h4 className="font-headline-md text-lg font-bold text-white">Aditya V.</h4>
                <p className="text-primary text-2xs sm:text-xs font-bold uppercase tracking-wider mt-1">FIDE Candidate Master (Rating: 2240)</p>
              </div>
            </div>
          </div>
          
          {/* Testimonial 2 */}
          <div className="glass-panel p-8 sm:p-12 rounded-custom scroll-reveal border border-white/5 flex flex-col justify-between" style={{ transitionDelay: '0.1s' }}>
            <p className="font-body-lg text-on-surface-variant italic leading-relaxed text-base sm:text-lg lg:text-xl font-medium mb-8">
              "As an organizer and a player, ChessMate provides a unified experience that India's chess community has needed for a long time. Highly recommended for serious Grandmaster aspirants."
            </p>
            <div className="flex items-center gap-6">
              <img 
                alt="Priyanka K." 
                className="w-16 h-16 rounded-full object-cover border-2 border-tertiary/30" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUwxsxg4t0F_s8oTWvTV5LKSnt7rEofuTZQIqmfkYaDcYywdTbowKYQXynWOJ0jdGxbiDDxkbilrbRfpMBtK4nS0215mjf-jBTHvk9IPZdE13g0RoNQkpAZLarJK4lmEnmc6nDiB8zO7M63Zzos1Uq7CQvidJXZJ7TXHtaTPKhUFAJMUOFLfrJQadz1nJ3UMHGpqWm-kTzIhGbwKsm31nPg0IMvRM_THQEtO_Stf57GlGB-X4HIDemuwfiVd63opRmsOyIMfmZIash"
              />
              <div>
                <h4 className="font-headline-md text-lg font-bold text-white">Priyanka K.</h4>
                <p className="text-tertiary text-2xs sm:text-xs font-bold uppercase tracking-wider mt-1">Woman Grandmaster (Rating: 2385)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-5xl mx-auto glass-panel rounded-[32px] sm:rounded-[48px] p-10 sm:p-16 md:p-20 text-center relative overflow-hidden scroll-reveal border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-secondary/25 pointer-events-none opacity-45"></div>
          <div className="relative z-10">
            <h2 className="font-headline-xl text-3xl sm:text-4xl lg:text-6xl mb-6 text-white leading-tight font-bold">
              Ready to Elevate Your <br/><span className="gradient-text">Chess Journey?</span>
            </h2>
            <p className="font-body-lg text-sm sm:text-base lg:text-lg text-on-surface-variant mb-12 max-w-xl mx-auto font-medium">
              Join 20,000+ players today and master the board with technical elegance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <Link 
                to="/login?tab=register"
                className="px-10 py-4.5 bg-primary text-on-primary rounded-full font-bold text-base sm:text-lg hover:shadow-[0_0_40px_rgba(180,197,255,0.5)] hover:scale-105 transition-all active:scale-95 text-center"
              >
                Start Free Today
              </Link>
              <a 
                href="mailto:support@chessmate.in"
                className="px-10 py-4.5 glass-panel text-white rounded-full font-bold text-base sm:text-lg hover:bg-white/10 transition-all border border-white/10 active:scale-95 text-center"
              >
                Contact Support
              </a>
            </div>
          </div>
          
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-secondary/20 rounded-full blur-[120px] pointer-events-none"></div>
        </div>
      </section>
    </div>
  );
}
