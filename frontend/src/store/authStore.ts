import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Session } from '@supabase/supabase-js';
import { AuthUser } from '@/types';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';

interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  login: (user: AuthUser, session: Session) => void;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  syncUserToBackend: (session: Session) => Promise<AuthUser | null>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,

      setSession: (session) => set({ session }),

      login: (user, session) => set({ user, session }),

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
      },

      isAdmin: () => get().user?.role === 'ADMIN',

      /**
       * After Supabase auth, sync user to our backend DB.
       * Creates User + PlayerProfile on first login.
       */
      syncUserToBackend: async (session: Session) => {
        try {
          const res = await api.post('/auth/callback', {}, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          const authUser = res.data.user as AuthUser;
          set({ user: authUser, session });
          return authUser;
        } catch (err) {
          console.error('Failed to sync user to backend:', err);
          return null;
        }
      },

      /**
       * Initialize auth state on app load.
       * Checks for existing Supabase session and syncs with backend.
       */
      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            set({ session });
            // Sync with backend to get our user data
            await get().syncUserToBackend(session);
          }
        } catch (err) {
          console.error('Auth initialization error:', err);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'chessmate-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
