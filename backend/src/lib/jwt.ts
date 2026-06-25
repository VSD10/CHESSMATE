import { supabaseAdmin } from './supabase';

export interface JwtPayload {
  userId: string;   // Supabase Auth UID
  email: string;
  role: string;
}

/**
 * Verify a Supabase JWT token by calling Supabase Auth API.
 * Returns the authenticated user's info.
 */
export const verifySupabaseToken = async (token: string): Promise<{ id: string; email: string }> => {
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    throw new Error('Invalid or expired token');
  }
  return {
    id: data.user.id,
    email: data.user.email!,
  };
};
