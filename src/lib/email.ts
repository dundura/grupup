import { Resend } from "resend";

function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
  return new Resend(process.env.RESEND_API_KEY);
}
const FROM = "GrupUp <bookings@soccer-near-me.com>";
const ADMIN_BCC = "neil@anytime-soccer.com";

export async function sendBookingConfirmation({
  toEmail,
  toName,
  sessionTitle,
  trainerName,
  dayOfWeek,
  time,
  venue,
  city,
  amount,
}: {
  toEmail: string;
  toName: string;
  sessionTitle: string;
  trainerName: string;
  dayOfWeek: string;
  time: string;
  venue: string;
  city: string;
  amount: number;
}) {
  if (!process.env.RESEND_API_KEY) return;

  await getResend().emails.send({
    from: FROM,
    to: toEmail,
    bcc: ADMIN_BCC,
    subject: `Booking confirmed: ${sessionTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <div style="background: #0F3154; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">You're booked! 🎉</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0;">See you on the pitch, ${toName}.</p>
        </div>

        <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 16px; font-size: 18px; color: #0F3154;">${sessionTitle}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Trainer</td><td style="padding: 6px 0; font-weight: 600; font-size: 14px;">${trainerName}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">When</td><td style="padding: 6px 0; font-weight: 600; font-size: 14px;">${dayOfWeek}s at ${time}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Where</td><td style="padding: 6px 0; font-weight: 600; font-size: 14px;">${venue}, ${city}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Amount paid</td><td style="padding: 6px 0; font-weight: 600; font-size: 14px; color: #0F3154;">$${amount}</td></tr>
          </table>
        </div>

        <a href="https://grupup.com/bookings"
          style="display: block; background: #DC373E; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
          View My Bookings
        </a>

        <p style="margin-top: 24px; font-size: 13px; color: #9ca3af; text-align: center;">
          Questions? Reply to this email or visit <a href="https://grupup.com" style="color: #0F3154;">grupup.com</a>
        </p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail({
  toEmail,
  firstName,
}: {
  toEmail: string;
  firstName: string;
}) {
  if (!process.env.RESEND_API_KEY) return;
  await getResend().emails.send({
    from: FROM,
    to: toEmail,
    bcc: ADMIN_BCC,
    subject: "Welcome to GrupUp 👋",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <div style="background: #0F3154; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Grup<span style="color: #DC373E;">Up</span>, ${firstName}! 🎉</h1>
          <p style="color: rgba(255,255,255,0.75); margin: 8px 0 0; font-size: 15px;">Train smarter. Find your group. Grow your game.</p>
        </div>

        <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
          You're in. GrupUp connects athletes with local coaches running small-group training sessions — better reps, real competition, and a fraction of the cost of private training.
        </p>

        <div style="background: #f8fafc; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 12px; font-weight: 700; color: #0F3154; font-size: 15px;">Here's how to get started:</p>
          <ol style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 2;">
            <li>Browse sessions near you</li>
            <li>Reserve a spot (spots fill fast)</li>
            <li>Show up and train</li>
          </ol>
        </div>

        <a href="https://grupup.app/groups"
          style="display: block; background: #DC373E; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
          Find a Session Near You
        </a>

        <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center;">
          Questions? Reply to this email — we're always here.
        </p>
      </div>
    `,
  });
}

export async function sendTrainerNewFollower({
  trainerEmail,
  trainerName,
  followerName,
}: {
  trainerEmail: string;
  trainerName: string;
  followerName: string;
}) {
  if (!process.env.RESEND_API_KEY) return;
  await getResend().emails.send({
    from: FROM,
    to: trainerEmail,
    bcc: ADMIN_BCC,
    subject: `${followerName} is now following you on GrupUp`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="color: #0F3154; margin: 0 0 8px;">New follower! 🎉</h1>
        <p style="color: #6b7280; margin: 0 0 24px;">
          <strong>${followerName}</strong> is now following you on GrupUp. They'll be notified whenever you post a new session.
        </p>
        <a href="https://grupup.app/dashboard" style="display: block; background: #0F3154; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          View Dashboard
        </a>
      </div>
    `,
  });
}

export async function sendFollowRequest({
  toEmail,
  toName,
  fromName,
}: {
  toEmail: string;
  toName: string;
  fromName: string;
}) {
  if (!process.env.RESEND_API_KEY) return;
  await getResend().emails.send({
    from: FROM,
    to: toEmail,
    bcc: ADMIN_BCC,
    subject: `${fromName} wants to follow you on GrupUp`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <div style="background: #0F3154; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 20px;">New follow request 👋</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 14px;">Someone wants to connect with you on GrupUp</p>
        </div>
        <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
          <strong>${fromName}</strong> sent you a follow request on GrupUp. Approve it to let them message you and see your profile activity.
        </p>
        <a href="https://www.grupup.app/dashboard"
          style="display: block; background: #0F3154; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-bottom: 12px;">
          Approve or Deny on Dashboard
        </a>
      </div>
    `,
  });
}

