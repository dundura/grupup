import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainingRequests, trainingRequestResponses, trainers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStripe, stripeOpts } from "@/lib/stripe";
import { Resend } from "resend";

const FROM = "GrupUp <bookings@soccer-near-me.com>";
const ADMIN = "neil@anytime-soccer.com";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const requestId = parseInt(id);
    const { proposedRate, message } = await req.json();

    const [request] = await db.select().from(trainingRequests).where(eq(trainingRequests.id, requestId));
    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const [trainer] = await db.select().from(trainers).where(eq(trainers.clerkId, userId));
    if (!trainer) return NextResponse.json({ error: "Trainer not found" }, { status: 404 });

    const isGroup = (request as any).trainingType === "group";

    // Record response
    await db.insert(trainingRequestResponses).values({
      requestId,
      trainerClerkId: userId,
      trainerName: trainer.name,
      message: message || null,
      proposedRate: proposedRate || request.budget || null,
      status: "pending",
    });

    // For group requests, return a redirect to new-session pre-filled
    if (isGroup) {
      const params = new URLSearchParams({
        fromRequest: String(requestId),
        sport: (request as any).sport ?? "",
        city: (request as any).city ?? "",
        level: (request as any).level ?? "",
        budget: proposedRate || (request as any).budget || "",
      });
      const newSessionUrl = `https://www.grupup.app/trainer/new-session?${params}`;

      // Email player
      if (request.playerEmail && process.env.RESEND_API_KEY) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "GrupUp <bookings@soccer-near-me.com>",
          to: request.playerEmail,
          bcc: "neil@anytime-soccer.com",
          subject: `${trainer.name} accepted your group training request!`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
              <div style="background:#0F3154;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <h1 style="color:white;margin:0;font-size:20px;">${trainer.name} accepted your request! 🎉</h1>
                <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px;">Your group training session is being created</p>
              </div>
              <p style="color:#374151;font-size:15px;">Hi ${request.playerName},</p>
              <p style="color:#374151;font-size:15px;"><strong>${trainer.name}</strong> is setting up your group session${proposedRate ? ` at <strong>${proposedRate}/player</strong>` : ""}. You'll receive a booking link once it's live.</p>
              ${message ? `<div style="background:#f8fafc;border-radius:10px;padding:14px;margin:16px 0;"><p style="margin:0;font-size:14px;color:#374151;">${message}</p></div>` : ""}
              <a href="https://www.grupup.app/groups" style="display:block;background:#DC373E;color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-top:20px;">Browse Sessions</a>
            </div>
          `,
        });
      }

      return NextResponse.json({ ok: true, redirect: newSessionUrl, type: "group" });
    }

    // Create Stripe checkout at the agreed rate (individual)
    const rateStr = proposedRate || request.budget || "";
    const priceNum = parseFloat(rateStr.replace(/[^0-9.]/g, "")) || 0;
    const origin = "https://www.grupup.app";

    let checkoutUrl = "";
    if (priceNum > 0 && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = getStripe();
        const sessionCount = request.sessions ? parseInt(request.sessions.split("–")[0]) || 1 : 1;
        const cs = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          customer_email: request.playerEmail,
          line_items: [{
            price_data: {
              currency: "usd",
              product_data: {
                name: `Training with ${trainer.name}`,
                description: [request.sport, request.level, request.city].filter(Boolean).join(" · "),
              },
              unit_amount: Math.round(priceNum * 100),
            },
            quantity: sessionCount,
          }],
          metadata: {
            type: "private",
            trainerId: trainer.id,
            userId: request.playerClerkId ?? `guest-request-${requestId}`,
            userName: request.playerName,
            userEmail: request.playerEmail,
            athleteName: request.playerName,
            sessionCount: String(sessionCount),
            notes: `Training request #${requestId}`,
          },
          success_url: `${origin}/booking/success?checkout_session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/groups/${trainer.id}`,
        }, stripeOpts());
        checkoutUrl = cs.url ?? "";
      } catch (e) {
        console.error("[accept-request] stripe error:", e);
      }
    }

    // Email player
    if (request.playerEmail && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: FROM,
        to: request.playerEmail,
        bcc: ADMIN,
        subject: `${trainer.name} accepted your session request!`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
            <div style="background:#0F3154;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <h1 style="color:white;margin:0;font-size:20px;">${trainer.name} accepted your request! 🎉</h1>
              <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px;">You're one step away from booking</p>
            </div>
            <p style="color:#374151;font-size:15px;">Hi ${request.playerName},</p>
            <p style="color:#374151;font-size:15px;"><strong>${trainer.name}</strong> is ready to train with you${proposedRate ? ` at <strong>${proposedRate}/session</strong>` : ""}.</p>
            ${message ? `<div style="background:#f8fafc;border-radius:10px;padding:14px 18px;margin:16px 0;"><p style="margin:0;font-size:14px;color:#374151;white-space:pre-wrap;">${message}</p></div>` : ""}
            ${checkoutUrl
              ? `<a href="${checkoutUrl}" style="display:block;background:#DC373E;color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-top:20px;">Complete Booking & Pay</a>`
              : `<a href="${origin}/groups/${trainer.id}" style="display:block;background:#DC373E;color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-top:20px;">View Trainer Profile</a>`
            }
            <p style="margin-top:16px;font-size:12px;color:#9ca3af;text-align:center;">Questions? Reply to this email.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: true, checkoutUrl });
  } catch (err) {
    console.error("[accept-request]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
