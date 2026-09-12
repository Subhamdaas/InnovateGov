"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Clock, LayoutDashboard } from "lucide-react";
import { fadeInUp } from "@/lib/motion";

interface ComingSoonProps {
  sectionName: string;
  icon: React.ElementType;
  description?: string;
}

export function ComingSoon({
  sectionName,
  icon: Icon,
  description,
}: ComingSoonProps) {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="bg-white p-8 lg:p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-6"
      >
        {/* Icon Circle */}
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2F5FEA] flex items-center justify-center mx-auto shadow-inner border border-blue-100">
          <Icon className="w-8 h-8" />
        </div>

        {/* Section Header & Subtext */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-[#D97706] border border-amber-200/80">
            <Clock className="w-3.5 h-3.5" />
            <span>Under Active Development</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            {sectionName}
          </h1>

          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {description ||
              "This part of InnovateGov is coming soon — currently focused on the core Challenge → Pilot workflow."}
          </p>
        </div>

        {/* Workflow Info Box */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 space-y-1 text-left max-w-md mx-auto">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Sparkles className="w-4 h-4 text-[#2F5FEA]" />
            <span>Active v1 Feature Tour</span>
          </div>
          <p className="text-slate-500">
            You can test the complete live procurement pipeline right now by creating a new challenge, viewing AI recommendations, comparing startups, and submitting expert evaluations.
          </p>
        </div>

        {/* Back to Dashboard Button */}
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2F5FEA] hover:bg-[#234BCB] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
