import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, X, RotateCcw, Award } from "lucide-react";
import { SwipeCard } from "../types";

const SWIPE_CARDS: SwipeCard[] = [
  {
    id: "cheesy",
    title: "🧀 Cheesy & Melting",
    tags: ["Pizza", "Burgers", "Melted Quesadillas"],
    vibe: "Warm, gooey, decadent comfort that stretches with every bite.",
    image: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    cuisine: "Italian Pizza, Gourmet Burgers, or Cheesy Mexican",
  },
  {
    id: "spicy",
    title: "🌶️ Fiery & Bold",
    tags: ["Thai Curry", "Spicy Sichuan", "Buffalo Wings"],
    vibe: "Intense heat, rich spices, and flavor that kicks you wide awake.",
    image: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
    cuisine: "Spicy Thai, Authentic Sichuan Chinese, or Spicy Indian Curry",
  },
  {
    id: "fresh",
    title: "🍣 Fresh & Clean",
    tags: ["Sushi Rolls", "Poke Bowls", "Crisp Salads"],
    vibe: "Light, refreshing, raw or perfectly seared ingredients that feel clean.",
    image: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
    cuisine: "Japanese Sushi, Hawaiian Poke, or Fresh Salad & Grain Bowls",
  },
  {
    id: "savory",
    title: "🍖 Slow-Cooked & Smoked",
    tags: ["Smoked BBQ", "Rich Ramen", "Slow-Braised Stews"],
    vibe: "Deep, slow-simmered umami flavor that melts in your mouth.",
    image: "linear-gradient(135deg, #78350f 0%, #451a03 100%)",
    cuisine: "American Smoked BBQ, Traditional Japanese Ramen, or Hearty Bistro Stews",
  },
  {
    id: "crispy",
    title: "🍗 Golden & Crispy",
    tags: ["Fried Chicken", "Fish & Chips", "Crispy Tempura"],
    vibe: "An addictive, audible crunch yielding to a juicy, tender center.",
    image: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)",
    cuisine: "Korean Fried Chicken, British Fish & Chips, or Crispy Asian Fritters",
  },
  {
    id: "sweet",
    title: "🥞 Sweet & Decadent",
    tags: ["Waffles", "Artisanal Gelato", "Dessert Crepes"],
    vibe: "A sweet celebration of chocolate, berries, cream, or warm pastry.",
    image: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
    cuisine: "Artisanal Desserts, French Creperie, or Sweet Breakfast Waffles",
  },
];

interface FlavorSwiperProps {
  onComplete: (winnerCuisine: string) => void;
  onBack: () => void;
}

export default function FlavorSwiper({ onComplete, onBack }: FlavorSwiperProps) {
  const [cards, setCards] = useState<SwipeCard[]>(SWIPE_CARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedCuisines, setLikedCuisines] = useState<string[]>([]);
  const [exitX, setExitX] = useState<number>(0);

  const activeCard = cards[currentIndex];

  const handleSwipe = (liked: boolean) => {
    if (!activeCard) return;

    if (liked) {
      setLikedCuisines((prev) => [...prev, activeCard.cuisine]);
    }

    setExitX(liked ? 300 : -300);

    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      
      // If we finished all cards
      if (nextIndex >= cards.length) {
        const finalLikes = liked ? [...likedCuisines, activeCard.cuisine] : likedCuisines;
        determineWinner(finalLikes);
      }
    }, 200);
  };

  const determineWinner = (likes: string[]) => {
    if (likes.length > 0) {
      // Pick a random one from liked ones, or the last one liked
      const winner = likes[likes.length - 1];
      onComplete(winner);
    } else {
      // Pick a random card overall if they swiped left on everything
      const fallback = cards[Math.floor(Math.random() * cards.length)].cuisine;
      onComplete(fallback);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setLikedCuisines([]);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center h-[540px] justify-between text-slate-100" id="flavor-swiper-game">
      {/* Game Header */}
      <div className="w-full flex items-center justify-between px-4 mb-2">
        <button
          onClick={onBack}
          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 font-mono uppercase tracking-wider"
          id="btn-swiper-back"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Exit Game</span>
        </button>
        <span className="text-xs text-amber-400 font-mono font-bold tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-full">
          CRAVING SWIPER: {Math.min(currentIndex + 1, cards.length)} / {cards.length}
        </span>
      </div>

      {/* Card Deck Area */}
      <div className="relative w-full flex-grow flex items-center justify-center my-4 h-[340px]">
        <AnimatePresence mode="wait">
          {currentIndex < cards.length ? (
            <motion.div
              key={activeCard.id}
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ x: exitX, opacity: 0, scale: 0.9, rotate: exitX / 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="absolute w-full max-w-[340px] h-full rounded-2xl p-6 flex flex-col justify-between border border-slate-800 shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
              style={{ background: activeCard.image }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100) {
                  handleSwipe(true);
                } else if (info.offset.x < -100) {
                  handleSwipe(false);
                }
              }}
              id={`swiper-card-${activeCard.id}`}
            >
              {/* Card top banner */}
              <div className="flex flex-col space-y-1">
                <span className="text-xs font-mono font-semibold uppercase tracking-widest text-white/70">
                  Flavor Vibe
                </span>
                <h3 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md">
                  {activeCard.title}
                </h3>
              </div>

              {/* Card body description */}
              <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 my-2 flex-grow flex flex-col justify-center">
                <p className="text-sm leading-relaxed text-white font-medium drop-shadow-sm mb-3">
                  "{activeCard.vibe}"
                </p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {activeCard.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono font-semibold bg-white/20 text-white px-2.5 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Helper instruction */}
              <div className="text-center text-[10px] text-white/50 font-mono tracking-wider">
                Swipe Right to Yum | Left to Nah
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center flex flex-col items-center justify-center space-y-4"
              id="swiper-complete-loading"
            >
              <div className="p-4 bg-amber-500/10 text-amber-400 rounded-full animate-pulse border border-amber-500/20">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Cravings Calculated!</h4>
                <p className="text-xs text-slate-400 max-w-[240px] mx-auto mt-1">
                  Synthesizing your culinary profile to search local menus...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Buttons Deck */}
      {currentIndex < cards.length && (
        <div className="w-full flex justify-center items-center space-x-6 pb-2" id="swiper-buttons-container">
          <button
            onClick={() => handleSwipe(false)}
            id="btn-swiper-nah"
            className="w-14 h-14 bg-slate-950 border border-slate-800 text-rose-500 hover:text-white hover:bg-rose-600 hover:border-rose-500 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl"
            title="Pass"
          >
            <X className="w-6 h-6" />
          </button>
          
          <button
            onClick={handleReset}
            id="btn-swiper-restart"
            className="w-10 h-10 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-full flex items-center justify-center transition-all duration-200"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleSwipe(true)}
            id="btn-swiper-yum"
            className="w-14 h-14 bg-slate-950 border border-slate-800 text-emerald-400 hover:text-slate-950 hover:bg-emerald-400 hover:border-emerald-400 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl"
            title="Yum!"
          >
            <Heart className="w-6 h-6 fill-current" />
          </button>
        </div>
      )}
    </div>
  );
}
