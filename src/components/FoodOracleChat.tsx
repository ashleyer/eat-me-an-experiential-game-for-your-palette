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
          className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-40 flex flex-col h-screen text-slate-800"
          id="food-oracle-chat-drawer"
        >
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-100 text-slate-900 rounded-full">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Consult the Oracle</h3>
                <p className="text-[10px] text-emerald-600 flex items-center space-x-1 uppercase font-bold tracking-wider mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-ping"></span>
                  <span>Grounding via Google Search</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              id="btn-close-chat"
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6" id="chat-messages-container">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-400 ${msg.role === "user" ? "mr-1" : "ml-1"}`}>
                  {msg.role === "user" ? "You" : "Food Oracle"}
                </div>
                <div
                  className={`max-w-[85%] rounded-3xl px-5 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-slate-900 text-white font-medium rounded-tr-none shadow-md"
                      : "bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100"
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
                <span className="text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-400 ml-1">Food Oracle</span>
                <div className="bg-slate-50 border border-slate-100 rounded-3xl rounded-tl-none px-5 py-4 flex items-center space-x-1.5">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-6 border-t border-slate-100 bg-white flex items-center space-x-3"
            id="chat-input-form"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about these places..."
              disabled={isLoading}
              id="input-chat-message"
              className="flex-grow bg-slate-50 border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white rounded-full px-5 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              id="btn-send-chat"
              className="p-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 text-white rounded-full transition-all shadow-md active:scale-95 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
