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
