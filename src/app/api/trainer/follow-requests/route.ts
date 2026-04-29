import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainerFollows } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const pending = await db.select().from(trainerFollows)
      .where(and(eq(trainerFollows.trainerClerkId, userId), eq(trainerFollows.status, "pending")));

    if (!pending.length) return NextResponse.json([]);

    const client = await clerkClient();
    const result = await Promise.all(pending.map(async (row) => {
      try {
        const u = await client.users.getUser(row.followerClerkId);
        return {
          id: row.id,
          followerClerkId: row.followerClerkId,
          name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "Unknown",
          photo: u.imageUrl ?? "",
        };
      } catch { return null; }
    }));

    return NextResponse.json(result.filter(Boolean));
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
