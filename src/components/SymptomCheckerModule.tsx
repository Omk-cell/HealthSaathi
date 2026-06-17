import React, { useState, useRef, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Interfaces for our symptom checker
export interface Condition {
  name: string;
  probability: 'High' | 'Medium' | 'Low';
  explanation: string;
}

export interface SymptomReport {
  reply: string;
  possibleConditions: Condition[];
  urgencyLevel: 'Low' | 'Moderate' | 'Urgent' | 'Emergency';
  recommendedSpecialist: string;
  suggestedActions: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  report?: SymptomReport;
  error?: boolean;
}

const SYMPTOM_PRESETS = [
  {
    title: "Chest Tightness",
    text: "Heavy pressure is crushing my chest, extending slightly into my neck and my left arm.",
    desc: "Test an urgent cardiovascular profile"
  },
  {
    title: "Sudden High Fever",
    text: "Sudden onset of persistent high fever (103°F) accompanied by neck stiffness and sensitivity to lighting.",
    desc: "Test a severe infectious disease profile"
  },
  {
    title: "Stomach Bloating",
    text: "Mild bloating and sharp discomfort on the bottom-right of my abdomen that gets slightly worse after lunch.",
    desc: "Test a moderate gastroenterology profile"
  },
  {
    title: "Vascular Headache",
    text: "Throbbing headache on one side of my forehead, preceded by mild wavy vision or ocular aura sparkles.",
    desc: "Test a common migraine neurology profile"
  }
];

export const SymptomCheckerModule: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome-msg',
        sender: 'ai',
        text: "Greetings. I am HealthSaathi Clinical AI, your digital triaging companion. Briefly describe your symptoms below, such as where you feel discomfort, how long it has persisted, or any secondary manifestations.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the chat list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle message dispatch
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsgId = `usr-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/check-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptomDescription: textToSend })
      });

      if (!response.ok) {
        throw new Error('Symptom triage service encountered an issue. Please retry.');
      }

      const data = await response.json();
      
      if (data.modelResponse) {
        const reportUnit: SymptomReport = data.modelResponse;
        
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: reportUnit.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          report: reportUnit
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('No structured clinical response returned.');
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: err?.message || 'We could not analyze your symptoms at this moment. Please double check backend connectivity.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Preset click helper
  const handlePresetClick = (presetText: string) => {
    setInputText(presetText);
  };

  // Clear dialogue helper
  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-msg',
        sender: 'ai',
        text: "History cleared. I am HealthSaathi Clinical AI. Please enter your symptom details below to start a new medical triaging analysis.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Helper styles for Urgency Levels
  const getUrgencyConfig = (level: SymptomReport['urgencyLevel']) => {
    switch (level) {
      case 'Emergency':
        return {
          title: "Critical / Emergency Action Needed",
          bg: "bg-red-50 dark:bg-red-950/25 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30",
          dots: "bg-red-500 animate-ping",
          sub: "Call immediate local emergency clinical lines or go to the nearest emergency room.",
          badge: "bg-red-700 text-white"
        };
      case 'Urgent':
        return {
          title: "Urgent Clinic Care",
          bg: "bg-amber-50 dark:bg-amber-950/25 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-900/30",
          dots: "bg-amber-500",
          sub: "Schedule an urgent doctor appointment or visit an urgent care center today.",
          badge: "bg-amber-600 text-white"
        };
      case 'Moderate':
        return {
          title: "Moderate Clinical Triage",
          bg: "bg-yellow-50 dark:bg-yellow-950/25 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30",
          dots: "bg-yellow-500",
          sub: "Configure an appointment within the next 24-48 hours. Monitor parameters.",
          badge: "bg-yellow-500 text-slate-900"
        };
      default: // Low
        return {
          title: "Low Triage Priority / Self-Care",
          bg: "bg-emerald-50 dark:bg-emerald-950/25 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30",
          dots: "bg-emerald-500",
          sub: "Manage symptoms with plenty of fluid replenishment, standard rest, and clean hygiene.",
          badge: "bg-emerald-650 text-white"
        };
    }
  };

  return (
    <div id="ai-symptom-checker" className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      
      {/* LEFT AREA: CHATINTERFACE CONTAINER (lg:col-span-8) */}
      <div className="lg:col-span-8 flex flex-col h-[650px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm relative">
        
        {/* Chat window top header */}
        <div className="p-4 bg-slate-905 bg-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-md">
              <Lucide.Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight flex items-center gap-1.5">
                Saathi AI Symptom Triage <span className="bg-emerald-650 text-white text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">M.D. Advisory</span>
              </h3>
              <p className="text-[10.5px] text-slate-300">Evaluating clinical presentation & severity metrics instantly.</p>
            </div>
          </div>

          <button
            onClick={handleClearHistory}
            className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
            title="Reset Chat Triage"
          >
            <Lucide.RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Chat message streams area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-slate-50/50 dark:bg-slate-955 dark:bg-slate-950/20">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isAI = msg.sender === 'ai';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 max-w-[90%] font-sans ${isAI ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
                >
                  {/* Sender Avatar badge */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                    isAI ? 'bg-gradient-to-br from-slate-700 to-slate-900 text-teal-400 shadow-teal-500/5' : 'bg-emerald-600 text-white font-bold text-xs'
                  }`}>
                    {isAI ? (
                      <Lucide.Bot className="w-4.5 h-4.5" />
                    ) : (
                      'U'
                    )}
                  </div>

                  {/* Bubble wrapper */}
                  <div className="space-y-4 w-full">
                    <div className={`p-4 rounded-3xl text-xs sm:text-[13px] leading-relaxed border shadow-xs ${
                      isAI 
                        ? msg.error 
                          ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/45 text-rose-800 dark:text-rose-200' 
                          : 'bg-white dark:bg-slate-900/40 border-slate-205 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-medium'
                        : 'bg-emerald-600 text-white border-emerald-600 font-semibold rounded-tr-xs shadow-md shadow-emerald-600/10'
                    }`}>
                      {msg.text}

                      <span className={`block text-[9px] mt-1.5 font-bold ${isAI ? 'text-slate-400 dark:text-slate-500' : 'text-emerald-200'}`}>
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* AI Structured cards proper */}
                    {isAI && msg.report && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4"
                      >
                        {/* 1. Urgency Level Display Card */}
                        {(() => {
                           const uConfig = getUrgencyConfig(msg.report.urgencyLevel);
                           return (
                             <div className={`p-4 rounded-2xl border ${uConfig.bg} text-left`}>
                               <div className="flex items-center justify-between mb-2">
                                 <h4 className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                   <span className={`w-2 h-2 rounded-full inline-block ${uConfig.dots}`} /> Urgency Assessment
                                 </h4>
                                 <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-black uppercase ${uConfig.badge}`}>
                                   {msg.report.urgencyLevel}
                                 </span>
                               </div>
                               <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{uConfig.title}</h5>
                               <p className="text-[11px] text-slate-650 dark:text-slate-350 mt-1">{uConfig.sub}</p>
                             </div>
                           );
                        })()}

                        {/* 2. Potential pathology conditions listing */}
                        <div className="p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-left space-y-3.5">
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                            <Lucide.Dna className="w-3.5 h-3.5 text-blue-500" /> Possible Conditions Matrix
                          </h4>

                          <div className="space-y-3">
                            {msg.report.possibleConditions.map((cond, cIdx) => (
                              <div key={cIdx} className="p-3 bg-slate-50/70 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800/80 rounded-xl space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                                    {cond.name}
                                  </span>
                                  <span className={`text-[10px] font-black font-mono uppercase px-1.5 py-0.5 rounded ${
                                    cond.probability === 'High' 
                                      ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-150 dark:border-red-900/30'
                                      : cond.probability === 'Medium'
                                      ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-150 dark:border-amber-900/30'
                                      : 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-150 dark:border-blue-900/30'
                                  }`}>
                                    {cond.probability} likelihood
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-405 dark:text-slate-400 font-medium">
                                  {cond.explanation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 3. Recommended Specialists & Doctor suggestions */}
                        <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/15 border border-emerald-150 dark:border-emerald-900/35 rounded-2xl flex items-center gap-3 text-left">
                          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Lucide.UserRoundCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-wider block">Recommended Advisor</span>
                            <h5 className="font-black text-slate-850 dark:text-slate-100 text-xs sm:text-sm">{msg.report.recommendedSpecialist}</h5>
                            <p className="text-[10.5px] text-slate-500 dark:text-slate-450 dark:text-slate-400">Suggested specialized clinical consultant to consult.</p>
                          </div>
                        </div>

                        {/* 4. Suggested patient actions checklist (DO or DONT) */}
                        <div className="p-4 bg-white dark:bg-slate-900/40 border border-slate-201 border-slate-200 dark:border-slate-800 rounded-2xl text-left space-y-3">
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                            <Lucide.ShieldAlert className="w-3.5 h-3.5 text-emerald-500" /> Suggested Action Protocol
                          </h4>
                          <ul className="space-y-2">
                            {msg.report.suggestedActions.map((act, aIdx) => (
                              <li key={aIdx} className="flex gap-2 text-[11px] text-slate-650 dark:text-slate-350 font-medium leading-relaxed">
                                <Lucide.CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{act}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* AI clinical analysis loading bar */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[80%]"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-teal-400 flex items-center justify-center shrink-0">
                <Lucide.Bot className="w-4.5 h-4.5 animate-spin" />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 rounded-3xl text-[12px] text-slate-500 dark:text-slate-300 font-semibold text-left">
                <span className="flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                  </span>
                  Clinical AI is analyzing symptoms against triage models...
                </span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prominent Clinical Disclaimer */}
        <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 text-[10px] sm:text-[10.5px] border-t border-b border-amber-150 dark:border-amber-900/30 leading-relaxed shrink-0">
          ⚠️ <strong className="font-extrabold uppercase text-amber-950 dark:text-amber-400">Disclaimer:</strong> This AI tool provides informational suggestions only and is not a medical diagnosis. If you represent an acute emergency, please immediately call local emergency clinical lines (e.g., 911 / 112).
        </div>

        {/* Message Input layout */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage(inputText);
            }}
            placeholder="Describe symptoms here... (e.g. Sharp stomach ache for 2 days, moderate nausea)"
            className="flex-1 px-4 py-2 text-xs sm:text-[13px] border border-slate-202 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage(inputText)}
            id="send-symptoms-button"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition cursor-pointer flex items-center justify-center disabled:opacity-40"
            disabled={isLoading || !inputText.trim()}
          >
            <Lucide.SendHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RIGHT AREA: CLINICAL PRESSETS & INFO (lg:col-span-4) */}
      <div className="lg:col-span-4 space-y-5">
        
        {/* Presets and Suggested test cases */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl text-left space-y-4">
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
              <Lucide.TestTubes className="w-4.5 h-4.5 text-blue-500" /> Fast Diagnostic Presets
            </h4>
            <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-tight">Clicking any option pre-configures symptoms instantly into input for testing.</p>
          </div>

          <div className="space-y-2.5 select-none">
            {SYMPTOM_PRESETS.map((preset, idx) => (
              <div
                key={idx}
                onClick={() => handlePresetClick(preset.text)}
                className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:border-blue-200 dark:hover:border-blue-900/60 rounded-2xl cursor-pointer transition flex flex-col justify-between"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-extrabold text-[11.5px] text-slate-800 dark:text-slate-250">
                    {preset.title}
                  </span>
                  <Lucide.ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.text}
                </p>
                <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-extrabold mt-1.5 uppercase tracking-wide bg-indigo-50/40 dark:bg-indigo-950/30 px-1.5 py-0.5 rounded self-start">
                  {preset.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Triage Guidelines */}
        <div className="bg-slate-900 text-white p-5 rounded-3xl text-left space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Lucide.ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white tracking-tight">HIPAA & Clinical Standards</h4>
              <p className="text-[10px] text-slate-300">Triage scoring is advisory only</p>
            </div>
          </div>

          <div className="space-y-3.5 text-[10.5px] text-slate-250 leading-relaxed font-medium">
            <div className="flex gap-2.5">
              <span className="text-rose-450 shrink-0">●</span>
              <p><strong>Emergency Indicators:</strong> Severe breathing shortage, central breast tightness, facial drop, sudden unilateral sensory loss.</p>
            </div>
            <div className="flex gap-2.5">
              <span className="text-amber-450 shrink-0">●</span>
              <p><strong>Primary Information:</strong> Always mention secondary symptoms such as persistent fever, recent trips, or allergies.</p>
            </div>
            <div className="flex gap-2.5">
              <span className="text-emerald-450 shrink-0">●</span>
              <p><strong>AI Integrity:</strong> Our parser runs on top-grade clinical NLP networks to structure symptoms for direct physician reviews.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
