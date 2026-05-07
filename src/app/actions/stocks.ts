"use server";

import { db } from "@/db";
import { stockHoldings } from "@/db/schema";
import {
  fetchBenchmarkQuotes,
  fetchMarketOverview,
  fetchMarketStatus,
  fetchStockHistory,
  fetchStockQuote,
  isAlphaVantageKeyConfigured,
  type BenchmarkSnapshot,
  type MarketOverviewMetric,
  type MarketStatusSnapshot,
  type StockHistoryPoint,
} from "@/lib/market";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { predictStockPrice, type StockForecast } from "@/lib/ml";

interface CreateStockHoldingInput {
  symbol: string;
  companyName?: string;
  exchange?: string;
  quantity: number;
  investedAmount: number;
  currency: string;
  purchaseDate: string;
  notes?: string;
}

export interface StockHoldingView {
  id: string;
  symbol: string;
  companyName: string | null;
  exchange: string | null;
  quantity: number;
  investedAmount: number;
  currency: string;
  purchaseDate: string;
  notes: string | null;
  averageCost: number;
  livePrice: number | null;
  currentValue: number | null;
  totalGainLoss: number | null;
  totalGainLossPercent: number | null;
  dayChange: number | null;
  dayChangePercent: number | null;
  latestTradingDay: string | null;
  pricingSource: "live" | "estimated";
}

export interface StockDashboardView {
  apiKeyConfigured: boolean;
  holdings: StockHoldingView[];
  marketStatus: MarketStatusSnapshot[];
  benchmarks: BenchmarkSnapshot[];
  marketOverview: MarketOverviewMetric[];
  estimatedHoldingsCount: number;
  summary: {
    totalInvested: number;
    currentValue: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    totalDayChange: number;
  };
}

export interface StockDetailView {
  holding: StockHoldingView | null;
  history: StockHistoryPoint[];
  historySource?: "live" | "estimated";
}

interface StockDashboardDataOptions {
  includeBenchmarks?: boolean;
}

async function getUserId() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
}

function toNumber(value: string | number) {
  return Number(value);
}

function createEstimatedHistory(price: number, endDate?: string) {
  const anchor = endDate ? new Date(endDate) : new Date();
  const points: StockHistoryPoint[] = [];

  for (let offset = 29; offset >= 0; offset -= 1) {
    const date = new Date(anchor);
    date.setDate(anchor.getDate() - offset);
    const isoDate = date.toISOString().slice(0, 10);

    points.push({
      date: isoDate,
      open: price,
      high: price,
      low: price,
      close: price,
      volume: 0,
    });
  }

  return points;
}

