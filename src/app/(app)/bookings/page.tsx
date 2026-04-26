"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { Calendar, MapPin, Clock, CheckCircle } from "lucide-react";

interface BookingRow {
  booking: {
    id: number;
    status: string;
    amountPaid: number;
    createdAt: string;
  };
  session: {
    id: string;
    title: string;
    sport: string;
    sportEmoji: string;
    sessionType: string;
    city: string;
    venue: string;
    dayOfWeek: string;
    time: string;
    duration: number;
  } | null;
  trainer: {
    name: string;
    photo: string;
  } | null;
}

const statusColors: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  pending:   "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

function BookingsContent() {
  const searchParams = useSearchParams();
  const justBooked = searchParams.get("success") === "1";

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => { setBookings(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      {justBooked && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border mb-6"
          style={{ backgroundColor: "#f0fdf4", borderColor: "#86efac" }}>
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Booking confirmed!</p>
            <p className="text-sm text-green-700">Check your email for details. See you on the pitch!</p>
          </div>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-card border rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📅</div>
          <p className="font-semibold text-lg mb-1">No bookings yet</p>
          <p className="text-muted-foreground text-sm mb-6">
            Find a group session and reserve your spot.
          </p>
          <Button style={{ backgroundColor: "#DC373E" }} asChild>
            <Link href="/groups">Find a session</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(({ booking, session, trainer }) => (
            <div key={booking.id} className="bg-card border rounded-2xl overflow-hidden hover:shadow-sm transition-shadow flex">
              <div className="w-1.5 shrink-0" style={{ backgroundColor: "#0F3154" }} />
              <div className="p-5 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    {trainer?.photo && (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                        <Image src={trainer.photo} alt={trainer.name ?? ""} fill className="object-cover" sizes="40px" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{session?.title ?? "Session"}</p>
                      <p className="text-xs text-muted-foreground">{trainer?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[booking.status] ?? "bg-muted text-muted-foreground"}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    {booking.amountPaid && (
                      <span className="text-sm font-bold" style={{ color: "#0F3154" }}>${booking.amountPaid}</span>
                    )}
                  </div>
                </div>

                {session && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{session.dayOfWeek}s · {session.time}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{session.duration} min</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{session.venue}, {session.city}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function BookingsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      <Suspense fallback={<div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />)}</div>}>
        <BookingsContent />
      </Suspense>
    </div>
  );
}
