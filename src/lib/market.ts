type AlphaVantageGlobalQuote = {
  "01. symbol"?: string;
  "05. price"?: string;
  "07. latest trading day"?: string;
  "08. previous close"?: string;
  "09. change"?: string;
  "10. change percent"?: string;
};

type AlphaVantageMarket = {
  market_type: string;
  region: string;
  primary_exchanges: string;
  local_open: string;
  local_close: string;
  current_status: string;
  notes: string;
};

type AlphaVantageGoldSpot = {
  nominal?: string;
  timestamp?: string;
  price?: string;
};

import { fetchMLQuote, fetchMLHistory } from './ml';

export interface LiveQuote {
  symbol: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  latestTradingDay: string;
  source?: "alpha-vantage" | "yahoo";
}

export interface MarketStatusSnapshot {
  region: string;
  marketType: string;
  primaryExchanges: string;
  localOpen: string;
  localClose: string;
  currentStatus: string;
  notes: string;
}

export interface BenchmarkSnapshot {
  label: string;
  symbol: string;
  quote: LiveQuote | null;
}

export interface MarketOverviewMetric {
  label: string;
  symbol: string;
  value: number | null;
  currency: string;
  change: number | null;
  changePercent: number | null;
  latest: string | null;
  note?: string;
}

export interface StockHistoryPoint {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query";
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo";
const NSE_NIFTY_50_PAGE_URL = "https://www.nseindia.com/static/products-services/indices-nifty50-index";
const BSE_SENSEX_PAGE_URL = "https://m.bseindia.com/IndicesView.aspx";
const GOLD_API_URL = "https://api.gold-api.com/price/XAU";

interface AlphaVantageEnvelope {
  Note?: string;
  Information?: string;
  ErrorMessage?: string;
  "Global Quote"?: AlphaVantageGlobalQuote;
  markets?: AlphaVantageMarket[];
  nominal?: string;
  timestamp?: string;
  price?: string;
}

interface YahooChartMeta {
  currency?: string;
  symbol?: string;
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  previousClose?: number;
  regularMarketTime?: number;
}

interface YahooChartQuote {
  open?: Array<number | null>;
  high?: Array<number | null>;
  low?: Array<number | null>;
  close?: Array<number | null>;
  volume?: Array<number | null>;
}

interface YahooChartResult {
  meta?: YahooChartMeta;
  timestamp?: number[];
  indicators?: {
    quote?: YahooChartQuote[];
  };
}

interface YahooChartResponse {
  chart?: {
    result?: YahooChartResult[];
  };
}

function parsePercent(value?: string) {
  return Number((value || "0").replace("%", ""));
}

function parseNumber(value?: string | null) {
  if (!value) return null;
  const normalized = value.replace(/,/g, "").trim();
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : null;
}

const alphaVantageCache = new Map<string, { expiresAt: number; data: AlphaVantageEnvelope }>();
const alphaVantageLastSuccessCache = new Map<string, AlphaVantageEnvelope>();
const yahooChartCache = new Map<string, { expiresAt: number; data: YahooChartResponse }>();
let alphaVantageQueue = Promise.resolve();
let alphaVantageNextAllowedAt = 0;
let alphaVantageBlockedUntil = 0;

function getCacheKey(params: Record<string, string>) {
  return Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");
}

function getCacheTtlMs(params: Record<string, string>) {
  switch (params.function) {
    case "GLOBAL_QUOTE":
      return 10 * 60_000;
    case "GOLD_SILVER_SPOT":
      return 30 * 60_000;
    case "MARKET_STATUS":
      return 60 * 60_000;
    case "TIME_SERIES_DAILY":
      return 12 * 60 * 60_000;
    default:
      return 10 * 60_000;
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function dedupe<T>(values: T[]) {
  return [...new Set(values)];
}

function isAlphaVantageQuotaError(message: string) {
  return /rate limit is 25 requests per day|higher API call frequency|premium plans/i.test(message);
}

function blockAlphaVantageForRestOfDay() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);
  alphaVantageBlockedUntil = tomorrow.getTime();
}

function getAlphaVantageStale(cacheKey: string) {
  return alphaVantageLastSuccessCache.get(cacheKey) || null;
}

function getMarketStatusFallback(): MarketStatusSnapshot[] {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  });

  const usFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  });

  const indiaParts = formatter.formatToParts(new Date());
  const usParts = usFormatter.formatToParts(new Date());
  const getValue = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value || "";

  const indiaHour = Number(getValue(indiaParts, "hour"));
  const indiaMinute = Number(getValue(indiaParts, "minute"));
  const indiaWeekday = getValue(indiaParts, "weekday");
  const usHour = Number(getValue(usParts, "hour"));
  const usMinute = Number(getValue(usParts, "minute"));
  const usWeekday = getValue(usParts, "weekday");

  const indiaNowMinutes = indiaHour * 60 + indiaMinute;
  const usNowMinutes = usHour * 60 + usMinute;
  const isIndiaWeekday = !["Sat", "Sun"].includes(indiaWeekday);
  const isUsWeekday = !["Sat", "Sun"].includes(usWeekday);

  return [
    {
      region: "India",
      marketType: "Equity",
      primaryExchanges: "NSE, BSE",
      localOpen: "09:15",
      localClose: "15:30",
      currentStatus: isIndiaWeekday && indiaNowMinutes >= 555 && indiaNowMinutes <= 930 ? "open" : "closed",
      notes: "Fallback trading window based on standard Indian cash-market hours.",
    },
    {
      region: "United States",
      marketType: "Equity",
      primaryExchanges: "NYSE, NASDAQ",
      localOpen: "09:30",
      localClose: "16:00",
      currentStatus: isUsWeekday && usNowMinutes >= 570 && usNowMinutes <= 960 ? "open" : "closed",
      notes: "Fallback trading window based on regular US cash-market hours.",
    },
  ];
}

