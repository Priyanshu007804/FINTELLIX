"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Helper to group transactions by last 30 days
export function SpendingChart({ transactions }: { transactions: any[] }) {
  const data = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    // Create a map of dates (YYYY-MM-DD) -> total amount
    const dailyTotals: Record<string, number> = {};
    
    // We'll calculate the last 14 days for a cleaner chart, or just group all dates
    // For simplicity, let's just group whatever data exists by date and sort it.
    transactions.forEach(tx => {
      const dateStr = new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const amt = Number(tx.amount);
      if (dailyTotals[dateStr]) {
        dailyTotals[dateStr] += amt;
      } else {
        dailyTotals[dateStr] = amt;
      }
    });

    const chartData = Object.entries(dailyTotals).map(([date, total]) => ({
      date,
      total
    }));

    // Optional: Normally we'd fill in missing dates with 0, but this is a simple impl
    return chartData;
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-slate-800 bg-[#0f172a]">
        <p className="text-sm text-slate-500">No data available for chart</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-6 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-slate-200">Spending Overview</h3>
      <div className="h-[300px] w-full min-h-[1px] min-w-[1px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip 
               formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 'Spent']}
               contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px" }}
               itemStyle={{ color: "#0ea5e9" }}
            />
            <Area 
              type="monotone" 
              dataKey="total" 
              stroke="#0ea5e9" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTotal)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
