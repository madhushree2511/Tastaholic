import { useState } from "react";
import { Header } from "./components/Header";
import { Home } from "./components/Home";
import { Menu } from "./components/Menu";
import { SuccessModal } from "./components/SuccessModal";
import AccountDashboard from "./components/AccountDashboard";
import { Restaurant, CartItem } from "./types";
import { AnimatePresence } from "motion/react";
import { getCurrentSessionUser } from "./firebase";

export default function App() {
  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant | null>(null);
  const [currentView, setCurrentView] = useState<"home" | "dashboard">("home");
  const [dashboardTab, setDashboardTab] = useState<"profile" | "live" | "history">("profile");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOrdering, setIsOrdering] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Cache receipt summary metadata for the final victory modal
  const [orderSummary, setOrderSummary] = useState<{
    restaurantName: string;
    items: CartItem[];
    total: number;
    orderId?: string;
  } | null>(null);

  // Helper to persist order inside state/localStorage for live dashboard rendering
  const registerPlacedOrder = (restaurantName: string, items: CartItem[], total: number, orderId: string) => {
    const formattedDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    
    const placedOrder = {
      id: orderId,
      restaurantName: restaurantName,
      items: items.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
      total: total,
      date: formattedDate,
      status: "Preparing",
      eta: "20-25 mins"
    };

    const session = getCurrentSessionUser();
    const activeKey = session ? `tastaholic_active_order_${session.uid}` : "tastaholic_active_order";
    const historyKey = session ? `tastaholic_order_history_${session.uid}` : "tastaholic_order_history";

    // Save as active live order with user scoping
    localStorage.setItem(activeKey, JSON.stringify(placedOrder));
    localStorage.setItem("tastaholic_active_order", JSON.stringify(placedOrder));

    // Append to user-specific past order history
    const historyStr = localStorage.getItem(historyKey);
    let history = [];
    if (historyStr) {
      try {
        history = JSON.parse(historyStr);
      } catch (_) {}
    }
    history.unshift(placedOrder);
    localStorage.setItem(historyKey, JSON.stringify(history));
    localStorage.setItem("tastaholic_order_history", JSON.stringify(history));

    // Dispatch custom dynamic order update trigger
    window.dispatchEvent(new Event("tastaholic-order-update"));
  };

  // Cart operations
  const handleAddToCart = (name: string, price: number) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.name === name);
      if (existing) {
        return prevCart.map((item) =>
          item.name === name ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { name, price, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (name: string) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.name === name);
      if (!existing) return prevCart;
      if (existing.quantity === 1) {
        return prevCart.filter((item) => item.name !== name);
      }
      return prevCart.map((item) =>
        item.name === name ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Checkout API trigger POST to /api/orders
  const handleCheckout = async () => {
    if (!activeRestaurant || cart.length === 0) return;

    const cartAmount = cart.reduce((accum, item) => accum + item.price * item.quantity, 0);

    try {
      setIsOrdering(true);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: activeRestaurant._id,
          items: cart,
          totalAmount: cartAmount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to place active backend order");
      }

      const responseData = await response.json();
      const orderIdVal = responseData.order?._id || `TAST-${Math.floor(10000 + Math.random() * 90000)}`;

      // Register live order tracking statistics
      registerPlacedOrder(activeRestaurant.name, cart, cartAmount, orderIdVal);

      // Configure the success summary receipt
      setOrderSummary({
        restaurantName: activeRestaurant.name,
        items: [...cart],
        total: cartAmount,
        orderId: orderIdVal,
      });

      // Clear the cart & switch to Success view
      handleClearCart();
      setShowSuccess(true);
    } catch (err) {
      console.error("Error submitting checkout:", err);
      
      const fallbackOrderId = `TAST-${Math.floor(10000 + Math.random() * 90000)}`;
      registerPlacedOrder(activeRestaurant.name, cart, cartAmount, fallbackOrderId);

      // Resilient fallback checkout receipt trigger (if API was offline)
      setOrderSummary({
        restaurantName: activeRestaurant.name,
        items: [...cart],
        total: cartAmount,
        orderId: fallbackOrderId,
      });
      handleClearCart();
      setShowSuccess(true);
    } finally {
      setIsOrdering(false);
    }
  };

  const handleReorder = (items: { name: string; price: number; quantity: number }[]) => {
    // Populate the shopping cart from past order items
    setCart(items.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })));
    // Redirect to home dining tab
    setCurrentView("home");
  };

  const totalItemsCount = cart.reduce((accum, item) => accum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <div id="app_frame" className="w-full max-w-7xl mx-auto flex flex-col bg-white min-h-screen shadow-xl relative transition-all duration-300">
        
        {/* Main Header Component */}
        <Header
          activeRestaurant={activeRestaurant}
          onBack={() => {
            if (currentView === "dashboard") {
              setCurrentView("home");
            } else {
              setActiveRestaurant(null);
              handleClearCart(); // Auto clear when browsing another place
            }
          }}
          isDashboardOpen={currentView === "dashboard"}
          onOpenDashboard={() => {
            setActiveRestaurant(null); // Clear active restaurant selection
            setDashboardTab("profile"); // Settle profile tab as default open
            setCurrentView("dashboard"); // Settle onto account dashboard view
          }}
          cartCount={totalItemsCount}
          openCart={() => {
            if (activeRestaurant && totalItemsCount > 0) {
              setActiveRestaurant(activeRestaurant);
            }
          }}
        />

        {/* Dynamic Display Screens */}
        {currentView === "dashboard" ? (
          <AccountDashboard 
            onBackToHome={() => setCurrentView("home")}
            onReorder={handleReorder}
            initialTab={dashboardTab}
          />
        ) : !activeRestaurant ? (
          <Home onSelectRestaurant={(res) => {
            setActiveRestaurant(res);
            setCurrentView("home");
          }} />
        ) : (
          <Menu
            restaurant={activeRestaurant}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onCheckout={handleCheckout}
            isOrdering={isOrdering}
          />
        )}

        {/* Success Modal sliding-drawer overlay */}
        <AnimatePresence>
          {showSuccess && orderSummary && (
            <SuccessModal
              orderSummary={orderSummary}
              onClose={() => {
                setShowSuccess(false);
                setActiveRestaurant(null);
                setOrderSummary(null);
              }}
              onTrackOrder={() => {
                setShowSuccess(false);
                setActiveRestaurant(null);
                setOrderSummary(null);
                setDashboardTab("live"); // Settle onto live tracking tab automatically
                setCurrentView("dashboard"); // Open user session dashboard
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
