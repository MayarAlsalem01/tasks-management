CREATE TYPE "public"."assignment_role" AS ENUM('DEVELOPER', 'QA');--> statement-breakpoint
CREATE TYPE "public"."dev_status" AS ENUM('not-started', 'in-progress', 'blocked', 'done');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('ASSIGNED', 'QA_FAILED', 'ACS_DEV_COMPLETE');--> statement-breakpoint
CREATE TYPE "public"."pr_state" AS ENUM('open', 'merged', 'draft', 'closed');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."qa_status" AS ENUM('not-tested', 'passed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."spec_status" AS ENUM('draft', 'pending-review', 'approved');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'PO', 'DEVELOPER', 'QA');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"entity_name" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"user_id" uuid,
	"action" varchar(50) NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(150) NOT NULL,
	"message" text NOT NULL,
	"link_url" varchar(255),
	"project_id" uuid,
	"fr_id" uuid,
	"actor_id" uuid,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"added_by" uuid,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_members_project_id_user_id_pk" PRIMARY KEY("project_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "acceptance_criteria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fr_id" uuid NOT NULL,
	"ac_code" varchar(10) NOT NULL,
	"criteria_text" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"dev_done" boolean DEFAULT false NOT NULL,
	"dev_done_by" uuid,
	"dev_done_at" timestamp with time zone,
	"qa_passed" boolean DEFAULT false NOT NULL,
	"qa_passed_by" uuid,
	"qa_passed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fr_id" uuid NOT NULL,
	"ac_id" uuid,
	"author_id" uuid NOT NULL,
	"body" text NOT NULL,
	"is_defect" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fr_assignees" (
	"fr_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "assignment_role" NOT NULL,
	"assigned_by" uuid,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fr_assignees_fr_id_user_id_role_pk" PRIMARY KEY("fr_id","user_id","role")
);
--> statement-breakpoint
CREATE TABLE "functional_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"step_id" uuid NOT NULL,
	"fr_code" varchar(20) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"priority" "priority" DEFAULT 'medium' NOT NULL,
	"spec_status" "spec_status" DEFAULT 'draft' NOT NULL,
	"is_ai" boolean DEFAULT false NOT NULL,
	"open_issues" text,
	"dev_status" "dev_status" DEFAULT 'not-started' NOT NULL,
	"qa_status" "qa_status" DEFAULT 'not-tested' NOT NULL,
	"target_date" date,
	"notes" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pull_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fr_id" uuid NOT NULL,
	"url" varchar(500) NOT NULL,
	"title" varchar(255),
	"state" "pr_state" DEFAULT 'open' NOT NULL,
	"added_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" uuid NOT NULL,
	"role" "user_role" NOT NULL,
	"granted_by" uuid,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_user_id_role_pk" PRIMARY KEY("user_id","role")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"full_name" varchar(100),
	"email" varchar(100),
	"failed_login_count" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deactivated_at" timestamp with time zone,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_fr_id_functional_requirements_id_fk" FOREIGN KEY ("fr_id") REFERENCES "public"."functional_requirements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "steps" ADD CONSTRAINT "steps_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "steps" ADD CONSTRAINT "steps_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acceptance_criteria" ADD CONSTRAINT "acceptance_criteria_fr_id_functional_requirements_id_fk" FOREIGN KEY ("fr_id") REFERENCES "public"."functional_requirements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acceptance_criteria" ADD CONSTRAINT "acceptance_criteria_dev_done_by_users_id_fk" FOREIGN KEY ("dev_done_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acceptance_criteria" ADD CONSTRAINT "acceptance_criteria_qa_passed_by_users_id_fk" FOREIGN KEY ("qa_passed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_fr_id_functional_requirements_id_fk" FOREIGN KEY ("fr_id") REFERENCES "public"."functional_requirements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_ac_id_acceptance_criteria_id_fk" FOREIGN KEY ("ac_id") REFERENCES "public"."acceptance_criteria"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fr_assignees" ADD CONSTRAINT "fr_assignees_fr_id_functional_requirements_id_fk" FOREIGN KEY ("fr_id") REFERENCES "public"."functional_requirements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fr_assignees" ADD CONSTRAINT "fr_assignees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fr_assignees" ADD CONSTRAINT "fr_assignees_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "functional_requirements" ADD CONSTRAINT "functional_requirements_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "functional_requirements" ADD CONSTRAINT "functional_requirements_step_id_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."steps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "functional_requirements" ADD CONSTRAINT "functional_requirements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "functional_requirements" ADD CONSTRAINT "functional_requirements_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pull_requests" ADD CONSTRAINT "pull_requests_fr_id_functional_requirements_id_fk" FOREIGN KEY ("fr_id") REFERENCES "public"."functional_requirements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pull_requests" ADD CONSTRAINT "pull_requests_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_name","entity_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_project_idx" ON "audit_logs" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_user_read_idx" ON "notifications" USING btree ("user_id","read_at");--> statement-breakpoint
CREATE INDEX "activities_project_order_idx" ON "activities" USING btree ("project_id","sort_order");--> statement-breakpoint
CREATE INDEX "project_members_user_idx" ON "project_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_code_key" ON "projects" USING btree ("code") WHERE "projects"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "steps_activity_order_idx" ON "steps" USING btree ("activity_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "ac_fr_code_key" ON "acceptance_criteria" USING btree ("fr_id","ac_code") WHERE "acceptance_criteria"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "comments_fr_created_idx" ON "comments" USING btree ("fr_id","created_at");--> statement-breakpoint
CREATE INDEX "comments_ac_idx" ON "comments" USING btree ("ac_id");--> statement-breakpoint
CREATE INDEX "fr_assignees_user_idx" ON "fr_assignees" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fr_project_code_key" ON "functional_requirements" USING btree ("project_id","fr_code") WHERE "functional_requirements"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "fr_step_idx" ON "functional_requirements" USING btree ("step_id");--> statement-breakpoint
CREATE INDEX "fr_project_dev_status_idx" ON "functional_requirements" USING btree ("project_id","dev_status");--> statement-breakpoint
CREATE INDEX "pull_requests_fr_idx" ON "pull_requests" USING btree ("fr_id");