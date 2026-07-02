import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, ArrowRight, RotateCcw, Swords } from "lucide-react";
import { BracketNode } from "../types";

const INITIAL_CUISINES: BracketNode[] = [
  { id: "italian", title: "🇮🇹 Italian (Pizza & Fresh Pasta)", image: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" },
  { id: "japanese", title: "🇯🇵 Japanese (Sushi & Hot Ramen)", image: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)" },
  { id: "mexican", title: "🇲🇽 Mexican (Street Tacos & Quesadillas)", image: "linear-gradient(135deg, #059669 0%, #047857 100%)" },
  { id: "indian", title: "🇮🇳 Indian (Butter Chicken & Garlic Naan)", image: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)" },
  { id: "thai", title: "🇹🇭 Thai (Pad Thai & Flavorful Curries)", image: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" },
  { id: "american", title: "🇺🇸 American (Smoked BBQ & Craft Burgers)", image: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)" },
  { id: "mediterranean", title: "🥙 Mediterranean (Gyro, Hummus & Falafel)", image: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)" },
  { id: "chinese", title: "🇨🇳 Chinese (Dim Sum & Sichuan Noodles)", image: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)" },
];

interface FlavorBracketProps {
  onComplete: (winnerCuisine: string) => void;
  onBack: () => void;
}

export default function FlavorBracket({ onComplete, onBack }: FlavorBracketProps) {
  const [currentRoundNodes, setCurrentRoundNodes] = useState<BracketNode[]>(INITIAL_CUISINES);
  const [nextRoundWinners, setNextRoundWinners] = useState<BracketNode[]>([]);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);

  // Determine current round title
  const getRoundName = () => {
    if (currentRoundNodes.length === 8) return "Quarterfinals";
    if (currentRoundNodes.length === 4) return "Semifinals";
    if (currentRoundNodes.length === 2) return "The Championship";
    return "Victory";
  };

  // Opponents for current match
  const contestantA = currentRoundNodes[activeMatchIndex * 2];
  const contestantB = currentRoundNodes[activeMatchIndex * 2 + 1];

  const handleSelectWinner = (winner: BracketNode) => {
    const updatedWinners = [...nextRoundWinners, winner];
    setNextRoundWinners(updatedWinners);

    const nextMatchIndex = activeMatchIndex + 1;
    const totalMatchesInRound = currentRoundNodes.length / 2;

    if (nextMatchIndex < totalMatchesInRound) {
      // Go to next match in same round
      setActiveMatchIndex(nextMatchIndex);
    } else {
      // Current round complete! Move to next round
      if (updatedWinners.length === 1) {
        // Ultimate winner decided!
        setTimeout(() => {
          onComplete(updatedWinners[0].title);
        }, 300);
      } else {
        // Advance to next round (Semis or Finals)
        setCurrentRoundNodes(updatedWinners);
        setNextRoundWinners([]);
        setActiveMatchIndex(0);
      }
    }
  };

  const handleReset = () => {
    setCurrentRoundNodes(INITIAL_CUISINES);
    setNextRoundWinners([]);
    setActiveMatchIndex(0);
  };

  const currentMatchNum = activeMatchIndex + 1;
  const totalMatchesNum = currentRoundNodes.length / 2;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center h-[540px] justify-between text-slate-800" id="flavor-bracket-game">
      {/* Header */}
      <div className="w-full flex items-center justify-between px-4 mb-2">
        <button
          onClick={onBack}
          className="text-[10px] text-slate-400 hover:text-slate-900 flex items-center space-x-1 font-bold uppercase tracking-widest transition-colors"
          id="btn-bracket-back"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Exit Game</span>
        </button>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold text-slate-900 tracking-widest bg-slate-100 px-3 py-1 rounded-full mb-1">
            {getRoundName()}
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
            Match {currentMatchNum} of {totalMatchesNum}
          </span>
        </div>
      </div>

      {/* Main Bracket Arena */}
      <div className="w-full flex-grow flex flex-col justify-center items-center my-4 relative">
        <AnimatePresence mode="wait">
          {contestantA && contestantB ? (
            <motion.div
              key={`${getRoundName()}-${activeMatchIndex}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col space-y-4"
              id="bracket-match-node"
            >
              {/* Contestant A */}
              <button
                type="button"
                onClick={() => handleSelectWinner(contestantA)}
                id={`btn-bracket-contestant-${contestantA.id}`}
                className="w-full p-6 text-left rounded-3xl border border-slate-200 bg-white hover:border-slate-900 hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 shadow-sm flex flex-col justify-between h-[160px] relative overflow-hidden group"
              >
                <div className="absolute inset-0 opacity-10 mix-blend-multiply" style={{ background: contestantA.image }}></div>
                <div className="relative z-10 flex flex-col h-full justify-between w-full">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">
                      Option A
                    </span>
                    <Trophy className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug drop-shadow-sm">
                      {contestantA.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 font-bold flex items-center space-x-1">
                      <span>Tap to select</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </p>
                  </div>
                </div>
              </button>

              {/* VS Divider */}
              <div className="flex items-center justify-center space-x-4 py-2">
                <div className="flex-grow border-t border-slate-100"></div>
                <div className="bg-white border border-slate-200 w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
                  <Swords className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              {/* Contestant B */}
              <button
                type="button"
                onClick={() => handleSelectWinner(contestantB)}
                id={`btn-bracket-contestant-${contestantB.id}`}
                className="w-full p-6 text-left rounded-3xl border border-slate-200 bg-white hover:border-slate-900 hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 shadow-sm flex flex-col justify-between h-[160px] relative overflow-hidden group"
              >
                <div className="absolute inset-0 opacity-10 mix-blend-multiply" style={{ background: contestantB.image }}></div>
                <div className="relative z-10 flex flex-col h-full justify-between w-full">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">
                      Option B
                    </span>
                    <Trophy className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug drop-shadow-sm">
                      {contestantB.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 font-bold flex items-center space-x-1">
                      <span>Tap to select</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </p>
                  </div>
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center flex flex-col items-center justify-center space-y-4"
              id="bracket-completed-spinner"
            >
              <div className="p-4 bg-slate-100 text-slate-900 rounded-full animate-pulse border border-slate-200">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-slate-900">Cuisine Champion Found!</h4>
                <p className="text-sm text-slate-500 max-w-[240px] mx-auto mt-2 italic">
                  Searching Google Maps for the best local spots for your bracket champion...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Restart option */}
      <div className="w-full flex justify-center pt-2">
        <button
          onClick={handleReset}
          className="text-[10px] uppercase font-bold tracking-widest text-slate-500 hover:text-slate-900 flex items-center space-x-1 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm transition-colors"
          id="btn-bracket-restart"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Bracket</span>
        </button>
      </div>
    </div>
  );
}
