import { useState } from "react";
import { motion } from "motion/react";
import { RotateCcw, Search } from "lucide-react";

interface MysteryMealProps {
  onComplete: (query: string) => void;
  onBack: () => void;
}

export default function MysteryMeal({ onComplete, onBack }: MysteryMealProps) {
  const [mood, setMood] = useState("");
  const [diet, setDiet] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood.trim()) return;
    const dietText = diet.trim() ? ` with ${diet} dietary restrictions` : "";
    const query = `A Mystery Meal for someone feeling '${mood}'${dietText}. Suggest a highly-rated, unique specific dish from a local restaurant!`;
    onComplete(query);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-[540px] text-slate-800">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="text-[10px] text-slate-400 hover:text-slate-900 flex items-center space-x-1 font-bold uppercase tracking-widest transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex-grow relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-fuchsia-500"></div>
        <div className="text-center mb-8">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Surprise Me</span>
          <h3 className="text-3xl font-bold text-slate-900">Mystery Meal</h3>
          <p className="text-sm text-slate-500 mt-2 italic">Tell us your vibe, we'll pick the perfect dish.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Current Mood</label>
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="e.g. adventurous, comforting, light"
              required
              className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-2xl px-5 py-3 text-sm text-slate-900 outline-none transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Dietary Restrictions (Optional)</label>
            <input
              type="text"
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              placeholder="e.g. vegetarian, gluten-free"
              className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-2xl px-5 py-3 text-sm text-slate-900 outline-none transition-all font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={!mood.trim()}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm rounded-full transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 mt-4"
          >
            <Search className="w-4 h-4" />
            <span>Find My Mystery Meal</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
