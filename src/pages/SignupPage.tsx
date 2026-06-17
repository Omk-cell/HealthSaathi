import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';

export const SignupPage: React.FC = () => {
  const { signupWithFirebase, currentUser } = useApp();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // If already logged in, redirect immediately
  React.useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide your full clinical legal name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('A valid medical coordinates email is mandatory.');
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      setError('Please key in a valid registered phone number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long for HIPAA protection compliance.');
      return;
    }
    if (!consent) {
      setError('You must accept clinical HIPAA telemetry transmission.');
      return;
    }

    setIsLoading(true);

    try {
      await signupWithFirebase(email.trim(), name.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Could not register clinical account. Email may already be associated with an active medical profile.';
      if (err.code === 'auth/email-already-in-use' || (err.message && err.message.includes('email-already-in-use'))) {
        errMsg = 'email-already-in-use';
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
          Provision Clinical Account
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">
          Obtain automated diagnostic lock codes and Gold health coverage cards
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 py-8 px-6 shadow-sm border border-slate-200 dark:border-slate-800 rounded-[2rem] text-left"
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 text-[11px] text-rose-650 dark:text-rose-400 rounded-xl font-bold space-y-2">
                <div className="flex items-start gap-1.5 leading-relaxed">
                  <Lucide.AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span>
                    {error === 'email-already-in-use' ? (
                      <>
                        This email <span className="font-semibold text-blue-600 dark:text-blue-400 underline">{email}</span> is already associated with an active clinical card.
                      </>
                    ) : (
                      error
                    )}
                  </span>
                </div>
                {error === 'email-already-in-use' && (
                  <div className="pt-2 border-t border-rose-200/50 dark:border-rose-800/40 flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigate('/login', { state: { email, fromSignup: true } })}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition cursor-pointer"
                    >
                      Login Directly with this Email
                    </button>
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="reg-name" className="block text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Full Legal Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lucide.User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950"
                  placeholder="Rohan Sharma"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Primary Contact Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lucide.Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950"
                  placeholder="rohan.sharma@gmail.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Active Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lucide.Phone className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950"
                  placeholder="+91 99887 76655"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Account Password (Min 6 chars)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lucide.Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="reg-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-1 text-slate-500 dark:text-slate-400">
              <input
                id="consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4.5 w-4.5 border-slate-300 dark:bg-slate-950 mt-0.5"
              />
              <label htmlFor="consent" className="text-[10.5px] leading-relaxed select-none">
                I hereby consent to continuous telemetry tracking, secure synchronization of prescription lockers, and HIPAA compliance data access for direct clinicians.
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition duration-200 shadow-md cursor-pointer active:scale-[0.98] disabled:bg-slate-300"
              >
                {isLoading ? 'Creating Electronic Locker Card...' : 'Authorize Clinical Registry'}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 dark:border-slate-850 dark:border-slate-800/60 pt-4 text-center">
            <span className="text-[11px] text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-650 text-blue-600 dark:text-blue-400 font-extrabold hover:underline">
                Navigate to Login
              </Link>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
