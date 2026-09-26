'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authService } from '@/services/authService';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import { User, Lock, Mail, Phone, ArrowRight, X, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect') || '/account';

  // Mode: 'OTP' | 'PASSWORD'
  const [authMode, setAuthMode] = useState<'OTP' | 'PASSWORD'>('OTP');

  // Password Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Passwordless OTP State
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState<'SEND' | 'VERIFY'>('SEND');
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    document.title = 'Sign In | ARILHA';
  }, []);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotSending, setIsForgotSending] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Handle Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpIdentifier.trim()) return;

    setIsOtpSending(true);
    setError(null);
    setOtpMessage(null);
    setDevOtpHint(null);

    try {
      const res = await authService.sendOtp(otpIdentifier.trim());
      if (res.success) {
        setOtpStep('VERIFY');
        setOtpMessage(res.message || `OTP dispatched to ${otpIdentifier}.`);
        if (res.data?.dev_otp) {
          setDevOtpHint(res.data.dev_otp);
        }
      } else {
        setError(res.message || 'Failed to send OTP.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP.');
    } finally {
      setIsOtpSending(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setIsOtpVerifying(true);
    setError(null);

    try {
      const res = await authService.verifyOtp(otpIdentifier.trim(), otpCode.trim());
      if (res.success) {
        router.push(redirectTarget);
      } else {
        setError(res.message || 'Invalid or expired OTP.');
      }
    } catch (err: any) {
      setError(err?.message || 'OTP verification failed.');
    } finally {
      setIsOtpVerifying(false);
    }
  };

  // Handle Password Login
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await authService.login(email, password);
      if (res.success) {
        router.push(redirectTarget);
      } else {
        setError(res.message || 'Invalid credentials.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotSending(true);
    setForgotSuccess(null);
    setForgotError(null);

    try {
      const res = await authService.forgotPassword(forgotEmail);
      if (res.success) {
        setForgotSuccess(res.message || 'A password reset link has been dispatched to your email.');
      } else {
        setForgotError(res.message || 'Failed to send reset link.');
      }
    } catch (err: any) {
      setForgotError(err?.message || 'Error requesting password reset.');
    } finally {
      setIsForgotSending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-3">
        <Link href="/" className="inline-block">
          <Image
            src="/logo.png"
            alt="Arilha"
            width={200}
            height={65}
            className="h-16 w-auto mx-auto object-contain"
            priority
          />
        </Link>
        <h1 className="text-2xl font-serif font-bold text-neutral-900">Welcome back</h1>
        <p className="text-xs text-neutral-500">Sign in with your email address — no password required.</p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 text-center">
          {error}
        </div>
      )}

      {/* Auth Mode Toggle Tabs */}
      <div className="bg-neutral-100 p-1 rounded-2xl flex text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setAuthMode('OTP');
            setError(null);
          }}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
            authMode === 'OTP'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <KeyRound className="w-4 h-4 text-[#B38548]" />
          <span>Email OTP (Passwordless)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthMode('PASSWORD');
            setError(null);
          }}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
            authMode === 'PASSWORD'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Lock className="w-4 h-4 text-[#B38548]" />
          <span>Password Sign In</span>
        </button>
      </div>

      {/* PASSWORDLESS OTP FORM */}
      {authMode === 'OTP' ? (
        <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
          {otpStep === 'SEND' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-neutral-700">Enter your email address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                  <input
                    type="email"
                    placeholder="customer@gmail.com"
                    value={otpIdentifier}
                    onChange={(e) => setOtpIdentifier(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#B38548]"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 pt-0.5">
                  We’ll send a one-time verification code to your email.
                </p>
              </div>

              <button
                type="submit"
                disabled={isOtpSending}
                className="w-full py-3.5 bg-[#B38548] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#966C32] transition-colors shadow-md flex items-center justify-center space-x-2"
              >
                <span>{isOtpSending ? 'Sending Code...' : 'Send OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {otpMessage && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900 text-center">
                  {otpMessage}
                </div>
              )}

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-700">Enter verification code</label>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep('SEND');
                      setError(null);
                    }}
                    className="text-[11px] font-bold text-[#B38548] hover:underline"
                  >
                    Change Email
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="[ _ _ _ _ _ _ ]"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                  className="w-full text-center py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#B38548]"
                />
              </div>

              <button
                type="submit"
                disabled={isOtpVerifying}
                className="w-full py-3.5 bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-md flex items-center justify-center space-x-2"
              >
                <span>{isOtpVerifying ? 'Verifying Code...' : 'Verify & Continue'}</span>
                <ShieldCheck className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <p className="text-xs text-neutral-500">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isOtpSending}
                    className="text-[#B38548] font-bold hover:underline"
                  >
                    Resend OTP
                  </button>
                </p>
              </div>
            </form>
          )}

          <div className="relative py-1 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <span className="relative bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              OR
            </span>
          </div>

          <GoogleAuthButton text="Continue with Google" onError={(msg) => setError(msg)} />
        </div>
      ) : (
        /* PASSWORD LOGIN FORM */
        <form onSubmit={handlePasswordSubmit} className="bg-white border border-neutral-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="space-y-1 text-xs">
            <label className="font-bold text-neutral-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="email"
                placeholder="customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-700">Password</label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotSuccess(null);
                  setForgotError(null);
                  setShowForgotModal(true);
                }}
                className="text-[11px] font-bold text-[#B38548] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-md flex items-center justify-center space-x-2"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In To Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="relative py-1 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <span className="relative bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              OR
            </span>
          </div>

          <GoogleAuthButton text="Continue with Google" onError={(msg) => setError(msg)} />

          <div className="text-center pt-3 border-t border-neutral-100 text-xs text-neutral-500">
            New to Arilha?{' '}
            <Link href="/register" className="font-bold text-black underline">
              Create an Account
            </Link>
          </div>
        </form>
      )}

      {/* FORGOT PASSWORD MODAL POPUP */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl border border-neutral-200 space-y-4">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-900 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-[#FAF4EB] text-[#B38548] rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-neutral-900">Forgot Password</h2>
              <p className="text-xs text-neutral-500">Enter your email address and we will send you a password reset link.</p>
            </div>

            {forgotSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-900">{forgotSuccess}</p>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="mt-2 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Close & Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                {forgotError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 text-center">
                    {forgotError}
                  </div>
                )}

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-neutral-700">Registered Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                    <input
                      type="email"
                      placeholder="your-email@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isForgotSending}
                  className="w-full py-3 bg-[#B38548] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#966C32] transition-colors shadow-md"
                >
                  {isForgotSending ? 'Sending Reset Link...' : 'Send Password Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs font-bold">Loading login...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
