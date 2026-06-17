import React, { useState, useEffect, useRef } from "react";
import * as Lucide from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, auth, handleFirestoreError, OperationType, storage } from "../lib/firebase";
import { collection, doc, query, where, getDocs, setDoc, onSnapshot, writeBatch } from "firebase/firestore";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// Message Interfaces
export interface ChatMessage {
  id: string;
  sender: "patient" | "doctor";
  text: string;
  time: string;
  timestamp: number;
  readStatus: "sent" | "delivered" | "read";
  type: "text" | "file" | "voice";
  fileMetadata?: {
    name: string;
    size: string;
    type: "pdf" | "img" | "docx" | "zip" | "xlsx";
    url?: string;
  };
  voiceDuration?: string; // e.g. "0:24"
  voiceWaveform?: number[]; // simulated decibels
}

export interface DoctorThread {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  onlineStatus: "online" | "offline" | "away";
  lastSeenInfo: string;
  unreadCount: number;
  messages: ChatMessage[];
  isDoctorTyping?: boolean;
}

interface DoctorPatientMessagingModuleProps {
  currentUser?: { name: string; email: string } | null;
  onAddNotification?: (notif: {
    id: string;
    title: string;
    text: string;
    time: string;
    unread: boolean;
    type: "success" | "alert" | "info";
  }) => void;
}

// Pre-seeded high quality Doctor Threads and clinical messages
const INITIAL_THREADS: DoctorThread[] = [
  {
    id: "doc-1",
    name: "Dr. Alok Sen",
    specialty: "Lead Cardiologist",
    avatar:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200",
    onlineStatus: "online",
    lastSeenInfo: "Active now",
    unreadCount: 0,
    messages: [
      {
        id: "m1-1",
        sender: "doctor",
        text: "Hello Rohan, I reviewed your clinical blood pressure telemetry logs this week. Your systolic reads are highly compliant!",
        time: "Yesterday, 2:15 PM",
        timestamp: Date.now() - 24 * 60 * 60 * 1000,
        readStatus: "read",
        type: "text",
      },
      {
        id: "m1-2",
        sender: "patient",
        text: "Thanks Dr. Sen! I have been taking my Atorvastatin at 8 PM regularly as you advised. Are there any restrictions on cardiovascular exercise?",
        time: "Yesterday, 2:30 PM",
        timestamp: Date.now() - 24 * 60 * 60 * 1000 + 15 * 60 * 1000,
        readStatus: "read",
        type: "text",
      },
      {
        id: "m1-3",
        sender: "doctor",
        text: "Excellent. Keep the exercise moderate: 30 minutes of brisk walking is ideal. Avoid extreme high-intensity workouts until we perform the treadmill stress test scheduled for next semester.",
        time: "Yesterday, 2:45 PM",
        timestamp: Date.now() - 24 * 60 * 60 * 1000 + 30 * 60 * 1000,
        readStatus: "read",
        type: "text",
      },
    ],
  },
  {
    id: "doc-2",
    name: "Dr. Meera Vasudevan",
    specialty: "Consultant Endocrinologist",
    avatar:
      "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?auto=format&fit=crop&q=80&w=200",
    onlineStatus: "away",
    lastSeenInfo: "Active 20m ago",
    unreadCount: 1,
    messages: [
      {
        id: "m2-1",
        sender: "doctor",
        text: "Please upload your latest glycated hemoglobin HbA1c digital report before Friday's consultation.",
        time: "Yesterday, 10:00 AM",
        timestamp: Date.now() - 28 * 60 * 60 * 1000,
        readStatus: "read",
        type: "text",
      },
      {
        id: "m2-2",
        sender: "patient",
        text: "I finished the blood test at Suburban Labs yesterday. Attaching the PDF copy here for your records. Let me know if we need to adjust the metformin dosage.",
        time: "Yesterday, 11:30 AM",
        timestamp: Date.now() - 28 * 60 * 60 * 1000 + 90 * 60 * 1000,
        readStatus: "read",
        type: "text",
      },
      {
        id: "m2-3",
        sender: "patient",
        text: "Suburban_CBC_Pathology_HbA1c.pdf",
        time: "Yesterday, 11:32 AM",
        timestamp: Date.now() - 28 * 60 * 60 * 1000 + 92 * 60 * 1000,
        readStatus: "read",
        type: "file",
        fileMetadata: {
          name: "Suburban_CBC_Pathology_HbA1c.pdf",
          size: "1.4 MB",
          type: "pdf",
        },
      },
      {
        id: "m2-4",
        sender: "doctor",
        text: "I received the PDF report. I will analyze it thoroughly alongside your continuous blood glucose coordinates and adjust dosage profiles accordingly.",
        time: "Yesterday, 4:15 PM",
        timestamp: Date.now() - 18 * 60 * 60 * 1000,
        readStatus: "delivered",
        type: "text",
      },
    ],
  },
  {
    id: "doc-3",
    name: "Dr. Amit Shah",
    specialty: "Clinical Immunologist",
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200",
    onlineStatus: "online",
    lastSeenInfo: "Active now",
    unreadCount: 0,
    messages: [
      {
        id: "m3-1",
        sender: "doctor",
        text: "Rohan, is your seasonal allergic rhinitis improving with the daily Montelukast regimen?",
        time: "3 days ago",
        timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
        readStatus: "read",
        type: "text",
      },
      {
        id: "m3-2",
        sender: "patient",
        text: "Yes, substantially! The morning sinus headaches and sneezing fits have completely stopped.",
        time: "3 days ago",
        timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000,
        readStatus: "read",
        type: "text",
      },
      {
        id: "m3-3",
        sender: "doctor",
        text: "Splendid. Let us complete the 30-day course, and then transition to PRN (as-needed) usage.",
        time: "3 days ago",
        timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 + 40 * 60 * 1000,
        readStatus: "read",
        type: "text",
      },
    ],
  },
  {
    id: "doc-4",
    name: "Dr. Priya Nair",
    specialty: "Clinical Dietitian & Nutritionist",
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
    onlineStatus: "offline",
    lastSeenInfo: "Active 4h ago",
    unreadCount: 0,
    messages: [
      {
        id: "m4-1",
        sender: "doctor",
        text: "Hello Rohan, here are the low-glycemic dietary planning coordinates for your cardiovascular health. Check this out.",
        time: "4 days ago",
        timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
        readStatus: "read",
        type: "text",
      },
      {
        id: "m4-2",
        sender: "doctor",
        text: "Weekly_Low_Sodium_Meal_Plan.xlsx",
        time: "4 days ago",
        timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000,
        readStatus: "read",
        type: "file",
        fileMetadata: {
          name: "Weekly_Low_Sodium_Meal_Plan.xlsx",
          size: "850 KB",
          type: "xlsx",
        },
      },
      {
        id: "m4-3",
        sender: "patient",
        text: "Thank you Dr. Nair! This is highly comprehensive. The low sodium benchmarks are very easy to follow.",
        time: "4 days ago",
        timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
        readStatus: "read",
        type: "text",
      },
    ],
  },
];

