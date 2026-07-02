import { motion } from "framer-motion";
import { Mic, Send, Plus } from "lucide-react";
import { useAI } from "./AIContext";

export function FloatingAssistant() {
  const { isOpen, setIsOpen } = useAI();

  if (isOpen) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.5 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[55] w-[92%] max-w-lg"
    >
      <button
        onClick={() => setIsOpen(true)}
        className="w-full group relative flex items-center gap-2 px-2 py-2 rounded-full bg-white dark:bg-neutral-800 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)] transition-all duration-300"
      >
        {/* Plus icon */}
        <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center shadow-sm shrink-0">
          <Plus className="w-4 h-4 text-white" />
        </div>

        {/* Search text */}
        <div className="flex-1 text-right">
          <span className="text-sm text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors">
            Chat here...
          </span>
        </div>

        {/* Mic button */}
        <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors shrink-0">
          <Mic className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
        </div>

        {/* Send button */}
        <div className="w-9 h-9 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center shadow-sm shrink-0">
          <Send className="w-4 h-4 text-white dark:text-neutral-900 -rotate-90" />
        </div>
      </button>
    </motion.div>
  );
}