async function fetchNifty50FromNseOfficial(): Promise<MarketOverviewMetric | null> {
  try {
    const response = await fetch(NSE_NIFTY_50_PAGE_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`NSE page request failed with status ${response.status}`);
    }

    const html = await response.text();
    const valueMatch = html.match(/id="header-nifty-val">([\d,]+\.\d+)</i);
    const changeMatch = html.match(/class="header-change">\s*([+-]?[\d,]+\.\d+)\s*</i);
    const changePercentMatch = html.match(/class="header-perChange">([+-]?[\d,]+\.\d+)</i);
    const latestMatch = html.match(/class="header-tradeDate[^"]*">([^<]+)</i);

    const value = parseNumber(valueMatch?.[1]);
    if (value === null) {
      return null;
    }

    return {
      label: "Nifty 50",
      symbol: "NIFTY 50",
      value,
      currency: "INR",
      change: parseNumber(changeMatch?.[1]),
      changePercent: parseNumber(changePercentMatch?.[1]),
      latest: latestMatch?.[1]?.trim() || null,
      note: "Live index snapshot from the official NSE page.",
    };
  } catch (error) {
    console.error("Failed to fetch Nifty 50 from official NSE page:", error);
    return null;
  }
}

async function fetchSensexFromBseOfficial(): Promise<MarketOverviewMetric | null> {
  try {
    const response = await fetch(BSE_SENSEX_PAGE_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`BSE page request failed with status ${response.status}`);
    }

    const html = await response.text();
    const valueMatch = html.match(/id="UcHeaderMenu1_sensexLtp"[^>]*>([\d,]+\.\d+)</i);
    const changeMatch = html.match(/id="UcHeaderMenu1_sensexChange"[^>]*>([+-]?[\d,]+\.\d+)</i);
    const changePercentMatch = html.match(/id="UcHeaderMenu1_sensexPerChange"[^>]*>([+-]?[\d,]+\.\d+)\s*%/i);

    const value = parseNumber(valueMatch?.[1]);
    if (value === null) {
      return null;
    }

    return {
      label: "Sensex",
      symbol: "SENSEX",
      value,
      currency: "INR",
      change: parseNumber(changeMatch?.[1]),
      changePercent: parseNumber(changePercentMatch?.[1]),
      latest: null,
      note: "Live index snapshot from the official BSE page.",
    };
  } catch (error) {
    console.error("Failed to fetch Sensex from official BSE page:", error);
    return null;
  }
}

