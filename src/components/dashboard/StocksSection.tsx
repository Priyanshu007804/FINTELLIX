"use client";

import { deleteStockHolding, type StockDashboardView } from "@/app/actions/stocks";
import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AddStockHoldingModal } from "./AddStockHoldingModal";

interface Props {
  data: StockDashboardView | null;
  onRefresh: () => void;
  onOptimisticDelete?: (holdingId: string) => void;
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function StocksSection({ data, onRefresh, onOptimisticDelete }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const primaryCurrency = useMemo(() => data?.holdings[0]?.currency || "USD", [data]);
  const indiaMarket = data?.marketStatus.find(
    (market) => market.marketType === "Equity" && market.region === "India"
  );
  const usMarket = data?.marketStatus.find(
    (market) => market.marketType === "Equity" && market.region === "United States"
  );

  const handleDelete = async (holdingId: string) => {
    // Optimistic: remove row instantly from UI
    onOptimisticDelete?.(holdingId);
    setDeletingId(null);
    // Then run the actual delete in the background
    const res = await deleteStockHolding(holdingId);
    if (!res.success) {
      onRefresh(); // revert on failure
    }
  };

  return (
    <>
      <div className="mb-8 rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-sm">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <Link
            href="/dashboard/stocks"
            className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_45%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(2,6,23,0.98))] p-6 transition hover:border-cyan-400/40"
          >
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl transition group-hover:bg-cyan-500/20" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-6">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  Market Studio
                </div>
                <h2 className="text-2xl font-semibold text-white">Live Stock Market</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
                  Open a dedicated market page with portfolio visuals, historical price charts, benchmark movement, and a deeper breakdown of every holding.
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>{data?.holdings.length || 0} holdings</span>
                  <span>{indiaMarket?.currentStatus === "open" ? "India market open" : "India market closed"}</span>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition group-hover:translate-x-1">
                  Open details
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-6-6 6 6-6 6" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>

          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#020617] p-6">
            <div>
              <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
              <p className="mt-2 text-sm text-slate-400">
                Keep the dashboard lightweight and use the dedicated page when you want charts, trends, and stock-level visuals.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <button
                onClick={() => setIsModalOpen(true)}
                className="rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-[#020617] transition hover:bg-cyan-400"
              >
                + Add Stock
              </button>
              <Link
                href="/dashboard/stocks"
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-center text-sm font-medium text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-300"
              >
                View Stock Page
              </Link>
            </div>
          </div>
        </div>

