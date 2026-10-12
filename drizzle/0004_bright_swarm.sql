ALTER TABLE "acceptance_criteria" ADD COLUMN "given_text" text;--> statement-breakpoint
ALTER TABLE "acceptance_criteria" ADD COLUMN "when_text" text;--> statement-breakpoint
ALTER TABLE "acceptance_criteria" ADD COLUMN "then_text" text;--> statement-breakpoint
ALTER TABLE "acceptance_criteria" ADD COLUMN "qa_failed_at" timestamp with time zone;