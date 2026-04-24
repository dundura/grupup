export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Elite";

export type Specialty =
  | "Finishing"
  | "Ball Control"
  | "Speed & Agility"
  | "Goalkeeping"
  | "Defending"
  | "1v1"
  | "Youth Development"
  | "Technical Skills"
  | "Passing"
  | "Shooting";

export interface Review {
  id: string;
  parentName: string;
  kidName: string;
  kidAge: number;
  rating: number;
  date: string;
  comment: string;
}

export interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Trainer {
  id: string;
  name: string;
  photo: string;
  bio: string;
  hourlyRate: number;
  city: string;
  state: string;
  certifications: string[];
  specialties: Specialty[];
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  skillLevels: SkillLevel[];
  availability: AvailabilitySlot[];
  reviews: Review[];
}

export interface Testimonial {
  id: string;
  parentName: string;
  kidName: string;
  kidAge: number;
  city: string;
  quote: string;
  rating: number;
}

export interface FilterState {
  search: string;
  city: string;
  priceRange: [number, number];
  experienceLevel: string;
  specialties: Specialty[];
}

export interface GroupSession {
  sessionType: SessionType;
  id: string;
  title: string;
  sport: string;
  sportEmoji: string;
  focus: string;
  trainer: {
    id: string;
    name: string;
    photo: string;
    rating: number;
  };
  city: string;
  state: string;
  venue: string;
  dayOfWeek: string;
  time: string;
  duration: number;
  date: string;
  totalSpots: number;
  spotsLeft: number;
  /**
   * For group sessions (semi-private, small-group, clinic): platform-set standard price.
   * For private: trainer sets their own rate; pricePerPlayer = trainerRate * (1 + PLATFORM_FEE).
   */
  trainerRate?: number;
  pricePerPlayer: number;
  skillLevel: SkillLevel;
  ageRange: string;
  recurring: boolean;
}

export type SessionType = "private" | "semi-private" | "small-group" | "clinic";

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  "private": "Private",
  "semi-private": "Semi-Private",
  "small-group": "Small Group",
  "clinic": "Clinic",
};

export const SESSION_TYPE_SPOTS: Record<SessionType, string> = {
  "private": "1 player",
  "semi-private": "2–3 players",
  "small-group": "4–6 players",
  "clinic": "7+ players",
};

// Platform sets all prices — trainers pick the format, not the rate (Uber model)
export const STANDARD_PRICES: Record<SessionType, number> = {
  "private": 85,        // per session
  "semi-private": 40,   // per player
  "small-group": 28,    // per player
  "clinic": 18,         // per player
};

export const PLATFORM_FEE = 0.15;
export const TRAINER_SHARE = 1 - PLATFORM_FEE; // 85% to trainer
