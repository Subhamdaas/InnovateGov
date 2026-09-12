"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { PageTransition } from "@/components/layout/PageTransition";
import { useThemeStore } from "@/store/theme";
import { useSessionStore } from "@/store/session";
import { AiAssistantWidget } from "@/components/ai/AiAssistantWidget";
import { Loader2 } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useThemeStore();
  const { currentUser, token, hasHydrated, isValidating, validateSession } = useSessionStore();

  const isPublicPage = pathname === "/login" || pathname === "/for-startups";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const validatedRef = useRef(false);

  // Theme synchronization
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme]);

  // Session validation and route protection
  useEffect(() => {
    if (!hasHydrated) return;

    if (!isPublicPage) {
      if (!currentUser || !token) {
        // User is not authenticated -> redirect to login
        router.replace("/login");
        return;
      }

      // If user has token, validate with backend on initial load
      if (!validatedRef.current) {
        validatedRef.current = true;
        validateSession().then((isValid) => {
          if (!isValid) {
            router.replace("/login");
          }
        });
      }
    }
  }, [hasHydrated, currentUser, token, isPublicPage, router, validateSession]);

  // Public pages (login, for-startups) render without shell sidebar/topbar
  if (isPublicPage) {
    return (
      <main
        className={`w-full min-h-screen ${
          theme === "dark" ? "dark bg-[#141210] text-slate-100" : "bg-[#FBF9F4] text-slate-900"
        }`}
      >
        <PageTransition>{children}</PageTransition>
        <AiAssistantWidget />
      </main>
    );
  }

  // If waiting for hydration or unauthenticated on a protected page, show loading gate
  if (!hasHydrated || isValidating || !currentUser) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FBF9F4] dark:bg-[#141210]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#8C634B] animate-spin" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Verifying secure session...
          </p>
        </div>
      </div>
    );
  }

  // Protected page layout
  return (
    <div
      className={`flex flex-row h-screen w-full overflow-hidden antialiased ${
        theme === "dark" ? "dark bg-[#141210] text-slate-100" : "bg-[#FBF9F4] text-slate-900"
      }`}
    >
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <TopBar onMenuToggle={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <AiAssistantWidget />
    </div>
  );
}
