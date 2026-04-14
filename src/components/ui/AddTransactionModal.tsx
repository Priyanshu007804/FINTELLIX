"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createTransaction } from "@/app/actions/transactions";

interface Category {
  id: string;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSuccess: (txData?: any) => void;
}

export function AddTransactionModal({ isOpen, onClose, categories, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    merchant: "",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    categoryId: categories.length > 0 ? categories[0].id : "",
    description: "",
  });
  const [deviceInfo, setDeviceInfo] = useState("");
  const [locationStr, setLocationStr] = useState("Delhi, India"); // Mock Default

  // Capture mock device info (simulating the client layer data capture for ML)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDeviceInfo(`${navigator.platform} - ${navigator.userAgent}`);
      // In a real app we might request geolocation here
      // navigator.geolocation.getCurrentPosition(...)
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.categoryId) return;

    setIsSubmitting(true);
    setError(null);
    
    // Server Action
    const res = await createTransaction({
      amount: parseFloat(formData.amount),
      date: `${formData.date}T${formData.time}`,
      description: formData.description,
      categoryId: formData.categoryId,
      merchant: formData.merchant,
      location: locationStr, // Captured mock location
      deviceInfo: deviceInfo, // Captured mock device info
    });

    setIsSubmitting(false);

    if (res.success) {
      setFormData({
        amount: "",
        merchant: "",
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        categoryId: categories.length > 0 ? categories[0].id : "",
        description: "",
      });
      onSuccess(res.data);
      onClose();
    } else {
      setError(res.error || "Failed to add transaction.");
    }
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
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl"
          >
            <h2 className="mb-6 text-xl font-bold text-white">Add Transaction</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                  {error}
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm text-slate-400">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-[#020617] px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-400">Merchant</label>
                <input
                  type="text"
                  required
                  value={formData.merchant}
                  onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-[#020617] px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="e.g. Amazon, Starbucks"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="mb-1 block text-sm text-slate-400">Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-[#020617] px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
                    />
                 </div>
                 <div>
                    <label className="mb-1 block text-sm text-slate-400">Time</label>
                    <input
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-[#020617] px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
                    />
                 </div>
              </div>
              
              <div>
                 <label className="mb-1 block text-sm text-slate-400">Category</label>
                 <select
                   required
                   value={formData.categoryId}
                   onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                   className="w-full rounded-lg border border-slate-700 bg-[#020617] px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
                 >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                 </select>
              </div>

              <div className="mb-4 rounded-md bg-slate-800/50 p-3 text-xs text-slate-400">
                 <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
                    <span>Securely capturing location ({locationStr}) for Fraud Analysis.</span>
                 </p>
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
                  disabled={isSubmitting || categories.length === 0}
                  className="rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-[#020617] transition hover:bg-cyan-400 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Transaction"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
