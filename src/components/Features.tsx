import React from 'react';
import { motion } from 'motion/react';
import * as Lucide from 'lucide-react';
import { featuresList } from '../data/healthcareData';
import { FeatureItem, ModalType } from '../types';

interface FeaturesProps {
  onOpenModal: (type: ModalType) => void;
}

export const Features: React.FC<FeaturesProps> = ({ onOpenModal }) => {
  
  // Maps icon helper strings to genuine Lucide elements
  const renderLucideIcon = (name: string, colorTheme: string) => {
    let IconComponent = (Lucide as any)[name];
    if (!IconComponent) {
      if (name === 'TestTubeDiagonal') IconComponent = Lucide.TestTube;
      else if (name === 'ShieldAlert') IconComponent = Lucide.FolderLock;
      else if (name === 'FileCheck2') IconComponent = Lucide.FileDigit;
      else IconComponent = Lucide.Activity;
    }

    const colorClasses: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      indigo: 'bg-indigo-50 text-indigo-600',
      teal: 'bg-teal-50 text-teal-600',
      emerald: 'bg-emerald-50 text-emerald-600',
      amber: 'bg-amber-50 text-amber-600',
      red: 'bg-rose-50 text-rose-600'
    };

    return (
      <div className={`p-3.5 rounded-2xl ${colorClasses[colorTheme] || 'bg-slate-50 text-slate-600'} shrink-0 mb-4 transition-transform group-hover:scale-110 duration-300`}>
        <IconComponent className="w-6 h-6" />
      </div>
    );
  };

  // Maps which modal to pop based on Feature ID clicking
  const handleFeatureClick = (id: string) => {
    if (id === 'appointment') onOpenModal('appointment');
    else if (id === 'symptom') onOpenModal('symptom');
    else if (id === 'records') onOpenModal('records');
    else if (id === 'medicine') onOpenModal('medicine');
    else if (id === 'lab-test') onOpenModal('records');
    else if (id === 'insurance') onOpenModal('records');
    else if (id === 'emergency') onOpenModal('emergency');
    else onOpenModal('appointment'); // generic default fallback
  };

  return (
    <section id="features-section" className="py-20 bg-slate-50 dark:bg-slate-950/40 border-y border-slate-100 dark:border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest font-mono">Integrated Modules</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            Empowering Your Complete Clinical Journey
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
            Our unified patient ecosystem houses all necessary avenues to monitor wellness, order essentials, sync claims, and schedule clinical consultations inside security parameters.
          </p>
        </div>

        {/* 8-Card Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuresList.map((feature: FeatureItem, index: number) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              onClick={() => handleFeatureClick(feature.id)}
              className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-150/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 shadow-sm feature-card cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  {renderLucideIcon(feature.iconName, feature.colorTheme)}
                  {feature.badge && (
                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-705 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                      {feature.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans mb-6">
                  {feature.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:gap-2.5 transition-all">
                <span>Try Service</span>
                <Lucide.ArrowRight className="w-3.5 h-3.5 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
