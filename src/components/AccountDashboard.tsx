import React, { useState, useEffect } from "react";
import { 
  User as UserIcon, 
  MapPin, 
  ClipboardList, 
  CheckCircle2, 
  ChevronRight, 
  Phone, 
  Mail, 
  Clock, 
  Bike, 
  RefreshCw, 
  Calendar, 
  ArrowLeft,
  ShieldCheck,
  Star,
  PackageCheck,
  LogIn,
  Save,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getCurrentSessionUser, SessionUser } from "../firebase";

import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Solve Vite issues with Leaflet marker assets by declaring inline divIcons with tailwind styling
const getRestaurantIcon = () => {
  if (typeof window === "undefined") return null as any;
  return L.divIcon({
    className: "custom-leaflet-restaurant-icon-wrapper",
    html: `<div class="w-10 h-10 rounded-2xl bg-slate-950 border-2 border-white shadow-md shadow-slate-900/45 flex items-center justify-center text-lg leading-none">🏪</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -10]
  });
};

const getDriverIcon = () => {
  if (typeof window === "undefined") return null as any;
  return L.divIcon({
    className: "custom-leaflet-driver-icon-wrapper",
    html: `
      <div class="relative w-11 h-11 flex items-center justify-center">
        <div class="absolute inset-0 rounded-full bg-amber-500/35 animate-ping"></div>
        <div class="relative w-10 h-10 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center text-slate-950 text-base">🛵</div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -12]
  });
};

