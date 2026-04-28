import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Clock, CheckCircle2, Users, Zap } from "lucide-react";

export default async function PendingApprovalPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = user.publicMetadata as { isApproved?: boolean; role?: string };

  if (meta.isApproved === true) redirect("/dashboard");

  const firstName = user.firstName ?? "there";

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">

        <div className="flex h-20 w-20 items-center justify-center rounded-2xl mx-auto mb-6"
          style={{ backgroundColor: "#fff3cd" }}>
          <Clock className="h-10 w-10" style={{ color: "#d97706" }} />
        </div>

        <h1 className="text-2xl font-bold mb-2">Pending approval, {firstName}!</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Your account is being reviewed. You'll get an email as soon as you're approved — usually within 24 hours.
        </p>

        <div className="bg-white rounded-2xl border shadow-sm p-6 mb-8 text-left">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Once approved, you can:</p>
          <div className="space-y-3">
            {[
              { icon: CheckCircle2, text: "Book group training sessions with elite coaches" },
              { icon: Zap, text: "Join and create free play events near you" },
              { icon: Users, text: "Connect with other players and find training partners" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <Icon className="h-5 w-5 shrink-0" style={{ color: "#0F3154" }} />
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Link href="/groups"
            className="block w-full py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#DC373E" }}>
            Browse sessions (no booking required)
          </Link>
          <Link href="/dashboard"
            className="block w-full py-3 rounded-xl font-semibold text-sm border transition-colors hover:bg-[#f0f4f9]"
            style={{ color: "#0F3154", borderColor: "#0F3154" }}>
            Go to my dashboard
          </Link>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Questions? <a href="/contact" className="underline hover:text-foreground">Contact us</a>
        </p>
      </div>
    </div>
  );
}
