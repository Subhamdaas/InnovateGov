"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Settings,
  Building2,
  User,
  Mail,
  MapPin,
  Tag,
  Bell,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export default function StartupSettingsPage() {
  const router = useRouter();
  const { currentUser, hasHydrated } = useSessionStore();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!currentUser) {
      router.push("/login");
      return;
    }
  }, [currentUser, hasHydrated, router]);

  // Notification Preferences Local State
  const [notifAppUpdates, setNotifAppUpdates] = useState(true);
  const [notifNewChallenges, setNotifNewChallenges] = useState(true);
  const [notifMilestones, setNotifMilestones] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="space-y-1 border-b border-slate-200/80 pb-5"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#2F5FEA] text-xs font-bold border border-blue-100">
          <Settings className="w-3.5 h-3.5" />
          <span>Account & Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Founder Settings
        </h1>
        <p className="text-sm text-slate-500">
          Manage your startup profile info and platform notification preferences.
        </p>
      </motion.div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="space-y-6"
      >
        {/* Startup Profile Info Card (Read-only Display) */}
        <motion.div
          variants={fadeInUp}
          className="p-6 lg:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2F5FEA] to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Startup Entity Profile
                </h2>
                <p className="text-xs text-slate-500">
                  Registered startup profile information (read-only demo).
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Entity</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Startup Company Name</span>
              </span>
              <p className="text-sm font-extrabold text-slate-900">
                GreenTech Solutions Pvt. Ltd.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Founder / CEO Name</span>
              </span>
              <p className="text-sm font-extrabold text-slate-900">
                {currentUser?.name || "Riya Sharma"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Account Email</span>
              </span>
              <p className="text-sm font-bold text-slate-900">
                {currentUser?.email || "founder@techstartup.in"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Headquarters Location</span>
              </span>
              <p className="text-sm font-bold text-slate-900">
                Pune, Maharashtra, India
              </p>
            </div>

            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Registered Sectors & Capabilities</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {["Water Tech", "IoT & Smart Sensors", "Smart City", "CleanTech"].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notification Preferences Form Card */}
        <motion.div
          variants={fadeInUp}
          className="p-6 lg:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Notification Preferences
              </h2>
              <p className="text-xs text-slate-500">
                Control alert frequency for proposal updates and challenge matches.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <label className="p-4 rounded-2xl border border-slate-200/80 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-all">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">
                  Application & Evaluation Updates
                </p>
                <p className="text-[11px] text-slate-500">
                  Receive email alerts when government committees score or update your submission status.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifAppUpdates}
                onChange={(e) => setNotifAppUpdates(e.target.checked)}
                className="w-4 h-4 text-[#2F5FEA] rounded border-slate-300 focus:ring-[#2F5FEA]"
              />
            </label>

            <label className="p-4 rounded-2xl border border-slate-200/80 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-all">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">
                  New Matching Government Challenges
                </p>
                <p className="text-[11px] text-slate-500">
                  Notify me when a department posts a new problem statement matching my sector tags.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifNewChallenges}
                onChange={(e) => setNotifNewChallenges(e.target.checked)}
                className="w-4 h-4 text-[#2F5FEA] rounded border-slate-300 focus:ring-[#2F5FEA]"
              />
            </label>

            <label className="p-4 rounded-2xl border border-slate-200/80 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-all">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">
                  Pilot Milestone & Payout Reminders
                </p>
                <p className="text-[11px] text-slate-500">
                  Receive notifications for upcoming deliverable deadlines and milestone payouts.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifMilestones}
                onChange={(e) => setNotifMilestones(e.target.checked)}
                className="w-4 h-4 text-[#2F5FEA] rounded border-slate-300 focus:ring-[#2F5FEA]"
              />
            </label>

            <div className="pt-3 flex items-center justify-between">
              {savedSuccess ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Preferences Saved!</span>
                </span>
              ) : (
                <span />
              )}

              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-[#2F5FEA] hover:bg-[#234BCB] text-white font-extrabold text-xs shadow-md transition-all"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
