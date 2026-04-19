import { db } from "@/db";
import { transactions, categories, budgets } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

/**
 * Generates a textual summary of the user's financial status to be used as context for the AI.
 * This includes current month spending, categories, and fraud alerts.
 */
export async function getFinancialContext(userId: string) {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // 1. Fetch categories and budgets
    const [userCategories, userBudgets] = await Promise.all([
      db.query.categories.findMany({ where: eq(categories.userId, userId) }),
      db.query.budgets.findMany({ where: eq(budgets.userId, userId) }),
    ]);

    const categoryMap = new Map(userCategories.map((category) => [category.id, category]));

    // 2. Fetch current month transactions and attach category data manually.
    // We avoid Drizzle `with: { category: true }` here because relations are not declared in schema.ts.
    const monthTransactions = await db.query.transactions.findMany({
      where: and(
        eq(transactions.userId, userId),
        gte(transactions.date, firstDayOfMonth),
        lte(transactions.date, lastDayOfMonth)
      ),
    });

    // 3. Calculate Insights
    const totalSpent = monthTransactions.reduce((acc, tx) => acc + Number(tx.amount), 0);
    const fraudAlerts = monthTransactions.filter(tx => tx.isFraud);
    
    const categoryBreakdown = monthTransactions.reduce((acc, tx) => {
      const catName = categoryMap.get(tx.categoryId)?.name || "Uncategorized";
      acc[catName] = (acc[catName] || 0) + Number(tx.amount);
      return acc;
    }, {} as Record<string, number>);

    // Find top category
    const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];

    // 4. Construct the prompt context
    let context = `Current Month: ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}\n`;
    context += `- Total Monthly Spending: ₹${totalSpent.toLocaleString('en-IN')}\n`;
    
    if (topCategory) {
      context += `- Top Spending Category: ${topCategory[0]} (₹${topCategory[1].toLocaleString('en-IN')})\n`;
    }

    if (fraudAlerts.length > 0) {
      context += `- ACTIVE FRAUD ALERTS: ${fraudAlerts.length} detected recently.\n`;
      fraudAlerts.slice(0, 3).forEach(alert => {
        context += `  * Suspicious ${alert.merchant || 'transaction'} for ₹${Number(alert.amount).toLocaleString('en-IN')} on ${alert.date.toLocaleDateString()}\n`;
      });
    } else {
      context += `- Fraud Status: No suspicious activities detected.\n`;
    }

    if (userBudgets.length > 0) {
      context += `- Budget Status:\n`;
      userBudgets.forEach(b => {
        const cat = userCategories.find(c => c.id === b.categoryId);
        const spentInCat = categoryBreakdown[cat?.name || ""] || 0;
        const limit = Number(b.monthlyLimit);
        const percent = ((spentInCat / limit) * 100).toFixed(0);
        context += `  * ${cat?.name || 'Category'}: ${percent}% of ₹${limit.toLocaleString('en-IN')} limit used.\n`;
      });
    }

    return context;
  } catch (error) {
    console.error("Error fetching financial context for AI:", error);
    return "Unable to fetch current financial data.";
  }
}
