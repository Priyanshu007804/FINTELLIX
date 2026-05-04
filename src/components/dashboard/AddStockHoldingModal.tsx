"use client";

import { createStockHolding } from "@/app/actions/stocks";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddStockHoldingModal({ isOpen, onClose, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    symbol: "",
    companyName: "",
    exchange: "",
    quantity: "",
    investedAmount: "",
    currency: "USD",
    purchaseDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await createStockHolding({
      symbol: formData.symbol,
      companyName: formData.companyName,
      exchange: formData.exchange,
      quantity: Number(formData.quantity),
      investedAmount: Number(formData.investedAmount),
      currency: formData.currency,
      purchaseDate: formData.purchaseDate,
      notes: formData.notes,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || "Failed to save stock holding.");
      return;
    }

    setFormData({
      symbol: "",
      companyName: "",
      exchange: "",
      quantity: "",
      investedAmount: "",
      currency: "USD",
      purchaseDate: new Date().toISOString().split("T")[0],
      notes: "",
    });

    onSuccess();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl"
          >
            <h2 className="mb-2 text-xl font-bold text-white">Add Stock Holding</h2>
            <p className="mb-6 text-sm text-slate-400">
              Enter the stock you purchased manually. Use exchange suffixes like `RELIANCE.NSE` or `TCS.BSE` for non-US stocks if needed.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Ticker Symbol</label>
                  <input
                    required
                    value={formData.symbol}
                    onChange={(event) => setFormData({ ...formData, symbol: event.target.value.toUpperCase() })}
                    className="w-full rounded-lg border border-slate-700 bg-[#020617] px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="AAPL or RELIANCE.NSE"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Company Name</label>
                  <input
                    value={formData.companyName}
                    onChange={(event) => setFormData({ ...formData, companyName: event.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#020617] px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="Apple Inc."
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Exchange</label>
                  <input
                    value={formData.exchange}
                    onChange={(event) => setFormData({ ...formData, exchange: event.target.value.toUpperCase() })}
                    className="w-full rounded-lg border border-slate-700 bg-[#020617] px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="NASDAQ, NSE, BSE"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(event) => setFormData({ ...formData, currency: event.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#020617] px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Shares Purchased</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.0001"
                    value={formData.quantity}
                    onChange={(event) => setFormData({ ...formData, quantity: event.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#020617] px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Amount Invested</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.investedAmount}
                    onChange={(event) => setFormData({ ...formData, investedAmount: event.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#020617] px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="2500.00"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Purchase Date</label>
                  <input
                    required
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(event) => setFormData({ ...formData, purchaseDate: event.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#020617] px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-400">Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-[#020617] px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="Optional note about this position"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-[#020617] transition hover:bg-cyan-400 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Holding"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
