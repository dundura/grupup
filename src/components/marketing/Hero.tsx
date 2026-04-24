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

          {/* Value pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-semibold">
              <Users className="h-3.5 w-3.5" />
              <span>Soccer · Basketball · More</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 text-accent px-4 py-1.5 text-xs font-semibold">
              <DollarSign className="h-3.5 w-3.5" />
              <span>Group &amp; private sessions available</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-700 px-4 py-1.5 text-xs font-semibold">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Train with friends, level up faster</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
            Elite sports training,{" "}
            <span className="text-primary">your way.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Grupup is the only platform built for <strong className="text-foreground">group sports training sessions</strong> — train with friends in soccer, basketball, and more, coached by elite trainers near you. Private sessions available too.
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
