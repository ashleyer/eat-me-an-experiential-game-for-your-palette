import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured. Please add your Gemini API Key in the Settings > Secrets panel of AI Studio.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: Get restaurant recommendations based on craving and location
  app.post("/api/restaurants", async (req, res) => {
    try {
      const { query, lat, lng, locationText } = req.body;
      const ai = getGeminiClient();

      let locationPrompt = "";
      let config: any = {
        tools: [{ googleMaps: {} }],
      };

      if (lat && lng) {
        locationPrompt = `nearby my location at coordinates (${lat}, ${lng})`;
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: Number(lat),
              longitude: Number(lng)
            }
          }
        };
      } else if (locationText) {
        locationPrompt = `in or near "${locationText}"`;
      } else {
        locationPrompt = "in my local area";
      }

      const prompt = `You are an expert foodie guide and dining companion. 
The user is playing a gamified craving explorer and has just selected the craving or culinary theme: "${query}".
Please search for and recommend 4 to 5 actual, top-rated local restaurants that match this craving or theme ${locationPrompt}.

Provide a fun, short, appetizing introduction describing why these options are great for their craving.
For each restaurant:
1. Provide the name, relative vibe, rating, address, and a specific dish recommendation.
2. Use Google Maps grounding to fetch real-time places. Do not synthesize fake places.
3. Make sure to present your answer in clear, beautiful Markdown with structured headings, lists, and emojis.
4. Encourage them to use the Map Link provided in each match to view directions or details.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: config
      });

      const text = response.text || "No recommendations found.";
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      res.json({
        success: true,
        markdown: text,
        groundingChunks: groundingChunks
      });
    } catch (error: any) {
      console.error("Error in /api/restaurants:", error);
      res.status(500).json({
        success: false,
        error: error.message || "An unexpected error occurred while looking up restaurants."
      });
    }
  });

  // API: Chat interface for the "Food Oracle" chatbot
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, context } = req.body;
      const ai = getGeminiClient();

      // Formulate system instructions
      const systemInstruction = `You are the "Food Oracle", a friendly, witty, and deeply knowledgeable local dining expert.
The user is asking you questions about local restaurants, specific cravings, or dining options.
Here is the context of the restaurants recommended to them in their recent game:
${context ? JSON.stringify(context) : "No specific recommendations are loaded yet."}

Your goals:
1. Be extremely helpful, fun, and culinary-minded.
2. Answer questions about these restaurants, such as vegetarian-friendliness, atmospheres, or price, using your Google Search grounding tool to provide real-time, highly accurate information.
3. Keep answers concise, appetizing, and styled with Markdown.
4. Maintain a warm, encouraging, conversational tone.`;

      // Build contents array including history
      const contents: any[] = [];
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          contents.push({
            role: turn.role,
            parts: [{ text: turn.text }]
          });
        }
      }
      
      // Append the new message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          tools: [{ googleSearch: {} }] // Support general web search grounding for specific queries
        }
      });

      const responseText = response.text || "I'm not sure how to answer that, let's try another question!";
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      res.json({
        success: true,
        text: responseText,
        groundingChunks: groundingChunks
      });
    } catch (error: any) {
      console.error("Error in /api/chat:", error);
      res.status(500).json({
        success: false,
        error: error.message || "An error occurred during the conversation."
      });
    }
  });

  // Vite or static serving middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
