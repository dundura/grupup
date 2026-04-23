"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Star, ShieldCheck } from "lucide-react";
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
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="container relative py-16 md:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur px-4 py-1.5 text-xs font-semibold mb-6">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Vetted trainers. Real results.</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
            Book 1-on-1 soccer training,{" "}
            <span className="text-primary">anywhere.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Elite private trainers, matched to your player&apos;s age, level, and goals. Book in seconds, train on your schedule.
          </p>

          <div className="max-w-xl mx-auto mb-6">
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
                Find a Trainer
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="font-semibold text-foreground">4.9</span>
              <span>avg rating</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">500+</span>
              <span>sessions booked</span>
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
