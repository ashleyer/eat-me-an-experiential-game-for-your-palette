import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, ArrowRight } from "lucide-react";

interface FlavorQuizProps {
  onComplete: (query: string) => void;
  onBack: () => void;
}

const QUESTIONS = [
  {
    title: "How are you feeling right now?",
    options: ["Adventurous", "Comforting", "Light & Healthy", "Celebratory"]
  },
  {
    title: "What's your preferred spice level?",
    options: ["No Spice", "A Little Kick", "Spicy", "Inferno"]
  },
  {
    title: "What texture are you craving?",
    options: ["Crispy & Crunchy", "Soft & Creamy", "Chewy & Hearty", "Fresh & Raw"]
  }
];

export default function FlavorQuiz({ onComplete, onBack }: FlavorQuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleSelect = (option: string) => {
    const newAnswers = [...answers, option];
    if (step < QUESTIONS.length - 1) {
      setAnswers(newAnswers);
      setStep(step + 1);
    } else {
      const query = `Flavor Profile: ${newAnswers[0]} mood, ${newAnswers[1]} spice level, ${newAnswers[2]} texture`;
      setTimeout(() => onComplete(query), 400);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col h-[540px] text-slate-800 relative">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="text-[10px] text-slate-400 hover:text-slate-900 flex items-center space-x-1 font-bold uppercase tracking-widest transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
        <span className="text-[10px] text-slate-900 font-bold tracking-widest bg-slate-100 px-3 py-1.5 rounded-full uppercase">
          Quiz: {step + 1} / {QUESTIONS.length}
        </span>
      </div>

      <div className="flex-grow flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
            <h3 className="text-2xl font-bold text-slate-900 mb-8">{QUESTIONS[step].title}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {QUESTIONS[step].options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-all font-medium text-slate-700 hover:text-slate-900 flex items-center justify-between group"
                >
                  <span>{opt}</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
