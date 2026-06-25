import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary/30 selection:text-primary flex flex-col font-sans overflow-x-hidden">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Redesigned Premium Footer */}
      <footer className="bg-surface-container-lowest w-full py-16 md:py-24 border-t border-white/5 relative z-10 mt-auto">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-20">
          <div className="col-span-1">
            <div className="font-headline-sm text-2xl font-bold text-primary mb-6 flex items-center gap-2">
              <span>♟</span> ChessMate
            </div>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed font-medium">
              © {new Date().getFullYear()} ChessMate. Master the board with technical elegance. Built for India's growing chess ecosystem.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-[0.2em] text-on-surface mb-6">Platform</h4>
            <ul className="space-y-4 font-medium text-sm">
              <li><Link className="text-on-surface-variant hover:text-primary transition-colors" to="/tournaments">Tournaments</Link></li>
              <li><Link className="text-on-surface-variant hover:text-primary transition-colors" to="/analysis">AI Analysis</Link></li>
              <li><Link className="text-on-surface-variant hover:text-primary transition-colors" to="/calculator">Rating Tracker</Link></li>
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-[0.2em] text-on-surface mb-6">Resources</h4>
            <ul className="space-y-4 font-medium text-sm">
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Tournament Rules</a></li>
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">API Documentation</a></li>
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Contact Support</a></li>
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">FIDE Handbook</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-[0.2em] text-on-surface mb-6">Legal</h4>
            <ul className="space-y-4 font-medium text-sm">
              <li><Link className="text-on-surface-variant hover:text-primary transition-colors" to="/privacy">Privacy Policy</Link></li>
              <li><Link className="text-on-surface-variant hover:text-primary transition-colors" to="/terms">Terms of Service</Link></li>
              <li><Link className="text-on-surface-variant hover:text-primary transition-colors" to="/cookies">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
