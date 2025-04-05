-- Add column as nullable first
ALTER TABLE "support_tickets" ADD COLUMN "ticket_number" text;--> statement-breakpoint

-- Update existing rows with random 5-digit numbers
UPDATE "support_tickets" SET "ticket_number" = 
  LPAD(FLOOR(random() * 90000 + 10000)::text, 5, '0');--> statement-breakpoint

-- Make column NOT NULL once data is populated
ALTER TABLE "support_tickets" ALTER COLUMN "ticket_number" SET NOT NULL;--> statement-breakpoint

-- Add unique constraint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_ticket_number_unique" UNIQUE("ticket_number");