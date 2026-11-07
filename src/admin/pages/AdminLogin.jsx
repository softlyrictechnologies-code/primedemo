import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Building2, Shield, Lock, Mail, AlertCircle, Loader2, ArrowLeft, CheckCircle2, Key } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@gamil.com');
  const [password, setPassword] = useState('admin@200');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const { login, isAdmin, currentUser, authError } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    // If already verified admin, navigate straight to dashboard
    if (currentUser && isAdmin) {
      navigate(from, { replace: true });
    }
  }, [currentUser, isAdmin, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!email.trim() || !password) {
      setLocalError('Please enter both your administrator email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-white selection:bg-indigo-600">
      {/* Background ambient gradient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative w-full max-w-md space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Prime Housing</span>
          </Link>
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>prime-housing</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
          {/* Logo & Headline */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 p-0.5 mx-auto shadow-lg shadow-indigo-600/30 flex items-center justify-center text-white mb-3">
              <Building2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Administrator Console
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Secure authentication for verified operations managers and real estate auditing teams.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-medium text-indigo-100">
              Use your authorized Firebase admin account and password.
            </span>
          </div>

          {/* Error Message */}
          {(localError || authError) && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                {localError || authError}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gamil.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your administrator password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold text-xs tracking-wide shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-indigo-200" />
                    <span>Sign In to Admin Panel</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security policy note */}
          <div className="pt-4 border-t border-slate-800/80 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dedicated Administrator Account: <span className="font-bold text-slate-300">admin@gamil.com</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
