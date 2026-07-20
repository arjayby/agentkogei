ALTER TABLE "project_license" ADD COLUMN "polar_subscription_id" text;--> statement-breakpoint
ALTER TABLE "project_license" ADD COLUMN "premium_access_period_end" timestamp with time zone;
