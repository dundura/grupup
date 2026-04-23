"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cities, allSpecialties } from "@/lib/mock-data";

interface TrainerFiltersProps {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedSpecialties: string[];
  setSelectedSpecialties: (s: string[]) => void;
  onReset: () => void;
}

export function TrainerFilters({
  selectedCity,
  setSelectedCity,
  priceRange,
  setPriceRange,
  selectedSpecialties,
  setSelectedSpecialties,
  onReset,
}: TrainerFiltersProps) {
  const toggleSpecialty = (spec: string) => {
    if (selectedSpecialties.includes(spec)) {
      setSelectedSpecialties(selectedSpecialties.filter((s) => s !== spec));
    } else {
      setSelectedSpecialties([...selectedSpecialties, spec]);
    }
  };

  const priceTiers: { label: string; range: [number, number] }[] = [
    { label: "Any price", range: [0, 200] },
    { label: "Under $60", range: [0, 60] },
    { label: "$60 - $90", range: [60, 90] },
    { label: "$90+", range: [90, 200] },
  ];

  const hasActiveFilters =
    selectedCity !== "all" ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 200 ||
    selectedSpecialties.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-8 px-2 text-sm">
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      <div>
        <label className="text-sm font-semibold mb-3 block">City</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSelectedCity("all")}
            className={`text-sm px-3 py-2 rounded-lg border transition-colors ${
              selectedCity === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-accent/10"
            }`}
          >
            All cities
          </button>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`text-sm px-3 py-2 rounded-lg border transition-colors ${
                selectedCity === city
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-accent/10"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold mb-3 block">Price per session</label>
        <div className="space-y-2">
          {priceTiers.map((tier) => {
            const active = priceRange[0] === tier.range[0] && priceRange[1] === tier.range[1];
            return (
              <button
                key={tier.label}
                onClick={() => setPriceRange(tier.range)}
                className={`w-full text-left text-sm px-3 py-2.5 rounded-lg border transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-accent/10"
                }`}
              >
                {tier.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold mb-3 block">Specialties</label>
        <div className="flex flex-wrap gap-2">
          {allSpecialties.map((spec) => {
            const active = selectedSpecialties.includes(spec);
            return (
              <button
                key={spec}
                onClick={() => toggleSpecialty(spec)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-accent/10"
                }`}
              >
                {spec}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
