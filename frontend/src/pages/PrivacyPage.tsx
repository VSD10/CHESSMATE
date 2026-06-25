import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
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
              <Shield className="text-primary w-6 h-6" />
            </div>
            <div>
              <h1 className="font-headline-lg text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                Privacy Policy
              </h1>
              <p className="text-2xs text-primary font-bold tracking-widest uppercase font-mono mt-1">
                Last Updated: June 25, 2026
              </p>
            </div>
          </div>

          <div className="h-px bg-white/5 my-8" />

          {/* Policy content */}
          <div className="space-y-8 text-on-surface-variant font-medium text-sm sm:text-base leading-relaxed">
            <p>
              At ChessMate, we prioritize the privacy and security of our users. This Privacy Policy details how we collect, use, and protect your information when you register for tournaments, track FIDE ratings, and utilize our AI Game Analysis platform.
            </p>

            <section className="space-y-4">
              <h2 className="font-headline-md text-lg sm:text-xl font-bold text-white border-b border-white/5 pb-2">
                1. Information We Collect
              </h2>
              <p>We collect information to provide better services to all of our players and organizers:</p>
              <ul className="list-none space-y-2.5 pl-2">
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-black">•</span>
                  <span><strong>Account Information:</strong> When you sign up, we collect your name, email address, password, FIDE ID (optional), and state/city of residence.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-black">•</span>
                  <span><strong>Tournament Data:</strong> If you register for tournaments, we collect registration details, transaction identifiers, payment history, and tournament game PGNs.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-black">•</span>
                  <span><strong>Technical Logs:</strong> IP addresses, browser specifications, and usage patterns regarding the Stockfish analysis engine tools.</span>
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-headline-md text-lg sm:text-xl font-bold text-white border-b border-white/5 pb-2">
                2. How We Use Your Information
              </h2>
              <p>ChessMate uses your data for the following essential processes:</p>
              <ul className="list-none space-y-2.5 pl-2">
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-black">•</span>
                  <span>To process entry registrations and prizes payouts for chess events.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-black">•</span>
                  <span>To query and map FIDE rating tables and render real-time Elo projection updates.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-black">•</span>
                  <span>To calculate Stockfish game analysis details and accuracy percentages.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-black">•</span>
                  <span>To communicate important pairing modifications, round schedules, and arbiter notices.</span>
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-headline-md text-lg sm:text-xl font-bold text-white border-b border-white/5 pb-2">
                3. Sharing & Disclosures
              </h2>
              <p>
                We do not sell your personal data. We share details only with tournament organizers (for pairing lists/standings sheets) and FIDE Arbiters (for registration check-ins and fair play controls). Public stand-sheets, pairings, and game PGNs will be published online as required by FIDE competition rules.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-headline-md text-lg sm:text-xl font-bold text-white border-b border-white/5 pb-2">
                4. Data Security
              </h2>
              <p>
                Your connection to ChessMate is encrypted using standard TLS protocols. All user authentication, database queries, and private profiles are securely handled via state-of-the-art backend filters. We strongly advise using two-factor credentials where available.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-headline-md text-lg sm:text-xl font-bold text-white border-b border-white/5 pb-2">
                5. Contact Us
              </h2>
              <p>
                If you have questions regarding this Privacy Policy or wish to request data erasure/modification, please contact our legal desk at <a href="mailto:privacy@chessmate.in" className="text-primary hover:underline font-semibold">privacy@chessmate.in</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
