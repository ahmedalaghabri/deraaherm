import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Send, Mic, Bot, Plus } from "lucide-react";
import { useAI } from "./AIContext";

export function ChatPanel() {
  const { isOpen, setIsOpen, messages, sendMessage, isTyping } = useAI();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setMounted(true), 10);
      return () => clearTimeout(t);
    } else {
      setMounted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (messagesEndRef.current && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-x-3 bottom-[72px] sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[400px] z-[60] bg-white dark:bg-neutral-900 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] border border-neutral-100 dark:border-neutral-700 flex flex-col overflow-hidden transition-all duration-300 ease-out ${
        mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95"
      }`}
      style={{ maxHeight: "min(640px, calc(100vh - 100px))", height: "auto" }}
    >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-t-2xl shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-white leading-tight">المساعد الذكي</h3>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 leading-tight truncate">يقرأ بيانات الصفحة ويرد عليك</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors shrink-0"
              aria-label="Close chat"
            >
              <X className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
            </button>
          </div>

          {/* Messages */}
          <div ref={containerRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0" style={{ maxHeight: "400px" }}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-[13px] leading-relaxed break-words ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded-bl-none border border-neutral-200/60 dark:border-neutral-700/60"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-none bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-2.5 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-b-2xl shrink-0">
            <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800 rounded-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700">
              <button
                type="button"
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors shrink-0"
              >
                <Plus className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب رسالتك..."
                className="flex-1 bg-transparent text-sm text-neutral-800 dark:text-white placeholder:text-neutral-400 focus:outline-none"
              />
              <button
                type="button"
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors shrink-0"
              >
                <Mic className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </button>
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-neutral-900 dark:bg-white hover:opacity-80 disabled:opacity-40 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-white transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-white dark:text-neutral-900" />
              </button>
            </div>
          </form>
    </div>
  );
}
