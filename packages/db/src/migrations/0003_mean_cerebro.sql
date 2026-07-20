ALTER TABLE "project_license" ADD COLUMN "terminated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "project_license" ADD COLUMN "termination_reason" text;