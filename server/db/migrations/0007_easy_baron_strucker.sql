-- Update any existing projects with old enum values to closest match
UPDATE "public"."projects" SET "type" = 'WEBSITE' WHERE "type" IN ('MARKETING', 'BRANDING', 'OTHER', 'MOBILE_APP');--> statement-breakpoint

ALTER TABLE "public"."projects" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."project_type";--> statement-breakpoint
CREATE TYPE "public"."project_type" AS ENUM('WEBSITE', 'E_COMMERCE', 'WEB_APP', 'LANDING_PAGE');--> statement-breakpoint
ALTER TABLE "public"."projects" ALTER COLUMN "type" SET DATA TYPE "public"."project_type" USING "type"::"public"."project_type";