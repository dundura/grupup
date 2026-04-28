import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { db } from "@/db";
import { trainers } from "@/db/schema";
import { eq } from "drizzle-orm";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });
}

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const stripe = getStripe();
    const origin = "https://www.grupup.app";

    const [trainer] = await db.select().from(trainers).where(eq(trainers.clerkId, userId));

    let accountId = trainer?.stripeAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({ type: "express" });
      accountId = account.id;
      if (trainer) {
        await db.update(trainers).set({ stripeAccountId: accountId }).where(eq(trainers.clerkId, userId));
      }
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard`,
      return_url: `${origin}/trainer/stripe-return`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err: any) {
    console.error("[POST /api/trainer/stripe/connect]", err);
    return NextResponse.json({ error: err?.message ?? "Failed to create Connect link" }, { status: 500 });
  }
}

export async function GET() {
  const res = await POST();
  const data = await res.json();
  if (data.url) return Response.redirect(data.url);
  return NextResponse.json({ error: "Failed to refresh" }, { status: 500 });
}
