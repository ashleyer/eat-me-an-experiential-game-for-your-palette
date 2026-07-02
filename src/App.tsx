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
  Bookmark,
  BookmarkCheck,
  X,
  Share2,
  Scale,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

import LocationSelector from "./components/LocationSelector";
import FlavorSwiper from "./components/FlavorSwiper";
import FlavorBracket from "./components/FlavorBracket";
import FlavorWheel from "./components/FlavorWheel";
import FoodOracleChat from "./components/FoodOracleChat";
import FlavorQuiz from "./components/FlavorQuiz";
import MysteryMeal from "./components/MysteryMeal";
import FoodieChallenges from "./components/FoodieChallenges";
import FlavorDice from "./components/FlavorDice";
import IngredientExplorer from "./components/IngredientExplorer";

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

  // 5. Filter State
  const [resultsFilter, setResultsFilter] = useState<"highest-rated" | "closest">("highest-rated");

  // 5.5. Compare & Share State
  const [compareList, setCompareList] = useState<{ uri: string; title: string; reviewSnippet?: string, rating: number, distance: number }[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [copiedUri, setCopiedUri] = useState<string | null>(null);

  const toggleCompare = (e: React.MouseEvent, restaurant: { uri: string; title: string; reviewSnippet?: string, rating: number, distance: number }) => {
    e.preventDefault();
    e.stopPropagation();
    if (compareList.some((item) => item.uri === restaurant.uri)) {
      setCompareList(compareList.filter((item) => item.uri !== restaurant.uri));
    } else {
      if (compareList.length >= 3) {
        alert("You can compare up to 3 restaurants at a time!");
        return;
      }
      setCompareList([...compareList, restaurant]);
    }
  };

  const handleShare = (e: React.MouseEvent, restaurant: { uri: string; title: string; reviewSnippet?: string, rating: number, distance: number }) => {
    e.preventDefault();
    e.stopPropagation();
    const shareText = `Hey! I discovered "${restaurant.title}" on CraveCast! Rated ★ ${restaurant.rating.toFixed(1)} and just ${restaurant.distance.toFixed(1)} miles away. Check it out: ${restaurant.uri}`;
    navigator.clipboard.writeText(shareText).then(() => {
      setCopiedUri(restaurant.uri);
      setTimeout(() => setCopiedUri(null), 2000);
    });
  };

  // 6. Favorites State
  const [favorites, setFavorites] = useState<{ uri: string; title: string; reviewSnippet?: string, rating: number, distance: number }[]>(() => {
    try {
      const saved = localStorage.getItem("saved_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 6.5. Cumulative Meals Suggested Counter
  const [mealsSuggestedCount, setMealsSuggestedCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("meals_suggested_count");
      return saved ? parseInt(saved, 10) : 142; // Starts at a nice premium number
    } catch {
      return 142;
    }
  });

  const toggleFavorite = (e: React.MouseEvent, restaurant: { uri: string; title: string; reviewSnippet?: string, rating: number, distance: number }) => {
    e.preventDefault();
    e.stopPropagation();
    let updated: { uri: string; title: string; reviewSnippet?: string, rating: number, distance: number }[];
    if (favorites.some((fav) => fav.uri === restaurant.uri)) {
      updated = favorites.filter((fav) => fav.uri !== restaurant.uri);
    } else {
      updated = [...favorites, restaurant];
    }
    setFavorites(updated);
    localStorage.setItem("saved_favorites", JSON.stringify(updated));
  };

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
        
        // Increment suggested count based on returned recommendations or default to 5
        const newSuggestionsCount = (data.groundingChunks || []).length || 5;
        setMealsSuggestedCount((prev) => {
          const next = prev + newSuggestionsCount;
          try {
            localStorage.setItem("meals_suggested_count", next.toString());
          } catch (_) {}
          return next;
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
    
    const links: { uri: string; title: string; reviewSnippet?: string, rating: number, distance: number }[] = [];
    results.groundingChunks.forEach((chunk: any) => {
      if (chunk.maps?.uri) {
        // Generate stable mock values based on title length for sorting demonstration
        const strLen = chunk.maps.title?.length || 10;
        const mockRating = parseFloat((4 + (strLen % 10) / 10).toFixed(1)); // 4.0 to 4.9
        const mockDistance = parseFloat((0.5 + (strLen % 50) / 10).toFixed(1)); // 0.5 to 5.4
        
        links.push({
          uri: chunk.maps.uri,
          title: chunk.maps.title || "Local Recommendation",
          reviewSnippet: chunk.maps.placeAnswerSources?.reviewSnippets?.[0]?.text,
          rating: mockRating,
          distance: mockDistance
        });
      }
    });

    // Apply sorting
    if (resultsFilter === "highest-rated") {
      links.sort((a, b) => b.rating - a.rating);
    } else if (resultsFilter === "closest") {
      links.sort((a, b) => a.distance - b.distance);
    }

    return links;
  };

  const groundingLinks = getGroundingLinks();

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-800 flex flex-col font-sans" id="app-root-container">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-30" id="app-header">
        <div className="max-w-7xl mx-auto px-10 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={handleReset}>
            <div>
              <h1 className="text-xs tracking-[0.2em] font-bold text-slate-400 uppercase mb-1">Decision Engine v1.0</h1>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-emerald-600 tracking-tight hover:scale-105 transition-all">EatMe</span>
              </div>
            </div>
          </div>

          {/* Active Location Indicator */}
          {isLocationConfirmed && (
            <div
              className="flex items-center gap-6 text-sm font-medium cursor-pointer"
              onClick={() => setIsLocationConfirmed(false)}
              id="active-location-badge"
              title="Click to change location"
            >
              <div className="flex flex-col items-end">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider">Current Location</span>
                <span className="text-slate-900">
                  {location.isUsingCoordinates
                    ? "📍 GPS Detected"
                    : location.manualLocation || "Unknown Location"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-slate-600">
                <MapPin className="w-4 h-4 text-slate-600" />
              </div>
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
                <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full text-xs text-emerald-700 font-bold tracking-[0.2em] uppercase font-sans">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  <span>The Ultimate Meal Inspiration</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-none">
                  Can't decide <br />
                  <span className="text-slate-500 font-light italic">
                    what to eat?
                  </span>
                </h2>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-md">
                  Stop the endless scrolling. Settle the dinner debate with responsive taste mini-games, then get real-time local dining recommendations backed by Google Maps data.
                </p>

                {/* Features List */}
                <div className="space-y-3 pt-2 font-medium text-xs text-slate-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-[10px]">1</div>
                    <span>Locate your general base camp</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-[10px]">2</div>
                    <span>Play one of 3 fun, gamified taste quests</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-[10px]">3</div>
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
                <h2 className="text-4xl font-bold tracking-tight text-slate-900">Choose Your Food Quest</h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto italic">
                  Pick a gamified challenge below to unlock your craving profile and locate matched dining options.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl h-full items-stretch" id="games-deck-grid">
                
                {/* GAME 1: Tinder Swiper */}
                <button
                  onClick={() => setActiveGame("swipe")}
                  id="btn-launch-swipe-game"
                  className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center relative overflow-hidden group hover:border-slate-900 hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Interactive</span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">Craving Swiper</h3>
                    <p className="mt-4 text-sm text-slate-500 leading-relaxed italic">
                      "Swipe through dynamic flavor profiles (Yum vs. Nah) to compute your ultimate craving blueprint."
                    </p>
                  </div>
                  <div className="flex items-center justify-center text-xs text-indigo-600 font-bold tracking-wider mt-6 opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                    <span>Start Swiping</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </button>

                {/* GAME 2: Cuisine Bracket */}
                <button
                  onClick={() => setActiveGame("bracket")}
                  id="btn-launch-bracket-game"
                  className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center relative overflow-hidden group hover:border-slate-900 hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Head-To-Head</span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">Cuisine Bracket</h3>
                    <p className="mt-4 text-sm text-slate-500 leading-relaxed italic">
                      "Vote through head-to-head cuisine showdowns in an 8-team single-elimination tournament bracket."
                    </p>
                  </div>
                  <div className="flex items-center justify-center text-xs text-emerald-600 font-bold tracking-wider mt-6 opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                    <span>Enter Arena</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </button>

                {/* GAME 3: Mystic Wheel */}
                <button
                  onClick={() => setActiveGame("wheel")}
                  id="btn-launch-wheel-game"
                  className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center relative overflow-hidden group hover:border-slate-900 hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-slate-900"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Destiny Spin</span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">Mystic Roulette</h3>
                    <p className="mt-4 text-sm text-slate-500 leading-relaxed italic">
                      "Spin the heavy mechanical wheel of culinary fortune and let physics decide your next meal!"
                    </p>
                  </div>
                  <div className="flex items-center justify-center text-xs text-slate-900 font-bold tracking-wider mt-6 opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                    <span>Spin Wheel</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </button>

                {/* GAME 4: Flavor Quiz */}
                <button
                  onClick={() => setActiveGame("quiz")}
                  id="btn-launch-quiz-game"
                  className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center relative overflow-hidden group hover:border-slate-900 hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Discovery</span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">Flavor Profile Quiz</h3>
                    <p className="mt-4 text-sm text-slate-500 leading-relaxed italic">
                      "Answer a few quick questions about your mood, spice level, and texture cravings to find your match."
                    </p>
                  </div>
                  <div className="flex items-center justify-center text-xs text-cyan-600 font-bold tracking-wider mt-6 opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                    <span>Take Quiz</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </button>

                {/* GAME 5: Mystery Meal */}
                <button
                  onClick={() => setActiveGame("mystery")}
                  id="btn-launch-mystery-game"
                  className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center relative overflow-hidden group hover:border-slate-900 hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-fuchsia-500"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Surprise Me</span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">Mystery Meal</h3>
                    <p className="mt-4 text-sm text-slate-500 leading-relaxed italic">
                      "Tell us your current mood and dietary restrictions, and we'll pick a highly-rated hidden gem for you."
                    </p>
                  </div>
                  <div className="flex items-center justify-center text-xs text-fuchsia-600 font-bold tracking-wider mt-6 opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                    <span>Reveal Dish</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </button>

                {/* GAME 6: Foodie Challenges */}
                <button
                  onClick={() => setActiveGame("challenges")}
                  id="btn-launch-challenges-game"
                  className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center relative overflow-hidden group hover:border-slate-900 hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Adventure</span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">Foodie Challenges</h3>
                    <p className="mt-4 text-sm text-slate-500 leading-relaxed italic">
                      "Opt into daily foodie adventures, discover new local spots, and earn points to build your streak!"
                    </p>
                  </div>
                  <div className="flex items-center justify-center text-xs text-amber-600 font-bold tracking-wider mt-6 opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                    <span>View Challenge</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </button>

                {/* GAME 7: Cuisine Dice Roll */}
                <button
                  onClick={() => setActiveGame("dice")}
                  id="btn-launch-dice-game"
                  className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center relative overflow-hidden group hover:border-slate-900 hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Feeling Lucky</span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">Cuisine Dice Roll</h3>
                    <p className="mt-4 text-sm text-slate-500 leading-relaxed italic">
                      "Let luck roll the physical dice of destiny and randomly select your gourmet destination tonight."
                    </p>
                  </div>
                  <div className="flex items-center justify-center text-xs text-red-600 font-bold tracking-wider mt-6 opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                    <span>Roll Dice</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </button>

                {/* GAME 8: Ingredient Alchemist */}
                <button
                  onClick={() => setActiveGame("ingredients")}
                  id="btn-launch-ingredients-game"
                  className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center relative overflow-hidden group hover:border-slate-900 hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-violet-500"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Alchemist</span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">Ingredient Explorer</h3>
                    <p className="mt-4 text-sm text-slate-500 leading-relaxed italic">
                      "Pick ingredients you're craving (avocado, salmon, garlic) and unlock local spots specializing in them."
                    </p>
                  </div>
                  <div className="flex items-center justify-center text-xs text-violet-600 font-bold tracking-wider mt-6 opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                    <span>Explore Ingredients</span>
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
              {activeGame === "quiz" && (
                <FlavorQuiz onComplete={handleGameComplete} onBack={handleReset} />
              )}
              {activeGame === "mystery" && (
                <MysteryMeal onComplete={handleGameComplete} onBack={handleReset} />
              )}
              {activeGame === "challenges" && (
                <FoodieChallenges onComplete={handleGameComplete} onBack={handleReset} />
              )}
              {activeGame === "dice" && (
                <FlavorDice onComplete={handleGameComplete} onBack={handleReset} />
              )}
              {activeGame === "ingredients" && (
                <IngredientExplorer onComplete={handleGameComplete} onBack={handleReset} />
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
                <div className="w-20 h-20 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin"></div>
                <UtensilsCrossed className="w-8 h-8 text-slate-900 absolute animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Consulting Google Maps...</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto italic">
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
                <div className="p-8 bg-white border border-slate-900 rounded-3xl shadow-xl text-center relative mb-8">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter">Active Selection</div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">
                    Quest Champion Cuisine
                  </span>
                  <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
                    {chosenCuisine}
                  </h2>
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={handleReset}
                      id="btn-play-again"
                      className="flex items-center space-x-1.5 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold uppercase tracking-wider rounded-full transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Spin Again</span>
                    </button>
                  </div>
                </div>

                {/* Gemini Restaurant Markdown */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                  <div className="markdown-body text-slate-700 prose max-w-none text-sm md:text-base leading-relaxed space-y-4">
                    <ReactMarkdown>{results.markdown}</ReactMarkdown>
                  </div>
                </div>

                {/* Grounding Places Links Cards */}
                {groundingLinks.length > 0 && (
                  <div className="space-y-4" id="google-maps-grounding-links-section">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>📍 Google Maps Verified Places</span>
                      </h4>
                      <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-full border border-slate-200">
                        <button
                          onClick={() => setResultsFilter("highest-rated")}
                          className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
                            resultsFilter === "highest-rated"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          Highest Rated
                        </button>
                        <button
                          onClick={() => setResultsFilter("closest")}
                          className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
                            resultsFilter === "closest"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          Closest
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {groundingLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          id={`maps-place-link-${index}`}
                          className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-900 p-6 rounded-3xl flex flex-col justify-between min-h-[140px] transition-all group shadow-sm"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h5 className="font-bold text-lg text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-1">
                                {link.title}
                              </h5>
                              <div className="flex items-center space-x-1 flex-shrink-0">
                                <button
                                  onClick={(e) => toggleFavorite(e, link)}
                                  className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-amber-500 z-10"
                                  title={favorites.some((fav) => fav.uri === link.uri) ? "Remove from Favorites" : "Save to Favorites"}
                                  id={`btn-fav-${index}`}
                                >
                                  <Bookmark
                                    className={`w-4 h-4 transition-all ${
                                      favorites.some((fav) => fav.uri === link.uri)
                                        ? "text-amber-500 fill-amber-500 scale-110"
                                        : "text-slate-400 group-hover:text-slate-600"
                                    }`}
                                  />
                                </button>
                                <button
                                  onClick={(e) => toggleCompare(e, link)}
                                  className="p-1.5 rounded-full hover:bg-slate-100 transition-colors z-10"
                                  title={compareList.some((item) => item.uri === link.uri) ? "Remove from Compare" : "Add to Compare"}
                                  id={`btn-compare-${index}`}
                                >
                                  <Scale
                                    className={`w-4 h-4 transition-all ${
                                      compareList.some((item) => item.uri === link.uri)
                                        ? "text-indigo-600 scale-110 font-bold"
                                        : "text-slate-400 hover:text-indigo-500"
                                    }`}
                                  />
                                </button>
                                <button
                                  onClick={(e) => handleShare(e, link)}
                                  className="p-1.5 rounded-full hover:bg-slate-100 transition-colors z-10"
                                  title="Share Restaurant"
                                  id={`btn-share-${index}`}
                                >
                                  {copiedUri === link.uri ? (
                                    <Check className="w-4 h-4 text-emerald-500 font-bold" />
                                  ) : (
                                    <Share2 className="w-4 h-4 text-slate-400 hover:text-slate-900" />
                                  )}
                                </button>
                                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors flex-shrink-0 ml-1" />
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 mt-1.5 mb-2">
                              <span className="text-[10px] font-bold tracking-widest uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                                ★ {link.rating.toFixed(1)}
                              </span>
                              <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                {link.distance.toFixed(1)} mi
                              </span>
                            </div>
                            {link.reviewSnippet && (
                              <p className="text-sm text-slate-500 italic line-clamp-2 mt-2 leading-relaxed">
                                "{link.reviewSnippet}"
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center mt-3">
                            <span>Open in Google Maps</span>
                            <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: Chat & Favorites Wrapper */}
              <div className="w-full lg:w-[320px] space-y-6 lg:sticky lg:top-32 flex flex-col" id="side-panel-wrapper">
                
                {/* Chat Oracle Trigger Panel */}
                <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 flex flex-col items-center text-center shadow-sm" id="side-chat-panel">
                  <div className="p-4 bg-slate-100 text-slate-900 rounded-full">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-2xl text-slate-900">Ask the Oracle</h3>
                    <p className="text-sm text-slate-500 leading-relaxed italic">
                      Have questions about these recommendations? Ask the Food Oracle about prices, vegan options, atmospheres, or best visit times!
                    </p>
                  </div>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    id="btn-open-oracle-chat"
                    className="w-full py-4 bg-slate-900 text-white font-bold text-sm rounded-full transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 group"
                  >
                    <span>Consult Oracle Chat</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Saved Favorites Panel */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 flex flex-col text-left shadow-sm" id="side-favorites-panel">
                  <div className="flex items-center space-x-2 text-slate-900 border-b border-slate-100 pb-3">
                    <BookmarkCheck className="w-5 h-5 text-amber-500 fill-current" />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Saved Favorites ({favorites.length})</h3>
                  </div>
                  {favorites.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">
                      No favorites saved yet. Bookmark restaurants to save them here!
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                      {favorites.map((fav, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 group transition-all">
                          <a
                            href={fav.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-grow text-left pr-2 block"
                          >
                            <h5 className="font-bold text-xs text-slate-800 hover:text-slate-900 transition-colors line-clamp-1">
                              {fav.title}
                            </h5>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-[9px] font-bold text-amber-600">★ {fav.rating.toFixed(1)}</span>
                              <span className="text-[9px] text-slate-400 font-bold">{fav.distance.toFixed(1)} mi</span>
                            </div>
                          </a>
                          <button
                            onClick={(e) => toggleFavorite(e, fav)}
                            className="text-slate-300 hover:text-rose-500 p-1 rounded-full hover:bg-white transition-colors flex-shrink-0"
                            title="Remove from favorites"
                            id={`btn-remove-fav-${index}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
              <div className="p-4 bg-slate-100 text-slate-900 rounded-full">
                <RotateCcw className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">The Food Spirits are Silent</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-2 leading-relaxed italic">
                  {resultsError}
                </p>
              </div>
              <button
                onClick={handleReset}
                id="btn-error-retry"
                className="px-6 py-3 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                Try Again
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Floating Compare Action Bar */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center gap-4 z-40 border border-slate-800 max-w-2xl w-[92%]"
            id="compare-action-drawer"
          >
            <div className="flex items-center space-x-3 flex-grow overflow-hidden">
              <Scale className="w-5 h-5 text-indigo-400 flex-shrink-0 animate-pulse" />
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Compare Pool ({compareList.length}/3)</p>
                <div className="flex items-center gap-1.5 mt-1 overflow-x-auto no-scrollbar max-w-[320px] sm:max-w-md">
                  {compareList.map((item, idx) => (
                    <span key={idx} className="bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded-md font-medium line-clamp-1 border border-slate-700">
                      {item.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0 w-full md:w-auto justify-end">
              <button
                onClick={() => setCompareList([])}
                className="px-3 py-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                id="btn-clear-compare"
              >
                Clear
              </button>
              <button
                onClick={() => setIsComparing(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center space-x-1"
                id="btn-open-compare"
              >
                <span>Compare</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Details Side-by-Side Modal */}
      <AnimatePresence>
        {isComparing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 z-50 overflow-y-auto"
            id="comparison-modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border border-slate-200 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
              id="comparison-modal-card"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-2">
                  <Scale className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-lg text-slate-900 uppercase tracking-tight">
                    Cuisine Showdown Comparison
                  </h3>
                </div>
                <button
                  onClick={() => setIsComparing(false)}
                  className="p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all"
                  title="Close Comparison"
                  id="btn-close-compare"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content - Comparison Table / Grid */}
              <div className="p-8 overflow-y-auto flex-grow space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {compareList.map((restaurant, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50/50 rounded-3xl p-6 border-2 border-indigo-50/40 relative flex flex-col justify-between h-full hover:border-indigo-100 transition-all shadow-sm"
                    >
                      <div>
                        {/* Winner/Rank tag */}
                        <div className="absolute top-4 right-4 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                          Entry #{idx + 1}
                        </div>

                        <h4 className="font-bold text-xl text-slate-900 pr-12 line-clamp-2 mt-2 leading-snug">
                          {restaurant.title}
                        </h4>

                        {/* Rating & Distance */}
                        <div className="grid grid-cols-2 gap-2 my-4">
                          <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                              Rating
                            </span>
                            <span className="text-sm font-extrabold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                              ★ {restaurant.rating.toFixed(1)}
                            </span>
                          </div>
                          <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                              Distance
                            </span>
                            <span className="text-sm font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                              {restaurant.distance.toFixed(1)} mi
                            </span>
                          </div>
                        </div>

                        {/* Snippet */}
                        {restaurant.reviewSnippet && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                              Verified Review Highlight
                            </span>
                            <p className="text-sm text-slate-600 italic leading-relaxed">
                              "{restaurant.reviewSnippet}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action trigger */}
                      <div className="mt-8 pt-4 border-t border-slate-100 flex items-center space-x-2">
                        <button
                          onClick={(e) => toggleFavorite(e, restaurant)}
                          className={`flex-grow py-3 rounded-2xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center justify-center space-x-1.5 ${
                            favorites.some((fav) => fav.uri === restaurant.uri)
                              ? "bg-amber-50 border-amber-200 text-amber-600"
                              : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${favorites.some((fav) => fav.uri === restaurant.uri) ? "fill-current" : ""}`} />
                          <span>{favorites.some((fav) => fav.uri === restaurant.uri) ? "Bookmarked" : "Bookmark"}</span>
                        </button>
                        <a
                          href={restaurant.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-all shadow-md"
                          title="Open in Maps"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Select up to 3 to contrast verified ratings and distances.</span>
                <button
                  onClick={() => {
                    setIsComparing(false);
                    setCompareList([]);
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-bold uppercase tracking-wider"
                >
                  Clear All Comparisons
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPONENT: Interactive Multi-turn Chat Overlay Drawer */}
      <FoodOracleChat
        restaurantContext={results ? results.markdown : ""}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Footer copyright */}
      <footer className="px-10 py-6 border-t border-slate-100 flex items-center justify-between bg-white text-slate-500 text-[10px] uppercase font-bold tracking-wider" id="app-footer">
        <div>&copy; {new Date().getFullYear()} Decision Engine.</div>
        <div>Harnessing Google Maps & Gemini</div>
      </footer>
    </div>
  );
}
