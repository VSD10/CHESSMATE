import axios from 'axios';
import { supabase } from '@/lib/supabase';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Request interceptor — attaches the current Supabase access token
 * to every outgoing request.
 */
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    if (err.response?.status === 401) {
      // Try refreshing the session
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        // Session is truly expired — sign out
        await supabase.auth.signOut();
      }
    }
    return Promise.reject(err);
  }
);
