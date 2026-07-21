CREATE TABLE "premium_entitlement_event" (
	"id" text PRIMARY KEY NOT NULL,
	"builder_id" text NOT NULL,
	"pack_id" text NOT NULL,
	"pack_release" text NOT NULL,
	"action" text NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "premium_entitlement_event" ADD CONSTRAINT "premium_entitlement_event_builder_id_user_id_fk" FOREIGN KEY ("builder_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "premium_entitlement_event_builder_idx" ON "premium_entitlement_event" USING btree ("builder_id");