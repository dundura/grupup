"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrainerCard } from "@/components/marketing/TrainerCard";
import { TrainerFilters } from "@/components/trainers/TrainerFilters";
import { trainers } from "@/lib/mock-data";

function TrainersPageInner() {
  const searchParams = useSearchParams();
  const initialCity = searchParams.get("city") || "all";

  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return trainers.filter((t) => {
      if (search) {
        const s = search.toLowerCase();
        if (
          !t.name.toLowerCase().includes(s) &&
          !t.city.toLowerCase().includes(s) &&
          !t.specialties.some((sp) => sp.toLowerCase().includes(s))
        ) {
          return false;
        }
      }
      if (selectedCity !== "all" && t.city !== selectedCity) return false;
      if (t.hourlyRate < priceRange[0] || t.hourlyRate > priceRange[1]) return false;
      if (selectedSpecialties.length > 0 && !selectedSpecialties.some((sp) => t.specialties.includes(sp as never))) {
        return false;
      }
      return true;
    });
  }, [search, selectedCity, priceRange, selectedSpecialties]);

  const resetFilters = () => {
    setSelectedCity("all");
    setPriceRange([0, 200]);
    setSelectedSpecialties([]);
  };

  return (
    <div>
      <div className="border-b bg-secondary/20">
        <div className="container py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Find your trainer</h1>
          <p className="text-muted-foreground mb-6">
            {filtered.length} trainer{filtered.length === 1 ? "" : "s"} available
          </p>

          <div className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, city, or specialty"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TrainerFilters
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                selectedSpecialties={selectedSpecialties}
                setSelectedSpecialties={setSelectedSpecialties}
                onReset={resetFilters}
              />
            </div>
          </aside>

          <div>
            {filtered.length === 0 ? (
              <div className="bg-card border rounded-2xl p-12 text-center">
                <div className="text-5xl mb-4">⚽</div>
                <h3 className="text-xl font-bold mb-2">No trainers match your filters</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your search or clearing filters.</p>
                <Button onClick={resetFilters}>Clear all filters</Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((trainer) => (
                  <TrainerCard key={trainer.id} trainer={trainer} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/50"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-background">
              <h2 className="font-bold text-lg">Filters</h2>
              <button
                onClick={() => setFiltersOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent/10"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <TrainerFilters
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                selectedSpecialties={selectedSpecialties}
                setSelectedSpecialties={setSelectedSpecialties}
                onReset={resetFilters}
              />
              <Button size="lg" className="w-full mt-6" onClick={() => setFiltersOpen(false)}>
                Show {filtered.length} trainer{filtered.length === 1 ? "" : "s"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrainersPage() {
  return (
    <Suspense fallback={<div className="container py-20 text-center">Loading...</div>}>
      <TrainersPageInner />
    </Suspense>
  );
}
