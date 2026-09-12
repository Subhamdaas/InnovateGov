"use client";

import { useEffect, useState, use, useRef } from "react";
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
  FileCheck,
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import { getChallenge, submitApplication, uploadFile } from "@/lib/api";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Real Upload State
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setUploadError("");

    try {
      const res = await uploadFile(file);
      setUploadedFileName(res.name);
      setUploadedFileUrl(res.url);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload file");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const startupId = currentUser.startupId || "start-1";
    setSubmitting(true);

    try {
      await submitApplication(startupId, challengeId, {
        capabilitySummary,
        teamSize,
        location,
        sector,
        documentUrl: uploadedFileUrl || undefined,
        documentName: uploadedFileName || undefined,
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
        <div className="w-8 h-8 rounded-full border-2 border-[#8C634B] border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Preparing proposal workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link
          href="/startup/challenges"
          className="p-2.5 rounded-xl bg-white dark:bg-[#201D1A] border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-[11px] font-bold text-[#8C634B] uppercase tracking-wider">
            Proposal Submission
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Apply to Challenge
          </h1>
        </div>
      </div>

      {/* Target Challenge Summary Banner */}
      {challenge && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-[#362A22] text-white space-y-3 shadow-xl"
        >
          <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold">
            <Building2 className="w-4 h-4" />
            <span>Target Public Department Challenge</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {challenge.title}
          </h2>
          <p className="text-xs text-amber-100/90 leading-relaxed">
            {challenge.problemStatement}
          </p>
        </motion.div>
      )}

      {/* Main Proposal Form */}
      <motion.form
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        onSubmit={handleSubmit}
        className="p-8 rounded-3xl bg-white dark:bg-[#201D1A] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6"
      >
        {/* Capability / Technical Solution Summary */}
        <motion.div variants={fadeInUp} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#8C634B]" />
              <span>Technical Capability & Solution Proposal</span>
              <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              Evaluated by Government AI Scoring
            </span>
          </div>
          <textarea
            rows={4}
            required
            value={capabilitySummary}
            onChange={(e) => setCapabilitySummary(e.target.value)}
            placeholder="Describe your technology stack, deployment capability, hardware specs, and milestone feasibility..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-[#141210] border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#8C634B]/30"
          />
        </motion.div>

        {/* Operational Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div variants={fadeInUp} className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Team Size (FTE)</label>
            <input
              type="number"
              min={1}
              required
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#141210] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#8C634B]/30"
            />
          </motion.div>

          <motion.div variants={fadeInUp} className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Pune, Maharashtra"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#141210] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#8C634B]/30"
            />
          </motion.div>

          <motion.div variants={fadeInUp} className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Primary Sector</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#141210] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#8C634B]/30 cursor-pointer"
            >
              <option value="Water Tech">Water Tech</option>
              <option value="IoT">IoT & Smart Sensors</option>
              <option value="CleanTech">CleanTech</option>
              <option value="Smart City">Smart City</option>
              <option value="Waste Management">Waste Management</option>
              <option value="Agri-Tech">Agri-Tech</option>
              <option value="HealthTech">HealthTech</option>
            </select>
          </motion.div>
        </div>

        {/* Real Document & Pitch Deck Upload Section */}
        <motion.div variants={fadeInUp} className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block">
            Proposal Deck, DPIIT Certificate & Technical PDF
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.doc,.png,.jpg"
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#141210]/60 hover:bg-slate-50 dark:hover:bg-[#141210] text-center space-y-2 cursor-pointer transition-all"
          >
            {uploadingFile ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <Loader2 className="w-8 h-8 text-[#8C634B] animate-spin" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Uploading real file to server storage...
                </p>
              </div>
            ) : uploadedFileName ? (
              <div className="flex flex-col items-center gap-2 py-2 text-emerald-600 dark:text-emerald-400">
                <FileCheck className="w-8 h-8" />
                <p className="text-xs font-bold">{uploadedFileName}</p>
                <p className="text-[11px] text-slate-400">
                  Uploaded & attached successfully • Click to replace
                </p>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-[#8C634B] dark:text-amber-300 flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Click to select or drag & drop file from your computer
                </p>
                <p className="text-[11px] text-slate-400">
                  Upload Pitch Deck, DPIIT Certificate or Architecture Document (PDF/Docx, up to 25MB)
                </p>
              </>
            )}
          </div>
          {uploadError && (
            <p className="text-xs text-red-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{uploadError}</span>
            </p>
          )}
        </motion.div>

        {/* Form Submission Controls & Success Animation */}
        <motion.div variants={fadeInUp} className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Direct to Government Review Panel</span>
          </div>

          <button
            type="submit"
            disabled={submitting || isSuccess || uploadingFile}
            className="py-3 px-7 rounded-2xl bg-[#8C634B] hover:bg-[#724E38] text-white font-extrabold text-sm shadow-lg shadow-amber-900/20 transition-all flex items-center gap-2 disabled:opacity-75 cursor-pointer"
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
                className="flex items-center gap-2 text-white"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-300 animate-bounce" />
                <span>Proposal Submitted to Database!</span>
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
