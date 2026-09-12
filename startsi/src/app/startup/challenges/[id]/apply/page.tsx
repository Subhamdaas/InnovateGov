"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Send,
  Upload,
  CheckCircle2,
  Sparkles,
  FileText,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import { getChallenge, submitApplication } from "@/lib/api";
import { Challenge } from "@/types";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export default function StartupApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const challengeId = resolvedParams.id;

  const router = useRouter();
  const { currentUser, hasHydrated } = useSessionStore();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Form State
  const [capabilitySummary, setCapabilitySummary] = useState<string>(
    "Acoustic sensor & AI/ML powered real-time telemetry network with edge analytics for rapid public deployment."
  );
  const [teamSize, setTeamSize] = useState<number>(18);
  const [location, setLocation] = useState<string>("Pune, Maharashtra");
  const [sector, setSector] = useState<string>("Water Tech");
  const [uploadedFile, setUploadedFile] = useState<string>(
    "GreenTech_Technical_Architecture_Proposal_2026.pdf"
  );

  useEffect(() => {
    if (!hasHydrated) return;
    if (!currentUser) {
      router.push("/login");
      return;
    }

    async function loadData() {
      setLoading(true);
      const chal = await getChallenge(challengeId);
      setChallenge(chal);
      setLoading(false);
    }

    loadData();
  }, [challengeId, currentUser, hasHydrated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const startupId = currentUser.startupId || "start-1";
    setSubmitting(true);

    try {
      const newApp = await submitApplication(startupId, challengeId, {
        capabilitySummary,
        teamSize,
        location,
        sector,
      });

      setSubmitting(false);
      setIsSuccess(true);

      // Brief success animation before redirect
      setTimeout(() => {
        router.push("/startup/applications");
      }, 1200);
    } catch {
      setSubmitting(false);
    }
  };

  if (!hasHydrated || !currentUser || loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#2F5FEA] border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Preparing proposal workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Back Link & Header */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="space-y-4"
      >
        <Link
          href="/startup/challenges"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#2F5FEA] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Challenges</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#2F5FEA] border border-blue-100">
              Proposal Submission
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Submit Your Proposal
            </h1>
            <p className="text-xs text-slate-500">
              Complete your startup submission for government committee review.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Read-Only Challenge Summary Card */}
      {challenge && (
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-3 relative overflow-hidden"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Building2 className="w-4 h-4" />
            <span>Target Challenge Statement</span>
          </div>

          <h2 className="text-lg font-extrabold tracking-tight">
            {challenge.title}
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed">
            {challenge.problemStatement}
          </p>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Department: Public Works Department</span>
            <span className="text-emerald-400 font-bold">Status: Active Problem</span>
          </div>
        </motion.div>
      )}

      {/* Interactive Application Form */}
      <motion.form
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        onSubmit={handleSubmit}
        className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-6"
      >
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight border-b border-slate-100 pb-3">
          Startup Technical & Operational Details
        </h3>

        {/* Capability / Proposal Summary */}
        <motion.div variants={fadeInUp} className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Capability & Solution Summary <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={capabilitySummary}
            onChange={(e) => setCapabilitySummary(e.target.value)}
            placeholder="Describe your technical architecture, sensor hardware, AI models, or deployment strategy..."
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30 focus:border-[#2F5FEA] transition-all"
          />
        </motion.div>

        {/* Grid Inputs: Team Size, Location, Sector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div variants={fadeInUp} className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Team Size</label>
            <input
              type="number"
              required
              min={1}
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30"
            />
          </motion.div>

          <motion.div variants={fadeInUp} className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Pune, Maharashtra"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30"
            />
          </motion.div>

          <motion.div variants={fadeInUp} className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Primary Sector</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30 cursor-pointer"
            >
              <option value="Water Tech">Water Tech</option>
              <option value="IoT">IoT & Smart Sensors</option>
              <option value="CleanTech">CleanTech</option>
              <option value="Smart City">Smart City</option>
              <option value="Waste Management">Waste Management</option>
            </select>
          </motion.div>
        </div>

        {/* Visual Document Upload Placeholder */}
        <motion.div variants={fadeInUp} className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Proposal Deck & Technical PDF (Optional)
          </label>
          <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 hover:bg-slate-50 text-center space-y-2 cursor-pointer transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2F5FEA] flex items-center justify-center mx-auto">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700">
              {uploadedFile}
            </p>
            <p className="text-[11px] text-slate-400">
              Drag & drop pitch deck or click to simulate file attachment (PDF, up to 25MB)
            </p>
          </div>
        </motion.div>

        {/* Form Submission Controls & Success Animation */}
        <motion.div variants={fadeInUp} className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Direct to Government Review Panel</span>
          </div>

          <button
            type="submit"
            disabled={submitting || isSuccess}
            className="py-3 px-7 rounded-2xl bg-[#2F5FEA] hover:bg-[#234BCB] text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 disabled:opacity-75"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Submitting Proposal...</span>
              </>
            ) : isSuccess ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 text-emerald-200"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-300 animate-bounce" />
                <span>Proposal Submitted!</span>
              </motion.div>
            ) : (
              <>
                <span>Submit Application</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </motion.div>
      </motion.form>
    </div>
  );
}
