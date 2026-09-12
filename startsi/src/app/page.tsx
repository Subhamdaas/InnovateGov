"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/session";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const router = useRouter();
  const { currentUser, token, hasHydrated } = useSessionStore();

  useEffect(() => {
    if (!hasHydrated) return;

    if (currentUser && token) {
      const destination = currentUser.role === "STARTUP" ? "/startup/dashboard" : "/dashboard";
      router.replace(destination);
    } else {
      router.replace("/login");
    }
  }, [currentUser, token, hasHydrated, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F6FA]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-[#2F5FEA] animate-spin" />
        <p className="text-xs font-semibold text-slate-500">
          Loading InnovateGov...
        </p>
      </div>
    </div>
  );
}
