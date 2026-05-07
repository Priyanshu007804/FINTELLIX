"use server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

// Middleware to grab BetterAuth User ID in server actions
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

export async function getCategories() {
  try {
    const userId = await getUserId();
    const result = await db.query.categories.findMany({
      where: eq(categories.userId, userId),
    });
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCategory(name: string, color: string) {
  try {
    const userId = await getUserId();
    const [newCategory] = await db.insert(categories).values({
      name,
      color,
      userId,
    }).returning();
    
    pusherServer.trigger(`user-${userId}`, "update_data", { type: "category" }).catch(console.error);

    return { success: true, data: newCategory };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteDuplicateCategories() {
  try {
    const userId = await getUserId();
    const allCats = await db.query.categories.findMany({
      where: eq(categories.userId, userId),
    });

    // Group by name, keep only the first (oldest) of each
    const seen = new Map<string, string>();
    const toDelete: string[] = [];

    for (const cat of allCats) {
      if (seen.has(cat.name)) {
        toDelete.push(cat.id);
      } else {
        seen.set(cat.name, cat.id);
      }
    }

    if (toDelete.length > 0) {
      for (const id of toDelete) {
        await db.delete(categories).where(eq(categories.id, id)).catch(() => {
          // Ignore FK constraint errors (category in use by a transaction)
        });
      }
    }

    return { success: true, deleted: toDelete.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
