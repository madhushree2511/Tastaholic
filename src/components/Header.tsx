import { useState, useEffect } from "react";
import { ShoppingBag, ArrowLeft, Search, MapPin, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, logOut, getCurrentSessionUser, SessionUser } from "../firebase";
import { Restaurant } from "../types";
import PhoneLoginModal from "./PhoneLoginModal";

interface HeaderProps {
  activeRestaurant: Restaurant | null;
  onBack: () => void;
  cartCount: number;
  openCart: () => void;
  isDashboardOpen?: boolean;
  onOpenDashboard?: () => void;
}

export function Header({ 
  activeRestaurant, 
  onBack, 
  cartCount, 
  openCart, 
  isDashboardOpen = false, 
  onOpenDashboard 
}: HeaderProps) {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isPhoneLoginOpen, setIsPhoneLoginOpen] = useState(false);

  useEffect(() => {
    const updateSession = () => {
      setSessionUser(getCurrentSessionUser());
    };

    // Sub to Firebase auth change
    const unsubscribe = onAuthStateChanged(auth, () => {
      updateSession();
    });

    // Sub to custom auth change events for instant updates
    window.addEventListener("tastaholic-auth-change", updateSession);

    // Sub to custom login open trigger
    const openLoginHandler = () => setIsPhoneLoginOpen(true);
    window.addEventListener("tastaholic-open-login", openLoginHandler);

    // Initial load
    updateSession();

    return () => {
      unsubscribe();
      window.removeEventListener("tastaholic-auth-change", updateSession);
      window.removeEventListener("tastaholic-open-login", openLoginHandler);
    };
  }, []);

  const formatUserIdentifier = (currentUser: SessionUser | null) => {
    if (!currentUser) return "User";
    return currentUser.name.split(" ")[0];
  };

  const handleLogin = () => {
    setIsPhoneLoginOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between">
        {/* Left Section: Branding / Navigation */}
        <div className="flex items-center gap-3">
          {activeRestaurant || isDashboardOpen ? (
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Back"
              id="back_btn"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
          ) : (
            <div className="p-1.5 rounded-full bg-amber-50">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
            </div>
          )}

          <div>
            {activeRestaurant ? (
              <div>
                <h1 className="font-display font-semibold text-base text-slate-800 leading-tight truncate max-w-[150px] sm:max-w-[200px]">
                  {activeRestaurant.name}
                </h1>
                <span className="text-xs text-slate-500 font-mono">Viewing Menu</span>
              </div>
            ) : isDashboardOpen ? (
              <div>
                <h1 className="font-display font-semibold text-base text-slate-800 leading-tight">
                  Account Dashboard
                </h1>
                <span className="text-xs text-slate-500 font-mono">User Session Hub</span>
              </div>
            ) : (
              <div>
                <h1 className="font-display font-black text-2xl md:text-3xl text-slate-900 tracking-tight">
                  Tasta<span className="text-amber-500">holic</span>
                </h1>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Interactive actions and User auth session */}
        <div className="flex items-center gap-3 md:gap-4">
          {!activeRestaurant && (
            <button className="hidden sm:block p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors" id="header_search_btn">
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Cart triggers */}
          <button
            onClick={openCart}
            className="relative p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            aria-label="Shopping Cart"
            id="cart_trigger_btn"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-white font-mono font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Session Interface */}
          <div className="border-l border-slate-100 pl-3 md:pl-4 flex items-center gap-2">
            {!sessionUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenDashboard}
                  className={`text-xs font-bold font-display px-2.5 sm:px-3 py-2 rounded-xl border border-slate-200 text-slate-650 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50/20 transition-all cursor-pointer flex items-center gap-1.5 ${
                    isDashboardOpen ? "border-amber-500 bg-amber-50 text-amber-600 font-extrabold" : ""
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden md:inline">My Account</span>
                </button>
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-amber-500/15 hover:shadow-lg hover:shadow-amber-500/20 active:scale-98 transition-all cursor-pointer font-display"
                  id="login_action_btn"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-950" />
                  <span className="hidden sm:inline">Login / Sign Up</span>
                  <span className="inline sm:hidden">Login</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Profile Avatar elements - Click to visit Account Dashboard */}
                <button
                  onClick={onOpenDashboard}
                  className={`flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer px-2.5 py-1.5 rounded-xl border ${
                    isDashboardOpen ? "bg-amber-50/70 border-amber-200 text-amber-800" : "border-transparent text-slate-700"
                  } active:scale-98 group`}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-sans shadow-xs group-hover:border-amber-400">
                    <UserIcon className="w-3.5 h-3.5 text-amber-700" />
                  </div>
                  <span className="hidden sm:inline text-xs sm:text-sm font-bold max-w-[140px] truncate font-display group-hover:text-amber-650">
                    {formatUserIdentifier(sessionUser)}
                  </span>
                </button>

                {/* Secure Sign Out trigger */}
                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50/70 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  title="Logout"
                  id="logout_action_btn"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Phone OTP Authentication Modal */}
      <PhoneLoginModal
        isOpen={isPhoneLoginOpen}
        onClose={() => setIsPhoneLoginOpen(false)}
      />
    </header>
  );
}
