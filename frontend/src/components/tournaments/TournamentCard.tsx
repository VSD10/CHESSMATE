import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Trophy, Play, CheckCircle2, Ticket } from 'lucide-react';
import { Tournament } from '@/types';

// Beautiful fallbacks for chess tournaments from the mockup assets
const FALLBACK_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCYqBOp57s5H3M4e6ENCfV9jxO9gbQhmjx4Aah5WRDEFkCdE3j3_jqiwfxFHDfA5RAWdlv8n9Dpg55sXB4Z5KiBJeJFTcFpPlGzK8U_ZQAyHZbt6effXKh5yiYzwQTtrsP4aBoIi9ggCAIOn6On3pEICK6TbsTA7U2Z8PZiMmGg16rVBS4xQs8dReZuA-_tzu3V0yyyMjheM8sBMJms0fOgbWoaxJ2dumDbupISdHI4tPfrKRoOw9wU6B6OTd20fzd0g43FnIprPBMI',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDlTuo8yDNMiZ0LkqTMrdcR4Z9R7KRIyZuhg3RfVg1nkdhEtLfeW7DozLy_Nk4dWI5B0ppoocNNrBgVxDYodv_8WoS00zCsF9b_twt-kaABNuIzImRVmUfMPhm-kjl0CU0KjaMRZ7UOIbGH1f3NiJvyBOhdAcxX5W-AVgzw4szrSfGJoWUtTAeHrXpqSy61NYFj1L_0NAIuIGEmxhwIKQHIvy3HCAEV-eR3Yd8bwAMQskgxkPvV2C071NxQMu2HNSrAY3NwCDFl7nHL',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCvR6KXTqeO3om9RlFGzZrrL32r-pJHK5RN7AFH622t7RFvptCVYkMYkLbG2lyp_HsS0g0TvWs1_ZoYhrUDnCg6bpQyifCqQqEzZdaGVE64yvB4SUqAAol19g2Kyqf_s9k_LDiNh80UtG6V9OfvYFPFnouNnCBgtAXNWLOdNu-5ykAwa_AnmrHmlhDDInGdWuI2ISNqJzyQUHr4opL7k5OcrVEUMga3YZ9jcwwekt3dNK9ctHdfm13pIZw_7U1DFqch8sOq9DV-oHR'
];

