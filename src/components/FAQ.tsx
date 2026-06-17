import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Lucide from "lucide-react";
import { faqsList } from "../data/healthcareData";
import { FAQItem } from "../types";

export const FAQ: React.FC = () => {
  const [activeFAQId, setActiveFAQId] = useState<string | null>("faq-1");
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | "General" | "Booking" | "AI Checker" | "Telemedicine"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFAQCollapse = (id: string) => {
    setActiveFAQId((prev) => (prev === id ? null : id));
  };

  const filteredFAQs = faqsList.filter((faq) => {
    const matchesCategory =
      selectedCategory === "All" || faq.category === selectedCategory;
    const matchesQuery =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const categoriesOpts: Array<
    "All" | "General" | "Booking" | "AI Checker" | "Telemedicine"
  > = ["All", "General", "Booking", "AI Checker", "Telemedicine"];

  return (
    <section id="faq-section" className="py-20 bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest font-mono">
            Knowledge Base
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Got queries? Check our comprehensive indices regarding security,
            clinical operations, prescription lockers, and emergency protocols.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 pb-3 border-b border-slate-100 dark:border-slate-800">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            {categoriesOpts.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm font-bold"
                    : "text-slate-500 dark:text-slate-450 hover:text-slate-850 dark:hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box within FAQ */}
          <div className="relative w-full md:w-64">
            <Lucide.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 rounded-xl text-xs dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition"
            />
          </div>
        </div>

        {/* FAQ Accordion list */}
        <div className="space-y-3">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq: FAQItem) => {
              const isOpen = activeFAQId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`border rounded-2xl bg-white dark:bg-slate-900 hover:shadow-md transition-all ${
                    isOpen
                      ? "border-blue-150 dark:border-blue-900 shadow-sm"
                      : "border-slate-100 dark:border-slate-800"
                  }`}
                >
                  {/* Collapsible header */}
                  <button
                    onClick={() => toggleFAQCollapse(faq.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <span
                      className={`p-1.5 rounded-full ${isOpen ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400" : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-550"} shrink-0 ml-3 transition-colors`}
                    >
                      {isOpen ? (
                        <Lucide.ChevronUp className="w-4 h-4" />
                      ) : (
                        <Lucide.ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  </button>

                  {/* Accordion body panels */}
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 sm:p-5 pt-0 border-t border-slate-100/55 dark:border-slate-800 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-sans bg-slate-50/40 dark:bg-slate-900/40">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-10">
              <Lucide.HelpCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                No answers match your queries
              </p>
              <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-0.5">
                Please check typo configurations or select other categories.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
