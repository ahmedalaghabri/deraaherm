import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { useAI } from "./AIContext";

export function FloatingAssistant() {
  const { isOpen, setIsOpen } = useAI();
  const [isHidden, setIsHidden] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Must be before any early return (Rules of Hooks)
  useEffect(() => {
    if (isOpen) return;
    timerRef.current = setTimeout(() => setIsHidden(true), 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isOpen]);

  const showFull = () => {
    setIsHidden(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsHidden(true), 5000);
  };

  if (isOpen) return null;

  return (
    <div className="fixed bottom-[88px] sm:bottom-4 left-1/2 -translate-x-1/2 z-[55]" onMouseEnter={showFull}>
      <AnimatePresence mode="wait">
        {isHidden ? (
          // Mini floating dot (auto-hidden state)
          <motion.button
            key="mini"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={() => { showFull(); setIsOpen(true); }}
            className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-[0_4px_16px_rgba(59,130,246,0.35)] hover:shadow-[0_6px_24px_rgba(59,130,246,0.45)] transition-shadow"
            aria-label="Open assistant"
          >
            <Sparkles className="w-4 h-4" />
          </motion.button>
        ) : (
          // Full button bar
          <motion.div
            key="full"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-[92vw] max-w-lg"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="w-full group relative flex items-center gap-2 px-2 py-2 rounded-full bg-white dark:bg-neutral-800 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)] transition-all duration-300"
            >
              {/* Sparkles icon (desktop only) */}
              <div className="hidden sm:flex w-9 h-9 rounded-full bg-blue-500 items-center justify-center shadow-sm shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>

              {/* Text */}
              <div className="flex-1 text-right px-1">
                <span className="text-sm text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors truncate block">
                  اضغط للدردشة مع المساعد الذكي...
                </span>
              </div>

              {/* Send button */}
              <div className="w-9 h-9 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center shadow-sm shrink-0">
                <Send className="w-4 h-4 text-white dark:text-neutral-900 -rotate-90" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
