import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface PageContext {
  route: string;
  title: string;
  dataSummary?: string;
}

interface AIContextType {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
  clearChat: () => void;
  pageContext: PageContext | null;
  setPageContext: (ctx: PageContext | null) => void;
  isTyping: boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "مرحباً! أنا مساعدك الذكي. يمكنك سؤالي عن بيانات الصفحة الحالية، أو طلب تحليل، أو أي مساعدة تحتاجها.",
      timestamp: new Date(),
    },
  ]);
  const [pageContext, setPageContext] = useState<PageContext | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(
    (text: string) => {
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      // Simulate assistant response
      setTimeout(() => {
        const reply = generateReply(text, pageContext);
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setIsTyping(false);
      }, 1200);
    },
    [pageContext]
  );

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "تم مسح المحادثة. كيف يمكنني مساعدتك الآن؟",
        timestamp: new Date(),
      },
    ]);
  }, []);

  return (
    <AIContext.Provider
      value={{ isOpen, setIsOpen, messages, sendMessage, clearChat, pageContext, setPageContext, isTyping }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error("useAI must be used within AIProvider");
  return ctx;
}

// Simple rule-based reply engine (can be replaced with real AI API)
function generateReply(userText: string, pageCtx: PageContext | null): string {
  const t = userText.toLowerCase();

  if (t.includes("موظف") || t.includes("عدد") || t.includes("حاضر") || t.includes("دوام")) {
    return pageCtx?.dataSummary
      ? `وفقاً للبيانات الحالية في صفحة **${pageCtx.title}**: ${pageCtx.dataSummary}`
      : "لا توجد بيانات مفصلة متاحة حالياً في هذه الصفحة. يمكنك التنقل إلى صفحة الجدولة لعرض تفاصيل الموظفين.";
  }

  if (t.includes("جدول") || t.includes("schedule") || t.includes("تقويم")) {
    return "يمكنك الاطلاع على الجدول الزمني من صفحة الجدولة. هل تريد معرفة عدد الموظفين المداومين في فترة محددة؟";
  }

  if (t.includes("حالة") || t.includes("status")) {
    return "الحالات المتاحة هي: حاضر، غائب، إجازة أسبوعية، إجازة سنوية، إجازة مرضية، إجازة طارئة، تعويضي، وتغطية.";
  }

  if (t.includes("مرحب") || t.includes("اهلا") || t.includes("سلام")) {
    return "أهلاً بك! أنا هنا للمساعدة. ماذا تريد أن تعرف عن بيانات نظامك؟";
  }

  if (t.includes("شكر") || t.includes("thanks")) {
    return "العفو! أنا دائماً في الخدمة. 😊";
  }

  return "أنا مساعدك الذكي. يمكنني قراءة بيانات الصفحة الحالية والإجابة على استفساراتك حول الجداول والموظفين والحضور. ما هو سؤالك؟";
}
