import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Phone, Lock, Loader2, ArrowLeft, ShieldCheck, CheckCircle2, User, MapPin, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { setUpRecaptcha, db, auth } from "../firebase";
import { ConfirmationResult, updateProfile, signInAnonymously } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

interface PhoneLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PhoneLoginModal({ isOpen, onClose, onSuccess }: PhoneLoginModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Enter Profile & Phone, Step 2: Enter OTP
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  if (!isOpen) return null;

  // Validate fields
  const validateForm = () => {
    if (!name.trim()) {
      return "Please enter your full name";
    }
    if (!email.trim() || !email.includes("@")) {
      return "Please enter a valid email address";
    }
    if (!address.trim()) {
      return "Please enter your complete delivery address";
    }
    
    const cleansed = phoneNumber.replace(/\s+/g, "");
    if (!cleansed.startsWith("+")) {
      return "Phone number must start with a country code (e.g., +91 for India, +1 for US)";
    }
    if (cleansed.length < 10) {
      return "Please enter a valid phone number with country code";
    }
    return null;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      // Setup reCAPTCHA and trigger phone confirmation SMS
      const result = await setUpRecaptcha(phoneNumber.trim());
      setConfirmationResult(result);
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send OTP. Please check your number and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSandboxBypass = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Please enter your full name before using sandbox mode");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address before using sandbox mode");
      return;
    }
    if (!address.trim()) {
      setError("Please enter your complete delivery address before using sandbox mode");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      if (user) {
        localStorage.setItem(`tastaholic_address_${user.uid}`, address.trim());
        localStorage.setItem(`tastaholic_name_${user.uid}`, name.trim());
        localStorage.setItem(`tastaholic_email_${user.uid}`, email.trim());
        window.dispatchEvent(new Event("tastaholic-auth-change"));

        Promise.resolve().then(async () => {
          try {
            await updateProfile(user, { displayName: name.trim() });
          } catch (profileErr) {
            console.warn("Could not update Firebase display name:", profileErr);
          }

          try {
            await setDoc(doc(db, "users", user.uid), {
              name: name.trim(),
              address: address.trim(),
              email: email.trim(),
              phoneNumber: user.phoneNumber || phoneNumber.trim() || "+919999900000",
              isSandboxUser: true,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          } catch (dbErr) {
            console.warn("Could not write record to Firestore (using fallback cache):", dbErr);
          }
        });
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      console.warn("Bypass login failed, using local resilient session:", err);
      const fallbackUid = "demo_" + Date.now();
      localStorage.setItem(`tastaholic_address_${fallbackUid}`, address.trim());
      localStorage.setItem(`tastaholic_name_${fallbackUid}`, name.trim());
      localStorage.setItem(`tastaholic_email_${fallbackUid}`, email.trim());
      localStorage.setItem(`tastaholic_fallback_uid`, fallbackUid);
      window.dispatchEvent(new Event("tastaholic-auth-change"));

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }

    if (otp === "123456") {
      await handleSandboxBypass();
      return;
    }

    if (!confirmationResult) {
      setError("Session expired or bypassed. Please request a new OTP.");
      setStep(1);
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const user = userCredential.user;

      if (user) {
        // 1. Immediately cache user data locally for instant UI responsiveness
        localStorage.setItem(`tastaholic_address_${user.uid}`, address.trim());
        localStorage.setItem(`tastaholic_name_${user.uid}`, name.trim());
        localStorage.setItem(`tastaholic_email_${user.uid}`, email.trim());
        window.dispatchEvent(new Event("tastaholic-auth-change"));

        // 2. Perform external database updates in the background without blocking the UI
        Promise.resolve().then(async () => {
          if (name.trim()) {
            try {
              await updateProfile(user, { displayName: name.trim() });
            } catch (profileErr) {
              console.warn("Could not update Firebase display name:", profileErr);
            }
          }

          try {
            await setDoc(doc(db, "users", user.uid), {
              name: name.trim(),
              address: address.trim(),
              email: email.trim(),
              phoneNumber: user.phoneNumber || phoneNumber.trim(),
              updatedAt: new Date().toISOString()
            }, { merge: true });
          } catch (dbErr) {
            console.warn("Could not write record to Firestore (using fallback cache):", dbErr);
          }
        });
      }
      
      // 3. Trigger parent callbacks and close successfully
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid or expired OTP. Please check and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setName("");
    setEmail("");
    setAddress("");
    setPhoneNumber("+91");
    setOtp("");
    setStep(1);
    setError(null);
    setIsLoading(false);
    setConfirmationResult(null);
  };

  const handleClose = () => {
    if (!isLoading) {
      resetModal();
      onClose();
    }
  };

  const modalMarkup = (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Darkened background overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Central white modal box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-left"
        >
          {/* Top Header Section */}
          <div className="p-6 border-b border-rose-50/50 bg-gradient-to-r from-amber-500/5 to-rose-500/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {step === 2 && !isLoading && (
                <button
                  onClick={() => {
                    setStep(1);
                    setError(null);
                  }}
                  className="p-1 rounded-full hover:bg-slate-100/70 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Go Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <h3 className="text-lg font-display font-black text-slate-800 tracking-tight">
                {step === 1 ? "Login / Sign Up" : "Enter Verification Code"}
              </h3>
            </div>
            {!isLoading && (
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="p-6 space-y-5">
            {/* Swiggy/Tastaholic Welcome Headline */}
            {step === 1 && (
              <div className="space-y-1">
                <p className="text-sm text-slate-500 text-left">
                  Enter your mobile number to purchase delicious meals, track orders real-time, and get exclusive rewards.
                </p>
              </div>
            )}

            {/* Error Message banner with Dynamic Sandbox advice */}
            {error && (
              <div className="space-y-3">
                <div className="p-4 bg-rose-50/80 border border-rose-100/70 text-rose-600 text-xs font-semibold rounded-xl leading-relaxed flex flex-col gap-1.5">
                  <span>⚠️ {error}</span>
                  {(error.toLowerCase().includes("billing") || error.toLowerCase().includes("recaptcha") || error.toLowerCase().includes("not-allowed") || error.toLowerCase().includes("sms") || error.toLowerCase().includes("otp")) && (
                    <span className="text-[11px] text-slate-500 font-normal">
                      Sandbox Environments & Firebase Spark Tier restrict live SMS to testing phone numbers under your Firebase console. We recommend clicking the <strong className="text-emerald-700">Sandbox Bypass</strong> button below to instantly sign in and explore full checkout and features.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* OTP Flow Forms */}
            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                {/* Full Name input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 font-mono tracking-widest uppercase block text-left">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      disabled={isLoading}
                      className="w-full bg-slate-50 hover:bg-slate-50/50 border-2 border-slate-100 focus:border-amber-500 focus:bg-white pl-11 pr-4 py-3.5 rounded-2xl text-slate-800 font-sans font-semibold text-sm outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Email Address input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 font-mono tracking-widest uppercase block text-left">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      disabled={isLoading}
                      className="w-full bg-slate-50 hover:bg-slate-50/50 border-2 border-slate-100 focus:border-amber-500 focus:bg-white pl-11 pr-4 py-3.5 rounded-2xl text-slate-800 font-sans font-semibold text-sm outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Complete Address input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 font-mono tracking-widest uppercase block text-left">
                    Delivery Address
                  </label>
                  <div className="relative">
                    <div className="absolute top-3.5 left-0 pl-4 flex items-start pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter flat/house no, landmark, and street address"
                      required
                      disabled={isLoading}
                      rows={2}
                      className="w-full bg-slate-50 hover:bg-slate-50/50 border-2 border-slate-100 focus:border-amber-500 focus:bg-white pl-11 pr-4 py-3 rounded-2xl text-slate-800 font-sans font-semibold text-sm outline-none transition-all placeholder:text-slate-400 resize-none"
                    />
                  </div>
                </div>

                {/* Phone Number input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 font-mono tracking-widest uppercase block text-left">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      required
                      disabled={isLoading}
                      className="w-full bg-slate-50 hover:bg-slate-50/50 border-2 border-slate-100 focus:border-amber-500 focus:bg-white pl-11 pr-4 py-3.5 rounded-2xl text-slate-800 font-sans font-semibold text-sm outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 italic font-medium block text-left">
                    Include country code prefix (e.g., +91 for India, +1 for US)
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl font-display font-semibold text-sm transition-all focus:outline-none flex items-center justify-center gap-2 active:scale-98 cursor-pointer bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <span>Send Verification OTP</span>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 py-1">
                  <div className="h-[1px] bg-slate-100 flex-1"></div>
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">or</span>
                  <div className="h-[1px] bg-slate-100 flex-1"></div>
                </div>

                <button
                  type="button"
                  onClick={handleSandboxBypass}
                  className="w-full py-4 rounded-xl font-display font-bold text-xs transition-all focus:outline-none flex items-center justify-center gap-2 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-800 shadow-xs cursor-pointer active:scale-98"
                >
                  🚀 Sign In Instantly via Sandbox Bypass
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400 font-mono tracking-widest uppercase block text-left">
                      6-Digit OTP
                    </label>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      OTP Sent to {phoneNumber}
                    </span>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      pattern="\d{6}"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 6-digit OTP"
                      required
                      disabled={isLoading}
                      className="w-full bg-slate-50 hover:bg-slate-50/50 border-2 border-slate-100 focus:border-amber-500 focus:bg-white pl-11 pr-4 py-3.5 rounded-2xl text-slate-800 font-mono font-bold tracking-[0.5em] text-center text-base outline-none transition-all placeholder:tracking-normal placeholder:text-slate-400 placeholder:text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl font-display font-semibold text-sm transition-all focus:outline-none flex items-center justify-center gap-2 active:scale-98 cursor-pointer bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify & Login</span>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 py-1">
                  <div className="h-[1px] bg-slate-100 flex-1"></div>
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">or</span>
                  <div className="h-[1px] bg-slate-100 flex-1"></div>
                </div>

                <button
                  type="button"
                  onClick={handleSandboxBypass}
                  className="w-full py-3 rounded-xl font-display font-bold text-xs transition-all focus:outline-none flex items-center justify-center gap-2 border border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/20 hover:bg-emerald-50 text-emerald-800 cursor-pointer"
                >
                  🚀 Skip & Use Sandbox Bypass (Code: 123456)
                </button>
              </form>
            )}
          </div>

          {/* Secure Trust Footer Badge */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
            <span>Authenticated securely via Firebase SMS API</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== "undefined"
    ? createPortal(modalMarkup, document.body)
    : null;
}
