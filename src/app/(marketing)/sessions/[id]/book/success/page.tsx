import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default async function BookingSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: "#f0f9f4" }}>
          <CheckCircle className="h-9 w-9 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">You're booked!</h1>
        <p className="text-muted-foreground mb-6">
          Payment confirmed. A confirmation email is on its way. We'll see you at the session!
        </p>
        <div className="space-y-3">
          <Link href="/dashboard"
            className="flex items-center justify-center w-full py-3 rounded-xl text-white font-semibold text-sm"
            style={{ backgroundColor: "#0F3154" }}>
            Go to my dashboard
          </Link>
          <Link href="/groups"
            className="flex items-center justify-center w-full py-3 rounded-xl border font-semibold text-sm hover:bg-muted transition-colors">
            Browse more sessions
          </Link>
        </div>
      </div>
    </div>
  );
}
