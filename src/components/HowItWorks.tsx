import React from 'react';
import { motion } from 'motion/react';
import * as Lucide from 'lucide-react';
import { howItWorksSteps } from '../data/healthcareData';
import { HowItWorksStep } from '../types';

export const HowItWorks: React.FC = () => {

  const renderStepIcon = (name: string) => {
    const IconComponent = (Lucide as any)[name] || Lucide.Activity;
    return <IconComponent className="w-6 h-6 text-blue-600" />;
  };

  return (
    <section id="how-it-works-section" className="py-20 bg-white dark:bg-slate-950 relative">
      {/* Structural background design layout */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-50 via-teal-50 to-blue-50 dark:from-blue-950/20 dark:via-teal-950/20 dark:to-blue-950/20 -translate-y-12 hidden lg:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest font-mono">Process Streams</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            Your Health Journey In Four Easy Steps
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
            Review the roadmap to understand how HealthSaathi streamlines clinical appointments, e-pharmacy orders, and diagnostic records locker security.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {howItWorksSteps.map((step: HowItWorksStep, index: number) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl group hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:border-blue-200 dark:hover:border-slate-700 transition-all duration-300"
            >
              {/* Floating Step Badge Indicator */}
              <div className="absolute -top-4 left-6 px-3.5 py-1 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-full text-xs font-mono font-bold shadow-md">
                Step 0{step.number}
              </div>

              {/* Icon Frame */}
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 shadow-sm transition-transform group-hover:rotate-6 mt-2">
                {renderStepIcon(step.iconName)}
              </div>

              {/* Title & Desc */}
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-2">
                {step.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs font-sans">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
