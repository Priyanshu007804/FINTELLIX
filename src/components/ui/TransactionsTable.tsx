"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { deleteTransaction, scanTransaction } from "@/app/actions/transactions";
import { MoreVertical, Trash2, ScanSearch } from "lucide-react";

export function TransactionsTable({ transactions, onRefresh }: { transactions: any[], onRefresh?: () => void }) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (id: string) => {
    setIsProcessing(id);
    const res = await deleteTransaction(id);
    if (res.success) {
       onRefresh?.();
    } else {
       alert("Failed to delete: " + res.error);
    }
    setIsProcessing(null);
    setOpenMenuId(null);
  };

  const handleScan = async (id: string) => {
    setIsProcessing(id);
    const res = await scanTransaction(id);
    if (res.success) {
       onRefresh?.();
    } else {
       alert("Failed to scan: " + res.error);
    }
    setIsProcessing(null);
    setOpenMenuId(null);
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-12 text-center shadow-sm">
        <h3 className="text-lg font-medium text-slate-300">No Transactions Found</h3>
        <p className="mt-1 text-sm text-slate-500">Add a transaction to see your spending history.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0f172a] overflow-visible shadow-sm">
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-[#1e293b] text-slate-300">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium">Merchant</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium text-center">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {transactions.map((tx, idx) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={tx.id} 
                className="hover:bg-[#1a2235] transition relative"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(tx.date).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                  {new Date(tx.date).toLocaleTimeString(undefined, {
                    hour: '2-digit', minute: '2-digit'
                  })}
                </td>
                <td className="px-6 py-4 font-medium text-slate-200">
                  {tx.merchant || <span className="opacity-50">Unknown</span>}
                  {tx.location && (
                    <span className="block text-xs text-slate-500">{tx.location}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                    style={{ 
                      backgroundColor: `${tx.category?.color || '#0ea5e9'}20`, 
                      color: tx.category?.color || '#38bdf8' 
                    }}
                  >
                    {tx.category?.name || "Uncategorized"}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">
                  ₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-center">
                  {tx.isFraud ? (
                     <span className="inline-flex items-center px-2 py-0.5 rounded border border-red-500/30 bg-red-500/10 text-xs font-semibold text-red-500">
                       Suspicious
                     </span>
                  ) : (
                     <span className="inline-flex items-center px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-xs font-semibold text-cyan-500">
                       Safe
                     </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === tx.id ? null : tx.id)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {openMenuId === tx.id && (
                    <div 
                      ref={menuRef}
                      className="absolute right-6 top-10 mt-1 w-48 rounded-lg border border-slate-700 bg-[#0f172a] py-1 shadow-xl z-50 text-left"
                    >
                      <button
                        onClick={() => handleScan(tx.id)}
                        disabled={isProcessing === tx.id}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition disabled:opacity-50"
                      >
                        <ScanSearch className="w-4 h-4 text-cyan-400" />
                        Scan Transaction
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        disabled={isProcessing === tx.id}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition md:hover:bg-red-900/20 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                        Delete Transaction
                      </button>
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
