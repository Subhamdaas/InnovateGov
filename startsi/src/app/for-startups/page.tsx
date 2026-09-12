"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Search,
  Send,
  Rocket,
  CheckCircle2,
  Building2,
  TrendingUp,
  Target,
  Award,
  Clock,
  ShieldCheck,
  Zap,
  Code2,
  ChevronRight,
  ExternalLink,
  Landmark,
  MapPin,
  Info,
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import { useThemeStore } from "@/store/theme";
import { CoffeeCup3D } from "@/components/landing/CoffeeCup3D";
import { AnimatedHeroVisual } from "@/components/landing/AnimatedHeroVisual";
import { fadeInUp, staggerContainer, useCountUp } from "@/lib/motion";
import { MOCK_GOVT_SCHEMES } from "@/lib/mock-data";

// Note: Manually update this date when scheme data is refreshed.
const LAST_CHECKED_DATE = "September 11, 2026";


export default function ForStartupsPage() {
  const router = useRouter();
  const { currentUser } = useSessionStore();
  const { theme, toggleTheme } = useThemeStore();
  const isDarkMode = theme === "dark";

  const [schemeTab, setSchemeTab] = useState<"NATIONAL" | "STATE">("NATIONAL");

  // Animated Stat Counts
  const activeChallengesCount = useCountUp(14, 800);
  const pilotedStartupsCount = useCountUp(8, 800);
  const fundingAwardedCount = useCountUp(2.4, 800); // 2.4 Cr
  const avgDaysCount = useCountUp(14, 800);

  const handleCtaClick = () => {
    if (currentUser?.role === "STARTUP") {
      router.push("/startup/dashboard");
    } else {
      router.push("/login?role=STARTUP");
    }
  };

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 font-sans ${
        isDarkMode
          ? "bg-[#0B1120] text-slate-100"
          : "bg-gradient-to-b from-white via-blue-50/40 to-slate-50 text-slate-900"
      }`}
    >
      {/* TOP NAVIGATION BAR (Gen-Z Government Aesthetic) */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
          isDarkMode
            ? "bg-[#16224B]/90 border-slate-800 text-white"
            : "bg-[#16224B] border-slate-800 text-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <Link href="/for-startups" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2F5FEA] to-indigo-400 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-lg tracking-tight text-white">
                    InnovateGov
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Startup Portal
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  Public Sector Innovation Bridge
                </p>
              </div>
            </Link>
          </div>

          {/* Nav Segmented Switcher (For Government vs For Startups) */}
          <div className="hidden md:flex items-center gap-1.5 p-1 bg-slate-900/60 rounded-xl border border-slate-700/60">
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>For Government</span>
            </Link>
            <div className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#2F5FEA] text-white shadow-md flex items-center gap-1.5">
              <Rocket className="w-3.5 h-3.5 text-amber-300" />
              <span>For Startups</span>
            </div>
          </div>

          {/* Actions: Theme Toggle & Sign In CTA */}
          <div className="flex items-center gap-3">
            {/* Dark / Light Mode Toggle Switch */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme Mode"
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-semibold ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700"
                  : "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700"
              }`}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-300" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              )}
            </button>

            {/* Portal CTA */}
            <button
              onClick={handleCtaClick}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#2F5FEA] to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center gap-1.5"
            >
              <span>Founder Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE SEGMENT SWITCHER BANNER */}
      <div className="md:hidden bg-[#16224B] p-2 border-b border-slate-800 flex items-center justify-center gap-2">
        <Link
          href="/login"
          className="px-3 py-1 text-xs text-slate-300 font-semibold"
        >
          For Government
        </Link>
        <span className="text-slate-600">|</span>
        <span className="px-3 py-1 text-xs text-amber-300 font-bold bg-white/10 rounded-full">
          For Startups
        </span>
      </div>

      {/* HERO SECTION (Image 1 Desk & Sunset Skyline Perspective with 3D Coffee Cup) */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/40 dark:border-slate-800/60">
        {/* Background Visual Scene (Desktop Sunset View & Wooden Desk Aesthetic) */}
        <div className="absolute inset-0 pointer-events-none opacity-90 dark:opacity-40">
          <div className="absolute top-0 right-0 w-full lg:w-2/3 h-full bg-gradient-to-bl from-amber-500/15 via-rose-500/10 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-tr from-blue-600/10 via-indigo-500/10 to-transparent blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Founder Hero Copy */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Royal Blue Tag Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase shadow-xs bg-blue-600/10 text-[#2F5FEA] border border-blue-200/80 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30">
                <Sparkles className="w-3.5 h-3.5 text-[#2F5FEA] dark:text-blue-300" />
                <span>Startups & Innovation Procurement</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
                Bring Your Innovation to{" "}
                <span className="bg-gradient-to-r from-[#2F5FEA] via-indigo-600 to-amber-600 bg-clip-text text-transparent">
                  Government Challenges
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
                Direct access to high-impact public sector problem statements. Submit your solution, get evaluated by experts, secure pilot contracts, and scale across government departments.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={handleCtaClick}
                  className="py-4 px-7 rounded-2xl bg-[#2F5FEA] hover:bg-[#234BCB] text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  <span>Browse Open Challenges</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#how-it-works"
                  className={`py-4 px-6 rounded-2xl font-bold text-sm border transition-all text-center ${
                    isDarkMode
                      ? "border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700"
                      : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100 shadow-sm"
                  }`}
                >
                  See How It Works
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-semibold border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Direct Govt Department Access</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Fast-Track Pilot Grants</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Animated Hero Visual (Startup Founder Variant) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 flex flex-col items-center justify-center relative"
            >
              <AnimatedHeroVisual variant="startup" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* STAT HIGHLIGHTS SECTION (Dashboard Stat Cards reused) */}
      <section className="py-12 lg:py-16 border-b border-slate-200/40 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                title: "Active Open Challenges",
                value: activeChallengesCount,
                suffix: "+",
                delta: "Live Problem Statements",
                icon: Target,
                colorBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
              },
              {
                title: "Startups Piloted",
                value: pilotedStartupsCount,
                suffix: " Startups",
                delta: "Deploying across wards",
                icon: Rocket,
                colorBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
              },
              {
                title: "Pilot Funding Awarded",
                value: `₹${fundingAwardedCount}`,
                suffix: " Cr",
                delta: "Direct milestone payouts",
                icon: Award,
                colorBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              },
              {
                title: "Avg. Evaluation Window",
                value: avgDaysCount,
                suffix: " Days",
                delta: "Fast-track review cycle",
                icon: Clock,
                colorBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
              },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  className={`p-6 rounded-2xl border transition-all ${
                    isDarkMode
                      ? "bg-slate-900/80 border-slate-800"
                      : "bg-white border-slate-200/80 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {stat.title}
                    </span>
                    <div className={`p-2.5 rounded-xl ${stat.colorBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold tracking-tight my-1">
                    {stat.value}
                    {stat.suffix}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {stat.delta}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* SECTION: GOVERNMENT SCHEMES YOU MAY BE ELIGIBLE FOR */}
      <section className="py-16 lg:py-20 border-b border-slate-200/40 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header & Disclaimer */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500/10 text-[#2F5FEA] dark:bg-blue-500/20 dark:text-blue-300 border border-blue-500/20">
                <Landmark className="w-3.5 h-3.5" />
                <span>Public Funding Directory</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {/* Note: Manually update this date when scheme data is refreshed. */}
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Last checked: {LAST_CHECKED_DATE}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Government Schemes You May Be Eligible For
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex items-start gap-2 pt-1">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Figures and application windows change frequently — always confirm current status on the official site before applying.
                </span>
              </p>
            </div>

            {/* Segmented Toggle: National vs By State */}
            <div className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl border border-slate-300/60 dark:border-slate-700/60 shrink-0 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setSchemeTab("NATIONAL")}
                className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  schemeTab === "NATIONAL"
                    ? "bg-[#2F5FEA] text-white shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>National Schemes</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {MOCK_GOVT_SCHEMES.filter((s) => s.category === "NATIONAL").length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSchemeTab("STATE")}
                className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  schemeTab === "STATE"
                    ? "bg-[#2F5FEA] text-white shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>By State</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {MOCK_GOVT_SCHEMES.filter((s) => s.category === "STATE").length}
                </span>
              </button>
            </div>
          </div>

          {/* Cards Content with Crossfade Tab Switching */}
          <AnimatePresence mode="wait">
            {schemeTab === "NATIONAL" ? (
              <motion.div
                key="national-schemes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {MOCK_GOVT_SCHEMES.filter((s) => s.category === "NATIONAL").map((scheme) => (
                    <motion.div
                      key={scheme.id}
                      variants={fadeInUp}
                      className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-200 hover:shadow-lg ${
                        isDarkMode
                          ? "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                          : "bg-white border-slate-200/90 shadow-sm hover:border-blue-200"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-blue-500/10 text-[#2F5FEA] dark:bg-blue-500/20 dark:text-blue-300 border border-blue-500/20">
                            Run by {scheme.agency}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                            External Program
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                          {scheme.name}
                        </h3>

                        <div className="space-y-2 pt-1">
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            <strong className="font-bold text-slate-800 dark:text-slate-200">
                              Benefit:{" "}
                            </strong>
                            {scheme.benefits}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            <strong className="font-bold text-slate-700 dark:text-slate-300">
                              Eligible:{" "}
                            </strong>
                            {scheme.eligibility}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                          External program — not run by InnovateGov
                        </span>
                        <a
                          href={scheme.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#2F5FEA] dark:text-blue-400 hover:underline transition-all"
                        >
                          <span>Learn more</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="state-schemes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {MOCK_GOVT_SCHEMES.filter((s) => s.category === "STATE").map((scheme) => (
                    <motion.div
                      key={scheme.id}
                      variants={fadeInUp}
                      className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-200 hover:shadow-lg ${
                        isDarkMode
                          ? "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                          : "bg-white border-slate-200/90 shadow-sm hover:border-blue-200"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{scheme.state}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                            Run by {scheme.agency}
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                          {scheme.name}
                        </h3>

                        <div className="space-y-2 pt-1">
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            <strong className="font-bold text-slate-800 dark:text-slate-200">
                              Benefit:{" "}
                            </strong>
                            {scheme.benefits}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            <strong className="font-bold text-slate-700 dark:text-slate-300">
                              Eligible:{" "}
                            </strong>
                            {scheme.eligibility}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                          External program — not run by InnovateGov
                        </span>
                        <a
                          href={scheme.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#2F5FEA] dark:text-blue-400 hover:underline transition-all"
                        >
                          <span>Learn more</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* SECTION: "HOW IT WORKS" (3-Step Visual Cards) */}
      <section id="how-it-works" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-[#2F5FEA] border border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-300">
              <span>Streamlined 3-Step Process</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
              How Startups Partner with Government
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Designed for speed, clarity, and fair evaluation — zero bureaucratic friction.
            </p>
          </div>

          {/* 3-Step Visual Grid */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
          >
            {[
              {
                step: "01",
                title: "Find a Challenge",
                description:
                  "Explore real-world problem statements published directly by civic bodies, municipal corporations, and public utilities.",
                icon: Search,
                accentColor: "bg-blue-600 text-white",
              },
              {
                step: "02",
                title: "Submit Your Proposal",
                description:
                  "Upload your technical approach, capability deck, and deployment timeline using a standardized startup submission form.",
                icon: Send,
                accentColor: "bg-amber-600 text-white",
              },
              {
                step: "03",
                title: "Get Evaluated & Piloted",
                description:
                  "Receive transparent AI scoring and expert committee review. Winning proposals receive pilot funding and live field testing.",
                icon: Rocket,
                accentColor: "bg-emerald-600 text-white",
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  className={`p-8 rounded-3xl border relative transition-all duration-300 hover:-translate-y-1 ${
                    isDarkMode
                      ? "bg-slate-900/90 border-slate-800"
                      : "bg-white border-slate-200/90 shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl ${card.accentColor} flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-slate-300 dark:text-slate-700">
                      {card.step}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-3 tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {card.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* FOOTER CTA SECTION */}
      <section className="py-16 bg-[#16224B] text-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Scale Your Solution with Government?
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base">
            Join InnovateGov to access active challenges, connect with department officers, and scale public impact.
          </p>
          <div className="pt-4 flex justify-center">
            <button
              onClick={handleCtaClick}
              className="py-4 px-8 rounded-2xl bg-gradient-to-r from-[#2F5FEA] to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-extrabold text-sm shadow-xl shadow-blue-600/40 transition-all flex items-center gap-2 transform hover:scale-105"
            >
              <span>Browse Open Challenges Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
