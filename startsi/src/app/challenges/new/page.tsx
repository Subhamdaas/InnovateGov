"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  X,
  Building2,
  FileText,
  Target,
  CheckCircle2,
  Loader2,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import { createChallenge, getDepartments } from "@/lib/api";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { ChallengeStatus, Department } from "@/types";

interface FormErrors {
  title?: string;
  departmentId?: string;
  problemStatement?: string;
  expectedOutcome?: string;
}

export default function CreateChallengePage() {
  const router = useRouter();
  const { currentUser, hasHydrated } = useSessionStore();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [title, setTitle] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [problemStatement, setProblemStatement] = useState<string>("");
  const [expectedOutcome, setExpectedOutcome] = useState<string>("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  // Load real departments from backend database
  useEffect(() => {
    getDepartments().then((depts) => {
      if (depts && depts.length > 0) {
        setDepartments(depts);
        setDepartmentId(depts[0].id);
      }
    });
  }, []);

  // Session guard
  useEffect(() => {
    if (!hasHydrated) return;
    if (!currentUser) {
      router.push("/login");
    }
  }, [currentUser, hasHydrated, router]);

  if (!hasHydrated || !currentUser) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2F5FEA] animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Verifying session...</p>
      </div>
    );
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!title.trim()) {
      newErrors.title = "Challenge title is required.";
    }
    if (!departmentId) {
      newErrors.departmentId = "Please select a department.";
    }
    if (!problemStatement.trim()) {
      newErrors.problemStatement = "Problem statement is required.";
    }
    if (!expectedOutcome.trim()) {
      newErrors.expectedOutcome = "Expected outcome is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call mock createChallenge API function
      const created = await createChallenge({
        departmentId,
        title: title.trim(),
        problemStatement: problemStatement.trim(),
        expectedOutcome: expectedOutcome.trim(),
        status: "ACTIVE" as ChallengeStatus,
        createdById: currentUser.id,
      });

      // Show micro-animation success state before redirect
      setShowSuccessToast(true);
      setTimeout(() => {
        router.push(`/challenges/${created.id}/recommendations`);
      }, 1000);
    } catch {
      setIsSubmitting(false);
    }
  };

  const problemCharCount = problemStatement.length;
  const isOverCharGuide = problemCharCount > 500;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Success Banner Micro-Animation */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Challenge Published Successfully!</h4>
                <p className="text-xs text-emerald-100">
                  Added to dashboard challenges list. Redirecting...
                </p>
              </div>
            </div>
            <Loader2 className="w-5 h-5 animate-spin text-emerald-200" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-5"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#2F5FEA] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              New Procurement Challenge
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create New Challenge
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Define a real problem, set clear goals and invite innovative solutions.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="px-3.5 py-2 text-xs font-bold rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors flex items-center gap-1.5"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </Link>
      </motion.div>

      {/* Main Single Form Card */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 lg:p-8"
      >
        <motion.form
          variants={staggerContainer}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Field 1: Challenge Title */}
          <motion.div variants={fadeInUp} className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#2F5FEA]" />
              <span>Challenge Title</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="e.g. Water Leakage Detection System"
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30 transition-all ${
                errors.title
                  ? "border-red-400 focus:border-red-500 bg-red-50/20"
                  : "border-slate-200 focus:border-[#2F5FEA]"
              }`}
            />
            {errors.title && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.title}</span>
              </p>
            )}
          </motion.div>

          {/* Field 2: Department Dropdown */}
          <motion.div variants={fadeInUp} className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#2F5FEA]" />
              <span>Department</span>
              <span className="text-red-500">*</span>
            </label>
            <select
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                if (errors.departmentId)
                  setErrors((prev) => ({ ...prev, departmentId: undefined }));
              }}
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30 transition-all ${
                errors.departmentId
                  ? "border-red-400 focus:border-red-500 bg-red-50/20"
                  : "border-slate-200 focus:border-[#2F5FEA]"
              }`}
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.departmentId}</span>
              </p>
            )}
          </motion.div>

          {/* Field 3: Problem Statement Textarea (~5 rows + character count) */}
          <motion.div variants={fadeInUp} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#2F5FEA]" />
                <span>Problem Statement</span>
                <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-[11px] font-mono font-medium ${
                  isOverCharGuide ? "text-amber-600 font-bold" : "text-slate-400"
                }`}
              >
                {problemCharCount} / 500 characters
              </span>
            </div>
            <textarea
              rows={5}
              value={problemStatement}
              onChange={(e) => {
                setProblemStatement(e.target.value);
                if (errors.problemStatement)
                  setErrors((prev) => ({ ...prev, problemStatement: undefined }));
              }}
              placeholder="Describe the current operational challenge, affected assets, or inefficiencies faced by the department..."
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30 transition-all ${
                errors.problemStatement
                  ? "border-red-400 focus:border-red-500 bg-red-50/20"
                  : "border-slate-200 focus:border-[#2F5FEA]"
              }`}
            />
            {errors.problemStatement && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.problemStatement}</span>
              </p>
            )}
            {isOverCharGuide && (
              <p className="text-[11px] text-amber-600 font-medium">
                Note: Soft length recommendation exceeded (500 chars). Submission is allowed.
              </p>
            )}
          </motion.div>

          {/* Field 4: Expected Outcome Textarea (~3 rows) */}
          <motion.div variants={fadeInUp} className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#2F5FEA]" />
              <span>Expected Outcome</span>
              <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={expectedOutcome}
              onChange={(e) => {
                setExpectedOutcome(e.target.value);
                if (errors.expectedOutcome)
                  setErrors((prev) => ({ ...prev, expectedOutcome: undefined }));
              }}
              placeholder="e.g. Reduce water leakage by at least 20% within 6 months using IoT/AI-based monitoring."
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30 transition-all ${
                errors.expectedOutcome
                  ? "border-red-400 focus:border-red-500 bg-red-50/20"
                  : "border-slate-200 focus:border-[#2F5FEA]"
              }`}
            />
            {errors.expectedOutcome && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.expectedOutcome}</span>
              </p>
            )}
          </motion.div>

          {/* Form Footer Buttons */}
          <motion.div
            variants={fadeInUp}
            className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4"
          >
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors"
            >
              Cancel
            </Link>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#2F5FEA] hover:bg-[#234BCB] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Publishing Challenge...</span>
                </>
              ) : (
                <>
                  <span>Next: Evaluation Criteria</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
}
