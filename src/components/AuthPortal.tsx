import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import { authService } from '../services/auth';
import type { AuthSession } from '../types';
import confetti from 'canvas-confetti';
import { PicassoCareerCompass } from './ArtIllustrations';

interface AuthPortalProps {
  onLoginSuccess: (session: AuthSession) => void;
  onBackToHome?: () => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ onLoginSuccess, onBackToHome }) => {
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!clean || !emailRegex.test(clean)) {
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
        setErrorMessage(res.message || 'Failed to send verification code. Please check your email configuration.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error while requesting verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit changes
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
        setErrorMessage(result.error || 'The code entered is invalid or expired. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error verifying code with Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EBD6] text-[#293C3A] flex flex-col justify-center items-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Home Button */}
        {onBackToHome && (
          <div className="flex justify-start">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#6B7169] hover:text-[#C95F48] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>
        )}

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <PicassoCareerCompass size={44} />
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#293C3A]">
            {step === 'email' ? 'Sign in to Career Pivot' : 'Check your email'}
          </h1>
          <p className="text-sm text-[#6B7169] max-w-sm mx-auto">
            {step === 'email'
              ? 'Enter your email to receive a sign-in code.'
              : `We sent a 6-digit sign-in code to ${email}`}
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="art-card p-6 sm:p-8 space-y-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-[#FAECE8] border border-[#E58B70] flex items-start space-x-2.5 text-xs text-[#B54E38]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C95F48]" />
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Info Message */}
          {infoMessage && step === 'otp' && (
            <div className="p-3.5 rounded-xl bg-[#E8EBDD] border border-[#C5D5BE] text-xs text-[#38564F] leading-relaxed">
              {infoMessage}
            </div>
          )}

          {/* STEP 1: Email Form */}
          {step === 'email' && (
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-[#293C3A] mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7169]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="art-input w-full pl-10 pr-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="art-btn-primary w-full py-2.5 px-4 flex items-center justify-center space-x-2 text-sm cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Sending code...</span>
                ) : (
                  <>
                    <span>Continue with email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: 6-Digit OTP Form */}
          {step === 'otp' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#293C3A] mb-3 text-center">
                  Enter 6-digit code
                </label>
                <div className="flex justify-center gap-2 sm:gap-2.5">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={idx === 0 ? 6 : 1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-12 text-center text-lg font-bold art-input focus:border-[#C95F48]"
                      autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={() => triggerVerify()}
                disabled={isLoading || otpDigits.join('').length < 6}
                className="art-btn-primary w-full py-2.5 px-4 flex items-center justify-center space-x-2 text-sm cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <span>Verifying...</span> : <span>Confirm code</span>}
              </button>

              <div className="flex items-center justify-between text-xs text-[#6B7169] pt-2 border-t border-[#D9CFB9]">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setErrorMessage(null);
                  }}
                  className="flex items-center space-x-1 hover:text-[#293C3A] cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Use different email</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendEmail()}
                  disabled={isLoading || resendTimer > 0}
                  className="text-[#C95F48] font-semibold hover:underline disabled:opacity-50 cursor-pointer flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend code'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <p className="text-center text-xs text-[#6B7169]">
          Your session stays signed in on this browser. All data is private to you.
        </p>
      </div>
    </div>
  );
};
