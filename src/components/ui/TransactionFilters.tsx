"use client";

import { useState } from "react";

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  categoryId: string;
  dateFrom: string;
  dateTo: string;
}

export function TransactionFilters({ categories, onFilterChange }: Props) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    categoryId: "",
    dateFrom: "",
    dateTo: "",
  });

  const updateFilter = (key: keyof FilterState, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFilterChange(next);
  };

  const clearAll = () => {
    const cleared: FilterState = { search: "", categoryId: "", dateFrom: "", dateTo: "" };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters = filters.search || filters.categoryId || filters.dateFrom || filters.dateTo;

  return (
    <div className="mb-6 rounded-xl border border-slate-800 bg-[#0f172a] p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search merchant..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-[#020617] pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Category */}
        <select
          value={filters.categoryId}
          onChange={(e) => updateFilter("categoryId", e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-[#020617] px-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {/* Date From */}
        <div className="relative">
          <label className="absolute -top-2 left-3 text-[10px] text-slate-500 bg-[#0f172a] px-1">From</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilter("dateFrom", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-[#020617] px-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Date To */}
        <div className="relative">
          <label className="absolute -top-2 left-3 text-[10px] text-slate-500 bg-[#0f172a] px-1">To</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => updateFilter("dateTo", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-[#020617] px-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-cyan-400 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear all filters
        </button>
      )}
    </div>
  );
}
