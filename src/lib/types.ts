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
  pricePerPlayer: number;
  skillLevel: SkillLevel;
  ageRange: string;
  recurring: boolean;
}
