import React, { useState, useEffect, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TeleMessage {
  id: string;
  sender: 'patient' | 'doctor' | 'system';
  text: string;
  timestamp: string;
  attachment?: {
    type: 'file' | 'prescription' | 'image';
    name: string;
    size: string;
    url?: string;
  };
}

interface TelemedicineConsultationModuleProps {
  onAddNotification?: (notif: {
    id: string;
    title: string;
    text: string;
    time: string;
    unread: boolean;
    type: 'success' | 'alert' | 'info';
  }) => void;
  onSessionStateChange?: (isLive: boolean) => void;
  onAddRecordToLocker?: (record: {
    id: string;
    name: string;
    fileName: string;
    category: 'Prescription' | 'Reports' | 'X-Ray' | 'Insurance Documents';
    date: string;
    doctor: string;
    institution: string;
    size: string;
    notes?: string;
  }) => void;
}

export const TelemedicineConsultationModule: React.FC<TelemedicineConsultationModuleProps> = ({
  onAddNotification,
  onSessionStateChange,
  onAddRecordToLocker,
}) => {
  // Session parameters state
  const [isLive, setIsLive] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  // Video visual modes & status overlays
  const [activeSpeaker, setActiveSpeaker] = useState<'doctor' | 'patient'>('doctor');
  const [qualityScore, setQualityScore] = useState<'excellent' | 'good' | 'poor'>('excellent');
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [feedbackNotes, setFeedbackNotes] = useState('');

  // Transcription & Subtitle simulation ticker
  const [activeSubtitle, setActiveSubtitle] = useState<string>('Press "Start Consult" to connect with your assigned doctor.');
  const [subtitleQueueIndex, setSubtitleQueueIndex] = useState(0);

  // Chat Feed states
  const [chatMessages, setChatMessages] = useState<TeleMessage[]>([
    {
      id: 'm-init-1',
      sender: 'system',
      text: 'HIPAA High-Security Peer-to-Peer Tunnel ready.',
      timestamp: '17:04',
    },
    {
      id: 'm-init-2',
      sender: 'system',
      text: 'Physician Dr. Alok Sen is review-ready with your health records locker files.',
      timestamp: '17:04',
    }
  ]);
  const [typedMessage, setTypedMessage] = useState('');

  // Dropdown menus / panel popups
  const [showFileAttachMenu, setShowFileAttachMenu] = useState(false);
  const [showPrescriptionUploadMenu, setShowPrescriptionUploadMenu] = useState(false);

  // Sharing form inputs
  const [customFileName, setCustomFileName] = useState('');
  const [customFileType, setCustomFileType] = useState<'Reports' | 'X-Ray' | 'Insurance Documents'>('Reports');
  const [prescriptionTitle, setPrescriptionTitle] = useState('');
  const [prescriptionMeds, setPrescriptionMeds] = useState('');
  const [prescriptionDirections, setPrescriptionDirections] = useState('');

  // DOM Refs for chat focus and file triggering
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic clinical subtitles script to inject high realism
  const CLINICAL_SUBTITLES = [
    "Dr. Alok: I can see your Echocardiogram. Your LVEF looks solid at 58%. No valve anomalies.",
    "Dr. Alok: Let's discuss that minor eosinophil level spike. Any mild skin rashes or seasonal nose irritations?",
    "Dr. Alok: Understood. A pollen allergen during late spring explains the high counts. Let's check your current blood pressure.",
    "Dr. Alok: High fibers intake is necessary for stomach lining recovery. Keep taking standard empty-stomach antacids.",
    "Dr. Alok: I'm writing down a daily multivitamin care plan to supplement. Is there any chest pressure or burning sensation today?",
    "Dr. Alok: Perfect. Keep up the low sodium diet schedule.",
    "Dr. Alok: I have authorized a follow-up assessment for July. Take care, Rohan!"
  ];

  // Duration ticker
  useEffect(() => {
    if (isLive) {
      timerRef.current = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setSessionDuration(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLive]);

  // Handle auto-replies and subtitles based on session time
  useEffect(() => {
    if (!isLive) return;

    // Periodically cycle subtitles to represent a real clinical dialogue
    const subInterval = setInterval(() => {
      setSubtitleQueueIndex(idx => {
        const nextIdx = (idx + 1) % CLINICAL_SUBTITLES.length;
        setActiveSubtitle(CLINICAL_SUBTITLES[nextIdx]);

        // Occasionally push the doctor's spoken dialogue directly into the chat stream!
        if (Math.random() > 0.4) {
          const rawText = CLINICAL_SUBTITLES[nextIdx].replace("Dr. Alok: ", "");
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setChatMessages(prev => [
            ...prev,
            {
              id: `m-doc-${Date.now()}`,
              sender: 'doctor',
              text: rawText,
              timestamp: nowStr
            }
          ]);
        }

        return nextIdx;
      });
    }, 11000);

    return () => clearInterval(subInterval);
  }, [isLive]);

  // Handle scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const toggleConsultation = () => {
    if (isLive) {
      setShowEndSessionModal(true);
    } else {
      setIsConnecting(true);
      // Simulate real peer connection handshake & ICE negotiations
      setTimeout(() => {
        setIsLive(true);
        setIsConnecting(false);
        setActiveSubtitle("Dr. Alok Sen is online. 'Rohan, good morning! Let us begin our weekly clinical telemetry check.'");
        
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setChatMessages(prev => [
          ...prev,
          {
            id: `m-connect-${Date.now()}`,
            sender: 'system',
            text: 'Audio/Video streaming multiplexer resolved. Bitrate: 4.8 Mbps. Peer connected.',
            timestamp: nowStr,
          }
        ]);

        if (onSessionStateChange) {
          onSessionStateChange(true);
        }

        if (onAddNotification) {
          onAddNotification({
            id: `n-tele-${Date.now()}`,
            title: 'Consultation Session Live',
            text: 'Secure clinical tunnel created with Cardiologist Dr. Alok Sen.',
            time: 'Just now',
            unread: true,
            type: 'info'
          });
        }
      }, 1500);
    }
  };

  const handleEndCallFinalSubmit = () => {
    setIsLive(false);
    setShowEndSessionModal(false);
    setActiveSubtitle('Consultation concluded. Digital patient reports saved in record history.');
    
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [
      ...prev,
      {
        id: `m-disc-${Date.now()}`,
        sender: 'system',
        text: 'Session safely closed. End-patient rating logged. Vitals data written back successfully.',
        timestamp: nowStr,
      }
    ]);

    if (onSessionStateChange) {
      onSessionStateChange(false);
    }

    if (onAddNotification) {
      onAddNotification({
        id: `n-tele-end-${Date.now()}`,
        title: 'Consultation Concluded',
        text: `Consultation session marked complete. You rated it ${ratingInput}/5 stars. Thank you.`,
        time: 'Just now',
        unread: true,
        type: 'success'
      });
    }

    // Reset parameters
    setFeedbackNotes('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !isLive) return;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: TeleMessage = {
      id: `m-pat-${Date.now()}`,
      sender: 'patient',
      text: typedMessage.trim(),
      timestamp: nowStr,
    };

    setChatMessages(prev => [...prev, newMsg]);
    setTypedMessage('');

    // Simulate doctor responding dynamically using clinical heuristics
    setTimeout(() => {
      const patientMsgLower = newMsg.text.toLowerCase();
      let responseText = "Let me carefully review that point Rohan. Please continue.";

      if (patientMsgLower.includes('heart') || patientMsgLower.includes('pressure') || patientMsgLower.includes('ecg')) {
        responseText = "Understood. The minor left ventricle thickening is benign. Let's maintain a daily records log.";
      } else if (patientMsgLower.includes('medicine') || patientMsgLower.includes('pills') || patientMsgLower.includes('rx')) {
        responseText = "Excellent. Ensure you take the antacid on empty stomach and multivitamin formulas immediately after dinner.";
      } else if (patientMsgLower.includes('pain') || patientMsgLower.includes('acid') || patientMsgLower.includes('stomach')) {
        responseText = "Yes, Pantoprazole is gastro-resistant to shelter the stomach lining. Take a walk post-meal to aid physiological absorption.";
      } else {
        const phrases = [
          "Thank you for sharing. I'm updating your clinical timeline now.",
          "Good. Are you recording any other allergic symptoms under standard light conditions?",
          "Perfect. Let's document these metrics securely in your cloud locker. You can easily retrieve reports via the dashboard."
        ];
        responseText = phrases[Math.floor(Math.random() * phrases.length)];
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: `m-reply-${Date.now()}`,
          sender: 'doctor',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }, 1500);
  };

  // Quick Chat recommendation cues
  const handleSendQuickCue = (text: string) => {
    if (!isLive) return;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [
      ...prev,
      {
        id: `m-cue-${Date.now()}`,
        sender: 'patient',
        text,
        timestamp: nowStr
      }
    ]);

    // Fast reaction
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          id: `m-cue-reply-${Date.now()}`,
          sender: 'doctor',
          text: `Logged symptom metric: "${text}". Please verify if you have updated your diagnostic history today.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  // Handles clinical record locker upload integrations directly from call
  const handleUploadFileToChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFileName.trim() || !isLive) return;

    const fileSz = `${(1.0 + Math.random() * 4).toFixed(1)} MB`;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const generatedId = `rec-tele-${Math.floor(1000 + Math.random() * 9000)}`;

    const newMsg: TeleMessage = {
      id: `m-attach-${Date.now()}`,
      sender: 'patient',
      text: `Uploaded diagnostic documentation: "${customFileName.trim()}"`,
      timestamp: nowStr,
      attachment: {
        type: 'file',
        name: customFileName.trim(),
        size: fileSz
      }
    };

    setChatMessages(prev => [...prev, newMsg]);

    // Push right back into the clinical document storage list!
    if (onAddRecordToLocker) {
      onAddRecordToLocker({
        id: generatedId,
        name: customFileName.trim(),
        fileName: `${customFileName.trim().toLowerCase().replace(/\s+/g, '_')}.pdf`,
        category: customFileType,
        date: new Date().toISOString().split('T')[0],
        doctor: 'Dr. Alok Sen (Shared during Telemedicine Consultation)',
        institution: 'Apex Cardiovascular Institute, Mumbai',
        size: fileSz,
        notes: 'Document automatically synchronized from secure telemedicine chat room transmission.'
      });
    }

    setCustomFileName('');
    setShowFileAttachMenu(false);

    // Doctor simulated reaction
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          id: `m-file-reply-${Date.now()}`,
          sender: 'doctor',
          text: `I have received "${customFileName.trim()}" in my diagnostic review ledger. This will assist our target evaluation. Let me look over the details now.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1800);
  };

  const handleUploadPrescriptionToChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescriptionTitle.trim() || !isLive) return;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const generatedId = `rec-rx-${Math.floor(1000 + Math.random() * 9000)}`;

    const newMsg: TeleMessage = {
      id: `m-rx-${Date.now()}`,
      sender: 'patient',
      text: `Synchronized clinical prescription record: "${prescriptionTitle.trim()}"`,
      timestamp: nowStr,
      attachment: {
        type: 'prescription',
        name: prescriptionTitle.trim(),
        size: '220 KB'
      }
    };

    setChatMessages(prev => [...prev, newMsg]);

    // Push right back into clinical locker records
    if (onAddRecordToLocker) {
      onAddRecordToLocker({
        id: generatedId,
        name: prescriptionTitle.trim(),
        fileName: `${prescriptionTitle.trim().toLowerCase().replace(/\s+/g, '_')}_rx.pdf`,
        category: 'Prescription',
        date: new Date().toISOString().split('T')[0],
        doctor: 'Dr. Alok Sen',
        institution: 'Apex Cardiology Hub',
        size: '220 KB',
        notes: `Clinical Prescription: Drugs prescribed - ${prescriptionMeds}. Recommended Schedule: ${prescriptionDirections}`
      });
    }

    setPrescriptionTitle('');
    setPrescriptionMeds('');
    setPrescriptionDirections('');
    setShowPrescriptionUploadMenu(false);

    // Doctor reaction simulation
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          id: `m-rx-reply-${Date.now()}`,
          sender: 'doctor',
          text: `Prescription "${prescriptionTitle.trim()}" is securely registered to your Health Locker. The medicine list is verified.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };

  const formatTimerValue = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="telemedicine-consultation-interface" className="space-y-6">

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1 & 2: Main Telemedicine Video Terminal Feed */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-slate-950 rounded-3xl overflow-hidden flex flex-col justify-between aspect-video lg:h-[520px] text-white shadow-2xl relative border border-slate-800">
            
            {/* Top Overlay Controls Bar */}
            <div className="p-4 bg-gradient-to-b from-black/90 to-transparent flex justify-between items-center z-10 absolute top-0 left-0 right-0">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
                <span className="text-[9.5px] font-mono uppercase bg-slate-900 border border-slate-800 font-extrabold px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1">
                  <Lucide.ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> SECURE TUNNEL EST.103
                </span>
                {isLive && (
                  <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded font-mono font-black animate-pulse">
                    LIVE
                  </span>
                )}
              </div>

              {isLive ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-black/40 backdrop-blur rounded-lg px-2.5 py-1">
                    <Lucide.Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px] font-bold font-mono text-slate-100">
                      {formatTimerValue(sessionDuration)}
                    </span>
                  </div>
                  
                  {/* Quality health indicator */}
                  <div className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded-lg">
                    <Lucide.Wifi className="w-3.5 h-3.5" /> 22ms HD
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-semibold italic">Waiting room ready</span>
              )}
            </div>

            {/* Video Streams Canvas Main Area */}
            <div className="flex-1 flex items-center justify-center relative bg-slate-950">
              
              {isLive ? (
                <div className="w-full h-full relative">
                  
                  {/* MAIN SPEAKER STREAM: DOCTOR VIDEO FEED */}
                  <div className="absolute inset-0 bg-slate-900 flex items-center justify-center overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=1200"
                      alt="Dr. Alok Sen Telehealth Live Feed"
                      className="w-full h-full object-cover select-none"
                    />

                    {/* Dr. Alok Identity Panel Overlay */}
                    <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-850 flex items-center gap-2.5 max-w-[90%]">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-black text-xs text-blue-700">
                          AS
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                          <span className="w-1 h-1 bg-white rounded-full animate-ping" />
                        </span>
                      </div>
                      <div className="text-left">
                        <h5 className="text-[11.5px] font-black text-slate-100 tracking-tight leading-tight flex items-center gap-1">
                          Dr. Alok Sen, MD, FACC <span>&#8226; Cardiology</span>
                        </h5>
                        <p className="text-[9px] text-slate-450 leading-none mt-0.5">
                          Apex Diagnostic Hospital Network (License #20081290)
                        </p>
                      </div>
                    </div>

                    {/* Animated Volume Audio Level Meter Indicator */}
                    <div className="absolute top-18 left-4 flex gap-1 bg-black/60 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-800">
                      <div className="p-0.5 rounded-full text-blue-400">
                        <Lucide.Mic className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex items-center gap-0.5 font-mono text-[9px] text-slate-200">
                        <span className="h-3 w-0.5 bg-blue-500 animate-[pulse_0.6s_infinite]" />
                        <span className="h-2 w-0.5 bg-blue-500 animate-[pulse_0.8s_infinite]" />
                        <span className="h-4.5 w-0.5 bg-blue-400 animate-[pulse_0.4s_infinite]" />
                        <span className="h-1.5 w-0.5 bg-blue-500 animate-[pulse_1s_infinite]" />
                        <span className="h-3 w-0.5 bg-blue-500 animate-[pulse_0.5s_infinite]" />
                      </div>
                    </div>
                  </div>

                  {/* MINI PIP STREAM: PATIENT VIDEO FEED */}
                  <AnimatePresence>
                    {cameraActive ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: 20 }}
                        className="absolute bottom-4 right-4 w-40 h-28 bg-slate-900 border-2 border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-end relative"
                      >
                        <div className="absolute inset-0 bg-slate-900 overflow-hidden">
                          {/* Simulated local camera feed */}
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <img
                              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                              alt="Rohan Sharma Local"
                              className="w-full h-full object-cover scale-x-[-1]"
                            />
                          </div>
                        </div>

                        {/* Name panel overlay */}
                        <div className="absolute bottom-2 left-2 right-2 bg-black/65 backdrop-blur-md p-1.5 rounded-lg border border-slate-800/50 flex align-center justify-between text-[10px]">
                          <span className="font-bold text-white tracking-tight">Rohan (You)</span>
                          <span className="text-[8.5px] font-extrabold text-blue-400 font-mono">
                            {micActive ? 'Mic Active' : 'Self Muted'}
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute bottom-4 right-4 w-40 h-28 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-1.5 shadow-2xl"
                      >
                        <div className="w-9 h-9 rounded-full bg-slate-820 flex items-center justify-center border border-slate-700 text-slate-350">
                          <Lucide.UserX className="w-5 h-5 text-slate-400" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-450 uppercase">Video Off</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              ) : (
                <div className="text-center space-y-6 px-6 max-w-md">
                  <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto">
                    {isConnecting ? (
                      <Lucide.Loader2 className="w-10 h-10 animate-spin" />
                    ) : (
                      <Lucide.Video className="w-10 h-10" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-black text-slate-100 text-base sm:text-lg">HIPAA Encrypted Consultation Room</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Initialize your private video session with cardiologist Dr. Alok Sen in deep cardiovascular follow-up routines. Your records locker is linked automatically.
                    </p>
                  </div>

                  <button
                    onClick={toggleConsultation}
                    disabled={isConnecting}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white font-black text-xs rounded-2xl shadow-xl shadow-blue-500/10 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isConnecting ? 'ICE Negotiating Tunnel...' : 'Start Video Consult'}
                  </button>
                </div>
              )}
            </div>

            {/* Transcription & Dialogue Subtitles overlay bar */}
            {isLive && (
              <div className="p-3 bg-black/90 text-[11px] text-center font-medium leading-relaxed tracking-wide text-blue-300 border-t border-slate-850 z-10 flex items-center justify-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping shrink-0" />
                <span className="italic">&ldquo;{activeSubtitle}&rdquo;</span>
              </div>
            )}

            {/* Live Media Controls Deck Chassis */}
            {isLive && (
              <div className="p-4 bg-slate-950 border-t border-slate-850 flex items-center justify-between z-10 shrink-0 gap-2 overflow-x-auto">
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setMicActive(!micActive);
                      if (onAddNotification) {
                        onAddNotification({
                          id: `n-mic-${Date.now()}`,
                          title: micActive ? 'Microphone Muted' : 'Microphone Activated',
                          text: micActive ? 'Your microphone is now muted.' : 'Doctor Alok can now hear your stream.',
                          time: 'Just now',
                          unread: false,
                          type: 'info'
                        });
                      }
                    }}
                    className={`p-3 rounded-xl transition cursor-pointer border ${
                      micActive
                        ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-100'
                        : 'bg-rose-950 border-rose-900 hover:bg-rose-900 text-rose-400'
                    }`}
                    title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
                  >
                    {micActive ? <Lucide.Mic className="w-5 h-5" /> : <Lucide.MicOff className="w-5 h-5 animate-pulse" />}
                  </button>

                  <button
                    onClick={() => {
                      setCameraActive(!cameraActive);
                      if (onAddNotification) {
                        onAddNotification({
                          id: `n-cam-${Date.now()}`,
                          title: cameraActive ? 'Camera Disabled' : 'Camera Enabled',
                          text: cameraActive ? 'Your video stream is now private.' : 'Your camera transmission is online.',
                          time: 'Just now',
                          unread: false,
                          type: 'info'
                        });
                      }
                    }}
                    className={`p-3 rounded-xl transition cursor-pointer border ${
                      cameraActive
                        ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-100'
                        : 'bg-rose-950 border-rose-900 hover:bg-rose-900 text-rose-400'
                    }`}
                    title={cameraActive ? 'Disable Camera' : 'Enable Camera'}
                  >
                    {cameraActive ? <Lucide.Video className="w-5 h-5" /> : <Lucide.VideoOff className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => {
                      setScreenSharing(!screenSharing);
                      if (onAddNotification) {
                        onAddNotification({
                          id: `n-share-${Date.now()}`,
                          title: screenSharing ? 'Screen Sharing Stopped' : 'Screen Sharing Started',
                          text: screenSharing ? 'Video stream returned to cam.' : 'Sharing interactive desktop viewport to doctor.',
                          time: 'Just now',
                          unread: false,
                          type: 'info'
                        });
                      }
                    }}
                    className={`p-3 rounded-xl transition cursor-pointer border ${
                      screenSharing
                        ? 'bg-blue-900/30 border-blue-800 text-blue-400 hover:bg-blue-900/50'
                        : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-100'
                    }`}
                    title="Share Screen"
                  >
                    <Lucide.Tv className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFileAttachMenu(true)}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-100 font-extrabold text-xs transition flex items-center gap-1.5 shrink-0"
                  >
                    <Lucide.Paperclip className="w-4 h-4 text-blue-400" /> Share Lab Report
                  </button>
                  <button
                    onClick={() => setShowPrescriptionUploadMenu(true)}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-100 font-extrabold text-xs transition flex items-center gap-1.5 shrink-0"
                  >
                    <Lucide.FileBadge className="w-4 h-4 text-emerald-400" /> Upload Prescription
                  </button>

                  <button
                    onClick={toggleConsultation}
                    className="py-3 px-5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-900/30 transition cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Lucide.PhoneOff className="w-4 h-4" /> End Call
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Guidelines info card beneath video */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-2.5">
              <div className="p-1 px-2.5 bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-mono font-bold text-[10px] rounded-lg mt-0.5 animate-none">HIPAA</div>
              <div>
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200">Security Vault</p>
                <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.2">Encryption: AES256 socket TLS protocols.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-3.5 md:pt-0 md:pl-4">
              <div className="p-1 px-2.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-[10px] rounded-lg mt-0.5 animate-none">NABL</div>
              <div>
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200">Verified Diagnostics</p>
                <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.2">Doctor credentials audited automatically.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-3.5 md:pt-0 md:pl-4">
              <div className="p-1 px-2 bg-amber-100 dark:bg-amber-955/40 text-amber-705 dark:text-amber-400 font-mono font-bold text-[10px] rounded-lg mt-0.5 animate-none">AUTO</div>
              <div>
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200">Auto Sync History</p>
                <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.2">Records shared in chat are added to Locker.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Telemedicine Encrypted Secure Chat Terminal */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-250 dark:border-slate-805 flex flex-col justify-between overflow-hidden shadow-sm lg:h-[610px]">
          
          {/* Box Header */}
          <div className="p-4 border-b border-slate-150 dark:border-slate-805 bg-slate-50 dark:bg-slate-950 shrink-0 flex justify-between items-center">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-650 dark:text-slate-300 flex items-center gap-1.5">
                <Lucide.MessagesSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Consult Chat Chamber
              </h4>
              <p className="text-[10.5px] text-slate-400 dark:text-slate-500">HIPAA Protected clinical journal.</p>
            </div>
            <span className="text-[9.5px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/40 rounded px-1.5 font-mono">
              Online
            </span>
          </div>

          {/* Scrollable Conversation Stream */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/20">
            {chatMessages.map((msg) => {
              const score = msg.sender;
              const isSystem = score === 'system';
              const isPatient = score === 'patient';
              const isDoctor = score === 'doctor';

              if (isSystem) {
                return (
                  <div key={msg.id} className="text-center">
                    <div className="inline-block py-1 px-3.5 bg-slate-150 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-505 dark:text-slate-300 rounded-xl font-mono text-[9px] font-extrabold max-w-[90%] select-none">
                      🔒 {msg.text}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isPatient ? 'items-end' : 'items-start'} gap-1`}
                >
                  {/* Sender title label */}
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-1 font-mono">
                    {isPatient ? 'Rohan Sharma' : 'Dr. Alok Sen'} &#8226; {msg.timestamp}
                  </span>

                  {/* Bubble body content */}
                  <div
                    className={`p-3 rounded-2xl text-[11.5px] max-w-[90%] leading-relaxed shadow-sm border ${
                      isPatient
                        ? 'bg-blue-600 border-blue-500 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-705 text-slate-800 dark:text-slate-100 rounded-tl-none'
                    }`}
                  >
                    <p className="font-medium whitespace-pre-wrap">{msg.text}</p>

                    {/* Shared attachment render integration */}
                    {msg.attachment && (
                      <div className={`mt-3 p-2.5 rounded-xl border flex items-center justify-between gap-3 text-left ${
                        isPatient 
                          ? 'bg-blue-700 border-blue-600 text-white' 
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-150 dark:border-slate-800 text-slate-800 dark:text-slate-205'
                      }`}>
                        <div className="flex items-center gap-2 truncate">
                          {msg.attachment.type === 'prescription' ? (
                            <Lucide.Pill className="w-5 h-5 shrink-0 text-emerald-400" />
                          ) : (
                            <Lucide.FileSpreadsheet className="w-5 h-5 shrink-0 text-blue-400" />
                          )}
                          <div className="truncate">
                            <p className="font-bold text-[11px] truncate leading-tight">{msg.attachment.name}</p>
                            <span className="text-[9.5px] opacity-75 font-mono">{msg.attachment.size}</span>
                          </div>
                        </div>

                        <span className="p-1.5 bg-black/10 rounded-lg text-emerald-300">
                          <Lucide.CheckCircle2 className="w-4 h-4" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Chat conversational recommendation tags */}
          {isLive && (
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-150 dark:border-slate-805 overflow-x-auto flex gap-2 shrink-0 select-none">
              <button
                onClick={() => handleSendQuickCue('My chest pressure is normal today')}
                className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-655 dark:text-slate-300 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-800 transition shrink-0 cursor-pointer"
              >
                Normal chest pressure
              </button>
              <button
                onClick={() => handleSendQuickCue('When should I repeat my next CBC blood panel?')}
                className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-655 dark:text-slate-300 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-800 transition shrink-0 cursor-pointer"
              >
                Repeating CBC panel duration
              </button>
              <button
                onClick={() => handleSendQuickCue('I took my Gastric care medicines on an empty stomach')}
                className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-655 dark:text-slate-300 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-800 transition shrink-0 cursor-pointer"
              >
                Took pills on empty stomach
              </button>
            </div>
          )}

          {/* Chat Form panel */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-805 bg-white dark:bg-slate-900 shrink-0 flex gap-2">
            <input
              type="text"
              required
              disabled={!isLive}
              value={typedMessage}
              onChange={e => setTypedMessage(e.target.value)}
              placeholder={isLive ? "Type securely to doctor..." : "Consultation must be live to chat..."}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 disabled:bg-slate-100 dark:disabled:bg-slate-950 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-550"
            />
            <button
              type="submit"
              disabled={!isLive}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-850/45 text-white rounded-xl transition shadow-md shadow-blue-500/10 cursor-pointer disabled:cursor-not-allowed"
            >
              <Lucide.Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* =========================================================
          POPUP 1: SHARE DOCUMENT / LABORATORY REPORT FOR REVIEW (MODAL)
          ========================================================= */}
      <AnimatePresence>
        {showFileAttachMenu && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-md w-full shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setShowFileAttachMenu(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 dark:hover:text-slate-350 cursor-pointer"
              >
                <Lucide.X className="w-5 h-5" />
              </button>

              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-105 flex items-center gap-1.5">
                  <Lucide.FileUp className="w-5 h-5 text-blue-600 dark:text-blue-450" /> Share Lab Document & Reports
                </h4>
                <p className="text-[11px] text-slate-450 dark:text-slate-400 mt-0.5">
                  The document will be shown to Dr. Alok Sen and automatically synchronised to your Patient Medical Locker.
                </p>
              </div>

              <form onSubmit={handleUploadFileToChat} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">Document / Report Title Name</label>
                  <input
                    type="text"
                    required
                    value={customFileName}
                    onChange={e => setCustomFileName(e.target.value)}
                    placeholder="e.g. Bandra Radiology Liver Ultrasound Screen"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-550"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">Locker Destination Category</label>
                  <select
                    value={customFileType}
                    onChange={e => setCustomFileType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900 select-none"
                  >
                    <option value="Reports">Diagnostics Reports</option>
                    <option value="X-Ray">X-Ray Studies / Scans</option>
                    <option value="Insurance Documents">Cashless PreAuth & Policies</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 rounded-xl text-[10px] text-slate-555 dark:text-slate-405 flex items-start gap-1.5 italic">
                  <Lucide.ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-450 shrink-0" />
                  <span>Integrated with NABL standards. Report status marked Verified instantly upon sharing.</span>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFileAttachMenu(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer"
                  >
                    Upload and Share
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================
          POPUP 2: UPLOAD PATIENT PRESCRIPTION SIGN-OFF (MODAL)
          ========================================================= */}
      <AnimatePresence>
        {showPrescriptionUploadMenu && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-md w-full shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setShowPrescriptionUploadMenu(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 dark:hover:text-slate-350 cursor-pointer"
              >
                <Lucide.X className="w-5 h-5" />
              </button>

              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-105 flex items-center gap-1.5">
                  <Lucide.FileBadge className="w-5 h-5 text-emerald-600 dark:text-emerald-450" /> Upload Medication Prescription
                </h4>
                <p className="text-[11px] text-slate-450 dark:text-slate-400 mt-0.5">
                  Upload prescription slips into consultation. Medicines will sync to the patient archive.
                </p>
              </div>

              <form onSubmit={handleUploadPrescriptionToChat} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">Prescription Header / Name</label>
                  <input
                    type="text"
                    required
                    value={prescriptionTitle}
                    onChange={e => setPrescriptionTitle(e.target.value)}
                    placeholder="e.g. Cardiological Routine Beta Blocker & Multivitamin"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-550"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">Prescribed Medicine List</label>
                  <input
                    type="text"
                    required
                    value={prescriptionMeds}
                    onChange={e => setPrescriptionMeds(e.target.value)}
                    placeholder="e.g. Pantoprazole 40mg, Multivitamin Complete Profile"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-550"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">Directions & Dosage Advice</label>
                  <textarea
                    rows={2}
                    value={prescriptionDirections}
                    onChange={e => setPrescriptionDirections(e.target.value)}
                    placeholder="e.g. Once daily on an empty stomach in mornings. Complete course."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-550 resize-none animate-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPrescriptionUploadMenu(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer"
                  >
                    Save Prescription
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================
          POPUP 3: CONSULTATION END CALL FEEDBACK AND CLINICAL RATING (MODAL)
          ========================================================= */}
      <AnimatePresence>
        {showEndSessionModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-250 dark:border-slate-800 max-w-md w-full shadow-2xl relative space-y-5 text-left"
            >
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-450 flex items-center justify-center mx-auto animate-none">
                  <Lucide.HeartHandshake className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-800 dark:text-slate-105">Conclude Premium Consultation</h4>
                  <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                    Are you ready to safely close the telemedicine channel? Please rate Dr. Alok Sen's expertise and clinical assistance.
                  </p>
                </div>
              </div>

              {/* Interactive Starlight Rating Selection Chassis */}
              <div className="flex justify-center gap-2 py-3 border-y border-slate-100 dark:border-slate-800">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingInput(star)}
                    className="p-1 text-amber-400 hover:scale-115 transition duration-150 cursor-pointer"
                  >
                    <Lucide.Star
                      className={`w-8 h-8 ${
                        star <= ratingInput ? 'fill-amber-400 stroke-amber-400' : 'text-slate-255 dark:text-slate-700 stroke-slate-300 dark:stroke-slate-650'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-slate-655 dark:text-slate-405">Encounter / Experience Vitals Notes</label>
                <input
                  type="text"
                  value={feedbackNotes}
                  onChange={e => setFeedbackNotes(e.target.value)}
                  placeholder="e.g. He answered clearly, medicine list was updated perfectly."
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 dark:focus:border-blue-450 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-550"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEndSessionModal(false)}
                  className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-150 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer text-center"
                >
                  Return to Call
                </button>
                <button
                  type="button"
                  onClick={handleEndCallFinalSubmit}
                  className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition cursor-pointer text-center"
                >
                  End and Log encounter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
