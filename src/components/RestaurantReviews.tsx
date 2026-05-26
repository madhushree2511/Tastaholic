import React, { useState, useEffect } from "react";
import { Star, User, MessageSquare, Calendar, LogIn, AlertCircle, Check, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getCurrentSessionUser, SessionUser } from "../firebase";

export interface Review {
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface RestaurantReviewsProps {
  restaurantId: string;
  initialReviews?: Review[];
}

export default function RestaurantReviews({ restaurantId, initialReviews = [] }: RestaurantReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);

  // Form states
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [userNameInput, setUserNameInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Set user session State
  useEffect(() => {
    const syncUser = () => {
      const user = getCurrentSessionUser();
      setCurrentUser(user);
      if (user) {
        setUserNameInput(user.name || "Valued Foodie");
      }
    };
    syncUser();
    window.addEventListener("tastaholic-auth-change", syncUser);
    return () => {
      window.removeEventListener("tastaholic-auth-change", syncUser);
    };
  }, []);

  // Sync initial reviews whenever prop updates
  useEffect(() => {
    if (initialReviews && initialReviews.length > 0) {
      setReviews(initialReviews);
    }
  }, [initialReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!currentUser) {
      setError("Please sign in to post a review.");
      return;
    }

    if (!comment.trim()) {
      setError("Please enter your comment or cooking review.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userName: userNameInput || currentUser.name || "Anonymous Foodie",
          rating,
          comment: comment.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      // Add fresh review directly to the top of our local state array
      const addedReview: Review = data.review || {
        userName: userNameInput || currentUser.name || "Anonymous Foodie",
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString()
      };

      setReviews((prev) => [addedReview, ...prev]);
      setComment("");
      setRating(5);
      setSuccessMsg("Thanks! Your delicious review has been saved in live time.");
      
      // Notify parent app or other components to fetch updated ratings if required
      window.dispatchEvent(new Event("tastaholic-order-update"));

      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Review system error:", err);
      setError(err.message || "Something went wrong. Please check again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format timestamps gracefully
  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch (e) {
      return "Just now";
    }
  };

  // Calculate aggregated average rating purely on mounted list
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-8 bg-white/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-100/30">
      
      {/* 1. Overall Metrics Indicator Header Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-900 tracking-tight font-display">
            Customer Cooking Reviews
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Read experience logs, secret highlights, or critiques from vetted community food lovers.
          </p>
        </div>

        <div className="sm:text-right shrink-0">
          <span className="text-[11px] font-extrabold text-slate-950 font-mono bg-amber-500/10 border border-amber-500/15 py-1.5 px-3.5 rounded-full uppercase tracking-wider">
            ⭐ Live Trust Factor
          </span>
        </div>
      </div>

      {/* 2. Review Form & Authentic Login Guard (Swiggy Style) */}
      <div className="bg-slate-50/50 border border-slate-100/60 rounded-3xl p-5 sm:p-6 space-y-4">
        {!currentUser ? (
          <div className="py-6 px-4 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mx-auto border border-amber-200/50 shadow-xs">
              <LogIn className="w-5 h-5 text-amber-600" />
            </div>
            <div className="max-w-xs mx-auto space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">Please login to write a review</h4>
              <p className="text-xs text-slate-400 font-medium">
                Vouched reviews help keep the Tastaholic community secure and authentic.
              </p>
            </div>
            <button
              onClick={() => {
                window.dispatchEvent(new Event("tastaholic-open-login"));
              }}
              type="button"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-extrabold py-2.5 px-6 rounded-2xl text-xs transition-all shadow-md shadow-amber-500/15 cursor-pointer font-display"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-950" />
              <span>LOG IN NOW</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xs font-black tracking-widest text-slate-450 uppercase font-mono">
                Submit Your Authentic Experience
              </h4>
              <span className="text-[10px] font-semibold text-slate-400">
                Aided by phone authentication profile: <strong className="text-slate-700">{currentUser.name || "Foodie"}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Optional Name Override Form */}
              <div className="md:col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Your Public Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-3.5 h-3.5 text-slate-450" />
                  </div>
                  <input
                    type="text"
                    value={userNameInput}
                    onChange={(e) => setUserNameInput(e.target.value)}
                    placeholder="E.g., Neha G."
                    required
                    className="w-full bg-white hover:bg-white/50 border border-slate-200 focus:border-amber-500 pl-9 pr-3 py-2.5 rounded-xl text-slate-800 font-semibold text-xs outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Responsive Star Clickable Selector */}
              <div className="md:col-span-8 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                  How was your culinary experience? (1-5 Star Selection)
                </label>
                <div className="flex items-center gap-1.5 pt-1.5 h-[38px]">
                  {[1, 2, 3, 4, 5].map((starIdx) => {
                    const isLit = hoveredRating !== null ? hoveredRating >= starIdx : rating >= starIdx;
                    return (
                      <button
                        key={starIdx}
                        type="button"
                        onClick={() => setRating(starIdx)}
                        onMouseEnter={() => setHoveredRating(starIdx)}
                        onMouseLeave={() => setHoveredRating(null)}
                        className="transition-transform active:scale-90 hover:scale-110 cursor-pointer outline-none focus:outline-none"
                        title={`${starIdx} Star rating`}
                      >
                        <Star 
                          className={`w-5 h-5 stroke-2.5 transition-colors ${
                            isLit 
                              ? "fill-amber-500 text-amber-500" 
                              : "text-slate-300 fill-none"
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="text-xs font-extrabold text-slate-500 font-sans ml-2">
                    {rating === 5 ? "Loved it! (5/5)" : rating === 4 ? "Good Choice (4/5)" : rating === 3 ? "Average (3/5)" : rating === 2 ? "Inadequate (2/5)" : "Worst (1/5)"}
                  </span>
                </div>
              </div>

              {/* Review Textarea Content */}
              <div className="md:col-span-12 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Your Dishes Critique & Feedback
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3.5 text-slate-350">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                  </div>
                  <textarea
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about the ingredients, cook quality, delivery safety, heat level, or visual presentation..."
                    required
                    className="w-full bg-white hover:bg-white/50 border border-slate-200 focus:border-amber-500 pl-10 pr-4 py-3 rounded-2xl text-slate-800 font-semibold text-xs outline-none transition-all placeholder:text-slate-400 resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Error Actions & Live Status Markers */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-xl text-xs font-extrabold flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 animate-bounce" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-slate-900 hover:bg-slate-850 active:scale-98 text-white font-extrabold py-2.5 px-6 rounded-2xl text-xs transition-all shadow-sm tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-45"
              >
                <span>SUBMIT REVIEW NOW</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 3. Render Reviews List History inside Swiggy Container */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-450 border-b border-slate-100 pb-2 flex items-center gap-2">
          <span>Reviews Feed</span>
          <span className="bg-slate-100 text-slate-600 text-[10px] py-0.5 px-2 rounded-full font-sans font-bold">{reviews.length}</span>
        </h4>

        {reviews.length === 0 ? (
          <div className="py-12 border border-dashed border-slate-200 rounded-3xl text-center space-y-3 bg-slate-50/20">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <HelpCircle className="w-6 h-6 text-slate-300" />
            </div>
            <div className="space-y-1 max-w-xs mx-auto">
              <h5 className="font-bold text-slate-800 text-sm">No reviews yet</h5>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Be the first foodie helper to review dishes from this elite outlet!
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map((rev, index) => {
              // Create dynamic avatar letter
              const firstChar = rev.userName ? rev.userName.charAt(0).toUpperCase() : "F";
              const dateLabel = formatDate(rev.createdAt);

              return (
                <div key={index} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                  {/* Avatar Letter Box */}
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-250 flex items-center justify-center text-slate-800 text-sm font-sans font-black uppercase shrink-0">
                    {firstChar}
                  </div>

                  {/* Comment Details Column */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-slate-800 text-sm">{rev.userName}</h5>
                        <div className="flex items-center gap-1">
                          <div className="flex gap-0.5 text-amber-500">
                            {[1, 2, 3, 4, 5].map((st) => (
                              <Star 
                                key={st} 
                                className={`w-3 h-3 ${rev.rating >= st ? "fill-amber-500 stroke-amber-500" : "text-slate-200"}`} 
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-450 font-medium tracking-tight">
                            ({rev.rating}/5)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                        <span>{dateLabel}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-semibold font-sans">
                      {rev.comment}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
