"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";

const DAY_MAP: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
};

function nextOccurrence(dayOfWeek: string, timeStr: string): Date {
  const target = DAY_MAP[dayOfWeek] ?? 0;
  const now = new Date();
  const day = now.getDay();
  let daysAhead = target - day;
  if (daysAhead < 0 || (daysAhead === 0 && now.getHours() >= parseInt(timeStr))) daysAhead += 7;

  const [hStr, mStr] = timeStr.split(":");
  const d = new Date(now);
  d.setDate(now.getDate() + daysAhead);
  d.setHours(parseInt(hStr) || 0, parseInt(mStr) || 0, 0, 0);
  return d;
}

function toGCalDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function toICSDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export default function AddToCalendarButton({
  title,
  dayOfWeek,
  time,
  durationMin,
  location,
  description,
}: {
  title: string;
  dayOfWeek: string;
  time: string;
  durationMin: number;
  location: string;
  description?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!dayOfWeek || !time) return null;

  const start = nextOccurrence(dayOfWeek, time);
  const end = new Date(start.getTime() + durationMin * 60 * 1000);
  const details = description ?? `${title} — grupup.app`;
  const rrule = "RRULE:FREQ=WEEKLY";

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${toGCalDate(start)}/${toGCalDate(end)}` +
    `&details=${encodeURIComponent(details)}` +
    `&location=${encodeURIComponent(location)}` +
    `&recur=${encodeURIComponent(rrule)}`;

  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?` +
    `subject=${encodeURIComponent(title)}` +
    `&startdt=${start.toISOString()}` +
    `&enddt=${end.toISOString()}` +
    `&body=${encodeURIComponent(details)}` +
    `&location=${encodeURIComponent(location)}`;

  function downloadICS() {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//GrupUp//Session//EN",
      "BEGIN:VEVENT",
      `DTSTART:${toICSDate(start)}`,
      `DTEND:${toICSDate(end)}`,
      rrule,
      `SUMMARY:${title}`,
      `DESCRIPTION:${details}`,
      `LOCATION:${location}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.ics`;
    a.click();
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold border transition-colors hover:bg-muted"
        style={{ color: "#0F3154", borderColor: "#0F3154" }}>
        <CalendarDays className="h-4 w-4" />
        Add to Calendar
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border rounded-xl shadow-lg overflow-hidden z-20">
          <a href={googleUrl} target="_blank" rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-muted transition-colors">
            <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
            Google Calendar
          </a>
          <button onClick={downloadICS}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium hover:bg-muted transition-colors text-left border-t">
            <span className="text-base leading-none">🍎</span>
            Apple Calendar
          </button>
          <a href={outlookUrl} target="_blank" rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-muted transition-colors border-t">
            <span className="text-base leading-none">📅</span>
            Outlook
          </a>
        </div>
      )}
    </div>
  );
}
