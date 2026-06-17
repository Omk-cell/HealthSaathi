import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Lucide from "lucide-react";
import { ModalType } from "../types";
import { useApp } from "../context/AppContext";

interface NavbarProps {
  onOpenModal: (type: ModalType) => void;
  currentUser: { email: string; name: string } | null;
  onLogout: () => void;
  onEnterDashboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenModal,
  currentUser,
  onLogout,
  onEnterDashboard,
}) => {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const { theme, toggleTheme } = useApp();

  // Smooth scroll helper
  const handleScrollTo = (elementId: string) => {
    setIsOpenMenu(false);
    const element = document.getElementById(elementId);
    if (element) {
      const topOffset =
        element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-40 glass border-b border-white/30 dark:border-slate-800/50 dark:bg-slate-950/85 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            className="flex items-center justify-between h-16 sm:h-20"
            aria-label="Global"
          >
            {/* Logo Brand */}
            <div className="flex lg:flex-1">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200 group-hover:scale-105 transition-all">
                  <Lucide.HeartPulse className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                  Health<span className="text-emerald-500 font-bold">Saathi</span>
                </span>
              </a>
            </div>

            {/* Desktop Nav Items */}
            <div className="hidden md:flex md:gap-x-8">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                Home
              </a>
              <button
                onClick={() => handleScrollTo("features-section")}
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => handleScrollTo("how-it-works-section")}
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => handleScrollTo("testimonials-section")}
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
              >
                About
              </button>
              <button
                onClick={() => handleScrollTo("faq-section")}
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
              >
                Contact
              </button>
            </div>

            {/* CTA / Auth Blocks */}
            <div className="hidden md:flex md:flex-1 md:justify-end items-center gap-3">
              {/* LIGHT/DARK THEME TOGGLE SWITCH */}
              <button
                onClick={toggleTheme}
                title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition cursor-pointer"
              >
                {theme === "light" ? (
                  <Lucide.Moon className="w-5 h-5" />
                ) : (
                  <Lucide.Sun className="w-5 h-5 text-amber-400" />
                )}
              </button>

              {currentUser ? (
                <div className="flex items-center gap-3.5">
                  {onEnterDashboard && (
                    <button
                      onClick={onEnterDashboard}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                    >
                      Go to Portal Dashboard
                    </button>
                  )}
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-1.5">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                      {currentUser.name[0].toUpperCase()}
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold max-w-[120px] truncate">
                      Hi, {currentUser.name}
                    </span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="text-xs font-bold text-slate-500 dark:text-slate-450 hover:text-red-500 transition cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onOpenModal("auth-login")}
                    className="text-sm font-bold text-slate-600 dark:text-slate-350 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 transition cursor-pointer"
                    id="navbar-login-btn"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => onOpenModal("auth-signup")}
                    className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md shadow-blue-100 dark:shadow-none hover:shadow-lg transition-all cursor-pointer"
                    id="navbar-signup-btn"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile Hamburguer Trigger */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsOpenMenu(true)}
                id="hamburguer-menu-btn"
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl"
              >
                <Lucide.Menu className="w-6 h-6" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Drawer Overlay */}
      <AnimatePresence>
        {isOpenMenu && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenMenu(false)}
              className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              id="mobile-drawer-body"
              className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white dark:bg-slate-950 px-6 py-6 shadow-2xl border-l border-slate-100 dark:border-slate-850 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  {/* Brand Link */}
                  <span className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5">
                    <Lucide.HeartPulse className="w-5 h-5 text-blue-600 animate-pulse" />
                    Health
                    <span className="text-emerald-500 font-bold">Saathi</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={toggleTheme}
                      title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                    >
                      {theme === "light" ? (
                        <Lucide.Moon className="w-5 h-5" />
                      ) : (
                        <Lucide.Sun className="w-5 h-5 text-amber-400" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsOpenMenu(false)}
                      id="close-mobile-menu-btn"
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                    >
                      <Lucide.X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 py-4">
                  <button
                    onClick={() => {
                      setIsOpenMenu(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-left py-2 font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 text-sm border-b border-slate-100 dark:border-slate-800"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => handleScrollTo("features-section")}
                    className="text-left py-2 font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 text-sm border-b border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    Features
                  </button>
                  <button
                    onClick={() => handleScrollTo("how-it-works-section")}
                    className="text-left py-2 font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 text-sm border-b border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    How It Works
                  </button>
                  <button
                    onClick={() => handleScrollTo("testimonials-section")}
                    className="text-left py-2 font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 text-sm border-b border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    About Company
                  </button>
                  <button
                    onClick={() => handleScrollTo("faq-section")}
                    className="text-left py-2 font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 text-sm border-b border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    Contact Supports
                  </button>
                </div>
              </div>

              {/* Bottom Actions for Mobile Drawer */}
              <div className="border-t border-slate-100 dark:border-slate-805 pt-4">
                {currentUser ? (
                  <div className="space-y-4 text-center">
                    {onEnterDashboard && (
                      <button
                        onClick={() => {
                          onEnterDashboard();
                          setIsOpenMenu(false);
                        }}
                        className="w-full py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold transition"
                      >
                        Enter Patient Portal Dashboard
                      </button>
                    )}
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      Logged in as {currentUser.name}
                    </div>
                    <button
                      onClick={() => {
                        onLogout();
                        setIsOpenMenu(false);
                      }}
                      className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 rounded-xl text-xs font-bold transition"
                    >
                      Logout Session
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => {
                        setIsOpenMenu(false);
                        onOpenModal("auth-login");
                      }}
                      className="py-2.5 text-center bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setIsOpenMenu(false);
                        onOpenModal("auth-signup");
                      }}
                      className="py-2.5 text-center bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-100 dark:shadow-none transition cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
