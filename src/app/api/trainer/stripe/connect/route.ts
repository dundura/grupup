import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStripe, stripeOpts } from "@/lib/stripe";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const stripe = getStripe();
    const opts = stripeOpts();
    const origin = "https://www.grupup.app";

    const [trainer] = await db.select().from(trainers).where(eq(trainers.clerkId, userId));

    let accountId = trainer?.stripeAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({ type: "express" }, opts);
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
    }, opts);

    return NextResponse.json({ url: accountLink.url });
  } catch (err: any) {
    console.error("[POST /api/trainer/stripe/connect]", err);
    const msg: string = err?.message ?? "";
    if (msg.includes("signed up for Connect")) {
      return NextResponse.json({ error: "Stripe Connect is still being activated on your platform account. This usually takes a few hours after identity verification. Check your email from Stripe for confirmation." }, { status: 500 });
    }
    return NextResponse.json({ error: msg || "Failed to create Connect link" }, { status: 500 });
  }
}

export async function GET() {
  const res = await POST();
  const data = await res.json();
  if (data.url) return Response.redirect(data.url);
  return NextResponse.json({ error: "Failed to refresh" }, { status: 500 });
}
