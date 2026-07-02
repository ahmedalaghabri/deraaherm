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
  const route = pageCtx?.route || "";

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
    return "لا توجد بيانات متاحة حالياً في هذه الصفحة. جرّب التنقل لصفحة أخرى.";
  }

  // ====== Dashboard / KPI page ======
  if (route === "dashboard" || t.includes("أداء") || t.includes("kpi") || t.includes("إنجاز")) {
    if (t.includes("أداء") || t.includes("performance")) {
      const match = ds.match(/أداء الموظف:\s*(\d+)%/);
      return match ? `أداء الموظف الحالي: **${match[1]}%**` : ds.slice(0, 250);
    }
    if (t.includes("مهمة") || t.includes("مهام")) {
      const match = ds.match(/المهام المنجزة:\s*(\d+)/);
      return match ? `المهام المنجزة: **${match[1]}**` : ds.slice(0, 250);
    }
    if (t.includes("حضور")) {
      const match = ds.match(/معدل الحضور:\s*(\d+)%/);
      return match ? `معدل الحضور: **${match[1]}%**` : ds.slice(0, 250);
    }
    return `إليك ملخص **${pageCtx?.title}**:\n${ds.slice(0, 300)}${ds.length > 300 ? "..." : ""}`;
  }

  // ====== Tasks page ======
  if (route === "tasks" || t.includes("مهمة") || t.includes("مهام") || t.includes("مشروع")) {
    const totalMatch = ds.match(/إجمالي المهام:\s*(\d+)/);
    const total = totalMatch ? totalMatch[1] : "?";

    if (t.includes("عدد") || t.includes("كم") || t.includes("كام")) {
      return `إجمالي المهام: **${total}**.`;
    }

    // Search for assignee name
    const assigneeLines = ds.split("\n").filter(l => l.startsWith("- ") && l.includes("مهمة"));
    const matchedAssignee = assigneeLines.find(l => {
      const name = l.replace(/^-\s+/, "").split(":")[0];
      return name && t.includes(name.toLowerCase());
    });
    if (matchedAssignee) {
      return `**${matchedAssignee.replace("- ", "").trim()}**`;
    }

    // Status-specific questions
    if (t.includes("منتهية") || t.includes("اكتمل") || t.includes("completed")) {
      const line = ds.split("\n").find(l => l.includes("منتهية"));
      return line ? `**${line.replace("- ", "").trim()}**` : `من بين ${total} مهمة.`;
    }
    if (t.includes("متأخرة") || t.includes("overdue")) {
      const line = ds.split("\n").find(l => l.includes("متأخرة"));
      return line ? `**${line.replace("- ", "").trim()}**` : `من بين ${total} مهمة.`;
    }
    if (t.includes("قيد العمل") || t.includes("in-progress")) {
      const line = ds.split("\n").find(l => l.includes("قيد العمل"));
      return line ? `**${line.replace("- ", "").trim()}**` : `من بين ${total} مهمة.`;
    }

    return `إليك ملخص **${pageCtx?.title}**:\n${ds.slice(0, 300)}${ds.length > 300 ? "..." : ""}`;
  }

  // ====== Attendance page ======
  if (route === "attendance" || route === "attendance_report" || t.includes("حضور") || t.includes("انصراف") || t.includes("دوام") || t.includes("تأخير")) {
    if (t.includes("تأخير")) {
      const match = ds.match(/إجمالي ساعات التأخير:\s*([\d.]+)/);
      return match ? `إجمالي ساعات التأخير: **${match[1]} ساعة**` : ds.slice(0, 250);
    }
    if (t.includes("غياب")) {
      const match = ds.match(/الغياب:\s*(\d+)/);
      return match ? `عدد أيام الغياب: **${match[1]}**` : ds.slice(0, 250);
    }
    if (t.includes("إضافي") || t.includes("overtime")) {
      const match = ds.match(/إجمالي ساعات إضافية:\s*([\d.]+)/);
      return match ? `إجمالي ساعات العمل الإضافي: **${match[1]} ساعة**` : ds.slice(0, 250);
    }
    if (t.includes("موظف") || t.includes("اسم")) {
      const match = ds.match(/الموظف:\s*(.+)/);
      return match ? `الموظف: **${match[1].trim()}**` : ds.slice(0, 250);
    }
    return `إليك ملخص **${pageCtx?.title}**:\n${ds.slice(0, 300)}${ds.length > 300 ? "..." : ""}`;
  }

  // ====== Schedule page ======
  if (route === "schedule" || t.includes("جدول") || t.includes("موظف") || t.includes("حالة")) {
    const empLines = ds.split("\n").filter(l => l.startsWith("- "));
    const empNames = empLines.map(l => {
      const m = l.match(/^-\s+(.+?):/);
      return m ? m[1].trim() : "";
    }).filter(Boolean);

    // Search for employee name
    const matchedEmp = empNames.find(name => t.includes(name.toLowerCase()));
    if (matchedEmp) {
      const line = empLines.find(l => l.includes(matchedEmp)) || "";
      return `وجدت **${matchedEmp}** في البيانات: ${line.replace("- ", "").trim()}`;
    }

    if (t.includes("عدد") || t.includes("كم") || t.includes("كام")) {
      if (t.includes("موظف")) return `عدد الموظفين: **${empNames.length}**.`;
    }

    if (t.includes("حاضر") || t.includes("داوم") || t.includes("يعمل")) {
      const present = empLines.filter(l => l.includes("حاضر") || l.includes("تغطية") || l.includes("تعويضي"));
      if (present.length > 0) {
        return `الموظفون المداومون (${present.length}):\n${present.slice(0, 5).map(l => "• " + l.replace("- ", "").trim()).join("\n")}${present.length > 5 ? "\n... وغيرهم" : ""}`;
      }
    }

    if (t.includes("غائب") || t.includes("إجازة") || t.includes("اجازة")) {
      const absent = empLines.filter(l => l.includes("غائب") || l.includes("إجازة") || l.includes("اجازة"));
      if (absent.length > 0) {
        return `الموظفون في إجازة / غائبون (${absent.length}):\n${absent.slice(0, 5).map(l => "• " + l.replace("- ", "").trim()).join("\n")}${absent.length > 5 ? "\n... وغيرهم" : ""}`;
      }
    }

    return `إليك ملخص **${pageCtx?.title}**:\n${ds.slice(0, 300)}${ds.length > 300 ? "..." : ""}`;
  }

  // ====== Transactions page ======
  if (route === "transactions" || route === "inbox" || route === "outbox" || t.includes("معاملة") || t.includes("معاملات")) {
    const totalMatch = ds.match(/إجمالي المعاملات:\s*(\d+)/);
    const total = totalMatch ? totalMatch[1] : "?";

    if (t.includes("عدد") || t.includes("كم") || t.includes("كام")) {
      return `إجمالي المعاملات: **${total}**.`;
    }

    return `إليك ملخص **${pageCtx?.title}**:\n${ds.slice(0, 300)}${ds.length > 300 ? "..." : ""}`;
  }

  // Default: show summary
  return `إليك ملخص **${pageCtx?.title}**:\n${ds.slice(0, 300)}${ds.length > 300 ? "..." : ""}\n\nاسألني عن أي تفصيل!`;
}