const getUserHomeIcon = () => {
  if (typeof window === "undefined") return null as any;
  return L.divIcon({
    className: "custom-leaflet-user-icon-wrapper",
    html: `<div class="w-10 h-10 rounded-full bg-emerald-600 border-2 border-white shadow-md shadow-emerald-700/35 flex items-center justify-center text-white text-lg leading-none">📍</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -10]
  });
};

interface AccountDashboardProps {
  onBackToHome: () => void;
  onReorder?: (items: { name: string; price: number; quantity: number }[]) => void;
  initialTab?: "profile" | "live" | "history";
}

type TabType = "profile" | "live" | "history";

export default function AccountDashboard({ onBackToHome, onReorder, initialTab }: AccountDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);

  // Editable Profile state
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Dynamic live orders & history
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);

  // Default fallback past orders if there are none
  const defaultPastOrders = [
    {
      id: "TAST-48291-PAST",
      date: "May 24, 2026",
      restaurantName: "Chinatown Express",
      status: "Delivered",
      total: 520,
      items: [
        { name: "Chicken Hakka Noodles", quantity: 1, price: 230 },
        { name: "Veg Spring Roll (Double)", quantity: 1, price: 180 },
        { name: "Classic Lemon Iced Tea", quantity: 1, price: 110 }
      ]
    },
    {
      id: "TAST-31945-PAST",
      date: "May 20, 2026",
      restaurantName: "Corner House Ice Creams",
      status: "Delivered",
      total: 280,
      items: [
        { name: "Death by Chocolate", quantity: 1, price: 280 }
      ]
    }
  ];

  // Set initial tab if provided
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Load current session user & subscribe to login alterations
  useEffect(() => {
    const syncUser = () => {
      const user = getCurrentSessionUser();
      setSessionUser(user);

      if (user) {
        setProfileName(user.name || "Valued Customer");
        
        const cachedEmail = localStorage.getItem(`tastaholic_email_${user.uid}`) || (user.isAnonymous ? "sandbox.explorer@tastaholic.com" : "customer@tastaholic.com");
        setProfileEmail(cachedEmail);

        const cachedAddress = localStorage.getItem(`tastaholic_address_${user.uid}`) || "No primary address set. Add your address here!";
        setProfileAddress(cachedAddress);
      }
    };

    syncUser();

    window.addEventListener("tastaholic-auth-change", syncUser);
    return () => {
      window.removeEventListener("tastaholic-auth-change", syncUser);
    };
  }, []);

  // Fetch dynamic active order & past orders
  useEffect(() => {
    const loadOrdersData = () => {
      if (!sessionUser) {
        setActiveOrder(null);
        setOrderHistory([]);
        return;
      }

      // 1. Load active order scoped strictly to the authenticated user ID
      const activeStr = localStorage.getItem(`tastaholic_active_order_${sessionUser.uid}`);
      if (activeStr) {
        try {
          setActiveOrder(JSON.parse(activeStr));
        } catch (e) {
          setActiveOrder(null);
        }
      } else {
        setActiveOrder(null);
      }

      // 2. Load order history list scoped strictly to the authenticated user ID
      const historyStr = localStorage.getItem(`tastaholic_order_history_${sessionUser.uid}`);
      if (historyStr) {
        try {
          setOrderHistory(JSON.parse(historyStr));
        } catch (e) {
          setOrderHistory([]);
        }
      } else {
        setOrderHistory([]);
      }
    };

    loadOrdersData();

    window.addEventListener("tastaholic-order-update", loadOrdersData);
    return () => {
      window.removeEventListener("tastaholic-order-update", loadOrdersData);
    };
  }, [sessionUser]);

  // Profile update handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionUser) return;

    setIsSaving(true);
    setSaveSuccess(false);

    setTimeout(() => {
      localStorage.setItem(`tastaholic_name_${sessionUser.uid}`, profileName);
      localStorage.setItem(`tastaholic_email_${sessionUser.uid}`, profileEmail);
      localStorage.setItem(`tastaholic_address_${sessionUser.uid}`, profileAddress);
      
      // Dispatch event to make header sync instantly
      window.dispatchEvent(new Event("tastaholic-auth-change"));
      
      setIsSaving(false);
      setSaveSuccess(true);
      
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  const handleReorderClick = (items: { name: string; price: number; quantity: number }[]) => {
    if (onReorder) {
      onReorder(items);
    } else {
      alert("Items successfully added to cart! Switch to Menu to check out.");
    }
  };

  // 🚨 LOCKED STATE (if not logged in, request authentication immediately)
  if (!sessionUser) {
    return (
      <div className="flex-1 bg-slate-50/50 min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-xs mx-auto animate-pulse">
            <UserIcon className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight">
              Unlock Your Account
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Please sign in with your phone number to track live delivery metrics, modify active profiles, and manage secure receipts.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                window.dispatchEvent(new Event("tastaholic-open-login"));
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-extrabold py-3.5 rounded-2xl text-sm transition-all shadow-md shadow-amber-500/15 flex items-center justify-center gap-2 cursor-pointer font-display"
            >
              <LogIn className="w-4 h-4 text-slate-950" />
              <span>LOG IN OR SIGN UP NOW</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={onBackToHome}
              className="text-xs font-semibold text-slate-450 hover:text-amber-500 transition-colors"
            >
              Back to Restaurants Finder
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active driver information
  const driver = {
    name: "Rajesh Kumar",
    vehicle: "White Honda Activa (KA-01-EF-2345)",
    phone: "+91 9988776655",
    rating: "4.9",
    trips: "1,240+ deliveries"
  };

  return (
    <div className="flex-1 bg-slate-50/50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      {/* Container breadcrumb & title area */}
      <div className="max-w-5xl mx-auto mb-8">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-amber-600 font-medium transition-colors mb-4 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Dining</span>
        </button>
        <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">
          My Account
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your elite delivery address, track orders in real-time, and review history.
        </p>
      </div>

      <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40 overflow-hidden">
        {/* Core Layout: Grid dividing Sidebar Navigation & Tab Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
          
          {/* Navigation Sidebar */}
          <div className="md:col-span-4 bg-slate-50 border-r border-slate-100 p-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Profile Card Header Snippet inside Sidebar */}
              <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-xs shrink-0">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div className="truncate">
                  <h3 className="font-bold text-slate-800 text-base truncate">{profileName}</h3>
                  <span className="text-xs text-slate-400 font-medium truncate italic">{sessionUser.phoneNumber || "No Phone"}</span>
                </div>
              </div>

              {/* Sidebar Tabs List */}
              <nav className="space-y-1.5">
                {[
                  { id: "profile", label: "My Profile", icon: UserIcon },
                  { id: "live", label: "Live Delivery", icon: Clock, badge: activeOrder ? "Active" : undefined },
                  { id: "history", label: "Order History", icon: ClipboardList }
                ].map((tab) => {
                  const IconComp = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? "bg-white text-amber-600 shadow-md shadow-slate-100 border border-slate-100/50" 
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComp className={`w-4 h-4 ${isActive ? "text-amber-500" : "text-slate-400"}`} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge && (
                        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-amber-500 text-white animate-pulse">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick trust guard sign in sidebar */}
            <div className="pt-6 border-t border-slate-200 hidden md:block">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Verified Secure Session</span>
              </div>
            </div>
          </div>

          {/* Tab Pages content renderer */}
          <div className="md:col-span-8 p-6 sm:p-8 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 h-full"
              >
                
                {/* TAB 1: MY PROFILE (FULLY EDITABLE & DYNAMIC) */}
                {activeTab === "profile" && (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 font-display">Personal Profile Settings</h2>
                      <p className="text-xs text-slate-400 mt-1">Review or customize your coordinates and delivery location details.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name Card */}
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl focus-within:border-amber-300 focus-within:bg-white transition-all">
                        <span className="text-xs text-slate-400 font-mono font-bold uppercase tracking-wider block">Full Name</span>
                        <input 
                          type="text" 
                          value={profileName} 
                          onChange={(e) => setProfileName(e.target.value)}
                          className="font-bold text-slate-800 text-sm mt-1 w-full bg-transparent focus:outline-none"
                          required
                        />
                      </div>

                      {/* Phone Card (Read-Only Verified) */}
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl opacity-80">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400 font-mono font-bold uppercase tracking-wider block">Phone Number</span>
                          <span className="bg-emerald-150 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded uppercase font-mono tracking-wider">Verified</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono text-slate-800 font-bold text-sm">
                            {sessionUser.phoneNumber || "+91 99999 00000"}
                          </span>
                        </div>
                      </div>

                      {/* Email Card */}
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl focus-within:border-amber-300 focus-within:bg-white transition-all sm:col-span-2">
                        <span className="text-xs text-slate-400 font-mono font-bold uppercase tracking-wider block">Email Address</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <input 
                            type="email" 
                            value={profileEmail} 
                            onChange={(e) => setProfileEmail(e.target.value)}
                            className="font-semibold text-slate-850 text-sm w-full bg-transparent focus:outline-none"
                            placeholder="Add your verified receipt email"
                            required
                          />
                        </div>
                      </div>

                      {/* Address Card */}
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl focus-within:border-amber-300 focus-within:bg-white transition-all sm:col-span-2">
                        <span className="text-xs text-slate-400 font-mono font-bold uppercase tracking-wider block">Complete Delivery Address</span>
                        <div className="flex items-start gap-2 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <textarea 
                            rows={2}
                            value={profileAddress} 
                            onChange={(e) => setProfileAddress(e.target.value)}
                            className="font-semibold text-slate-800 text-sm w-full bg-transparent focus:outline-none resize-none leading-relaxed"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action buttons with feedback and save animations */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 text-amber-500" />
                        )}
                        <span>{isSaving ? "Saving Profiles..." : "Save Modifications"}</span>
                      </button>

                      <AnimatePresence>
                        {saveSuccess && (
                          <motion.span 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-xs font-bold text-emerald-600 flex items-center gap-1 font-sans"
                          >
                            <Check className="w-3.5 h-3.5" /> Profile info updated!
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </form>
                )}

                {/* TAB 2: LIVE DELIVERY (LOADS FROM ACTUAL ORDER ON REALTIME CHECKS) */}
                {activeTab === "live" && (
                  <div className="space-y-6">
                    {!activeOrder ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                          <Bike className="w-8 h-8 text-slate-400" />
                        </div>
                        <div className="max-w-xs space-y-1">
                          <h3 className="font-bold text-slate-800 text-base">No Active Deliveries</h3>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            You don't have an active gourmet order. Feed your curiosity by placing a fresh cuisines menu order!
                          </p>
                        </div>
                        <button
                          onClick={onBackToHome}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-2.5 px-5 rounded-2xl text-xs transition-all active:scale-98 cursor-pointer shadow-md shadow-amber-500/10 font-display"
                        >
                          Discover restaurants
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <h2 className="text-xl font-bold text-slate-900 font-display">Track Live Delivery</h2>
                            <p className="text-xs text-slate-400 mt-1">Live updates from your freshly booked gourmet basket.</p>
                          </div>
                          <span className="text-xs font-mono bg-amber-100 text-amber-850 font-black px-3 py-1 rounded-full">
                            ID: {activeOrder.id}
                          </span>
                        </div>

                        {/* ETA Alert Container */}
                        <div className="bg-amber-500 text-slate-950 p-6 rounded-3xl shadow-lg flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-xs font-mono uppercase tracking-wider font-extrabold text-amber-950/70">Estimated Arrival</span>
                            <h3 className="text-3xl font-display font-black leading-none">{activeOrder.eta || "25 mins"}</h3>
                            <p className="text-xs font-semibold text-amber-950/80 mt-1">Hot, delicious food is currently preparing at {activeOrder.restaurantName}.</p>
                          </div>
                          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-slate-950 animate-bounce">
                            <Bike className="w-8 h-8" />
                          </div>
                        </div>

                        {/* Real-Time Interactive Tracking Map */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider font-mono">Live Route Tracking Map</h4>
                            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-extrabold animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              <span>GPS Live Connected</span>
                            </span>
                          </div>
                          
                          <div className="relative rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-[320px] w-full z-10">
                            <MapContainer 
                              center={[12.9750, 77.6020]} 
                              zoom={14} 
                              scrollWheelZoom={false}
                              style={{ height: "100%", width: "100%" }}
                            >
                              <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              {/* 1. Restaurant Location */}
                              <Marker position={[12.9716, 77.5946]} icon={getRestaurantIcon()}>
                                <Popup>
                                  <div className="text-xs p-1">
                                    <h5 className="font-bold text-slate-950 font-display">{activeOrder.restaurantName}</h5>
                                    <p className="text-slate-500 text-[10px] mt-0.5">Kitchen Preparing Gourmet Cuisines</p>
                                  </div>
                                </Popup>
                              </Marker>

                              {/* 2. Delivery Partner Location */}
                              <Marker position={[12.9750, 77.6020]} icon={getDriverIcon()}>
                                <Popup>
                                  <div className="text-xs p-1">
                                    <h5 className="font-bold text-slate-900 font-display">{driver.name} (Rider)</h5>
                                    <p className="text-slate-500 text-[10px] mt-0.5">En Route on {driver.vehicle}</p>
                                  </div>
                                </Popup>
                              </Marker>

                              {/* 3. User Delivery Destination Address Location */}
                              <Marker position={[12.9785, 77.6110]} icon={getUserHomeIcon()}>
                                <Popup>
                                  <div className="text-xs p-1">
                                    <h5 className="font-bold text-slate-950 font-display">Your Home (Destination)</h5>
                                    <p className="text-slate-500 text-[10px] mt-0.5 max-w-[150px] truncate">{profileAddress}</p>
                                  </div>
                                </Popup>
                              </Marker>

                              {/* Route Path Polyline Connecting them */}
                              <Polyline 
                                positions={[
                                  [12.9716, 77.5946],
                                  [12.9750, 77.6020],
                                  [12.9785, 77.6110]
                                ]} 
                                color="#f59e0b" 
                                weight={4}
                                dashArray="5, 10"
                              />
                            </MapContainer>
                          </div>
                        </div>

                        {/* Active Order Items details */}
                        <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                          <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider font-mono mb-2">Order Items from {activeOrder.restaurantName}</h4>
                          <div className="divide-y divide-slate-100/60">
                            {activeOrder.items?.map((item: any, idx: number) => (
                              <div key={idx} className="py-2.5 flex items-center justify-between text-xs font-semibold text-slate-800">
                                <div>
                                  <span className="text-slate-500 font-mono mr-1.5">{item.quantity}x</span>
                                  <span>{item.name}</span>
                                </div>
                                <span className="font-mono">₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-2.5 mt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-900">
                            <span>Total Paid (incl. Taxes)</span>
                            <span className="font-mono text-base font-black">₹{activeOrder.total}</span>
                          </div>
                        </div>

                        {/* Interactive Tracking Progress Bar */}
                        <div className="space-y-4 pt-2 animate-pulse">
                          <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider font-mono">Real-Time Delivery Progress</h4>
                          
                          <div className="relative">
                            <div className="absolute top-2.5 left-5 right-5 h-1 bg-slate-100 -z-10" />
                            <div className="absolute top-2.5 left-5 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-400 -z-10" />

                            <div className="flex justify-between items-center text-center">
                              {/* Step 1 */}
                              <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white text-xs shadow-md">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                </div>
                                <span className="text-[10px] font-black text-amber-600 mt-1.5 block">Confirmed</span>
                              </div>

                              {/* Step 2 */}
                              <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white text-xs shadow-md">
                                  <Clock className="w-3 h-3 text-white animate-spin" />
                                </div>
                                <span className="text-[10px] font-black text-amber-500 mt-1.5 block animate-bounce">Preparing</span>
                              </div>

                              {/* Step 3 */}
                              <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-300 text-xs shadow-xs">
                                  <Bike className="w-3 h-3 text-slate-300" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 mt-1.5 block">On The Way</span>
                              </div>

                              {/* Step 4 */}
                              <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-300 text-xs shadow-sm">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 mt-1.5 block">Delivered</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Valet Card */}
                        <div className="p-4 border border-slate-100 rounded-2xl bg-white shadow-md shadow-slate-100/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-200">
                              <Bike className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-slate-800 text-sm">{driver.name}</h4>
                                <div className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                  <span>{driver.rating}</span>
                                </div>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">{driver.vehicle}</p>
                              <span className="text-[10px] text-slate-500 font-semibold underline block mt-0.5">{driver.trips}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => alert(`Connecting with delivery partner Rajesh Kumar at ${driver.phone}... (Bypassed simulator successfully)`)}
                            className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all tracking-wider active:scale-98 cursor-pointer shadow-xs"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>CALL RUNNER PARTNER</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: ORDER HISTORY */}
                {activeTab === "history" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 font-display">Your Secure Order History</h2>
                      <p className="text-xs text-slate-400 mt-1">Review receipts and trigger quick reorders instantly.</p>
                    </div>

                    {orderHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-8">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <ClipboardList className="w-8 h-8 text-slate-400" />
                        </div>
                        <div className="max-w-xs space-y-1">
                          <h3 className="font-bold text-slate-800 text-base font-display">No Previous Orders</h3>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            You haven't placed any orders yet! Place an order first to review receipt history.
                          </p>
                        </div>
                        <button
                          onClick={onBackToHome}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-2.5 px-5 rounded-2xl text-xs transition-all active:scale-98 cursor-pointer shadow-md shadow-amber-500/10 font-display"
                        >
                          Discover Restaurants
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orderHistory.map((order, idx) => {
                          const rName = order.restaurantName || order.restaurant;
                          return (
                            <div 
                              key={order.id || idx} 
                              className="p-5 border border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-100/50 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <h4 className="font-extrabold text-slate-800 text-sm">{rName}</h4>
                                  <div className="flex items-center gap-1 text-[9px] px-2 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold rounded-md uppercase tracking-wider">
                                    <PackageCheck className="w-3 h-3" />
                                    <span>{order.status || "Delivered"}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold font-mono">
                                  <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                  <span>{order.date}</span>
                                  <span>•</span>
                                  <span className="font-bold text-slate-600">₹{order.total}</span>
                                </div>

                                <p className="text-xs text-slate-500 truncate max-w-[280px]">
                                  {order.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(", ")}
                                </p>
                              </div>

                              <button
                                onClick={() => handleReorderClick(order.items || [])}
                                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-4 py-3 rounded-xl text-xs transition-all active:scale-98 cursor-pointer shadow-xs font-display"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Quick Reorder</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
