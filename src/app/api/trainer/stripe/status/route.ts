import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { db } from "@/db";
import { trainers } from "@/db/schema";
import { eq } from "drizzle-orm";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [trainer] = await db.select().from(trainers).where(eq(trainers.clerkId, userId));
    if (!trainer?.stripeAccountId) return NextResponse.json({ connected: false });

    const account = await getStripe().accounts.retrieve(trainer.stripeAccountId);
    const connected = account.charges_enabled && account.payouts_enabled;

    return NextResponse.json({ connected, accountId: trainer.stripeAccountId });
  } catch (err) {
    return NextResponse.json({ connected: false });
  }
}
