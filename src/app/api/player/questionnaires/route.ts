import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await db.execute(sql`
      SELECT b.id as booking_id, ts.title as session_title, ts.questionnaire
      FROM bookings b
      JOIN trainer_sessions ts ON ts.id = CAST(b.session_id AS INTEGER)
      WHERE b.clerk_user_id = ${userId}
        AND b.status = 'paid'
        AND (b.questionnaire_completed IS NULL OR b.questionnaire_completed = false)
        AND ts.questionnaire IS NOT NULL
    `);

    const pending = (rows.rows ?? []).map((r: any) => ({
      bookingId: r.booking_id,
      sessionTitle: r.session_title,
      questionnaire: typeof r.questionnaire === "string" ? JSON.parse(r.questionnaire) : r.questionnaire,
    }));

    return NextResponse.json({ pending });
  } catch {
    return NextResponse.json({ pending: [] });
  }
}
