import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, MessageCircle, X, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ChatMessage } from "../types";

interface FoodOracleChatProps {
  restaurantContext: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function FoodOracleChat({
  restaurantContext,
  isOpen,
  onClose,
}: FoodOracleChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Greetings, hungry traveler! I am the Food Oracle. I see your quest results—how can I guide your palate today? Ask me about parking, vegan options, price levels, or anything else!",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText("");
    
    // Add user message to history
    const updatedMessages = [...messages, { role: "user" as const, text: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Map history to standard Gemini chat format
      const history = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: history,
          context: restaurantContext,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "model", text: data.text },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: `⚠️ Oracle Error: ${data.error || "The gourmet spirits are temporarily silent. Please check your API key in Settings > Secrets."}`,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "⚠️ Connection Failed: Could not consult the food spirits. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl z-40 flex flex-col h-screen text-slate-100"
          id="food-oracle-chat-drawer"
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Consult the Food Oracle</h3>
                <p className="text-[10px] text-emerald-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-ping"></span>
                  <span>Grounding via Google Search</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              id="btn-close-chat"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4" id="chat-messages-container">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div className={`text-[10px] font-mono mb-1 text-slate-500 ${msg.role === "user" ? "mr-1" : "ml-1"}`}>
                  {msg.role === "user" ? "You" : "Food Oracle"}
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow ${
                    msg.role === "user"
                      ? "bg-amber-500 text-slate-950 font-medium rounded-tr-none"
                      : "bg-slate-900 text-slate-100 rounded-tl-none border border-slate-800"
                  }`}
                >
                  <div className="markdown-body">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex flex-col items-start" id="chat-loading-indicator">
                <span className="text-[10px] font-mono mb-1 text-slate-500 ml-1">Food Oracle</span>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 shadow flex items-center space-x-1.5">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center space-x-2"
            id="chat-input-form"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g., Which has veggie options? Is there parking?"
              disabled={isLoading}
              id="input-chat-message"
              className="flex-grow bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              id="btn-send-chat"
              className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-slate-950 rounded-xl transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
