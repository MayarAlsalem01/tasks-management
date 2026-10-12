ALTER TABLE "projects" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "must_change_password" boolean DEFAULT false NOT NULL;