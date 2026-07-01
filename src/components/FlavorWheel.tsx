import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Compass, Sparkles, RotateCcw } from "lucide-react";
import { WheelSector } from "../types";

const SECTORS: WheelSector[] = [
  { id: "comfort", label: "🍔 Comfort Food", cuisine: "Gourmet Burgers, Fries, and Pizza", color: "#f59e0b", description: "Savory, hearty satisfying bites." },
  { id: "spicy", label: "🌶️ Spicy Adventure", cuisine: "Spicy Thai, Sichuan, or Indian Curry", color: "#ef4444", description: "Bold, aromatic spices with a kick." },
  { id: "healthy", label: "🥗 Healthy Eats", cuisine: "Fresh Salad, Poke, or Grain Bowls", color: "#10b981", description: "Light, energizing, organic flavors." },
  { id: "street", label: "🌮 Street Treats", cuisine: "Mexican Street Tacos, Gyros, or Falafel", color: "#3b82f6", description: "Quick, flavorful local hand-held classics." },
  { id: "sweet", label: "🍰 Sweet Tooth", cuisine: "Artisanal Desserts, Crepes, or Bakery Sweets", color: "#ec4899", description: "Sweet desserts and decadent pastries." },
  { id: "soup", label: "🍜 Warm Bowls", cuisine: "Hot Japanese Ramen, Pho, or Dumplings", color: "#8b5cf6", description: "Cozy, slow-simmered broths & noodles." },
];

interface FlavorWheelProps {
  onComplete: (winnerCuisine: string) => void;
  onBack: () => void;
}

