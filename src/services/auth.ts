import { getSupabaseClient } from './supabase';
import type { AuthSession } from '../types';

const AUTH_SESSION_KEY = 'career_pilot_auth_session';

export const authService = {
  /**
   * Step 1: Send OTP to user's email address via Supabase Auth
   */
  async sendOtp(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    const client = getSupabaseClient();
    if (!client) {
      return {
        success: false,
        message: 'Supabase client is not connected. Please verify your Supabase configuration in .env.local.'
      };
    }

    try {
      const { data, error } = await client.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true
        }
      });

      if (error) {
        return {
          success: false,
          message: error.message || 'Failed to send OTP from Supabase. Please verify your Supabase email settings.'
        };
      }

      return {
        success: true,
        message: `Verification code sent to ${cleanEmail}. Please check your email inbox and enter the 6-digit code.`
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Network error while contacting Supabase Auth.'
      };
    }
  },

  /**
   * Step 2: Verify OTP code directly against Supabase GoTrue Auth
   */
  async verifyOtp(
    email: string,
    otpCode: string
  ): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otpCode.trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      return { success: false, error: 'Please enter the complete 6-digit verification code.' };
    }

    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: 'Supabase client is not connected.' };
    }

    try {
      const { data, error } = await client.auth.verifyOtp({
        email: cleanEmail,
        token: cleanOtp,
        type: 'email'
      });

      if (error || !data?.session?.user) {
        return {
          success: false,
          error: error?.message || 'Invalid or expired verification code. Please check your email and try again.'
        };
      }

      const u = data.session.user;
      const session: AuthSession = {
        user: {
          id: u.id,
          email: u.email || cleanEmail,
          createdAt: u.created_at
        },
        token: data.session.access_token,
        expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 30 * 86400000
      };

      // Persist authenticated session
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));

      // Sync user profile to Supabase PostgreSQL profiles table
      try {
        await client.from('profiles').upsert({
          id: u.id,
          email: u.email || cleanEmail,
          full_name: (u.email || cleanEmail).split('@')[0]
        });
      } catch (e) {
        // Safe to ignore if custom RLS is configured
      }

      return { success: true, session };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Verification error with Supabase Auth.'
      };
    }
  },

  /**
   * Check persistent session on app startup
   */
  async getSession(): Promise<AuthSession | null> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.auth.getSession();
        if (data?.session?.user) {
          const u = data.session.user;
          const session: AuthSession = {
            user: {
              id: u.id,
              email: u.email || '',
              createdAt: u.created_at
            },
            token: data.session.access_token,
            expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 30 * 86400000
          };
          localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
          return session;
        }
      } catch (e) {
        // Fallback to local storage
      }
    }

    // Check localStorage session
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;

    try {
      const session: AuthSession = JSON.parse(raw);
      if (session.expiresAt && session.expiresAt > Date.now()) {
        return session;
      }
      localStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    } catch {
      localStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }
  },

  /**
   * Log out and destroy session
   */
  async signOut(): Promise<void> {
    localStorage.removeItem(AUTH_SESSION_KEY);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
  }
};
