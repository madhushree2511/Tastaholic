import { useState, useEffect } from "react";
import { Star, Search, Clock, ArrowRight, Utensils, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { Restaurant, getDeliveryTime } from "../types";

interface HomeProps {
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export function Home({ onSelectRestaurant }: HomeProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        // Hit the server search API when a search query is present
        const url = searchQuery.trim()
          ? `/api/restaurants/search?q=${encodeURIComponent(searchQuery)}`
          : "/api/restaurants";

        const res = await fetch(url);
        if (!res.ok) throw new Error("Could not retrieve restaurant list");
        const data = await res.json();
        if (active) {
          setRestaurants(data);
          setError(null);
        }
      } catch (err: any) {
        console.error("Fetch restaurants error:", err);
        if (active) setError("Could not connect to the catalog server.");
      } finally {
        if (active) setLoading(false);
      }
    };

    // Debounce live searching to prevent excessive database overload
    const delayDebounceFn = setTimeout(() => {
      fetchRestaurants();
    }, 250);

    return () => {
      active = false;
      clearTimeout(delayDebounceFn);
    };
  }, [searchQuery]);

  const filteredRestaurants = restaurants.filter((r) => {
    let matchesSearch = true;

    if (searchQuery.trim()) {
      const words = searchQuery.split(" ").filter((w) => w.trim() !== "");
      const matchesName = words.every((word) =>
        r.name.toLowerCase().includes(word.toLowerCase())
      );
      const matchesCuisine = words.every((word) =>
        r.cuisine.toLowerCase().includes(word.toLowerCase())
      );
      const matchesMenu = r.menu?.some((item) =>
        words.every((word) => item.name.toLowerCase().includes(word.toLowerCase()))
      );

      matchesSearch = matchesName || matchesCuisine || !!matchesMenu;
    }
    
    if (selectedCuisine === "All") return matchesSearch;
    
    // Categorize by simplified tags
    if (selectedCuisine === "Mughlai") return matchesSearch && r.cuisine.toLowerCase().includes("mughlai");
    if (selectedCuisine === "North Indian") return matchesSearch && r.cuisine.toLowerCase().includes("north");
    if (selectedCuisine === "South Indian") return matchesSearch && r.cuisine.toLowerCase().includes("south");
    if (selectedCuisine === "Healthy") return matchesSearch && (r.cuisine.toLowerCase().includes("healthy") || r.cuisine.toLowerCase().includes("cooking"));
    if (selectedCuisine === "Italian") return matchesSearch && r.cuisine.toLowerCase().includes("italian");
    if (selectedCuisine === "Asian") return matchesSearch && r.cuisine.toLowerCase().includes("asian");
    if (selectedCuisine === "Diner") return matchesSearch && r.cuisine.toLowerCase().includes("diner");
    
    return matchesSearch;
  });

  const cuisinesList = ["All", "Mughlai", "North Indian", "South Indian", "Healthy", "Italian", "Asian", "Diner"];

  if (loading && restaurants.length === 0) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-xs">
              <div className="h-48 bg-slate-200 animate-pulse" />
              <div className="p-5 space-y-4">
                <div className="h-6 bg-slate-200 rounded-sm w-2/3 animate-pulse" />
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-200 rounded-sm w-1/3 animate-pulse" />
                  <div className="h-5 bg-slate-200 rounded-sm w-12 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center space-y-4 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
          <Utensils className="w-8 h-8" />
        </div>
        <h3 className="font-display font-bold text-lg text-slate-800">Connection Offline</h3>
        <p className="text-sm text-slate-500 max-w-xs">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/10"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto pb-12 w-full max-w-7xl mx-auto">
      {/* Interactive Hero Banner */}
      <div className="p-6">
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-amber-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden min-h-[220px] flex items-center">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="relative z-10 max-w-2xl">
            <span className="bg-amber-500/20 text-amber-300 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full font-mono">
              Premium Dining Delivery
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl mt-3 tracking-tight leading-tight">
              Delicious cravings, delivered lightning-fast.
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-lg">
              Express Delivery from five-star premium kitchens and authentic street landmarks to your luxury home or laptop desk. Order today.
            </p>
          </div>
          <div className="absolute bottom-6 right-6 hidden md:flex bg-white/10 backdrop-blur-md p-3.5 rounded-full border border-white/10 animate-bounce">
            <ArrowRight className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Modern Filter Engine Section */}
      <div className="px-6 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search menus, cuisines, biryani..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-sans placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-xs"
          />
        </div>

        {/* Categories Tab Selector */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {cuisinesList.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCuisine(c)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-tight whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCuisine === c
                  ? "bg-slate-900 text-amber-400 shadow-md"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant Bento-Grid Feed */}
      <div className="px-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-display font-extrabold text-slate-900 text-lg tracking-tight">
            Handpicked Curated Premium Catalogs ({filteredRestaurants.length})
          </h3>
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span>Express Online Service</span>
          </div>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <p className="text-base font-semibold">No matches found for "{searchQuery}" in category "{selectedCuisine}"</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCuisine("All");
              }}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((res, index) => (
              <motion.div
                key={res._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                onClick={() => onSelectRestaurant(res)}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-xl hover:border-slate-200 transition-all duration-300 cursor-pointer hover:-translate-y-1"
              >
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={res.image}
                    alt={res.name}
                    aria-label={res.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop";
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-md">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="text-sm font-black text-slate-800 font-mono leading-none">
                      {res.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl text-white flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{getDeliveryTime(res.name)}</span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-display font-extrabold text-slate-900 text-lg leading-snug group-hover:text-amber-500 transition-colors">
                        {res.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 font-sans">
                        {res.cuisine}
                      </p>
                      <div className="flex items-start gap-1 mt-2 text-xs text-slate-400 font-medium leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <span className="truncate max-w-[180px] sm:max-w-[200px]" title={res.address}>
                          {res.address || "Bengaluru, KA"}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 p-2.5 rounded-2xl text-slate-700 transition-all duration-300">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
