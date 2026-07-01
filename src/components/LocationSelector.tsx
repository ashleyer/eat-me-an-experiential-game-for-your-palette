import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Compass, Navigation, AlertCircle, Check } from "lucide-react";
import { LocationState } from "../types";

interface LocationSelectorProps {
  location: LocationState;
  onLocationChange: (loc: Partial<LocationState>) => void;
  onConfirm: () => void;
}

export default function LocationSelector({
  location,
  onLocationChange,
  onConfirm,
}: LocationSelectorProps) {
  const [inputText, setInputText] = useState(location.manualLocation);
  const [detecting, setDetecting] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      onLocationChange({ error: "Geolocation is not supported by your browser." });
      return;
    }

    setDetecting(true);
    onLocationChange({ loading: true, error: null });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          isUsingCoordinates: true,
          loading: false,
          error: null,
        });
        setDetecting(false);
      },
      (error) => {
        let msg = "Failed to detect location. Please type your location manually.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location access was denied. Please enter your location manually.";
        }
        onLocationChange({
          loading: false,
          error: msg,
          isUsingCoordinates: false,
        });
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onLocationChange({
      manualLocation: inputText,
      isUsingCoordinates: false,
      lat: null,
      lng: null,
      error: null,
    });
    onConfirm();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100"
      id="location-selector-card"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Where are you hungry?</h2>
          <p className="text-xs text-slate-400">Specify your location to find local spots.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Automatic Geolocation Option */}
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={detecting}
          id="btn-detect-location"
          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left group ${
            location.isUsingCoordinates && location.lat
              ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-300"
              : "bg-slate-950/40 border-slate-800 hover:border-amber-500/50 hover:bg-slate-950/80 text-slate-200"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${location.isUsingCoordinates ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400 group-hover:text-amber-400'}`}>
              <Compass className={`w-5 h-5 ${detecting ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <span className="block font-medium text-sm text-white">Use Device Location</span>
              <span className="block text-xs text-slate-400">
                {location.isUsingCoordinates && location.lat
                  ? `Active: ${location.lat.toFixed(4)}, ${location.lng?.toFixed(4)}`
                  : "Auto-detect via browser GPS"}
              </span>
            </div>
          </div>
          {location.isUsingCoordinates && location.lat ? (
            <Check className="w-5 h-5 text-emerald-400" />
          ) : (
            <Navigation className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          )}
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-xs text-slate-500 uppercase tracking-widest font-mono">OR</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Manual Input Form */}
        <form onSubmit={handleManualSubmit} className="space-y-4" id="manual-location-form">
          <div>
            <label htmlFor="location-input" className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Enter City, Zip Code, or Address
            </label>
            <div className="relative">
              <input
                id="location-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g. Seattle, WA or 90210"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          {location.error && (
            <div className="flex items-start space-x-2 text-rose-400 bg-rose-950/20 border border-rose-900/30 p-3 rounded-lg text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{location.error}</span>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            {location.isUsingCoordinates && location.lat ? (
              <button
                type="button"
                onClick={onConfirm}
                id="btn-confirm-coords"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/30 flex items-center justify-center space-x-2"
              >
                <span>Continue with GPS Location</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputText.trim()}
                id="btn-submit-location"
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-slate-950 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-amber-950/30"
              >
                Let's Play!
              </button>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
}
