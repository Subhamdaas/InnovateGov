"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Users,
  MapPin,
  FileText,
  FileDown,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ClipboardCheck,
} from "lucide-react";
import { getApplicationDetail } from "@/lib/api";
import { Application, ApplicationStatus } from "@/types";
import { fadeInUp, staggerContainer } from "@/lib/motion";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ApplicationDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getApplicationDetail(resolvedParams.id);
        setApplication(data);
      } catch (err) {
        console.error("Failed to load application detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#2F5FEA] border-t-transparent animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading application...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Application Not Found</h2>
        <p className="text-sm text-slate-500">The requested application could not be loaded.</p>
        <Link
          href="/applications"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2F5FEA] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applications</span>
        </Link>
      </div>
    );
  }

  const { startup, challenge, evaluation, pilot, status, shortId } = application;

  const mockDocuments = [
    {
      name: "Proposal Document.pdf",
      size: "2.4 MB",
      type: "PDF Document",
    },
    {
      name: "Company Profile & Pitch Deck.pdf",
      size: "4.1 MB",
      type: "PDF Presentation",
    },
    {
      name: "Certificate of Incorporation.pdf",
      size: "1.2 MB",
      type: "Legal Document",
    },
  ];

  const getStatusBadge = (s: ApplicationStatus) => {
    switch (s) {
      case "SELECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#16A34A] border border-emerald-200">
            <Award className="w-3.5 h-3.5" />
            <span>Selected</span>
          </span>
        );
      case "EVALUATED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#2F5FEA] border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Evaluated</span>
          </span>
        );
      case "UNDER_REVIEW":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Under Review</span>
          </span>
        );
    }
  };

  const evalTargetRoute = `/challenges/${application.challengeId}/evaluate/${application.startupId}`;

  return (
    <div className="space-y-6 pb-16">
      {/* BREADCRUMB & HEADER */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="space-y-3"
      >
        <Link
          href="/applications"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#2F5FEA] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applications</span>
        </Link>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Application #{shortId}
              </h1>
              {getStatusBadge(status)}
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <span>Applied to challenge:</span>
              <Link
                href={`/challenges/${application.challengeId}/recommendations`}
                className="font-bold text-[#2F5FEA] hover:underline"
              >
                {challenge?.title}
              </Link>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(evalTargetRoute)}
              className="px-5 py-2.5 rounded-xl bg-[#2F5FEA] hover:bg-[#234BCB] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 min-h-[44px]"
            >
              {evaluation ? (
                <>
                  <ClipboardCheck className="w-4 h-4" />
                  <span>View Evaluation</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Evaluation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (~60% / 7 cols) */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="lg:col-span-7 space-y-6"
        >
          {/* 1. STARTUP INFORMATION CARD */}
          <motion.div
            variants={fadeInUp}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#2F5FEA]" />
                <span>Startup Information</span>
              </h2>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-extrabold text-slate-900">
                {startup?.name}
              </h3>

              {/* Sector Tags */}
              <div className="flex flex-wrap gap-1.5">
                {startup?.sectorTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#2F5FEA] border border-blue-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Key Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-0.5">
                    Founded
                  </span>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{startup?.foundedYear || "2021"}</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-0.5">
                    Team Size
                  </span>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{startup?.teamSize || "15"} Members</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-0.5">
                    Location
                  </span>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{startup?.location || "India"}</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2. PROPOSAL SUMMARY CARD */}
          <motion.div
            variants={fadeInUp}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3"
          >
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-5 h-5 text-[#2F5FEA]" />
              <span>Proposal Summary</span>
            </h2>

            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              {startup?.capabilitySummary}
            </p>
          </motion.div>

          {/* 3. SUBMITTED DOCUMENTS CARD */}
          <motion.div
            variants={fadeInUp}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4"
          >
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileDown className="w-5 h-5 text-[#2F5FEA]" />
              <span>Submitted Documents</span>
            </h2>

            <div className="space-y-2.5">
              {mockDocuments.map((doc) => (
                <div
                  key={doc.name}
                  className="p-3.5 rounded-xl border border-slate-200/70 hover:border-blue-200 bg-slate-50/50 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#2F5FEA] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {doc.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {doc.size} • {doc.type}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => alert(`Opening demo document: ${doc.name}`)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold transition-all shrink-0 min-h-[36px] flex items-center gap-1.5"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT COLUMN (~40% / 5 cols) */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="lg:col-span-5 space-y-6"
        >
          {/* EVALUATION PROGRESS CHECKLIST CARD */}
          <motion.div
            variants={fadeInUp}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5 sticky top-6"
          >
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2F5FEA]" />
                <span>Evaluation Progress</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Current audit trail & review status
              </p>
            </div>

            {/* Step 1: Eligibility Check */}
            <div className="flex gap-3.5">
              <div className="w-8 h-8 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900">
                    1. Eligibility Check
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Passed
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Verified company registration, tax compliance, and entity status.
                </p>
              </div>
            </div>

            <div className="ml-4 border-l-2 border-slate-200 h-4 my-1" />

            {/* Step 2: Technical Evaluation */}
            <div className="flex gap-3.5">
              {evaluation && evaluation.status === "SUBMITTED" ? (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2F5FEA] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : evaluation && evaluation.status === "DRAFT" ? (
                <div className="w-8 h-8 rounded-full bg-amber-100 text-[#D97706] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Clock className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Clock className="w-5 h-5" />
                </div>
              )}

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900">
                    2. Technical Evaluation
                  </h3>
                  {evaluation && evaluation.status === "SUBMITTED" ? (
                    <span className="text-[10px] font-bold text-[#2F5FEA] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Score: {evaluation.totalScore.toFixed(1)}/100
                    </span>
                  ) : evaluation && evaluation.status === "DRAFT" ? (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Draft In Progress
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {evaluation && evaluation.status === "SUBMITTED"
                    ? "Panel evaluation completed with weighted score breakdown."
                    : evaluation && evaluation.status === "DRAFT"
                    ? "Scoring rubric draft saved by evaluator."
                    : "Awaiting expert scoring submission."}
                </p>
              </div>
            </div>

            <div className="ml-4 border-l-2 border-slate-200 h-4 my-1" />

            {/* Step 3: Final Selection & Pilot */}
            <div className="flex gap-3.5">
              {pilot ? (
                <div className="w-8 h-8 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Award className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Clock className="w-5 h-5" />
                </div>
              )}

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900">
                    3. Final Review & Pilot Award
                  </h3>
                  {pilot ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Awarded
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {pilot
                    ? "Selected for pilot execution & contract signed."
                    : "Final award selection decision pending completed evaluations."}
                </p>
              </div>
            </div>

            {/* ACTION CTA BOX */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <button
                onClick={() => router.push(evalTargetRoute)}
                className="w-full py-3 px-4 rounded-xl bg-[#2F5FEA] hover:bg-[#234BCB] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                {evaluation ? (
                  <>
                    <ClipboardCheck className="w-4 h-4" />
                    <span>View Evaluation Details</span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Start Evaluation Now</span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </>
                )}
              </button>

              {pilot && (
                <button
                  onClick={() => router.push(`/pilots/${pilot.id}`)}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Award className="w-4 h-4" />
                  <span>View Active Pilot Project</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
