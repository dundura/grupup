import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { trainers as mockTrainers, groupSessions as mockSessions, freePlayEvents as mockEvents } from "../lib/mock-data";

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  console.log("Seeding trainers...");
  for (const t of mockTrainers) {
    await db.insert(schema.trainers).values({
      id: t.id,
      name: t.name,
      photo: t.photo,
      bio: t.bio,
      hourlyRate: t.hourlyRate,
      city: t.city,
      state: t.state,
      certifications: t.certifications,
      specialties: t.specialties as string[],
      skillLevels: t.skillLevels,
      rating: t.rating,
      reviewCount: t.reviewCount,
      yearsExperience: t.yearsExperience,
      videoUrl: t.videoUrl,
      isApproved: true,
    }).onConflictDoNothing();

    for (const r of t.reviews) {
      await db.insert(schema.trainerReviews).values({
        trainerId: t.id,
        parentName: r.parentName,
        kidName: r.kidName,
        kidAge: r.kidAge,
        rating: r.rating,
        comment: r.comment,
      }).onConflictDoNothing();
    }
  }
  console.log(`  Inserted ${mockTrainers.length} trainers`);

  console.log("Seeding sessions...");
  for (const s of mockSessions) {
    await db.insert(schema.sessions).values({
      id: s.id,
      trainerId: s.trainer.id,
      title: s.title,
      sport: s.sport,
      sportEmoji: s.sportEmoji,
      focus: s.focus,
      sessionType: s.sessionType,
      city: s.city,
      state: s.state,
      venue: s.venue,
      dayOfWeek: s.dayOfWeek,
      time: s.time,
      duration: s.duration,
      date: s.date,
      totalSpots: s.totalSpots,
      spotsLeft: s.spotsLeft,
      pricePerPlayer: s.pricePerPlayer,
      skillLevel: s.skillLevel,
      ageRange: s.ageRange,
      recurring: s.recurring,
      specialOfferLabel: s.specialOffer?.label,
      specialOfferDiscountPct: s.specialOffer?.discountPct,
      isActive: true,
    }).onConflictDoNothing();
  }
  console.log(`  Inserted ${mockSessions.length} sessions`);

  console.log("Seeding free play events...");
  for (const e of mockEvents) {
    await db.insert(schema.freePlayEvents).values({
      organizerName: e.organizer,
      sport: e.sport,
      sportEmoji: e.sportEmoji,
      title: e.title,
      level: e.level,
      competitiveTier: e.competitiveTier,
      venue: e.venue,
      city: e.city,
      state: e.state,
      date: e.date,
      time: e.time,
      duration: e.duration,
      playersConfirmed: e.playersConfirmed,
      playersNeeded: e.playersNeeded,
      ageRange: e.ageRange,
      description: e.description,
      isActive: true,
    });
  }
  console.log(`  Inserted ${mockEvents.length} free play events`);

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
