import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("CLERK_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const body = await req.text();
  const svixId        = req.headers.get("svix-id") ?? "";
  const svixTimestamp = req.headers.get("svix-timestamp") ?? "";
  const svixSignature = req.headers.get("svix-signature") ?? "";

  let event: { type: string; data: any };
  try {
    event = new Webhook(secret).verify(body, {
      "svix-id":        svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: any };
  } catch (err) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "user.created") {
    const { email_addresses, first_name, last_name } = event.data;
    const email = email_addresses?.[0]?.email_address ?? "";
    const firstName = first_name || last_name || "there";

    if (email) {
      await sendWelcomeEmail({ toEmail: email, firstName });
    }
  }

  return NextResponse.json({ received: true });
}
