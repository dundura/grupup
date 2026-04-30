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
  videoUrl?: string; // YouTube or direct video URL
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
  coverPhoto?: string;
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
  recurringWeeks?: number | null;
  specialOffer?: {
    label: string;       // e.g. "First session free", "20% off this week"
    discountPct: number; // 0–100; 100 = free
  };
  isFeatured?: boolean;
}

export type SessionType = "private" | "semi-private" | "small-group" | "clinic";

export const SESSION_TYPE_LABELS: Record<string, string> = {
  "private": "Private",
  "semi-private": "Group",
  "small-group": "Group",
  "clinic": "Group",
};

export const SESSION_TYPE_SPOTS: Record<string, string> = {
  "private": "1 player",
  "semi-private": "Group",
  "small-group": "Group",
  "clinic": "Group",
};

export const STANDARD_PRICES: Record<string, number> = {
  "private": 85,
  "semi-private": 30,
  "small-group": 30,
  "clinic": 22,
};

export const PLATFORM_FEE = 0.15;
export const TRAINER_SHARE = 1 - PLATFORM_FEE; // 85% to trainer

export interface PlayerProfile {
  id: string;
  firstName: string;
  lastName: string;
  sport: string;
  sportEmoji: string;
  team: string;             // e.g. "Triangle United MLS Next U16"
  competitiveTier: string;  // e.g. "MLS Next", "ECNL", "Club Travel"
  position: string;         // e.g. "Forward", "Midfielder"
  age: number;
  city: string;
  state: string;
  lookingFor: string;       // e.g. "2–3 training partners for group sessions in Cary"
  photo: string;
}

export const COMPETITIVE_TIERS = [
  "MLS Next",
  "ECNL / ECNL Regional",
  "NPL / USYS",
  "Club Travel",
  "High School Varsity",
  "High School JV",
  "Recreational",
];

export interface Squad {
  id: string;
  name: string;
  sport: string;
  sportEmoji: string;
  level: string;
  competitiveTier: string; // e.g. "MLS Next", "ECNL", "Club", "Recreational"
  ageRange: string;
  city: string;
  state: string;
  memberCount: number;
  maxMembers: number;
  lookingForTrainer: boolean;
  description: string;
  createdBy: string;
}

export interface FreePlayEvent {
  id: string;
  sport: string;
  sportEmoji: string;
  title: string;
  level: string;
  competitiveTier: string;
  venue: string;
  city: string;
  state: string;
  date: string;
  time: string;
  duration: number;
  playersConfirmed: number;
  playersNeeded: number;
  ageRange: string;
  description: string;
  organizer: string;
}
