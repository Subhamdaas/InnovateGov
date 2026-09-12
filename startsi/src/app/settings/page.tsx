"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Bell,
  Building2,
  ShieldCheck,
  Check,
  Mail,
  Lock,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export default function SettingsPage() {
  const router = useRouter();
  const { currentUser, logout } = useSessionStore();

  const [notifications, setNotifications] = useState({
    recommendations: true,
    milestoneReminders: true,
    rubricSubmissions: false,
    weeklyDigest: true,
  });

  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      setSavedFeedback("Preferences updated");
      setTimeout(() => setSavedFeedback(null), 2500);
      return updated;
    });
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getInitials = (name?: string) => {
    if (!name) return "IG";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. HEADER */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-[#2F5FEA]" />
            <span>Settings</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your account preferences, notifications, and active session.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{savedFeedback}</span>
            </motion.div>
          )}

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs transition-colors flex items-center gap-2 min-h-[44px]"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Log Out</span>
          </button>
        </div>
      </motion.div>

      {/* 2. SETTINGS SECTIONS GRID */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* PROFILE CARD */}
        <motion.div
          variants={fadeInUp}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-[#2F5FEA]" />
                <span>User Profile</span>
              </h2>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Read Only (Demo)</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-base text-white shadow-md shadow-blue-500/20">
                {getInitials(currentUser?.name)}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {currentUser?.name || "Amit Sharma"}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentUser?.email || "amit.sharma@gov.in"}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                  Active Role
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#2F5FEA] inline-block">
                  {currentUser?.role || "GOVERNMENT"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                  Department
                </span>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1 truncate">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Public Works Dept</span>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Log Out of InnovateGov</span>
            </button>
          </div>
        </motion.div>

        {/* NOTIFICATION PREFERENCES CARD */}
        <motion.div
          variants={fadeInUp}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5"
        >
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#2F5FEA]" />
              <span>Notification Preferences</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control alert triggers and email update frequencies
            </p>
          </div>

          <div className="space-y-4">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-900">
                  New Recommendation Alerts
                </p>
                <p className="text-[11px] text-slate-500">
                  Notify when AI matches startups to newly published challenges
                </p>
              </div>
              <button
                onClick={() => toggleNotif("recommendations")}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 min-h-[24px] ${
                  notifications.recommendations ? "bg-[#2F5FEA]" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    notifications.recommendations ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Milestone Deadline Reminders
                </p>
                <p className="text-[11px] text-slate-500">
                  Receive alerts 3 days prior to active pilot milestone dates
                </p>
              </div>
              <button
                onClick={() => toggleNotif("milestoneReminders")}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 min-h-[24px] ${
                  notifications.milestoneReminders ? "bg-[#2F5FEA]" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    notifications.milestoneReminders ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Evaluation Rubric Submissions
                </p>
                <p className="text-[11px] text-slate-500">
                  Notify when expert evaluators submit completed scoring rubrics
                </p>
              </div>
              <button
                onClick={() => toggleNotif("rubricSubmissions")}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 min-h-[24px] ${
                  notifications.rubricSubmissions ? "bg-[#2F5FEA]" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    notifications.rubricSubmissions ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 4 */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Weekly Executive Digest
                </p>
                <p className="text-[11px] text-slate-500">
                  Send a weekly email summary of active procurement KPIs
                </p>
              </div>
              <button
                onClick={() => toggleNotif("weeklyDigest")}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 min-h-[24px] ${
                  notifications.weeklyDigest ? "bg-[#2F5FEA]" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    notifications.weeklyDigest ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* 3. DEPARTMENT & SYSTEM INFO CARD */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4"
      >
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#2F5FEA]" />
            <span>Department & System Governance</span>
          </h2>
          <p className="text-xs text-slate-500">
            System jurisdiction & compliance auditing configurations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Jurisdiction
            </span>
            <p className="text-xs font-extrabold text-slate-900">
              Maharashtra State Procurement Division
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Compliance Standard
            </span>
            <p className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 text-emerald-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>GFR 2017 & StartIn Policy Compliant</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Escrow Audit Ledger
            </span>
            <p className="text-xs font-extrabold text-slate-900 text-blue-700">
              Active • Blockchain Telemetry Enabled
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
