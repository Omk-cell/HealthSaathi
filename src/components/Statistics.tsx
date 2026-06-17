import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import * as Lucide from 'lucide-react';
import { statsList } from '../data/healthcareData';
import { StatItem } from '../types';

export const Statistics: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-900 to-indigo-950 text-white relative overflow-hidden">
      {/* Dynamic background shapes */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute -left-16 -top-16 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] pointer-events-none opacity-20" />
      <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-blue-500 rounded-full blur-[100px] pointer-events-none opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {statsList.map((stat: StatItem, index: number) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              {/* Stat Icon Wrapper */}
              <div className="inline-flex p-2.5 rounded-xl bg-white/10 text-white mb-2">
                {renderStatIcon(stat.iconName)}
              </div>

              {/* Incremented Number Display */}
              <div className="text-3xl sm:text-4xl font-extrabold font-mono flex items-center justify-center">
                <CountUp value={stat.value} />
                <span className="text-emerald-400 ml-0.5">{stat.suffix}</span>
              </div>

              {/* Metric Title */}
              <p className="text-xs sm:text-sm font-semibold text-slate-350 uppercase tracking-widest font-sans">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ==========================================
   CountUp Sub-Component
   ========================================== */
const CountUp: React.FC<{ value: number }> = ({ value }) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1800; // in miliseconds

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function outQuad
      const easedProgress = progress * (2 - progress);
      
      setCurrentValue(Math.floor(easedProgress * value));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return <span>{currentValue.toLocaleString()}</span>;
};

// Maps stat icon strings to Lucide components
const renderStatIcon = (name: string) => {
  const IconComponent = (Lucide as any)[name];
  if (IconComponent) {
    return <IconComponent className="w-5 h-5" />;
  }
  return <Lucide.Activity className="w-5 h-5" />;
};
