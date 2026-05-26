import { useState, useEffect } from "react";
import { X, CreditCard, Smartphone, ShieldCheck, Loader2, MapPin, Banknote } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth, getCurrentSessionUser, SessionUser } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

interface MockPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount?: number;
}

type PaymentMethod = "gpay" | "phonepe" | "card" | "cod";

export default function MockPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  amount = 0,
}: MockPaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("gpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(getCurrentSessionUser());

  useEffect(() => {
    const updateSession = () => {
      setSessionUser(getCurrentSessionUser());
    };

    const unsub = onAuthStateChanged(auth, () => {
      updateSession();
    });

    window.addEventListener("tastaholic-auth-change", updateSession);

    updateSession();

    return () => {
      unsub();
      window.removeEventListener("tastaholic-auth-change", updateSession);
    };
  }, []);

  if (!isOpen) return null;

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  const savedAddress = sessionUser ? localStorage.getItem(`tastaholic_address_${sessionUser.uid}`) : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Darkened background overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isProcessing ? onClose : undefined}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Central white modal box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        >
          {/* Header section */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-display font-black text-slate-800 tracking-tight">
                Complete Your Payment
              </h3>
              {amount > 0 && (
                <p className="text-sm font-semibold text-slate-500 mt-0.5">
                  Amount to Pay: <span className="font-mono text-slate-900 font-extrabold">₹{amount}</span>
                </p>
              )}
            </div>
            {!isProcessing && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5">
            {sessionUser && (
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-1.5 hover:bg-amber-500/10 transition-colors">
                <span className="text-[10px] font-bold text-amber-600 font-mono tracking-widest uppercase block">
                  DELIVER TO
                </span>
                <p className="text-sm font-extrabold text-slate-800 font-display">
                  {sessionUser.name || "Valued Customer"}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed font-sans flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{savedAddress || "Indiranagar, Bangalore, Karnataka"}</span>
                </p>
              </div>
            )}

            <span className="text-xs font-bold text-slate-400 font-mono tracking-widest uppercase block">
              CHOOSE PAYMENT METHOD
            </span>

            {/* Selectable Payment Method options */}
            <div className="space-y-3">
              {/* Google Pay */}
              <button
                onClick={() => !isProcessing && setSelectedMethod("gpay")}
                disabled={isProcessing}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                  selectedMethod === "gpay"
                    ? "border-amber-500 bg-amber-50/50"
                    : "border-slate-100 hover:border-slate-200"
                } ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-green-500 flex items-center justify-center text-white text-xs font-black font-sans uppercase tracking-tighter shrink-0 shadow-xs">
                    GPay
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Google Pay (GPay)</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Pay securely via UPI app</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedMethod === "gpay" ? "border-amber-500 bg-amber-500" : "border-slate-300"
                }`}>
                  {selectedMethod === "gpay" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>

              {/* PhonePe */}
              <button
                onClick={() => !isProcessing && setSelectedMethod("phonepe")}
                disabled={isProcessing}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                  selectedMethod === "phonepe"
                    ? "border-amber-500 bg-amber-50/50"
                    : "border-slate-100 hover:border-slate-200"
                } ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">PhonePe</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Pay with your PhonePe wallet or UPI</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedMethod === "phonepe" ? "border-amber-500 bg-amber-500" : "border-slate-300"
                }`}>
                  {selectedMethod === "phonepe" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>

              {/* Credit / Debit Card */}
              <button
                onClick={() => !isProcessing && setSelectedMethod("card")}
                disabled={isProcessing}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                  selectedMethod === "card"
                    ? "border-amber-500 bg-amber-50/50"
                    : "border-slate-100 hover:border-slate-200"
                } ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <CreditCard className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Credit / Debit Card</h4>
                    <p className="text-xs text-slate-400 mt-0.5">All major Mastercard/Visa/Rupay chips</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedMethod === "card" ? "border-amber-500 bg-amber-500" : "border-slate-300"
                }`}>
                  {selectedMethod === "card" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>

              {/* Cash on Delivery (COD) */}
              <button
                onClick={() => !isProcessing && setSelectedMethod("cod")}
                disabled={isProcessing}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                  selectedMethod === "cod"
                    ? "border-amber-500 bg-amber-50/50"
                    : "border-slate-100 hover:border-slate-200"
                } ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Banknote className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Cash on Delivery (COD)</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Pay in cash or UPI QR code on delivery</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedMethod === "cod" ? "border-amber-500 bg-amber-500" : "border-slate-300"
                }`}>
                  {selectedMethod === "cod" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            </div>
          </div>

          {/* Pay Button Action Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full py-4 rounded-xl font-display font-semibold text-sm transition-all focus:outline-none flex items-center justify-center gap-2 active:scale-98 cursor-pointer ${
                isProcessing
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20"
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                  <span>{selectedMethod === "cod" ? "Placing COD Order..." : "Processing Payment..."}</span>
                </>
              ) : (
                <span>{selectedMethod === "cod" ? "Place COD Order" : "Pay Now"} ₹{amount}</span>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
              <span>128-bit Secure HTTPS encryption</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
