CREATE TABLE "player_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_user_id" varchar(255) NOT NULL,
	"name" varchar(200) NOT NULL,
	"birth_year" integer,
	"sport" varchar(100),
	"skill_level" varchar(50),
	"notes" text,
	"photo" text,
	"city" varchar(100),
	"bio" text,
	"is_public" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session_reminders" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"session_date" varchar(20) NOT NULL,
	"sent_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session_waitlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"clerk_user_id" varchar(255),
	"user_name" varchar(200),
	"user_email" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trainer_clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"trainer_clerk_id" varchar(255) NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(255),
	"phone" varchar(30),
	"sport" varchar(100),
	"level" varchar(50),
	"group_tag" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trainer_plan_interests" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer,
	"trainer_clerk_id" varchar(255) NOT NULL,
	"player_clerk_id" varchar(255),
	"player_name" varchar(200),
	"player_email" varchar(255),
	"type" varchar(20) DEFAULT 'interest' NOT NULL,
	"suggested_date" varchar(20),
	"suggested_time" varchar(20),
	"message" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trainer_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"trainer_clerk_id" varchar(255) NOT NULL,
	"date" varchar(20),
	"day_of_week" varchar(20),
	"time" varchar(20),
	"sport" varchar(100),
	"city" varchar(100),
	"note" text,
	"interest_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "training_request_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer NOT NULL,
	"trainer_clerk_id" varchar(255) NOT NULL,
	"trainer_name" varchar(200),
	"message" text,
	"proposed_rate" varchar(50),
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "training_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_clerk_id" varchar(255),
	"player_name" varchar(200) NOT NULL,
	"player_email" varchar(255) NOT NULL,
	"sport" varchar(100),
	"level" varchar(50),
	"city" varchar(100),
	"zip_code" varchar(20),
	"preferred_date" varchar(20),
	"preferred_time" varchar(20),
	"send_count" integer DEFAULT 1,
	"training_type" varchar(20) DEFAULT 'individual',
	"group_size" varchar(20),
	"sessions" varchar(20),
	"budget" varchar(50),
	"message" text,
	"status" varchar(20) DEFAULT 'open',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_session_id_sessions_id_fk";
--> statement-breakpoint
ALTER TABLE "trainer_follows" ADD COLUMN "status" varchar(20) DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE "trainer_sessions" ADD COLUMN "discount_pct" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "trainer_sessions" ADD COLUMN "discount_label" varchar(100);--> statement-breakpoint
ALTER TABLE "trainer_sessions" ADD COLUMN "start_date" varchar(20);--> statement-breakpoint
ALTER TABLE "trainer_sessions" ADD COLUMN "session_dates" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "trainer_sessions" ADD COLUMN "is_plan" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "trainer_sessions" ADD COLUMN "allow_late_booking" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "trainer_sessions" ADD COLUMN "waitlist_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "trainer_sessions" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "trainers" ADD COLUMN "coaching_locations" json DEFAULT '[]'::json;