"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Calendar as CalendarIcon,
  ChevronDown,
  Building,
  LogOut,
  Shield,
  Menu,
  Check,
  CheckCircle2,
  Sparkles,
  Clock,
  Trash2,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import { useThemeStore } from "@/store/theme";

interface TopBarProps {
  onMenuToggle?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "match" | "milestone" | "rubric" | "system";
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const router = useRouter();
  const { currentUser, logout } = useSessionStore();
  const { theme, toggleTheme } = useThemeStore();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Dynamic selected date state
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  // Initial Mock Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n-1",
      title: "New AI Match Found",
      description: "GreenTech Solutions matched with 94% score for Water Leakage System.",
      time: "10 mins ago",
      read: false,
      type: "match",
    },
    {
      id: "n-2",
      title: "Milestone Deliverable Completed",
      description: "Pilot #1 sensor deployment verified across 5 wards.",
      time: "1 hour ago",
      read: false,
      type: "milestone",
    },
    {
      id: "n-3",
      title: "Evaluation Rubric Submitted",
      description: "Dr. Priya Sharma submitted technical score (83.1/100).",
      time: "3 hours ago",
      read: false,
      type: "rubric",
    },
    {
      id: "n-4",
      title: "New Challenge Published",
      description: "Smart Waste Management posted by Municipal Corporation.",
      time: "1 day ago",
      read: true,
      type: "system",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setNotifOpen(false);
      }
      if (
        dateRef.current &&
        !dateRef.current.contains(event.target as Node)
      ) {
        setDatePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push("/login");
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markSingleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
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

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "GOVERNMENT":
        return "Department Officer";
      case "STARTUP":
        return "Founder & CEO";
      case "EVALUATOR":
        return "Independent Evaluator";
      default:
        return "User";
    }
  };

  const formatDisplayDate = (dateIso: string) => {
    try {
      const d = new Date(dateIso);
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "11 Sep 2026";
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-[#16224B] border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs shrink-0 transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu Toggle Button */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Search Input */}
        <div className="relative w-48 sm:w-80 md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search challenges, startups..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30 focus:border-[#2F5FEA] text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all min-h-[44px]"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Global Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Global Theme Mode"
          className="p-2.5 rounded-xl border border-slate-200 bg-slate-100/80 hover:bg-slate-200 text-slate-700 dark:bg-slate-800/80 dark:border-slate-700 dark:text-amber-300 dark:hover:bg-slate-700 transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* FLEXIBLE INTERACTIVE CALENDAR DATE PICKER */}
        <div className="relative hidden md:block" ref={dateRef}>
          <button
            onClick={() => setDatePickerOpen(!datePickerOpen)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 px-3 py-2 rounded-xl border border-slate-200/70 cursor-pointer transition-colors min-h-[44px]"
          >
            <CalendarIcon className="w-4 h-4 text-[#2F5FEA]" />
            <span>{formatDisplayDate(selectedDate)}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Date Picker Popover */}
          {datePickerOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#2F5FEA]" />
                  <span>Select Date</span>
                </span>
                <button
                  onClick={() => setDatePickerOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-semibold uppercase text-slate-400 block">
                  Choose System Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedDate(e.target.value);
                      setDatePickerOpen(false);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30 focus:border-[#2F5FEA] font-semibold text-slate-800 bg-slate-50 min-h-[44px]"
                />

                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedDate(new Date().toISOString().split("T")[0]);
                      setDatePickerOpen(false);
                    }}
                    className="text-[11px] font-bold text-[#2F5FEA] hover:underline"
                  >
                    Reset to Today
                  </button>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Updated Live
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Department Selector */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 cursor-pointer transition-colors min-h-[44px]">
          <Building className="w-3.5 h-3.5 text-[#2F5FEA]" />
          <span>Water Resources Department</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* INTERACTIVE NOTIFICATION BELL & DROPDOWN */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-600">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] font-bold text-[#2F5FEA] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Clear all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Notification Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications right now.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => markSingleRead(item.id)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                        !item.read ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {item.type === "match" ? (
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#2F5FEA] flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                        ) : item.type === "milestone" ? (
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : item.type === "rubric" ? (
                          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                            <Bell className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {!item.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Active User Avatar & Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 cursor-pointer pl-1 py-1 rounded-xl hover:bg-slate-50 transition-colors text-left focus:outline-none min-h-[44px]"
          >
            <div className="w-9 h-9 rounded-full bg-[#16224B] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {getInitials(currentUser?.name)}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 leading-tight">
                {currentUser?.role === "STARTUP"
                  ? "GreenTech Solutions"
                  : currentUser?.name || "Amit Sharma"}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {currentUser?.role === "STARTUP"
                  ? `${currentUser.name} (Founder & CEO)`
                  : getRoleLabel(currentUser?.role)}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {currentUser?.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {currentUser?.email}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#2F5FEA]">
                  <Shield className="w-3 h-3" />
                  <span>{currentUser?.role}</span>
                </div>
              </div>

              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2 min-h-[44px]"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
