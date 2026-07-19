CREATE TABLE "project_license" (
	"id" text PRIMARY KEY NOT NULL,
	"builder_id" text NOT NULL,
	"pack_id" text NOT NULL,
	"pack_release" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_license" ADD CONSTRAINT "project_license_builder_id_user_id_fk" FOREIGN KEY ("builder_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_license_builder_idx" ON "project_license" USING btree ("builder_id");