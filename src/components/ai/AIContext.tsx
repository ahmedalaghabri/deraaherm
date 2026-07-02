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

// Smart rule-based reply engine that searches within page dataSummary
function generateReply(userText: string, pageCtx: PageContext | null): string {
  const t = userText.toLowerCase().trim();
  const ds = pageCtx?.dataSummary || "";

  // Greetings
  if (t.includes("مرحب") || t.includes("اهلا") || t.includes("سلام")) {
    return pageCtx
      ? `أهلاً بك! أنا أقرأ حالياً بيانات **${pageCtx.title}**. اسألني أي شيء عنها.`
      : "أهلاً بك! أنا هنا للمساعدة. ماذا تريد أن تعرف عن بيانات نظامك؟";
  }

  // Thanks
  if (t.includes("شكر") || t.includes("thanks")) {
    return "العفو! أنا دائماً في الخدمة. 😊";
  }

  // If no page data available
  if (!ds) {
    return "لا توجد بيانات متاحة حالياً في هذه الصفحة. جرّب التنقل لصفحة الجدولة أو الحضور.";
  }

  // Extract employee names from dataSummary lines like "- أحمد: حاضر"
  const empLines = ds.split("\n").filter(l => l.startsWith("- "));
  const empNames = empLines.map(l => {
    const m = l.match(/^-\s+(.+?):/);
    return m ? m[1].trim() : "";
  }).filter(Boolean);

  // Search for employee name in question
  const matchedEmp = empNames.find(name => t.includes(name.toLowerCase()));
  if (matchedEmp) {
    const line = empLines.find(l => l.includes(matchedEmp)) || "";
    return `وجدت **${matchedEmp}** في البيانات: ${line.replace("- ", "").trim()}`;
  }

  // Count / number questions
  if (t.includes("عدد") || t.includes("كم") || t.includes("كام")) {
    if (t.includes("موظف")) {
      return `عدد الموظفين: **${empNames.length}**.`;
    }
    const totalMatch = ds.match(/إجمالي الأيام:\s*(\d+)/);
    if (totalMatch && (t.includes("يوم") || t.includes("شهر"))) {
      return `إجمالي الأيام في الشهر: **${totalMatch[1]}** يوم.`;
    }
    const schedMatch = ds.match(/أيام مجدولة:\s*(\d+)/);
    if (schedMatch) {
      return `الأيام المجدولة: **${schedMatch[1]}** من أصل ${totalMatch ? totalMatch[1] : "?"}.`;
    }
    return `حالياً يوجد **${empNames.length}** موظف مسجل.`;
  }

  // Present / working questions
  if (t.includes("حاضر") || t.includes("داوم") || t.includes("يعمل")) {
    const present = empLines.filter(l => l.includes("حاضر") || l.includes("تغطية") || l.includes("تعويضي"));
    if (present.length > 0) {
      return `الموظفون المداومون (${present.length}):\n${present.slice(0, 5).map(l => "• " + l.replace("- ", "").trim()).join("\n")}${present.length > 5 ? "\n... وغيرهم" : ""}`;
    }
    return "لا يوجد موظفون مداومون في البيانات الحالية.";
  }

  // Leave / absent questions
  if (t.includes("غائب") || t.includes("إجازة") || t.includes("اجازة") || t.includes("غياب")) {
    const absent = empLines.filter(l => l.includes("غائب") || l.includes("إجازة") || l.includes("اجازة") || l.includes("مرضية") || l.includes("طارئة"));
    if (absent.length > 0) {
      return `الموظفون في إجازة / غائبون (${absent.length}):\n${absent.slice(0, 5).map(l => "• " + l.replace("- ", "").trim()).join("\n")}${absent.length > 5 ? "\n... وغيرهم" : ""}`;
    }
    return "لا يوجد موظفون في إجازة في البيانات الحالية.";
  }

  // Schedule / shift questions
  if (t.includes("دوام") || t.includes("فترة") || t.includes("shift") || t.includes("دوام")) {
    return `بيانات الدوام الحالية:\n${empLines.slice(0, 6).map(l => "• " + l.replace("- ", "").trim()).join("\n")}${empLines.length > 6 ? "\n... وغيرهم" : ""}`;
  }

  // Specific status questions
  if (t.includes("حالة")) {
    return `حالات الموظفين:\n${empLines.slice(0, 6).map(l => "• " + l.replace("- ", "").trim()).join("\n")}${empLines.length > 6 ? "\n... وغيرهم" : ""}`;
  }

  // Default: show summary
  return `إليك ملخص **${pageCtx?.title}**:\n${ds.slice(0, 300)}${ds.length > 300 ? "..." : ""}\n\nاسألني عن موظف محدد أو عدد الحاضرين!`;
}
