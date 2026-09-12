"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  Rocket,
  Lightbulb,
  TrendingUp,
  Zap,
  Brain,
  Building2,
  ShieldCheck,
  Cloud,
  Code2,
  Terminal,
} from "lucide-react";

interface AnimatedHeroVisualProps {
  variant?: "startup" | "government";
  className?: string;
}

export function AnimatedHeroVisual({
  variant = "startup",
  className = "",
}: AnimatedHeroVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Parallax Motion Values
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const mouseX = useSpring(rawMouseX, springConfig);
  const mouseY = useSpring(rawMouseY, springConfig);

  // Icon Badge Parallax Offsets
  const layer1X = useTransform(mouseX, [-200, 200], [-12, 12]);
  const layer1Y = useTransform(mouseY, [-200, 200], [-12, 12]);
  const layer2X = useTransform(mouseX, [-200, 200], [10, -10]);
  const layer2Y = useTransform(mouseY, [-200, 200], [10, -10]);

  // Reduced Motion Detection
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    rawMouseX.set(e.clientX - centerX);
    rawMouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    rawMouseX.set(0);
    rawMouseY.set(0);
  };

  // Role-appropriate icon subset
  const isStartup = variant === "startup";

  const badges = isStartup
    ? [
        {
          id: "b1",
          label: "Innovation",
          icon: Lightbulb,
          color: "bg-amber-500/20 text-amber-500 border-amber-500/30",
          iconColor: "text-amber-500 dark:text-amber-400",
          position: "top-4 left-2 sm:left-4",
          delay: 0,
          duration: 4.2,
        },
        {
          id: "b2",
          label: "Pilot Launch",
          icon: Rocket,
          color: "bg-blue-500/20 text-blue-500 border-blue-500/30",
          iconColor: "text-blue-500 dark:text-blue-400",
          position: "top-8 right-2 sm:right-6",
          delay: 0.5,
          duration: 4.8,
        },
        {
          id: "b3",
          label: "Scale Growth",
          icon: TrendingUp,
          color: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
          iconColor: "text-emerald-500 dark:text-emerald-400",
          position: "bottom-14 left-4 sm:left-6",
          delay: 0.8,
          duration: 3.9,
        },
        {
          id: "b4",
          label: "Fast Track",
          icon: Zap,
          color: "bg-purple-500/20 text-purple-500 border-purple-500/30",
          iconColor: "text-purple-500 dark:text-purple-400",
          position: "bottom-8 right-4 sm:right-8",
          delay: 1.2,
          duration: 5.1,
        },
        {
          id: "b5",
          label: "AI Match",
          icon: Brain,
          color: "bg-indigo-500/20 text-indigo-500 border-indigo-500/30",
          iconColor: "text-indigo-500 dark:text-indigo-400",
          position: "-top-2 right-1/3",
          delay: 1.5,
          duration: 4.5,
        },
      ]
    : [
        {
          id: "b1",
          label: "Govt Needs",
          icon: Building2,
          color: "bg-blue-500/20 text-blue-500 border-blue-500/30",
          iconColor: "text-blue-500 dark:text-blue-400",
          position: "top-4 left-2 sm:left-4",
          delay: 0,
          duration: 4.2,
        },
        {
          id: "b2",
          label: "Verified",
          icon: ShieldCheck,
          color: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
          iconColor: "text-emerald-500 dark:text-emerald-400",
          position: "top-8 right-2 sm:right-6",
          delay: 0.5,
          duration: 4.8,
        },
        {
          id: "b3",
          label: "Public Impact",
          icon: TrendingUp,
          color: "bg-purple-500/20 text-purple-500 border-purple-500/30",
          iconColor: "text-purple-500 dark:text-purple-400",
          position: "bottom-14 left-4 sm:left-6",
          delay: 0.8,
          duration: 3.9,
        },
        {
          id: "b4",
          label: "Cloud Infra",
          icon: Cloud,
          color: "bg-cyan-500/20 text-cyan-500 border-cyan-500/30",
          iconColor: "text-cyan-500 dark:text-cyan-400",
          position: "bottom-8 right-4 sm:right-8",
          delay: 1.2,
          duration: 5.1,
        },
        {
          id: "b5",
          label: "Deployment",
          icon: Rocket,
          color: "bg-amber-500/20 text-amber-500 border-amber-500/30",
          iconColor: "text-amber-500 dark:text-amber-400",
          position: "-top-2 right-1/3",
          delay: 1.5,
          duration: 4.5,
        },
      ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`w-full max-w-lg mx-auto relative p-6 sm:p-8 rounded-3xl overflow-hidden bg-gradient-to-b from-white via-blue-50/60 to-slate-100 dark:from-[#16224B] dark:via-[#0B1120] dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-2xl transition-colors duration-300 ${className}`}
    >
      {/* BACKGROUND SKYLINE SILHOUETTE & RADIAL GLOW */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-3xl" />

        {/* Coded City Skyline Silhouette SVG */}
        <svg
          className="absolute bottom-0 left-0 w-full h-28 text-slate-300/40 dark:text-slate-800/40 transition-colors duration-300"
          viewBox="0 0 500 120"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,120 L0,90 L30,90 L30,70 L55,70 L55,100 L85,100 L85,45 L115,45 L115,120 L135,120 L135,60 L165,60 L165,120 L210,120 L210,35 L245,35 L245,80 L275,80 L275,25 L315,25 L315,120 L350,120 L350,55 L385,55 L385,120 L425,120 L425,75 L460,75 L460,120 L500,120 Z"
          />
        </svg>
      </div>

      {/* DASHED ANIMATED CONNECTOR LINE */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 450 380">
        <motion.path
          d="M 70,60 Q 180,20 230,190 T 370,300"
          fill="none"
          stroke="#2F5FEA"
          strokeWidth="2"
          strokeDasharray="6 6"
          initial={{ strokeDashoffset: 200, opacity: 0.3 }}
          animate={
            prefersReducedMotion
              ? { opacity: 0.4 }
              : { strokeDashoffset: [200, 0], opacity: [0.3, 0.7, 0.3] }
          }
          transition={
            prefersReducedMotion
              ? {}
              : { duration: 8, repeat: Infinity, ease: "linear" }
          }
        />
      </svg>

      {/* CENTER ELEMENT: LAPTOP / DASHBOARD MOCKUP SILHOUETTE */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-20 my-6 mx-auto w-full max-w-[340px] sm:max-w-[380px]"
      >
        {/* Laptop Screen Frame */}
        <div className="rounded-2xl bg-slate-900 dark:bg-slate-950 p-3 sm:p-4 border-2 border-slate-700/80 dark:border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400 font-mono">
              <Terminal className="w-3 h-3 text-blue-400" />
              <span>innovategov.portal</span>
            </div>
          </div>

          {/* Screen Content Grid (Abstract Dashboard & Code Blocks) */}
          <div className="space-y-3 font-mono">
            {/* Top Stat Row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 flex flex-col justify-between">
                <span className="text-[9px] text-slate-400">Match Score</span>
                <span className="text-xs font-bold text-emerald-400">94.2%</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 flex flex-col justify-between">
                <span className="text-[9px] text-slate-400">Pilots Active</span>
                <span className="text-xs font-bold text-blue-400">08 Live</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 flex flex-col justify-between">
                <span className="text-[9px] text-slate-400">Evaluation</span>
                <span className="text-xs font-bold text-amber-400">Verified</span>
              </div>
            </div>

            {/* Code / Analytics Lines */}
            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 space-y-2 text-[10px]">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-blue-400 flex items-center gap-1">
                  <Code2 className="w-3 h-3" />
                  <span>const proposalData = &#123;</span>
                </span>
                <span className="text-[9px] text-emerald-400">✓ Ready</span>
              </div>

              <div className="space-y-1 pl-3 border-l border-slate-800">
                <div className="h-1.5 rounded-full bg-blue-500/40 w-3/4 animate-pulse" />
                <div className="h-1.5 rounded-full bg-indigo-500/40 w-1/2" />
                <div className="h-1.5 rounded-full bg-emerald-500/40 w-5/6" />
              </div>

              <div className="text-slate-500 text-[9px] pt-1">
                <span>&#125;; // Deployed to Public Sector</span>
              </div>
            </div>
          </div>
        </div>

        {/* Laptop Hinge Base */}
        <div className="w-full h-3 bg-slate-800 rounded-b-xl border-t border-slate-700 flex items-center justify-center">
          <div className="w-12 h-1 bg-slate-600 rounded-full" />
        </div>
      </motion.div>

      {/* FLOATING ICON BADGES (INDEPENDENT IDLE TRANSLATE LOOPS + PARALLAX) */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {badges.map((badge, idx) => {
          const Icon = badge.icon;
          const isOdd = idx % 2 === 0;
          const pxX = isOdd ? layer1X : layer2X;
          const pxY = isOdd ? layer1Y : layer2Y;

          return (
            <motion.div
              key={badge.id}
              style={{ x: pxX, y: pxY }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 + badge.delay }}
              className={`absolute ${badge.position}`}
            >
              <motion.div
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        y: [0, -8, 0],
                      }
                }
                transition={
                  prefersReducedMotion
                    ? {}
                    : {
                        duration: badge.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: badge.delay,
                      }
                }
                className={`px-3 py-2 rounded-2xl border backdrop-blur-md shadow-xl flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 transition-colors`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center border ${badge.color}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${badge.iconColor}`} />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {badge.label}
                </span>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
