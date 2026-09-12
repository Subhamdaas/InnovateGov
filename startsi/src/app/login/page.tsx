"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Building2,
  Users,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
  User,
  Building,
  Rocket,
  Sun,
  Moon,
  X,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import { useThemeStore } from "@/store/theme";
import { AnimatedHeroVisual } from "@/components/landing/AnimatedHeroVisual";
import { Role } from "@/types";
import { fadeInUp, staggerContainer } from "@/lib/motion";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, hasHydrated, login, loginWithGoogle, signup } = useSessionStore();
  const { theme, toggleTheme } = useThemeStore();
  const isDarkMode = theme === "dark";

  const [authMode, setAuthMode] = useState<"SIGN_IN" | "SIGN_UP">("SIGN_IN");
  const [selectedRole, setSelectedRole] = useState<Role>("STARTUP");
  const [fullName, setFullName] = useState<string>("");
  const [orgName, setOrgName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Google OAuth Modal States
  const [showGoogleModal, setShowGoogleModal] = useState<boolean>(false);
  const [googleView, setGoogleView] = useState<"CHOOSER" | "CUSTOM">("CHOOSER");
  const [customGoogleEmail, setCustomGoogleEmail] = useState<string>("");
  const [customGoogleName, setCustomGoogleName] = useState<string>("");
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  // If user is already authenticated in session, redirect to appropriate area
  useEffect(() => {
    if (hasHydrated && currentUser) {
      const destination = currentUser.role === "STARTUP" ? "/startup/dashboard" : "/dashboard";
      router.replace(destination);
    }
  }, [hasHydrated, currentUser, router]);

  // Sync with searchParams on mount (e.g. /login?role=STARTUP)
  useEffect(() => {
    const roleParam = searchParams.get("role")?.toUpperCase();
    if (roleParam === "STARTUP") {
      setSelectedRole("STARTUP");
    } else if (roleParam === "EVALUATOR") {
      setSelectedRole("EVALUATOR");
    } else if (roleParam === "GOVERNMENT") {
      setSelectedRole("GOVERNMENT");
    }
  }, [searchParams]);

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    setErrorMsg(null);
  };

  const handleAuthModeChange = (mode: "SIGN_IN" | "SIGN_UP") => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setAuthMode(mode);
  };

  const fillDemoAccount = (role: Role) => {
    setSelectedRole(role);
    setAuthMode("SIGN_IN");
    if (role === "GOVERNMENT") {
      setEmail("amit.sharma@gov.in");
      setPassword("Password123!");
    } else if (role === "STARTUP") {
      setEmail("founder@techstartup.in");
      setPassword("Password123!");
    } else if (role === "EVALUATOR") {
      setEmail("priya.sharma@evaluator.org");
      setPassword("Password123!");
    }
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim().toLowerCase();

    // Client-side validation
    if (!trimmedEmail) {
      setErrorMsg("Please enter an email address.");
      return;
    }
    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (authMode === "SIGN_UP") {
      if (!fullName.trim()) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      if (!password) {
        setErrorMsg("Please enter a password.");
        return;
      }
      if (password.length < 8) {
        setErrorMsg("Password must be at least 8 characters long.");
        return;
      }

      setIsLoading(true);

      try {
        const res = await signup({
          email: trimmedEmail,
          name: fullName.trim(),
          password,
          role: selectedRole,
          orgName: orgName.trim() || undefined,
        });

        setIsLoading(false);
        setSuccessMsg(res.message || "Account created successfully! Please sign in with your credentials.");
        setAuthMode("SIGN_IN");
        setPassword(""); // Clear password field for login
      } catch (err: unknown) {
        setIsLoading(false);
        const msg = err instanceof Error ? err.message : "Registration failed. Please try again.";
        setErrorMsg(msg);
      }
    } else {
      // SIGN_IN mode
      if (!password) {
        setErrorMsg("Please enter your password.");
        return;
      }

      setIsLoading(true);

      try {
        const user = await login(trimmedEmail, password);
        const destination = user.role === "STARTUP" ? "/startup/dashboard" : "/dashboard";
        window.location.href = destination;
      } catch (err: unknown) {
        setIsLoading(false);
        const msg = err instanceof Error ? err.message : "Invalid email or password.";
        setErrorMsg(msg);
      }
    }
  };

  const handleGoogleClick = () => {
    setErrorMsg(null);
    setShowGoogleModal(true);
  };

  const handleExecuteGoogleAuth = async (targetEmail: string, targetName: string) => {
    if (!targetEmail.trim() || !targetEmail.includes("@")) {
      setErrorMsg("Please enter a valid Google email address.");
      return;
    }
    setIsGoogleLoading(true);
    setErrorMsg(null);
    try {
      const user = await loginWithGoogle({
        email: targetEmail.trim().toLowerCase(),
        name: targetName.trim() || targetEmail.split("@")[0],
        role: selectedRole,
        orgName: orgName || (selectedRole === "STARTUP" ? `${targetName.trim() || "Google Founder"}'s Tech Labs` : undefined),
      });
      setShowGoogleModal(false);
      const destination = user.role === "STARTUP" ? "/startup/dashboard" : "/dashboard";
      window.location.href = destination;
    } catch (err: unknown) {
      setIsGoogleLoading(false);
      const msg = err instanceof Error ? err.message : "Failed to authenticate with Google.";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F5F6FA] dark:bg-[#0B1120]">
      {/* LEFT PANEL (~45% width on desktop) */}
      <div className="w-full md:w-[45%] lg:w-[44%] bg-[#16224B] text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-35 -mb-35" />

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="bg-white rounded-xl p-2 px-3 shadow-md">
            <img
              src="/govinn-logo.png"
              alt="GOVINN — Government Innovation Procurement Platform"
              className="h-9 w-auto object-contain"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme Mode"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-300" />
              )}
            </button>
            <Link
              href="/for-startups"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-all backdrop-blur-xs"
            >
              <span>For Startups</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
            </Link>
          </div>
        </div>

        {/* Hero Pitch Section */}
        <div className="relative z-10 my-8 space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-2xl lg:text-3xl font-extrabold text-white leading-tight tracking-tight"
          >
            Connecting Government Challenges with Startup Innovations
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-sm text-slate-300 leading-relaxed max-w-md"
          >
            A transparent, efficient and startup-friendly platform to identify, pilot, procure and scale innovative public sector solutions.
          </motion.p>
        </div>

        {/* Animated Hero Visual */}
        <div className="relative z-10 py-4 my-auto flex items-center justify-center">
          <AnimatedHeroVisual variant="government" />
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-4 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
          <span>© 2026 InnovateGov Platform</span>
          <span>Version 2.0 (Supabase Auth)</span>
        </div>
      </div>

      {/* RIGHT PANEL (~55% width on desktop) */}
      <div className="w-full md:w-[55%] lg:w-[56%] bg-white dark:bg-[#0B1120] p-8 lg:p-14 flex items-center justify-center">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="w-full max-w-md space-y-6"
        >
          {/* Sign In vs Sign Up Tabs Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleAuthModeChange("SIGN_IN")}
                className={`text-lg font-extrabold pb-1 transition-all cursor-pointer ${
                  authMode === "SIGN_IN"
                    ? "text-slate-900 dark:text-white border-b-2 border-[#2F5FEA]"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleAuthModeChange("SIGN_UP")}
                className={`text-lg font-extrabold pb-1 transition-all cursor-pointer ${
                  authMode === "SIGN_UP"
                    ? "text-slate-900 dark:text-white border-b-2 border-[#2F5FEA]"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
              >
                Sign Up
              </button>
            </div>
            {authMode === "SIGN_UP" && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-[#2F5FEA] border border-blue-500/20">
                New Account
              </span>
            )}
          </div>

          {/* Google OAuth Button */}
          <motion.div variants={fadeInUp} className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleClick}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2.5 min-h-[46px] cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Or with Email
              </span>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
            </div>
          </motion.div>

          {/* Success Message Banner */}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 font-medium"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Error Alert Box */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700 font-medium"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Main Auth Form */}
          <motion.form
            variants={staggerContainer}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* 3-Way Segmented Role Selector */}
            <motion.div variants={fadeInUp} className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                {authMode === "SIGN_UP" ? "Select Account Role" : "Select Portal Role"}
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100/80 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleRoleChange("GOVERNMENT")}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    selectedRole === "GOVERNMENT"
                      ? "bg-[#2F5FEA] text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Government</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange("STARTUP")}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    selectedRole === "STARTUP"
                      ? "bg-[#2F5FEA] text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Startup</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange("EVALUATOR")}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    selectedRole === "EVALUATOR"
                      ? "bg-[#2F5FEA] text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Evaluator</span>
                </button>
              </div>
            </motion.div>

            {/* Sign Up Additional Fields */}
            {authMode === "SIGN_UP" && (
              <>
                <motion.div variants={fadeInUp} className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Vikram Sharma"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30"
                    />
                  </div>
                </motion.div>

                {selectedRole === "STARTUP" && (
                  <motion.div variants={fadeInUp} className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Organization / Startup Name
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="e.g. GreenTech Innovations"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30"
                      />
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {/* Email Field */}
            <motion.div variants={fadeInUp} className="space-y-1">
              <label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30 transition-all"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={fadeInUp} className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password <span className="text-red-500">*</span>
                  {authMode === "SIGN_UP" && (
                    <span className="text-[10px] text-slate-400 font-normal ml-1">(min 8 characters)</span>
                  )}
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              variants={fadeInUp}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#2F5FEA] hover:bg-[#234BCB] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA] focus:ring-offset-2 transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed h-12 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>{authMode === "SIGN_IN" ? "Validating Credentials..." : "Creating Account in Supabase..."}</span>
                </>
              ) : (
                <>
                  <span>{authMode === "SIGN_IN" ? "Sign In to Workspace" : "Create Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            {/* Quick Demo Test Access Chips */}
            <motion.div variants={fadeInUp} className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
              <p className="text-[11px] text-slate-400 font-medium">Test accounts (Password: <span className="font-mono font-bold">Password123!</span>):</p>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fillDemoAccount("GOVERNMENT")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  🏛️ Gov Officer
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount("STARTUP")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  🚀 Startup
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount("EVALUATOR")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  ⚖️ Evaluator
                </button>
              </div>
            </motion.div>
          </motion.form>
        </motion.div>
      </div>

      {/* GOOGLE OAUTH REDIRECT / SIGN IN OVERLAY (Matching ChatGPT/Gemini/Blink Google Sign-In) */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-[760px] bg-[#131314] text-[#E3E3E3] rounded-[28px] border border-[#303134] shadow-[0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 font-sans">
            
            {/* Top Google Bar */}
            <div className="px-6 py-4 border-b border-[#2D2F31] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-sm font-medium text-[#C4C7C5]">Sign in with Google</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="p-1.5 rounded-full text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[#28292A] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Google Loading Progress Bar (if authenticating) */}
            {isGoogleLoading && (
              <div className="w-full h-1 bg-[#1F1F1F] overflow-hidden">
                <div className="w-full h-full bg-[#8AB4F8] animate-pulse origin-left" />
              </div>
            )}

            {/* Main Content: 2-Column Grid identical to Google Account Chooser */}
            <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              
              {/* LEFT COLUMN: App Brand & "Choose an account" */}
              <div className="flex flex-col justify-start">
                <div className="w-12 h-12 rounded-2xl bg-[#1E1F20] border border-[#3C4043] flex items-center justify-center text-white font-bold text-xl shadow-md mb-6">
                  <span className="bg-gradient-to-tr from-blue-400 to-indigo-400 bg-clip-text text-transparent">B</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-[#E3E3E3] mb-3">
                  Choose an account
                </h2>
                <p className="text-sm text-[#C4C7C5]">
                  to continue to{" "}
                  <span className="text-[#8AB4F8] font-medium hover:underline cursor-pointer">
                    StartSI InnovateGov
                  </span>
                </p>

                <div className="mt-6 p-3 rounded-xl bg-[#1E1F20] border border-[#2D2F31] text-xs text-[#9AA0A6]">
                  Account Role: <span className="font-semibold text-[#8AB4F8]">{selectedRole}</span>
                  {orgName && <span className="ml-1 text-[#C4C7C5]">({orgName})</span>}
                </div>
              </div>

              {/* RIGHT COLUMN: Account List or Custom Input */}
              <div className="flex flex-col justify-between">
                {googleView === "CHOOSER" ? (
                  <div className="space-y-1">
                    {/* Primary User Account from screenshot: SUBHAM DAS */}
                    <button
                      type="button"
                      disabled={isGoogleLoading}
                      onClick={() =>
                        handleExecuteGoogleAuth(
                          "24btech.subhamdas@gietbbsr.edu.in",
                          "SUBHAM DAS"
                        )
                      }
                      className="w-full py-3.5 px-3 rounded-xl hover:bg-[#1E1F20] transition-all flex items-center gap-4 text-left group cursor-pointer border border-transparent hover:border-[#3C4043]"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#1A73E8] text-white font-medium flex items-center justify-center text-sm shadow-md shrink-0 ring-2 ring-[#303134]">
                        S
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#E3E3E3] group-hover:text-white truncate">
                          SUBHAM DAS
                        </p>
                        <p className="text-xs text-[#9AA0A6] truncate">
                          24btech.subhamdas@gietbbsr.edu.in
                        </p>
                      </div>
                    </button>

                    <div className="border-t border-[#2D2F31] my-1" />

                    {/* Secondary Account: Current Form Input Email (if filled) */}
                    {email && email !== "24btech.subhamdas@gietbbsr.edu.in" && (
                      <>
                        <button
                          type="button"
                          disabled={isGoogleLoading}
                          onClick={() =>
                            handleExecuteGoogleAuth(
                              email.trim(),
                              fullName.trim() || email.split("@")[0]
                            )
                          }
                          className="w-full py-3.5 px-3 rounded-xl hover:bg-[#1E1F20] transition-all flex items-center gap-4 text-left group cursor-pointer border border-transparent hover:border-[#3C4043]"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#137333] text-white font-medium flex items-center justify-center text-sm shadow-md shrink-0 ring-2 ring-[#303134]">
                            {(fullName.trim() || email)[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#E3E3E3] group-hover:text-white truncate">
                              {fullName.trim() || email.split("@")[0]}
                            </p>
                            <p className="text-xs text-[#9AA0A6] truncate">
                              {email.trim()}
                            </p>
                          </div>
                        </button>
                        <div className="border-t border-[#2D2F31] my-1" />
                      </>
                    )}

                    {/* Use another account option */}
                    <button
                      type="button"
                      disabled={isGoogleLoading}
                      onClick={() => setGoogleView("CUSTOM")}
                      className="w-full py-3.5 px-3 rounded-xl hover:bg-[#1E1F20] transition-all flex items-center gap-4 text-left group cursor-pointer border border-transparent hover:border-[#3C4043]"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#1E1F20] text-[#9AA0A6] group-hover:text-[#E3E3E3] flex items-center justify-center shrink-0 border border-[#3C4043]">
                        <UserCircle className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#E3E3E3] group-hover:text-white">
                          Use another account
                        </p>
                      </div>
                    </button>

                    <div className="border-t border-[#2D2F31] my-3" />
                  </div>
                ) : (
                  /* Custom Google Account View */
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-[#9AA0A6] mb-1 font-medium">Your Name</label>
                        <input
                          type="text"
                          value={customGoogleName}
                          onChange={(e) => setCustomGoogleName(e.target.value)}
                          placeholder="Subham Das"
                          className="w-full px-3.5 py-2.5 bg-[#1E1F20] border border-[#3C4043] focus:border-[#8AB4F8] rounded-lg text-sm text-[#E3E3E3] placeholder-[#606368] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#9AA0A6] mb-1 font-medium">Email or phone</label>
                        <input
                          type="email"
                          value={customGoogleEmail}
                          onChange={(e) => setCustomGoogleEmail(e.target.value)}
                          placeholder="name@gmail.com or university email"
                          className="w-full px-3.5 py-2.5 bg-[#1E1F20] border border-[#3C4043] focus:border-[#8AB4F8] rounded-lg text-sm text-[#E3E3E3] placeholder-[#606368] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setGoogleView("CHOOSER")}
                        className="text-xs text-[#8AB4F8] hover:underline font-medium cursor-pointer"
                      >
                        ← Back to account list
                      </button>

                      <button
                        type="button"
                        disabled={isGoogleLoading || !customGoogleEmail.trim()}
                        onClick={() =>
                          handleExecuteGoogleAuth(customGoogleEmail, customGoogleName)
                        }
                        className="px-6 py-2 bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#041E49] font-semibold text-xs rounded-full shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isGoogleLoading ? "Signing in..." : "Next"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Terms Footer as seen in official Google Auth */}
                <p className="text-[12px] leading-relaxed text-[#9AA0A6] mt-6">
                  Before using this app, you can review StartSI&apos;s{" "}
                  <span className="text-[#8AB4F8] hover:underline cursor-pointer">
                    Privacy Policy
                  </span>{" "}
                  and{" "}
                  <span className="text-[#8AB4F8] hover:underline cursor-pointer">
                    Terms of Service
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400 font-sans">
          <div className="flex items-center gap-3">
            <span className="animate-spin text-xl">⏳</span>
            <span>Loading StartSI...</span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
