"use server";

import { db } from "@/db";
import { budgets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

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

export async function getBudgets() {
  try {
    const userId = await getUserId();
    const result = await db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, userId));
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function upsertBudget(categoryId: string, monthlyLimit: number) {
  try {
    const userId = await getUserId();

    // Check if budget already exists for this category
    const existing = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.userId, userId), eq(budgets.categoryId, categoryId)));

    if (existing.length > 0) {
      // Update
      const [updated] = await db
        .update(budgets)
        .set({ monthlyLimit: monthlyLimit.toString(), updatedAt: new Date() })
        .where(eq(budgets.id, existing[0].id))
        .returning();
        
      pusherServer.trigger(`user-${userId}`, "update_data", { type: "budget" }).catch(console.error);

      return { success: true, data: updated };
    } else {
      // Insert
      const [created] = await db
        .insert(budgets)
        .values({
          categoryId,
          userId,
          monthlyLimit: monthlyLimit.toString(),
        })
        .returning();
        
      pusherServer.trigger(`user-${userId}`, "update_data", { type: "budget" }).catch(console.error);

      return { success: true, data: created };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBudget(budgetId: string) {
  try {
    const userId = await getUserId();
    await db.delete(budgets).where(eq(budgets.id, budgetId));
    
    pusherServer.trigger(`user-${userId}`, "update_data", { type: "budget" }).catch(console.error);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
