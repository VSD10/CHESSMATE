import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Calendar, Share2, ExternalLink, Trophy } from 'lucide-react';
import { api } from '@/lib/api';
import { Tournament } from '@/types';
import { Spinner } from '@/components/ui';

export default function TournamentDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: tournament, isLoading, isError } = useQuery<Tournament>({
    queryKey: ['tournament', slug],
    queryFn: async () => {
      const res = await api.get(`/tournaments/${slug}`);
      return res.data;
    },
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh] bg-background">
      <Spinner className="w-8 h-8 text-primary" />
    </div>
  );

  if (isError || !tournament) return (
    <div className="max-w-5xl mx-auto px-margin-mobile py-24 text-center bg-background">
      <p className="text-on-surface-variant text-sm mb-6">Tournament not found.</p>
      <button 
        onClick={() => navigate('/')} 
        className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold text-xs hover:shadow-[0_0_20px_rgba(180,197,255,0.2)] transition-all"
      >
        ← Back to Tournaments
      </button>
    </div>
  );

  const detail = tournament.detail;
  const prizes = (detail?.prizes as Array<{ position: string; amount: string }>) || [];

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Open
          </span>
        );
      case 'ONGOING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_6px_#f59e0b]" />
            Live
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold bg-white/5 text-white/40 border border-white/5">
            Done
          </span>
        );
      case 'UPCOMING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold bg-white/5 text-white/60 border border-white/10">
            Upcoming
          </span>
        );
    }
  };

  const renderFormatBadge = (format: string, fideRated: boolean) => {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 text-white/70 text-2xs border border-white/10">
        {format.replace('_', ' ')}
        {fideRated && <span className="text-primary font-black">· FIDE</span>}
      </span>
    );
  };

  return (
    <div className="relative bg-background min-h-screen text-on-background pb-20">
      {/* Glow decorations */}
      <div className="absolute top-[10%] left-[-10%] w-[350px] h-[350px] bg-primary/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[30%] right-[-10%] w-[350px] h-[350px] bg-secondary/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 animate-slide-up relative z-10">
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors mb-6 group font-semibold"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Tournaments
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* MAIN COLUMN */}
          <div className="space-y-8">
            {/* Header Panel Card */}
            <div className="glass-panel rounded-custom p-6 sm:p-8 border border-white/10 relative overflow-hidden flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl sm:text-5xl shadow-inner flex-shrink-0 animate-float">
                {tournament.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
                  {renderStatusBadge(tournament.status)}
                  {renderFormatBadge(tournament.format, tournament.fideRated)}
                </div>
                <h1 className="font-headline-lg text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-snug mb-3">
                  {tournament.name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-on-surface-variant font-medium">
                  <span className="flex items-center gap-2">
                    <MapPin size={14} className="text-primary" />
                    {tournament.city}, {tournament.state}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar size={14} className="text-primary" />
                    {new Date(tournament.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' – '}
                    {new Date(tournament.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            </div>

            {/* About */}
            {tournament.about && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-primary uppercase tracking-widest">About</h3>
                <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed font-medium bg-white/[0.01] p-6 rounded-2xl border border-white/[0.03]">
                  {tournament.about}
                </p>
              </div>
            )}

            {/* Details Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Details</h3>
              <div className="glass-panel rounded-custom border border-white/10 overflow-hidden divide-y divide-white/5">
                {[
                  ['Format', tournament.format.replace('_', ' ')],
                  ['Time Control', tournament.timeControl],
                  ['Rounds', String(tournament.rounds)],
                  ['Category', tournament.category],
                  ['FIDE Rated', tournament.fideRated ? 'Yes' : 'No'],
                  ['Entry Fee', tournament.entryFee],
                  ...(detail ? [
                    ['Chief Arbiter', detail.chiefArbiter],
                    ['Organizer', detail.organizer],
                    ...(detail.organizingCommittee ? [['Committee', detail.organizingCommittee]] : []),
                  ] : []),
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col sm:flex-row text-sm hover:bg-white/[0.01] transition-all">
                    <div className="w-full sm:w-48 px-6 py-4 text-on-surface-variant text-2xs uppercase tracking-wider font-bold bg-white/[0.01] flex-shrink-0 flex items-center">
                      {label}
                    </div>
                    <div className="px-6 py-4 text-white text-sm font-medium flex items-center">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prizes List */}
            {prizes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Prizes — Total: {tournament.prizePool}</h3>
                <div className="glass-panel rounded-custom border border-white/10 overflow-hidden divide-y divide-white/5">
                  {prizes.map((p, i) => (
                    <div 
                      key={i} 
                      className={`flex items-center justify-between px-6 py-4 text-sm transition-all hover:bg-white/[0.01] ${
                        i === 0 
                          ? 'text-primary font-bold bg-primary/5' 
                          : 'text-on-surface'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {i === 0 && <Trophy size={14} className="text-primary animate-pulse" />}
                        {p.position}
                      </span>
                      <span className="font-semibold font-mono">{p.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Venue Address */}
            {detail?.venue && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Venue Location</h3>
                <div className="glass-panel p-6 rounded-custom border border-white/10 flex items-start gap-4 hover:border-white/20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed font-semibold mt-1">
                    {detail.venue}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR COLUMNS */}
          <div className="space-y-6 lg:sticky lg:top-24">
            {/* Action Card */}
            <div className="glass-panel rounded-custom border border-white/10 p-6 sm:p-8 flex flex-col gap-6 shadow-2xl">
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Entry Fee', tournament.entryFee, true],
                  ['Prize Pool', tournament.prizePool, true],
                  ['Rounds', String(tournament.rounds), false],
                  ['Time', tournament.timeControl, false],
                ].map(([label, value, accent]) => (
                  <div key={label as string} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-on-surface-variant text-2xs uppercase tracking-widest mb-1.5 font-bold">{label}</p>
                    <p className={`font-bold text-sm sm:text-base ${accent ? 'text-primary' : 'text-white'}`}>{value}</p>
                  </div>
                ))}
              </div>

              {tournament.status !== 'COMPLETED' && detail?.registrationLink ? (
                <a 
                  href={detail.registrationLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-on-primary rounded-xl font-bold text-sm hover:shadow-[0_0_30px_rgba(180,197,255,0.3)] transition-all active:scale-95 duration-200"
                >
                  Register Now <ExternalLink size={14} />
                </a>
              ) : tournament.status !== 'COMPLETED' ? (
                <button 
                  disabled 
                  className="w-full py-4 bg-white/5 border border-white/5 text-on-surface-variant/40 rounded-xl font-bold text-sm cursor-not-allowed"
                >
                  Registration Coming Soon
                </button>
              ) : null}

              {tournament.status === 'COMPLETED' && detail?.resultsLink && (
                <a 
                  href={detail.resultsLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-sm transition-all active:scale-95"
                >
                  View Results <ExternalLink size={14} />
                </a>
              )}

              <button
                onClick={() => navigator.share?.({ title: tournament.name, url: window.location.href })}
                className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-sm transition-all active:scale-95"
              >
                <Share2 size={14} className="text-on-surface-variant" /> Share Event
              </button>
            </div>

            {/* Organizer Details */}
            {detail && (
              <div className="glass-panel rounded-custom border border-white/10 p-6 sm:p-8 flex flex-col gap-4 shadow-xl">
                <p className="text-2xs text-on-surface-variant uppercase tracking-widest font-bold">Organizer</p>
                <div>
                  <p className="text-sm sm:text-base font-bold text-white mb-1.5">{detail.organizer}</p>
                  <p className="text-xs text-on-surface-variant font-medium">Chief Arbiter: <span className="text-white font-semibold">{detail.chiefArbiter}</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