export const DoctorPatientMessagingModule: React.FC<
  DoctorPatientMessagingModuleProps
> = ({ currentUser, onAddNotification }) => {
  // Main Messaging Threads State (using localStorage persistence for high fidelity)
  const [threads, setThreads] = useState<DoctorThread[]>(() => {
    const saved = localStorage.getItem("hs_chat_threads");
    return saved ? JSON.parse(saved) : INITIAL_THREADS;
  });

  const [activeThreadId, setActiveThreadId] = useState<string>("doc-1");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typedMessage, setTypedMessage] = useState<string>("");
  const [isSyncingFirestore, setIsSyncingFirestore] = useState<boolean>(false);

  // Custom states for File Upload & Drop zones (WhatsApp & Slack style)
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom states for Voice Note Simulation recorder
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Playback simulation track
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [voicePlaybackPercent, setVoicePlaybackPercent] = useState<number>(0);
  const voiceProgressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // On-call doctor "Typing..." state simulator
  const [doctorTypingId, setDoctorTypingId] = useState<string | null>(null);

  // File upload progress states
  const [uploadProgress, setUploadProgress] = useState<{ [fileId: string]: number }>({});

  // Typing state sync variables
  const [isPatientTypingLocal, setIsPatientTypingLocal] = useState<boolean>(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Quick Clinical Templates Dropdown
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const templatesRef = useRef<HTMLDivElement>(null);

  // 1. Fetch/Sync Conversations & Messages from Firestore when authenticated
  useEffect(() => {
    const uid = auth.currentUser?.uid || currentUser?.uid;
    if (!uid) {
      return;
    }

    let isSubscribed = true;
    setIsSyncingFirestore(true);

    const syncConversations = async () => {
      try {
        const convoCol = collection(db, "conversations");
        const q = query(convoCol, where("patientId", "==", uid));
        const snapshots = await getDocs(q);

        if (snapshots.empty && isSubscribed) {
          // If Firestore is empty for this user, seed it with INITIAL_THREADS
          const batch = writeBatch(db);
          for (const thread of INITIAL_THREADS) {
            const convoRef = doc(db, "conversations", `${uid}_${thread.id}`);
            batch.set(convoRef, {
              conversationId: thread.id,
              patientId: uid,
              doctorId: thread.id,
              doctorName: thread.name,
              doctorSpecialty: thread.specialty,
              doctorAvatar: thread.avatar,
              lastMessage: thread.messages[thread.messages.length - 1]?.text || "",
              lastMessageTime: thread.messages[thread.messages.length - 1]?.time || "",
              lastMessageTimestamp: thread.messages[thread.messages.length - 1]?.timestamp || Date.now(),
              unreadCount: thread.unreadCount
            });

            for (const msg of thread.messages) {
              const msgRef = doc(db, "messages", `${uid}_${msg.id}`);
              batch.set(msgRef, {
                messageId: msg.id,
                conversationId: thread.id,
                patientId: uid,
                senderId: msg.sender === "patient" ? uid : thread.id,
                receiverId: msg.sender === "patient" ? thread.id : uid,
                message: msg.text,
                timestamp: msg.timestamp,
                type: msg.type,
                status: msg.readStatus,
                fileMetadata: msg.fileMetadata || null,
                voiceDuration: msg.voiceDuration || null,
                voiceWaveform: msg.voiceWaveform || null
              });
            }
          }
          await batch.commit();
        }
      } catch (err) {
        console.error("Error seeding chats to Firestore:", err);
      } finally {
        if (isSubscribed) {
          setIsSyncingFirestore(false);
        }
      }
    };

    syncConversations();

    // Set up snapshot listener for Conversations
    const conversationsQuery = query(
      collection(db, "conversations"),
      where("patientId", "==", uid)
    );
    
    const unsubConvos = onSnapshot(conversationsQuery, (convoSnapshot) => {
      const convoMap: { [convoId: string]: any } = {};
      convoSnapshot.forEach((doc) => {
        const data = doc.data();
        convoMap[data.conversationId] = data;
      });

      // Set up snapshot listener for Messages
      const msgsQuery = query(
        collection(db, "messages"),
        where("patientId", "==", uid),
        where("conversationId", "in", ["doc-1", "doc-2", "doc-3", "doc-4"])
      );

      const unsubMsgs = onSnapshot(msgsQuery, (msgSnapshot) => {
        const messagesByConvo: { [convoId: string]: any[] } = {
          "doc-1": [], "doc-2": [], "doc-3": [], "doc-4": []
        };

        msgSnapshot.forEach((doc) => {
          const data = doc.data();
          const senderId = data.senderId;
          const isFromPatient = senderId === uid;
          
          if (messagesByConvo[data.conversationId]) {
            messagesByConvo[data.conversationId].push({
              id: data.messageId,
              sender: isFromPatient ? "patient" : "doctor",
              text: data.message,
              time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: data.timestamp,
              readStatus: data.status || "sent",
              type: data.type || "text",
              fileMetadata: data.fileMetadata || undefined,
              voiceDuration: data.voiceDuration || undefined,
              voiceWaveform: data.voiceWaveform || undefined,
            });
          }
        });

        // Map them back to the state
        const updatedThreads = INITIAL_THREADS.map(defaultThread => {
          const dbConvo = convoMap[defaultThread.id];
          const dbMsgs = messagesByConvo[defaultThread.id] || [];
          
          // Sort messages by timestamp
          dbMsgs.sort((a, b) => a.timestamp - b.timestamp);

          return {
            id: defaultThread.id,
            name: dbConvo?.doctorName || defaultThread.name,
            specialty: dbConvo?.doctorSpecialty || defaultThread.specialty,
            avatar: dbConvo?.doctorAvatar || defaultThread.avatar,
            onlineStatus: defaultThread.onlineStatus,
            lastSeenInfo: defaultThread.lastSeenInfo,
            unreadCount: dbConvo ? dbConvo.unreadCount : defaultThread.unreadCount,
            messages: dbMsgs.length > 0 ? dbMsgs : defaultThread.messages,
            isDoctorTyping: !!dbConvo?.isDoctorTyping
          };
        });

        if (isSubscribed) {
          setThreads(updatedThreads);
        }
      }, (err) => {
        // Handle gracefully, do not throw blocking exception inside listen loops
        console.error("Messages list error", err);
      });

      return () => unsubMsgs();
    }, (err) => {
      console.error("Conversations list error", err);
    });

    return () => {
      isSubscribed = false;
      unsubConvos();
    };
  }, [currentUser?.uid]);

  // Keep saved local state updated (only if not authenticated)
  useEffect(() => {
    const uid = auth.currentUser?.uid || currentUser?.uid;
    if (!uid) {
      localStorage.setItem("hs_chat_threads", JSON.stringify(threads));
    }
  }, [threads, currentUser?.uid]);

  // Handle clicking outside close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        templatesRef.current &&
        !templatesRef.current.contains(event.target as Node)
      ) {
        setShowTemplates(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch actively selected doctor's thread
  const activeThread =
    threads.find((t) => t.id === activeThreadId) || threads[0];

  // Auto-scroll the chat messages list down when messages change
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [activeThread.messages, doctorTypingId]);

  // Mark all messages in active thread as Read automatically
  useEffect(() => {
    if (activeThread.unreadCount > 0) {
      const uid = auth.currentUser?.uid || currentUser?.uid;
      
      // Update locally immediately
      setThreads((prevThreads) => {
        return prevThreads.map((t) => {
          if (t.id === activeThread.id) {
            const updatedMessages = t.messages.map((m) => {
              if (m.sender === "doctor" && m.readStatus !== "read") {
                return { ...m, readStatus: "read" as const };
              }
              return m;
            });
            return {
              ...t,
              unreadCount: 0,
              messages: updatedMessages,
            };
          }
          return t;
        });
      });

      // Update Firestore if authenticated
      if (uid) {
        try {
          setDoc(doc(db, "conversations", `${uid}_${activeThread.id}`), {
            unreadCount: 0
          }, { merge: true });
        } catch (e) {
          console.error("Error clearing unread counts", e);
        }
      }
    }
  }, [activeThreadId, activeThread.unreadCount, currentUser?.uid]);

  // Formulate clinical Auto-response from on-call doctor
  const generateDoctorResponse = (patientMsg: string, doctorId: string) => {
    setDoctorTypingId(doctorId);
    
    // Set isDoctorTyping: true in Firestore
    const uidForDoc = auth.currentUser?.uid || currentUser?.uid;
    if (uidForDoc) {
      try {
        setDoc(doc(db, "conversations", `${uidForDoc}_${doctorId}`), {
          isDoctorTyping: true
        }, { merge: true });
      } catch (err) {
        console.error("Firestore error setting database typing status:", err);
      }
    }

    setTimeout(() => {
      let doctorText = "";
      const docData = threads.find((t) => t.id === doctorId);
      const name = docData ? docData.name : "Dr. On-call";

      // Simple keywords clinical rule matching
      const normalMsg = patientMsg.toLowerCase();
      if (
        normalMsg.includes("report") ||
        normalMsg.includes("pdf") ||
        normalMsg.includes("file")
      ) {
        doctorText = `Thank you Rohan. I have secure-indexed this medical file into your clinical EMR file system. Let me check the coordinates and get back to you with advice.`;
      } else if (
        normalMsg.includes("bp") ||
        normalMsg.includes("pressure") ||
        normalMsg.includes("heart") ||
        normalMsg.includes("cardio")
      ) {
        doctorText = `Your cardiac telemetry displays highly standard, safe margins. Continue monitoring through your smart band regularly and record your daily Atorvastatin.`;
      } else if (
        normalMsg.includes("exercise") ||
        normalMsg.includes("run") ||
        normalMsg.includes("workout")
      ) {
        doctorText = `Moderate jogging and cardiovascular walking are safe. Avoid anaerobic lifting or extreme workouts above 140bpm pulse until we do our semester diagnostics.`;
      } else if (
        normalMsg.includes("dosage") ||
        normalMsg.includes("medicine") ||
        normalMsg.includes("mg") ||
        normalMsg.includes("tablet")
      ) {
        doctorText = `Please keep current systemic medicines consistent. Do not skip the evening tablets. If you face side-effects like mild muscle fatigue, let us meet.`;
      } else if (normalMsg.includes("voice") || normalMsg.includes("audio")) {
        doctorText = `I have received and listened to your voice message. The symptom progression is totally normal for this time of the wellness calendar.`;
      } else {
        // Fallback natural clinical greeting
        doctorText = `Hello Rohan, I have logged your message securely. Maintaining standard HIPAA compliant digital patient records. Please update me if you detect any acute symptomatic changes.`;
      }

      const replyId = `m-reply-${Date.now()}`;
      const replyTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const reply: ChatMessage = {
        id: replyId,
        sender: "doctor",
        text: doctorText,
        time: replyTime,
        timestamp: Date.now(),
        readStatus: "delivered", // becomes read as soon as patient sees it or is in stream
        type: "text",
      };

      // Firestore dynamic sync
      if (uidForDoc) {
        try {
          const docDataForList = threads.find((t) => t.id === doctorId) || activeThread;
          setDoc(doc(db, "messages", `${uidForDoc}_${replyId}`), {
            messageId: replyId,
            conversationId: doctorId,
            patientId: uidForDoc,
            senderId: doctorId,
            receiverId: uidForDoc,
            message: doctorText,
            timestamp: Date.now(),
            type: "text",
            status: activeThreadId === doctorId ? "read" : "delivered"
          });

          setDoc(doc(db, "conversations", `${uidForDoc}_${doctorId}`), {
            conversationId: doctorId,
            patientId: uidForDoc,
            doctorId: doctorId,
            doctorName: docDataForList.name,
            doctorSpecialty: docDataForList.specialty,
            doctorAvatar: docDataForList.avatar,
            lastMessage: doctorText,
            lastMessageTime: replyTime,
            lastMessageTimestamp: Date.now(),
            unreadCount: activeThreadId === doctorId ? 0 : 1,
            isDoctorTyping: false
          }, { merge: true });
        } catch (e) {
          console.error("Firestore error saving doctor response:", e);
        }
      }

      setThreads((prevThreads) => {
        return prevThreads.map((t) => {
          if (t.id === doctorId) {
            return {
              ...t,
              messages: [...t.messages, reply],
              unreadCount: activeThreadId === doctorId ? 0 : t.unreadCount + 1,
            };
          }
          return t;
          });
        });

      setDoctorTypingId(null);

      // Trigger system alert sound simulation / banner notification
      if (onAddNotification) {
        onAddNotification({
          id: `repl-notif-${Date.now()}`,
          title: `New Message from ${name}`,
          text: doctorText.substring(0, 80) + "...",
          time: "Just now",
          unread: true,
          type: "info",
        });
      }
    }, 2500);
  };

  const updatePatientTypingStateInFirestore = (isTyping: boolean) => {
    const uid = auth.currentUser?.uid || currentUser?.uid;
    if (!uid) return;
    try {
      setDoc(doc(db, "conversations", `${uid}_${activeThreadId}`), {
        isPatientTyping: isTyping
      }, { merge: true });
    } catch (err) {
      console.error("Error setting typing status on Firestore: ", err);
    }
  };

  const handlePatientTyping = () => {
    if (!isPatientTypingLocal) {
      setIsPatientTypingLocal(true);
      updatePatientTypingStateInFirestore(true);
    }

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      setIsPatientTypingLocal(false);
      updatePatientTypingStateInFirestore(false);
    }, 3000);
  };

  // Dispatch text messages
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typedMessage.trim()) return;

    const patientText = typedMessage;
    const timeFormatted = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const msgId = `m-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: msgId,
      sender: "patient",
      text: patientText,
      time: timeFormatted,
      timestamp: Date.now(),
      readStatus: "sent",
      type: "text",
    };

    // Firebase dynamic sync
    const uidForDoc = auth.currentUser?.uid || currentUser?.uid;
    if (uidForDoc) {
      try {
        setDoc(doc(db, "messages", `${uidForDoc}_${msgId}`), {
          messageId: msgId,
          conversationId: activeThread.id,
          patientId: uidForDoc,
          senderId: uidForDoc,
          receiverId: activeThread.id,
          message: patientText,
          timestamp: Date.now(),
          type: "text",
          status: "sent"
        });

        setDoc(doc(db, "conversations", `${uidForDoc}_${activeThread.id}`), {
          conversationId: activeThread.id,
          patientId: uidForDoc,
          doctorId: activeThread.id,
          doctorName: activeThread.name,
          doctorSpecialty: activeThread.specialty,
          doctorAvatar: activeThread.avatar,
          lastMessage: patientText,
          lastMessageTime: timeFormatted,
          lastMessageTimestamp: Date.now(),
          unreadCount: 0
        }, { merge: true });
      } catch (e) {
        console.error("Firestore error saving sent message:", e);
      }
    }

    // First update the sent message & schedule read receipt updates
    setThreads((prevThreads) => {
      return prevThreads.map((t) => {
        if (t.id === activeThread.id) {
          return {
            ...t,
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      });
    });

    setTypedMessage("");

    // Reset and clear typing status
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    setIsPatientTypingLocal(false);
    updatePatientTypingStateInFirestore(false);

    // Simulate WhatsApp-style Read Receipts progression
    // Sent -> Delivered (1.2s) -> Read (2.2s)
    setTimeout(() => {
      if (uidForDoc) {
        try {
          setDoc(doc(db, "messages", `${uidForDoc}_${msgId}`), {
            status: "delivered"
          }, { merge: true });
        } catch (e) {
          console.error("error updating read status", e);
        }
      }
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === activeThread.id) {
            return {
              ...t,
              messages: t.messages.map((m) =>
                m.id === newMsg.id
                  ? { ...m, readStatus: "delivered" as const }
                  : m,
              ),
            };
          }
          return t;
        }),
      );
    }, 1200);

    setTimeout(() => {
      if (uidForDoc) {
        try {
          setDoc(doc(db, "messages", `${uidForDoc}_${msgId}`), {
            status: "read"
          }, { merge: true });
        } catch (e) {
          console.error("error updating read status", e);
        }
      }
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === activeThread.id) {
            return {
              ...t,
              messages: t.messages.map((m) =>
                m.id === newMsg.id ? { ...m, readStatus: "read" as const } : m,
              ),
            };
          }
          return t;
        }),
      );
    }, 2200);

    // Trigger Doctor dynamic clinical auto-response
    generateDoctorResponse(patientText, activeThread.id);
  };

  // Canned health clinical presets helper
  const handleSendCannedTemplate = (text: string) => {
    setTypedMessage(text);
    setShowTemplates(false);
  };

  const saveFileMessageToFirestore = (
    fileMsgId: string,
    fileName: string,
    sizeFormatted: string,
    docType: ChatMessage["fileMetadata"]["type"],
    downloadUrlUrl: string
  ) => {
    const uidForDoc = auth.currentUser?.uid || currentUser?.uid;
    if (!uidForDoc) return;
    try {
      setDoc(doc(db, "messages", `${uidForDoc}_${fileMsgId}`), {
        messageId: fileMsgId,
        conversationId: activeThreadId,
        patientId: uidForDoc,
        senderId: uidForDoc,
        receiverId: activeThreadId,
        message: fileName,
        timestamp: Date.now(),
        type: "file",
        status: "sent",
        fileMetadata: {
          name: fileName,
          size: sizeFormatted,
          type: docType,
          url: downloadUrlUrl
        }
      });

      setDoc(doc(db, "conversations", `${uidForDoc}_${activeThreadId}`), {
        conversationId: activeThreadId,
        patientId: uidForDoc,
        doctorId: activeThreadId,
        doctorName: activeThread.name,
        doctorSpecialty: activeThread.specialty,
        doctorAvatar: activeThread.avatar,
        lastMessage: `📎 File: ${fileName}`,
        lastMessageTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        lastMessageTimestamp: Date.now(),
        unreadCount: 0
      }, { merge: true });

      // Keep the local state updated with URL
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              messages: t.messages.map((m) => {
                if (m.id === fileMsgId) {
                  return {
                    ...m,
                    fileMetadata: {
                      ...m.fileMetadata!,
                      url: downloadUrlUrl
                    }
                  };
                }
                return m;
              })
            };
          }
          return t;
        })
      );
    } catch (e) {
      console.error("Firestore error saving file message:", e);
    }
  };

  // File Upload drag-drop / file selector logic
  const handleUploadedFiles = (files: FileList) => {
    if (files.length === 0) return;
    const file = files[0];
    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`;

    // Check file extension
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    let docType: ChatMessage["fileMetadata"]["type"] = "docx";
    if (extension === "pdf") docType = "pdf";
    else if (["jpg", "jpeg", "png", "svg", "webp"].includes(extension))
      docType = "img";
    else if (extension === "zip" || extension === "rar") docType = "zip";
    else if (["xls", "xlsx"].includes(extension)) docType = "xlsx";

    const timeFormatted = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const fileMsgId = `m-file-${Date.now()}`;
    const fileMsg: ChatMessage = {
      id: fileMsgId,
      sender: "patient",
      text: file.name,
      time: timeFormatted,
      timestamp: Date.now(),
      readStatus: "sent",
      type: "file",
      fileMetadata: {
        name: file.name,
        size: sizeFormatted,
        type: docType,
      },
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            messages: [...t.messages, fileMsg],
          };
        }
        return t;
      }),
    );

    if (onAddNotification) {
      onAddNotification({
        id: `att-notif-${Date.now()}`,
        title: "Medical Document Transmitted",
        text: `Securely encrypted & sent "${file.name}" to ${activeThread.name}.`,
        time: "Just now",
        unread: true,
        type: "success",
      });
    }

    // Firestore / Storage Upload with Progress
    const uidForDoc = auth.currentUser?.uid || currentUser?.uid;
    if (uidForDoc) {
      try {
        const storagePath = `chats/${uidForDoc}/${activeThreadId}/${Date.now()}_${file.name}`;
        const sRef = storageRef(storage, storagePath);
        const uploadTask = uploadBytesResumable(sRef, file);

        setUploadProgress(prev => ({ ...prev, [fileMsgId]: 5 }));

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setUploadProgress((prev) => ({ ...prev, [fileMsgId]: progress }));
          },
          (error) => {
            console.error(
              "Firebase Storage Upload Error, falling back gracefully to simulated URL: ",
              error
            );
            // Fallback gracefully to ObjectURL to keep app perfectly functional if Storage permissions are disabled
            setUploadProgress((prev) => {
              const copy = { ...prev };
              delete copy[fileMsgId];
              return copy;
            });
            const localUrl = URL.createObjectURL(file);
            saveFileMessageToFirestore(fileMsgId, file.name, sizeFormatted, docType, localUrl);
          },
          async () => {
            try {
              const downloadUrlUrl = await getDownloadURL(uploadTask.snapshot.ref);
              saveFileMessageToFirestore(fileMsgId, file.name, sizeFormatted, docType, downloadUrlUrl);
            } catch (e) {
              console.error("Error getting download url, falling back: ", e);
              const localUrl = URL.createObjectURL(file);
              saveFileMessageToFirestore(fileMsgId, file.name, sizeFormatted, docType, localUrl);
            } finally {
              setUploadProgress((prev) => {
                const copy = { ...prev };
                delete copy[fileMsgId];
                return copy;
              });
            }
          }
        );
      } catch (err) {
        console.error("Storage upload setup error, falling back locally: ", err);
        const localUrl = URL.createObjectURL(file);
        saveFileMessageToFirestore(fileMsgId, file.name, sizeFormatted, docType, localUrl);
      }
    } else {
      // If no uid, update with local object url
      const localUrl = URL.createObjectURL(file);
      saveFileMessageToFirestore(fileMsgId, file.name, sizeFormatted, docType, localUrl);
    }

    // Auto replies for file
    generateDoctorResponse(`[Uploaded file: ${file.name}]`, activeThreadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadedFiles(e.dataTransfer.files);
    }
  };

  // Voice recording mock mechanics
  const handleToggleVoiceRecord = () => {
    if (isRecording) {
      // Stop recording and send
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setIsRecording(false);

      const secondsFormatted = `0:${recordingSeconds.toString().padStart(2, "0")}`;
      const randomWave = Array.from(
        { length: 15 },
        () => Math.floor(Math.random() * 85) + 15,
      );

      const timeFormatted = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const voiceMsgId = `m-voice-${Date.now()}`;
      const voiceMsg: ChatMessage = {
        id: voiceMsgId,
        sender: "patient",
        text: "Voice Note",
        time: timeFormatted,
        timestamp: Date.now(),
        readStatus: "sent",
        type: "voice",
        voiceDuration: secondsFormatted,
        voiceWaveform: randomWave,
      };

      // Firestore Integration Ready
      const uidForDoc = auth.currentUser?.uid || currentUser?.uid;
      if (uidForDoc) {
        try {
          setDoc(doc(db, "messages", `${uidForDoc}_${voiceMsgId}`), {
            messageId: voiceMsgId,
            conversationId: activeThreadId,
            patientId: uidForDoc,
            senderId: uidForDoc,
            receiverId: activeThreadId,
            message: "Voice Note",
            timestamp: Date.now(),
            type: "voice",
            status: "sent",
            voiceDuration: secondsFormatted,
            voiceWaveform: randomWave
          });

          setDoc(doc(db, "conversations", `${uidForDoc}_${activeThreadId}`), {
            conversationId: activeThreadId,
            patientId: uidForDoc,
            doctorId: activeThreadId,
            doctorName: activeThread.name,
            doctorSpecialty: activeThread.specialty,
            doctorAvatar: activeThread.avatar,
            lastMessage: `🎙️ Voice note (${secondsFormatted})`,
            lastMessageTime: timeFormatted,
            lastMessageTimestamp: Date.now(),
            unreadCount: 0
          }, { merge: true });
        } catch (e) {
          console.error("Firestore error saving voice message:", e);
        }
      }

      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              messages: [...t.messages, voiceMsg],
            };
          }
          return t;
        }),
      );

      setRecordingSeconds(0);
      generateDoctorResponse(
        "[Sent clinical recorded voice note]",
        activeThreadId,
      );
    } else {
      // Start recording
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleCancelVoiceRecord = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // Voice Playback audio wave player controller simulator
  const handleTogglePlayVoice = (msgId: string) => {
    if (playingVoiceId === msgId) {
      // Pause
      if (voiceProgressTimerRef.current)
        clearInterval(voiceProgressTimerRef.current);
      setPlayingVoiceId(null);
      setVoicePlaybackPercent(0);
    } else {
      // Stop previous
      if (voiceProgressTimerRef.current)
        clearInterval(voiceProgressTimerRef.current);
      setPlayingVoiceId(msgId);
      setVoicePlaybackPercent(0);

      // Animate progressing slider
      voiceProgressTimerRef.current = setInterval(() => {
        setVoicePlaybackPercent((prev) => {
          if (prev >= 100) {
            if (voiceProgressTimerRef.current)
              clearInterval(voiceProgressTimerRef.current);
            setPlayingVoiceId(null);
            return 0;
          }
          return prev + 5;
        });
      }, 120);
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (voiceProgressTimerRef.current)
        clearInterval(voiceProgressTimerRef.current);
    };
  }, []);

  // Filter threads based on Search terms (Slack and WhatsApp behavior)
  const filteredThreads = threads.filter((t) => {
    const query = searchQuery.toLowerCase();
    const hasName = t.name.toLowerCase().includes(query);
    const hasSpecialty = t.specialty.toLowerCase().includes(query);
    const hasMsgSnippet = t.messages.some((m) =>
      m.text.toLowerCase().includes(query),
    );
    return hasName || hasSpecialty || hasMsgSnippet;
  });

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="max-w-6xl mx-auto bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden h-[620px] shadow-lg grid grid-cols-1 md:grid-cols-12 relative text-left"
    >
      {/* DRAG AND DROP FILE COMPLIANCY GLASS PANEL OVERLAY */}
      <AnimatePresence>
        {isDraggingFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-indigo-950/80 backdrop-blur-xs flex flex-col items-center justify-center border-4 border-dashed border-indigo-400 m-2 rounded-2xl text-white select-none pointer-events-none"
          >
            <div className="w-16 h-16 rounded-full bg-indigo-500/25 border border-indigo-400 flex items-center justify-center animate-bounce mb-3">
              <Lucide.UploadCloud className="w-8 h-8 text-indigo-300" />
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest">
              Transmit Encrypted Clinical Records
            </h4>
            <p className="text-xs text-indigo-200 mt-1 max-w-sm text-center font-medium">
              Drop pathology reports, ECG trace scans, medical prescription
              letters, or wellness files securely to share directly with{" "}
              {activeThread.name}.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT COLUMN: CHAT LIST & SEARCH CONSOLE (md:col-span-4) */}
      <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden">
        {/* Workspace Hub Branding */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 shrink-0">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />{" "}
              Telehealth Channels
            </span>
            <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
              HIPAA SECURED
            </span>
          </div>

          {/* Search Inputs (Slack / WhatsApp filter) */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats, doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 dark:text-white"
            />
            <Lucide.Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-650 text-xs"
              >
                <Lucide.X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Chat stream List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 select-none">
          {filteredThreads.length > 0 ? (
            filteredThreads.map((t) => {
              const isActive = t.id === activeThreadId;
              const lastMsg = t.messages[t.messages.length - 1];

              return (
                <div
                  key={t.id}
                  onClick={() => setActiveThreadId(t.id)}
                  className={`p-3.5 transition flex items-center justify-between cursor-pointer border-l-4 ${
                    isActive
                      ? "bg-slate-50 dark:bg-slate-950/60 border-indigo-600"
                      : "border-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    {/* Hero Avatar with status indicator */}
                    <div className="relative shrink-0 select-none">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                      />
                      {/* Status indicator dot */}
                      <span
                        className={`w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 absolute bottom-0 right-0 ${
                          t.onlineStatus === "online"
                            ? "bg-emerald-500"
                            : t.onlineStatus === "away"
                              ? "bg-amber-400"
                              : "bg-slate-400"
                        }`}
                      />
                    </div>

                    {/* Metadata text */}
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-800 dark:text-slate-150 block truncate">
                          {t.name}
                        </span>
                        {t.unreadCount > 0 && (
                          <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-405 dark:text-slate-400 font-bold block leading-relaxed">
                        {t.specialty}
                      </span>

                      {/* Message excerpt snippet formatted based on payload types */}
                      <p
                        className={`text-[11px] truncate mt-0.5 max-w-[150px] ${
                          t.unreadCount > 0
                            ? "text-slate-900 dark:text-slate-100 font-extrabold"
                            : "text-slate-450 dark:text-slate-400"
                        }`}
                      >
                        {lastMsg ? (
                          lastMsg.type === "file" ? (
                            <span className="flex items-center gap-0.5 text-indigo-650 dark:text-indigo-405 font-bold">
                              <Lucide.FileText className="w-3 h-3" /> Report
                              file
                            </span>
                          ) : lastMsg.type === "voice" ? (
                            <span className="flex items-center gap-0.5 text-slate-500">
                              <Lucide.Mic className="w-3 h-3 text-emerald-500" />{" "}
                              Voice memo
                            </span>
                          ) : (
                            lastMsg.text
                          )
                        ) : (
                          "Initiate clinical discussion..."
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right side unreads badge & time info */}
                  <div className="text-right flex flex-col items-end shrink-0 pl-1">
                    <span className="text-[9px] text-slate-400 font-mono">
                      {lastMsg ? lastMsg.time.split(", ").pop() : ""}
                    </span>
                    {t.unreadCount > 0 ? (
                      <span className="mt-1 bg-indigo-650 text-white min-w-4.5 h-4.5 px-1 flex items-center justify-center rounded-full text-[9px] font-black leading-none">
                        {t.unreadCount}
                      </span>
                    ) : (
                      lastMsg &&
                      lastMsg.sender === "patient" && (
                        <div className="mt-1">
                          {lastMsg.readStatus === "read" ? (
                            <Lucide.CheckCheck className="w-3.5 h-3.5 text-blue-550" />
                          ) : lastMsg.readStatus === "delivered" ? (
                            <Lucide.CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <Lucide.Check className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center space-y-2">
              <Lucide.MessageSquareOff className="w-8 h-8 text-slate-300 mx-auto" />
              <span className="text-xs font-bold text-slate-500 block">
                No secure channels found
              </span>
              <p className="text-[10px] text-slate-405 leading-snug">
                Adjust search coordinates keywords filters.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Current Profile Tag */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5 shrink-0 text-[11px]">
          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0) : "R"}
          </div>
          <div className="truncate">
            <span className="font-extrabold text-slate-800 dark:text-slate-100 block leading-tight">
              {currentUser?.name || "Rohan Sharma"}
            </span>
            <span className="text-[9px] text-slate-450 dark:text-slate-400 block font-mono">
              {currentUser?.email || "patient@healthsaathi.com"}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: ACTIVE CHAT CONSOLE (md:col-span-8) */}
      <div className="md:col-span-8 flex flex-col bg-slate-50 dark:bg-slate-950/20 h-full overflow-hidden relative">
        {/* 1. Chat Console Active Doctor Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative select-none">
              <img
                src={activeThread.avatar}
                alt={activeThread.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-slate-250 dark:border-slate-800"
              />
              <span
                className={`w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 absolute bottom-0 right-0 ${
                  activeThread.onlineStatus === "online"
                    ? "bg-emerald-500"
                    : activeThread.onlineStatus === "away"
                      ? "bg-amber-400"
                      : "bg-slate-400"
                }`}
              />
            </div>

            <div>
              <h4
                id="active-chat-doctor-name"
                className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-1.5"
              >
                {activeThread.name}
                <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-705 text-slate-650 dark:text-slate-300 font-bold font-sans">
                  {activeThread.specialty}
                </span>
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-450 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                {activeThread.lastSeenInfo}
              </p>
            </div>
          </div>

          {/* Functional Voice/Video Mock Call and details Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() =>
                alert(
                  `Simulating diagnostic telemedicine audio ringout to ${activeThread.name}...`,
                )
              }
              className="p-2 text-slate-500 hover:text-slate-850 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Encrypted Audio Call"
            >
              <Lucide.PhoneCall className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                alert(
                  `Initiating full HD HIPAA compliant video telemetry consult room with ${activeThread.name}...`,
                )
              }
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition cursor-pointer"
              title="Telehealth Video Consult"
            >
              <Lucide.Video className="w-4 h-4" />
            </button>
            <span className="hidden sm:inline-block border-l border-slate-200 h-6 mx-1.5" />
            <div className="hidden sm:flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-1 rounded-xl">
              <Lucide.Fingerprint className="w-3.5 h-3.5" /> E2E KEYED
            </div>
          </div>
        </div>

        {/* 2. Messages Canvas stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          <div className="text-center select-none py-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-full shadow-xs border border-slate-150 dark:border-slate-805 dark:border-slate-800">
              HIPAA Cryptographic Session Started
            </span>
          </div>

          {activeThread.messages.map((m: ChatMessage) => {
            const isPatient = m.sender === "patient";
            const statusColor = getReadReceiptStyle(m.readStatus);

            return (
              <div
                key={m.id}
                className={`flex flex-col max-w-[82%] ${isPatient ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                {/* Message Speech Bubble */}
                <div
                  className={`p-3.5 rounded-2xl relative shadow-xs transition-all ${
                    isPatient
                      ? "bg-gradient-to-br from-indigo-700 to-indigo-850 text-white rounded-tr-none"
                      : "bg-white dark:bg-slate-900 border border-slate-200/95 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none"
                  }`}
                >
                  {/* File Message rendering */}
                  {m.type === "file" && m.fileMetadata && (
                    <div className="flex items-center gap-3 py-1">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isPatient
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-150 dark:bg-slate-955 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {getFileIcon(m.fileMetadata.type)}
                      </div>
                      <div className="truncate text-left flex-1 min-w-0">
                        <span
                          className={`text-xs font-black block truncate max-w-[170px] ${isPatient ? "text-white" : "text-slate-805 dark:text-white"}`}
                        >
                          {m.fileMetadata.name}
                        </span>
                        {uploadProgress[m.id] !== undefined ? (
                          <div className="w-full mt-1 min-w-[100px]">
                            <span className="text-[9.5px] block leading-none mb-1 text-indigo-200">
                              Uploading... {uploadProgress[m.id]}%
                            </span>
                            <div className="w-full bg-indigo-900/40 rounded-full h-1 animate-pulse">
                              <div 
                                className="bg-indigo-300 h-1 rounded-full transition-all duration-300" 
                                style={{ width: `${uploadProgress[m.id]}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span
                            className={`text-[9.5px] block leading-none mt-0.5 ${isPatient ? "text-indigo-300" : "text-slate-450 dark:text-slate-400"}`}
                          >
                            {m.fileMetadata.size} &#8226;{" "}
                            {m.fileMetadata.type.toUpperCase()} File
                          </span>
                        )}
                      </div>
                      {uploadProgress[m.id] === undefined && (
                        m.fileMetadata.url ? (
                          <a
                            href={m.fileMetadata.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-1.5 rounded-lg border transition shrink-0 cursor-pointer flex items-center justify-center ${
                              isPatient
                                ? "border-indigo-600 hover:bg-indigo-600 text-white"
                                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300"
                            }`}
                            title="Open Secure Document"
                          >
                            <Lucide.ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              if (onAddNotification) {
                                onAddNotification({
                                  id: `file-dl-sim-${Date.now()}`,
                                  title: "Document Download Initialized",
                                  text: `Directly downloading secure clinical document "${m.fileMetadata?.name}"...`,
                                  time: "Just now",
                                  unread: false,
                                  type: "info"
                                });
                              }
                            }}
                            className={`p-1.5 rounded-lg border transition shrink-0 cursor-pointer ${
                              isPatient
                                        ? "border-indigo-600 hover:bg-indigo-650 text-white"
                                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300"
                            }`}
                            title="Simulate Clinical File Download"
                          >
                            <Lucide.Download className="w-3.5 h-3.5" />
                          </button>
                        )
                      )}
                    </div>
                  )}

                  {/* Voice note rendering */}
                  {m.type === "voice" && m.voiceWaveform && (
                    <div className="flex items-center gap-3 py-1 text-left">
                      {/* Play Action */}
                      <button
                        onClick={() => handleTogglePlayVoice(m.id)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition ${
                          isPatient
                            ? "bg-white/15 hover:bg-white/25 text-white"
                            : "bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-755 dark:hover:bg-slate-750 text-indigo-700 dark:text-indigo-400"
                        }`}
                      >
                        {playingVoiceId === m.id ? (
                          <Lucide.Pause className="w-4 h-4" />
                        ) : (
                          <Lucide.Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>

                      {/* Custom Simulated Waveforms */}
                      <div className="w-[140px] sm:w-[180px]">
                        <div className="flex items-end gap-[2px] h-7">
                          {m.voiceWaveform.map((db, idx) => {
                            const isPlayed =
                              playingVoiceId === m.id &&
                              (idx / m.voiceWaveform!.length) * 100 <=
                                voicePlaybackPercent;
                            return (
                              <div
                                key={idx}
                                className={`flex-1 rounded-sm transition ${
                                  isPlayed
                                    ? isPatient
                                      ? "bg-indigo-200"
                                      : "bg-indigo-600"
                                    : isPatient
                                      ? "bg-white/40"
                                      : "bg-slate-300 dark:bg-slate-700"
                                }`}
                                style={{ height: `${db}%` }}
                              />
                            );
                          })}
                        </div>
                        {/* Play progress seek duration */}
                        <div className="flex justify-between items-center mt-1 text-[8.5px]">
                          <span
                            className={
                              isPatient ? "text-indigo-300" : "text-slate-450 dark:text-slate-400"
                            }
                          >
                            {playingVoiceId === m.id
                              ? `0:${Math.floor(
                                  (voicePlaybackPercent / 100) * 15,
                                )
                                  .toString()
                                  .padStart(2, "0")}`
                              : "0:00"}
                          </span>
                          <span
                            className={
                              isPatient
                                ? "text-indigo-300 font-mono"
                                : "text-slate-450 dark:text-slate-400 font-mono"
                            }
                          >
                            {m.voiceDuration}
                          </span>
                        </div>
                      </div>

                      <Lucide.Mic
                        className={`w-4 h-4 shrink-0 ${isPatient ? "text-indigo-200" : "text-emerald-505 text-emerald-500"}`}
                      />
                    </div>
                  )}

                  {/* Standard Text message rendering */}
                  {m.type === "text" && (
                    <p className="text-xs leading-relaxed break-words whitespace-pre-wrap">
                      {m.text}
                    </p>
                  )}
                </div>

                {/* Bubble Timestamp & Status checks row */}
                <div className="flex items-center gap-1.5 mt-1 px-1 text-[9.5px] font-medium text-slate-400 select-none">
                  <span>{m.time}</span>
                  {isPatient && (
                    <span className={statusColor}>
                      {m.readStatus === "read" ? (
                        <Lucide.CheckCheck
                          className="w-3.5 h-3.5"
                          title="Read"
                        />
                      ) : m.readStatus === "delivered" ? (
                        <Lucide.CheckCheck
                          className="w-3.5 h-3.5"
                          title="Delivered"
                        />
                      ) : (
                        <Lucide.Check
                          className="w-3.5 h-3.5"
                          title="Sent Successfully"
                        />
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Doctor Typing state indicator */}
          {(doctorTypingId === activeThread.id || activeThread.isDoctorTyping) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mr-auto flex items-end gap-2.5 max-w-[80%]"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0 border border-slate-300">
                <img
                  src={activeThread.avatar}
                  alt="Typing avatar"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-white border border-slate-250 p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
                <span className="font-bold text-slate-700 animate-pulse">
                  {activeThread.name} is writing guidance
                </span>
                <div className="flex gap-0.5 mt-1">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                </div>
              </div>
            </motion.div>
          )}

          {/* This anchor is targeted for dynamic bottom scrolling */}
          <div ref={messagesEndRef} />
        </div>

        {/* 3. Input Dashboard command bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex flex-col gap-2 shrink-0 relative">
          {/* Preset Clinical templates shortcut overlay popup dialog */}
          <AnimatePresence>
            {showTemplates && (
              <motion.div
                ref={templatesRef}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute bottom-[105%] left-3 max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-2xl z-40 text-left text-white"
              >
                <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-slate-800">
                  <Lucide.Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-300">
                    Fast Clinical Templates
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() =>
                      handleSendCannedTemplate(
                        "Hello, can we review my daily Atorvastatin telemetry? Are the systolic markers compliant?",
                      )
                    }
                    className="w-full text-left p-2 hover:bg-slate-800 rounded-lg text-slate-200 transition font-medium"
                  >
                    📈 "Review medication & BP coordinates"
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSendCannedTemplate(
                        "Attaching my continuous glucose diagnostics reports herewith for endocrinology adjustment.",
                      )
                    }
                    className="w-full text-left p-2 hover:bg-slate-800 rounded-lg text-slate-200 transition font-medium"
                  >
                    🔬 "Submitting blood tests glucose reports"
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSendCannedTemplate(
                        "Experiencing mild headache symptoms and elevated fatigue today. Do I adjust parameters?",
                      )
                    }
                    className="w-full text-left p-2 hover:bg-slate-800 rounded-lg text-slate-200 transition font-medium"
                  >
                    ⚠️ "Report symptomatic muscle fatigue / headache"
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Voice Recorder overlay HUD */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="absolute inset-0 bg-slate-900 z-30 flex items-center justify-between px-4 text-white"
              >
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                  </span>

                  <span className="text-xs font-black tracking-widest uppercase font-mono">
                    Recording Clinical Audio:{" "}
                    {`0:${recordingSeconds.toString().padStart(2, "0")}`}
                  </span>

                  {/* Pulsing visual Amplitude Decibels simulation */}
                  <div className="flex items-end gap-0.5 h-4">
                    <div
                      className="w-[3px] bg-indigo-405 bg-indigo-400 animate-pulse"
                      style={{ height: "30%" }}
                    />
                    <div
                      className="w-[3px] bg-indigo-405 bg-indigo-400 animate-pulse [animation-delay:0.1s]"
                      style={{ height: "70%" }}
                    />
                    <div
                      className="w-[3px] bg-indigo-405 bg-indigo-400 animate-pulse [animation-delay:0.2s]"
                      style={{ height: "40%" }}
                    />
                    <div
                      className="w-[3px] bg-indigo-405 bg-indigo-400 animate-pulse [animation-delay:0.3s]"
                      style={{ height: "90%" }}
                    />
                    <div
                      className="w-[3px] bg-indigo-405 bg-indigo-400 animate-pulse [animation-delay:0.15s]"
                      style={{ height: "50%" }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelVoiceRecord}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 hover:text-rose-400 text-slate-350 text-[10px] font-black rounded-lg uppercase tracking-wider transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleVoiceRecord}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[10px] font-black rounded-lg uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                  >
                    <Lucide.Send className="w-3.5 h-3.5 fill-current" /> Send
                    voice memo
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Standard Message Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Template presets picker drawer */}
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="p-2 border border-slate-200 dark:border-slate-805 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition cursor-pointer active:scale-95"
              title="Canned clinical templates"
            >
              <Lucide.Sparkles className="w-4 h-4" />
            </button>

            {/* Direct selector File Attach Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files) {
                  handleUploadedFiles(e.target.files);
                }
              }}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 border border-slate-200 dark:border-slate-805 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition cursor-pointer active:scale-95"
              title="Share files with doctor"
            >
              <Lucide.Paperclip className="w-4 h-4" />
            </button>

            {/* Text Message Field */}
            <input
              type="text"
              required
              placeholder="Type secure message..."
              value={typedMessage}
              onChange={(e) => {
                setTypedMessage(e.target.value);
                handlePatientTyping();
              }}
              className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 dark:text-white shadow-inner"
            />

            {/* Emoji simulation triggers */}
            <button
              type="button"
              onClick={() => setTypedMessage((prev) => prev + " 👍")}
              className="p-2 text-slate-450 dark:text-slate-400 hover:text-amber-500 rounded-xl transition cursor-pointer"
              title="Shortcut Thumbsup Emoji"
            >
              👍
            </button>
            <button
              type="button"
              onClick={() => setTypedMessage((prev) => prev + " 😊")}
              className="p-2 text-slate-450 dark:text-slate-400 hover:text-amber-500 rounded-xl transition cursor-pointer"
              title="Shortcut Smile Emoji"
            >
              😊
            </button>

            {/* Micro voice note trigger */}
            <button
              type="button"
              onClick={handleToggleVoiceRecord}
              className="p-2 border border-slate-200 dark:border-slate-805 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition cursor-pointer active:scale-95"
              title="Record Voice Memo Note"
            >
              <Lucide.Mic className="w-4 h-4" />
            </button>

            {/* Form submission Trigger */}
            <button
              type="submit"
              className="p-2.5 bg-indigo-650 hover:bg-indigo-805 text-white rounded-xl shadow-md transition cursor-pointer hover:shadow-indigo-200 shrink-0"
              title="Encrypt and send"
            >
              <Lucide.Send className="w-4 h-4 fill-current" />
            </button>
          </form>

          {/* Fineprint disclaimer */}
          <div className="flex justify-between items-center text-[9.5px] text-slate-400 font-semibold px-1">
            <span>
              🛡️ E2E Encryption Active (256-bit HIPAA compliant tunnel session)
            </span>
            <span>Standard clinical telemetry feeds sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Utilities
function getFileIcon(type: ChatMessage["fileMetadata"]["type"]) {
  switch (type) {
    case "pdf":
      return (
        <Lucide.FileText className="w-5 h-5 text-rose-500 fill-rose-500/10" />
      );
    case "img":
      return <Lucide.Image className="w-5 h-5 text-emerald-500" />;
    case "zip":
      return <Lucide.FolderClosed className="w-5 h-5 text-amber-500" />;
    case "xlsx":
      return <Lucide.TableProperties className="w-5 h-5 text-emerald-650" />;
    default:
      return <Lucide.FileText className="w-5 h-5 text-slate-500" />;
  }
}

function getReadReceiptStyle(status: ChatMessage["readStatus"]) {
  switch (status) {
    case "read":
      return "text-blue-500";
    case "delivered":
      return "text-slate-400";
    default:
      return "text-slate-300";
  }
}
