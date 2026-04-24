"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Users, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Hero() {
  const router = useRouter();
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    const query = location ? `?city=${encodeURIComponent(location)}` : "";
    router.push(`/trainers${query}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-accent/5 via-background to-primary/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
      <div className="container relative py-16 md:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">

          {/* Problem / value pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-semibold">
              <DollarSign className="h-3.5 w-3.5" />
              <span>Private training too expensive?</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 text-accent px-4 py-1.5 text-xs font-semibold">
              <Users className="h-3.5 w-3.5" />
              <span>Your kid wants to train with friends?</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-700 px-4 py-1.5 text-xs font-semibold">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Group training is more effective</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
            Elite soccer training,{" "}
            <span className="text-primary">shared with your crew.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Grupup is the only platform built for <strong className="text-foreground">group soccer training sessions</strong> — split the cost with friends, train together, and get coached by elite trainers near you.
          </p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-3 p-3 bg-background border rounded-2xl shadow-lg">
              <div className="flex-1 flex items-center gap-2 px-2">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                <Input
                  type="text"
                  placeholder="Enter your city or zip code"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="border-0 shadow-none focus-visible:ring-0 px-0 h-11"
                />
              </div>
              <Button size="lg" onClick={handleSearch} className="shrink-0">
                <Search className="h-4 w-4" />
                Find a Group Session
              </Button>
            </div>
          </div>

          {/* Secondary CTA */}
          <p className="text-sm text-muted-foreground mb-10">
            Are you a trainer?{" "}
            <a href="/for-trainers" className="text-primary font-semibold hover:underline">
              List your group sessions →
            </a>
          </p>

          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">3–8 players</span>
              <span>per session</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">Up to 60% less</span>
              <span>vs. private training</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">8 cities</span>
              <span>in NC</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
