ALTER TABLE "projects" ADD COLUMN "timeline_preference" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "preferred_launch_date" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "maintenance_required" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "hosting_preference" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "domain_status" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "integrations_needed" text[];--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "performance_requirements" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "seo_requirements" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "content_readiness" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "brand_assets_status" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "competitor_references" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "cms_required" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "target_audience" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "business_goals" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "success_metrics" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "compliance_requirements" text[];--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "communication_preference" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "key_stakeholders" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "approval_process" text;