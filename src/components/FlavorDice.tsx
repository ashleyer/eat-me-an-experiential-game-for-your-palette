import { useState } from "react";
import { motion, useAnimation } from "motion/react";
import { RotateCcw, Sparkles, Search } from "lucide-react";

interface FlavorDiceProps {
  onComplete: (query: string) => void;
  onBack: () => void;
}

interface CuisineOption {
  cuisine: string;
  emoji: string;
  vibe: string;
  color: string;
}

const CUISINES: CuisineOption[] = [
  { cuisine: "Pizza & Italian", emoji: "🍕", vibe: "Cheesy, comforting carb heaven", color: "bg-red-50 text-red-700 border-red-200" },
  { cuisine: "Tacos & Mexican", emoji: "🌮", vibe: "Zesty, spicy, and full of flavor", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { cuisine: "Sushi & Japanese", emoji: "🍣", vibe: "Fresh, delicate, and beautifully crafted", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { cuisine: "Burgers & American", emoji: "🍔", vibe: "Juicy, savory, classic satisfying comfort", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { cuisine: "Curry & Indian", emoji: "🍛", vibe: "Rich, aromatic, spice-infused warmth", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { cuisine: "Pasta & Bistro", emoji: "🍝", vibe: "Elegant, savory, slow-simmered sauces", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { cuisine: "Ramen & Noodles", emoji: "🍜", vibe: "Warm, rich, savory broth and perfect bite", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { cuisine: "Dim Sum & Chinese", emoji: "🥟", vibe: "Steam-fresh, savory bites of happiness", color: "bg-rose-50 text-rose-700 border-rose-200" }
];

export default function FlavorDice({ onComplete, onBack }: FlavorDiceProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [currentCuisine, setCurrentCuisine] = useState<CuisineOption | null>(null);
  const controls = useAnimation();

  const rollDice = async () => {
    if (isRolling) return;
    setIsRolling(true);
    setCurrentCuisine(null);

    // Rapidly change the shown cuisine to simulate rolling
    let count = 0;
    const interval = setInterval(() => {
      const randIdx = Math.floor(Math.random() * CUISINES.length);
      setCurrentCuisine(CUISINES[randIdx]);
      count++;
    }, 100);

    // Run custom complex 3D rotation, shake, and scale animations
    await controls.start({
      rotate: [0, -10, 15, -15, 360, 720],
      scale: [1, 1.2, 0.9, 1.15, 1],
      y: [0, -40, 10, -15, 0],
      transition: { duration: 1.8, ease: "easeInOut" }
    });

    clearInterval(interval);
    
    // Pick the final winner
    const winner = CUISINES[Math.floor(Math.random() * CUISINES.length)];
    setCurrentCuisine(winner);
    setIsRolling(false);
  };

  const handleSearch = () => {
    if (currentCuisine) {
      onComplete(`Cuisine Dice Selection: ${currentCuisine.cuisine}`);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center h-[540px] justify-between text-slate-800" id="flavor-dice-game">
      {/* Header */}
      <div className="w-full flex items-center justify-between px-4 mb-2">
        <button
          onClick={onBack}
          className="text-[10px] text-slate-400 hover:text-slate-900 flex items-center space-x-1 font-bold uppercase tracking-widest transition-colors"
          id="btn-dice-back"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
        <span className="text-[10px] text-slate-900 font-bold tracking-widest bg-slate-100 px-3 py-1.5 rounded-full uppercase">
          Cuisine Dice Roll
        </span>
      </div>

      {/* Dice Container */}
      <div className="flex-grow flex flex-col items-center justify-center my-4">
        <motion.div
          animate={controls}
          onClick={rollDice}
          className={`w-40 h-40 rounded-[2.5rem] bg-white border-4 border-slate-900 flex flex-col items-center justify-center cursor-pointer select-none shadow-2xl relative transition-all duration-200 hover:scale-105 ${
            isRolling ? "pointer-events-none" : ""
          }`}
          style={{ transformStyle: "preserve-3d" }}
          id="visual-cuisine-dice"
        >
          {/* Subtle dots representing die sides */}
          <div className="absolute top-4 left-4 w-3.5 h-3.5 bg-slate-200 rounded-full"></div>
          <div className="absolute top-4 right-4 w-3.5 h-3.5 bg-slate-200 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-3.5 h-3.5 bg-slate-200 rounded-full"></div>
          <div className="absolute bottom-4 right-4 w-3.5 h-3.5 bg-slate-200 rounded-full"></div>

          {currentCuisine ? (
            <div className="flex flex-col items-center space-y-1">
              <span className="text-6xl drop-shadow-md">{currentCuisine.emoji}</span>
              <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mt-2">
                ROLL!
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <span className="text-6xl">🎲</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 animate-pulse">
                Tap to Roll
              </span>
            </div>
          )}
        </motion.div>

        {/* Selected Cuisine Details */}
        <div className="h-24 mt-8 flex flex-col items-center justify-center text-center px-6">
          {currentCuisine && !isRolling ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border ${currentCuisine.color} max-w-sm flex flex-col items-center shadow-sm`}
            >
              <div className="flex items-center space-x-1 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>The Culinary Dice lands on {currentCuisine.cuisine}!</span>
              </div>
              <span className="text-xs italic mt-1 opacity-90">"{currentCuisine.vibe}"</span>
            </motion.div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              {isRolling ? "Rolling the cosmic dice of flavor..." : "Let luck guide your dinner plans tonight."}
            </p>
          )}
        </div>
      </div>

      {/* Action Deck */}
      <div className="w-full px-4 pb-2">
        {currentCuisine && !isRolling ? (
          <button
            onClick={handleSearch}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-full transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
            id="btn-dice-search"
          >
            <Search className="w-4 h-4" />
            <span>Search {currentCuisine.cuisine} Spots</span>
          </button>
        ) : (
          <button
            onClick={rollDice}
            disabled={isRolling}
            className="w-full py-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-900 border border-slate-200 font-bold text-sm rounded-full transition-all flex items-center justify-center space-x-2"
            id="btn-dice-roll-main"
          >
            <span>Roll Dice</span>
          </button>
        )}
      </div>
    </div>
  );
}
