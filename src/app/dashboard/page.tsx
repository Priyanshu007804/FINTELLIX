"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

import { getTransactions } from "@/app/actions/transactions";
import { getCategories, createCategory, deleteDuplicateCategories, createCategories } from "@/app/actions/categories";
import { getBudgets } from "@/app/actions/budgets";
import { getStockDashboardData, type StockDashboardView } from "@/app/actions/stocks";
import { TransactionsTable } from "@/components/ui/TransactionsTable";
import { AddTransactionModal } from "@/components/ui/AddTransactionModal";
import { Loader } from "@/components/ui/Loader";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { BudgetTracker } from "@/components/dashboard/BudgetTracker";
import { FraudAlertBanner } from "@/components/dashboard/FraudAlertBanner";
import { StocksSection } from "@/components/dashboard/StocksSection";
import { TransactionFilters, type FilterState } from "@/components/ui/TransactionFilters";
import { exportAsCSV, exportAsPDF } from "@/lib/export";
import { AskAI } from "@/components/dashboard/AskAI";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [budgetsList, setBudgetsList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [filters, setFilters] = useState<FilterState>({ search: "", categoryId: "", dateFrom: "", dateTo: "" });
  const [exportOpen, setExportOpen] = useState(false);
  const [fraudAlert, setFraudAlert] = useState<any>(null);
  const [stockDashboard, setStockDashboard] = useState<StockDashboardView | null>(null);
  const seedingRef = useRef(false);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const [txRes, catRes, budgetRes] = await Promise.all([
        getTransactions(),
        getCategories(),
        getBudgets(),
      ]);

      // Load stocks in parallel without blocking the main dashboard render
      getStockDashboardData().then(stockRes => {
        if (stockRes.success && stockRes.data) {
          setStockDashboard(stockRes.data);
        }
      }).catch(console.error);

      if (catRes.success) {
        let fetchedCategories = catRes.data || [];
        
        if (!seedingRef.current) {
          seedingRef.current = true;
          // First, clean up any existing duplicates
          await deleteDuplicateCategories();
          
          const defaultCategories = [
          { name: "Food & Dining", color: "#fbbf24" },
          { name: "Shopping", color: "#a78bfa" },
          { name: "Travel", color: "#34d399" },
          { name: "Housing", color: "#60a5fa" },
          { name: "Transportation", color: "#f87171" },
          { name: "Utilities", color: "#fb923c" },
          { name: "Entertainment", color: "#f472b6" },
          { name: "Healthcare", color: "#2dd4bf" },
          { name: "Medical", color: "#ef4444" },
          { name: "Education", color: "#8b5cf6" },
          { name: "Groceries", color: "#10b981" },
          { name: "Investment", color: "#f59e0b" },
          { name: "Personal Care", color: "#ec4899" },
          { name: "Subscriptions", color: "#6366f1" },
          { name: "Salary", color: "#4ade80" },
          { name: "Transfer", color: "#94a3b8" }
        ];

          const missingCategories = defaultCategories.filter(
            defaultCat => !fetchedCategories.some((c: any) => c.name === defaultCat.name)
          );

          if (missingCategories.length > 0) {
             await createCategories(missingCategories);
          }
        
        }
        
        // Refresh categories list after cleanup/seeding
        const finalCats = await getCategories();
        if (finalCats.success) {
          setCategories(finalCats.data || []);
        }
        seedingRef.current = false;
      }
      
      if (txRes.success && txRes.data) {
        setTransactions(txRes.data);
      }
      if (budgetRes.success && budgetRes.data) {
        setBudgetsList(budgetRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    // Only load if bounded to session fetch success
    if (!isPending && session?.user?.id) {
       loadData();
    }
  }, [isPending, session?.user?.id]);

  // Real-time synchronization
  useEffect(() => {
    if (!session?.user?.id) return;

    let isActive = true;
    let pusherClient: { unsubscribe: (channelName: string) => void } | null = null;
    let channelName = "";

    import("@/lib/pusher").then(({ getPusherClient }) => {
      if (!isActive) return;

      const pusher = getPusherClient();
      if (!pusher) return;

      pusherClient = pusher;
      channelName = `user-${session.user.id}`;
      const channel = pusher.subscribe(channelName);

      channel.bind("update_data", (data: any) => {
        console.log("Real-time update received:", data);
        loadData();
      });
    });

    return () => {
      isActive = false;
      if (pusherClient && channelName) {
        pusherClient.unsubscribe(channelName);
      }
    };
  }, [session?.user?.id]);

  useEffect(() => {
    // Dismiss the banner automatically if the transaction causing it is deleted
    if (fraudAlert && !transactions.find(tx => tx.id === fraudAlert.id)) {
      setFraudAlert(null);
    }
  }, [transactions, fraudAlert]);

  const handleSignout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  if (isPending || isLoadingData) {
    return <Loader fullScreen text="SYNCING DATA" />;
  }

  // Derived Stats
  const totalExpenses = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const fraudAlerts = transactions.filter(tx => tx.isFraud).length;

  // Client-side filtering
  const filteredTransactions = transactions.filter((tx) => {
    // Search by merchant name
    if (filters.search) {
      const term = filters.search.toLowerCase();
      const merchant = (tx.merchant || "").toLowerCase();
      const desc = (tx.description || "").toLowerCase();
      if (!merchant.includes(term) && !desc.includes(term)) return false;
    }
    // Filter by category
    if (filters.categoryId) {
      const txCatId = tx.categoryId || tx.category?.id;
      if (txCatId !== filters.categoryId) return false;
    }
    // Date range
    const txDate = new Date(tx.date);
    if (filters.dateFrom && txDate < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && txDate > new Date(filters.dateTo + "T23:59:59")) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <Image src="/Logo.jpeg" alt="Fintellix Logo" width={80} height={80} className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-contain" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Fintellix</h1>
              <p className="text-slate-400 mt-1 text-sm md:text-base">
                Welcome back, <br className="md:hidden" /><span className="font-medium text-cyan-400">{session?.user?.name || "User"}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={handleSignout} 
            className="w-full md:w-auto rounded-lg border border-slate-700 bg-[#0f172a] px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
             Sign Out
          </button>
        </header>

        <FraudAlertBanner transaction={fraudAlert} onDismiss={() => setFraudAlert(null)} />

        <div className="grid gap-6 md:grid-cols-3 mb-8">
           <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-sm">
              <h2 className="text-sm font-medium text-slate-400">Total Expenses (All Time)</h2>
              <p className="mt-2 text-4xl font-bold tracking-tight">INR {totalExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
           </div>
           <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-sm">
              <h2 className="text-sm font-medium text-slate-400">Total Transactions</h2>
              <p className="mt-2 text-4xl font-bold tracking-tight">{transactions.length}</p>
           </div>
           <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-6 shadow-sm">
              <h2 className="text-sm font-medium text-red-400">Fraud Alerts</h2>
              <p className="mt-2 text-4xl font-bold tracking-tight text-red-500">{fraudAlerts}</p>
           </div>
        </div>

        <div className="grid gap-6 md:grid-cols-5 mb-8">
           <div className="md:col-span-3">
              <SpendingChart transactions={transactions} />
           </div>
           <div className="md:col-span-2">
              <CategoryChart transactions={transactions} />
           </div>
        </div>

        <div className="mb-8">
           <BudgetTracker categories={categories} budgets={budgetsList} transactions={transactions} onUpdate={loadData} />
        </div>

        <StocksSection data={stockDashboard} onRefresh={loadData} />

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <h2 className="text-xl font-semibold">Transaction History</h2>
           <div className="flex items-center gap-3">
             {/* Export Dropdown */}
             <div className="relative">
               <button 
                 onClick={() => setExportOpen(!exportOpen)}
                 className="flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0f172a] px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                 Export
               </button>
               {exportOpen && (
                 <div className="absolute right-0 mt-2 w-44 rounded-lg border border-slate-700 bg-[#0f172a] py-1 shadow-xl z-50">
                   <button
                     onClick={() => { exportAsCSV(filteredTransactions); setExportOpen(false); }}
                     className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition"
                   >
                     <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                     Export as CSV
                   </button>
                   <button
                     onClick={() => { exportAsPDF(filteredTransactions); setExportOpen(false); }}
                     className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition"
                   >
                     <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                     Export as PDF
                   </button>
                 </div>
               )}
             </div>

             <button 
               onClick={() => setIsModalOpen(true)}
               className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-[#020617] transition hover:bg-cyan-400"
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                Add Expense
             </button>
           </div>
        </div>

        <TransactionFilters categories={categories} onFilterChange={setFilters} />

        {filteredTransactions.length !== transactions.length && (
          <p className="mb-3 text-xs text-slate-500">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </p>
        )}

        <TransactionsTable transactions={filteredTransactions} onRefresh={loadData} />

      </motion.div>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        categories={categories}
        onSuccess={(txData?: any) => {
          loadData();
          // Show fraud alert if ML flagged this transaction
          if (txData?.isFraud) {
            setFraudAlert(txData);
          }
        }}
      />
      
      {/* AI Assistant */}
      <AskAI />
    </div>
  );
}
