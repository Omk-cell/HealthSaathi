import React, { useState, useEffect, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types and Interfaces
export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isPrimary: boolean;
  alertSent?: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  distance: number; // in km
  baseEta: number; // in minutes
  icuBedsAvailable: number;
  phone: string;
  specialty: string;
  address: string;
  isTraumaLevel1: boolean;
}

export interface EmergencyLog {
  id: string;
  timestamp: string;
  type: 'Manual SOS' | 'Ambulance Call' | 'Fall Detected' | 'Automated Signal';
  hospitalName: string;
  status: 'Dispatched' | 'Arrived' | 'Resolved' | 'Cancelled';
  notes: string;
}

const INITIAL_CONTACTS: EmergencyContact[] = [
  { id: 'c-1', name: 'Aarav Sharma', relation: 'Brother / Primary Kin', phone: '+91 98765 43210', isPrimary: true },
  { id: 'c-2', name: 'Ananya Sharma', relation: 'Spouse', phone: '+91 98112 23344', isPrimary: true },
  { id: 'c-3', name: 'Dr. Alok Sen', relation: 'Primary Cardiologist', phone: '+91 90045 61122', isPrimary: false }
];

const HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'Nanavati Max Super Speciality Hospital',
    distance: 1.8,
    baseEta: 6,
    icuBedsAvailable: 5,
    phone: '022 2626 7500',
    specialty: '24/7 Level 1 Trauma, Advanced Cardiology Wing',
    address: 'S.V. Road, Vile Parle West, Mumbai',
    isTraumaLevel1: true
  },
  {
    id: 'hosp-2',
    name: 'Kokilaben Dhirubhai Ambani Hospital',
    distance: 3.4,
    baseEta: 10,
    icuBedsAvailable: 8,
    phone: '022 4269 6969',
    specialty: 'Comprehensive Stroke Unit & Cardiac Emergency',
    address: 'Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Andheri West',
    isTraumaLevel1: true
  },
  {
    id: 'hosp-3',
    name: 'Cooper Municipal General Hospital',
    distance: 2.1,
    baseEta: 8,
    icuBedsAvailable: 2,
    phone: '022 2620 7254',
    specialty: 'General Emergency Ward & Fracture Center',
    address: 'U15, Juhu Scheme, Vile Parle West',
    isTraumaLevel1: false
  },
  {
    id: 'hosp-4',
    name: 'H. N. Reliance Foundation Hospital',
    distance: 5.7,
    baseEta: 14,
    icuBedsAvailable: 11,
    phone: '1800 221 166',
    specialty: 'High-Tech Cardiac ICU & Vascular Surgery',
    address: 'Prarthana Samaj, Girgaon, Mumbai',
    isTraumaLevel1: true
  }
];

const INITIAL_HISTORY: EmergencyLog[] = [
  {
    id: 'l-1',
    timestamp: '2026-04-12 14:35',
    type: 'Manual SOS',
    hospitalName: 'Nanavati Max Super Speciality Hospital',
    status: 'Resolved',
    notes: 'Hypertensive peak registered. Resolved by on-call cardiac ambulance crew on-site.'
  },
  {
    id: 'l-2',
    timestamp: '2026-05-18 09:12',
    type: 'Ambulance Call',
    hospitalName: 'Cooper Municipal General Hospital',
    status: 'Resolved',
    notes: 'Mild chest pain event reported by smartwatch. Paramedic crew checked patient; stable vitals.'
  }
];

interface EmergencyAssistanceModuleProps {
  currentUser?: { name: string; email: string } | null;
  onAddNotification?: (notif: {
    id: string;
    title: string;
    text: string;
    time: string;
    unread: boolean;
    type: 'success' | 'alert' | 'info';
  }) => void;
}

