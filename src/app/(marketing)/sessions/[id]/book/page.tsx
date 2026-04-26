import { notFound } from "next/navigation";
import { db } from "@/db";
import { trainerSessions, trainers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { BookingFlow } from "@/components/booking/BookingFlow";

export const dynamic = "force-dynamic";

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = parseInt(id);
  if (isNaN(sessionId)) notFound();

  const [session] = await db.select().from(trainerSessions).where(eq(trainerSessions.id, sessionId));
  if (!session || !session.isActive) notFound();

  const [trainer] = await db.select().from(trainers).where(eq(trainers.clerkId, session.trainerClerkId));

  return (
    <BookingFlow
      session={{
        id: session.id,
        title: session.title,
        sport: session.sport,
        sessionType: session.sessionType,
        city: session.city ?? "",
        venue: session.venue ?? "",
        dayOfWeek: session.dayOfWeek ?? "",
        time: session.time ?? "",
        duration: session.duration ?? 60,
        pricePerPlayer: session.pricePerPlayer,
        spotsTotal: session.spotsTotal,
        spotsLeft: session.spotsLeft,
        skillLevel: session.skillLevel ?? "",
        ageRange: session.ageRange ?? "",
        notes: session.notes ?? "",
      }}
      trainer={trainer ? {
        id: trainer.id,
        name: trainer.name,
        photo: trainer.photo ?? "",
        bio: trainer.bio ?? "",
        city: trainer.city ?? "",
        state: trainer.state ?? "",
        sport: trainer.sport ?? "",
        sports: (trainer.sports as string[]) ?? [],
        rating: trainer.rating ?? 5.0,
        reviewCount: trainer.reviewCount ?? 0,
        yearsExperience: trainer.yearsExperience ?? 0,
        certifications: (trainer.certifications as string[]) ?? [],
      } : null}
    />
  );
}
