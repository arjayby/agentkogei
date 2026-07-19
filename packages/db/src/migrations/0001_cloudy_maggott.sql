CREATE TABLE "device_authorization_request" (
	"id" text PRIMARY KEY NOT NULL,
	"device_code_hash" text NOT NULL,
	"user_code_hash" text NOT NULL,
	"credential_name" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"builder_id" text,
	"expires_at" timestamp with time zone NOT NULL,
	"last_polled_at" timestamp with time zone,
	"polling_interval" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pack_credential" (
	"id" text PRIMARY KEY NOT NULL,
	"builder_id" text NOT NULL,
	"name" text NOT NULL,
	"secret_hash" text NOT NULL,
	"secret_suffix" text NOT NULL,
	"scope" text DEFAULT 'premium:retrieve' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "device_authorization_request" ADD CONSTRAINT "device_authorization_request_builder_id_user_id_fk" FOREIGN KEY ("builder_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pack_credential" ADD CONSTRAINT "pack_credential_builder_id_user_id_fk" FOREIGN KEY ("builder_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "device_authorization_device_code_idx" ON "device_authorization_request" USING btree ("device_code_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "device_authorization_user_code_idx" ON "device_authorization_request" USING btree ("user_code_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "pack_credential_secret_hash_idx" ON "pack_credential" USING btree ("secret_hash");--> statement-breakpoint
CREATE INDEX "pack_credential_builder_idx" ON "pack_credential" USING btree ("builder_id");