        {!data?.apiKeyConfigured && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            Live stock quotes are using Alpha Vantage demo access right now. Add `ALPHA_VANTAGE_API_KEY` in `.env.local` for reliable live quotes across your full portfolio.
          </div>
        )}

        {!!data?.estimatedHoldingsCount && (
          <div className="mb-6 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
            {data.estimatedHoldingsCount} holding{data.estimatedHoldingsCount === 1 ? "" : "s"} are currently valued at cost basis because a live quote feed was unavailable.
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-[#020617] p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">Total Invested</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {formatMoney(data?.summary.totalInvested || 0, primaryCurrency)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#020617] p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">Portfolio Value</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {formatMoney(data?.summary.currentValue || 0, primaryCurrency)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#020617] p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">Total Return</p>
            <p
              className={`mt-2 text-2xl font-bold ${
                (data?.summary.totalGainLoss || 0) >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {formatMoney(data?.summary.totalGainLoss || 0, primaryCurrency)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {(data?.summary.totalGainLossPercent || 0).toFixed(2)}%
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#020617] p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">Day Change</p>
            <p
              className={`mt-2 text-2xl font-bold ${
                (data?.summary.totalDayChange || 0) >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {formatMoney(data?.summary.totalDayChange || 0, primaryCurrency)}
            </p>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {(data?.marketOverview || []).map((metric) => (
            <div key={metric.label} className="rounded-xl border border-slate-800 bg-[#020617] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">{metric.label}</p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {metric.value !== null ? formatMoney(metric.value, metric.currency) : "Unavailable"}
                  </p>
                </div>
                <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-300">
                  {metric.symbol}
                </span>
              </div>
              <p className={`mt-2 text-xs font-medium ${(metric.change || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {metric.change !== null
                  ? `${metric.change >= 0 ? "+" : ""}${metric.change.toFixed(2)} (${(metric.changePercent || 0).toFixed(2)}%)`
                  : "Live change unavailable"}
              </p>
              <p className="mt-1 text-xs text-slate-500">{metric.latest || metric.note || "No market note available"}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-5">
          <div className="rounded-xl border border-slate-800 bg-[#020617] p-4 lg:col-span-2">
            <h3 className="text-sm font-semibold text-white">Market Status</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[indiaMarket, usMarket].map((market, index) => (
                <div key={market?.region || `market-${index}`} className="rounded-lg border border-slate-800 bg-[#0f172a] p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-200">{market?.region || "Unavailable"}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        market?.currentStatus === "open"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {market?.currentStatus || "n/a"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {market ? `${market.localOpen} - ${market.localClose}` : "No market data"}
                  </p>
                  {market?.notes && <p className="mt-1 text-xs text-slate-500">{market.notes}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#020617] p-4 lg:col-span-3">
            <h3 className="text-sm font-semibold text-white">Benchmark Snapshot</h3>
            {data?.benchmarks?.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {data.benchmarks.map((benchmark) => (
                  <div key={benchmark.symbol} className="rounded-lg border border-slate-800 bg-[#0f172a] p-3">
                    <p className="text-xs uppercase tracking-wider text-slate-500">{benchmark.label}</p>
                    <p className="mt-2 text-lg font-bold text-white">{benchmark.symbol}</p>
                    {benchmark.quote ? (
                      <>
                        <p className="mt-1 text-sm text-slate-300">{formatMoney(benchmark.quote.price, "USD")}</p>
                        <p
                          className={`mt-1 text-xs font-medium ${
                            benchmark.quote.change >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {benchmark.quote.change >= 0 ? "+" : ""}
                          {benchmark.quote.change.toFixed(2)} ({benchmark.quote.changePercent.toFixed(2)}%)
                        </p>
                      </>
                    ) : (
                      <p className="mt-2 text-xs text-slate-500">Live quote unavailable</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Benchmark cards load on the detailed stock page so the main dashboard can preserve your daily live-data quota.
              </p>
            )}
          </div>
        </div>

        {data && data.holdings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="border-b border-slate-800 text-slate-500">
                <tr>
                  <th className="pb-3 font-medium">Stock</th>
                  <th className="pb-3 font-medium">Holding</th>
                  <th className="pb-3 font-medium">Avg Cost</th>
                    <th className="pb-3 font-medium">Market Price</th>
                  <th className="pb-3 font-medium">Current Value</th>
                  <th className="pb-3 font-medium">Return</th>
                  <th className="pb-3 font-medium">Latest Day</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.holdings.map((holding, index) => (
                  <motion.tr
                    key={holding.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <td className="py-4">
                      <p className="font-semibold text-white">{holding.symbol}</p>
                      <p className="text-xs text-slate-500">
                        {holding.companyName || holding.exchange || "Manual position"}
                      </p>
                    </td>
                    <td className="py-4">
                      <p className="text-white">{holding.quantity.toLocaleString("en-IN", { maximumFractionDigits: 4 })} shares</p>
                      <p className="text-xs text-slate-500">{formatMoney(holding.investedAmount, holding.currency)} invested</p>
                    </td>
                    <td className="py-4 text-white">{formatMoney(holding.averageCost, holding.currency)}</td>
                    <td className="py-4 text-white">
                      {holding.livePrice !== null ? formatMoney(holding.livePrice, holding.currency) : `${formatMoney(holding.averageCost, holding.currency)} (Est.)`}
                    </td>
                    <td className="py-4 text-white">
                      {holding.currentValue !== null ? formatMoney(holding.currentValue, holding.currency) : `${formatMoney(holding.investedAmount, holding.currency)} (Est.)`}
                    </td>
                    <td className="py-4">
                      {holding.totalGainLoss !== null ? (
                        <>
                          <p className={holding.totalGainLoss >= 0 ? "text-emerald-400" : "text-red-400"}>
                            {formatMoney(holding.totalGainLoss, holding.currency)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(holding.totalGainLossPercent || 0).toFixed(2)}% {holding.pricingSource === "estimated" ? "• Est." : ""}
                          </p>
                        </>
                      ) : (
                        <p className="text-slate-500">Awaiting live quote</p>
                      )}
                    </td>
                    <td className="py-4 text-slate-300">{holding.latestTradingDay || "n/a"}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleDelete(holding.id)}
                        disabled={deletingId === holding.id}
                        className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                      >
                        {deletingId === holding.id ? "Removing..." : "Delete"}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-700 bg-[#020617] p-8 text-center">
            <h3 className="text-lg font-medium text-slate-200">No stock holdings yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              Add your first stock purchase to track invested amount, quantity, live price, and market movement here.
            </p>
          </div>
        )}
      </div>

      <AddStockHoldingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRefresh}
      />
    </>
  );
}
