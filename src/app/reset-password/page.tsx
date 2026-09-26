'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Box, Mail, KeyRound, Lock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('6-digit reset OTP sent to your email');
    setStep(2);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('OTP verified');
    setStep(3);
  };

  const handleSetNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Password reset successfully! Please sign in.');
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-white/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">
            <Box className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reset Password</h1>
          <p className="text-sm text-slate-500">Step {step} of 3</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700">Your Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@stocksense.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>
            <button type="submit" className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white">
              Send 6-Digit OTP
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700">Enter 6-Digit OTP</label>
              <div className="relative mt-1">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center tracking-widest text-lg font-bold rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>
            <button type="submit" className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white">
              Verify Code
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSetNewPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700">New Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>
            <button type="submit" className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white">
              Save New Password
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