export default function FlavorWheel({ onComplete, onBack }: FlavorWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [chosenSector, setChosenSector] = useState<WheelSector | null>(null);
  
  const currentRotationRef = useRef(0);
  const tickCountRef = useRef(0);

  // Play a satisfying synthesized mechanical tick sound using Web Audio API
  const playTickSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Audio context might be suspended/blocked by browser policy
    }
  };

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setChosenSector(null);

    // Randomize a number of spins + target index
    const totalSectors = SECTORS.length;
    const targetSectorIndex = Math.floor(Math.random() * totalSectors);
    const sectorAngle = 360 / totalSectors;
    
    // We want the winner to land exactly under the pointer (at the top: 270 deg)
    // Formula: pointer is at 270 deg (top). The wheel rotates clockwise.
    // Each slice starts at index * sectorAngle.
    // To land slice `i` under the pointer:
    // angle = 270 - (i * sectorAngle) - (sectorAngle / 2)
    // Let's add multiple full spins (e.g. 5 spins = 1800 degrees)
    const extraSpins = 5 * 360;
    const targetAngle = extraSpins + (270 - (targetSectorIndex * sectorAngle) - (sectorAngle / 2));
    
    setRotation(targetAngle);
    currentRotationRef.current = targetAngle;

    // Simulate tick sounds during the spin based on ease-out deceleration
    const duration = 4000; // ms
    const startTime = Date.now();
    let lastTickIndex = 0;

    const tickInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        clearInterval(tickInterval);
        return;
      }

      // Easing calculation to match CSS transition ease-out
      // t: fraction of time, easeOut: 1 - (1 - t)^3 (cubic ease out)
      const t = elapsed / duration;
      const easeOutT = 1 - Math.pow(1 - t, 3);
      const currentAngle = easeOutT * targetAngle;

      const currentSectorIndex = Math.floor((currentAngle % 360) / sectorAngle);
      if (currentSectorIndex !== lastTickIndex) {
        playTickSound();
        lastTickIndex = currentSectorIndex;
      }
    }, 16);

    setTimeout(() => {
      setIsSpinning(false);
      const winner = SECTORS[targetSectorIndex];
      setChosenSector(winner);

      // Trigger completion and look up local options
      setTimeout(() => {
        onComplete(winner.cuisine);
      }, 1500);
    }, duration);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center h-[540px] justify-between text-slate-100" id="flavor-wheel-game">
      {/* Header */}
      <div className="w-full flex items-center justify-between px-4 mb-2">
        <button
          onClick={onBack}
          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 font-mono uppercase tracking-wider"
          id="btn-wheel-back"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Exit Game</span>
        </button>
        <span className="text-xs text-amber-400 font-mono font-bold tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-full">
          MYSTIC FOOD WHEEL
        </span>
      </div>

      {/* Spinning Wheel Core */}
      <div className="relative w-full flex-grow flex flex-col items-center justify-center my-4 h-[340px]">
        {/* Pointer Indicator */}
        <div className="absolute top-0 z-20 flex flex-col items-center -translate-y-2">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-amber-400 drop-shadow-lg"></div>
          <div className="w-3 h-3 bg-amber-500 rounded-full border border-slate-900 -mt-1 shadow"></div>
        </div>

        {/* Wheel SVG */}
        <div className="relative w-[280px] h-[280px] rounded-full shadow-2xl border-4 border-slate-950 bg-slate-950 flex items-center justify-center overflow-visible">
          {/* Inner ring background */}
          <div className="absolute w-[96%] h-[96%] rounded-full border border-slate-800/40 bg-slate-900/30"></div>

          <svg
            viewBox="0 0 200 200"
            className="w-full h-full transform transition-transform duration-[4000ms]"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
            id="svg-roulette-wheel"
          >
            {SECTORS.map((sector, i) => {
              const totalSectors = SECTORS.length;
              const angle = 360 / totalSectors;
              const startAngle = i * angle;
              const endAngle = (i + 1) * angle;

              // Convert degrees to radians
              const rad = (deg: number) => (deg * Math.PI) / 180;

              // Arc math for 200x200 canvas centered at 100,100
              const r = 90; // radius
              const x1 = 100 + r * Math.cos(rad(startAngle));
              const y1 = 100 + r * Math.sin(rad(startAngle));
              const x2 = 100 + r * Math.cos(rad(endAngle));
              const y2 = 100 + r * Math.sin(rad(endAngle));

              const largeArcFlag = angle > 180 ? 1 : 0;

              // Path definition for the sector slice
              const pathData = `
                M 100,100
                L ${x1},${y1}
                A ${r},${r} 0 ${largeArcFlag} 1 ${x2},${y2}
                Z
              `;

              // Text position along the sector bisector
              const textAngle = startAngle + angle / 2;
              const textRadius = 55; // distance from center
              const tx = 100 + textRadius * Math.cos(rad(textAngle));
              const ty = 100 + textRadius * Math.sin(rad(textAngle));

              return (
                <g key={sector.id} className="cursor-pointer">
                  {/* Slice Segment */}
                  <path
                    d={pathData}
                    fill={sector.color}
                    opacity={0.85}
                    stroke="#020617"
                    strokeWidth="1.5"
                    className="hover:opacity-100 transition-opacity"
                  />
                  {/* Slice Text */}
                  <text
                    x={tx}
                    y={ty}
                    fill="#020617"
                    fontSize="7"
                    fontWeight="800"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textAngle + 180}, ${tx}, ${ty})`}
                    className="font-sans select-none tracking-tight"
                  >
                    {sector.label.split(" ")[1]}
                  </text>
                  {/* Slice Emoji */}
                  <text
                    x={100 + 74 * Math.cos(rad(textAngle))}
                    y={100 + 74 * Math.sin(rad(textAngle))}
                    fontSize="10"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textAngle + 90}, ${100 + 74 * Math.cos(rad(textAngle))}, ${100 + 74 * Math.sin(rad(textAngle))})`}
                  >
                    {sector.label.split(" ")[0]}
                  </text>
                </g>
              );
            })}

            {/* Hub */}
            <circle cx="100" cy="100" r="16" fill="#020617" stroke="#334155" strokeWidth="1.5" />
          </svg>

          {/* Center Hub Logo Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            id="btn-spin-wheel-center"
            className="absolute w-14 h-14 rounded-full bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-slate-800 focus:outline-none flex flex-col items-center justify-center transition-all shadow-xl font-bold font-mono text-[10px] uppercase tracking-wider z-10 disabled:opacity-50 disabled:bg-slate-900 disabled:text-slate-500"
          >
            <span>SPIN</span>
          </button>
        </div>
      </div>

      {/* Result Indicator / Call to action */}
      <div className="w-full text-center pb-2 h-16 flex items-center justify-center">
        {chosenSector ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
            id="wheel-outcome-display"
          >
            <div className="flex items-center space-x-1 text-sm font-bold text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>It landed on {chosenSector.label}!</span>
            </div>
            <span className="text-xs text-slate-400 mt-1">"{chosenSector.description}"</span>
          </motion.div>
        ) : (
          <p className="text-xs text-slate-500 italic max-w-xs font-mono">
            Click SPIN to let the culinary spirits decide your meal!
          </p>
        )}
      </div>
    </div>
  );
}
