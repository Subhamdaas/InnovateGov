"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Bot,
  X,
  Send,
} from "lucide-react";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "ai",
      text: "Hello! I am your **InnovateGov AI Assistant**. How can I assist you with public sector challenges, government grant schemes, or pilot applications today?",
      timestamp: "Just now",
      suggestions: [
        "How do I apply for open challenges?",
        "Which government schemes match my startup?",
        "What is the Startup India Seed Fund (SISFS)?",
        "How are pilot milestones evaluated?",
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery("");
    setIsTyping(true);

    // Simulate AI thinking and structured response
    setTimeout(() => {
      let aiReplyText = "";
      let newSuggestions: string[] = [];

      const qLower = query.toLowerCase();

      if (qLower.includes("scheme") || qLower.includes("seed fund") || qLower.includes("sisfs") || qLower.includes("funding")) {
        aiReplyText =
          "Here are the top Government Funding Schemes relevant to your venture:\n\n" +
          "1. **Startup India Seed Fund Scheme (SISFS)**: Up to ₹20 Lakhs grant for PoC/prototype, plus up to ₹50 Lakhs convertible debt.\n" +
          "2. **Credit Guarantee Scheme (CGSS)**: Collateral-free loan guarantee up to ₹20 Crore.\n" +
          "3. **State Grants**: Karnataka ELEVATE (up to ₹50L/₹1Cr), TANSEED Tamil Nadu (up to ₹15L), & KSUM Seed Fund.\n\n" +
          "Would you like me to guide you to the public schemes directory on the portal?";
        newSuggestions = ["Show National Schemes", "Show State Schemes", "How to submit proposal?"];
      } else if (qLower.includes("challenge") || qLower.includes("apply") || qLower.includes("problem")) {
        aiReplyText =
          "To apply for live Government Challenges:\n\n" +
          "1. Navigate to **Open Challenges** in your Founder Portal.\n" +
          "2. Review the problem statement, expected outcomes, and department budget.\n" +
          "3. Fill out the standardized technical proposal & deployment timeline form.\n" +
          "4. Submissions undergo transparent AI scoring and expert committee review within ~14 days!";
        newSuggestions = ["Browse Open Challenges", "What are the evaluation criteria?", "Check pilot funding rules"];
      } else if (qLower.includes("pilot") || qLower.includes("milestone") || qLower.includes("evaluation")) {
        aiReplyText =
          "Pilot projects on InnovateGov are structured into milestone deliverables (e.g., field sensor deployment, telemetry calibration, accuracy audit). Upon officer verification, funds are released directly to your account.";
        newSuggestions = ["Track my applications", "View active pilots", "Contact department officer"];
      } else {
        aiReplyText =
          `Thank you for asking about "${query}". On InnovateGov, startups can directly connect with municipal corporations & public sector departments to pilot solutions, receive milestone grants, and scale across government branches.`;
        newSuggestions = [
          "Explore Open Challenges",
          "Government Scheme Eligibility",
          "Sign In as Startup",
        ];
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestions: newSuggestions,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <>
      {/* FLOATING AI LAUNCHER BUTTON */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative group py-3 px-4 rounded-full bg-[#8C634B] hover:bg-[#724E38] text-white font-extrabold text-xs shadow-xl shadow-amber-900/20 transition-all flex items-center gap-2.5 border border-amber-200/30 cursor-pointer"
          aria-label="Open AI Assistant"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-100"></span>
          </span>
          <Bot className="w-4 h-4 text-white" />
          <span className="tracking-wide">InnovateGov AI</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
        </motion.button>
      </div>

      {/* CHAT MODAL / DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-22 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[540px] max-h-[80vh] bg-[#FAF8F5] dark:bg-[#1C1917] rounded-3xl shadow-2xl border border-[#EFECE6] dark:border-[#332D28] z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-[#362A22] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#8C634B] flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                    <span>InnovateGov AI Assistant</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30">
                      v2.0
                    </span>
                  </h3>
                  <p className="text-[10px] text-amber-100/80 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active • Ready to assist</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-amber-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-[#8C634B] text-white rounded-br-none shadow-sm"
                        : "bg-white dark:bg-[#25211E] text-slate-800 dark:text-slate-100 border border-[#EFECE6] dark:border-[#332D28] rounded-bl-none shadow-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>

                  {/* Suggestion Quick Pills */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[90%]">
                      {msg.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(sug)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white dark:bg-[#2A2522] hover:bg-[#F4EFEA] dark:hover:bg-[#362E28] text-[#8C634B] dark:text-amber-300 border border-[#EFECE6] dark:border-[#3C342E] transition-all text-left flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-[#8C634B] dark:text-amber-300 shrink-0" />
                          <span>{sug}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 p-3 bg-white dark:bg-[#25211E] rounded-2xl border border-[#EFECE6] dark:border-[#332D28] w-24">
                  <Bot className="w-4 h-4 text-[#8C634B] animate-bounce" />
                  <span className="text-[10px] text-slate-400 font-bold">Typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white dark:bg-[#201D1A] border-t border-[#EFECE6] dark:border-[#332D28]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask AI about challenges, schemes, pilots..."
                  className="flex-1 px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141210] border border-[#EFECE6] dark:border-[#332D28] rounded-2xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8C634B]/30"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isTyping}
                  className="p-2.5 rounded-2xl bg-[#8C634B] hover:bg-[#724E38] text-white disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
