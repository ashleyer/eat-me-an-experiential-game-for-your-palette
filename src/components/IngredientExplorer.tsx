import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, Plus, X, Sparkles, Search } from "lucide-react";

interface IngredientExplorerProps {
  onComplete: (query: string) => void;
  onBack: () => void;
}

const POPULAR_SUGGESTIONS = [
  { name: "Avocado", emoji: "🥑" },
  { name: "Salmon", emoji: "🐟" },
  { name: "Truffle", emoji: "🍄" },
  { name: "Cilantro", emoji: "🌿" },
  { name: "Garlic", emoji: "🧄" },
  { name: "Chili", emoji: "🌶️" },
  { name: "Cheese", emoji: "🧀" },
  { name: "Bacon", emoji: "🥓" },
  { name: "Matcha", emoji: "🍵" },
  { name: "Mango", emoji: "🥭" }
];

export default function IngredientExplorer({ onComplete, onBack }: IngredientExplorerProps) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState("");

  const handleAddIngredient = (name: string) => {
    const cleaned = name.trim();
    if (!cleaned) return;
    if (ingredients.some((ing) => ing.toLowerCase() === cleaned.toLowerCase())) {
      setInputVal("");
      return;
    }
    setIngredients([...ingredients, cleaned]);
    setInputVal("");
  };

  const handleRemoveIngredient = (indexToRemove: number) => {
    setIngredients(ingredients.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddIngredient(inputVal);
    }
  };

  const handleSubmit = () => {
    if (ingredients.length === 0) return;
    const query = `Find specific dishes at local restaurants featuring ingredients: ${ingredients.join(", ")}.`;
    onComplete(query);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-[540px] text-slate-800" id="ingredient-explorer-game">
      {/* Header */}
      <div className="w-full flex items-center justify-between px-4 mb-2">
        <button
          onClick={onBack}
          className="text-[10px] text-slate-400 hover:text-slate-900 flex items-center space-x-1 font-bold uppercase tracking-widest transition-colors"
          id="btn-ingredients-back"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
        <span className="text-[10px] text-slate-900 font-bold tracking-widest bg-slate-100 px-3 py-1.5 rounded-full uppercase">
          Ingredient Alchemist
        </span>
      </div>

      {/* Main Form container */}
      <div className="flex-grow flex flex-col justify-between my-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-violet-500"></div>

        <div>
          {/* Visual guidance */}
          <div className="text-center mb-6">
            <span className="text-[9px] font-extrabold text-violet-600 uppercase tracking-widest block mb-1">Ingredient Search</span>
            <h3 className="text-2xl font-bold text-slate-900 leading-none">Craving Alchemy</h3>
            <p className="text-xs text-slate-400 mt-2 italic leading-relaxed">
              Combine your favorite ingredients, we'll locate local dishes featuring them.
            </p>
          </div>

          {/* Tag input section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 focus-within:border-slate-900 rounded-2xl px-4 py-1">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type ingredient & press Enter..."
                className="w-full bg-transparent outline-none py-2 text-sm text-slate-900 placeholder-slate-400 font-medium"
                id="input-ingredient-custom"
              />
              <button
                onClick={() => handleAddIngredient(inputVal)}
                type="button"
                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors"
                title="Add ingredient"
                id="btn-add-ingredient-custom"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Current Ingredient Chips */}
            <div className="flex flex-wrap gap-2 min-h-[44px] p-1 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 items-center justify-center max-h-[110px] overflow-y-auto">
              {ingredients.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No ingredients added yet...</span>
              ) : (
                <AnimatePresence>
                  {ingredients.map((ing, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="inline-flex items-center space-x-1 text-xs font-bold uppercase tracking-wider bg-violet-50 border border-violet-100 text-violet-700 px-3 py-1.5 rounded-full"
                    >
                      <span>{ing}</span>
                      <button
                        onClick={() => handleRemoveIngredient(idx)}
                        className="p-0.5 hover:bg-violet-100 rounded-full transition-colors"
                        title="Remove"
                        id={`btn-remove-ing-${idx}`}
                      >
                        <X className="w-3 h-3 text-violet-500" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Popular Suggestions */}
          <div className="mt-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Try adding these:</span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SUGGESTIONS.map((sug) => {
                const isSelected = ingredients.some((ing) => ing.toLowerCase() === sug.name.toLowerCase());
                return (
                  <button
                    key={sug.name}
                    onClick={() => handleAddIngredient(sug.name)}
                    disabled={isSelected}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center space-x-1 ${
                      isSelected
                        ? "bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-900 hover:bg-slate-50"
                    }`}
                    id={`btn-sug-ing-${sug.name}`}
                  >
                    <span>{sug.emoji}</span>
                    <span className="font-semibold">{sug.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Submit */}
        <button
          onClick={handleSubmit}
          disabled={ingredients.length === 0}
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm rounded-full transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 mt-4"
          id="btn-submit-ingredients"
        >
          <Search className="w-4 h-4" />
          <span>Cook with Ingredients</span>
        </button>
      </div>
    </div>
  );
}
