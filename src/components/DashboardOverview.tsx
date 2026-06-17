import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DashboardOverview: React.FC = () => {
  const {
    currentUser,
    healthVitals,
    setHealthVitals,
    appointments,
    setAppointments,
    medReminders,
    setMedReminders,
    setNotifications,
  } = useApp();

  const navigate = useNavigate();
  const [isSyncingWatch, setIsSyncingWatch] = useState(false);

  // Sync Watch Telemetry Simulation
  const simulateWatchSync = () => {
    setIsSyncingWatch(true);
    setTimeout(() => {
      setIsSyncingWatch(false);
      // Fluctuate vitals
      const bpDiff = Math.floor(Math.random() * 6) - 3; // -3 to +3
      const hrDiff = Math.floor(Math.random() * 8) - 4; // -4 to +4
      const glucoseDiff = Math.floor(Math.random() * 6) - 3;

      setHealthVitals(prev => ({
        ...prev,
        bpSystolic: prev.bpSystolic + bpDiff,
        heartRate: prev.heartRate + hrDiff,
        glucose: prev.glucose + glucoseDiff,
        score: Math.min(100, Math.max(70, prev.score + (Math.random() > 0.5 ? 1 : -1))),
      }));

      // Add audit notification
      const newNotif = {
        id: `n-${Date.now()}`,
        title: 'Smartband Vitals Refined',
        text: `Continuous sync with wearable completed. Heart rate shifted to ${healthVitals.heartRate + hrDiff} bpm.`,
        time: 'Just now',
        unread: true,
        type: 'success' as const,
      };
      setNotifications(old => [newNotif, ...old]);
    }, 1500);
  };

  // Toggle Medication Taken
  const handleToggleReminder = (id: string) => {
    setMedReminders(prev =>
      prev.map(rem => {
        if (rem.id === id) {
          const updatedTaken = !rem.taken;
          if (updatedTaken) {
            setHealthVitals(v => ({ ...v, score: Math.min(100, v.score + 2) }));
          } else {
            setHealthVitals(v => ({ ...v, score: Math.max(50, v.score - 2) }));
          }
          return { ...rem, taken: updatedTaken };
        }
        return rem;
      })
    );
  };

  // Cancel Appointment Action
  const handleCancelAppointment = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to cancel the scheduled consultation with ${name}?`)) {
      setAppointments(prev => prev.filter(app => app.id !== id));
      // Notify
      const newNotif = {
        id: `n-${Date.now()}`,
        title: 'Consultation Revoked',
        text: `OPD visit scheduled with ${name} was deleted from clinical boards.`,
        time: 'Just now',
        unread: true,
        type: 'alert' as const,
      };
      setNotifications(old => [newNotif, ...old]);
    }
  };

  return (
    <div className="space-y-6 text-left select-none">
      {/* Top Banner Alert / Streak Action */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Lucide.Activity className="w-64 h-64" />
        </div>
        <div className="max-w-xl space-y-2 relative z-10">
          <span className="px-3 py-0.5 rounded-full bg-white/20 text-xs font-bold font-mono text-emerald-300">
            Active Clinical Session
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Welcome Back, {currentUser?.name || 'Rohan Sharma'}
          </h3>
          <p className="text-slate-200 text-xs leading-relaxed">
            All telemetry diagnostics and insurance limits are synchronized. Your overall health shield marks{' '}
            <span className="font-extrabold text-emerald-300 underline font-mono">{healthVitals.score}%</span>. Take morning routines to stabilize vitals!
          </p>
        </div>
      </div>

      {/* DASHBOARD CARDS BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CARD 1: UPCOMING APPOINTMENTS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Lucide.CalendarDays className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Upcoming Consultations
                </h4>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded font-mono">
                {appointments.length} Scheduled
              </span>
            </div>

            <div className="space-y-3">
              {appointments.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400 dark:text-slate-500">No upcoming clinical slots</p>
                  <button
                    onClick={() => navigate('/dashboard/appointments')}
                    className="mt-3 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg"
                  >
                    Find a Doctor
                  </button>
                </div>
              ) : (
                appointments.slice(0, 2).map(app => (
                  <div key={app.id} className="p-3 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-slate-150 dark:border-slate-850 flex flex-col justify-between gap-1">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{app.doctorName}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{app.specialty} &#8226; {app.hospital}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                        <Lucide.Clock className="w-3.5 h-3.5 text-blue-500" /> {app.date} | {app.time}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => navigate('/dashboard/telemedicine')}
                          className="px-2 py-0.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded text-[9px] transition cursor-pointer"
                        >
                          Join
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(app.id, app.doctorName)}
                          className="p-0.5 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-450 rounded text-xs transition cursor-pointer"
                        >
                          <Lucide.Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-50 dark:border-slate-800/40 mt-4">
            <button
              onClick={() => navigate('/dashboard/appointments')}
              className="w-full py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lucide.CalendarPlus className="w-4 h-4" /> Schedule Specialist Call
            </button>
          </div>
        </div>

        {/* CARD 2: ACTIVE PRESCRIPTIONS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 dark:bg-teal-950/45 text-teal-600 dark:text-teal-450 rounded-lg">
                  <Lucide.Pill className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Active Drug Trackers
                </h4>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-850 dark:text-teal-350 rounded font-mono">
                Adherence Locked
              </span>
            </div>

            <div className="space-y-3.5">
              <div className="p-3 bg-teal-50/30 dark:bg-teal-950/10 rounded-xl border border-teal-100/50 dark:border-teal-900/30 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Atorvastatin Lipid Care 10mg</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-450">1 Pill nightly &#8226; Left: 14 Capsules</p>
                </div>
                <button
                  onClick={() => {
                    alert('Lipid prescription auto-refill request filed with Express delivery!');
                    const notif = {
                      id: `n-${Date.now()}`,
                      title: 'Pharmacy Dispatch Registered',
                      text: 'Prescribed refill for Atorvastatin signed by Dr. Vivek Nair.',
                      time: 'Just now',
                      unread: true,
                      type: 'success' as const,
                    };
                    setNotifications(old => [notif, ...old]);
                  }}
                  className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] rounded-lg transition cursor-pointer"
                >
                  Refill
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/15 rounded-xl border border-slate-150 dark:border-slate-850 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Metformin Glucophage 500mg</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-450">1 Pill post-morning &#8226; Left: 8 Capsules</p>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold italic">Secure Sync</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 dark:border-slate-800/40 mt-4">
            <button
              onClick={() => navigate('/dashboard/medicines')}
              className="w-full py-2 bg-teal-50/70 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-955 text-teal-700 dark:text-teal-400 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lucide.ShoppingBag className="w-4 h-4" /> Open Pharmacy Store
            </button>
          </div>
        </div>

        {/* CARD 3: HEALTH TELEMETRY / HEALTH SCORE */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-450 rounded-lg">
                  <Lucide.Activity className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Continuous Telemetry
                </h4>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-emerald-605 text-emerald-605/90 text-emerald-500 uppercase font-extrabold">Active BLE Link</span>
              </div>
            </div>

            <div className="flex justify-between items-center gap-4 py-1">
              <div className="relative flex items-center justify-center w-20 h-20 bg-emerald-50 dark:bg-emerald-950/20 rounded-full border-4 border-emerald-550 border-emerald-500 text-center font-mono shrink-0">
                <div>
                  <div className="text-xl font-extrabold text-slate-850 text-slate-800 dark:text-slate-100">{healthVitals.score}</div>
                  <div className="text-[8px] text-emerald-700 dark:text-emerald-400 uppercase font-extrabold">Robust</div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-350 w-full text-left">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-1">
                  <span className="text-slate-400 dark:text-slate-500">BP Pulse:</span>
                  <span className="font-mono font-bold text-slate-850 dark:text-slate-200">{healthVitals.bpSystolic}/{healthVitals.bpDiastolic} mmHg</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-1">
                  <span className="text-slate-400 dark:text-slate-500">Heart Rate:</span>
                  <span className="font-mono font-bold text-slate-850 dark:text-slate-200">{healthVitals.heartRate} bpm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-500">Sugar level:</span>
                  <span className="font-mono font-bold text-slate-850 dark:text-slate-200">{healthVitals.glucose} mg/dL</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 dark:border-slate-800/40 mt-4 flex gap-2">
            <button
              onClick={simulateWatchSync}
              disabled={isSyncingWatch}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:text-slate-400"
            >
              {isSyncingWatch ? (
                <>
                  <Lucide.FolderSync className="w-4 h-4 animate-spin" /> Fetching BLE records...
                </>
              ) : (
                <>
                  <Lucide.RefreshCw className="w-3.5 h-3.5" /> Sync Smartband
                </>
              )}
            </button>
          </div>
        </div>

        {/* CARD 4: INSURANCE STATUS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition col-span-1 md:col-span-2 lg:col-span-1">
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/45 text-amber-600 dark:text-amber-450 rounded-lg">
                  <Lucide.ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Cashless Insurance
                </h4>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 rounded font-mono uppercase">
                Active Direct
              </span>
            </div>

            <div className="p-3 bg-gradient-to-tr from-cyan-900 to-amber-950 text-white rounded-xl relative overflow-hidden flex flex-col justify-between h-28 transform hover:scale-[1.01] transition duration-200">
              <div className="absolute right-0 top-0 opacity-10 font-mono text-xs pointer-events-none p-3 select-none text-[8pt] tracking-widest leading-none font-bold">
                GOLD CLUB
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] tracking-wider uppercase font-bold text-slate-300">HealthSaathi Gold Elite</span>
                <Lucide.HeartPulse className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-[8px] text-slate-300 leading-none">Policy Number</p>
                <p className="font-mono text-xs font-bold tracking-wider text-slate-50">HS-8849-2026</p>
              </div>
              <div className="flex justify-between items-end border-t border-white/10 pt-1.5">
                <div>
                  <p className="text-[7px] text-slate-300 leading-none">Insured Limit</p>
                  <p className="font-mono text-[11px] font-extrabold">₹6,80,000</p>
                </div>
                <div>
                  <p className="text-[7.5px] text-slate-300 leading-none">Claims Filed</p>
                  <p className="font-mono text-[11px] font-semibold text-right">3 Cases</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 dark:border-slate-800/40 mt-4">
            <button
              onClick={() => navigate('/dashboard/insurance')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-205 dark:bg-slate-950 dark:hover:bg-slate-850 dark:text-slate-300 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-800"
            >
              <Lucide.FolderLock className="w-4 h-4" /> File Re-underwriting Case
            </button>
          </div>
        </div>

        {/* CARD 5: MED REMINDER CHECKLISTS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition col-span-1 md:col-span-2">
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Lucide.ListChecks className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Active Pill Schedules
                </h4>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-850 dark:text-indigo-300 rounded font-mono">
                Streak: 4 Days
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {medReminders.map(rem => (
                <div
                  key={rem.id}
                  onClick={() => handleToggleReminder(rem.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer select-none flex flex-col justify-between gap-2 text-left ${
                    rem.taken
                      ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-250 border-emerald-500/30'
                      : 'bg-slate-50 dark:bg-slate-950/20 border-slate-150 dark:border-slate-850'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <p className={`font-extrabold text-[11px] leading-tight ${rem.taken ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                        {rem.name}
                      </p>
                      {rem.taken ? (
                        <Lucide.CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Lucide.Circle className="w-4 h-4 text-slate-350 dark:text-slate-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">{rem.dosage}</p>
                  </div>
                  <p className="text-[9px] font-bold font-mono text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/40 pt-1.5 mt-1">
                    {rem.time}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-55 border-slate-50 dark:border-slate-800/40 mt-4 flex justify-between items-center">
            <span className="text-[10.5px] text-slate-400 dark:text-slate-500 font-medium">Compliance target: 95%</span>
            <button
              onClick={() => navigate('/dashboard/medication')}
              className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Adjust Alarms <Lucide.ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