export async function getStockDashboardData(options: StockDashboardDataOptions = {}) {
  try {
    const userId = await getUserId();
    const includeBenchmarks = options.includeBenchmarks ?? false;

    const holdings = await db
      .select()
      .from(stockHoldings)
      .where(eq(stockHoldings.userId, userId))
      .orderBy(desc(stockHoldings.createdAt));

    const [marketStatus, marketOverview, liveQuotes, benchmarks] = await Promise.all([
      fetchMarketStatus(),
      fetchMarketOverview(),
      Promise.all(holdings.map((holding) => fetchStockQuote(holding.symbol, holding.exchange))),
      includeBenchmarks ? fetchBenchmarkQuotes() : Promise.resolve([]),
    ]);

    const holdingsWithLiveData: StockHoldingView[] = holdings.map((holding, index) => {
      const quantity = toNumber(holding.quantity);
      const investedAmount = toNumber(holding.investedAmount);
      const averageCost = quantity > 0 ? investedAmount / quantity : 0;
      const quote = liveQuotes[index];
      const resolvedPrice = quote?.price ?? averageCost;
      const hasLiveQuote = Boolean(quote);
      const currentValue = resolvedPrice * quantity;
      const totalGainLoss = currentValue - investedAmount;
      const totalGainLossPercent = investedAmount > 0 ? (totalGainLoss / investedAmount) * 100 : 0;
      const dayChange = hasLiveQuote ? (quote?.change || 0) * quantity : 0;

      return {
        id: holding.id,
        symbol: holding.symbol,
        companyName: holding.companyName,
        exchange: holding.exchange,
        quantity,
        investedAmount,
        currency: holding.currency,
        purchaseDate: holding.purchaseDate.toISOString(),
        notes: holding.notes,
        averageCost,
        livePrice: resolvedPrice,
        currentValue,
        totalGainLoss,
        totalGainLossPercent,
        dayChange,
        dayChangePercent: hasLiveQuote ? quote?.changePercent ?? 0 : 0,
        latestTradingDay: quote?.latestTradingDay || holding.purchaseDate.toISOString().slice(0, 10),
        pricingSource: hasLiveQuote ? "live" : "estimated",
      };
    });

    const totalInvested = holdingsWithLiveData.reduce((sum, holding) => sum + holding.investedAmount, 0);
    const currentValue = holdingsWithLiveData.reduce((sum, holding) => sum + (holding.currentValue ?? 0), 0);
    const totalDayChange = holdingsWithLiveData.reduce((sum, holding) => sum + (holding.dayChange ?? 0), 0);
    const totalGainLoss = currentValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
    const estimatedHoldingsCount = holdingsWithLiveData.filter((holding) => holding.pricingSource === "estimated").length;

    const data: StockDashboardView = {
      apiKeyConfigured: isAlphaVantageKeyConfigured(),
      holdings: holdingsWithLiveData,
      marketStatus,
      benchmarks: benchmarks as BenchmarkSnapshot[],
      marketOverview,
      estimatedHoldingsCount,
      summary: {
        totalInvested,
        currentValue,
        totalGainLoss,
        totalGainLossPercent,
        totalDayChange,
      },
    };

    return { success: true, data };
  } catch (error) {
    console.error("Failed to load stock dashboard data:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function createStockHolding(input: CreateStockHoldingInput) {
  try {
    const userId = await getUserId();

    const [created] = await db
      .insert(stockHoldings)
      .values({
        userId,
        symbol: input.symbol.trim().toUpperCase(),
        companyName: input.companyName?.trim() || null,
        exchange: input.exchange?.trim() || null,
        quantity: input.quantity.toString(),
        investedAmount: input.investedAmount.toFixed(2),
        currency: input.currency.trim().toUpperCase(),
        purchaseDate: new Date(input.purchaseDate),
        notes: input.notes?.trim() || null,
      })
      .returning();

    pusherServer.trigger(`user-${userId}`, "update_data", { type: "stock" }).catch(console.error);

    return { success: true, data: created };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function deleteStockHolding(holdingId: string) {
  try {
    const userId = await getUserId();
    
    // Efficient single-query delete with ownership check
    const result = await db.delete(stockHoldings)
      .where(and(eq(stockHoldings.id, holdingId), eq(stockHoldings.userId, userId)))
      .returning();

    if (result.length === 0) {
      return { success: false, error: "Holding not found or unauthorized" };
    }

    pusherServer.trigger(`user-${userId}`, "update_data", { type: "stock" }).catch(console.error);

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function getStockDetail(holdingId: string) {
  try {
    const userId = await getUserId();

    const [holding] = await db
      .select()
      .from(stockHoldings)
      .where(and(eq(stockHoldings.userId, userId), eq(stockHoldings.id, holdingId)));

    if (!holding) {
      return { success: false, error: "Stock holding not found" };
    }

    const [quote, history] = await Promise.all([
      fetchStockQuote(holding.symbol, holding.exchange),
      fetchStockHistory(holding.symbol, holding.exchange),
    ]);

    const quantity = toNumber(holding.quantity);
    const investedAmount = toNumber(holding.investedAmount);
    const averageCost = quantity > 0 ? investedAmount / quantity : 0;
    const resolvedPrice = quote?.price ?? averageCost;
    const hasLiveQuote = Boolean(quote);
    const currentValue = resolvedPrice * quantity;
    const totalGainLoss = currentValue - investedAmount;
    const totalGainLossPercent = investedAmount > 0 ? (totalGainLoss / investedAmount) * 100 : 0;
    const dayChange = hasLiveQuote ? (quote?.change || 0) * quantity : 0;
    const detailHistory = history.length
      ? history
      : createEstimatedHistory(resolvedPrice, holding.purchaseDate.toISOString().slice(0, 10));

    const detail: StockDetailView = {
      holding: {
        id: holding.id,
        symbol: holding.symbol,
        companyName: holding.companyName,
        exchange: holding.exchange,
        quantity,
        investedAmount,
        currency: holding.currency,
        purchaseDate: holding.purchaseDate.toISOString(),
        notes: holding.notes,
        averageCost,
        livePrice: resolvedPrice,
        currentValue,
        totalGainLoss,
        totalGainLossPercent,
        dayChange,
        dayChangePercent: hasLiveQuote ? quote?.changePercent ?? 0 : 0,
        latestTradingDay: quote?.latestTradingDay || holding.purchaseDate.toISOString().slice(0, 10),
        pricingSource: hasLiveQuote ? "live" : "estimated",
      },
      history: detailHistory,
      historySource: history.length ? "live" : "estimated",
    };

    return { success: true, data: detail };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function getStockForecastAction(symbol: string, days: number = 7) {
  try {
    const result = await predictStockPrice(symbol, days);
    return result;
  } catch (error) {
    console.error("Action error:", error);
    return null;
  }
}
