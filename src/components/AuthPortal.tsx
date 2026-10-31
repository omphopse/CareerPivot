import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Mail,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Lock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import { authService } from '../services/auth';
import type { AuthSession } from '../types';
import confetti from 'canvas-confetti';

interface AuthPortalProps {
  onLoginSuccess: (session: AuthSession) => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Focus first OTP box when step changes to 'otp'
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Handle Step 1: Send OTP via Supabase
  const handleSendEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.sendOtp(clean);
      if (res.success) {
        setInfoMessage(res.message);
        setStep('otp');
        setResendTimer(30);
      } else {
        setErrorMessage(res.message || 'Failed to send verification code. Please check your Supabase email setup.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error while requesting verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit changes with auto-advance and paste support
  const handleOtpChange = (index: number, value: string) => {
    // If pasting full 6 digits
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const nextDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          nextDigits[i] = pasted[i] || '';
        }
        setOtpDigits(nextDigits);
        const focusIdx = Math.min(pasted.length, 5);
        inputRefs.current[focusIdx]?.focus();

        if (pasted.length === 6) {
          triggerVerify(pasted);
        }
      }
      return;
    }

    // Single digit input
    const char = value.replace(/\D/g, '');
    const nextDigits = [...otpDigits];
    nextDigits[index] = char;
    setOtpDigits(nextDigits);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = nextDigits.join('');
    if (fullCode.length === 6) {
      triggerVerify(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Step 2: Verify OTP via Supabase
  const triggerVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await authService.verifyOtp(email, code);
      if (result.success && result.session) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        onLoginSuccess(result.session);
      } else {
        setErrorMessage(result.error || 'Verification code failed. Please check your email and try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error verifying code with Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-8 animate-fadeIn">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Career Pilot • AI Pivot Coach</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {step === 'email' ? 'Sign in to Your Account' : 'Verify Email Code'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            {step === 'email'
              ? 'Private, authenticated access to your forensic AI career diagnosis, adaptive sprint roadmap, and mock coach.'
              : `We sent a 6-digit verification code to ${email}. Check your email inbox.`}
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-2xl relative">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start space-x-3 text-xs text-rose-200 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <span className="font-bold text-rose-300">Supabase Authentication Notice</span>
                <p className="leading-relaxed text-slate-200">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Info Banner */}
          {infoMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-start space-x-2.5 text-xs text-indigo-200 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p>{infoMessage}</p>
            </div>
          )}

          {/* STEP 1: Email Input */}
          {step === 'email' && (
            <form onSubmit={handleSendEmail} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Work or Personal Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2 flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Passwordless OTP login via Supabase. Data is private & encrypted.</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Contacting Supabase Auth...</span>
                  </>
                ) : (
                  <>
                    <span>Continue with Email OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Security & Privacy Guarantees */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-400">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Supabase Auth & PostgreSQL authenticated session</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Permanent session persistence (stay signed in)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Strict multi-tenant isolation per user account</span>
                </div>
              </div>
            </form>
          )}

          {/* STEP 2: 6-Digit OTP Input */}
          {step === 'otp' && (
            <div className="space-y-6">
              {/* Back to email link */}
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setErrorMessage(null);
                }}
                className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Change email ({email})</span>
              </button>

              {/* Instruction info */}
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs flex items-center space-x-2">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Please check your inbox (and spam) for the Supabase verification code.</span>
              </div>

              {/* 6 Digit Input Boxes */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex justify-between gap-2 sm:gap-2.5">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 sm:w-12 h-14 text-center text-xl font-bold font-mono rounded-2xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 transition-all selection:bg-indigo-500"
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={() => triggerVerify()}
                disabled={isLoading || otpDigits.join('').length < 6}
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code with Supabase...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Enter Career Pilot</span>
                  </>
                )}
              </button>

              {/* Resend actions */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>Didn't receive email code?</span>
                {resendTimer > 0 ? (
                  <span className="text-slate-500 font-mono">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendEmail()}
                    disabled={isLoading}
                    className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-400">
          Career Pilot • End-to-end encrypted AI Career Pivot Coach powered by Supabase
        </p>
      </div>
    </div>
  );
};
