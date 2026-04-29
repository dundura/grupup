import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainingRequests } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const [request] = await db.select().from(trainingRequests).where(eq(trainingRequests.id, parseInt(id)));
    if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(request);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
