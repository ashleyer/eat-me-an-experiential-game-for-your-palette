import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { RotateCcw, Trophy, CheckCircle, Search } from "lucide-react";

interface FoodieChallengesProps {
  onComplete: (query: string) => void;
  onBack: () => void;
}

const CHALLENGES = [
  "Try a dish you've never had before from a local Thai restaurant.",
  "Find and review a hidden gem café.",
  "Order the chef's special at a local diner.",
  "Try a plant-based or vegan meal at a highly-rated spot.",
  "Find the best local street food or food truck.",
  "Eat at a restaurant with less than 50 reviews but over 4.5 stars."
];

export default function FoodieChallenges({ onComplete, onBack }: FoodieChallengesProps) {
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [activeChallenge, setActiveChallenge] = useState("");

  useEffect(() => {
    const savedPoints = localStorage.getItem("foodie_points");
    const savedStreak = localStorage.getItem("foodie_streak");
    if (savedPoints) setPoints(parseInt(savedPoints));
    if (savedStreak) setStreak(parseInt(savedStreak));
    
    generateNewChallenge();
  }, []);

  const generateNewChallenge = () => {
    const random = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
    setActiveChallenge(random);
  };

  const completeChallenge = () => {
    const newPoints = points + 50;
    const newStreak = streak + 1;
    setPoints(newPoints);
    setStreak(newStreak);
    localStorage.setItem("foodie_points", newPoints.toString());
    localStorage.setItem("foodie_streak", newStreak.toString());
    generateNewChallenge();
  };

  const findChallengeSpots = () => {
    onComplete(`Foodie Challenge: ${activeChallenge}`);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-[540px] text-slate-800">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-[10px] text-slate-400 hover:text-slate-900 flex items-center space-x-1 font-bold uppercase tracking-widest transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Points</span>
            <span className="text-sm font-bold text-slate-900">{points}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Streak</span>
            <span className="text-sm font-bold text-orange-500">{streak} 🔥</span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex-grow relative overflow-hidden flex flex-col justify-center"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <Trophy className="w-8 h-8 text-amber-500" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Daily Challenge</span>
          <h3 className="text-2xl font-bold text-slate-900 leading-snug">{activeChallenge}</h3>
        </div>

        <div className="flex flex-col space-y-3 mt-auto">
          <button
            onClick={findChallengeSpots}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-full transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Search Local Spots</span>
          </button>
          
          <button
            onClick={completeChallenge}
            className="w-full py-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-sm rounded-full transition-all border border-emerald-200 flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark as Completed (+50 pts)</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
