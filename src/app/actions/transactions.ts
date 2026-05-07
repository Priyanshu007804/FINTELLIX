"use server";

import { db } from "@/db";
import { transactions, categories } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ratelimit } from "@/lib/ratelimit";
import { predictFraud } from "@/lib/ml";
import { pusherServer } from "@/lib/pusher";
import { sendFraudAlertEmail } from "@/lib/email";

async function getUser() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });
  
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }
  return { id: session.user.id, email: session.user.email };
}

export async function getTransactions() {
  try {
    const { id: userId } = await getUser();
    const result = await db.query.transactions.findMany({
      where: eq(transactions.userId, userId),
      orderBy: [desc(transactions.createdAt)],
      with: {
        category: true, // Requires relation setup in schema, fallback to join if needed
      }
    });
    return { success: true, data: result };
  } catch (error: any) {
    // If table relation fails, we can do a manual left join query
    try {
        const { id: userId } = await getUser();
        const joinedResults = await db
          .select({
            id: transactions.id,
            amount: transactions.amount,
            date: transactions.date,
            description: transactions.description,
            location: transactions.location,
            merchant: transactions.merchant,
            isFraud: transactions.isFraud,
            fraudProbability: transactions.fraudProbability,
            category: categories,
          })
          .from(transactions)
          .leftJoin(categories, eq(transactions.categoryId, categories.id))
          .where(eq(transactions.userId, userId))
          .orderBy(desc(transactions.date));
          
        return { success: true, data: joinedResults };
    } catch (fallbackError: any) {
        return { success: false, error: fallbackError.message };
    }
  }
}

interface AddTransactionInput {
  amount: number;
  date: string;
  description?: string;
  categoryId: string;
  location?: string;
  merchant?: string;
  deviceInfo?: string;
}

export async function createTransaction(input: AddTransactionInput) {
  try {
    const { id: userId, email } = await getUser();

    // Phase 10: Rate Limiting — max 5 transactions per 10 seconds per user
    const { success: allowed } = await ratelimit.limit(userId);
    if (!allowed) {
      return { success: false, error: "Rate limit exceeded. Please wait a moment before adding more transactions." };
    }

    // Step 1: Insert the transaction
    const [newTransaction] = await db.insert(transactions).values({
      amount: input.amount.toString(),
      date: new Date(input.date),
      description: input.description,
      categoryId: input.categoryId,
      location: input.location,
      merchant: input.merchant,
      deviceInfo: input.deviceInfo,
      userId,
    }).returning();

    // Step 2: Call ML Fraud Detection API in the background (non-blocking)
    // This makes the UI feel instant while analysis runs in the background
    (async () => {
      try {
        const mlResult = await predictFraud(
          input.amount,
          new Date(input.date),
          input.merchant,
          input.location,
        );

        if (mlResult) {
          // Step 3: Update the transaction with fraud analysis results
          await db.update(transactions)
            .set({
              isFraud: mlResult.prediction === 1,
              fraudProbability: mlResult.fraud_probability.toString(),
              updatedAt: new Date(),
            })
            .where(eq(transactions.id, newTransaction.id));

          // Trigger pusher event so the UI updates automatically
          pusherServer.trigger(`user-${userId}`, "update_data", { type: "transaction" }).catch(console.error);

          // Trigger Email Notification
          if (mlResult.prediction === 1 && email) {
            sendFraudAlertEmail(email, {
              merchant: input.merchant || "Unknown",
              amount: input.amount,
              date: new Date(input.date),
              fraudProbability: mlResult.fraud_probability,
              location: input.location,
            }).catch(console.error);
          }
        }
      } catch (e) {
        console.error("[Background ML Error]", e);
      }
    })();

    // Return the new transaction immediately
    return { success: true, data: newTransaction };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTransaction(transactionId: string) {
  try {
    const { id: userId } = await getUser();
    
    // Efficient single-query delete with ownership check
    const result = await db.delete(transactions)
      .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)))
      .returning();

    if (result.length === 0) {
      return { success: false, error: "Unauthorized or transaction not found" };
    }
    
    // Trigger pusher event in the background
    pusherServer.trigger(`user-${userId}`, "update_data", { type: "transaction" }).catch(console.error);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function scanTransaction(transactionId: string) {
  try {
    const { id: userId, email } = await getUser();
    const [tx] = await db.select().from(transactions).where(eq(transactions.id, transactionId));
    if (!tx || tx.userId !== userId) {
      return { success: false, error: "Unauthorized or transaction not found" };
    }

    const amount = parseFloat(tx.amount);
    const dateObj = new Date(tx.date);

    const mlResult = await predictFraud(
      amount,
      dateObj,
      tx.merchant || undefined,
      tx.location || undefined
    );

    if (mlResult) {
       await db.update(transactions)
        .set({
          isFraud: mlResult.prediction === 1,
          fraudProbability: mlResult.fraud_probability.toString(),
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, transactionId));
       
       // Trigger pusher event
       pusherServer.trigger(`user-${userId}`, "update_data", { type: "transaction" }).catch(console.error);

       // Phase 9: Trigger Email Notification
       if (mlResult.prediction === 1 && email) {
         sendFraudAlertEmail(email, {
           merchant: tx.merchant || "Unknown",
           amount,
           date: dateObj,
           fraudProbability: mlResult.fraud_probability,
           location: tx.location || "Online",
         }).catch(console.error);
       }

       return { 
         success: true, 
         data: { isFraud: mlResult.prediction === 1, fraudProbability: mlResult.fraud_probability } 
       };
    }
    
    return { success: false, error: "ML Service unavailable" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
