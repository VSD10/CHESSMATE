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
      <div className="min-h-screen bg-cm-bg flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-sm text-center shadow-lg">
          <div className="text-3xl mb-3">❌</div>
          <h2 className="text-lg font-bold text-cm-text mb-2">Authentication Failed</h2>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <p className="text-xs text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cm-bg flex items-center justify-center">
      <div className="bg-white border border-cm-border rounded-2xl p-8 max-w-sm text-center shadow-lg">
        <div className="text-3xl mb-3 animate-bounce">♟</div>
        <h2 className="text-lg font-bold text-cm-text mb-2">Signing you in...</h2>
        <p className="text-sm text-gray-400">Setting up your ChessMate account</p>
        <div className="mt-4 flex justify-center">
          <div className="w-6 h-6 border-2 border-cm-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}
