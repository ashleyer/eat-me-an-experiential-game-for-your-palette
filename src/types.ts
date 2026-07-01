export interface LocationState {
  lat: number | null;
  lng: number | null;
  manualLocation: string;
  isUsingCoordinates: boolean;
  loading: boolean;
  error: string | null;
}

export type GameType = "swipe" | "bracket" | "wheel";

export interface SwipeCard {
  id: string;
  title: string;
  tags: string[];
  image: string;
  vibe: string;
  cuisine: string;
}

export interface BracketNode {
  id: string;
  title: string;
  image: string;
}

export interface WheelSector {
  id: string;
  label: string;
  cuisine: string;
  color: string;
  description: string;
}

export interface RestaurantResult {
  markdown: string;
  groundingChunks: any[];
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}
