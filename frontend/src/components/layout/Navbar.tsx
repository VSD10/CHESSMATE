import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { PlayerSearch } from '@/components/ui/PlayerSearch';

const navLinks = [
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/analysis',    label: 'Analysis'    },
  { to: '/calculator',  label: 'Calculator'  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen,   setDropOpen]   = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const { user, logout, isAdmin }   = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const dropRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {/* Redesigned Premium Glassmorphic Top Nav */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-500 border-b ${
          scrolled
            ? 'h-16 bg-surface/80 border-white/10 shadow-2xl backdrop-blur-2xl'
            : 'h-20 bg-surface/40 border-white/5 backdrop-blur-2xl'
        }`}
      >
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex items-center justify-between h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <span className="font-headline-md text-xl md:text-2xl font-bold text-primary tracking-tight">
              ♟ ChessMate
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `font-label-md text-sm font-semibold transition-all border-b-2 pb-1 ${
                    isActive
                      ? 'text-primary border-primary'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface hover:border-on-surface-variant/40'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            {isAdmin() && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `font-label-md text-sm font-semibold transition-all border-b-2 pb-1 ${
                    isActive
                      ? 'text-primary border-primary'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface hover:border-on-surface-variant/40'
                  }`
                }
              >
                Admin
              </NavLink>
            )}
          </div>

          {/* Right — desktop */}
          <div className="hidden md:flex items-center gap-6">
            <PlayerSearch />

            {user ? (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 text-sm transition-all bg-white/5"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                    {user.name.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-on-surface text-sm">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={11} className={`text-on-surface-variant transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-slide-down backdrop-blur-3xl">
                    <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                      <p className="text-xs font-semibold text-on-surface truncate">{user.name}</p>
                      <p className="text-2xs text-on-surface-variant truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => {
                          setDropOpen(false);
                          if (user?.username) {
                            navigate(`/player/${user.username}`);
                          } else {
                            navigate(`/player/arjunkumar`);
                          }
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-on-surface hover:bg-white/5 transition-colors"
                      >
                        <User size={12} className="text-on-surface-variant" /> Profile
                      </button>
                      {isAdmin() && (
                        <button
                          onClick={() => { navigate('/admin'); setDropOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-on-surface hover:bg-white/5 transition-colors"
                        >
                          <LayoutDashboard size={12} className="text-on-surface-variant" /> Admin Dashboard
                        </button>
                      )}
                      <div className="h-px bg-white/5 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={12} /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/login" className="font-label-md text-on-surface-variant hover:text-on-surface transition-colors font-semibold">
                  Login
                </Link>
                <Link
                  to="/login?tab=register"
                  className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-md text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(180,197,255,0.2)]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger toggle */}
          <button
            className="md:hidden p-2 text-on-surface-variant hover:text-on-surface transition-colors rounded-full hover:bg-white/5"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer (Responsive Glass) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40" style={{ top: scrolled ? 64 : 80 }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative bg-surface-container-high/90 backdrop-blur-3xl border-b border-white/10 shadow-2xl animate-slide-down">
            <div className="px-6 py-5 flex flex-col gap-2">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                      isActive 
                        ? 'text-primary bg-primary/10' 
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}

              <div className="border-t border-white/5 mt-3 pt-3">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <div className="px-4 py-3 flex items-center gap-3 bg-white/5 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                        {user.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate">{user.name}</p>
                        <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        if (user?.username) {
                          navigate(`/player/${user.username}`);
                        } else {
                          navigate(`/player/arjunkumar`);
                        }
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-on-surface hover:bg-white/5 transition-colors"
                    >
                      <User size={16} className="text-on-surface-variant" /> Profile
                    </button>
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 px-1 mt-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="text-center py-3 rounded-xl border border-white/10 text-sm text-on-surface-variant font-semibold hover:text-on-surface hover:border-white/20 transition-all bg-white/5"
                    >
                      Login
                    </Link>
                    <Link
                      to="/login?tab=register"
                      onClick={() => setMobileOpen(false)}
                      className="text-center py-3 rounded-xl bg-primary text-on-primary text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
