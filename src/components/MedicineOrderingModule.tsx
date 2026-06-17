import React, { useState, useEffect, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Interfaces
interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  reviews: number;
  status: 'Open 24/7' | 'Closes at 11 PM' | 'Open Now';
  phone: string;
  hasHomeDelivery: boolean;
  latitude: number;
  longitude: number;
}

interface Medicine {
  id: string;
  name: string;
  composition: string;
  manufacturer: string;
  price: number;
  category: string;
  description: string;
  dosage: string;
  sideEffects: string[];
  prescriptionRequired: boolean;
  stock: 'In Stock' | 'Low Stock' | 'Out of Stock';
  rating: number;
}

interface CartItem {
  medicine: Medicine;
  quantity: number;
  pharmacy: Pharmacy;
}

interface Order {
  id: string;
  pharmacy: Pharmacy;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: 'pending_prescription' | 'confirmed' | 'dispensing' | 'out_for_delivery' | 'delivered';
  customerName: string;
  phone: string;
  deliveryAddress: string;
  prescriptionAttached?: {
    name: string;
    size: string;
    url?: string;
  };
  trackingStep: number; // 0: Confirmed, 1: Prescription Approved, 2: Dispensing, 3: Out for Delivery, 4: Delivered
  createdAt: string;
}

interface MedicineOrderingModuleProps {
  onAddNotification?: (notif: {
    id: string;
    title: string;
    text: string;
    time: string;
    unread: boolean;
    type: 'success' | 'alert' | 'info';
  }) => void;
}

const PHARMACIES_DATA: Pharmacy[] = [
  {
    id: 'ph-care-cure',
    name: 'Care & Cure Medicos',
    address: 'Shop No. 7, Link Road, Juhu Scheme, Mumbai 400049',
    distance: '0.8 km',
    rating: 4.8,
    reviews: 142,
    status: 'Open Now',
    phone: '+91 98210 52311',
    hasHomeDelivery: true,
    latitude: 19.1121,
    longitude: 72.8272,
  },
  {
    id: 'ph-apollo',
    name: 'Apollo Pharmacy Express',
    address: 'G-12, Ground Floor, Beverly Park, Andheri West, Mumbai 400053',
    distance: '1.4 km',
    rating: 4.9,
    reviews: 588,
    status: 'Open 24/7',
    phone: '+91 93601 22890',
    hasHomeDelivery: true,
    latitude: 19.1215,
    longitude: 72.8340,
  },
  {
    id: 'ph-wellness',
    name: 'Wellness Forever Wellness Hub',
    address: 'Ground Floor, Juhu Residency, Juhu Tara Road, Mumbai 400049',
    distance: '2.5 km',
    rating: 4.7,
    reviews: 320,
    status: 'Open 24/7',
    phone: '+91 99912 34455',
    hasHomeDelivery: true,
    latitude: 19.1020,
    longitude: 72.8225,
  },
  {
    id: 'ph-medplus',
    name: 'MedPlus Discount Pharmacy',
    address: 'No. 3, J.P. Road, Versova, Andheri West, Mumbai 400061',
    distance: '3.1 km',
    rating: 4.6,
    reviews: 89,
    status: 'Closes at 11 PM',
    phone: '+91 91200 44552',
    hasHomeDelivery: false,
    latitude: 19.1345,
    longitude: 72.8120,
  }
];

const MEDICINES_DATA: Medicine[] = [
  {
    id: 'med-para',
    name: 'Calpol Ortho Paracetamol 650mg',
    composition: 'Paracetamol IP 650mg',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd',
    price: 42,
    category: 'Fever & Pain',
    description: 'Calpol 650 Tablet helps relieve pain and fever by blocking the release of certain chemical messengers responsible for fever and pain signals. Widely trusted clinical antipyretic.',
    dosage: '1 tablet every 4 to 6 hours as needed. Maximum 4g per 24 hours.',
    sideEffects: ['Liver toxicity (on heavy overdose)', 'Nausea', 'Allergic skin rashes'],
    prescriptionRequired: false,
    stock: 'In Stock',
    rating: 4.8
  },
  {
    id: 'med-amox',
    name: 'Amoxyclav 625 Duo Duo Pack',
    composition: 'Amoxicillin Trihydrate IP 500mg + Potassium Clavulanate IP 125mg',
    manufacturer: 'Alkem Laboratories Ltd',
    price: 185,
    category: 'Antibiotics',
    description: 'Amoxyclav 625 is an antibiotic agent containing penicillin-based amoxicillin paired with clavulanate to resist bacterial enzyme neutralization. Highly effective for chest, throat, skin, and urinary pathway infections.',
    dosage: '1 tablet twice daily after main meals for 5 full days as scheduled by clinician.',
    sideEffects: ['Diarrhea / Loose stool', 'Stomach irritation', 'Oral thrush'],
    prescriptionRequired: true,
    stock: 'Low Stock',
    rating: 4.9
  },
  {
    id: 'med-pan-d',
    name: 'Pan-D Gastro Care Capsule',
    composition: 'Pantoprazole Sodium 40mg + Domperidone 30mg SR',
    manufacturer: 'Alkem Laboratories Ltd',
    price: 145,
    category: 'Acidity & Digestion',
    description: 'Used for neutralizing excessive bile backflow and severe acid reflux symptoms. Prevents nausea, stomach gas discomfort, and heartburn triggers.',
    dosage: '1 capsule in morning 30 minutes before taking breakfast / beverages.',
    sideEffects: ['Dry mouth', 'Headache', 'Mild dizziness'],
    prescriptionRequired: true,
    stock: 'In Stock',
    rating: 4.7
  },
  {
    id: 'med-mono-cef',
    name: 'Monocef-O 200 Antibiotic',
    composition: 'Cefpodoxime Proxetil IP 200mg',
    manufacturer: 'Aristo Pharmaceuticals Pvt Ltd',
    price: 168,
    category: 'Antibiotics',
    description: 'Monocef-O is an oral third-generation cephalosporin broad-spectrum antibiotic. Prescribed widely for acute bronchitis, sinus flare-ups, and pelvic inflammatory issues.',
    dosage: '1 tablet daily at precise 12-hour intervals for 5-7 days.',
    sideEffects: ['Skin irritation', 'Abdominal cramps', 'Fungal infections'],
    prescriptionRequired: true,
    stock: 'In Stock',
    rating: 4.6
  },
  {
    id: 'med-allegra',
    name: 'Allegra Allergy Relief 120mg',
    composition: 'Fexofenadine Hydrochloride 120mg',
    manufacturer: 'Sanofi India Ltd',
    price: 210,
    category: 'Allergy & Cold',
    description: 'An advanced, non-drowsy second-generation antihistamine drug. Rapidly subdues sneezing, watery eyes, running nose, skin hives and pollen allergy triggers.',
    dosage: '1 tablet once daily with glass of water. Avoid taking concurrently with fruit juices.',
    sideEffects: ['Mild drowsiness', 'Fatigue', 'Slight dry throat'],
    prescriptionRequired: false,
    stock: 'In Stock',
    rating: 4.9
  },
  {
    id: 'med-telma',
    name: 'Telma-H Hypertension Guard',
    composition: 'Telmisartan IP 40mg + Hydrochlorothiazide IP 12.5mg',
    manufacturer: 'Glenmark Pharmaceuticals Ltd',
    price: 232,
    category: 'Cardiac & Blood Pressure',
    description: 'Dual-action hypertension fighter. Telmisartan acts as an angiotensin receptor blocker while hydrochlorothiazide is a mild diuretic helper to normalize sustained clinical pressure.',
    dosage: '1 tablet daily in the morning, regularly at the same hour.',
    sideEffects: ['Low sodium indices', 'Mild orthostatic hypotension', 'Fatigue'],
    prescriptionRequired: true,
    stock: 'In Stock',
    rating: 4.8
  },
  {
    id: 'med-lipitor',
    name: 'Atorva Lipid Stabilizer 10mg',
    composition: 'Atorvastatin IP 10mg',
    manufacturer: 'Zydus Healthcare',
    price: 98,
    category: 'Cardiac & Blood Pressure',
    description: 'Statins help reduce high cholesterol lipid fractions (LDL) and triglycerides in bloodstream, reducing arterial plaque risks dramatically.',
    dosage: '1 tablet at bedtime daily as scheduled by cardiologist.',
    sideEffects: ['Muscle stiffness / Myalgia', 'Elevated liver enzymes', 'Cognitive fog'],
    prescriptionRequired: true,
    stock: 'In Stock',
    rating: 4.7
  },
  {
    id: 'med-zincovit',
    name: 'Zincovit Immunoguard Multivitamin',
    composition: 'Vitamins A, C, E, Zinc, Selenium & L-Lysine',
    manufacturer: 'Apex Laboratories Pvt Ltd',
    price: 110,
    category: 'Vitamins & Wellness',
    description: 'A stellar balanced dietary supplement of essential zinc, trace elements, and vitamins designed to build robust immunity and accelerate post-illness tissue healing.',
    dosage: '1 tablet daily after lunch or major meals.',
    sideEffects: ['Metallic taste', 'Yellowish urine', 'Nausea on empty stomach'],
    prescriptionRequired: false,
    stock: 'In Stock',
    rating: 4.9
  }
];

