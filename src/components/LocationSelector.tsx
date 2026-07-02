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
      className="w-full max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-slate-800 relative overflow-hidden"
      id="location-selector-card"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-900"></div>
      <div className="flex flex-col items-center mb-8">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Initialization</span>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Where are you hungry?</h2>
      </div>

      <div className="space-y-6">
        {/* Automatic Geolocation Option */}
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={detecting}
          id="btn-detect-location"
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left group ${
            location.isUsingCoordinates && location.lat
              ? "bg-slate-50 border-slate-900 text-slate-900 shadow-sm"
              : "bg-white border-slate-200 hover:border-slate-900 hover:shadow-md text-slate-600"
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-full border-2 ${location.isUsingCoordinates ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all text-slate-400'}`}>
              <Compass className={`w-5 h-5 ${detecting ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <span className={`block font-bold text-sm ${location.isUsingCoordinates ? 'text-slate-900' : 'text-slate-700'}`}>Use Device Location</span>
              <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-bold mt-1">
                {location.isUsingCoordinates && location.lat
                  ? `Active: ${location.lat.toFixed(4)}, ${location.lng?.toFixed(4)}`
                  : "Auto-detect via GPS"}
              </span>
            </div>
          </div>
          {location.isUsingCoordinates && location.lat ? (
            <Check className="w-5 h-5 text-slate-900" />
          ) : (
            <Navigation className="w-4 h-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
          )}
        </button>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-400 uppercase tracking-widest font-bold">OR</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        {/* Manual Input Form */}
        <form onSubmit={handleManualSubmit} className="space-y-4" id="manual-location-form">
          <div>
            <div className="relative">
              <input
                id="location-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter City, Zip Code, or Address"
                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white rounded-2xl px-5 py-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {location.error && (
            <div className="flex items-start space-x-2 text-rose-600 bg-rose-50 border border-rose-100 p-4 rounded-2xl text-xs font-medium">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{location.error}</span>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            {location.isUsingCoordinates && location.lat ? (
              <button
                type="button"
                onClick={onConfirm}
                id="btn-confirm-coords"
                className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-full transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
              >
                <span>Continue with GPS</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputText.trim()}
                id="btn-submit-location"
                className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 disabled:hover:scale-100 text-white font-bold text-sm rounded-full transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                SHUFFLE THE DECK
              </button>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
}
