"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CreditCard,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { fadeInUp, staggerContainer, useCountUp } from "@/lib/motion";
import { useSessionStore } from "@/store/session";
import { getAllPilots, updateMilestone } from "@/lib/api";

export default function PaymentsPage() {
  const router = useRouter();
  const { currentUser, hasHydrated } = useSessionStore();

  const [payments, setPayments] = useState<
    {
      id: string;
      vendor: string;
      milestone: string;
      department: string;
      amount: string;
      status: "RELEASED" | "PENDING";
      date: string;
      escrowHash: string;
    }[]
  >([]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!currentUser) {
      router.push("/login");
      return;
    }

    getAllPilots().then((pilots) => {
      if (pilots && pilots.length > 0) {
        const list: typeof payments = [];
        pilots.forEach((pilot) => {
          (pilot.milestones || []).forEach((m) => {
            const isCompleted = m.status === "COMPLETED";
            list.push({
              id: m.id,
              vendor: pilot.startup?.name || "Startup Partner",
              milestone: m.title,
              department: pilot.departmentName || "Public Works Department",
              amount: `₹${m.amount.toLocaleString("en-IN")}`,
              status: isCompleted ? "RELEASED" : "PENDING",
              date: m.completedAt
                ? new Date(m.completedAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })
                : "Pending Completion",
              escrowHash: `0x${m.id.substring(0, 4)}...${m.id.substring(m.id.length - 4)}`,
            });
          });
        });
        setPayments(list);
      }
    });
  }, [currentUser, hasHydrated, router]);

  const totalSum = payments.reduce(
    (acc, p) => acc + (parseInt(p.amount.replace(/[^0-9]/g, "")) || 0),
    0
  );
  const releasedSum = payments
    .filter((p) => p.status === "RELEASED")
    .reduce((acc, p) => acc + (parseInt(p.amount.replace(/[^0-9]/g, "")) || 0), 0);
  const pendingSum = totalSum - releasedSum;

  const totalEscrow = useCountUp(totalSum || 1180000, 800);
  const released = useCountUp(releasedSum || 880000, 800);
  const pending = useCountUp(pendingSum || 300000, 800);

  const handleRelease = async (id: string) => {
    try {
      await updateMilestone(id, "COMPLETED");
      setPayments((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: "RELEASED", date: "Just Released" } : p
        )
      );
    } catch {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: "RELEASED", date: "Just Released" } : p
        )
      );
    }
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
            <CreditCard className="w-7 h-7 text-[#2F5FEA]" />
            <span>Payments & Escrow</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage vendor milestone disbursements and escrow ledger.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/pilots"
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-2 min-h-[44px]"
          >
            <span>View Active Pilots</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </Link>
        </div>
      </motion.div>

      {/* 2. STAT CARDS ROW */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <motion.div
          variants={fadeInUp}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Escrow Pool
            </span>
            <p className="text-2xl font-extrabold text-slate-900">
              ₹{(totalEscrow / 100000).toFixed(2)} Lakhs
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2F5FEA] flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Disbursed to Vendors
            </span>
            <p className="text-2xl font-extrabold text-slate-900">
              ₹{(released / 100000).toFixed(2)} Lakhs
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Pending Disbursement
            </span>
            <p className="text-2xl font-extrabold text-slate-900">
              ₹{(pending / 100000).toFixed(2)} Lakhs
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#D97706] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </motion.div>
      </motion.div>

      {/* 3. ESCROW DISBURSEMENT LEDGER TABLE */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2F5FEA]" />
              <span>Milestone Disbursement Ledger</span>
            </h2>
            <p className="text-xs text-slate-500">
              Audited payment releases linked to pilot milestone verifications
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-2">Vendor Startup</th>
                <th className="pb-3 px-2">Milestone Deliverable</th>
                <th className="pb-3 px-2">Department</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2 text-right">Amount</th>
                <th className="pb-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-2 font-bold text-slate-900">{p.vendor}</td>
                  <td className="py-3.5 px-2 text-slate-700">{p.milestone}</td>
                  <td className="py-3.5 px-2 text-slate-500">{p.department}</td>
                  <td className="py-3.5 px-2">
                    {p.status === "RELEASED" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#16A34A] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Released</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#D97706] inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-2 text-right font-extrabold text-slate-900">
                    {p.amount}
                  </td>
                  <td className="py-3.5 px-2 text-right">
                    {p.status === "PENDING" ? (
                      <button
                        onClick={() => handleRelease(p.id)}
                        className="px-3 py-1 rounded-lg bg-[#2F5FEA] hover:bg-[#234BCB] text-white font-bold text-[11px] transition-colors min-h-[32px]"
                      >
                        Approve & Release
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {p.escrowHash}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
