import { NextResponse } from "next/server";
import { db } from "@/db";
import { trainers, trainerSessions } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const rows = await db.select().from(trainers).where(
      and(eq(trainers.isApproved, true), eq(trainers.isArchived, false))
    );
    if (rows.length === 0) return NextResponse.json([]);

    // Which trainers have active sessions + what's their lowest price?
    const clerkIds = rows.map((r) => r.clerkId).filter(Boolean) as string[];
    const activeSessions = await db
      .select({ trainerClerkId: trainerSessions.trainerClerkId, pricePerPlayer: trainerSessions.pricePerPlayer })
      .from(trainerSessions)
      .where(and(eq(trainerSessions.isActive, true), inArray(trainerSessions.trainerClerkId, clerkIds)));
    const activeSet = new Set(activeSessions.map((s) => s.trainerClerkId));
    const lowestPrice: Record<string, number> = {};
    for (const s of activeSessions) {
      if (!lowestPrice[s.trainerClerkId] || s.pricePerPlayer < lowestPrice[s.trainerClerkId]) {
        lowestPrice[s.trainerClerkId] = s.pricePerPlayer;
      }
    }

    // Fill in missing photos from Clerk
    const missingPhoto = rows.filter((r) => !r.photo && r.clerkId);
    const clerkPhotos: Record<string, string> = {};
    if (missingPhoto.length > 0) {
      const client = await clerkClient();
      await Promise.all(missingPhoto.map(async (r) => {
        try {
          const u = await client.users.getUser(r.clerkId!);
          if (u.imageUrl) clerkPhotos[r.clerkId!] = u.imageUrl;
        } catch {}
      }));
    }

    const result = rows.map((r) => ({
      ...r,
      photo: r.photo || clerkPhotos[r.clerkId ?? ""] || "",
      hasActiveSessions: activeSet.has(r.clerkId ?? ""),
      lowestSessionPrice: lowestPrice[r.clerkId ?? ""] ?? null,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/trainers]", err);
    return NextResponse.json([]);
  }
}
