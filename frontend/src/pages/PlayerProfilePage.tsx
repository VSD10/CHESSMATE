import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { 
  Trophy, MapPin, Calendar, Award, User, RefreshCw, Copy,
  BookOpen, ChevronRight, Play, CheckCircle2, Sliders, TrendingUp, HelpCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { PlayerProfile, TournamentsResponse } from '@/types';
import { Spinner, RatingDelta, EmptyState } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';



const OPENING_PRESETS = [
  { label: 'Ruy Lopez', moves: 'e4 e5 Nf3 Nc6 Bb5' },
  { label: 'Sicilian Najdorf', moves: 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6' },
  { label: 'King\'s Indian Defence', moves: 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6' },
  { label: 'Queen\'s Gambit Accepted', moves: 'd4 d5 c4 dxc4 Nf3 Nf6 e3' },
  { label: 'Caro-Kann Defence', moves: 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5' }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="glass-panel border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs">
      <p className="text-on-surface-variant font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white font-semibold mb-0.5 truncate max-w-[200px]">{data.name}</p>
      <p className="font-headline-md text-base font-extrabold text-primary">{data.rating} ELO</p>
    </div>
  );
};

export default function PlayerProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Tabs for history vs chart
  const [activeTab, setActiveTab] = useState<'CHART' | 'ATTENDED' | 'FUTURE'>('CHART');

  // Interactive chessboard states
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [selectedOpening, setSelectedOpening] = useState('');
  const [boardWidth, setBoardWidth] = useState(340);
  
  const boardContainerRef = useRef<HTMLDivElement>(null);

  // Resize board container dynamically to ensure 100% responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (boardContainerRef.current) {
        const width = Math.max(260, Math.min(420, boardContainerRef.current.clientWidth - 32));
        setBoardWidth(width);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Copy player code to clipboard
  const [copied, setCopied] = useState(false);
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fetch player details
  const { data: profile, isLoading, isError } = useQuery<PlayerProfile>({
    queryKey: ['player', username],
    queryFn: async () => {
      const res = await api.get(`/players/${username}`);
      return res.data;
    },
  });

  // Query recommended future tournaments from catalog
  const { data: recommendedData } = useQuery<TournamentsResponse>({
    queryKey: ['profile-recommended-events'],
    queryFn: async () => {
      const res = await api.get('/tournaments', { params: { limit: 3, status: 'UPCOMING' } });
      return res.data;
    }
  });

  const recommendedTourneys = recommendedData?.data || [];

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[50vh] text-primary">
      <Spinner className="w-9 h-9" />
    </div>
  );

  if (!profile || isError) return (
    <div className="max-w-container-max mx-auto py-20 px-margin-mobile">
      <EmptyState icon="👤" title="Player not found" subtitle="We couldn't locate this user profile in ChessMate. Check the username or player code." />
    </div>
  );

  // Chart data formatting
  const chartData = profile.ratingHistory.map(e => ({
    date: new Date(e.date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    rating: e.rating,
    name: e.tournamentName,
  }));

  // Handle pieces drops on custom analysis board
  const makeAMove = (move: any) => {
    try {
      const result = game.move(move);
      setFen(game.fen());
      if (result) {
        setMoveHistory(game.history());
      }
      return result;
    } catch {
      return null;
    }
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });
    return move !== null;
  };

  const resetBoard = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setMoveHistory([]);
    setSelectedOpening('');
  };

  const flipBoard = () => {
    setOrientation(o => o === 'white' ? 'black' : 'white');
  };

  const handleOpeningChange = (openingName: string) => {
    setSelectedOpening(openingName);
    const selected = OPENING_PRESETS.find(o => o.label === openingName);
    if (!selected) return;

    const newGame = new Chess();
    const moves = selected.moves.split(' ');
    for (const m of moves) {
      try {
        newGame.move(m);
      } catch {
        break;
      }
    }
    setGame(newGame);
    setFen(newGame.fen());
    setMoveHistory(newGame.history());
  };

  const stats = [
    { label: 'Current ELO', value: profile.currentRating, sub: 'FIDE Active', icon: <TrendingUp size={16} />, color: 'text-primary' },
    { label: 'Peak ELO', value: profile.peakRating, sub: 'All-Time High', icon: <Trophy size={16} />, color: 'text-yellow-400' },
    { label: 'Total Events', value: profile.totalTournaments, sub: 'Circuits Played', icon: <Award size={16} />, color: 'text-blue-400' },
    { label: 'Win Rate', value: `${profile.winRate}%`, sub: 'Positional Victory', icon: <Sliders size={16} />, color: 'text-emerald-400' },
  ];

  return (
    <div className="relative text-on-background bg-background min-h-screen pb-20">
      {/* Background glow filters */}
      <div className="absolute top-[10%] left-[-15%] w-[500px] h-[500px] bg-primary/5 rounded-full filter blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-15%] w-[500px] h-[500px] bg-secondary/5 rounded-full filter blur-[150px] pointer-events-none" />

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 relative z-10">
        
        {/* Profile Card Hero */}
        <div className="glass-panel p-6 sm:p-8 rounded-custom border border-white/10 mb-8 relative overflow-hidden shadow-2xl">
          {/* Subtle accent border */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary via-secondary to-tertiary" />
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            {/* Avatar block */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-primary/20 to-secondary/20 border-2 border-primary/30 flex items-center justify-center font-headline-xl text-3xl font-extrabold text-primary flex-shrink-0 shadow-lg relative group">
              <div className="absolute inset-0 bg-primary/10 rounded-3xl blur group-hover:blur-md transition-all" />
              <span className="relative z-10">{profile.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}</span>
            </div>

            {/* Profile main details */}
            <div className="flex-1 text-center md:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-2xs font-bold text-on-surface-variant font-mono uppercase tracking-wider">
                  <User size={10} className="text-primary" /> FIDE Registered
                </div>
                {profile.playerCode && (
                  <button
                    onClick={() => copyCode(profile.playerCode)}
                    className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:via-yellow-300 hover:to-amber-500 border border-yellow-200/50 text-xs font-black text-amber-950 font-mono tracking-widest transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(251,191,36,0.5)] cursor-pointer overflow-hidden group shadow-lg"
                    title="Click to copy ChessMate ID"
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
                    
                    {/* Live dot */}
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-900 opacity-60"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-950"></span>
                    </span>
                    
                    <span className="relative z-10 flex items-center gap-2 drop-shadow-sm">
                      ID: {profile.playerCode}
                      <Copy size={14} className="opacity-70 group-hover:opacity-100 transition-opacity group-active:scale-90" />
                    </span>

                    {/* Copied state overlay */}
                    <div className={`absolute inset-0 z-20 flex items-center justify-center gap-1.5 bg-emerald-500 text-white font-black rounded-full transition-opacity duration-300 ${copied ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                      <CheckCircle2 size={14} /> COPIED!
                    </div>
                  </button>
                )}
              </div>
              <h1 className="font-headline-lg text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-2 leading-none">
                {profile.user.name}
              </h1>
              <p className="text-xs text-on-surface-variant font-semibold mb-4 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <span>FIDE ID: <span className="font-mono text-white bg-white/5 px-2 py-0.5 rounded border border-white/5">{profile.user.fideId || 'N/A'}</span></span>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1"><MapPin size={12} className="text-primary" /> India</span>
              </p>
              {profile.bio && (
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed italic border-l-2 border-white/10 pl-4 py-1 text-left max-w-3xl">
                  "{profile.bio}"
                </p>
              )}
            </div>
            {user?.username === profile.username && (
              <button className="flex-shrink-0 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs text-white font-bold hover:bg-white/10 active:scale-95 transition-all shadow-md cursor-pointer">
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* ELO Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((item, idx) => (
            <div 
              key={idx} 
              className="glass-panel p-5 rounded-custom border border-white/10 flex items-center gap-4 hover:border-primary/20 transition-all shadow-xl group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant group-hover:scale-105 transition-transform flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-extrabold font-mono leading-none">{item.label}</p>
                <p className={`text-2xl font-headline-md font-black mt-1 leading-none ${item.color}`}>
                  {item.value}
                </p>
                <p className="text-[10px] text-on-surface-variant/70 mt-1 font-semibold leading-none">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard Main layout: Grid with Left columns containing timeline tabs & Right column containing interactive board */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: Tabs and Content (8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            
            {/* Tabs Selector Navigation */}
            <div className="glass-panel p-2 rounded-2xl border border-white/10 flex items-center gap-2 shadow-xl">
              {[
                { id: 'CHART', label: 'ELO Chart' },
                { id: 'ATTENDED', label: 'Attended Events' },
                { id: 'FUTURE', label: 'Future Registers' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-3 text-center rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-primary text-on-primary font-black shadow-lg scale-102'
                      : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content panel */}
            <div className="glass-panel p-6 sm:p-8 rounded-custom border border-white/10 shadow-2xl min-h-[350px]">
              
              {/* Tab 1: Rating Progression Chart */}
              {activeTab === 'CHART' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase font-mono">Rating Curve</h3>
                      <p className="text-2xs text-on-surface-variant mt-0.5">Historical ELO progression curve since FIDE registrations.</p>
                    </div>
                    <span className="text-xs text-primary font-bold font-mono">Peak: {profile.peakRating}</span>
                  </div>
                  
                  {profile.ratingHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 border border-white/5 rounded-xl bg-white/5 border-dashed mt-4">
                      <p className="text-xs text-on-surface-variant font-mono">No rating history available yet.</p>
                      {user?.username === profile.username && (
                        <p className="text-2xs text-white/50 mt-1">Play in tournaments to build your ELO chart!</p>
                      )}
                    </div>
                  ) : (
                    <div className="h-64 sm:h-72 w-full pt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#c0c1ff" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#c0c1ff" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                          <XAxis dataKey="date" tick={{ fill: '#908fa0', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#908fa0', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} domain={['dataMin - 40', 'dataMax + 40']} />
                          <Tooltip content={<CustomTooltip />} />
                          <ReferenceLine y={profile.peakRating} stroke="rgba(234, 179, 8, 0.3)" strokeDasharray="4 4" label={{ value: 'Peak', fill: '#eab308', fontSize: 9, position: 'top', fontWeight: 600 }} />
                          <Line 
                            type="monotone" 
                            dataKey="rating" 
                            stroke="#c0c1ff" 
                            strokeWidth={3}
                            dot={{ fill: '#8083ff', r: 4, stroke: '#101418', strokeWidth: 2 }}
                            activeDot={{ r: 7, fill: '#c0c1ff', stroke: '#101418', strokeWidth: 2 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Attended Tournaments list */}
              {activeTab === 'ATTENDED' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase font-mono">Attended Circuits</h3>
                    <p className="text-2xs text-on-surface-variant mt-0.5">Chronological record of FIDE and Open tournaments played.</p>
                  </div>
                  
                  <div className="overflow-x-auto -mx-2">
                    {profile.ratingHistory.length === 0 ? (
                      <div className="py-10 text-center border border-white/5 rounded-xl bg-white/5 border-dashed">
                        <p className="text-xs text-on-surface-variant font-mono">No tournaments attended yet.</p>
                      </div>
                    ) : (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-on-surface-variant border-b border-white/5 text-left font-mono font-bold uppercase tracking-wider text-[10px]">
                            <th className="pb-3 pl-2">Tournament Arena</th>
                            <th className="pb-3 pr-2">Date Concluded</th>
                            <th className="pb-3">Final ELO</th>
                            <th className="pb-3 text-right pr-2">Rating Delta</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...profile.ratingHistory].reverse().map((entry, idx) => (
                            <tr key={entry.id || idx} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                              <td className="py-3 pl-2 pr-3">
                                <span className="text-white font-bold leading-normal truncate block max-w-[160px] sm:max-w-[240px]">
                                  {entry.tournamentName || 'Tournament Open'}
                                </span>
                              </td>
                              <td className="py-3 pr-2 font-mono text-on-surface-variant">
                                {new Date(entry.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                              </td>
                              <td className="py-3 font-bold font-mono text-white">{entry.rating}</td>
                              <td className="py-3 text-right pr-2">
                                <RatingDelta delta={entry.delta} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Future Events (Recommended / Registered) */}
              {activeTab === 'FUTURE' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase font-mono">Future Registrations</h3>
                    <p className="text-2xs text-on-surface-variant mt-0.5">Recommended upcoming championships currently accepting entries.</p>
                  </div>

                  <div className="space-y-4">
                    {recommendedTourneys.length === 0 ? (
                      <p className="text-xs text-on-surface-variant py-10 text-center font-mono">No upcoming events scheduled currently.</p>
                    ) : (
                      recommendedTourneys.map(t => (
                        <div 
                          key={t.id}
                          className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                              {t.emoji}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[220px] sm:max-w-[320px]">
                                {t.name}
                              </h4>
                              <p className="text-[10px] text-on-surface-variant font-semibold flex items-center gap-2 mt-1">
                                <span className="flex items-center gap-0.5"><MapPin size={10} /> {t.city}, {t.state}</span>
                                <span>•</span>
                                <span className="text-primary font-bold">{t.prizePool}</span>
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => navigate(`/tournaments/${t.slug}`)}
                            className="px-4 py-2 bg-primary text-on-primary text-2xs font-extrabold uppercase rounded-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 w-fit cursor-pointer flex-shrink-0"
                          >
                            Register <ChevronRight size={10} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT SIDE: Dedicated Interactive Board Block (5 cols) */}
          <div className="lg:col-span-5 xl:col-span-4" ref={boardContainerRef}>
            <div className="glass-panel p-5 rounded-custom border border-white/10 shadow-2xl relative">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={16} className="text-primary" />
                <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider font-mono">
                  Tactics & openings
                </h3>
              </div>

              {/* Chess Board Container */}
              <div className="flex justify-center border border-white/10 rounded-xl overflow-hidden bg-black/35 p-3 relative shadow-inner">
                <Chessboard
                  position={fen}
                  onPieceDrop={onDrop}
                  boardWidth={boardWidth}
                  boardOrientation={orientation}
                  customBoardStyle={{
                    borderRadius: '8px',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
                  }}
                  customDarkSquareStyle={{ backgroundColor: '#2e3b5e' }}
                  customLightSquareStyle={{ backgroundColor: '#e2e8f0' }}
                />
              </div>

              {/* Control Utilities */}
              <div className="mt-4 flex flex-wrap gap-2.5 items-center justify-between border-t border-white/5 pt-4">
                <button
                  onClick={resetBoard}
                  className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-2xs font-bold text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Reset Board"
                >
                  <RefreshCw size={12} /> Reset
                </button>
                <button
                  onClick={flipBoard}
                  className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-2xs font-bold text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Flip Board Side"
                >
                  Flip Board
                </button>
              </div>

              {/* Opening Presets Loader */}
              <div className="mt-4 space-y-2">
                <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-extrabold font-mono">Study Opening Preset</label>
                <select
                  value={selectedOpening}
                  onChange={e => handleOpeningChange(e.target.value)}
                  className="w-full glass-select text-white text-2xs rounded-xl px-3 py-2.5 cursor-pointer outline-none focus:border-primary/50"
                >
                  <option value="">-- Load Chess Opening --</option>
                  {OPENING_PRESETS.map(o => (
                    <option key={o.label} value={o.label}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Move Logs History */}
              <div className="mt-4 space-y-2">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-extrabold font-mono">Move Notation Log</p>
                <div className="h-16 overflow-y-auto bg-black/40 border border-white/5 rounded-xl p-2.5 font-mono text-[10px] text-white/80 leading-relaxed scrollbar-thin">
                  {moveHistory.length === 0 ? (
                    <span className="text-white/30 italic">Drag pieces to record game moves...</span>
                  ) : (
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                      {moveHistory.map((mv, i) => (
                        <span key={i} className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                          {i % 2 === 0 ? `${Math.floor(i / 2) + 1}.` : ''} {mv}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
