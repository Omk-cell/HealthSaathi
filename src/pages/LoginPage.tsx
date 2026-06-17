import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';

export const LoginPage: React.FC = () => {
  const { loginWithFirebase, currentUser } = useApp();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || '/dashboard';

  // If already logged in, redirect immediately
  React.useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide your registered contact email and password.');
      return;
    }

    setIsLoading(true);

    try {
      await loginWithFirebase(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Could not authenticate. Check your email/password credentials or confirm clinical network access.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errMsg = 'Invalid email or password combination. Please check your qualifications or create a new clinical card.';
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 tracking-wider transition"
        >
          <Lucide.ArrowLeft className="w-4 h-4" /> Go back to home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Lucide.HeartPulse className="w-6 h-6 shrink-0" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Health<span className="text-blue-600 dark:text-blue-400">Saathi</span>
            </span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">
          Access Patient Portal
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">
          Initialize continuous synchronized medical metrics tracking
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 py-8 px-6 shadow-sm border border-slate-200 dark:border-slate-800 rounded-[2rem] text-left"
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            {location.state?.fromSignup && (
              <div className="p-3.5 bg-blue-50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30 text-[11px] text-blue-700 dark:text-blue-300 rounded-xl font-bold flex items-start gap-1.5 leading-relaxed">
                <Lucide.Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>
                  We detected that you already have an active clinical card with this email. Please log in below to access your Patient Portal.
                </span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 text-[11px] text-rose-650 dark:text-rose-400 rounded-xl font-bold">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Registered Contact Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lucide.Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950"
                  placeholder="patient@saathi.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Account Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lucide.Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition duration-200 shadow-md shadow-blue-500/10 cursor-pointer active:scale-[0.98] disabled:bg-slate-300"
              >
                {isLoading ? 'Connecting Secure Gateway...' : 'Initialize Secure OPD Tunnel'}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 dark:border-slate-850 dark:border-slate-800/60 pt-4 text-center">
            <span className="text-[11px] text-slate-400">
              New to HealthSaathi?{' '}
              <Link to="/signup" className="text-blue-650 text-blue-600 dark:text-blue-400 font-extrabold hover:underline">
                Create Clinical Card
              </Link>
            </span>
          </div>
        </motion.div>

        {/* Info label for testing */}
        <div className="text-center mt-4">
          <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-900 py-1 px-3 rounded-full border border-slate-200/80 dark:border-slate-800">
            💡 Clinical sandbox accounts are synced via your Firestore cloud database.
          </span>
        </div>
      </div>
    </div>
  );
};
