import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="relative bg-background min-h-screen text-on-background pb-20">
      {/* Background radial glow decorations */}
      <div className="absolute top-[10%] left-[-15%] w-[400px] h-[400px] bg-primary/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-15%] w-[400px] h-[400px] bg-secondary/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-16 animate-slide-up relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors mb-8 group font-semibold"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        {/* Legal Document Glass Panel */}
        <div className="glass-panel rounded-custom p-8 sm:p-12 border border-white/10 shadow-2xl relative overflow-hidden bg-surface/60 backdrop-blur-3xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Scale className="text-primary w-6 h-6" />
            </div>
            <div>
              <h1 className="font-headline-lg text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                Terms of Service
              </h1>
              <p className="text-2xs text-primary font-bold tracking-widest uppercase font-mono mt-1">
                Last Updated: June 25, 2026
              </p>
            </div>
          </div>

          <div className="h-px bg-white/5 my-8" />

          {/* Terms content */}
          <div className="space-y-8 text-on-surface-variant font-medium text-sm sm:text-base leading-relaxed">
            <p>
              Welcome to ChessMate. By accessing our platform, registering for FIDE rated tournaments, or utilizing our game analysis tools, you agree to comply with and be bound by the following Terms of Service.
            </p>

            <section className="space-y-4">
              <h2 className="font-headline-md text-lg sm:text-xl font-bold text-white border-b border-white/5 pb-2">
                1. Acceptance of Terms
              </h2>
              <p>
                By creating an account, registering for events, or subscribing to our AI evaluation packages, you warrant that you are at least 18 years of age (or have explicit parental consent) and agree to be legally bound by these terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-headline-md text-lg sm:text-xl font-bold text-white border-b border-white/5 pb-2">
                2. User Conduct & Fair Play
              </h2>
              <p>
                As a tournament platform, ChessMate enforces strict compliance with FIDE rules, All India Chess Federation guidelines, and Fair Play regulations:
              </p>
              <ul className="list-none space-y-2.5 pl-2">
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-black">•</span>
                  <span><strong>Cheating & AI Engines:</strong> The use of external software, chess engines (e.g. Stockfish, Komodo), or assistance from third parties during active live tournament matches is strictly prohibited.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-black">•</span>
                  <span><strong>Sanctions:</strong> Any player flagged by our detection algorithms or tournament arbiters will face immediate banishment, FIDE ID reporting, and prize pool forfeiture.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-black">•</span>
                  <span><strong>Accurate Information:</strong> Users must provide correct names, FIDE IDs, and contact info. Identity falsification will lead to immediate account suspension.</span>
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-headline-md text-lg sm:text-xl font-bold text-white border-b border-white/5 pb-2">
                3. Registration & Payments
              </h2>
              <p>
                Tournament entry fees are processed via integrated secure payment gateways. Refund requests are subject to the individual event organizer's policy (which is specified on each tournament details page). ChessMate acts as an agent and is not liable for organizer cancellations, pairing adjustments, or venue issues.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-headline-md text-lg sm:text-xl font-bold text-white border-b border-white/5 pb-2">
                4. Intellectual Property
              </h2>
              <p>
                The chess engine visualizer, rating calculators, and structural assets are owned by ChessMate. Game PGN database records and FIDE pairing results are public domain information, but database compilations belong to ChessMate.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-headline-md text-lg sm:text-xl font-bold text-white border-b border-white/5 pb-2">
                5. Limitation of Liability
              </h2>
              <p>
                ChessMate is provided "as is". We are not responsible for database outages, pairing software mismatches, connection latency to Stockfish nodes, or physical event disruptions. In no event shall ChessMate be liable for indirect damages.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-headline-md text-lg sm:text-xl font-bold text-white border-b border-white/5 pb-2">
                6. Amendments & Changes
              </h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. Continued use of ChessMate following any updates represents complete acceptance of the revised Terms.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
