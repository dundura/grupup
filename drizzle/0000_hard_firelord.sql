CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar(50),
	"clerk_user_id" varchar(255) NOT NULL,
	"user_name" varchar(200),
	"user_email" varchar(255),
	"athlete_name" varchar(200),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"stripe_session_id" varchar(255),
	"amount_paid" integer,
	"session_count" integer DEFAULT 1,
	"booking_type" varchar(20) DEFAULT 'group',
	"trainer_clerk_id" varchar(255),
	"trainer_paid" boolean DEFAULT false NOT NULL,
	"trainer_paid_at" timestamp,
	"questionnaire_responses" json DEFAULT 'null'::json,
	"questionnaire_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "free_play_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"organizer_clerk_id" varchar(255),
	"organizer_name" varchar(200),
	"sport" varchar(100) NOT NULL,
	"sport_emoji" varchar(10),
	"title" varchar(255) NOT NULL,
	"level" varchar(100),
	"competitive_tier" varchar(100),
	"venue" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"date" varchar(50),
	"time" varchar(20),
	"duration" integer,
	"players_confirmed" integer DEFAULT 0,
	"players_needed" integer DEFAULT 10,
	"age_range" varchar(50),
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_clerk_id" varchar(255) NOT NULL,
	"to_clerk_id" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "player_follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"follower_clerk_id" varchar(255) NOT NULL,
	"target_clerk_id" varchar(255) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "player_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_clerk_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"sport" varchar(100),
	"type" varchar(50),
	"level" varchar(50),
	"age_range" varchar(50),
	"city" varchar(100),
	"max_players" integer DEFAULT 8,
	"description" text,
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"trainer_id" varchar(50),
	"title" varchar(255) NOT NULL,
	"sport" varchar(100) NOT NULL,
	"sport_emoji" varchar(10),
	"focus" varchar(255),
	"session_type" varchar(50) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100),
	"venue" varchar(255),
	"day_of_week" varchar(20),
	"time" varchar(20),
	"duration" integer,
	"date" varchar(50),
	"total_spots" integer NOT NULL,
	"spots_left" integer NOT NULL,
	"price_per_player" integer NOT NULL,
	"skill_level" varchar(50),
	"age_range" varchar(50),
	"recurring" boolean DEFAULT false,
	"special_offer_label" varchar(255),
	"special_offer_discount_pct" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trainer_follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"follower_clerk_id" varchar(255) NOT NULL,
	"trainer_clerk_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trainer_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"trainer_id" varchar(50),
	"booking_id" integer,
	"reviewer_clerk_id" varchar(255),
	"parent_name" varchar(200),
	"kid_name" varchar(200),
	"kid_age" integer,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trainer_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"trainer_clerk_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"sport" varchar(100) NOT NULL,
	"session_type" varchar(50) NOT NULL,
	"city" varchar(100),
	"zip_code" varchar(20),
	"venue" varchar(255),
	"day_of_week" varchar(20),
	"time" varchar(20),
	"duration" integer DEFAULT 60,
	"price_per_player" integer NOT NULL,
	"spots_total" integer NOT NULL,
	"spots_left" integer NOT NULL,
	"skill_level" varchar(50),
	"age_range" varchar(50),
	"recurring" boolean DEFAULT false,
	"recurring_weeks" integer,
	"session_photo" text,
	"notes" text,
	"instructions" text,
	"video_url" text,
	"first_class_free" boolean DEFAULT false NOT NULL,
	"questionnaire" json DEFAULT 'null'::json,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trainers" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"clerk_id" varchar(255),
	"name" varchar(200) NOT NULL,
	"photo" text,
	"bio" text,
	"phone" varchar(30),
	"hourly_rate" integer DEFAULT 85,
	"city" varchar(100),
	"state" varchar(100),
	"sport" varchar(100),
	"sports" json DEFAULT '[]'::json,
	"certifications" json DEFAULT '[]'::json,
	"specialties" json DEFAULT '[]'::json,
	"skill_levels" json DEFAULT '[]'::json,
	"rating" real DEFAULT 5,
	"review_count" integer DEFAULT 0,
	"years_experience" integer DEFAULT 0,
	"video_url" text,
	"zip_code" varchar(20),
	"stripe_account_id" varchar(255),
	"payout_method" varchar(50),
	"payout_handle" varchar(255),
	"gender" varchar(50),
	"is_approved" boolean DEFAULT true,
	"is_archived" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"blocker_clerk_id" varchar(255) NOT NULL,
	"blocked_clerk_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_trainer_id_trainers_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainer_reviews" ADD CONSTRAINT "trainer_reviews_trainer_id_trainers_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE no action ON UPDATE no action;