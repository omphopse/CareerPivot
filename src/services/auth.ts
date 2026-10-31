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
        let friendlyMessage = error.message;

        if (
          error.status === 504 ||
          error.message?.includes('504') ||
          error.message?.toLowerCase().includes('gateway timeout')
        ) {
          friendlyMessage =
            'Supabase SMTP Gateway Timeout (504): Supabase could not connect to your configured SMTP mail server within 30 seconds. If using Gmail, make sure your SMTP Port is set to 587 (NOT 465) and your password is a 16-character Google App Password (not your personal account password).';
        } else if (
          error.status === 429 ||
          error.message?.toLowerCase().includes('rate limit') ||
          (error as any).code === 'over_email_send_rate_limit'
        ) {
          friendlyMessage =
            'Supabase Email Rate Limit Exceeded (429): Supabase reached its hourly email quota (default is 3 emails/hour). Go to your Supabase Dashboard > Authentication > Rate Limits and increase the "Email rate limit" slider to 30 or 100, or verify your Custom SMTP settings.';
        }

        return {
          success: false,
          message: friendlyMessage
        };
      }

      return {
        success: true,
        message: `Verification code sent to ${cleanEmail}. Please check your email inbox and enter the 6-digit code.`
      };
    } catch (err: any) {
      let msg = err?.message || 'Network error while contacting Supabase Auth.';
      if (msg.includes('504') || msg.toLowerCase().includes('gateway timeout')) {
        msg =
          'Supabase SMTP Gateway Timeout (504): Supabase could not connect to your configured SMTP mail server. Please verify Port 587 and App Password in Supabase Dashboard.';
      }
      return {
        success: false,
        message: msg
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
