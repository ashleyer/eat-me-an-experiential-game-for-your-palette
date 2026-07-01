import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  MapPin,
  UtensilsCrossed,
  Trophy,
  HelpCircle,
  MessageSquare,
  ArrowRight,
  RotateCcw,
  Navigation,
  ExternalLink,
  ChevronRight,
  Compass,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

import LocationSelector from "./components/LocationSelector";
import FlavorSwiper from "./components/FlavorSwiper";
import FlavorBracket from "./components/FlavorBracket";
import FlavorWheel from "./components/FlavorWheel";
import FoodOracleChat from "./components/FoodOracleChat";

import { LocationState, GameType, RestaurantResult } from "./types";

export default function App() {
  // 1. Location State
  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    manualLocation: "",
    isUsingCoordinates: false,
    loading: false,
    error: null,
  });
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);

  // 2. Active Game State
  const [activeGame, setActiveGame] = useState<GameType | null>(null);

  // 3. Results State
  const [chosenCuisine, setChosenCuisine] = useState<string>("");
  const [results, setResults] = useState<RestaurantResult | null>(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);

  // 4. Chat Drawer State
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleLocationChange = (newFields: Partial<LocationState>) => {
    setLocation((prev) => ({ ...prev, ...newFields }));
  };

  const handleConfirmLocation = () => {
    if (location.lat || location.manualLocation) {
      setIsLocationConfirmed(true);
    } else {
      setLocation((prev) => ({
        ...prev,
        error: "Please detect your location or enter a city/ZIP first.",
      }));
    }
  };

  const handleGameComplete = async (winner: string) => {
    setChosenCuisine(winner);
    setActiveGame(null);
    setResultsLoading(true);
    setResultsError(null);
    setResults(null);

    try {
      const res = await fetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: winner,
          lat: location.lat,
          lng: location.lng,
          locationText: location.manualLocation,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResults({
          markdown: data.markdown,
          groundingChunks: data.groundingChunks || [],
        });
      } else {
        setResultsError(
          data.error || "The culinary spirits are temporarily silent. Please check your API key in Settings > Secrets."
        );
      }
    } catch (err) {
      setResultsError("Failed to fetch local recommendations. Please try again.");
    } finally {
      setResultsLoading(false);
    }
  };

  const handleReset = () => {
    setActiveGame(null);
    setChosenCuisine("");
    setResults(null);
    setResultsError(null);
    setIsChatOpen(false);
  };

  // Helper to extract Maps links from grounding metadata
  const getGroundingLinks = () => {
    if (!results || !results.groundingChunks) return [];
    
    const links: { uri: string; title: string; reviewSnippet?: string }[] = [];
    results.groundingChunks.forEach((chunk: any) => {
      if (chunk.maps?.uri) {
        links.push({
          uri: chunk.maps.uri,
          title: chunk.maps.title || "Local Recommendation",
          reviewSnippet: chunk.maps.placeAnswerSources?.reviewSnippets?.[0]?.text
        });
      }
    });
    return links;
  };

  const groundingLinks = getGroundingLinks();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="app-root-container">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30" id="app-header">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={handleReset}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-950/20">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center space-x-1">
                <span>Food Quest</span>
                <span className="text-xs bg-amber-500/10 text-amber-400 font-mono font-semibold px-2 py-0.5 rounded-full">v1.0</span>
              </h1>
            </div>
          </div>

          {/* Active Location Indicator */}
          {isLocationConfirmed && (
            <div
              className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 cursor-pointer hover:border-amber-500/30 transition-all"
              onClick={() => setIsLocationConfirmed(false)}
              id="active-location-badge"
              title="Click to change location"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-slate-300 font-medium">
                {location.isUsingCoordinates
                  ? "📍 GPS Detected"
                  : location.manualLocation || "Unknown Location"}
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-1">Edit</span>
            </div>
          )}
        </div>
      </header>

      {/* Main App Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Onboarding Location Setup */}
          {!isLocationConfirmed && (
            <motion.div
              key="location-setup"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center"
              id="setup-view-container"
            >
              {/* Marketing & Description Column */}
              <div className="space-y-6 text-left" id="promo-intro-column">
                <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full text-xs text-amber-400 font-semibold tracking-wide uppercase font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The Ultimate Meal Planner</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
                  Can't decide <br />
                  <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 bg-clip-text text-transparent">
                    what to eat?
                  </span>
                </h2>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md">
                  Stop the endless scrolling. Settle the dinner debate with responsive taste mini-games, then get real-time local dining recommendations backed by Google Maps data.
                </p>

                {/* Features List */}
                <div className="space-y-3 pt-2 font-medium text-xs text-slate-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 font-mono text-[10px]">1</div>
                    <span>Locate your general base camp</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 font-mono text-[10px]">2</div>
                    <span>Play one of 3 fun, gamified taste quests</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 font-mono text-[10px]">3</div>
                    <span>Claim local food matches directly from Google Maps</span>
                  </div>
                </div>
              </div>

              {/* Selector Widget */}
              <div id="selector-widget-column">
                <LocationSelector
                  location={location}
                  onLocationChange={handleLocationChange}
                  onConfirm={handleConfirmLocation}
                />
              </div>
            </motion.div>
          )}

          {/* STEP 2: Dashboard (Cuisine Games Selection) */}
          {isLocationConfirmed && !activeGame && !chosenCuisine && !resultsLoading && !results && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-4xl text-center space-y-8"
              id="dashboard-view"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-white">Choose Your Food Quest</h2>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Pick a gamified challenge below to unlock your craving profile and locate matched dining options.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6" id="games-deck-grid">
                
                {/* GAME 1: Tinder Swiper */}
                <button
                  onClick={() => setActiveGame("swipe")}
                  id="btn-launch-swipe-game"
                  className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 rounded-2xl p-6 text-left flex flex-col justify-between h-[240px] hover:scale-[1.02] active:scale-[0.98] transition-all group"
                >
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl w-fit group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-semibold tracking-widest text-amber-500 uppercase">Interactive</span>
                    <h3 className="text-lg font-bold text-white mt-1 group-hover:text-amber-400 transition-colors">Craving Swiper</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Swipe through dynamic flavor profiles (Yum vs. Nah) to compute your ultimate craving blueprint.
                    </p>
                  </div>
                  <div className="flex items-center text-xs text-amber-400 font-mono mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Start Swiping</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </button>

                {/* GAME 2: Cuisine Bracket */}
                <button
                  onClick={() => setActiveGame("bracket")}
                  id="btn-launch-bracket-game"
                  className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 rounded-2xl p-6 text-left flex flex-col justify-between h-[240px] hover:scale-[1.02] active:scale-[0.98] transition-all group"
                >
                  <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl w-fit group-hover:bg-rose-500 group-hover:text-slate-950 transition-colors">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-semibold tracking-widest text-rose-500 uppercase">Head-To-Head</span>
                    <h3 className="text-lg font-bold text-white mt-1 group-hover:text-rose-400 transition-colors">Cuisine Bracket</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Vote through head-to-head cuisine showdowns in an 8-team single-elimination tournament bracket.
                    </p>
                  </div>
                  <div className="flex items-center text-xs text-rose-400 font-mono mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Enter Arena</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </button>

                {/* GAME 3: Mystic Wheel */}
                <button
                  onClick={() => setActiveGame("wheel")}
                  id="btn-launch-wheel-game"
                  className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 rounded-2xl p-6 text-left flex flex-col justify-between h-[240px] hover:scale-[1.02] active:scale-[0.98] transition-all group"
                >
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl w-fit group-hover:bg-purple-500 group-hover:text-slate-950 transition-colors">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-semibold tracking-widest text-purple-500 uppercase">Destiny Spin</span>
                    <h3 className="text-lg font-bold text-white mt-1 group-hover:text-purple-400 transition-colors">Mystic Roulette</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Spin the heavy mechanical wheel of culinary fortune and let physics decide your next meal!
                    </p>
                  </div>
                  <div className="flex items-center text-xs text-purple-400 font-mono mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Spin Wheel</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </button>

              </div>
            </motion.div>
          )}

          {/* STEP 3: Game Execution Mode */}
          {isLocationConfirmed && activeGame && (
            <motion.div
              key="active-game-container"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full flex justify-center"
              id="game-board-container"
            >
              {activeGame === "swipe" && (
                <FlavorSwiper onComplete={handleGameComplete} onBack={handleReset} />
              )}
              {activeGame === "bracket" && (
                <FlavorBracket onComplete={handleGameComplete} onBack={handleReset} />
              )}
              {activeGame === "wheel" && (
                <FlavorWheel onComplete={handleGameComplete} onBack={handleReset} />
              )}
            </motion.div>
          )}

          {/* STEP 4: Searching & Loading Recommendations */}
          {resultsLoading && (
            <motion.div
              key="results-searching-loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 flex flex-col items-center justify-center space-y-6"
              id="loading-results-screen"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-slate-900 border-t-amber-400 animate-spin"></div>
                <UtensilsCrossed className="w-8 h-8 text-amber-400 absolute animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Consulting Google Maps...</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto italic font-mono">
                  Grounding restaurants near you matching "{chosenCuisine}"...
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 5: Results Presentation & Discovery */}
          {isLocationConfirmed && results && !resultsLoading && (
            <motion.div
              key="discovery-results"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-5xl flex flex-col lg:flex-row gap-8 items-start"
              id="discovery-results-view"
            >
              
              {/* Left Column: Recommendations Guide & Grounding Links */}
              <div className="flex-grow space-y-6 w-full lg:max-w-2xl" id="results-content-area">
                
                {/* Result header banner */}
                <div className="bg-gradient-to-r from-amber-600/10 to-rose-500/10 border border-amber-500/20 rounded-2xl p-6 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-amber-500">
                      Quest Champion Cuisine
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
                      {chosenCuisine}
                    </h2>
                  </div>
                  <button
                    onClick={handleReset}
                    id="btn-play-again"
                    className="flex items-center space-x-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-900 text-xs font-bold font-mono uppercase tracking-wider rounded-xl border border-slate-800 hover:border-amber-500/30 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Spin Again</span>
                  </button>
                </div>

                {/* Gemini Restaurant Markdown */}
                <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 md:p-8 shadow-xl">
                  <div className="markdown-body text-slate-200 prose prose-invert prose-amber max-w-none text-sm md:text-base leading-relaxed space-y-4">
                    <ReactMarkdown>{results.markdown}</ReactMarkdown>
                  </div>
                </div>

                {/* Grounding Places Links Cards */}
                {groundingLinks.length > 0 && (
                  <div className="space-y-4" id="google-maps-grounding-links-section">
                    <h4 className="text-sm font-bold font-mono uppercase tracking-widest text-slate-400 flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <span>📍 Google Maps Verified Places</span>
                    </h4>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {groundingLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          id={`maps-place-link-${index}`}
                          className="bg-slate-900 hover:bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 p-4 rounded-xl flex flex-col justify-between h-[120px] transition-all group"
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <h5 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                                {link.title}
                              </h5>
                              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors flex-shrink-0" />
                            </div>
                            {link.reviewSnippet && (
                              <p className="text-[11px] text-slate-400 italic line-clamp-2 mt-2 leading-relaxed">
                                "{link.reviewSnippet}"
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono flex items-center mt-auto">
                            <span>Open in Google Maps</span>
                            <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: Chat Oracle Trigger Panel */}
              <div className="w-full lg:w-[320px] bg-slate-900 border border-slate-800/80 rounded-2xl p-6 space-y-6 lg:sticky lg:top-24 flex flex-col items-center text-center" id="side-chat-panel">
                <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-2xl animate-pulse">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-extrabold text-lg text-white">Ask the Food Oracle!</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Have questions about these recommendations? Ask the Food Oracle about prices, vegan options, atmospheres, or best visit times!
                  </p>
                </div>
                <button
                  onClick={() => setIsChatOpen(true)}
                  id="btn-open-oracle-chat"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 group"
                >
                  <span>Consult Oracle Chat</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </motion.div>
          )}

          {/* STEP 6: Recommendations Fetch Failure / Error Screen */}
          {isLocationConfirmed && resultsError && (
            <motion.div
              key="results-error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 flex flex-col items-center justify-center space-y-4"
              id="error-results-screen"
            >
              <div className="p-4 bg-rose-500/10 text-rose-500 rounded-full border border-rose-500/20">
                <RotateCcw className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">The Food Spirits are Silent</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-2 leading-relaxed">
                  {resultsError}
                </p>
              </div>
              <button
                onClick={handleReset}
                id="btn-error-retry"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors text-slate-200"
              >
                Try Again
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* COMPONENT: Interactive Multi-turn Chat Overlay Drawer */}
      <FoodOracleChat
        restaurantContext={results ? results.markdown : ""}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Footer copyright */}
      <footer className="border-t border-slate-900 py-6 text-center text-[10px] text-slate-600 font-mono" id="app-footer">
        &copy; {new Date().getFullYear()} Food Quest. Harnessing Google Maps Grounding & Gemini. All rights reserved.
      </footer>
    </div>
  );
}
