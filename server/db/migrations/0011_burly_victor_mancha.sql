ALTER TABLE "project_milestones" ADD COLUMN "phase" text;--> statement-breakpoint
ALTER TABLE "project_milestones" ADD COLUMN "weight" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "progress" integer DEFAULT 0 NOT NULL;