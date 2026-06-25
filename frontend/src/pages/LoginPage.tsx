import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const [params]        = useSearchParams();
  const [tab, setTab]   = useState<'login' | 'register'>(params.get('tab') === 'register' ? 'register' : 'login');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const syncUserToBackend = useAuthStore(s => s.syncUserToBackend);
  const [form, setForm] = useState({ email: '', password: '', name: '', username: '' });
  const setField = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  // ─── Google OAuth ───────────────────────────────────
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      // Browser will redirect to Google
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  // ─── Email + Password ──────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'register') {
        // Sign up with Supabase
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              name: form.name,
              username: form.username,
            },
          },
        });
        if (signUpError) throw signUpError;

        if (data.session) {
          // Auto-confirmed — sync to backend
          await syncUserToBackend(data.session);
          navigate('/');
        } else {
          // Email confirmation required
          setError('Check your email to confirm your account, then sign in.');
          setTab('login');
        }
      } else {
        // Sign in with Supabase
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (signInError) throw signInError;

        if (data.session) {
          await syncUserToBackend(data.session);
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = [
    'w-full glass-input border border-white/10 text-white rounded-xl px-3.5 py-3 text-sm bg-white/[0.04]',
    'outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10',
    'transition-all placeholder:text-white/30 font-sans shadow-sm',
  ].join(' ');
  const labelCls = 'text-xs font-semibold text-white/60 block mb-1.5 uppercase tracking-wider';

  return (
    <div className="min-h-screen bg-background flex items-start justify-center px-4 pt-12 sm:pt-20 pb-8 relative overflow-hidden z-10">
      {/* Background glow blobs */}
      <div className="absolute top-[20%] left-[-10%] w-[350px] h-[350px] bg-primary/5 rounded-full filter blur-[100px] pointer-events-none animate-pulse-slow -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] bg-secondary/5 rounded-full filter blur-[120px] pointer-events-none -z-10" />

      {/* Subtle chess grid */}
      <div className="chess-bg-pattern fixed inset-0 pointer-events-none opacity-[0.12]" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors mb-6 group">
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to ChessMate
        </Link>

        {/* Frosted Glass card with slide-up entry */}
        <div className="glass-panel rounded-[28px] overflow-hidden shadow-3xl border border-white/10 animate-slide-up">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-white/5 flex items-center gap-2 bg-white/[0.01]">
            <span className="text-xl text-primary animate-pulse">♟</span>
            <span className="font-headline-md text-lg font-bold text-white">
              Chess<span className="text-primary">Mate</span>
            </span>
          </div>

          <div className="p-6">
            {/* Tabs */}
            <div className="flex bg-white/5 rounded-xl p-1 mb-6 border border-white/5">
              {(['login', 'register'] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); setError(''); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    tab === t ? 'bg-primary text-on-primary shadow-md' : 'text-white/60 hover:text-white'
                  }`}>
                  {t === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            {/* ═══ Google Sign-In Button ═══ */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 glass-panel border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-sm disabled:opacity-50 active:scale-[0.99]"
            >
              {/* Google "G" icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading ? 'Redirecting…' : `${tab === 'login' ? 'Sign in' : 'Sign up'} with Google`}
            </button>

            {/* ═══ Divider ═══ */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-2xs text-white/40 font-semibold uppercase tracking-wider">or continue with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* ═══ Email Form ═══ */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {tab === 'register' && (
                <>
                  <div>
                    <label className={labelCls}>Full Name</label>
                    <input type="text" value={form.name} onChange={e => setField('name', e.target.value)}
                      required className={inputCls} placeholder="Arjun Kumar" />
                  </div>
                  <div>
                    <label className={labelCls}>Username</label>
                    <input type="text" value={form.username} onChange={e => setField('username', e.target.value.toLowerCase())}
                      required pattern="[a-z0-9_]+" className={inputCls} placeholder="arjunkumar" />
                  </div>
                </>
              )}
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" value={form.email} onChange={e => setField('email', e.target.value)}
                  required className={inputCls} placeholder="you@example.com" />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password} onChange={e => setField('password', e.target.value)}
                    required minLength={6} className={`${inputCls} pr-10`} placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className={`px-4.5 py-3 rounded-xl text-xs border ${
                  error.includes('Check your email')
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(180,197,255,0.4)] active:scale-[0.99] transition-all mt-1">
                {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Info box */}
            <div className="mt-5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-white/50 leading-relaxed">
                {tab === 'login'
                  ? 'Sign in with your Google account or email to access all ChessMate features.'
                  : 'Create an account to track tournaments, save analysis, and build your chess profile.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
