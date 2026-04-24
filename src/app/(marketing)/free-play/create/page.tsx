"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const EMPTY_FORM = {
  title: "",
  sport: "Soccer",
  venue: "",
  city: "",
  date: "",
  time: "",
  duration: "90",
  playersNeeded: "10",
  ageRange: "",
  level: "Intermediate",
  description: "",
};

export default function CreateFreePlayPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  function set(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.venue || !form.city || !form.date || !form.time) {
      setError("Please fill in all required fields.");
      return;
    }
    // In production this would save to DB; for now navigate back
    router.push("/free-play");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="py-10 border-b" style={{ backgroundColor: "#0F3154" }}>
        <div className="container max-w-2xl">
          <Link href="/free-play" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Free Play
          </Link>
          <h1 className="text-3xl font-bold text-white">Post a Free Play Event</h1>
          <p className="text-white/60 mt-1">Let players in your area know about the game.</p>
        </div>
      </div>

      {/* Form */}
      <div className="container max-w-2xl py-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div>
            <label className="text-sm font-medium block mb-1">Event title *</label>
            <Input placeholder="e.g. Saturday Pickup at Pullen Park" value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Sport *</label>
              <select
                className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background"
                value={form.sport}
                onChange={(e) => set("sport", e.target.value)}
              >
                <option>Soccer</option>
                <option>Basketball</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Level</label>
              <select
                className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background"
                value={form.level}
                onChange={(e) => set("level", e.target.value)}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Venue / Location *</label>
            <Input placeholder="e.g. Pullen Park Soccer Field" value={form.venue} onChange={(e) => set("venue", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">City *</label>
              <Input placeholder="Raleigh" value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Age range</label>
              <Input placeholder="e.g. 13–18" value={form.ageRange} onChange={(e) => set("ageRange", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Date *</label>
              <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Time *</label>
              <Input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Duration (min)</label>
              <Input type="number" min={30} max={300} step={15} value={form.duration} onChange={(e) => set("duration", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Players needed</label>
              <Input type="number" min={2} max={50} value={form.playersNeeded} onChange={(e) => set("playersNeeded", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Description</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background resize-none"
              rows={4}
              placeholder="Tell players what to expect — level, format, what to bring…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" asChild>
              <Link href="/free-play">Cancel</Link>
            </Button>
            <Button type="submit" className="flex-1 text-white" style={{ backgroundColor: "#DC373E" }}>
              Post Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