export const MedicineOrderingModule: React.FC<MedicineOrderingModuleProps> = ({
  onAddNotification
}) => {
  // Navigation / Sub-page control state
  // 'listing' | 'search' | 'details' | 'cart' | 'checkout' | 'tracking'
  const [subPage, setSubPage] = useState<'listing' | 'search' | 'details' | 'cart' | 'checkout' | 'tracking'>('listing');

  // Chosen pharmacy
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy>(PHARMACIES_DATA[0]);

  // Search parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Chosen medicine for detail state
  const [detailMedicine, setDetailMedicine] = useState<Medicine>(MEDICINES_DATA[0]);

  // Real shopping cart array
  const [cart, setCart] = useState<CartItem[]>([]);

  // Cart Prescription Upload slots
  const [uploadedPrescription, setUploadedPrescription] = useState<{
    name: string;
    size: string;
    objectUrl?: string;
  } | null>(null);
  const [isVerifyingPrescription, setIsVerifyingPrescription] = useState(false);
  const [prescriptionVerifySuccess, setPrescriptionVerifySuccess] = useState(false);

  // Address checkout fields
  const [checkoutName, setCheckoutName] = useState('Rohan Sharma');
  const [checkoutPhone, setCheckoutPhone] = useState('+91 98200 11223');
  const [checkoutAddress, setCheckoutAddress] = useState('Flat 402, Sea Green Apartments, Carter Road, Bandra West, Mumbai 400050');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('upi');
  const [deliveryType, setDeliveryType] = useState<'express' | 'standard'>('express');

  // Trigger file click input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Order List & Tracking States
  const [placedOrders, setPlacedOrders] = useState<Order[]>([]);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  // Auto incremental tracking simulator timer
  const trackingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter labels
  const categories = ['All', 'Antibiotics', 'Fever & Pain', 'Acidity & Digestion', 'Allergy & Cold', 'Cardiac & Blood Pressure', 'Vitamins & Wellness'];

  // Initialize order tracking sample if empty for fallback view checks
  useEffect(() => {
    // If we have an active order tracked, simulate steps progression to show real action!
    if (activeTrackingOrder && activeTrackingOrder.status !== 'delivered') {
      trackingTimerRef.current = setInterval(() => {
        setPlacedOrders(prevOrders => {
          return prevOrders.map(ord => {
            if (ord.id === activeTrackingOrder.id) {
              const currentStep = ord.trackingStep;
              if (currentStep < 4) {
                const nextStep = currentStep + 1;
                let nextStatus: Order['status'] = 'confirmed';
                if (nextStep === 1) nextStatus = 'confirmed';
                if (nextStep === 2) nextStatus = 'dispensing';
                if (nextStep === 3) nextStatus = 'out_for_delivery';
                if (nextStep === 4) nextStatus = 'delivered';

                const updated = {
                  ...ord,
                  trackingStep: nextStep,
                  status: nextStatus
                };
                
                // Update active representation too
                setTimeout(() => {
                  setActiveTrackingOrder(updated);
                }, 100);

                // Notify user
                if (onAddNotification) {
                  const milestones = [
                    'Prescription reviewed and approved.',
                    'Order packed at local pharmacy shelf.',
                    'Delivery executive Mohan Kumar has gathered your pharmacy parcel.',
                    'Order safely delivered to Carter Road residence. Keep wellness safe!'
                  ];
                  onAddNotification({
                    id: `n-order-${Date.now()}`,
                    title: `Order #${ord.id.slice(0, 8).toUpperCase()} Update`,
                    text: milestones[currentStep],
                    time: 'Just now',
                    unread: true,
                    type: nextStep === 4 ? 'success' : 'info'
                  });
                }

                return updated;
              }
            }
            return ord;
          });
        });
      }, 12000); // Progress milestone step every 12 seconds
    }

    return () => {
      if (trackingTimerRef.current) clearInterval(trackingTimerRef.current);
    };
  }, [activeTrackingOrder]);

  // Cart operations
  const handleAddToCart = (med: Medicine, qty: number = 1) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.medicine.id === med.id && item.pharmacy.id === selectedPharmacy.id);
      if (existingIdx > -1) {
        const update = [...prev];
        update[existingIdx].quantity += qty;
        return update;
      }
      return [...prev, { medicine: med, quantity: qty, pharmacy: selectedPharmacy }];
    });

    if (onAddNotification) {
      onAddNotification({
        id: `n-cart-${Date.now()}`,
        title: 'Added to Cart',
        text: `"${med.name}" has been placed in your active drug basket from ${selectedPharmacy.name}.`,
        time: 'Just Now',
        unread: false,
        type: 'success'
      });
    }
  };

  const handleUpdateCartQty = (medId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.medicine.id === medId) {
          const targetQty = item.quantity + delta;
          return { ...item, quantity: Math.max(1, targetQty) };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const handleRemoveFromCart = (medId: string) => {
    setCart(prev => prev.filter(item => item.medicine.id !== medId));
  };

  // Prescription files dropper simulator
  const handleTriggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handlePrescriptionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedPrescription({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`
    });

    setIsVerifyingPrescription(true);
    setPrescriptionVerifySuccess(false);

    // Simulate AI smart diagnostic scanning trigger OCR
    setTimeout(() => {
      setIsVerifyingPrescription(false);
      setPrescriptionVerifySuccess(true);
      if (onAddNotification) {
        onAddNotification({
          id: `n-ocr-${Date.now()}`,
          title: 'Prescription Scanned',
          text: `Verified digital clinical signature on upload: "${file.name}". Required elements found.`,
          time: 'Just now',
          unread: true,
          type: 'success'
        });
      }
    }, 2000);
  };

  // Calculate cart metrics
  const getCartTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.medicine.price * item.quantity), 0);
    const deliveryFee = subtotal > 350 ? 0 : 35;
    const discount = Math.round(subtotal * 0.15); // Flat 15% discount for digital healthcare premium members
    const total = subtotal + deliveryFee - discount;
    return { subtotal, deliveryFee, discount, total };
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const { subtotal, deliveryFee, discount, total } = getCartTotals();
    const orderId = `med-ord-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: orderId,
      pharmacy: selectedPharmacy,
      items: [...cart],
      subtotal,
      deliveryFee,
      discount,
      total,
      status: uploadedPrescription ? 'confirmed' : 'pending_prescription',
      customerName: checkoutName,
      phone: checkoutPhone,
      deliveryAddress: checkoutAddress,
      prescriptionAttached: uploadedPrescription || undefined,
      trackingStep: uploadedPrescription ? 1 : 0,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setPlacedOrders(prev => [newOrder, ...prev]);
    setActiveTrackingOrder(newOrder);
    setCart([]); // Reset basket
    setSubPage('tracking');

    if (onAddNotification) {
      onAddNotification({
        id: `n-place-${Date.now()}`,
        title: 'Order Placed successfully',
        text: `Your medical consignment #${orderId.toUpperCase()} is registered at ${selectedPharmacy.name}.`,
        time: 'Just now',
        unread: true,
        type: 'success'
      });
    }
  };

  // Filter medicines by search query and category
  const filteredMedicines = MEDICINES_DATA.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          med.composition.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          med.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || med.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="medicine-ordering-module-view" className="space-y-6">
      
      {/* Module Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/10">
            <Lucide.Pill className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              Premium Medicine Delivery <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">15% Off Members</span>
            </h2>
            <p className="text-xs text-slate-550 dark:text-slate-400">Secure digital chemist counter with certified pharmacists near Carter Road.</p>
          </div>
        </div>

        {/* Dynamic Nav-tabs pill stack in header */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSubPage('listing')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-1.5 ${
              subPage === 'listing'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-650 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800'
            }`}
          >
            <Lucide.MapPin className="w-3.5 h-3.5" /> Pharmacies
          </button>
          
          <button
            onClick={() => setSubPage('search')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-1.5 ${
              subPage === 'search' || subPage === 'details'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-650 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800'
            }`}
          >
            <Lucide.Search className="w-3.5 h-3.5" /> Search Catalog
          </button>

          <button
            onClick={() => setSubPage('cart')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition cursor-pointer relative flex items-center gap-1.5 ${
              subPage === 'cart'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-650 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800'
            }`}
          >
            <Lucide.ShoppingBag className="w-3.5 h-3.5" /> My Cart
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
                {cart.reduce((s, c) => s + c.quantity, 0)}
              </span>
            )}
          </button>

          {placedOrders.length > 0 && (
            <button
              onClick={() => {
                if (!activeTrackingOrder && placedOrders.length > 0) {
                  setActiveTrackingOrder(placedOrders[0]);
                }
                setSubPage('tracking');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-1.5 ${
                subPage === 'tracking'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-650 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800'
              }`}
            >
              <Lucide.Truck className="w-3.5 h-3.5" /> Track order
            </button>
          )}
        </div>
      </div>

      {/* Main page state dispatcher */}
      <div className="min-h-[500px]">
        
        {/* ========================================================
            PAGE 1: PHARMACY LISTING (Nearby Apothecaries Map + Cards)
            ======================================================== */}
        {subPage === 'listing' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Pharmacy List column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-sm font-black uppercase text-slate-500 dark:text-slate-350 flex items-center gap-1">
                    <Lucide.Navigation className="w-4 h-4 text-emerald-500" /> Apothecaries Near You
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-405">Showing accredited pharmacies authorized to dispense scheduled medicine formulas.</p>
                </div>
                <div className="p-0.5 bg-slate-100/80 dark:bg-slate-805 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex gap-1">
                  <span className="px-2 py-1 bg-white dark:bg-slate-900 text-[10px] font-black text-slate-750 dark:text-slate-200 rounded-lg shadow-sm">GPS Active</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {PHARMACIES_DATA.map((pharm) => {
                  const isSelected = selectedPharmacy.id === pharm.id;
                  const cartCountFromThisPharm = cart.filter(c => c.pharmacy.id === pharm.id).length;

                  return (
                    <div
                      key={pharm.id}
                      onClick={() => setSelectedPharmacy(pharm)}
                      className={`p-5 rounded-3xl border transition cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                        isSelected
                          ? 'bg-gradient-to-br from-blue-50/40 via-white to-white border-blue-600 shadow-md ring-2 ring-blue-50 dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900 dark:border-blue-500 dark:ring-blue-950/40'
                          : 'bg-white border-slate-200 hover:border-slate-350 hover:shadow-xs dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center border transition ${
                          isSelected ? 'bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-950/45 dark:border-blue-900 dark:text-blue-300' : 'bg-slate-50 border-slate-150 text-slate-550 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                        }`}>
                          <Lucide.Hospital className="w-6 h-6" />
                        </div>
                        <div className="space-y-1 text-left">
                          <h4 className="font-black text-slate-800 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-1.5 flex-wrap">
                            {pharm.name}
                            {isSelected && (
                              <span className="text-[9px] bg-blue-100 dark:bg-blue-105 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-0.5">
                                <Lucide.CheckCircle2 className="w-3 h-3" /> Selected Partner
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-relaxed font-medium">{pharm.address}</p>
                          
                          {/* Pharmacy badges */}
                          <div className="flex gap-2.5 items-center flex-wrap pt-1 select-none">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-450 font-mono flex items-center gap-0.5">
                              <Lucide.Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> {pharm.rating} ({pharm.reviews} ratings)
                            </span>
                            <span className="text-slate-250 dark:text-slate-700">&#8226;</span>
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 font-mono">
                              {pharm.distance} Away
                            </span>
                            <span className="text-slate-250 dark:text-slate-700">&#8226;</span>
                            <span className={`text-[9.5px] font-black px-1.5 py-0.5 rounded border uppercase tracking-tight ${
                              pharm.status === 'Open 24/7'
                                ? 'bg-emerald-50 border-emerald-150 text-emerald-700 font-mono dark:bg-emerald-950/30 dark:border-emerald-800/40 dark:text-emerald-400'
                                : 'bg-blue-50 border-blue-150 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800/40 dark:text-blue-400'
                            }`}>
                              {pharm.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right button container */}
                      <div className="sm:self-center flex flex-col gap-1 items-end w-full sm:w-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPharmacy(pharm);
                            setSubPage('search');
                          }}
                          className={`w-full sm:w-auto py-2 px-4 rounded-xl text-xs font-black tracking-tight transition cursor-pointer flex items-center justify-center gap-1Shadow ${
                            isSelected
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-250'
                          }`}
                        >
                          <Lucide.Search className="w-3.5 h-3.5" /> Search Drugs
                        </button>
                        {cartCountFromThisPharm > 0 ? (
                          <span className="text-[9.5px] font-black text-rose-600">
                            {cartCountFromThisPharm} item(s) in basket
                          </span>
                        ) : (
                          <span className="text-[9.5px] text-slate-450 dark:text-slate-500 font-bold">Standard dispatch enabled</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Simulated Live delivery coverage Map column */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-250 dark:border-slate-800 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5 flex flex-col text-left">
                <span className="text-[10px] bg-slate-900 dark:bg-slate-950 text-emerald-400 font-mono uppercase px-2.5 py-1 rounded-md tracking-wider font-extrabold inline-block self-start">
                  GPS COVERAGE GRID active
                </span>
                <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm leading-tight flex items-center gap-1.5">
                  <Lucide.Globe className="w-5 h-5 text-blue-500 animate-spin" /> Live Express Radios
                </h4>
                <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                  Pharmacist dispatch times to <strong>Carter Road, Bandra West</strong> are optimized for fast delivery.
                </p>
              </div>

              {/* Graphical Pharmacy Map layout */}
              <div className="bg-slate-200 dark:bg-slate-950 aspect-video rounded-3xl overflow-hidden relative border border-slate-300 dark:border-slate-800 shadow-inner group flex items-center justify-center select-none h-44">
                <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                  
                  {/* Grid layout mock roads */}
                  <div className="absolute top-1/2 left-0 right-0 h-4 bg-slate-200 dark:bg-slate-900/60" />
                  <div className="absolute left-1/3 top-0 bottom-0 w-4 bg-slate-200 dark:bg-slate-900/60" />
                  <div className="absolute left-2/3 top-0 bottom-0 w-4 bg-slate-200 dark:bg-slate-900/60" />

                  {/* Patient Pin */}
                  <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                    <span className="bg-blue-600 text-white rounded-lg px-2 py-0.5 text-[8.5px] font-black uppercase text-center shadow whitespace-nowrap">
                      My Residence
                    </span>
                    <div className="w-7 h-7 bg-blue-100 dark:bg-blue-950 rounded-full border-2 border-blue-600 flex items-center justify-center shadow-lg relative mt-1">
                      <Lucide.Home className="w-3.5 h-3.5 text-blue-700 dark:text-blue-300" />
                      <span className="absolute -inset-1 rounded-full border border-blue-500 animate-ping opacity-75" />
                    </div>
                  </div>

                  {/* Selected Pharmacy Pin */}
                  <div className="absolute bottom-1/4 left-1/4 transform z-10 flex flex-col items-center">
                    <span className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-0.5 text-[8px] font-black uppercase text-center shadow whitespace-nowrap leading-tight">
                      {selectedPharmacy.name.split(' ')[0]} (Active)
                    </span>
                    <div className="w-6 h-6 bg-emerald-150 dark:bg-emerald-950/40 rounded-full border border-emerald-600 dark:border-emerald-800 flex items-center justify-center shadow mt-1">
                      <Lucide.Hospital className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
                    </div>
                  </div>

                  {/* Rest Pharmacies */}
                  {PHARMACIES_DATA.filter(p => p.id !== selectedPharmacy.id).map((p, idx) => (
                    <div key={p.id} className="absolute z-10 opacity-60" style={{ right: `${20 + idx * 30}%`, bottom: `${35 + idx * 20}%` }}>
                      <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-full border border-slate-400 dark:border-slate-700 flex items-center justify-center" title={p.name}>
                        <Lucide.Hospital className="w-2.5 h-2.5 text-slate-650 dark:text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Pharmacy metrics recap */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-left">
                <span className="text-[9.5px] font-black uppercase text-blue-600 dark:text-blue-400 font-mono tracking-wider">Fast Dispatch Information For Selected Pharmacy</span>
                <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-100">{selectedPharmacy.name}</h5>
                <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                  <div className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                    <span className="text-slate-400 dark:text-slate-500 font-bold block">Delivery Time</span>
                    <p className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Lucide.Zap className="w-3.5 h-3.5 text-amber-500" /> 15-25 Mins
                    </p>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                    <span className="text-slate-400 dark:text-slate-500 font-bold block">Home Service</span>
                    <p className="font-black text-emerald-700 dark:text-emerald-400">
                      {selectedPharmacy.hasHomeDelivery ? 'Available' : 'Self-Pickup'}
                    </p>
                  </div>
                </div>
                <div className="pt-2 text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
                  Direct hotline support: <a href={`tel:${selectedPharmacy.phone}`} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">{selectedPharmacy.phone}</a>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            PAGE 2 & 3: MEDICINE SEARCH & DETAIL COMBINED VIEW
            ======================================================== */}
        {(subPage === 'search' || subPage === 'details') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            
            {/* Catalog list block */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Filter tags header */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Lucide.Search className="w-4 h-4 text-slate-400 absolute top-3.5 left-3.5" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 rounded-2xl text-xs font-semibold shadow-2xs placeholder-slate-400 dark:placeholder-slate-500"
                      placeholder={`Search drug category, molecular compound, or brand name at ${selectedPharmacy.name}...`}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <Lucide.X className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Categories Carousel */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 select-none scrollbar-thin">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-xl font-black text-[10.5px] border cursor-pointer transition shrink-0 uppercase tracking-tight ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-950 dark:border-slate-100'
                          : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Medicines cards list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence>
                  {filteredMedicines.map((med) => {
                    const isSelectedDetail = detailMedicine.id === med.id && subPage === 'details';
                    const itemsInCart = cart.find(c => c.medicine.id === med.id);

                    return (
                      <div
                        key={med.id}
                        onClick={() => {
                          setDetailMedicine(med);
                          setSubPage('details');
                        }}
                        className={`p-4.5 rounded-3xl border text-left transition relative cursor-pointer flex flex-col justify-between ${
                          isSelectedDetail
                            ? 'bg-gradient-to-br from-indigo-50/40 via-white to-white border-indigo-600 shadow-sm ring-2 ring-indigo-50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 dark:border-indigo-500 dark:ring-indigo-950/40'
                            : 'bg-white border-slate-200 hover:border-slate-350 hover:shadow-xs dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            {/* Rx Required tag */}
                            {med.prescriptionRequired ? (
                              <span className="text-[8.5px] font-black uppercase bg-rose-50 border border-rose-150 text-rose-700 px-2 py-0.5 rounded tracking-wider flex items-center gap-0.5 dark:bg-rose-955 dark:bg-rose-950/40 dark:border-rose-900/40 dark:text-rose-450 dark:text-rose-400">
                                <Lucide.FileText className="w-3 h-3" /> Rx Required
                              </span>
                            ) : (
                              <span className="text-[8.5px] font-bold uppercase bg-slate-100 border border-slate-150 text-slate-500 px-2 py-0.5 rounded tracking-wider dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                                General Well
                              </span>
                            )}

                            <span className="text-[10px] bg-slate-50 border border-slate-150 rounded-lg px-2 py-0.5 text-slate-550 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 font-bold">
                              {med.stock}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-black text-slate-850 dark:text-slate-100 text-xs sm:text-sm tracking-tight leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {med.name}
                            </h4>
                            <p className="text-[10.5px] text-slate-450 dark:text-slate-400 line-clamp-1 italic font-mono leading-none">
                              {med.composition}
                            </p>
                          </div>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {med.description}
                          </p>
                        </div>

                        <div className="border-t border-slate-100/80 dark:border-slate-800 pt-3 mt-3 flex justify-between items-center gap-2">
                          <div>
                            <span className="text-[9.5px] text-slate-400 dark:text-slate-505 dark:text-slate-500 font-bold block leading-none">Price per Unit</span>
                            <span className="text-sm font-black text-slate-800 dark:text-slate-200">₹{med.price}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {itemsInCart ? (
                              <div className="flex items-center bg-blue-50 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-900 rounded-xl px-1.5 py-0.5 gap-2" onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={() => handleUpdateCartQty(med.id, -1)}
                                  className="w-5 h-5 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-black rounded-lg border border-blue-150 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-955 active:scale-95 transition flex items-center justify-center text-xs"
                                >
                                  -
                                </button>
                                <span className="text-[11px] font-black text-blue-800 dark:text-blue-300 font-mono w-4 text-center">
                                  {itemsInCart.quantity}
                                </span>
                                <button
                                  onClick={() => handleUpdateCartQty(med.id, 1)}
                                  className="w-5 h-5 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-black rounded-lg border border-blue-150 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-955 active:scale-95 transition flex items-center justify-center text-xs"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(med);
                                }}
                                disabled={med.stock === 'Out of Stock'}
                                className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 text-white font-extrabold text-[11px] rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1"
                              >
                                <Lucide.Plus className="w-3.5 h-3.5" /> Buy
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </AnimatePresence>
                
                {filteredMedicines.length === 0 && (
                  <div className="col-span-full py-12 p-6 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <Lucide.ShoppingBag className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-800">No matching pharmaceuticals found</h5>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Please inspect spelling for molecules or browse other therapeutic categories in the tabs list.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Medicine Detail View (Dynamic Sidebar Panel) */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-250 dark:border-slate-800 p-6 shadow-xs sticky top-4 text-left space-y-5">
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 font-black tracking-wider px-2.5 py-1 rounded-md text-slate-650 dark:text-slate-300 inline-block">
                    {detailMedicine.category}
                  </span>
                  
                  <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                    <Lucide.Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> {detailMedicine.rating} Score
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-850 dark:text-slate-100 tracking-tight leading-tight">{detailMedicine.name}</h3>
                  <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-black">{detailMedicine.composition}</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-tight font-bold">Mfg: {detailMedicine.manufacturer}</p>
                </div>

                <div className="border-t border-b border-slate-100 dark:border-slate-800 py-4 space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">Active Therapeutic description</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">{detailMedicine.description}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10.5px] font-bold text-slate-400 dark:text-slate-505 dark:text-slate-550 uppercase tracking-tight">Standard Clinical Dose</span>
                    <p className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 dark:text-emerald-450 dark:bg-emerald-950/20 dark:border-emerald-900/40 p-2 rounded-xl flex items-center gap-1.5 font-bold">
                      <Lucide.Clock className="w-4 h-4 text-emerald-600 shrink-0" /> {detailMedicine.dosage}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">Cautions & Side Effects</span>
                    <ul className="grid grid-cols-1 gap-1.5">
                      {detailMedicine.sideEffects.map((eff, i) => (
                        <li key={i} className="text-[10.5px] text-slate-550 dark:text-slate-300 flex items-center gap-1.5 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          {eff}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Price and Add button section */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-4.5 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block leading-none pb-0.5">Therapeutic Price Pack</span>
                    <span className="text-base font-black text-slate-800 dark:text-slate-200">₹{detailMedicine.price} <span className="text-[9.5px] text-slate-450 dark:text-slate-500 font-normal">/ Strip</span></span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(detailMedicine, 1)}
                    disabled={detailMedicine.stock === 'Out of Stock'}
                    className="py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 shrink-0"
                  >
                    <Lucide.ShoppingBag className="w-4 h-4" /> Add To Cart
                  </button>
                </div>

                {/* Clinical verification pledge */}
                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-150 dark:border-blue-900 rounded-xl flex items-start gap-2 text-[10px] text-blue-800 dark:text-blue-300 leading-relaxed">
                  <Lucide.ShieldCheck className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <span>Prescription mandatory medications will be marked for pharmacist audit during final validation stages. Upload a valid medical certificate before checking out.</span>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================
            PAGE 4: SHOPPING CART (With prescription dropzone & OTC items)
            ======================================================== */}
        {subPage === 'cart' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            
            {/* Basket items recap */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-550 dark:text-slate-350 flex items-center gap-1.5">
                <Lucide.ShoppingBag className="w-4 h-4 text-emerald-500" /> Pharmacy Active Basket
              </h3>
              
              {cart.length === 0 ? (
                <div className="py-12 p-6 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-3xl space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-955 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                    <Lucide.ShoppingCart className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Your medical cart sits empty</h4>
                    <p className="text-xs text-slate-450 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Please head back to Pharmacies list or the main Search drug store catalog to select prescribed compounds.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubPage('search')}
                    className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow transition cursor-pointer"
                  >
                    Browse Diagnostics Medicines
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.medicine.id}
                      className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-xs transition"
                    >
                      <div className="flex gap-3.5">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-slate-950 border border-indigo-150 dark:border-indigo-900 rounded-xl flex items-center justify-center text-indigo-700 dark:text-indigo-300 shrink-0">
                          <Lucide.Pill className="w-5 h-5" />
                        </div>
                        <div className="space-y-1 text-left">
                          <h4 className="font-black text-slate-800 dark:text-slate-100 text-xs sm:text-sm tracking-tight">{item.medicine.name}</h4>
                          <span className="text-[10px] text-slate-450 dark:text-slate-400 block leading-tight font-mono">{item.medicine.composition}</span>
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block">Source: {item.pharmacy.name}</span>
                        </div>
                      </div>

                      {/* Controls and prices */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-0 pt-2 sm:pt-0 dark:border-slate-800">
                        {/* Quantity controls */}
                        <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl px-2 py-1 gap-2.5">
                          <button
                            onClick={() => handleUpdateCartQty(item.medicine.id, -1)}
                            className="w-6 h-6 bg-white dark:bg-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-855 font-black rounded-lg border border-slate-200 dark:border-slate-700 transition flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className="text-xs font-black text-slate-850 dark:text-slate-100 font-mono w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateCartQty(item.medicine.id, 1)}
                            className="w-6 h-6 bg-white dark:bg-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-855 font-black rounded-lg border border-slate-200 dark:border-slate-700 transition flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>

                        {/* Price sum and action */}
                        <div className="text-right flex items-center gap-4">
                          <div>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block leading-none">Subtotal</span>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200">₹{item.medicine.price * item.quantity}</span>
                          </div>

                          <button
                            onClick={() => handleRemoveFromCart(item.medicine.id)}
                            className="text-slate-405 dark:text-slate-500 hover:text-rose-600 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                          >
                            <Lucide.Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* OTC Health companion list trigger helper */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-slate-350 font-bold flex items-center gap-1.5">
                      <Lucide.PlusCircle className="w-5 h-5 text-emerald-600" /> Need more general wellness wellness products?
                    </span>
                    <button
                      onClick={() => setSelectedCategory('Vitamins & Wellness')}
                      className="text-blue-600 dark:text-blue-400 font-black hover:underline"
                    >
                      Browse Wellness
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Prescription upload area and Cart price checklist summary column */}
            <div className="lg:col-span-5 space-y-4 text-left">
              
              {/* Prescription verification zone */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-250 dark:border-slate-800 p-6 space-y-4 shadow-3xs">
                <div>
                  <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm leading-tight flex items-center gap-1.5">
                    <Lucide.FileBadge className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Secure Doctor Prescription
                  </h4>
                  <p className="text-[11px] text-slate-455 mt-1 leading-relaxed dark:text-slate-400">
                    Some items in your drug list may contain scheduled pharmaceutical components requiring valid validation.
                  </p>
                </div>

                {/* Upload drag drop panel */}
                <div
                  onClick={handleTriggerFileSelect}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition select-none flex flex-col justify-center items-center gap-2 ${
                    uploadedPrescription 
                      ? 'bg-blue-50/20 border-blue-400 dark:bg-blue-950/25 dark:border-blue-500' 
                      : 'border-slate-250 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50/50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf, .png, .jpg, .jpeg"
                    className="hidden"
                    onChange={handlePrescriptionFileChange}
                  />

                  {uploadedPrescription ? (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center mx-auto">
                        <Lucide.FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 truncate max-w-sm">{uploadedPrescription.name}</h5>
                        <p className="text-[10px] text-slate-450 dark:text-slate-500 font-mono italic">{uploadedPrescription.size}</p>
                      </div>

                      {/* Status indicator */}
                      {isVerifyingPrescription ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded font-bold font-mono">
                          <Lucide.Loader2 className="w-3.5 h-3.5 animate-spin" /> Smart Checking AI Signature...
                        </span>
                      ) : prescriptionVerifySuccess ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-150 dark:border-emerald-900 px-2 py-0.5 rounded font-black font-mono">
                          ✔ Verified & Autocompleted
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                        <Lucide.Upload className="w-5 h-5 text-slate-550 dark:text-slate-400" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-700 dark:text-slate-200 block">Upload prescription</span>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-xs mt-0.5">
                          Drag file here or tap to select PDF, PNG, or JPEG. Includes instant clinical AI scanner check.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {uploadedPrescription && (
                  <button
                    onClick={() => {
                      setUploadedPrescription(null);
                      setPrescriptionVerifySuccess(false);
                    }}
                    className="w-full text-center py-1.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                  >
                    Remove File
                  </button>
                )}
              </div>

              {/* Price summary card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-250 dark:border-slate-800 p-6 space-y-4 shadow-3xs">
                <h4 className="font-black text-slate-800 dark:text-slate-105 text-sm">Receipt Summary</h4>
                
                {cart.length > 0 ? (
                  <div className="space-y-3.5">
                    <div className="space-y-2 text-xs border-b border-slate-100 dark:border-slate-805 pb-3">
                      <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 font-semibold">
                        <span>Items Price Subtotal</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">₹{getCartTotals().subtotal}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500 dark:text-slate-405 font-semibold">
                        <span>Express Delivery Surcharge</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {getCartTotals().deliveryFee === 0 ? <span className="text-emerald-600 font-extrabold uppercase">Free</span> : `₹${getCartTotals().deliveryFee}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500 dark:text-slate-405 font-semibold">
                        <span>Locker Member Discount <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-805 dark:text-emerald-400 px-1.5 py-0.2 rounded font-black font-mono">15%</span></span>
                        <span className="font-black text-emerald-700 dark:text-emerald-450">-₹{getCartTotals().discount}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm font-black text-slate-855 dark:text-slate-100">
                      <span>Grand Total</span>
                      <span className="text-base text-blue-700 dark:text-blue-450 font-mono font-black">₹{getCartTotals().total}</span>
                    </div>

                    <button
                      onClick={() => setSubPage('checkout')}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-xl shadow-blue-500/10 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Proceed to Checkout <Lucide.ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-550 italic">Configure items in basket to fetch checkout prices.</p>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ========================================================
            PAGE 5: CHECKOUT PAGE
            ======================================================== */}
        {subPage === 'checkout' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-left">
            
            {/* Payment address form */}
            <div className="lg:col-span-7 space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
              <h3 className="text-base font-black text-slate-850 dark:text-slate-100 tracking-tight flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Lucide.ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Secure Order Dispatch Verification
              </h3>

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                
                {/* Visual select field between Standard home dispatch vs self pickup */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-650 dark:text-slate-400">Medicine Fulfillment Channel</label>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div
                      onClick={() => setDeliveryType('express')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                        deliveryType === 'express'
                          ? 'bg-blue-50/40 border-blue-600 dark:border-blue-500 shadow-3xs ring-2 ring-blue-50 dark:ring-blue-900/30'
                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="mt-0.5">
                        <input type="radio" checked={deliveryType === 'express'} readOnly className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-800 dark:text-slate-100 tracking-tight block">Home Express Courier</span>
                        <span className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5 block leading-relaxed">Delivered directly to Carter Road within 25 minutes.</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setDeliveryType('standard')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                        deliveryType === 'standard'
                          ? 'bg-blue-50/40 border-blue-600 dark:border-blue-500 shadow-3xs ring-2 ring-blue-50 dark:ring-blue-900/30'
                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="mt-0.5">
                        <input type="radio" checked={deliveryType === 'standard'} readOnly className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-800 dark:text-slate-100 tracking-tight block">Pharmacy Self-Pickup</span>
                        <span className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5 block leading-relaxed">Reserve package at counters immediately to collect on your commute.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">Patient Active Name</label>
                    <input
                      type="text"
                      required
                      value={checkoutName}
                      onChange={e => setCheckoutName(e.target.value)}
                      placeholder="e.g. Rohan Sharma"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">Active Mobile Number (For dispatch alerts)</label>
                    <input
                      type="tel"
                      required
                      value={checkoutPhone}
                      onChange={e => setCheckoutPhone(e.target.value)}
                      placeholder="e.g. +91 98320 12091"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-955 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                {deliveryType === 'express' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-650 dark:text-slate-400">Delivery Resident Address</label>
                    <textarea
                      rows={2}
                      required
                      value={checkoutAddress}
                      onChange={e => setCheckoutAddress(e.target.value)}
                      placeholder="Input complete address details with landmark for delivery rider..."
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 resize-none animate-none"
                    />
                  </div>
                )}

                {/* Gateway channels */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-650 dark:text-slate-400">Select Checkout gateway Mode</label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3 rounded-xl border font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                        paymentMethod === 'upi'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300'
                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <Lucide.Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> UPI / Scanner
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                        paymentMethod === 'card'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300'
                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <Lucide.CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Debit / Visa Card
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-xl border font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                        paymentMethod === 'cod'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300'
                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <Lucide.HandCoins className="w-5 h-5 text-amber-600 dark:text-amber-400" /> Cash of Delivery
                    </button>
                  </div>
                </div>

                <div className="text-[10px] text-slate-450 dark:text-slate-400 flex items-start gap-1 pb-1">
                  <Lucide.Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Payments encrypted end-to-end (PCI DSS conformant). Verified pharmacists check credentials before medicine dispatch cycles.</span>
                </div>

                {/* Submit button layout */}
                <div className="flex gap-2.5 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSubPage('cart')}
                    className="px-4.5 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                  >
                    Adjust Basket
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer"
                  >
                    Authorize and Place Order
                  </button>
                </div>

              </form>
            </div>

            {/* Price details checklist right pane */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-6 rounded-3xl space-y-4">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3 text-left">
                  <span className="text-[10px] bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 font-mono font-bold px-2 py-0.5 rounded tracking-wide uppercase">Confirm Store Details</span>
                  <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 mt-2">Drawn from {selectedPharmacy.name}</h5>
                  <p className="text-[10.5px] text-slate-450 dark:text-slate-400 leading-relaxed font-semibold mt-0.2">{selectedPharmacy.address}</p>
                </div>

                {/* Short items summary list */}
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.medicine.id} className="flex justify-between items-center text-xs">
                      <div className="text-left font-medium max-w-[70%]">
                        <p className="font-bold text-slate-850 dark:text-slate-100 text-[11px] truncate leading-tight">{item.medicine.name}</p>
                        <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-mono">₹{item.medicine.price} x {item.quantity}</span>
                      </div>
                      <span className="font-black text-slate-800 dark:text-slate-200 font-mono text-[11.5px]">₹{item.medicine.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Subsidies and Grand Total */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-3.5 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400 font-semibold">
                    <span>Items Total Price</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">₹{getCartTotals().subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400 font-semibold">
                    <span>Discount Benefits</span>
                    <span className="font-black text-emerald-700 dark:text-emerald-400">-₹{getCartTotals().discount}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-405 font-semibold border-b border-slate-200/55 dark:border-slate-800 pb-2.5">
                    <span>Delivery Charge</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">₹{getCartTotals().deliveryFee}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-black text-slate-850 dark:text-slate-100 pt-1">
                    <span>Total Bill Sum</span>
                    <span className="text-sm text-indigo-755 text-indigo-700 dark:text-indigo-400 font-mono font-black">₹{getCartTotals().total}</span>
                  </div>
                </div>

                {/* Highlight Prescription uploaded metadata attachment */}
                {cart.some(c => c.medicine.prescriptionRequired) && (
                  <div className={`p-3 rounded-2xl text-[10.5px] leading-relaxed border flex items-start gap-2.5 font-semibold ${
                    uploadedPrescription 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-150 dark:border-emerald-900/30 text-emerald-805 dark:text-emerald-300' 
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-150 dark:border-rose-900/30 text-rose-805 dark:text-rose-300'
                  }`}>
                    {uploadedPrescription ? (
                      <>
                        <Lucide.CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                          <p className="font-bold">Prescription Linked Successfully</p>
                          <span className="text-[9.5px] text-slate-450 dark:text-slate-500 block font-mono">{uploadedPrescription.name} Attached.</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Lucide.AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-450 shrink-0" />
                        <div>
                          <p className="font-bold text-rose-700 dark:text-rose-300">Missing Medical Prescription Slip</p>
                          <span className="text-[9.5px] text-slate-450 dark:text-slate-550 block font-medium">Please return to basket to append your certificate to secure hassle-free chemist clearance.</span>
                        </div>
                      </>
                    )}
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* ========================================================
            PAGE 6: ORDER TRACKING PAGE (With dynamic timeline and leaflet simulator)
            ======================================================== */}
        {subPage === 'tracking' && activeTrackingOrder && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-left">
            
            {/* Timeline Progress Tracker Stepper Grid */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
              
              <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 flex-wrap">
                <div>
                  <span className="text-[10px] uppercase font-mono font-extrabold bg-blue-150 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded tracking-wide">
                    Live Tracking Enabled
                  </span>
                  <h3 className="font-black text-slate-850 dark:text-slate-150 text-base mt-2">Order Tracking: #{activeTrackingOrder.id.slice(8).toUpperCase()}</h3>
                  <p className="text-[11px] text-slate-455 dark:text-slate-400">Fulfillment point: <strong>{activeTrackingOrder.pharmacy.name}</strong></p>
                </div>

                <div className="text-right">
                  <span className="text-[10.5px] text-slate-400 dark:text-slate-500 font-bold block leading-semibold">Estimated Arrival Time</span>
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400 font-mono">18 Minutes</span>
                </div>
              </div>

              {/* Graphical Tracking Stepper timeline */}
              <div className="relative pl-8 space-y-6 border-l-2 border-slate-200 dark:border-slate-800 ml-4 py-2 select-none">
                
                {/* Step 1: Confirmed */}
                <div className="relative">
                  <span className={`absolute -left-[41px] top-0.5 w-6 h-6 rounded-full border-4 flex items-center justify-center text-white ${
                    activeTrackingOrder.trackingStep >= 0
                      ? 'bg-emerald-500 border-emerald-100'
                      : 'bg-slate-200 border-slate-50'
                  }`}>
                    {activeTrackingOrder.trackingStep > 0 ? '✔' : ''}
                  </span>
                  <div className="space-y-0.5">
                    <h5 className={`text-xs font-black tracking-tight ${activeTrackingOrder.trackingStep >= 0 ? 'text-slate-800 dark:text-slate-100 font-extrabold' : 'text-slate-400 dark:text-slate-500'}`}>
                      Order Handshake Confirmed
                    </h5>
                    <p className="text-[10.5px] text-slate-400 dark:text-slate-405 font-medium">Chemists registered your medicine consignment list correctly. Time: {activeTrackingOrder.createdAt}</p>
                  </div>
                </div>

                {/* Step 2: Prescription Verified */}
                <div className="relative">
                  <span className={`absolute -left-[41px] top-0.5 w-6 h-6 rounded-full border-4 flex items-center justify-center text-white ${
                    activeTrackingOrder.trackingStep >= 1
                      ? 'bg-emerald-500 border-emerald-100'
                      : 'bg-slate-200 border-slate-50'
                  }`}>
                    {activeTrackingOrder.trackingStep > 1 ? '✔' : ''}
                  </span>
                  <div className="space-y-0.5">
                    <h5 className={`text-xs font-black tracking-tight ${activeTrackingOrder.trackingStep >= 1 ? 'text-slate-800 dark:text-slate-100 font-extrabold' : 'text-slate-400 dark:text-slate-500'}`}>
                      Prescription Audited & Approved
                    </h5>
                    <p className="text-[10.5px] text-slate-400 dark:text-slate-405 font-medium">
                      {activeTrackingOrder.prescriptionAttached 
                        ? `Digital signature audited correctly: "${activeTrackingOrder.prescriptionAttached.name}"`
                        : 'No Rx checks required. Passed on-line general eligibility.'}
                    </p>
                  </div>
                </div>

                {/* Step 3: Dispensing */}
                <div className="relative">
                  <span className={`absolute -left-[41px] top-0.5 w-6 h-6 rounded-full border-4 flex items-center justify-center text-white ${
                    activeTrackingOrder.trackingStep >= 2
                      ? 'bg-emerald-500 border-emerald-100'
                      : 'bg-slate-200 border-slate-50'
                  }`}>
                    {activeTrackingOrder.trackingStep > 2 ? '✔' : ''}
                  </span>
                  <div className="space-y-0.5">
                    <h5 className={`text-xs font-black tracking-tight ${activeTrackingOrder.trackingStep >= 2 ? 'text-slate-800 dark:text-slate-100 font-extrabold' : 'text-slate-400 dark:text-slate-500'}`}>
                      Packed & Dispensed
                    </h5>
                    <p className="text-[10.5px] text-slate-400 dark:text-slate-405 font-medium">accrdited pharmacist sealed items in sterile insulated cold bags to avoid temperature degradation.</p>
                  </div>
                </div>

                {/* Step 4: Out for Delivery */}
                <div className="relative">
                  <span className={`absolute -left-[41px] top-0.5 w-6 h-6 rounded-full border-4 flex items-center justify-center text-white ${
                    activeTrackingOrder.trackingStep >= 3
                      ? 'bg-emerald-500 border-emerald-100 dark:border-emerald-950'
                      : 'bg-slate-200 border-slate-50 dark:bg-slate-800 dark:border-slate-900'
                  }`}>
                    {activeTrackingOrder.trackingStep > 3 ? '✔' : ''}
                  </span>
                  <div className="space-y-0.5">
                    <h5 className={`text-xs font-black tracking-tight ${activeTrackingOrder.trackingStep >= 3 ? 'text-slate-800 dark:text-slate-100 font-extrabold' : 'text-slate-400 dark:text-slate-500'}`}>
                      Out for Delivery (Rider Dispatched)
                    </h5>
                    <p className="text-[10.5px] text-slate-405 dark:text-slate-400 font-medium">Delivery executive Mohan Kumar is navigating traffic with your package. Hot-contact: +91 93200 48210</p>
                  </div>
                </div>

                {/* Step 5: Delivered */}
                <div className="relative">
                  <span className={`absolute -left-[41px] top-0.5 w-6 h-6 rounded-full border-4 flex items-center justify-center text-white ${
                    activeTrackingOrder.trackingStep >= 4
                      ? 'bg-emerald-500 border-emerald-100 dark:border-emerald-950'
                      : 'bg-slate-200 border-slate-50 dark:bg-slate-800 dark:border-slate-900'
                  }`}>
                    {activeTrackingOrder.trackingStep >= 4 ? '✔' : ''}
                  </span>
                  <div className="space-y-0.5">
                    <h5 className={`text-xs font-black tracking-tight ${activeTrackingOrder.trackingStep >= 4 ? 'text-slate-850 dark:text-slate-100 font-extrabold text-blue-700 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      Delivered Consignment Signoff
                    </h5>
                    <p className="text-[10.5px] text-slate-400 dark:text-slate-405 font-medium">Safely handed over to flat security desk. Digital confirmation completed with signature ledger.</p>
                  </div>
                </div>

              </div>

              {/* Action commands pile */}
              <div className="flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setSubPage('listing')}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black rounded-xl transition cursor-pointer"
                >
                  Order New Medicines
                </button>
                <a
                  href="tel:+919821052311"
                  className="px-4 py-2 bg-blue-100 dark:bg-blue-950/50 hover:bg-blue-200 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-extrabold rounded-xl transition flex items-center gap-1.5"
                >
                  <Lucide.PhoneCall className="w-3.5 h-3.5" /> Call Dispatch Desk
                </a>
              </div>

            </div>

            {/* Simulated leaflet delivery tracking Map */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-250 dark:border-slate-800 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <span className="text-[9.5px] font-black uppercase text-rose-600 dark:text-rose-450 font-mono tracking-wider block">Live Delivery Telemetry</span>
                <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm leading-tight flex items-center gap-1.5">
                  <Lucide.Truck className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-bounce" /> Courier Route Monitor
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Rider <strong>Mohan Kumar</strong> is driving near Bandra ocean bridge toward your residence.
                </p>
              </div>

              {/* Dynamic map display showing actual progression mock */}
              <div className="bg-slate-200 aspect-video rounded-3xl overflow-hidden relative border border-slate-300 shadow-inner flex items-center justify-center select-none h-48">
                <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100 flex items-center justify-center">
                  
                  {/* Grid system representing streets */}
                  <div className="absolute top-1/2 left-0 right-0 h-4 bg-slate-200" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-4 bg-slate-200" />
                  <div className="absolute left-1/4 top-0 bottom-0 w-4 bg-slate-200" />

                  {/* Residence block */}
                  <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center">
                    <span className="bg-blue-600 text-white rounded-lg px-2 py-0.5 text-[8.5px] font-black uppercase shadow">
                      Home (You)
                    </span>
                    <div className="w-6 h-6 bg-blue-100 rounded-full border border-blue-650 flex items-center justify-center mt-0.5 shadow-md">
                      <Lucide.Home className="w-3.5 h-3.5 text-blue-700" />
                    </div>
                  </div>

                  {/* Pharmacy location */}
                  <div className="absolute bottom-1/4 left-1/4 transform z-10 flex flex-col items-center">
                    <div className="w-5 h-5 bg-slate-300 border border-slate-450 rounded-full flex items-center justify-center shadow">
                      <Lucide.Hospital className="w-3 h-3 text-slate-700" />
                    </div>
                  </div>

                  {/* MOVING RIDER MOCK ICON */}
                  <div
                    className="absolute z-20 flex flex-col items-center transition-all duration-1000"
                    style={{
                      left: activeTrackingOrder.trackingStep === 0 ? '25%' :
                            activeTrackingOrder.trackingStep === 1 ? '30%' :
                            activeTrackingOrder.trackingStep === 2 ? '42%' :
                            activeTrackingOrder.trackingStep === 3 ? '48%' : '50%',
                      bottom: activeTrackingOrder.trackingStep === 0 ? '25%' :
                              activeTrackingOrder.trackingStep === 1 ? '35%' :
                              activeTrackingOrder.trackingStep === 2 ? '45%' :
                              activeTrackingOrder.trackingStep === 3 ? '60%' : '75%',
                    }}
                  >
                    <span className="bg-amber-600 text-white rounded-lg px-1.5 py-0.2 text-[8px] font-black uppercase shadow-sm flex items-center gap-0.5">
                      <Lucide.Bike className="w-3 h-3" /> Rider
                    </span>
                    <div className="w-6 h-6 bg-amber-100 rounded-full border-2 border-amber-650 flex items-center justify-center mt-0.5 shadow-lg">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping absolute" />
                      <Lucide.Activity className="w-3.5 h-3.5 text-amber-700" />
                    </div>
                  </div>

                </div>
              </div>

              {/* Rider quick info section */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="text-left space-y-1">
                  <span className="text-slate-400 font-bold block text-[10.5px]">Courier Buddy</span>
                  <p className="font-extrabold text-slate-800 flex items-center gap-1.5 leading-none">
                    Mohan Kumar
                  </p>
                  <p className="text-[10px] text-slate-450 italic mt-0.5">Rating: 4.95 (Super Star)</p>
                </div>

                <div className="text-left space-y-1">
                  <span className="text-slate-400 font-bold block text-[10.5px]">Transportation</span>
                  <p className="font-extrabold text-slate-800 flex items-center gap-1.5 leading-none">
                    Electric Scooter
                  </p>
                  <p className="text-[10px] text-slate-450 mt-0.5 font-mono">No carbon emission</p>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
