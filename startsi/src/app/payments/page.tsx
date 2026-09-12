"use client";

import { useState } from "react";
import Link from "next/link";
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

export default function PaymentsPage() {
  const [payments, setPayments] = useState([
    {
      id: "pay-101",
      vendor: "GreenTech Solutions Pvt. Ltd.",
      milestone: "Deploy Sensors in 5 Wards",
      department: "Public Works Department",
      amount: "₹2,50,000",
      status: "RELEASED",
      date: "Sep 05, 2026",
      escrowHash: "0x8f2a...9b41",
    },
    {
      id: "pay-102",
      vendor: "GreenTech Solutions Pvt. Ltd.",
      milestone: "Telemetry Data Calibration & Baseline Report",
      department: "Public Works Department",
      amount: "₹3,00,000",
      status: "PENDING",
      date: "Due Oct 15, 2026",
      escrowHash: "0x3c1d...4e82",
    },
    {
      id: "pay-103",
      vendor: "EcoTrash Systems",
      milestone: "IoT Bin Sensor Deployment across Ward 4",
      department: "Municipal Corporation",
      amount: "₹2,00,000",
      status: "RELEASED",
      date: "Apr 15, 2026",
      escrowHash: "0x7e9f...1a2b",
    },
    {
      id: "pay-104",
      vendor: "EcoTrash Systems",
      milestone: "Dynamic Truck Route Telemetry Calibration",
      department: "Municipal Corporation",
      amount: "₹2,50,000",
      status: "RELEASED",
      date: "Jun 20, 2026",
      escrowHash: "0x4b8c...9d0e",
    },
    {
      id: "pay-[#pay-105]",
      vendor: "AgriTech Labs",
      milestone: "Thermal Imagery Camera Installation",
      department: "Public Works Department",
      amount: "₹1,80,000",
      status: "RELEASED",
      date: "Aug 30, 2026",
      escrowHash: "0x1d2e...3f4a",
    },
  ]);

  const totalEscrow = useCountUp(1180000, 800);
  const released = useCountUp(880000, 800);
  const pending = useCountUp(300000, 800);

  const handleRelease = (id: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: "RELEASED", date: "Just Released" }
          : p
      )
    );
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