export default function TournamentCard({ tournament }: { tournament: Tournament }) {
  const navigate = useNavigate();

  const dateStr = (() => {
    const s = new Date(tournament.startDate);
    const e = new Date(tournament.endDate);
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    if (s.getFullYear() !== e.getFullYear())
      return `${s.toLocaleDateString('en-IN', { ...opts, year: 'numeric' })} – ${e.toLocaleDateString('en-IN', { ...opts, year: 'numeric' })}`;
    return `${s.toLocaleDateString('en-IN', opts)} – ${e.toLocaleDateString('en-IN', { ...opts, year: 'numeric' })}`;
  })();

  // Dynamically assign or fallback image
  const fallbackIndex = Math.abs(tournament.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % FALLBACK_IMAGES.length;
  const imageUrl = tournament.posterUrl || FALLBACK_IMAGES[fallbackIndex];

  // Helper properties based on status
  const isOngoing = tournament.status === 'ONGOING';
  const isCompleted = tournament.status === 'COMPLETED';
  const isOpen = tournament.status === 'OPEN';

  return (
    <div
      onClick={() => navigate(`/tournaments/${tournament.slug}`)}
      className="glass-panel rounded-custom overflow-hidden group cursor-pointer border border-white/10 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between h-full hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:border-primary/30 relative"
    >
      {/* Decorative gradient background glow on card hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div>
        {/* Banner Image & Badges */}
        <div className="h-44 sm:h-52 relative overflow-hidden">
          <img
            alt={tournament.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.2s] ease-out"
            src={imageUrl}
          />
          {/* Overlay to darken image slightly for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#101418]/90 via-transparent to-black/30" />

          {/* FIDE Rated Badge - Top Left */}
          <div className="absolute top-4 left-4 flex items-center gap-1 bg-[#101418]/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full shadow-lg">
            <span className="text-2xs font-bold text-white uppercase tracking-wider font-mono">
              {tournament.fideRated ? '⭐ FIDE Rated' : '♟ Open Circuit'}
            </span>
          </div>

          {/* Status Badge - Top Right */}
          <div className="absolute top-4 right-4">
            {isOngoing && (
              <span className="flex items-center gap-1.5 bg-red-950/80 border border-red-500/30 text-red-400 px-3.5 py-1 rounded-full text-2xs font-black uppercase tracking-widest shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                Live Now
              </span>
            )}
            {isCompleted && (
              <span className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/20 text-white/70 px-3 py-1 rounded-full text-2xs font-bold uppercase tracking-widest shadow-md">
                Archived
              </span>
            )}
            {isOpen && (
              <span className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 px-3.5 py-1 rounded-full text-2xs font-black uppercase tracking-widest shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                Registering
              </span>
            )}
            {!isOngoing && !isCompleted && !isOpen && (
              <span className="flex items-center gap-1 bg-blue-950/80 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-2xs font-bold uppercase tracking-widest shadow-md">
                Scheduled
              </span>
            )}
          </div>

          {/* Emoji Badge floating on bottom-right of banner */}
          <div className="absolute bottom-3 right-4 w-9 h-9 rounded-full bg-white/5 backdrop-blur-md border border-white/15 flex items-center justify-center text-lg shadow-md group-hover:scale-110 transition-transform duration-300">
            {tournament.emoji}
          </div>
        </div>

        {/* Info Content */}
        <div className="p-6 sm:p-7 relative z-10">
          <h3 className="font-headline-md text-lg sm:text-xl font-bold leading-snug text-white line-clamp-2 group-hover:text-primary transition-colors duration-300 mb-2">
            {tournament.name}
          </h3>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xs text-on-surface-variant font-bold tracking-wider uppercase font-mono bg-white/5 px-2 py-0.5 rounded">
              {tournament.format.replace('_', ' ')}
            </span>
            <span className="text-2xs text-on-surface-variant font-bold tracking-wider uppercase font-mono bg-white/5 px-2 py-0.5 rounded">
              {tournament.category}
            </span>
          </div>

          {/* Prize Pool Display */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Trophy size={14} />
            </div>
            <div>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold font-mono leading-none">Prize Pool</p>
              <p className="text-base sm:text-lg font-headline-md font-extrabold text-primary leading-tight mt-0.5">
                {tournament.prizePool}
              </p>
            </div>
          </div>

          {/* Venue & Date Details */}
          <div className="space-y-3 border-t border-white/5 pt-4">
            <div className="flex items-center gap-3 text-xs text-on-surface-variant font-semibold">
              <MapPin size={14} className="text-primary flex-shrink-0" />
              <span className="truncate">{tournament.city}, {tournament.state}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-on-surface-variant font-semibold">
              <Calendar size={14} className="text-primary flex-shrink-0" />
              <span>{dateStr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Button footer actions tailored by status */}
      <div className="px-6 sm:px-7 pb-6 sm:pb-7 relative z-10">
        {isOngoing && (
          <button
            className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-red-500/20 bg-red-950/20 hover:bg-red-500 hover:text-white hover:border-red-500 shadow-md flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse"
            onClick={(e) => { e.stopPropagation(); navigate(`/tournaments/${tournament.slug}`); }}
          >
            <Play size={12} fill="currentColor" /> Watch Round Live
          </button>
        )}

        {isCompleted && (
          <button
            className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center gap-1.5"
            onClick={(e) => { e.stopPropagation(); navigate(`/tournaments/${tournament.slug}`); }}
          >
            <CheckCircle2 size={12} /> View Leaderboards
          </button>
        )}

        {!isOngoing && !isCompleted && (
          <button
            className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 ${
              isOpen
                ? 'bg-primary border-primary text-on-primary hover:bg-white/10 hover:text-primary hover:border-primary shadow-lg hover:shadow-[0_0_15px_rgba(192,193,255,0.3)]'
                : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
            }`}
            onClick={(e) => { e.stopPropagation(); navigate(`/tournaments/${tournament.slug}`); }}
          >
            <Ticket size={12} /> {isOpen ? 'Secure Entry / Register' : 'View Schedule Details'}
          </button>
        )}
      </div>
    </div>
  );
}
