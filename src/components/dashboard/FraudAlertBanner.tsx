"use client";

import { motion, AnimatePresence } from "framer-motion";

interface FraudAlertProps {
  transaction: {
    merchant?: string;
    amount: string | number;
    fraudProbability?: number;
    mlLabel?: string;
  } | null;
  onDismiss: () => void;
}

export function FraudAlertBanner({ transaction, onDismiss }: FraudAlertProps) {
  if (!transaction) return null;

  const prob = transaction.fraudProbability
    ? (Number(transaction.fraudProbability) * 100).toFixed(1)
    : "N/A";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="mb-6 rounded-xl border border-red-500/40 bg-red-950/30 p-5 shadow-lg backdrop-blur-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-400">
                ⚠ Fraud Alert — Suspicious Transaction Detected
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                A transaction of{" "}
                <span className="font-semibold text-white">
                  ₹{Number(transaction.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                {transaction.merchant && (
                  <>
                    {" "}at{" "}
                    <span className="font-semibold text-white">{transaction.merchant}</span>
                  </>
                )}
                {" "}was flagged by our AI model with a{" "}
                <span className="font-bold text-red-400">{prob}%</span> fraud probability.
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="shrink-0 rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-white transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
