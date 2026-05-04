"use client";

import { getStockDashboardData, getStockDetail, type StockDashboardView, type StockDetailView } from "@/app/actions/stocks";
import { AddStockHoldingModal } from "@/components/dashboard/AddStockHoldingModal";
import { Loader } from "@/components/ui/Loader";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const allocationColors = ["#22d3ee", "#38bdf8", "#6366f1", "#14b8a6", "#f59e0b", "#f97316", "#ef4444"];

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatTooltipMoney(value: unknown, currency: string) {
  return formatMoney(Number(value || 0), currency);
}

export function StockMarketDetailsPage() {
  const { data: session, isPending } = useSession();
  const [dashboard, setDashboard] = useState<StockDashboardView | null>(null);
  const [detail, setDetail] = useState<StockDetailView | null>(null);
  const [selectedHoldingId, setSelectedHoldingId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const primaryCurrency = useMemo(() => dashboard?.holdings[0]?.currency || "USD", [dashboard]);

  const loadDashboard = async (preferredHoldingId?: string) => {
    setIsLoading(true);
    const response = await getStockDashboardData({ includeBenchmarks: true });

    if (response.success && response.data) {
      setDashboard(response.data);

      const nextHoldingId =
        preferredHoldingId ||
        response.data.holdings.find((holding) => holding.id === selectedHoldingId)?.id ||
        response.data.holdings[0]?.id ||
        "";

      setSelectedHoldingId(nextHoldingId);
      if (nextHoldingId) {
        await loadDetail(nextHoldingId);
      } else {
        setDetail(null);
      }
    }

    setIsLoading(false);
  };

  const loadDetail = async (holdingId: string) => {
    if (!holdingId) return;
    setIsDetailLoading(true);
    const response = await getStockDetail(holdingId);
    if (response.success && response.data) {
      setDetail(response.data);
    }
    setIsDetailLoading(false);
  };

  useEffect(() => {
    if (!isPending && session?.user?.id) {
      loadDashboard();
    }
  }, [isPending, session?.user?.id]);

  const allocationData = useMemo(() => {
    return (dashboard?.holdings || [])
      .filter((holding) => (holding.currentValue ?? 0) > 0)
      .map((holding) => ({
        name: holding.symbol,
        value: holding.currentValue ?? 0,
      }));
  }, [dashboard]);

  const comparisonData = useMemo(() => {
    return (dashboard?.holdings || []).map((holding) => ({
      symbol: holding.symbol,
      invested: holding.investedAmount,
      current: holding.currentValue ?? 0,
      pnl: holding.totalGainLoss ?? 0,
    }));
  }, [dashboard]);

  const dayChangeData = useMemo(() => {
    return (dashboard?.holdings || []).map((holding) => ({
      symbol: holding.symbol,
      dayChange: holding.dayChange ?? 0,
    }));
  }, [dashboard]);

  const historyData = useMemo(() => {
    return (detail?.history || []).map((point) => ({
      date: new Date(point.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      close: point.close,
      volume: point.volume,
      high: point.high,
      low: point.low,
    }));
  }, [detail]);

  if (isPending || isLoading) {
    return <Loader fullScreen text="LOADING MARKET STUDIO" />;
  }

  return (
    <>
      <div className="min-h-screen bg-[#020617] p-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link href="/dashboard" className="text-sm text-cyan-300 transition hover:text-cyan-200">
                {"<-"} Back to Dashboard
              </Link>
              <h1 className="mt-3 text-3xl font-bold tracking-tight">Stock Market Studio</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
                A deeper workspace for your stock portfolio with visual allocation, return comparison, benchmark snapshots, and recent market trend charts.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-[#020617] transition hover:bg-cyan-400"
              >
                + Add Stock
              </button>
              <button
                onClick={() => loadDashboard(selectedHoldingId)}
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-300"
              >
                Refresh Live Data
              </button>
            </div>
          </div>

          {!dashboard?.apiKeyConfigured && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              Alpha Vantage is running in demo mode. Add a production API key in `.env.local` for more reliable quote coverage and fewer request limits.
            </div>
          )}

          {!!dashboard?.estimatedHoldingsCount && (
            <div className="mb-6 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
              {dashboard.estimatedHoldingsCount} holding{dashboard.estimatedHoldingsCount === 1 ? "" : "s"} are currently valued at cost basis because a live quote feed was unavailable.
            </div>
          )}

          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5">
              <p className="text-xs uppercase tracking-widest text-slate-500">Total Invested</p>
              <p className="mt-2 text-3xl font-bold">{formatMoney(dashboard?.summary.totalInvested || 0, primaryCurrency)}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5">
              <p className="text-xs uppercase tracking-widest text-slate-500">Portfolio Value</p>
              <p className="mt-2 text-3xl font-bold">{formatMoney(dashboard?.summary.currentValue || 0, primaryCurrency)}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5">
              <p className="text-xs uppercase tracking-widest text-slate-500">Portfolio P/L</p>
              <p className={`mt-2 text-3xl font-bold ${(dashboard?.summary.totalGainLoss || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {formatMoney(dashboard?.summary.totalGainLoss || 0, primaryCurrency)}
              </p>
              <p className="mt-1 text-xs text-slate-500">{(dashboard?.summary.totalGainLossPercent || 0).toFixed(2)}%</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5">
              <p className="text-xs uppercase tracking-widest text-slate-500">Day Movement</p>
              <p className={`mt-2 text-3xl font-bold ${(dashboard?.summary.totalDayChange || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {formatMoney(dashboard?.summary.totalDayChange || 0, primaryCurrency)}
              </p>
            </div>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            {(dashboard?.marketOverview || []).map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{metric.label}</p>
                    <p className="mt-2 text-3xl font-bold text-white">
                      {metric.value !== null ? formatMoney(metric.value, metric.currency) : "Pending feed"}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-700 px-2 py-1 text-[10px] font-semibold uppercase text-slate-300">
                    {metric.symbol}
                  </span>
                </div>
                <p className={`mt-3 text-sm font-medium ${(metric.change || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {metric.change !== null
                    ? `${metric.change >= 0 ? "+" : ""}${metric.change.toFixed(2)} (${(metric.changePercent || 0).toFixed(2)}%)`
                    : "Change pending feed"}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{metric.note || metric.latest || "No additional market note available."}</p>
              </div>
            ))}
          </div>

          <div className="mb-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Portfolio Allocation</h2>
                  <p className="text-sm text-slate-400">Current value share by holding.</p>
                </div>
              </div>
              <div className="h-[360px] w-full min-h-[1px] min-w-[1px]">
                {allocationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <PieChart>
                      <Pie data={allocationData} dataKey="value" nameKey="name" innerRadius={90} outerRadius={135} paddingAngle={3}>
                        {allocationData.map((entry, index) => (
                          <Cell key={entry.name} fill={allocationColors[index % allocationColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatTooltipMoney(value, primaryCurrency)}
                        contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "10px" }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        formatter={(value) => <span className="text-sm text-slate-300">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">Add holdings to visualize allocation.</div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6">
              <h2 className="text-lg font-semibold">Benchmarks & Market Pulse</h2>
              <p className="mt-1 text-sm text-slate-400">Quick context around major indices and market windows.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {(dashboard?.benchmarks || []).map((benchmark) => (
                  <div key={benchmark.symbol} className="rounded-xl border border-slate-800 bg-[#020617] p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">{benchmark.label}</p>
                    <p className="mt-2 text-xl font-bold text-white">{benchmark.symbol}</p>
                    {benchmark.quote ? (
                      <>
                        <p className="mt-1 text-sm text-slate-300">{formatMoney(benchmark.quote.price, "USD")}</p>
                        <p className={`mt-2 text-xs font-medium ${benchmark.quote.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {benchmark.quote.change >= 0 ? "+" : ""}
                          {benchmark.quote.change.toFixed(2)} ({benchmark.quote.changePercent.toFixed(2)}%)
                        </p>
                      </>
                    ) : (
                      <p className="mt-2 text-xs text-slate-500">Awaiting benchmark feed</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {dashboard?.marketStatus
                  .filter((market) => market.marketType === "Equity" && ["India", "United States"].includes(market.region))
                  .map((market) => (
                    <div key={market.region} className="rounded-xl border border-slate-800 bg-[#020617] p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white">{market.region}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${market.currentStatus === "open" ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-700 text-slate-300"}`}>
                          {market.currentStatus}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">{market.primaryExchanges}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {market.localOpen} - {market.localClose}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mb-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6">
              <h2 className="text-lg font-semibold">Invested vs Portfolio Value</h2>
              <p className="mt-1 text-sm text-slate-400">Compare the capital you put in against the latest portfolio valuation.</p>
              <div className="mt-5 h-[360px] w-full min-h-[1px] min-w-[1px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="symbol" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${Math.round(value)}`} />
                    <Tooltip
                      formatter={(value) => formatTooltipMoney(value, primaryCurrency)}
                      contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "10px" }}
                    />
                    <Legend />
                    <Bar dataKey="invested" name="Invested" fill="#334155" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="current" name="Portfolio Value" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6">
              <h2 className="text-lg font-semibold">Daily Contribution</h2>
              <p className="mt-1 text-sm text-slate-400">See which holdings are driving today&apos;s movement.</p>
              <div className="mt-5 h-[360px] w-full min-h-[1px] min-w-[1px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <BarChart data={dayChangeData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                    <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="symbol" type="category" tick={{ fill: "#cbd5e1", fontSize: 12 }} axisLine={false} tickLine={false} width={64} />
                    <Tooltip
                      formatter={(value) => formatTooltipMoney(value, primaryCurrency)}
                      contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "10px" }}
                    />
                    <Bar dataKey="dayChange" radius={[0, 6, 6, 0]}>
                      {dayChangeData.map((entry) => (
                        <Cell key={entry.symbol} fill={entry.dayChange >= 0 ? "#10b981" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mb-8 rounded-2xl border border-slate-800 bg-[#0f172a] p-6">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Single Stock Deep Dive</h2>
                <p className="mt-1 text-sm text-slate-400">Choose a holding lot to inspect its recent price trend and current position metrics.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(dashboard?.holdings || []).map((holding) => (
                  <button
                    key={holding.id}
                    onClick={() => {
                      setSelectedHoldingId(holding.id);
                      loadDetail(holding.id);
                    }}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                      selectedHoldingId === holding.id
                        ? "border-cyan-400 bg-cyan-500/10 text-cyan-300"
                        : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {holding.symbol} • {new Date(holding.purchaseDate).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}
                  </button>
                ))}
              </div>
            </div>

            {isDetailLoading ? (
              <div className="py-12">
                <Loader text="LOADING STOCK DETAIL" />
              </div>
            ) : detail?.holding ? (
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-slate-800 bg-[#020617] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-cyan-300">{detail.holding.symbol}</p>
                      <h3 className="mt-2 text-2xl font-bold text-white">{detail.holding.companyName || "Selected Holding"}</h3>
                      <p className="mt-1 text-sm text-slate-400">{detail.holding.exchange || detail.holding.notes || "Manual holding details"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-widest text-slate-500">Market Price</p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        {formatMoney(detail.holding.livePrice || 0, detail.holding.currency)}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-500">
                        {detail.holding.pricingSource === "live" ? "Live feed" : "Estimated from cost basis"}
                      </p>
                      <p className={`mt-1 text-sm ${(detail.holding.dayChangePercent || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {(detail.holding.dayChangePercent || 0) >= 0 ? "+" : ""}
                        {(detail.holding.dayChangePercent || 0).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-4">
                      <p className="text-xs uppercase tracking-widest text-slate-500">Shares</p>
                      <p className="mt-2 text-xl font-semibold text-white">{detail.holding.quantity.toLocaleString("en-IN", { maximumFractionDigits: 4 })}</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-4">
                      <p className="text-xs uppercase tracking-widest text-slate-500">Avg Cost</p>
                      <p className="mt-2 text-xl font-semibold text-white">{formatMoney(detail.holding.averageCost, detail.holding.currency)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-4">
                      <p className="text-xs uppercase tracking-widest text-slate-500">Position Value</p>
                      <p className="mt-2 text-xl font-semibold text-white">{formatMoney(detail.holding.currentValue || 0, detail.holding.currency)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-4">
                      <p className="text-xs uppercase tracking-widest text-slate-500">Total P/L</p>
                      <p className={`mt-2 text-xl font-semibold ${(detail.holding.totalGainLoss || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {formatMoney(detail.holding.totalGainLoss || 0, detail.holding.currency)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 h-[320px] w-full min-h-[1px] min-w-[1px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <LineChart data={historyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                        <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(value) => formatTooltipMoney(value, detail.holding?.currency || "USD")}
                          contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "10px" }}
                        />
                        <Line type="monotone" dataKey="close" stroke="#22d3ee" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#020617] p-5">
                  <h3 className="text-lg font-semibold text-white">Price & Volume Context</h3>
                  <p className="mt-1 text-sm text-slate-400">Recent close movement with participation volume.</p>
                  {detail.historySource === "estimated" && (
                    <p className="mt-2 text-xs text-amber-300">Historical chart is using a flat cost-basis baseline until a live chart feed is available.</p>
                  )}
                  <div className="mt-5 h-[320px] w-full min-h-[1px] min-w-[1px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <AreaChart data={historyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="stockCloseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                        <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(value, name) =>
                            String(name) === "volume"
                              ? [Number(value).toLocaleString("en-IN"), "Volume"]
                              : [formatTooltipMoney(value, detail.holding?.currency || "USD"), "Close"]
                          }
                          contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "10px" }}
                        />
                        <Area type="monotone" dataKey="close" stroke="#818cf8" fill="url(#stockCloseGradient)" strokeWidth={2.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-4">
                      <p className="text-xs uppercase tracking-widest text-slate-500">Last Trading Day</p>
                      <p className="mt-2 text-sm font-semibold text-white">{detail.holding.latestTradingDay || "Awaiting feed"}</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-4">
                      <p className="text-xs uppercase tracking-widest text-slate-500">Invested Amount</p>
                      <p className="mt-2 text-sm font-semibold text-white">{formatMoney(detail.holding.investedAmount, detail.holding.currency)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-4">
                      <p className="text-xs uppercase tracking-widest text-slate-500">Return %</p>
                      <p className={`mt-2 text-sm font-semibold ${(detail.holding.totalGainLossPercent || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {(detail.holding.totalGainLossPercent || 0).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-700 bg-[#020617] p-8 text-center text-slate-400">
                Add a holding to unlock the detailed market charts for individual stocks.
              </div>
            )}
          </div>
        </div>
      </div>

      <AddStockHoldingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => loadDashboard(selectedHoldingId)}
      />
    </>
  );
}