export async function sendAdminNewPlayerNotification({
  playerName,
  playerEmail,
  playerCity,
  playerCountry,
  role = "player",
}: {
  playerName: string;
  playerEmail: string;
  playerCity: string;
  playerCountry: string;
  role?: string;
}) {
  if (!process.env.RESEND_API_KEY) return;
  const roleLabel = role === "trainer" ? "Trainer / Coach" : role === "parent" ? "Parent" : "Player";
  const emoji = role === "trainer" ? "🎯" : "🏅";
  await getResend().emails.send({
    from: FROM,
    to: ["nmciq2@gmail.com", "neil@anytime-soccer.com"],
    subject: `New ${roleLabel} signup: ${playerName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <div style="background: #0F3154; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 20px;">New ${roleLabel} Signup ${emoji}</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 14px;">Just completed onboarding on GrupUp</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 80px;">Name</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${playerName}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email</td><td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${playerEmail}" style="color: #0F3154;">${playerEmail}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Role</td><td style="padding: 8px 0; font-size: 14px;">${roleLabel}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Location</td><td style="padding: 8px 0; font-size: 14px;">${playerCity}${playerCountry ? `, ${playerCountry}` : ""}</td></tr>
        </table>
        <a href="https://www.grupup.app/admin"
          style="display: block; background: #0F3154; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
          Review in Admin
        </a>
      </div>
    `,
  });
}

export async function sendPlayerApproved({
  playerEmail,
  playerName,
}: {
  playerEmail: string;
  playerName: string;
}) {
  if (!process.env.RESEND_API_KEY) return;
  await getResend().emails.send({
    from: FROM,
    to: playerEmail,
    bcc: ADMIN_BCC,
    subject: "You're approved on GrupUp! 🎉",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <div style="background: #0F3154; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">You're approved, ${playerName}! 🎉</h1>
          <p style="color: rgba(255,255,255,0.75); margin: 8px 0 0; font-size: 15px;">Welcome to the GrupUp community.</p>
        </div>
        <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
          Your account has been approved. You can now join group training sessions, create and join free play events, and connect with other players near you.
        </p>
        <div style="background: #f8fafc; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 10px; font-weight: 700; color: #0F3154; font-size: 15px;">What you can do now:</p>
          <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 2;">
            <li>Book group training sessions with elite coaches</li>
            <li>Join or create free play events near you</li>
            <li>Connect with other players on the Connect page</li>
          </ul>
        </div>
        <a href="https://www.grupup.app/groups"
          style="display: block; background: #DC373E; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-bottom: 12px;">
          Find a Session Near You
        </a>
        <a href="https://www.grupup.app/free-play"
          style="display: block; background: #0F3154; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
          Browse Free Play Events
        </a>
      </div>
    `,
  });
}

export async function sendTrainerNewBooking({
  trainerEmail,
  trainerName,
  playerName,
  sessionTitle,
  amount,
}: {
  trainerEmail: string;
  trainerName: string;
  playerName: string;
  sessionTitle: string;
  amount: number;
}) {
  if (!process.env.RESEND_API_KEY) return;

  await getResend().emails.send({
    from: FROM,
    to: trainerEmail,
    bcc: ADMIN_BCC,
    subject: `New booking: ${sessionTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="color: #0F3154; margin: 0 0 8px;">New booking, ${trainerName}! 💪</h1>
        <p style="color: #6b7280; margin: 0 0 24px;">${playerName} just booked a spot in <strong>${sessionTitle}</strong>.</p>
        <div style="background: #f0f4f9; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #0F3154;"><strong>Amount:</strong> $${amount} (you receive $${Math.round(amount * 0.85)} after platform fee)</p>
        </div>
        <a href="https://grupup.com/dashboard" style="display: block; background: #0F3154; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Dashboard</a>
      </div>
    `,
  });
}
