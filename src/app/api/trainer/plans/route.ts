import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trainerPlans, trainerPlanInterests, trainers, trainerFollows } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { sendGaugeInterestToFollowers } from "@/lib/email";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const plans = await db.select().from(trainerPlans)
      .where(and(eq(trainerPlans.trainerClerkId, userId), eq(trainerPlans.isActive, true)))
      .orderBy(desc(trainerPlans.createdAt));

    const interests = await db.select().from(trainerPlanInterests)
      .where(eq(trainerPlanInterests.trainerClerkId, userId))
      .orderBy(desc(trainerPlanInterests.createdAt));

    return NextResponse.json({ plans, interests });
  } catch (err) {
    console.error("[GET /api/trainer/plans]", err);
    return NextResponse.json({ plans: [], interests: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const [plan] = await db.insert(trainerPlans).values({
      trainerClerkId: userId,
      date: body.date || null,
      dayOfWeek: body.dayOfWeek || null,
      time: body.time || null,
      sport: body.sport || null,
      city: body.city || null,
      note: body.note || null,
    }).returning();

    // Notify followers in the background
    try {
      const [trainerRow] = await db.select({ id: trainers.id, name: trainers.name, photo: trainers.photo })
        .from(trainers).where(eq(trainers.clerkId, userId));

      if (trainerRow) {
        const follows = await db.select({ followerClerkId: trainerFollows.followerClerkId })
          .from(trainerFollows)
          .where(and(eq(trainerFollows.trainerClerkId, userId), eq(trainerFollows.status, "approved")));

        if (follows.length > 0) {
          const client = await clerkClient();
          const followerEmails: { email: string; name: string }[] = [];
          for (const f of follows) {
            try {
              const u = await client.users.getUser(f.followerClerkId);
              const email = u.emailAddresses?.[0]?.emailAddress;
              if (email) {
                followerEmails.push({
                  email,
                  name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "Player",
                });
              }
            } catch {}
          }

          const dateLabel = body.dayOfWeek
            ? `Every ${body.dayOfWeek}${body.time ? ` · ${fmtTime(body.time)}` : ""}`
            : body.date
              ? new Date(body.date + "T00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) + (body.time ? ` · ${fmtTime(body.time)}` : "")
              : body.time ? fmtTime(body.time) : "Date TBD";

          await sendGaugeInterestToFollowers({
            followerEmails,
            trainerName: trainerRow.name,
            trainerPhoto: trainerRow.photo ?? undefined,
            trainerId: trainerRow.id,
            dateLabel,
            sport: body.sport || undefined,
            city: body.city || undefined,
            note: body.note || undefined,
          });
        }
      }
    } catch (emailErr) {
      console.error("[gauge interest email]", emailErr);
    }

    return NextResponse.json(plan, { status: 201 });
  } catch (err) {
    console.error("[POST /api/trainer/plans]", err);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}
