import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const { responses } = await req.json();

    await db.execute(sql`
      UPDATE bookings
      SET questionnaire_responses = ${JSON.stringify(responses)}::json,
          questionnaire_completed = true
      WHERE id = ${parseInt(id)} AND clerk_user_id = ${userId}
    `);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
