import { useState } from "react";
import { Search, Plus, Minus, CreditCard, ChevronRight, ShoppingCart, MapPin } from "lucide-react";
import { Restaurant, CartItem } from "../types";
import { motion } from "motion/react";
import { getCurrentSessionUser } from "../firebase";
import MockPaymentModal from "./MockPaymentModal";
import RestaurantReviews from "./RestaurantReviews";

interface MenuProps {
  restaurant: Restaurant;
  cart: CartItem[];
  onAddToCart: (name: string, price: number) => void;
  onRemoveFromCart: (name: string) => void;
  onCheckout: () => void;
  isOrdering: boolean;
}

export function Menu({
  restaurant,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onCheckout,
  isOrdering
}: MenuProps) {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handleProceedToPayment = () => {
    const sessionUser = getCurrentSessionUser();
    if (!sessionUser) {
      window.dispatchEvent(new Event("tastaholic-open-login"));
      return;
    }
    setIsPaymentOpen(true);
  };

  // Calculate total price and quantity of items in our cart
  const cartAmount = cart.reduce((accum, item) => accum + item.price * item.quantity, 0);
  const totalItemsCount = cart.reduce((accum, item) => accum + item.quantity, 0);

  // Helper to discover if a specific menu item is in our cart
  const getItemQuantity = (itemName: string): number => {
    const found = cart.find((item) => item.name === itemName);
    return found ? found.quantity : 0;
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto pb-16">
      <div className="max-w-7xl mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Menu Feed & Jumbotron Banner */}
        <div className="lg:col-span-2 space-y-6">
          {/* Restaurant Header Jumbotron backdrop */}
          <div className="relative h-56 w-full rounded-3xl overflow-hidden bg-slate-100 shadow-md">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover brightness-[0.70]"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="bg-amber-500 text-slate-950 text-xs font-black tracking-wider uppercase px-3 py-1 rounded-full font-mono">
                {restaurant.cuisine}
              </span>
              <h2 className="font-display font-black text-2xl md:text-3xl mt-2 tracking-tight drop-shadow-sm">
                {restaurant.name}
              </h2>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-300 font-medium flex-wrap">
                <span className="flex items-center gap-1 font-bold bg-white/10 px-2 py-0.5 rounded-md text-white">
                  ⭐ {restaurant.rating.toFixed(1)} Rating
                </span>
                <span>•</span>
                <span>Fast Delivery</span>
                <span>•</span>
                <span>Express Service</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-200 font-medium sm:max-w-md">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="drop-shadow-sm font-sans truncate" title={restaurant.address}>
                  {restaurant.address}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Card Content list */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-6 shadow-xs">
            {/* Menu title section */}
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <h3 className="font-display font-extrabold text-slate-900 text-lg">
                Ala Carte Classics Menu
              </h3>
              <span className="text-xs text-slate-400 font-mono">Prices incl. all local taxes</span>
            </div>

            {/* Food list mapping view */}
            <div className="space-y-6 divide-y divide-slate-100">
              {restaurant.menu.map((food, index) => {
                const qty = getItemQuantity(food.name);
                return (
                  <motion.div
                    key={food.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    className="pt-6 flex items-start justify-between gap-6 first:pt-0"
                  >
                    <div className="flex-1 space-y-1.5">
                      {/* Non-veg/Veg simulated indicator tag */}
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 border rounded-sm flex items-center justify-center p-0.5 ${
                          index % 2 === 0 ? "border-green-600 bg-green-50" : "border-red-600 bg-red-50"
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            index % 2 === 0 ? "bg-green-600" : "bg-red-600"
                          }`} />
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest">
                          {index % 2 === 0 ? "Pure Veg" : "Premium House Classic"}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-slate-800 text-base leading-snug">
                        {food.name}
                      </h4>
                      <div className="flex items-baseline gap-1 pt-0.5">
                        <span className="text-xs text-slate-500 font-mono">₹</span>
                        <span className="font-mono text-base font-bold text-slate-700">{food.price}</span>
                      </div>
                    </div>

                    {/* Add/Remove interactive quantity button controller */}
                    <div className="flex items-center shrink-0">
                      {qty > 0 ? (
                        <div className="flex items-center bg-amber-500 text-white rounded-xl shadow-md overflow-hidden">
                          <button
                            onClick={() => onRemoveFromCart(food.name)}
                            className="px-3 py-2.5 hover:bg-amber-600 active:scale-95 transition-all text-sm font-black cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-sm font-mono font-extrabold select-none min-w-[20px] text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => onAddToCart(food.name, food.price)}
                            className="px-3 py-2.5 hover:bg-amber-600 active:scale-95 transition-all text-sm font-black cursor-pointer"
                            aria-label="Add item"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onAddToCart(food.name, food.price)}
                          className="border border-amber-200 bg-amber-50 hover:bg-amber-500 hover:text-slate-950 text-amber-700 font-display transition-all px-4.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer hover:shadow-md active:scale-95 duration-200"
                        >
                          <Plus className="w-3.5 h-3.5 text-current stroke-[2.5]" />
                          <span>ADD TO CART</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Restaurant Reviews System Panel Section */}
          <RestaurantReviews restaurantId={restaurant._id} initialReviews={restaurant.reviews} />
        </div>

        {/* Right Column - Desktop Premium Order Basket (Only on laptop/large screens) */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 bg-white border border-slate-100 rounded-3xl p-6 shadow-lg space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-display font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-500" />
                <span>Your Premium Basket</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Authentic culinary items selected</p>
            </div>

            {totalItemsCount === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-700">Your basket is empty</p>
                  <p className="text-xs text-slate-400 max-w-[200px] mx-auto">
                    Add delicious classic dishes from the menu classics list to complete your meal.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Itemized list of selected classics */}
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.name} className="flex justify-between items-center text-sm text-slate-700">
                      <div className="max-w-[150px] truncate">
                        <span className="font-semibold text-slate-800">{item.name}</span>
                        <div className="text-xs text-slate-400 font-mono">₹{item.price} x {item.quantity}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onRemoveFromCart(item.name)}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-bold text-xs">{item.quantity}</span>
                        <button
                          onClick={() => onAddToCart(item.name, item.price)}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotals & Taxes receipts details */}
                <div className="space-y-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
                  <div className="flex justify-between">
                    <span>Subtotal Price</span>
                    <span className="font-mono">₹{cartAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & GST (5% promo)</span>
                    <span className="text-emerald-500 font-mono font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Instant Express Delivery fee</span>
                    <span className="text-emerald-500 font-semibold font-mono">FREE</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-extrabold text-sm border-t border-slate-100 pt-3">
                    <span>Grand Total</span>
                    <span className="font-mono">₹{cartAmount}</span>
                  </div>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  disabled={isOrdering}
                  className={`w-full py-4 rounded-xl flex items-center justify-between px-5 font-display font-semibold text-sm transition-all focus:outline-none shadow-md shadow-amber-500/20 active:scale-98 cursor-pointer ${
                    isOrdering
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950"
                  }`}
                >
                  <div className="flex items-center gap-1 text-slate-950">
                    <CreditCard className="w-4 h-4 text-slate-950 mr-1" />
                    <span className="font-mono text-base font-black">₹{cartAmount}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-slate-950 font-bold">
                    <span>{isOrdering ? "Placing Order..." : "Proceed to Payment"}</span>
                    <ChevronRight className="w-4 h-4 text-slate-950 animate-pulse" />
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Sticky Bottom Summary Cart Drawer bar (Hidden on large screens/laptops) */}
      {totalItemsCount > 0 && (
        <div className="absolute bottom-0 inset-x-0 z-40 bg-white border-t border-slate-100 shadow-xl p-4 max-w-md mx-auto lg:hidden">
          {/* Quick itemization preview */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5 font-mono">
            <span className="flex items-center gap-1">
              <ShoppingCart className="w-3.5 h-3.5 text-amber-500" />
              <span>Cart items ({totalItemsCount})</span>
            </span>
            <span>Delivery: FREE promo</span>
          </div>

          <button
            onClick={handleProceedToPayment}
            disabled={isOrdering}
            className={`w-full py-3.5 rounded-2xl flex items-center justify-between px-5 font-display font-semibold text-sm transition-all focus:outline-none shadow-md shadow-amber-500/20 active:scale-98 cursor-pointer ${
              isOrdering
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950"
            }`}
          >
            <div className="flex items-center gap-1 text-slate-950">
              <CreditCard className="w-4 h-4 text-slate-950 mr-1" />
              <span className="text-[10px] text-slate-800 uppercase font-bold pr-1 font-mono">TOTAL:</span>
              <span className="font-mono text-base font-black">₹{cartAmount}</span>
            </div>
            
            <div className="flex items-center gap-1 text-slate-950">
              <span>{isOrdering ? "Placing Order..." : "Proceed to Payment"}</span>
              <ChevronRight className="w-4 h-4 text-slate-950 animate-pulse" />
            </div>
          </button>
        </div>
      )}

      {/* Mock Payment Gateway Modal Pop-up */}
      <MockPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={() => {
          setIsPaymentOpen(false);
          onCheckout();
        }}
        amount={cartAmount}
      />
    </div>
  );
}
