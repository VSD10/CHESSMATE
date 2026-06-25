import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

/**
 * Handles the redirect after Google OAuth or email magic link.
 * Supabase redirects here with tokens in the URL hash.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const syncUserToBackend = useAuthStore(s => s.syncUserToBackend);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically picks up the tokens from the URL hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!session) throw new Error('No session found');

        // Sync user to our backend
        const user = await syncUserToBackend(session);
        if (!user) throw new Error('Failed to sync user');

        navigate('/', { replace: true });
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    };

    handleCallback();
  }, [navigate, syncUserToBackend]);

  if (error) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative bg-surface-container-high/80 backdrop-blur-2xl border border-red-500/20 rounded-2xl p-8 sm:p-10 max-w-sm w-full text-center shadow-[0_0_40px_rgba(239,68,68,0.15)] z-10 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Authentication Failed</h2>
          <p className="text-sm font-medium text-red-400 mb-6 bg-red-500/10 py-2 px-3 rounded-lg border border-red-500/10">{error}</p>
          <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant font-medium">
            <div className="w-3 h-3 border-2 border-on-surface-variant border-t-transparent rounded-full animate-spin" />
            Redirecting to login...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      </div>
      
      <div className="relative bg-surface-container-high/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 sm:p-10 max-w-sm w-full text-center shadow-2xl z-10 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-[0_0_30px_rgba(129,140,248,0.3)]">
          <span className="text-4xl animate-pulse drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]">♟</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2 font-headline-sm tracking-tight">Signing you in...</h2>
        <p className="text-sm text-on-surface-variant mb-8 font-medium">Setting up your ChessMate account securely</p>
        
        <div className="flex justify-center">
          <div className="w-8 h-8 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
        </div>
      </div>
    </div>
  );
}
