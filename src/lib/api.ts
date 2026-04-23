import { trainers } from "./mock-data";
import type { Trainer } from "./types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getTrainers(): Promise<Trainer[]> {
  await delay(300);
  return trainers;
}

export async function getTrainer(id: string): Promise<Trainer | null> {
  await delay(300);
  return trainers.find((t) => t.id === id) ?? null;
}

export async function searchTrainers(filters: {
  search?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  specialties?: string[];
}): Promise<Trainer[]> {
  await delay(300);
  let result = [...trainers];

  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.name.toLowerCase().includes(s) ||
        t.city.toLowerCase().includes(s) ||
        t.specialties.some((sp) => sp.toLowerCase().includes(s))
    );
  }

  if (filters.city && filters.city !== "all") {
    result = result.filter((t) => t.city === filters.city);
  }

  if (filters.minPrice !== undefined) {
    result = result.filter((t) => t.hourlyRate >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    result = result.filter((t) => t.hourlyRate <= filters.maxPrice!);
  }

  if (filters.specialties && filters.specialties.length > 0) {
    result = result.filter((t) =>
      filters.specialties!.some((sp) => t.specialties.includes(sp as Trainer["specialties"][number]))
    );
  }

  return result;
}