async function fetchGoldSpotFallback(): Promise<MarketOverviewMetric | null> {
  try {
    const response = await fetch(GOLD_API_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Gold API request failed with status ${response.status}`);
    }

    const data = (await response.json()) as {
      price?: number;
      updatedAt?: string;
      currency?: string;
    };

    if (typeof data.price !== "number") {
      return null;
    }

    return {
      label: "Gold Spot",
      symbol: "XAU",
      value: data.price,
      currency: data.currency || "USD",
      change: null,
      changePercent: null,
      latest: data.updatedAt || null,
      note: "Fallback live gold spot quote.",
    };
  } catch (error) {
    console.error("Failed to fetch fallback gold spot price:", error);
    return null;
  }
}

async function fetchAlphaVantage(params: Record<string, string>) {
  const cacheKey = getCacheKey(params);
  const cached = alphaVantageCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  if (alphaVantageBlockedUntil > Date.now()) {
    const stale = getAlphaVantageStale(cacheKey);
    if (stale) {
      return stale;
    }

    throw new Error("Alpha Vantage daily quota is exhausted for today");
  }

  const requestTask = async () => {
    try {
      const now = Date.now();
      const waitMs = Math.max(0, alphaVantageNextAllowedAt - now);
      if (waitMs > 0) {
        await wait(waitMs);
      }

      alphaVantageNextAllowedAt = Date.now() + 1200;

      const search = new URLSearchParams({
        ...params,
        apikey: ALPHA_VANTAGE_API_KEY,
      });

      const response = await fetch(`${ALPHA_VANTAGE_BASE_URL}?${search.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Alpha Vantage request failed with status ${response.status}`);
      }

      const data = (await response.json()) as AlphaVantageEnvelope;

      if (data.ErrorMessage) {
        throw new Error(data.ErrorMessage);
      }

      if (data.Note || data.Information) {
        throw new Error(data.Note || data.Information || "Alpha Vantage rate limit hit");
      }

      alphaVantageCache.set(cacheKey, {
        expiresAt: Date.now() + getCacheTtlMs(params),
        data,
      });
      alphaVantageLastSuccessCache.set(cacheKey, data);

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (isAlphaVantageQuotaError(message)) {
        blockAlphaVantageForRestOfDay();
        const stale = getAlphaVantageStale(cacheKey);
        if (stale) {
          return stale;
        }
      }

      throw error;
    }
  };

  const scheduledTask = alphaVantageQueue.then(requestTask, requestTask);
  alphaVantageQueue = scheduledTask.then(() => undefined, () => undefined);
  return scheduledTask;
}

function normalizeYahooSymbol(symbol: string) {
  const normalized = symbol.trim().toUpperCase();
  if (normalized.endsWith(".NSE")) return normalized.replace(/\.NSE$/i, ".NS");
  if (normalized.endsWith(".BSE")) return normalized.replace(/\.BSE$/i, ".BO");
  return normalized;
}

function getYahooSymbolCandidates(symbol: string, exchange?: string | null) {
  const normalized = normalizeYahooSymbol(symbol);
  const exchangeUpper = exchange?.trim().toUpperCase() || "";
  const base = normalized.replace(/\.(NS|BO|NSE|BSE|US)$/i, "");
  const candidates = [normalized];

  if (!/\./.test(normalized)) {
    if (exchangeUpper.includes("NSE")) {
      candidates.push(`${base}.NS`);
    } else if (exchangeUpper.includes("BSE")) {
      candidates.push(`${base}.BO`);
    } else if (
      exchangeUpper.includes("NASDAQ") ||
      exchangeUpper.includes("NYSE") ||
      exchangeUpper.includes("AMEX") ||
      exchangeUpper.includes("US")
    ) {
      candidates.push(base);
    } else {
      candidates.push(base, `${base}.NS`, `${base}.BO`);
    }
  } else {
    candidates.push(base);
  }

  return dedupe(candidates.filter(Boolean));
}

async function fetchYahooQuote(symbol: string, exchange?: string | null): Promise<LiveQuote | null> {
  const candidates = getYahooSymbolCandidates(symbol, exchange);

  for (const candidate of candidates) {
    try {
      const quote = await fetchMLQuote(candidate);
      if (!quote) continue;

      return {
        ...quote,
        source: "yahoo-ml-proxy",
      };
    } catch (e) {
      console.error(`fetchMLQuote failed for ${candidate}:`, e);
      continue;
    }
  }

  return null;
}

async function fetchYahooHistory(symbol: string, exchange?: string | null): Promise<StockHistoryPoint[]> {
  const candidates = getYahooSymbolCandidates(symbol, exchange);

  for (const candidate of candidates) {
    try {
      const result = await fetchMLHistory(candidate);

      if (!result || !result.length) continue;
      
      return result;
    } catch (e) {
      console.error(`fetchMLHistory failed for ${candidate}:`, e);
      continue;
    }
  }

  return [];
}

export async function fetchStockQuote(symbol: string, exchange?: string | null): Promise<LiveQuote | null> {
  try {
    const data = await fetchAlphaVantage({
      function: "GLOBAL_QUOTE",
      symbol,
    });

    const quote = data["Global Quote"];
    if (!quote?.["05. price"]) {
      return fetchYahooQuote(symbol, exchange);
    }

    return {
      symbol: quote["01. symbol"] || symbol,
      price: Number(quote["05. price"] || 0),
      previousClose: Number(quote["08. previous close"] || 0),
      change: Number(quote["09. change"] || 0),
      changePercent: parsePercent(quote["10. change percent"]),
      latestTradingDay: quote["07. latest trading day"] || "",
      source: "alpha-vantage",
    };
  } catch (error) {
    console.error(`Failed to fetch live quote for ${symbol}:`, error);
  }

  return fetchYahooQuote(symbol, exchange);
}

export async function fetchMarketStatus(): Promise<MarketStatusSnapshot[]> {
  try {
    const data = await fetchAlphaVantage({
      function: "MARKET_STATUS",
    });

    return (data.markets || []).map((market) => ({
      region: market.region,
      marketType: market.market_type,
      primaryExchanges: market.primary_exchanges,
      localOpen: market.local_open,
      localClose: market.local_close,
      currentStatus: market.current_status,
      notes: market.notes,
    }));
  } catch (error) {
    console.error("Failed to fetch market status:", error);
    return getMarketStatusFallback();
  }
}

export async function fetchBenchmarkQuotes(): Promise<BenchmarkSnapshot[]> {
  const benchmarks = [
    { label: "S&P 500", symbol: "SPY" },
    { label: "Nasdaq 100", symbol: "QQQ" },
    { label: "Dow Jones", symbol: "DIA" },
  ];

  const snapshots: BenchmarkSnapshot[] = [];

  for (const benchmark of benchmarks) {
    snapshots.push({
      ...benchmark,
      quote: await fetchStockQuote(benchmark.symbol),
    });
  }

  return snapshots;
}

export async function fetchStockHistory(symbol: string, exchange?: string | null): Promise<StockHistoryPoint[]> {
  try {
    const data = await fetchAlphaVantage({
      function: "TIME_SERIES_DAILY",
      symbol,
      outputsize: "compact",
    });

    const timeSeries = (data as Record<string, unknown>)["Time Series (Daily)"] as
      | Record<string, Record<string, string>>
      | undefined;

    if (!timeSeries) {
      return fetchYahooHistory(symbol, exchange);
    }

    return Object.entries(timeSeries)
      .map(([date, values]) => ({
        date,
        open: Number(values["1. open"] || 0),
        high: Number(values["2. high"] || 0),
        low: Number(values["3. low"] || 0),
        close: Number(values["4. close"] || 0),
        volume: Number(values["5. volume"] || 0),
      }))
      .sort((left, right) => left.date.localeCompare(right.date))
      .slice(-30);
  } catch (error) {
    console.error(`Failed to fetch historical series for ${symbol}:`, error);
  }

  return fetchYahooHistory(symbol, exchange);
}

export async function fetchMarketOverview(): Promise<MarketOverviewMetric[]> {
  const [niftyOfficial, sensexOfficial, niftyQuote, sensexQuote] = await Promise.all([
    fetchNifty50FromNseOfficial(),
    fetchSensexFromBseOfficial(),
    fetchStockQuote("NIFTYBEES.BSE"),
    fetchStockQuote("SENSEXBEES.BSE"),
  ]);

  const overview: MarketOverviewMetric[] = [
    niftyOfficial || {
      label: "Nifty 50",
      symbol: "NIFTYBEES.BSE",
      value: niftyQuote?.price ?? null,
      currency: "INR",
      change: niftyQuote?.change ?? null,
      changePercent: niftyQuote?.changePercent ?? null,
      latest: niftyQuote?.latestTradingDay ?? null,
      note: "Displayed using the Alpha Vantage-tracked Nifty 50 ETF proxy.",
    },
    sensexOfficial || {
      label: "Sensex",
      symbol: "SENSEXBEES.BSE",
      value: sensexQuote?.price ?? null,
      currency: "INR",
      change: sensexQuote?.change ?? null,
      changePercent: sensexQuote?.changePercent ?? null,
      latest: sensexQuote?.latestTradingDay ?? null,
      note: "Displayed using the Alpha Vantage-tracked Sensex ETF proxy.",
    },
  ];

  try {
    const goldData = (await fetchAlphaVantage({
      function: "GOLD_SILVER_SPOT",
      symbol: "GOLD",
    })) as AlphaVantageEnvelope & AlphaVantageGoldSpot;

    overview.push({
      label: "Gold Spot",
      symbol: goldData.nominal || "XAUUSD",
      value: goldData.price ? Number(goldData.price) : null,
      currency: "USD",
      change: null,
      changePercent: null,
      latest: goldData.timestamp || null,
      note: "Live XAU/USD spot price from Alpha Vantage commodities feed.",
    });
  } catch (error) {
    console.error("Failed to fetch gold spot price:", error);
    const fallbackGold = await fetchGoldSpotFallback();
    overview.push(
      fallbackGold || {
        label: "Gold Spot",
        symbol: "XAUUSD",
        value: null,
        currency: "USD",
        change: null,
        changePercent: null,
        latest: null,
        note: "Gold spot unavailable right now.",
      }
    );
  }

  return overview;
}

export function isAlphaVantageKeyConfigured() {
  return Boolean(process.env.ALPHA_VANTAGE_API_KEY);
}
