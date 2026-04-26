import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trainerReviews, trainers, bookings } from "@/db/schema";
import { eq, avg, count, sql } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await currentUser();
    const { trainerId, bookingId, rating, comment, kidName, kidAge } = await req.json();

    if (!trainerId || !rating) {
      return NextResponse.json({ error: "trainerId and rating are required" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
    }

    if (bookingId) {
      const [booking] = await db.select().from(bookings)
        .where(eq(bookings.id, bookingId));
      if (!booking || booking.clerkUserId !== userId) {
        return NextResponse.json({ error: "Booking not found or unauthorized" }, { status: 403 });
      }
    }

    await db.insert(trainerReviews).values({
      trainerId,
      bookingId,
      reviewerClerkId: userId,
      parentName: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Anonymous",
      kidName: kidName ?? null,
      kidAge: kidAge ?? null,
      rating,
      comment: comment ?? null,
    });

    const [stats] = await db
      .select({
        avg: avg(trainerReviews.rating),
        cnt: count(trainerReviews.id),
      })
      .from(trainerReviews)
      .where(eq(trainerReviews.trainerId, trainerId));

    await db
      .update(trainers)
      .set({
        rating: Number(Number(stats.avg).toFixed(1)),
        reviewCount: Number(stats.cnt),
      })
      .where(eq(trainers.id, trainerId));

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/reviews]", err);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
