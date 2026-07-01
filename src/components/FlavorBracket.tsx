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
    <div className="w-full max-w-md mx-auto flex flex-col items-center h-[540px] justify-between text-slate-100" id="flavor-bracket-game">
      {/* Header */}
      <div className="w-full flex items-center justify-between px-4 mb-2">
        <button
          onClick={onBack}
          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 font-mono uppercase tracking-wider"
          id="btn-bracket-back"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Exit Game</span>
        </button>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-mono font-bold text-amber-500 tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full mb-1">
            {getRoundName()}
          </span>
          <span className="text-xs text-slate-400 font-mono">
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
                className="w-full p-6 text-left rounded-2xl border border-slate-800 hover:border-amber-500/50 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 shadow-xl flex flex-col justify-between h-[150px] relative overflow-hidden group"
                style={{ background: contestantA.image }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent"></div>
                <div className="relative z-10 flex flex-col h-full justify-between w-full">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-white/70 font-bold bg-white/10 px-2 py-0.5 rounded">
                      Option A
                    </span>
                    <Trophy className="w-4 h-4 text-white/50 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight leading-snug drop-shadow-md">
                      {contestantA.title}
                    </h3>
                    <p className="text-xs text-white/80 font-mono mt-1 font-semibold drop-shadow-sm flex items-center space-x-1">
                      <span>Tap to select</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </p>
                  </div>
                </div>
              </button>

              {/* VS Divider */}
              <div className="flex items-center justify-center space-x-4 py-1">
                <div className="flex-grow border-t border-slate-800/80"></div>
                <div className="bg-slate-950 border border-slate-800 w-9 h-9 rounded-full flex items-center justify-center shadow-md">
                  <Swords className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-grow border-t border-slate-800/80"></div>
              </div>

              {/* Contestant B */}
              <button
                type="button"
                onClick={() => handleSelectWinner(contestantB)}
                id={`btn-bracket-contestant-${contestantB.id}`}
                className="w-full p-6 text-left rounded-2xl border border-slate-800 hover:border-amber-500/50 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 shadow-xl flex flex-col justify-between h-[150px] relative overflow-hidden group"
                style={{ background: contestantB.image }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent"></div>
                <div className="relative z-10 flex flex-col h-full justify-between w-full">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-white/70 font-bold bg-white/10 px-2 py-0.5 rounded">
                      Option B
                    </span>
                    <Trophy className="w-4 h-4 text-white/50 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight leading-snug drop-shadow-md">
                      {contestantB.title}
                    </h3>
                    <p className="text-xs text-white/80 font-mono mt-1 font-semibold drop-shadow-sm flex items-center space-x-1">
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
              <div className="p-4 bg-amber-500/10 text-amber-400 rounded-full animate-pulse border border-amber-500/20">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Cuisine Champion Found!</h4>
                <p className="text-xs text-slate-400 max-w-[240px] mx-auto mt-1">
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
          className="text-xs text-slate-500 hover:text-slate-300 flex items-center space-x-1 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-900 transition-colors font-mono"
          id="btn-bracket-restart"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Bracket</span>
        </button>
      </div>
    </div>
  );
}
