import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainingRequests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await db.select().from(trainingRequests)
      .where(eq(trainingRequests.playerClerkId, userId))
      .orderBy(desc(trainingRequests.createdAt));

    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
