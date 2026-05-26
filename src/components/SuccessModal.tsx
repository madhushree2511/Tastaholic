import { Check, ShoppingBag, Clock, Heart, Truck } from "lucide-react";
import { CartItem, getDeliveryEta } from "../types";
import { motion } from "motion/react";

interface SuccessModalProps {
  onClose: () => void;
  onTrackOrder?: () => void;
  orderSummary: {
    restaurantName: string;
    items: CartItem[];
    total: number;
    orderId?: string;
  };
}

export function SuccessModal({ onClose, onTrackOrder, orderSummary }: SuccessModalProps) {
  return (
    <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center p-4">
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="bg-white rounded-3xl w-full max-w-md p-6 overflow-hidden flex flex-col space-y-6 max-h-[90vh] shadow-2xl relative"
      >
        {/* Top abstract green shape with checkmark icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border-4 border-emerald-50 relative">
            <Check className="w-8 h-8 stroke-[3]" />
            <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-amber-500 rounded-full flex items-center justify-center text-[10px] text-white font-black">
              ★
            </span>
          </div>
          <h3 className="font-display font-black text-xl text-slate-900 tracking-tight">
            Order Sent Successfully!
          </h3>
          <p className="text-xs text-slate-500">
            {orderSummary.restaurantName} has started preparing your fresh ingredients.
          </p>
        </div>

        {/* Live Tracking Status card */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Status: <strong className="text-amber-600 font-extrabold font-mono">Preparing</strong></span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">ETA: {getDeliveryEta(orderSummary.restaurantName)}</span>
          </div>

          {/* Graphical Progress timeline bar */}
          <div className="relative">
            <div className="absolute top-1.5 inset-x-0 h-1 bg-slate-200 rounded-full" />
            <div className="absolute top-1.5 left-0 w-1/3 h-1 bg-amber-500 rounded-full animate-pulse" />
            
            <div className="flex justify-between items-center relative z-10 text-[9px] font-mono font-semibold text-slate-400">
              <div className="flex flex-col items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[8px]">✓</span>
                <span className="text-slate-800">Confirmed</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white text-white flex items-center justify-center font-bold text-[8px] animate-ping" />
                <span className="text-slate-700 font-extrabold">Preparing</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold text-[8px]">3</span>
                <span>En Route</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details list */}
        <div className="space-y-3">
          <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block border-b border-slate-100 pb-1">
            Order Receipts Summary
          </span>
          <div className="max-y-[150px] overflow-y-auto space-y-2.5 pr-1">
            {orderSummary.items.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs text-slate-700">
                <span className="font-medium truncate max-w-[240px]">
                  {item.name} <span className="text-amber-500 font-bold font-mono">x{item.quantity}</span>
                </span>
                <span className="font-mono text-slate-600">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-slate-900">
            <span className="text-xs font-bold text-slate-800">Paid via UPI / Cash Pay</span>
            <span className="font-mono font-black text-base text-slate-900">₹{orderSummary.total}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-2.5 pt-2">
          {onTrackOrder && (
            <button
              onClick={onTrackOrder}
              className="w-full bg-amber-500 hover:bg-amber-600 active:scale-98 cursor-pointer py-3.5 rounded-2xl text-slate-950 font-display font-bold text-sm transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4 text-slate-950" />
              <span>TRACK LIVE DELIVERY</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full border border-slate-200 hover:bg-slate-50 active:scale-98 cursor-pointer py-3 rounded-2xl text-slate-700 font-display font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span>Keep Browsing menus</span>
          </button>
          
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
            <span>Rate this app experience</span>
            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
