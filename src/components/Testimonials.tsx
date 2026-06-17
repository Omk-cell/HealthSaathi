import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Lucide from 'lucide-react';
import { testimonialsList } from '../data/healthcareData';
import { TestimonialItem } from '../types';

export const Testimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonialsList.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonialsList.length) % testimonialsList.length);
  };

  const currentTestimonial = testimonialsList[activeIndex];

  return (
    <section id="testimonials-section" className="py-20 bg-slate-50/50 dark:bg-slate-950/20 border-y border-slate-100 dark:border-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest font-mono">Patient Feedback</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            Trusted by Doctors &amp; Active Watchers
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
            Read clinical workflows, emergency rescues, and medicine-dispatch testimonials submitted by verified users.
          </p>
        </div>

        {/* Carousel / Card Complex */}
        <div className="max-w-4xl mx-auto relative px-4 text-center">
          
          {/* Main Card Frame */}
          <div className="min-h-[280px] bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-150 dark:border-slate-800 shadow-xl dark:shadow-none flex flex-col justify-between relative">
            {/* Elegant Quotation Mark Backdrop */}
            <span className="absolute top-2 right-6 font-serif text-8xl text-slate-100 dark:text-slate-800/40 font-extrabold select-none leading-none z-0">
              “
            </span>

            <div className="relative z-10 space-y-6">
              {/* Stars rating */}
              <div className="flex justify-center gap-1">
                {[...Array(currentTestimonial.stars)].map((_, i) => (
                  <Lucide.Star key={i} className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote block */}
              <blockquote className="text-sm sm:text-base md:text-lg text-slate-700 dark:text-slate-200 font-medium leading-relaxed max-w-2xl mx-auto italic font-sans">
                &quot;{currentTestimonial.content}&quot;
              </blockquote>
            </div>

            {/* Author Profile */}
            <div className="flex flex-col items-center gap-2 mt-6 relative z-10">
              <img 
                src={currentTestimonial.avatarUrl} 
                alt={currentTestimonial.name} 
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5">
                  {currentTestimonial.name}
                  {currentTestimonial.verified && (
                    <span className="p-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-605 text-emerald-600 dark:text-emerald-400 inline-block" title="Verified Profile">
                      <Lucide.CheckCircle className="w-3.5 h-3.5 fill-emerald-100 dark:fill-emerald-950" />
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono font-bold mt-0.5">
                  {currentTestimonial.role}
                </p>
              </div>
            </div>

          </div>

          {/* Slider Controllers */}
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={handlePrev}
              className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl hover:shadow-md transition-all cursor-pointer"
            >
              <Lucide.ArrowLeft className="w-4.5 h-4.5" />
            </button>
            
            {/* Interactive dots */}
            <div className="flex gap-1.5">
              {testimonialsList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeIndex === idx ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 dark:bg-slate-800 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to testimonial slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl hover:shadow-md transition-all cursor-pointer"
            >
              <Lucide.ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