export const EmergencyAssistanceModule: React.FC<EmergencyAssistanceModuleProps> = ({
  currentUser,
  onAddNotification
}) => {
  // Navigation tabs for sub-consoles if desired, but we render a responsive multi-panel Dashboard layout.
  // We align with single-view/dashboard layouts. Let's make it a beautifully comprehensive emergency command cockpit.
  
  // State elements
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    const saved = localStorage.getItem('hs_emerg_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [emergencyHistory, setEmergencyHistory] = useState<EmergencyLog[]>(() => {
    const saved = localStorage.getItem('hs_emerg_history');
    return saved ? JSON.parse(saved) : INITIAL_HISTORY;
  });

  const [activeHospitalId, setActiveHospitalId] = useState<string>('hosp-1');
  const [locationSharing, setLocationSharing] = useState<boolean>(true);
  const [sosActive, setSosActive] = useState<boolean>(false);
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);

  // Live Location Packet Steam Simulation
  const [satellitePackets, setSatellitePackets] = useState<string[]>([]);
  const [satPrecision, setSatPrecision] = useState<string>('99.6% (DGPS High Accuracy)');
  const [gpsCoordinates, setGpsCoordinates] = useState<string>('19.0760° N, 72.8777° E (Mumbai Juhu Telemetry)');
  
  // Active Ambulance dispatch stream calculations
  const [ambulanceDispatched, setAmbulanceDispatched] = useState<boolean>(false);
  const [ambulanceETA, setAmbulanceETA] = useState<number>(0); // in seconds
  const [ambulanceType, setAmbulanceType] = useState<'Standard' | 'Advanced ALS' | 'Critical ICU'>('Advanced ALS');
  const [currentSpeed, setCurrentSpeed] = useState<number>(0); // km/h simulation
  
  // Custom states for manual Contact Builder Form overlay
  const [showAddContact, setShowAddContact] = useState<boolean>(false);
  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactRelation, setNewContactRelation] = useState<string>('');
  const [newContactPhone, setNewContactPhone] = useState<string>('');
  const [newContactIsPrimary, setNewContactIsPrimary] = useState<boolean>(true);

  // Timers and intervals refs
  const sosTimerRef = useRef<NodeJS.Timeout | null>(null);
  const etaTimerRef = useRef<NodeJS.Timeout | null>(null);
  const telemetryTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeHospital = HOSPITALS.find(h => h.id === activeHospitalId) || HOSPITALS[0];

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('hs_emerg_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('hs_emerg_history', JSON.stringify(emergencyHistory));
  }, [emergencyHistory]);

  // Satellite Telemetry Packet generator simulator
  useEffect(() => {
    if (locationSharing) {
      telemetryTimerRef.current = setInterval(() => {
        const packets = [
          `SAT-LNK: Broadcast beacon transmitted to IN-GP-7 | SNR: 42dB`,
          `GEO-ALT: Altitude verified @ 14m above MSL`,
          `EMG-COM: Handshake pulse with municipal EMT servers.`,
          `GPS-XMT: Lat/Lon coordinate payload verified by trilateration`,
          `VTL_SYN: Smart watch heart stream paired: Cardiac Pulse 84bpm`
        ];
        const randomPacket = packets[Math.floor(Math.random() * packets.length)];
        const timeStr = new Date().toLocaleTimeString([], { hour12: false });
        
        setSatellitePackets(prev => {
          const fresh = [`[${timeStr}] ${randomPacket}`, ...prev];
          return fresh.slice(0, 5); // Keep last 5 entries
        });

        // Add minor fluctuate to GPS readouts to show real-time broadcast coordinates!
        const latBias = (Math.random() - 0.5) * 0.0002;
        const lonBias = (Math.random() - 0.5) * 0.0002;
        setGpsCoordinates(`19.${(7600 + Math.round(latBias * 100000)).toString()}° N, 72.${(8777 + Math.round(lonBias * 100000)).toString()}° E`);
        setSatPrecision(`99.${Math.floor(Math.random() * 9) + 1}% (DGPS Verified Lock)`);
      }, 3500);
    } else {
      if (telemetryTimerRef.current) clearInterval(telemetryTimerRef.current);
    }

    return () => {
      if (telemetryTimerRef.current) clearInterval(telemetryTimerRef.current);
    };
  }, [locationSharing]);

  // Ambulance dispatcher progress timer simulation
  useEffect(() => {
    if (ambulanceDispatched && ambulanceETA > 0) {
      etaTimerRef.current = setInterval(() => {
        setAmbulanceETA(prev => {
          if (prev <= 1) {
            // Arrived safely at coordinates!
            if (etaTimerRef.current) clearInterval(etaTimerRef.current);
            setCurrentSpeed(0);

            // Log Arrival in history
            setEmergencyHistory(old => {
              const updated = old.map(log => 
                log.status === 'Dispatched' 
                  ? { ...log, status: 'Arrived' as const, notes: 'EMT Ambulance team has arrived on site. Establishing physical contact with patient Rohan Sharma.' } 
                  : log
              );
              return updated;
            });

            if (onAddNotification) {
              onAddNotification({
                id: `emerg-arrive-${Date.now()}`,
                title: "Ambulance Arrived!",
                text: `The ${ambulanceType} Unit has arrived at your exact location coordinates. Stay calm.`,
                time: "Just now",
                unread: true,
                type: 'success'
              });
            }

            return 0;
          }

          // Simulate speeds based on driving distance
          const speed = Math.floor(Math.random() * 25) + 45; // 45 to 70 km/h block
          setCurrentSpeed(speed);

          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (etaTimerRef.current) clearInterval(etaTimerRef.current);
    };
  }, [ambulanceDispatched, ambulanceETA, ambulanceType]);

  // Handle SOS Click (Automatic 3-Second Arming sequence)
  const beginSOSSequence = () => {
    if (sosCountdown !== null) return; // already count down active

    setSosCountdown(3);
    
    if (onAddNotification) {
      onAddNotification({
        id: `sos-pre-init-${Date.now()}`,
        title: "SOS Signal Pending",
        text: "Emergency SOS trigger detected. Armed. Tapping the button again disarms the signal safely.",
        time: "Just now",
        unread: true,
        type: "info"
      });
    }

    // Tick countdown
    sosTimerRef.current = setInterval(() => {
      setSosCountdown(prev => {
        if (prev === null) {
          if (sosTimerRef.current) clearInterval(sosTimerRef.current);
          return null;
        }

        if (prev <= 1) {
          if (sosTimerRef.current) clearInterval(sosTimerRef.current);
          
          // Complete trigger
          executeEmergencyTrigger();
          return null;
        }

        return prev - 1;
      });
    }, 1000);
  };

  const cancelActiveSOS = () => {
    if (sosTimerRef.current) clearInterval(sosTimerRef.current);
    setSosCountdown(null);
    setSosActive(false);
    setAmbulanceDispatched(false);

    if (onAddNotification) {
      onAddNotification({
        id: `sos-disarmed-${Date.now()}`,
        title: "SOS Console Disarmed",
        text: "The emergency beacon and ambulance satellite request have been revoked safely.",
        time: "Just now",
        unread: true,
        type: "success"
      });
    }
  };

  // Run the full emergency pipeline broadcast
  const executeEmergencyTrigger = () => {
    setSosActive(true);
    setAmbulanceDispatched(true);
    
    // Set ETA based on selected target hospital distance
    const computedSecs = activeHospital.baseEta * 60;
    setAmbulanceETA(computedSecs);

    // Update contacts status to notify them
    setContacts(prev => prev.map(c => ({ ...c, alertSent: true })));

    // Generate fresh emergency log entry
    const timestampStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newLog: EmergencyLog = {
      id: `emerg-log-${Date.now()}`,
      timestamp: timestampStr,
      type: 'Manual SOS',
      hospitalName: activeHospital.name,
      status: 'Dispatched',
      notes: `SOS manual beacon fully broadcasted. Dispatched ${ambulanceType} core unit. Transmitted telemetry packet payload. GPS accuracy locked.`
    };

    setEmergencyHistory(prev => [newLog, ...prev]);

    if (onAddNotification) {
      onAddNotification({
        id: `sos-dispatched-${Date.now()}`,
        title: "🚨 SOS RED ALERT DISPATCHED",
        text: `Ambulance assigned from ${activeHospital.name}. Primary contacts notified immediately.`,
        time: "Just now",
        unread: true,
        type: "alert"
      });
    }
  };

  // Action: Call Ambulance button (Instant Emergency request)
  const dispatchAmbulanceInstant = (selectedType: 'Standard' | 'Advanced ALS' | 'Critical ICU') => {
    setAmbulanceType(selectedType);
    setSosActive(true);
    setAmbulanceDispatched(true);
    
    // Set ETA base
    const computedSecs = activeHospital.baseEta * 60;
    setAmbulanceETA(computedSecs);

    const timestampStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newLog: EmergencyLog = {
      id: `emerg-log-${Date.now()}`,
      timestamp: timestampStr,
      type: 'Ambulance Call',
      hospitalName: activeHospital.name,
      status: 'Dispatched',
      notes: `Direct voice telemetry ambulance request. Selected Level: ${selectedType}. Crew activated.`
    };

    setEmergencyHistory(prev => [newLog, ...prev]);

    if (onAddNotification) {
      onAddNotification({
        id: `amb-call-${Date.now()}`,
        title: `${selectedType} Ambulance Called`,
        text: `Urgent paramedic crew dispatched from ${activeHospital.name}. Estimated Arrival: ${activeHospital.baseEta} mins.`,
        time: "Just now",
        unread: true,
        type: "alert"
      });
    }
  };

  // Contacts adding validation handlers
  const handleAddNewContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const contactItem: EmergencyContact = {
      id: `contact-added-${Date.now()}`,
      name: newContactName,
      relation: newContactRelation || 'Authorized Guard',
      phone: newContactPhone,
      isPrimary: newContactIsPrimary
    };

    setContacts(prev => [...prev, contactItem]);
    setNewContactName('');
    setNewContactRelation('');
    setNewContactPhone('');
    setNewContactIsPrimary(true);
    setShowAddContact(false);

    if (onAddNotification) {
      onAddNotification({
        id: `contact-success-${Date.now()}`,
        title: "Emergency Guardian Saved",
        text: `${contactItem.name} has been added to your local secondary responder registry.`,
        time: "Just now",
        unread: true,
        type: "success"
      });
    }
  };

  const removeContact = (id: string, name: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    if (onAddNotification) {
      onAddNotification({
        id: `contact-rem-${Date.now()}`,
        title: "Responder Removed",
        text: `${name} has been taken off your emergency broadcast configuration.`,
        time: "Just now",
        unread: true,
        type: "info"
      });
    }
  };

  // Formatting helper for countdown minutes/seconds
  const formatRouteTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden bg-[#0c0505] border border-red-950 text-slate-100 shadow-2xl p-4 md:p-6 space-y-6 select-none relative">
      
      {/* 1. TOP BAR RED ALERT WARNING STATS BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-red-900/40 pb-5 gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            {/* Alarm Siren glow rings */}
            <div className="absolute inset-0 bg-red-600 rounded-lg animate-ping opacity-25" />
            <div className="w-11 h-11 bg-red-900/30 border border-red-500 rounded-xl flex items-center justify-center text-red-500 shadow-lg shadow-red-500/20">
              <Lucide.Siren className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-red-550 text-red-500 font-sans">
                TACTICAL EMERGENCY ASSISTANCE
              </h2>
              <span className="text-[9px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-bold border border-red-500/20 animate-pulse">
                SAT-COM ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Paramedic routing, localized trauma diagnostics, and E2E cryptographic satellite telemetry
            </p>
          </div>
        </div>

        {/* Vital Info capsule or satellite locking indicators */}
        <div className="flex items-center gap-3 bg-red-950/20 border border-red-900/30 px-3.5 py-2 rounded-2xl shrink-0">
          <Lucide.Compass className="w-4 h-4 text-slate-400 animate-spin [animation-duration:8s]" />
          <div className="text-left">
            <span className="text-[9.5px] font-black uppercase text-slate-300 block tracking-wider leading-none">
              Location Sharing Protocol
            </span>
            <div className="flex items-center gap-1 mt-1">
              <span className={`inline-block w-2 h-2 rounded-full ${locationSharing ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-[10px] text-slate-400 font-semibold font-mono leading-none">
                {locationSharing ? 'SAT-LOC LINKED (Broadcasting)' : 'LINK INACTIVE (Offline Mode)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CHOOSE AMBULANCE PIPELINE HUB */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* PANEL A: GLOWING SOS RADAR LAUNCHER (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-b from-red-950/15 to-red-900/5 border border-red-900/25 relative overflow-hidden">
          
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-950/30 border border-red-900/15 px-2 py-0.5 rounded text-[9.5px] text-red-400 font-bold">
            <Lucide.Activity className="w-3.5 h-3.5 animate-pulse" /> VITALS FEED SENSOR
          </div>

          <div className="space-y-2 text-left">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest block">
              Phase 1 Diagnostic Trigger
            </span>
            <h3 className="text-base font-black text-slate-100">
              Secure SOS Incident Beacon
            </h3>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Pressing the trigger begins a 3-second smart countdown after which an immediate Level 1 Cardiac trauma team is dispatched from the nearest hospital and primary contacts are notified automatically.
            </p>
          </div>

          {/* Glowing Ring Button Controller */}
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <div className="relative flex items-center justify-center">
              
              {/* Concentric alert wave circles */}
              <AnimatePresence>
                {(sosCountdown !== null || sosActive) && (
                  <>
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: 1.8, opacity: 0 }}
                      exit={{ scale: 0.8, opacity: 0.5 }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full border border-red-500 shadow-xl pointer-events-none"
                    />
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0.4 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      exit={{ scale: 0.8, opacity: 0.4 }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut", delay: 0.5 }}
                      className="absolute inset-0 rounded-full border border-red-600 shadow-lg pointer-events-none"
                    />
                  </>
                )}
              </AnimatePresence>

              {sosActive ? (
                <button
                  id="sos-active-disarm-button"
                  onClick={cancelActiveSOS}
                  className="w-32 h-32 bg-slate-900 hover:bg-slate-950 hover:scale-105 active:scale-95 text-red-500 rounded-full flex flex-col items-center justify-center border-[6px] border-red-600 shadow-2xl transition-all duration-300 relative z-10 cursor-pointer text-center"
                >
                  <Lucide.ShieldAlert className="w-10 h-10 mb-1 text-red-500 animate-bounce" />
                  <span className="text-[10px] font-black tracking-widest uppercase">DISARM SOS</span>
                </button>
              ) : sosCountdown !== null ? (
                <button
                  id="sos-countdown-cancel-button"
                  onClick={cancelActiveSOS}
                  className="w-32 h-32 bg-red-950/80 hover:scale-105 active:scale-95 text-white rounded-full flex flex-col items-center justify-center border-[6px] border-amber-500 shadow-2xl transition-all duration-300 relative z-10 cursor-pointer text-center"
                >
                  <span className="text-3xl font-black font-mono text-amber-400 animate-pulse">{sosCountdown}</span>
                  <span className="text-[8px] font-black tracking-wider uppercase text-amber-500 mt-1">TAP TO DISARM</span>
                </button>
              ) : (
                <button
                  id="sos-red-alert-trigger"
                  onClick={beginSOSSequence}
                  className="w-32 h-32 bg-gradient-to-b from-red-600 to-red-850 hover:from-red-550 hover:to-red-800 hover:scale-[1.03] active:scale-[0.98] text-white rounded-full flex flex-col items-center justify-center border-[8px] border-red-900/30 hover:border-red-500/20 shadow-xl shadow-red-950 hover:shadow-red-600/30 transition-all duration-250 relative z-10 cursor-pointer text-center"
                >
                  <Lucide.PhoneCall className="w-8 h-8 mb-1 text-white animate-pulse" />
                  <span className="text-[11px] font-black tracking-widest uppercase text-white leading-none">SOS</span>
                  <span className="text-[8px] mt-0.5 tracking-wider font-extrabold text-red-200">RED TRIGGER</span>
                </button>
              )}
            </div>

            {/* Direct Dial Ambulance Action Buttons */}
            <div className="w-full space-y-2 mt-2">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest block text-center">
                OR BROADCAST DIRECT EMT DIRECT CALL
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => dispatchAmbulanceInstant('Advanced ALS')}
                  disabled={sosActive || sosCountdown !== null}
                  className="py-2.5 px-3 bg-red-950/30 hover:bg-red-900/25 disabled:opacity-50 border border-red-900/30 text-red-400 hover:text-red-300 text-[10px] font-sans font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  🚑 Advanced ALS Unit
                </button>
                <button
                  onClick={() => dispatchAmbulanceInstant('Critical ICU')}
                  disabled={sosActive || sosCountdown !== null}
                  className="py-2.5 px-3 bg-red-950/30 hover:bg-red-900/25 disabled:opacity-50 border border-red-900/30 text-rose-400 hover:text-rose-300 text-[10px] font-sans font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  🚨 Critical Care ICU
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL B: EMERGENCY LIVE LOCATION TELEMETRY MAP (lg:col-span-7) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0f0707] border border-red-950 flex flex-col justify-between text-left space-y-4">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                Satellite GPS Radar Tracking HUD
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-450 font-bold">Transmit GPS Beacon</span>
              <button
                type="button"
                onClick={() => setLocationSharing(!locationSharing)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${locationSharing ? 'bg-red-650 bg-red-600' : 'bg-slate-755 bg-slate-800'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${locationSharing ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Visual Vector Radar Grid Sweep */}
            <div className="sm:col-span-6 bg-slate-950/80 aspect-video sm:aspect-square flex flex-col items-center justify-center p-3 rounded-xl border border-red-955 relative overflow-hidden select-none">
              
              {/* Radial Sweep effect background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,0,0,0.03)_1px,_transparent_1px)] bg-[size:12px_12px]" />
              <div className="absolute inset-0 border border-red-500/10 rounded-full animate-spin [animation-duration:12s] scale-90" />
              <div className="absolute inset-0 border border-red-500/5 rounded-full animate-spin [animation-duration:6s] scale-50" />
              
              {/* Rotating Radar sweep line */}
              <div className="absolute top-1/2 left-1/2 w-full h-[1.5px] bg-red-500/20 origin-left -translate-y-1/2 animate-[spin_5s_linear_infinite]" />

              {/* Patient Core Marker Coordinates */}
              <div className="absolute top-1/2 left-1/2 -ml-2 -mt-2 w-4.5 h-4.5 rounded-full bg-indigo-500 border border-white/60 animate-pulse flex items-center justify-center z-10">
                <span className="text-[8px] font-black text-white">R</span>
              </div>

              {/* Nearby Hospitals radar nodes */}
              {HOSPITALS.map((h, i) => {
                // mock offsets for localized scatter radar display
                const offsets = [
                  { t: '15%', l: '35%' },
                  { t: '65%', l: '75%' },
                  { t: '25%', l: '75%' },
                  { t: '75%', l: '25%' }
                ];
                const active = h.id === activeHospitalId;
                const offset = offsets[i % offsets.length];

                return (
                  <div
                    key={h.id}
                    className="absolute"
                    style={{ top: offset.t, left: offset.l }}
                  >
                    <div className="relative group">
                      <span className={`block w-2.5 h-2.5 rounded-full cursor-pointer transition ${
                        active ? 'bg-red-500 ring-4 ring-red-500/25 animate-bounce' : 'bg-slate-500 hover:bg-slate-350'
                      }`} 
                        onClick={() => setActiveHospitalId(h.id)}
                      />
                      <div className="absolute bottom-4 left-0 -translate-x-1/2 bg-slate-900 border border-red-900/30 text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                        {h.name.split(' ')[0]} ({h.distance}km)
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="absolute bottom-2 left-2 bg-black/85 border border-red-900/30 px-2 py-1 rounded text-[8px] select-none text-red-400 font-bold z-10">
                GPS COORDINATE ACQUISITION
              </div>
            </div>

            {/* Simulated Live Satellite Communications Feed */}
            <div className="sm:col-span-6 flex flex-col justify-between space-y-3.5">
              <div className="space-y-1.5 flex-1">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">
                  SAT-LOG TERMINAL
                </span>
                <div className="bg-slate-950 p-3 rounded-xl border border-red-955 h-[130px] overflow-y-auto font-mono text-[9px] text-red-550 text-red-400 space-y-1 scrollbar-thin">
                  {locationSharing ? (
                    <>
                      <div className="text-slate-400 font-bold text-[8px] border-b border-red-900/25 pb-1 mb-1.5">
                        SAT-PREC: {satPrecision}
                      </div>
                      {satellitePackets.map((pkt, index) => (
                        <div key={index} className="truncate">
                          {pkt}
                        </div>
                      ))}
                      {satellitePackets.length === 0 && (
                        <div className="text-slate-500 animate-pulse text-center pt-8">
                          Initialising satellite locks...
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 text-center text-slate-505 text-slate-500 pt-10">
                      [DATA TRANSMISSION MUTED]
                      <p className="text-[8px] text-slate-600 mt-1">Enable location sharing to broadcast live positioning protocol</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Coordinates display readout */}
              <div className="bg-red-950/10 border border-red-950 p-3 rounded-xl text-left select-text">
                <span className="text-[8.5px] font-bold text-slate-405 text-slate-450 uppercase block">Active Coordinates payload</span>
                <p className="text-xs font-mono font-black text-slate-200 mt-1 truncate">{gpsCoordinates}</p>
                <span className="text-[9.5px] text-slate-400 mt-0.5 block font-sans">Accuracy Radius: &lt; 2.5 meters (Level 1 DGPS)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. EMERGENCY LIVE AMBULANCE ROUTING PIPELINE TRACKER */}
      {emergencyHistory.some(log => log.status === 'Dispatched' || log.status === 'Arrived') && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-slate-950/95 border border-red-500/40 text-left space-y-4 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-900/35 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase text-red-405 text-red-500 tracking-wider">
                  ACTIVE ROAD RESCUE DISPATCH PIPELINE
                </span>
                <h4 className="text-xs font-extrabold text-slate-205 text-slate-200 mt-0.5">
                  Route assigned from {activeHospital.name}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-red-950/20 border border-red-900/35 rounded-xl px-3 py-1 text-right">
                <span className="text-[8.5px] text-slate-400 block uppercase font-mono">Driving Speed</span>
                <span className="text-xs font-black font-mono text-slate-200">{currentSpeed} km/h</span>
              </div>
              <div className="bg-red-950/20 border border-red-900/35 rounded-xl px-3 py-1 text-right">
                <span className="text-[8.5px] text-slate-400 block uppercase font-mono text-red-400 font-bold">Ambulance ETA</span>
                <span className="text-sm font-black font-mono text-red-500 animate-pulse text-red-550">
                  {ambulanceETA > 0 ? formatRouteTimer(ambulanceETA) : "ARRIVED"}
                </span>
              </div>
            </div>
          </div>

          {/* Simple Visual Line Map Route Progress Segmentor */}
          <div className="space-y-1">
            <div className="relative h-2.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden select-none">
              {/* Progress fill bar */}
              <motion.div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-red-600 to-indigo-500"
                style={{
                  width: `${Math.min(100, Math.max(0, 100 - (ambulanceETA / (activeHospital.baseEta * 60)) * 100))}%`
                }}
              />
            </div>
            
            <div className="flex justify-between items-center text-[9px] text-slate-450 text-slate-500 font-bold select-none px-1">
              <span className="flex items-center gap-1">🏥 {activeHospital.name.split(' ')[0]} (DEP)</span>
              <span>
                {ambulanceETA > 0 ? `Transiting coordinates range | ${(ambulanceETA / 60).toFixed(1)}m left` : 'ARRIVED ON SITE.'}
              </span>
              <span className="flex items-center gap-1">📍 Patient Coordinates (Juhu Range)</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. THIRD LAYER: HOSPITALS MAP MATRIX & EMERGENCY CONTACT DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left items-stretch">
        
        {/* PANEL C: NEARBY HOSPITALS COORDINATOR LIST (md:col-span-7) */}
        <div className="md:col-span-7 p-5 rounded-2xl bg-slate-950/40 border border-red-900/25 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-red-900/15 pb-2.5">
            <div className="flex items-center gap-2">
              <Lucide.HeartPulse className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <h3 className="text-xs font-black uppercase text-slate-205 text-slate-200">
                  HOSPITAL & TRAUMA LOCATOR
                </h3>
                <p className="text-[10px] text-slate-450">Smart routing prioritized by real-time congestion parameters</p>
              </div>
            </div>
            <span className="text-[9px] bg-red-950/30 text-rose-350 text-red-400 font-bold border border-red-905 border-red-900/30 px-2.5 py-0.5 rounded-full select-none uppercase shadow-sm">
              Level 1 trauma channels
            </span>
          </div>

          <div className="space-y-2.5 max-h-[295px] overflow-y-auto scrollbar-thin">
            {HOSPITALS.map(h => {
              const isSelected = h.id === activeHospitalId;

              return (
                <div
                  key={h.id}
                  onClick={() => {
                    setActiveHospitalId(h.id);
                    if (onAddNotification) {
                      onAddNotification({
                        id: `hosp-sel-${Date.now()}`,
                        title: "Hospitals Dispatch Target Updated",
                        text: `Nearest hospital coordinates targeted onto ${h.name}. Base ETA adjusted to ${h.baseEta} minutes.`,
                        time: "Just now",
                        unread: true,
                        type: "info"
                      });
                    }
                  }}
                  className={`p-3.5 rounded-xl transition-all cursor-pointer border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    isSelected
                      ? 'bg-red-950/20 border-red-500/65 shadow-md shadow-red-500/5'
                      : 'bg-slate-950/30 border-red-900/15 hover:bg-slate-950/50 hover:border-red-900/35'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-slate-100 text-xs block leading-tight">
                        {h.name}
                      </span>
                      {h.isTraumaLevel1 && (
                        <span className="text-[8.5px] font-black uppercase text-red-400 bg-red-950/40 border border-red-900/30 px-2.5 py-0.5 rounded">
                          TRAUMA LEVEL 1
                        </span>
                      )}
                    </div>
                    <span className="text-[10.5px] block text-slate-450 text-slate-400 leading-snug">
                      {h.address}
                    </span>
                    <span className="text-[10px] block text-amber-500 font-bold tracking-tight">
                      🔬 Specialist: {h.specialty}
                    </span>
                  </div>

                  <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0">
                    <div className="text-[10.5px]">
                      <span className="text-[#f43f5e] font-black">{h.distance} km</span>
                      <span className="text-slate-400"> dist</span>
                    </div>

                    <div className="bg-[#451a03] border border-amber-900/30 text-amber-500 font-black text-[9.5px] px-2 py-0.5 rounded whitespace-nowrap">
                      ETA {h.baseEta} mins
                    </div>

                    <div className="text-[9px] text-slate-400 leading-none">
                      ICU Beds Available: <span className="text-emerald-500 font-bold">{h.icuBedsAvailable}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Core Display of Active Target Hospital Coordinates */}
          <div className="p-3 bg-red-950/10 border border-red-950 rounded-xl flex items-center justify-between text-xs gap-3">
            <div className="min-w-0">
              <span className="text-[8.5px] font-bold text-slate-450 uppercase tracking-widest block leading-none">
                Target Nearest Rescue Hospital
              </span>
              <p className="font-extrabold text-slate-200 truncate mt-1 text-xs select-all">
                {activeHospital.name} &#8226; {activeHospital.phone}
              </p>
            </div>
            
            <button
              onClick={() => alert(`Connecting immediate priority medical hotline to ${activeHospital.name} hotline at ${activeHospital.phone}...`)}
              className="py-1.5 px-3 bg-red-600 hover:bg-red-500 transition text-[9.5px] text-white font-extrabold rounded-lg shrink-0 cursor-pointer text-center uppercase tracking-wider"
            >
              Hotline call Out
            </button>
          </div>
        </div>

        {/* PANEL D: EMERGENCY RESCUE GUARDIANS & CONTACTS (md:col-span-5) */}
        <div className="md:col-span-5 p-5 rounded-2xl bg-slate-950/40 border border-red-900/25 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-red-900/15 pb-2.5">
            <div className="flex items-center gap-2">
              <Lucide.Users className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <h3 className="text-xs font-black uppercase text-slate-205 text-slate-200">
                  RESCUE GUARDIANS CODES
                </h3>
                <p className="text-[10px] text-slate-450">Broadcast list for dynamic distress telemetry</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddContact(!showAddContact)}
              className="p-1.5 bg-red-950/40 border border-red-900/30 text-slate-300 hover:text-white rounded-lg transition text-xs font-black uppercase tracking-wider flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Lucide.Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {/* Add contact Form popup */}
          <AnimatePresence>
            {showAddContact && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddNewContact}
                className="p-3 bg-slate-950 border border-red-900/25 rounded-xl text-left text-xs gap-3.5 grid grid-cols-1 select-text"
              >
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-450 uppercase block font-extrabold tracking-wider">Guardian Name</span>
                  <input
                    type="text"
                    required
                    placeholder="Enter guardian name..."
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="w-full bg-slate-900 border border-red-900/25 p-1.5 rounded focus:outline-none focus:border-red-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-slate-450 uppercase block font-extrabold tracking-wider">Relation / Role</span>
                  <input
                    type="text"
                    required
                    placeholder="Brother, Spouse, Clinician..."
                    value={newContactRelation}
                    onChange={(e) => setNewContactRelation(e.target.value)}
                    className="w-full bg-slate-900 border border-red-900/25 p-1.5 rounded focus:outline-none focus:border-red-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-slate-450 uppercase block font-extrabold tracking-wider">Secure Phone Contact</span>
                  <input
                    type="text"
                    required
                    placeholder="Enter mobile phone..."
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-red-900/25 p-1.5 rounded focus:outline-none focus:border-red-500 text-xs font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1 font-semibold">
                  <input
                    type="checkbox"
                    id="checkbox-primary-contact"
                    checked={newContactIsPrimary}
                    onChange={(e) => setNewContactIsPrimary(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-red-655"
                  />
                  <label htmlFor="checkbox-primary-contact" className="text-[10px] text-slate-300">Set as Primary Rescue Responder</label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={() => setShowAddContact(false)}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-wider py-1 px-2.5 rounded transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-red-650 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider py-1 px-3.5 rounded transition cursor-pointer"
                  >
                    Save Guardian
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Dynamic Guardians Scroll list */}
          <div className="space-y-2 flex-1 max-h-[195px] overflow-y-auto scrollbar-thin text-xs">
            {contacts.map(c => (
              <div
                key={c.id}
                className="p-3 bg-slate-950/40 border border-red-950 rounded-xl flex items-center justify-between gap-2.5 text-xs"
              >
                <div className="truncate text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#f1f5f9] block leading-tight truncate">
                      {c.name}
                    </span>
                    {c.isPrimary && (
                      <span className="text-[8px] bg-red-950/40 border border-red-900/30 text-rose-350 text-red-400 px-1.5 py-0.2 rounded font-black uppercase tracking-widest leading-normal">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] block text-slate-400 leading-normal mt-0.5">{c.relation}</span>
                  <span className="text-[9.5px] block font-mono text-slate-350 leading-none mt-1">{c.phone}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                  {c.alertSent ? (
                    <span className="text-[9px] bg-red-950 text-[#f43f5e] font-black border border-[#f43f5e]/25 rounded px-1.5 py-0.5 animate-pulse shrink-0">
                       distress text Sent
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setContacts(prev => prev.map(contact => contact.id === c.id ? { ...contact, alertSent: true } : contact));
                        alert(`Broadcasting secured GPS coordinates SMS blast package securely payload to ${c.name}...`);
                        if (onAddNotification) {
                          onAddNotification({
                            id: `sos-cont-blast-${Date.now()}`,
                            title: `SOS Distress Payload Dispatched`,
                            text: `Transmitted digital health telemetry and satellite GPS coordinates safely key-encrypted directly to ${c.name}.`,
                            time: "Just now",
                            unread: true,
                            type: "success"
                          });
                        }
                      }}
                      className="py-1 px-2.5 border border-red-900/35 hover:bg-red-950/30 text-red-400 hover:text-red-300 rounded text-[9.5px] font-black uppercase tracking-wider transition shrink-0 cursor-pointer"
                    >
                      Blast SMS
                    </button>
                  )}
                  
                  <button
                    onClick={() => removeContact(c.id, c.name)}
                    className="p-1 hover:bg-slate-900 hover:text-red-400 text-slate-500 rounded transition shrink-0 cursor-pointer"
                    title="Remove Guardian Contact"
                  >
                    <Lucide.Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {contacts.length === 0 && (
              <div className="p-8 text-center bg-slate-950/20 border border-dashed border-red-900/15 rounded-xl space-y-1">
                <Lucide.Users className="w-8 h-8 text-slate-500 mx-auto opacity-40" />
                <span className="text-xs text-slate-400 block font-bold">No distress contacts established</span>
                <p className="text-[9.5px] text-slate-500 leading-snug">Add relative contacts or clinicians that need automated alert satellite feeds.</p>
              </div>
            )}
          </div>

          <div className="text-[9px] bg-indigo-950/10 border border-indigo-950 p-2.5 rounded-lg text-slate-400 leading-snug select-text">
            ⚠️ <strong>Cryptographic Distress Blast Rules:</strong> Activating the Master SOS Red Trigger automatically overrides standard coordinate silence filters to secure 2-way distress cellular feedback.
          </div>
        </div>
      </div>

      {/* 5. SOS EMERGENCY RESPONSE HISTORY LOG COGNIZANCE (CONSOLE LOG) */}
      <div className="p-5 rounded-2xl bg-slate-950/40 border border-red-900/25 text-left space-y-3">
        <div className="flex items-center justify-between border-b border-red-900/15 pb-2">
          <div className="flex items-center gap-2">
            <Lucide.Timer className="w-4.5 h-4.5 text-red-500 shrink-0" />
            <h3 className="text-xs font-black uppercase text-slate-205 text-slate-200">
              Paramedic SOS Event Log Audit
            </h3>
          </div>
          
          <button
            onClick={() => {
              if (confirm('Clear local emergency action transcripts history logs files?')) {
                setEmergencyHistory([]);
              }
            }}
            className="text-[9.5px] text-slate-505 text-slate-500 hover:text-red-400 font-bold uppercase transition hover:underline"
          >
            Clear Event Logs
          </button>
        </div>

        <div className="space-y-2 max-h-[145px] overflow-y-auto scrollbar-thin text-xs">
          {emergencyHistory.map(log => (
            <div
              key={log.id}
              className="p-3 bg-slate-950/50 border border-red-950/55 rounded-xl flex items-start justify-between gap-3 text-xs text-slate-300"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-[11px] text-red-500 font-mono">
                    [{log.timestamp}]
                  </span>
                  <span className="text-[10px] text-[#f1f5f9] font-black uppercase tracking-wider">
                    {log.type}
                  </span>
                  <span className="text-[9px] text-slate-405 text-slate-400 truncate">
                    &#8226; Nearest Hospital: {log.hospitalName}
                  </span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-slate-350">{log.notes}</p>
              </div>

              <div className="shrink-0">
                <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                  log.status === 'Resolved' 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/25' 
                    : log.status === 'Dispatched' 
                    ? 'bg-amber-950 text-amber-400 border border-amber-900/25 animate-pulse' 
                    : log.status === 'Arrived'
                    ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/25 animate-pulse'
                    : 'bg-slate-900 text-slate-400'
                }`}>
                  {log.status}
                </span>
              </div>
            </div>
          ))}

          {emergencyHistory.length === 0 && (
            <div className="p-8 text-center text-slate-505 text-slate-500 font-bold">
              [No previous SOS alarm signals logged. Maintain safety coordinates.]
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
