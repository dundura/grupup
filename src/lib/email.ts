import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Grupup <bookings@grupup.com>";

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

  await resend.emails.send({
    from: FROM,
    to: toEmail,
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

  await resend.emails.send({
    from: FROM,
    to: trainerEmail,
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
