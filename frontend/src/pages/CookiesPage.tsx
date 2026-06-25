import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cookie } from 'lucide-react';

export default function CookiesPage() {
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
              <Cookie className="text-primary w-6 h-6" />
            </div>
            <div>
              <h1 className="font-headline-lg text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                Cookie Policy
              </h1>
              <p className="text-2xs text-primary font-bold tracking-widest uppercase font-mono mt-1">
                Last Updated: June 25, 2026
              </p>
            </div>
          </div>

          <div className="h-px bg-white/5 my-8" />

          {/* Cookies content */}
          <div className="space-y-8 text-on-surface-variant font-medium text-sm sm:text-base leading-relaxed">
            <p>
              This Cookie Policy details how ChessMate utilizes cookies and similar tracking technologies to store your settings, authenticate player profiles, and optimize game evaluation flows.
            </p>

            <section className="space-y-4">
              <h2 className="font-headline-md text-lg sm:text-xl font-bold text-white border-b border-white/5 pb-2">
                1. What are Cookies?
              </h2>
              <p>
                Cookies are small text records transferred to your device when browsing a site. They assist us in recalling your profile preferences, login states, and visual preferences across different pages.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-headline-md text-lg sm:text-xl font-bold text-white border-b border-white/5 pb-2">
                2. Types of Cookies We Use
              </h2>
              <p>We deploy cookies in three categories:</p>
              <ul className="list-none space-y-2.5 pl-2">
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-black">•</span>
                  <span><strong>Essential Cookies:</strong> Critical for navigation and security. They authenticate your player credentials, database connection routes, and keep your session logged in.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-black">•</span>
                  <span><strong>Performance Cookies:</strong> We collect aggregated usage stats (e.g. standard page clicks) to optimize database loading and fine-tune latency in Stockfish engine calculations.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-black">•</span>
                  <span><strong>Preference Cookies:</strong> Used to save UI settings like dark mode state, opponent rating presets in the calculator, and regional map filters.</span>
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-headline-md text-lg sm:text-xl font-bold text-white border-b border-white/5 pb-2">
                3. Third-Party Tracking
              </h2>
              <p>
                We integrate Supabase for secure player authentication and PostgreSQL database bindings, which place necessary auth cookies on your browser. No advertising or marketing tracking pixels are present on ChessMate.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-headline-md text-lg sm:text-xl font-bold text-white border-b border-white/5 pb-2">
                4. Managing Cookie Preferences
              </h2>
              <p>
                Most browsers allow you to block cookies via system configuration tabs. However, blocking essential cookies will disrupt the tournament pairing notifications and disable FIDE profile logins completely.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-headline-md text-lg sm:text-xl font-bold text-white border-b border-white/5 pb-2">
                5. Questions & Feedback
              </h2>
              <p>
                If you have questions regarding our cookie utilization, contact us at <a href="mailto:support@chessmate.in" className="text-primary hover:underline font-semibold">support@chessmate.in</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
