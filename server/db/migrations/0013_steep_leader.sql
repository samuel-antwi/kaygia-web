ALTER TABLE "projects" ADD COLUMN "preview_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "preview_expires_at" timestamp;