"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  FileText,
  ClipboardCheck,
  Rocket,
  CreditCard,
  BarChart3,
  Settings,
  ShieldCheck,
  Building2,
  Sparkles,
  X,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import { useThemeStore } from "@/store/theme";
import { Role } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  isSoon?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Challenges", href: "/challenges", icon: Target },
  { label: "Applications", href: "/applications", icon: FileText, badge: 14 },
  { label: "Evaluations", href: "/evaluations", icon: ClipboardCheck },
  { label: "Pilots", href: "/pilots", icon: Rocket },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

const startupNavItems: NavItem[] = [
  { label: "Dashboard", href: "/startup/dashboard", icon: LayoutDashboard },
  { label: "Browse Challenges", href: "/startup/challenges", icon: Target },
  { label: "My Applications", href: "/startup/applications", icon: FileText, badge: 3 },
  { label: "My Pilots", href: "/startup/pilots", icon: Rocket },
  { label: "Settings", href: "/startup/settings", icon: Settings },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, switchRole, logout } = useSessionStore();
  const { theme, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    logout();
    if (onMobileClose) onMobileClose();
    router.push("/login");
  };

  const handleRoleSwitch = (role: Role) => {
    switchRole(role);
    if (role === "STARTUP") {
      router.push("/startup/dashboard");
    } else {
      router.push("/dashboard");
    }
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

  const roles: { role: Role; label: string }[] = [
    { role: "GOVERNMENT", label: "Govt Officer" },
    { role: "STARTUP", label: "Startup" },
  ];

  const content = (
    <div className="w-64 bg-[#16224B] text-white flex flex-col justify-between h-full select-none overflow-y-auto">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <Link
            href={currentUser?.role === "STARTUP" ? "/startup/dashboard" : "/dashboard"}
            className="flex items-center bg-white rounded-xl p-2 px-3 shadow-md hover:opacity-95 transition-all overflow-hidden flex-1 max-w-[210px]"
          >
            <img
              src="/govinn-logo.png"
              alt="GOVINN — Government Innovation Procurement Platform"
              className="h-10 w-full object-contain"
            />
          </Link>

          {/* Close button for mobile drawer */}
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-2">
          {(currentUser?.role === "STARTUP" || pathname.startsWith("/startup") ? startupNavItems : navItems).map((item) => {
            const isActive = pathname === item.href || (item.href !== "/startup/dashboard" && item.href !== "/dashboard" && item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onMobileClose}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 min-h-[44px] ${
                  isActive
                    ? "bg-[#2F5FEA] text-white shadow-md shadow-blue-600/30"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-white" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-red-500/90 text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.isSoon && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-800/90 text-slate-400 border border-slate-700/60"
                      }`}
                    >
                      Soon
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile, Theme & Demo Role Switcher */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
        {/* Theme Toggle Button Row */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 text-xs font-semibold text-slate-300 transition-all min-h-[40px]"
        >
          <div className="flex items-center gap-2">
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
            <span>Theme Preference</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
            {theme === "dark" ? "Dark" : "Light"}
          </span>
        </button>

        <div className="px-2 pt-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between">
          <span>Active Role (Demo)</span>
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
        </div>

        <div className="grid grid-cols-2 gap-1.5 mb-3">
          {roles.map((r) => (
            <button
              key={r.role}
              onClick={() => handleRoleSwitch(r.role)}
              className={`text-[10px] font-semibold py-2 px-1.5 rounded-md transition-all min-h-[36px] ${
                currentUser?.role === r.role
                  ? "bg-[#2F5FEA] text-white shadow-sm"
                  : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-inner">
            {getInitials(currentUser?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {currentUser?.name || "Guest User"}
            </p>
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
              {currentUser?.role === "GOVERNMENT"
                ? "Public Works Dept"
                : currentUser?.role === "STARTUP"
                ? "GreenTech Solutions"
                : "Evaluation Panel"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors shrink-0 flex items-center justify-center min-h-[36px] min-w-[36px]"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-slate-800 h-screen shrink-0 z-30 bg-[#16224B]">
        {content}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onMobileClose}
          />
          <div className="relative z-10 w-64 h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
