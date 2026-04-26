import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await currentUser();
    const { sessionId } = await req.json();

    const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    if (session.spotsLeft <= 0) return NextResponse.json({ error: "Session is full" }, { status: 400 });

    const origin = req.headers.get("origin") ?? "https://grupup.com";

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: user?.emailAddresses[0]?.emailAddress,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: session.title,
              description: `${session.sessionType} · ${session.dayOfWeek}s ${session.time} · ${session.city}`,
            },
            unit_amount: session.pricePerPlayer * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        sessionId: session.id,
        clerkUserId: userId,
        userName: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
        userEmail: user?.emailAddresses[0]?.emailAddress ?? "",
      },
      success_url: `${origin}/bookings?success=1&session=${session.id}`,
      cancel_url: `${origin}/sessions/${session.id}`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[POST /api/checkout]", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
