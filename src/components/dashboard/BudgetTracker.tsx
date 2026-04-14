"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { upsertBudget } from "@/app/actions/budgets";

interface Category {
  id: string;
  name: string;
  color?: string;
}

interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: string | number;
}

interface Props {
  categories: Category[];
  budgets: Budget[];
  transactions: any[];
  onUpdate: () => void;
}

export function BudgetTracker({ categories, budgets, transactions, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [saving, setSaving] = useState(false);

  // Get current month's transactions only
  const now = new Date();
  const currentMonthTx = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
  });

  // Calculate spending per category this month
  const spendingByCategory: Record<string, number> = {};
  currentMonthTx.forEach((tx) => {
    const catId = tx.categoryId || tx.category?.id;
    if (catId) {
      spendingByCategory[catId] = (spendingByCategory[catId] || 0) + Number(tx.amount);
    }
  });

  const handleSave = async () => {
    if (!editCategoryId || !editAmount) return;
    setSaving(true);
    await upsertBudget(editCategoryId, parseFloat(editAmount));
    setSaving(false);
    setIsEditing(false);
    setEditCategoryId("");
    setEditAmount("");
    onUpdate();
  };

  const budgetItems = budgets.map((b) => {
    const cat = categories.find((c) => c.id === b.categoryId);
    const spent = spendingByCategory[b.categoryId] || 0;
    const limit = Number(b.monthlyLimit);
    const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
    const isOver = spent > limit;
    return { ...b, cat, spent, limit, percentage, isOver };
  });

  const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-slate-200">Budget Tracker</h3>
          <p className="text-xs text-slate-500 mt-0.5">{monthName}</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition"
        >
          {isEditing ? "Cancel" : "+ Set Budget"}
        </button>
      </div>

      {/* Set Budget Form */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-5"
          >
            <div className="flex gap-2">
              <select
                value={editCategoryId}
                onChange={(e) => setEditCategoryId(e.target.value)}
                className="flex-1 rounded-lg border border-slate-700 bg-[#020617] px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="₹ Limit"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="w-28 rounded-lg border border-slate-700 bg-[#020617] px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
              <button
                onClick={handleSave}
                disabled={saving || !editCategoryId || !editAmount}
                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-[#020617] hover:bg-cyan-400 transition disabled:opacity-50"
              >
                {saving ? "..." : "Save"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budget Progress Bars */}
      {budgetItems.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-6">
          No budgets set yet. Click &ldquo;+ Set Budget&rdquo; above to start tracking.
        </p>
      ) : (
        <div className="space-y-4">
          {budgetItems.map((item) => (
            <div key={item.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.cat?.color || "#0ea5e9" }}
                  />
                  <span className="text-sm font-medium text-slate-300">
                    {item.cat?.name || "Unknown"}
                  </span>
                </div>
                <span className={`text-xs font-semibold ${item.isOver ? "text-red-400" : "text-slate-400"}`}>
                  ₹{item.spent.toLocaleString("en-IN", { minimumFractionDigits: 0 })} / ₹{item.limit.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    item.isOver
                      ? "bg-red-500"
                      : item.percentage > 75
                      ? "bg-amber-500"
                      : "bg-cyan-500"
                  }`}
                />
              </div>
              {item.isOver && (
                <p className="mt-1 text-[10px] text-red-400 font-medium">
                  ⚠ Over budget by ₹{(item.spent - item.limit).toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
