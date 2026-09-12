"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Building2,
  Users,
  MapPin,
  Calendar,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Rocket,
  Save,
  Award,
  Sparkles,
  ClipboardCheck,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import {
  getChallenge,
  getStartup,
  submitEvaluation,
  startPilot,
} from "@/lib/api";
import { Challenge, Startup, EvalStatus } from "@/types";
import { fadeInUp, staggerContainer } from "@/lib/motion";

interface Criterion {
  id: string;
  label: string;
  weight: number; // percentage, e.g. 25 for 25%
}

const CRITERIA: Criterion[] = [
  { id: "tech", label: "Technical Feasibility", weight: 25 },
  { id: "innov", label: "Innovation", weight: 20 },
  { id: "impact", label: "Impact", weight: 20 },
  { id: "cost", label: "Cost-Effectiveness", weight: 15 },
  { id: "scale", label: "Scalability", weight: 10 },
  { id: "sec", label: "Security", weight: 10 },
];

export default function StartupEvaluationPage({
  params,
}: {
  params: Promise<{ id: string; startupId: string }>;
}) {
  const resolvedParams = use(params);
  const challengeId = resolvedParams.id;
  const startupId = resolvedParams.startupId;

  const router = useRouter();
  const { currentUser, hasHydrated } = useSessionStore();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Scores state: key = criterion label, value = number 0-100
  const [scores, setScores] = useState<Record<string, number>>({
    "Technical Feasibility": 85,
    Innovation: 90,
    Impact: 88,
    "Cost-Effectiveness": 75,
    Scalability: 78,
    Security: 82,
  });

  const [comments, setComments] = useState<string>(
    "Strong technical architecture and sensor battery longevity. Vendor demonstrated successful field pilot in Solapur."
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isStartingPilot, setIsStartingPilot] = useState<boolean>(false);
  const [evalStatus, setEvalStatus] = useState<EvalStatus | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!currentUser) {
      router.push("/login");
      return;
    }

    async function loadData() {
      setLoading(true);
      const [chalData, startData] = await Promise.all([
        getChallenge(challengeId),
        getStartup(startupId),
      ]);
      setChallenge(chalData);
      setStartup(startData);
      setLoading(false);
    }
    loadData();
  }, [currentUser, hasHydrated, challengeId, startupId, router]);

  // Compute live total score reactively
  const totalScore = parseFloat(
    CRITERIA.reduce((sum, c) => {
      const s = scores[c.label] || 0;
      return sum + (s * c.weight) / 100;
    }, 0).toFixed(2)
  );

  const isPassingScore = totalScore >= 60;

  const handleScoreChange = (label: string, value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    setScores((prev) => ({ ...prev, [label]: clamped }));
  };

  const handleSave = async (status: EvalStatus) => {
    setIsSubmitting(true);
    setToastMessage(null);

    const scoresPayload: Record<string, { weight: number; score: number }> = {};
    CRITERIA.forEach((c) => {
      scoresPayload[c.label] = {
        weight: c.weight,
        score: scores[c.label] || 0,
      };
    });

    try {
      await submitEvaluation({
        challengeId,
        startupId,
        evaluatorId: currentUser?.id || "usr-3",
        scores: scoresPayload,
        totalScore,
        comment: comments,
        status,
      });

      setEvalStatus(status);
      setIsSubmitting(false);

      if (status === "DRAFT") {
        setToastMessage("Evaluation draft saved successfully.");
      } else {
        setToastMessage(
          isPassingScore
            ? "Evaluation submitted! Total Score ≥ 60 unlocks Start Pilot."
            : "Evaluation submitted. Score below pass threshold (60)."
        );
      }

      setTimeout(() => setToastMessage(null), 4000);
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleStartPilot = async () => {
    setIsStartingPilot(true);
    try {
      const pilot = await startPilot(challengeId, startupId);
      router.push(`/pilots/${pilot.id}`);
    } catch {
      setIsStartingPilot(false);
    }
  };

  if (!hasHydrated || !currentUser) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2F5FEA] animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Verifying session...</p>
      </div>
    );
  }

  if (loading || !startup || !challenge) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2F5FEA] animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Loading evaluation rubric...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">
      {/* HEADER SECTION */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="space-y-4 border-b border-slate-200/80 pb-6"
      >
        <Link
          href={`/challenges/${challengeId}/recommendations`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2F5FEA] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Recommendations</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#2F5FEA] flex items-center gap-1">
                <ClipboardCheck className="w-3.5 h-3.5" />
                Expert Evaluation Panel
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {challenge.title}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Evaluating: {startup.name}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Score proposal criteria against official procurement weights
            </p>
          </div>

          {evalStatus === "SUBMITTED" && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#16A34A] border border-emerald-200 flex items-center gap-1.5 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
              <span>Evaluation Submitted</span>
            </span>
          )}
        </div>
      </motion.div>

      {/* TOAST MESSAGE BANNER */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between shadow-md ${
              evalStatus === "SUBMITTED" && isPassingScore
                ? "bg-emerald-600 text-white"
                : "bg-amber-600 text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-white/80 hover:text-white"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TWO-COLUMN SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN (~45% width) — PROPOSAL SUMMARY & DOCUMENTS */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="lg:col-span-5 space-y-6"
        >
          {/* Startup Overview Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  {startup.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vendor Partner Profile
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2F5FEA] flex items-center justify-center font-bold text-xs shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            {/* Sector Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {startup.sectorTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Metadata Row */}
            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1 border-t border-slate-100">
              {startup.foundedYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Founded {startup.foundedYear}
                </span>
              )}
              {startup.teamSize && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {startup.teamSize} team members
                </span>
              )}
              {startup.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {startup.location}
                </span>
              )}
            </div>
          </div>

          {/* Proposal Summary Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <FileText className="w-4 h-4 text-[#2F5FEA]" />
              <span>Submitted Proposal Summary</span>
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              {startup.capabilitySummary}
            </p>
          </div>

          {/* Documents Section (Mock 3 PDFs) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <FileText className="w-4 h-4 text-[#2F5FEA]" />
              <span>Attached Documents</span>
            </h4>

            <div className="space-y-2">
              {[
                { name: "Proposal Document.pdf", size: "2.4 MB" },
                { name: "Company Profile.pdf", size: "1.8 MB" },
                { name: "Certificate of Incorporation.pdf", size: "1.2 MB" },
              ].map((doc) => (
                <div
                  key={doc.name}
                  className="p-3 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {doc.name}
                      </p>
                      <p className="text-[10px] text-slate-400">{doc.size}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      alert(`Viewing mock document: ${doc.name}`)
                    }
                    className="px-2.5 py-1 text-xs font-bold text-[#2F5FEA] hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* MODEL 2: HYBRID OBJECTIVE READINESS & STATUTORY AUDIT CARD */}
          <div className="bg-gradient-to-br from-slate-900 via-[#16224B] to-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <h4 className="font-extrabold text-sm tracking-tight text-white">
                  AI Model 2: Statutory Audit
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Hybrid Telemetry
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 font-bold block">Expert Rubric (55%)</span>
                <span className="text-base font-extrabold text-blue-400 font-mono">
                  {(totalScore / 10).toFixed(1)}/10
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 font-bold block">Objective Telemetry (45%)</span>
                <span className="text-base font-extrabold text-purple-400 font-mono">
                  7.4/10
                </span>
              </div>
            </div>

            {/* Composite Score Display */}
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-purple-200 font-bold uppercase block">Composite Score</span>
                <p className="text-sm font-extrabold text-white">
                  {((totalScore / 10) * 0.55 + 7.4 * 0.45).toFixed(2)} / 10
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {totalScore >= 70 ? "APPROVE FOR PILOT" : "CONDITIONAL SCOPE"}
              </span>
            </div>

            {/* Telemetry Breakdown Points */}
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span>• TRL Level 7 (Hardware Tested)</span>
                <span className="font-mono text-purple-300 font-bold">3.1 pts / 4.0</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span>• Verified Municipal Pilots (2)</span>
                <span className="font-mono text-purple-300 font-bold">1.8 pts / 3.0</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span>• DPIIT Recognition (GFR Rule 170)</span>
                <span className="font-mono text-emerald-400 font-bold">1.5 pts / 1.5</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>• Balance Sheet Reserve (₹45L Turnover)</span>
                <span className="font-mono text-purple-300 font-bold">1.0 pts / 1.5</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-[11px] text-emerald-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Audit Passed: Aligned evaluation with field telemetry.</span>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN (~55% width) — LIVE SCORING RUBRIC */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="lg:col-span-7 space-y-6"
        >
          <div className="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#2F5FEA]" />
                  <span>Evaluation Panel Scoring Rubric</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Adjust scores (0-100) per criterion. Weighted scores calculate live.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
                100% Weight Total
              </span>
            </div>

            {/* Rubric Rows List */}
            <motion.div variants={staggerContainer} className="space-y-5">
              {CRITERIA.map((criterion) => {
                const score = scores[criterion.label] || 0;
                const weightedScore = (
                  (score * criterion.weight) /
                  100
                ).toFixed(2);

                return (
                  <motion.div
                    key={criterion.id}
                    variants={fadeInUp}
                    className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">
                          {criterion.label}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-200 text-slate-700">
                          Weight: {criterion.weight}%
                        </span>
                      </div>

                      {/* Live Weighted Score Display */}
                      <div className="text-right">
                        <span className="text-xs font-mono text-slate-400">
                          Weighted:{" "}
                        </span>
                        <motion.span
                          key={weightedScore}
                          initial={{ scale: 1.12, color: "#2563EB" }}
                          animate={{ scale: 1, color: "#2F5FEA" }}
                          transition={{ duration: 0.15 }}
                          className="text-sm font-extrabold text-[#2F5FEA] font-mono inline-block"
                        >
                          {weightedScore}
                        </motion.span>
                      </div>
                    </div>

                    {/* Slider + Numeric Input Row */}
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={score}
                        onChange={(e) =>
                          handleScoreChange(
                            criterion.label,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="flex-1 accent-[#2F5FEA] h-2 bg-slate-200 rounded-lg cursor-pointer"
                      />

                      <div className="w-16 shrink-0">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={score}
                          onChange={(e) =>
                            handleScoreChange(
                              criterion.label,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full text-center py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* LIVE TOTAL SCORE FOOTER DISPLAY */}
            <div className="p-5 rounded-2xl bg-[#16224B] text-white flex items-center justify-between shadow-lg">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Total Evaluation Score
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sum of all weighted scores (Pass threshold: 60)
                </p>

                {!isPassingScore && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Below typical pass threshold (60)</span>
                  </div>
                )}
              </div>

              {/* Reactive Pulse Score Animation */}
              <motion.div
                key={totalScore}
                initial={{ scale: 1.15, color: "#60A5FA" }}
                animate={{ scale: 1, color: "#FFFFFF" }}
                transition={{ duration: 0.25 }}
                className="text-right"
              >
                <div className="text-4xl font-extrabold font-mono tracking-tight">
                  {totalScore}
                  <span className="text-xl text-slate-400"> / 100</span>
                </div>
              </motion.div>
            </div>

            {/* Evaluator Comment Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Evaluation Comments & Summary
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add your evaluation comments, technical observations, or risk factors..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]"
              />
            </div>

            {/* FOOTER ACTIONS & ANIMATED SWAP FOR START PILOT */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => handleSave("DRAFT")}
                disabled={isSubmitting || isStartingPilot}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>

              <div className="flex items-center gap-3">
                {/* ANIMATED GATE LOGIC SWAP FOR START PILOT BUTTON */}
                <AnimatePresence mode="wait">
                  {evalStatus === "SUBMITTED" && isPassingScore ? (
                    <motion.button
                      key="start-pilot-btn"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStartPilot}
                      disabled={isStartingPilot}
                      className="px-6 py-3 bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 disabled:opacity-75"
                    >
                      {isStartingPilot ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Initiating Pilot Contract...</span>
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4" />
                          <span>Start Pilot →</span>
                        </>
                      )}
                    </motion.button>
                  ) : (
                    <motion.button
                      key="submit-eval-btn"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSave("SUBMITTED")}
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-[#2F5FEA] hover:bg-[#234BCB] text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-75"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Submitting Scores...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Evaluation</span>
                          <CheckCircle2 className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
