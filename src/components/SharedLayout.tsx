import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SharedLayout: React.FC = () => {
  const {
    currentUser,
    handleLogout,
    theme,
    toggleTheme,
    notifications,
    setNotifications,
    appointments,
    medicineCart,
  } = useApp();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => n.unread).length;
  const cartItemsCount = medicineCart.reduce((total, item) => total + item.quantity, 0);

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const toggleNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => {
        if (n.id === id) {
          return { ...n, unread: !n.unread };
        }
        return n;
      })
    );
  };

  const menuItems = [
    { to: '/dashboard', label: 'Dashboard Overview', icon: Lucide.LayoutDashboard },
    { to: '/dashboard/appointments', label: 'Appointments', icon: Lucide.Calendar, count: appointments.length },
    { to: '/dashboard/lab-tests', label: 'Lab Diagnostics', icon: Lucide.TestTubeDiagonal },
    { to: '/dashboard/records', label: 'Medical Locker', icon: Lucide.FolderLock },
    { to: '/dashboard/telemedicine', label: 'Telemedicine', icon: Lucide.Video },
    { to: '/dashboard/medicines', label: 'Pharmacy Shop', icon: Lucide.Pill, count: cartItemsCount > 0 ? cartItemsCount : undefined },
    { to: '/dashboard/medication', label: 'Medication Tracker', icon: Lucide.Clock4 },
    { to: '/dashboard/symptom-checker', label: 'AI Symptom Checker', icon: Lucide.Sparkles },
    { to: '/dashboard/insurance', label: 'Insurance & Claims', icon: Lucide.FileCheck2 },
    { to: '/dashboard/analytics', label: 'Health Analytics', icon: Lucide.TrendingUp },
    { to: '/dashboard/messages', label: 'Inbox Messages', icon: Lucide.MessageSquare, count: 1 },
    { to: '/dashboard/emergency', label: 'Emergency SOS', icon: Lucide.FlameKindling },
    { to: '/dashboard/settings', label: 'Diagnostic Profile', icon: Lucide.Sliders },
  ];

  const handleLogoutAction = () => {
    handleLogout();
    navigate('/');
  };

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} transition-colors duration-250`}>
      {/* 1. DESKTOP SIDEBAR (HIDDEN ON MOBILE) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 h-screen sticky top-0 shrink-0">
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Lucide.HeartPulse className="w-5 h-5" />
            </div>
            <span className="text-base font-black tracking-tight text-white">
              Saathi <span className="text-blue-400 font-medium text-xs">Patient</span>
            </span>
          </Link>
          <span className="px-2 py-0.5 bg-blue-900/40 text-blue-400 border border-blue-500/10 text-[9px] rounded-full font-bold uppercase tracking-wide">
            v1.2
          </span>
        </div>

        <div className="px-3 py-2 text-center text-[10px] text-slate-400 border-b border-slate-800/60 font-medium">
          🔒 Secured with 256-Bit SSL HIPAA encryption
        </div>

        {/* SIDEBAR NAVIGATION ITEMS */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="px-1.5 py-0.25 bg-blue-550 bg-blue-800 text-[9px] font-bold rounded-full text-white">
                    {item.count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* FOOTER USER CARD */}
        <div className="p-3 bg-slate-950 border-t border-slate-805 border-slate-805/80 border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black text-xs uppercase shrink-0">
            {currentUser?.name ? currentUser.name[0] : 'P'}
          </div>
          <div className="truncate text-left text-xs flex-grow">
            <p className="font-bold text-slate-100">{currentUser?.name || 'Rohan Sharma'}</p>
            <p className="text-[10px] text-slate-400 truncate">{currentUser?.email || 'patient@saathi.com'}</p>
          </div>
          <button
            onClick={handleLogoutAction}
            title="Sign out session"
            className="p-1 block text-slate-400 hover:text-rose-450 hover:text-rose-500 cursor-pointer text-xs"
          >
            <Lucide.LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. MOBILE RESPONSIVE NAV-DRAWER (SLIDE-OUT FROM LEFT) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/60 backdrop-blur-sm">
          <div className="relative flex flex-col w-64 max-w-xs bg-slate-900 text-slate-300">
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
              <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileSidebarOpen(false)}>
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Lucide.HeartPulse className="w-5 h-5" />
                </div>
                <span className="text-base font-black tracking-tight text-white">Saathi</span>
              </Link>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <Lucide.X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {menuItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/dashboard'}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={({ isActive }) =>
                      `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="px-1.5 py-0.25 bg-blue-800 text-[9px] font-bold rounded-full text-white">
                        {item.count}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {currentUser?.name ? currentUser.name[0] : 'P'}
              </div>
              <div className="truncate text-left text-xs flex-grow">
                <p className="font-bold text-slate-100">{currentUser?.name || 'Rohan Sharma'}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser?.email || 'patient@saathi.com'}</p>
              </div>
              <button
                onClick={handleLogoutAction}
                className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50/10 rounded-lg shrink-0 cursor-pointer"
              >
                <Lucide.LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE AREA */}
      <div className="flex-grow flex flex-col min-w-0 min-h-screen">
        {/* HEADER BAR */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-850 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg md:hidden cursor-pointer"
            >
              <Lucide.Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 select-none">
              <h2 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                Saathi Clinical Console
                <span className="hidden lg:inline-block px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-[9px] rounded-full font-bold tracking-wide">
                  Verified HIPAA Compliant
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* LIGHT/DARK THEME TOGGLE SWITCH */}
            <button
              onClick={toggleTheme}
              variant="outline"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-950/40 rounded-xl transition cursor-pointer"
            >
              {theme === 'light' ? (
                <Lucide.Moon className="w-4 h-4" />
              ) : (
                <Lucide.Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* NOTIFICATION CHASSIS BELL BUTTON */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsProfileDropdownOpen(false);
                }}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-950/40 rounded-xl relative transition cursor-pointer"
              >
                <Lucide.Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                )}
              </button>

              {/* Push notifications Dropdown list */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2.5 z-50 text-slate-800 dark:text-slate-200 text-left">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20 rounded-t-xl">
                    <span className="font-extrabold text-[10px] tracking-wider uppercase text-slate-500 dark:text-slate-400">
                      Smart Alerts locker
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold hover:underline cursor-pointer"
                      >
                        Clear unread
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850 dark:divide-slate-800/40">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">No active telemetry updates</p>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => toggleNotificationRead(notif.id)}
                          className={`p-3 text-xs transition hover:bg-slate-50 dark:hover:bg-slate-950/30 cursor-pointer ${
                            notif.unread ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                              {notif.type === 'alert' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />}
                              {notif.type === 'success' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                              {notif.title}
                            </span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">{notif.time}</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-405 dark:text-slate-400 leading-normal">{notif.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PHARMACY COORDINATES SHOPPING CART */}
            <Link
              to="/dashboard/medicines"
              title="Open health shopping cart"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-950/40 rounded-xl relative transition"
            >
              <Lucide.ShoppingBag className="w-4 h-4" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white font-extrabold text-[8px] h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* USER SETTINGS MENU TOGGLE DRAWER */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  setIsNotificationOpen(false);
                }}
                className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-950/40 border border-slate-205 dark:border-slate-800/60 rounded-xl transition cursor-pointer hover:bg-slate-105"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 font-black text-xs text-white flex items-center justify-center">
                  {currentUser?.name ? currentUser.name[0].toUpperCase() : 'PS'}
                </div>
                <div className="hidden sm:block text-left truncate max-w-[100px]">
                  <p className="text-xs font-black text-slate-800 dark:text-slate-200 leading-none truncate">
                    {currentUser?.name || 'Rohan Sharma'}
                  </p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">HS-9284</p>
                </div>
                <Lucide.ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-850 dark:border-slate-800 py-2 ז z-50 text-slate-800 dark:text-slate-200 text-xs text-left">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/60 font-medium">
                    <p className="font-extrabold text-slate-800 dark:text-slate-100">{currentUser?.name || 'Rohan Sharma'}</p>
                    <p className="text-slate-400 dark:text-slate-500 truncate text-[10px]">{currentUser?.email || 'patient@saathi.com'}</p>
                    <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 mt-1 uppercase tracking-wider">Gold Elite Health Card</p>
                  </div>
                  <div className="py-1.5 space-y-0.5">
                    <Link
                      to="/dashboard/settings"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-950/40 text-xs flex items-center gap-2 text-slate-650 dark:text-slate-300"
                    >
                      <Lucide.Sliders className="w-4 h-4 text-slate-400" /> Custom Vitals Profile
                    </Link>
                    <Link
                      to="/dashboard/records"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-950/40 text-xs flex items-center gap-2 text-slate-650 dark:text-slate-300"
                    >
                      <Lucide.FolderLock className="w-4 h-4 text-slate-400" /> Medical Lock Files
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800/60 pt-1.5 px-2 pb-1.5">
                    <button
                      onClick={handleLogoutAction}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-xs font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400 cursor-pointer"
                    >
                      <Lucide.LogOut className="w-3.5 h-3.5" /> Logout Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 4. DETAILS AREA SCROLLABLE WORKSPACE */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
