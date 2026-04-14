"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useMemo } from "react";

export function CategoryChart({ transactions }: { transactions: any[] }) {
  const data = useMemo(() => {
    const expensesByCategory: Record<string, { value: number; color: string }> = {};

    transactions.forEach((tx) => {
      const catName = tx.category?.name || "Uncategorized";
      const catColor = tx.category?.color || "#94a3b8";
      const amt = Number(tx.amount);

      if (expensesByCategory[catName]) {
        expensesByCategory[catName].value += amt;
      } else {
        expensesByCategory[catName] = { value: amt, color: catColor };
      }
    });

    return Object.entries(expensesByCategory).map(([name, { value, color }]) => ({
      name,
      value,
      color,
    })).sort((a, b) => b.value - a.value); // Sort biggest expenses first
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
      <h3 className="mb-4 text-base font-semibold text-slate-200">Expense Distribution</h3>
      <div className="h-[300px] w-full min-h-[1px] min-w-[1px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px" }}
              itemStyle={{ color: "#f8fafc" }}
            />
            <Legend 
               verticalAlign="bottom" 
               height={36} 
               iconType="circle"
               formatter={(value) => <span className="text-slate-400 text-sm">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
