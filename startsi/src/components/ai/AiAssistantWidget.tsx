"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Bot,
  X,
  Send,
  Target,
  ShieldCheck,
  Rocket,
  Building2,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  matchProblemStatement,
  auditStartupEvaluation,
  evaluatePilotKpis,
  MatchProblemResult,
  RubricAuditResult,
  PilotEvaluationResult,
} from "@/lib/api";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  suggestions?: string[];
  modelData?: {
    type: "match" | "audit" | "pilot";
    matchResult?: MatchProblemResult;
    auditResult?: RubricAuditResult;
    pilotResult?: PilotEvaluationResult;
  };
}

export function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeModel, setActiveModel] = useState<"general" | "model1" | "model2" | "model3">("general");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "ai",
      text: "👋 Welcome to **InnovateGov Multi-Model AI Engine**!\n\nI am powered by 3 specialized AI models:\n• **Model 1**: Semantic Startup Matcher (NLP Problem → Startups)\n• **Model 2**: Hybrid Readiness & Paper Tiger Auditor\n• **Model 3**: Pilot KPI Telemetry & Scaling Engine\n\nHow can I assist your department or startup today?",
      timestamp: "Just now",
      suggestions: [
        "🎯 Match Problem: IoT Water Pipeline Leakage",
        "🛡️ Run Vendor Readiness Audit (Model 2)",
        "🚀 Evaluate Pilot KPI Telemetry (Model 3)",
        "What funding schemes are available?",
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

  const handleSend = async (textToSend?: string) => {
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

    const qLower = query.toLowerCase();

    // --------------------------------------------------------------------
    // MODEL 1 TRIGGER: Semantic Startup Matching
    // --------------------------------------------------------------------
    if (
      qLower.includes("match") ||
      qLower.includes("problem:") ||
      qLower.includes("pothole") ||
      qLower.includes("leakage") ||
      qLower.includes("traffic") ||
      qLower.includes("waste") ||
      activeModel === "model1"
    ) {
      try {
        const cleanProblem = query.replace(/^.*match/i, "").replace(/^[^\w]+/g, "").trim() || query;
        const res = await matchProblemStatement(cleanProblem, 4);

        setTimeout(() => {
          const aiMsg: Message = {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: `🎯 **Model 1 Semantic Matching Results**\n\nEvaluated **${res.totalStartupsEvaluated} registered startups** against your problem statement using semantic embeddings & cosine similarity.`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            modelData: {
              type: "match",
              matchResult: res,
            },
            suggestions: [
              "🛡️ Audit Top Match with Model 2",
              "🚀 Simulate Pilot Telemetry (Model 3)",
              "Match another problem statement",
            ],
          };
          setMessages((prev) => [...prev, aiMsg]);
          setIsTyping(false);
        }, 800);
        return;
      } catch (err) {
        console.error(err);
      }
    }

    // --------------------------------------------------------------------
    // MODEL 2 TRIGGER: Hybrid Expert Rubric & Objective Readiness Audit
    // --------------------------------------------------------------------
    if (
      qLower.includes("audit") ||
      qLower.includes("paper tiger") ||
      qLower.includes("readiness") ||
      qLower.includes("model 2") ||
      activeModel === "model2"
    ) {
      try {
        const auditRes = await auditStartupEvaluation({
          startupName: "CivicSense IoT Innovations",
          rubricScores: {
            "Technical Feasibility": 85,
            Innovation: 90,
            Scalability: 80,
            "Cost Viability": 75,
          },
          startupData: {
            trlLevel: 7,
            completedGovernmentPilots: 2,
            dpiitRecognized: true,
            annualTurnoverLakhs: 48.0,
          },
        });

        setTimeout(() => {
          const aiMsg: Message = {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: `🛡️ **Model 2: Hybrid Readiness & Statutory Audit Report**\n\nAudit analysis combining Subjective Expert Rubrics (55%) with Objective Telemetry & TRL Verification (45%):`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            modelData: {
              type: "audit",
              auditResult: auditRes,
            },
            suggestions: [
              "What is the Paper Tiger detection rule?",
              "🚀 Evaluate Pilot Deliverables (Model 3)",
              "Match another problem statement",
            ],
          };
          setMessages((prev) => [...prev, aiMsg]);
          setIsTyping(false);
        }, 800);
        return;
      } catch (err) {
        console.error(err);
      }
    }

    // --------------------------------------------------------------------
    // MODEL 3 TRIGGER: AI Pilot Result Recommendation Engine
    // --------------------------------------------------------------------
    if (
      qLower.includes("pilot") ||
      qLower.includes("telemetry") ||
      qLower.includes("scale") ||
      qLower.includes("attainment") ||
      qLower.includes("model 3") ||
      activeModel === "model3"
    ) {
      try {
        const pilotRes = await evaluatePilotKpis({
          target_leakage_reduction: 20,
          actual_leakage_reduction: 26,
          target_cost_reduction: 15,
          actual_cost_reduction: 18,
        });

        setTimeout(() => {
          const aiMsg: Message = {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: `🚀 **Model 3: Pilot KPI Telemetry & Procurement Recommendation**\n\nEvaluated live sensor telemetry against municipal contractual thresholds:`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            modelData: {
              type: "pilot",
              pilotResult: pilotRes,
            },
            suggestions: [
              "🎯 Match New Problem (Model 1)",
              "🛡️ Run Readiness Audit (Model 2)",
              "Explain Scale-Up procurement criteria",
            ],
          };
          setMessages((prev) => [...prev, aiMsg]);
          setIsTyping(false);
        }, 800);
        return;
      } catch (err) {
        console.error(err);
      }
    }

    // --------------------------------------------------------------------
    // GENERAL ASSISTANT KNOWLEDGE BASE
    // --------------------------------------------------------------------
    setTimeout(() => {
      let aiReplyText = "";
      let newSuggestions: string[] = [];

      if (qLower.includes("scheme") || qLower.includes("funding") || qLower.includes("sisfs")) {
        aiReplyText =
          "🏛️ **Government Startup Funding Programs**:\n\n" +
          "1. **Startup India Seed Fund (SISFS)**: Up to ₹20 Lakhs grant for prototype validation + ₹50 Lakhs convertible debt.\n" +
          "2. **Maharashtra State Innovation Society (MSInS)**: Work order grants up to ₹15 Lakhs for municipal pilot deployments.\n" +
          "3. **Credit Guarantee Scheme (CGSS)**: Collateral-free credit up to ₹20 Crore.\n\n" +
          "Would you like to match a challenge or audit vendor readiness?";
        newSuggestions = ["🎯 Match Problem (Model 1)", "🛡️ Run Readiness Audit (Model 2)", "Browse Open Challenges"];
      } else {
        aiReplyText =
          `Thank you for asking about "${query}".\n\n` +
          `On **InnovateGov**, government departments can formulate problem statements, match innovative startups using **Model 1**, audit statutory compliance via **Model 2**, and evaluate pilot sensor telemetry with **Model 3**.`;
        newSuggestions = [
          "🎯 Match Problem: AI Traffic Telemetry",
          "🛡️ Audit Vendor Readiness",
          "🚀 Evaluate Pilot KPI Telemetry",
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
    }, 700);
  };

  return (
    <>
      {/* FLOATING AI LAUNCHER BUTTON */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative group py-3 px-4 rounded-full bg-gradient-to-r from-[#16224B] to-[#2F5FEA] text-white font-extrabold text-xs shadow-xl shadow-blue-900/30 transition-all flex items-center gap-2.5 border border-blue-400/30 cursor-pointer"
          aria-label="Open AI Assistant"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-100"></span>
          </span>
          <Bot className="w-4 h-4 text-white" />
          <span className="tracking-wide">AI Multi-Model</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
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
            className="fixed bottom-22 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[460px] h-[600px] max-h-[85vh] bg-[#FAF8F5] dark:bg-[#111827] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-[#16224B] text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#2F5FEA] to-indigo-400 flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                    <span>InnovateGov AI Engine</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30">
                      3 Trained Models
                    </span>
                  </h3>
                  <p className="text-[10px] text-blue-200 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Semantic Matcher • Readiness Auditor • KPI Engine</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Model Selector Strip */}
            <div className="px-3 py-2 bg-slate-900/90 text-white flex items-center gap-1.5 border-b border-slate-800 overflow-x-auto text-[11px] font-bold">
              <button
                onClick={() => {
                  setActiveModel("model1");
                  handleSend("🎯 Match Problem: AI Vision for Municipal Traffic & Pothole Detection");
                }}
                className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/30 text-blue-200 flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Target className="w-3 h-3 text-blue-400" />
                <span>Model 1: Matcher</span>
              </button>
              <button
                onClick={() => {
                  setActiveModel("model2");
                  handleSend("🛡️ Run Model 2 Hybrid Readiness Audit on Vendor");
                }}
                className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/30 text-purple-200 flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <ShieldCheck className="w-3 h-3 text-purple-400" />
                <span>Model 2: Audit</span>
              </button>
              <button
                onClick={() => {
                  setActiveModel("model3");
                  handleSend("🚀 Run Model 3 Pilot Telemetry Evaluation");
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/30 text-emerald-200 flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Rocket className="w-3 h-3 text-emerald-400" />
                <span>Model 3: Pilot</span>
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
                    className={`max-w-[90%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-[#2F5FEA] text-white rounded-br-none shadow-sm"
                        : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-bl-none shadow-xs"
                    }`}
                  >
                    {msg.text}

                    {/* MODEL 1 CARDS */}
                    {msg.modelData?.type === "match" && msg.modelData.matchResult && (
                      <div className="mt-3 space-y-2">
                        {msg.modelData.matchResult.topMatches.map((m, idx) => (
                          <div
                            key={m.id || idx}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold">
                                  #{idx + 1}
                                </span>
                                {m.name}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                                {m.matchScore}% Match
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {m.description}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 pt-1">
                              <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                📍 {m.city}
                              </span>
                              <span className="truncate">🏷️ {m.industries}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* MODEL 2 CARDS */}
                    {msg.modelData?.type === "audit" && msg.modelData.auditResult && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Candidate</span>
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                              {msg.modelData.auditResult.startupName}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-lg text-[10px] font-extrabold ${
                              msg.modelData.auditResult.riskFlag.includes("CRITICAL")
                                ? "bg-rose-100 text-rose-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {msg.modelData.auditResult.riskFlag}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-center py-1">
                          <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            <span className="text-[9px] text-slate-400 font-bold block">Expert Rubric (55%)</span>
                            <span className="text-sm font-extrabold text-blue-600">
                              {msg.modelData.auditResult.approach2.expertRubricScore}/10
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            <span className="text-[9px] text-slate-400 font-bold block">Objective Telemetry (45%)</span>
                            <span className="text-sm font-extrabold text-purple-600">
                              {msg.modelData.auditResult.approach2.objectiveReadinessScore}/10
                            </span>
                          </div>
                        </div>

                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-blue-900 dark:text-blue-200">
                              Composite Score: {msg.modelData.auditResult.approach2.compositeScore}/10
                            </span>
                            <span className="text-[10px] font-extrabold text-blue-700 dark:text-blue-300">
                              Verdict: {msg.modelData.auditResult.approach2.verdict}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 text-[10px]">
                          {msg.modelData.auditResult.approach2.strengths.slice(0, 2).map((s, idx) => (
                            <div key={idx} className="flex items-center gap-1 text-emerald-600 font-medium">
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* MODEL 3 CARDS */}
                    {msg.modelData?.type === "pilot" && msg.modelData.pilotResult && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                            {msg.modelData.pilotResult.verdict}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                            Recommendation: {msg.modelData.pilotResult.recommendation}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-300">
                          {msg.modelData.pilotResult.reason}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold pt-1">
                          <div className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            <span>Leakage Attainment: </span>
                            <span className="text-emerald-600">
                              {msg.modelData.pilotResult.metrics.leakageAttainmentPct}%
                            </span>
                          </div>
                          <div className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            <span>Cost Attainment: </span>
                            <span className="text-emerald-600">
                              {msg.modelData.pilotResult.metrics.costAttainmentPct}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1">
                          <span>Confidence Score</span>
                          <span className="font-extrabold text-slate-700 dark:text-slate-200">
                            {msg.modelData.pilotResult.confidence}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>

                  {/* Suggestion Quick Pills */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[95%]">
                      {msg.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(sug)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[#2F5FEA] dark:text-blue-300 border border-slate-200 dark:border-slate-700 transition-all text-left flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-[#2F5FEA] dark:text-blue-300 shrink-0" />
                          <span>{sug}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-28">
                  <Bot className="w-4 h-4 text-[#2F5FEA] animate-bounce" />
                  <span className="text-[10px] text-slate-400 font-bold">Computing AI...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
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
                  placeholder="Ask AI, match a problem, or audit readiness..."
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isTyping}
                  className="p-2.5 rounded-2xl bg-[#2F5FEA] hover:bg-[#234BCB] text-white disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer"
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
