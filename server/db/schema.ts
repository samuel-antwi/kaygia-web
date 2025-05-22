import {
  pgTable,
  text,
  timestamp,
  boolean,
  real,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum("role", ["CLIENT", "ADMIN", "SUPER_ADMIN"]);
export const projectStatusEnum = pgEnum("project_status", [
  "PENDING",
  "APPROVED",
  "IN_PROGRESS",
  "REVIEW",
  "COMPLETED",
  "CANCELLED",
]);
export const projectTypeEnum = pgEnum("project_type", [
  "WEBSITE",
  "E_COMMERCE",
  "WEB_APP",
  "MOBILE_APP",
  "BRANDING",
  "MARKETING",
  "OTHER",
]);
export const ticketStatusEnum = pgEnum("ticket_status", [
  "OPEN",
  "PENDING",
  "RESOLVED",
  "CLOSED",
]);
export const commentSenderEnum = pgEnum("comment_sender", ["CLIENT", "ADMIN"]);

// Tables
export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").unique().notNull(),
  name: text("name"),
  company: text("company"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastLoggedIn: timestamp("last_logged_in"),
  role: roleEnum("role").default("CLIENT").notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: projectStatusEnum("status").default("PENDING").notNull(),
  clientId: text("client_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  type: projectTypeEnum("type").notNull(),
  budget: real("budget"),
  requirements: text("requirements"),
});

export const supportTickets = pgTable("support_tickets", {
  id: text("id").primaryKey().notNull(),
  ticketNumber: text("ticket_number").notNull().unique(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: ticketStatusEnum("status").default("OPEN").notNull(),
  clientId: text("client_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  projectId: text("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastRepliedAt: timestamp("last_replied_at"),
});

export const ticketComments = pgTable("ticket_comments", {
  id: text("id").primaryKey().notNull(),
  content: text("content").notNull(),
  ticketId: text("ticket_id")
    .references(() => supportTickets.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  sender: commentSenderEnum("sender").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const passwordResets = pgTable("password_resets", {
  id: text("id").primaryKey().notNull(),
  token: text("token").notNull(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailVerifications = pgTable("email_verifications", {
  id: text("id").primaryKey().notNull(),
  token: text("token").notNull(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  supportTickets: many(supportTickets),
  ticketComments: many(ticketComments),
  passwordResets: many(passwordResets),
  emailVerifications: many(emailVerifications),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  client: one(users, {
    fields: [projects.clientId],
    references: [users.id],
  }),
}));

export const supportTicketsRelations = relations(
  supportTickets,
  ({ one, many }) => ({
    client: one(users, {
      fields: [supportTickets.clientId],
      references: [users.id],
    }),
    project: one(projects, {
      fields: [supportTickets.projectId],
      references: [projects.id],
    }),
    comments: many(ticketComments),
  })
);

export const ticketCommentsRelations = relations(ticketComments, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [ticketComments.ticketId],
    references: [supportTickets.id],
  }),
  user: one(users, {
    fields: [ticketComments.userId],
    references: [users.id],
  }),
}));

export const passwordResetsRelations = relations(passwordResets, ({ one }) => ({
  user: one(users, {
    fields: [passwordResets.userId],
    references: [users.id],
  }),
}));

export const emailVerificationsRelations = relations(
  emailVerifications,
  ({ one }) => ({
    user: one(users, {
      fields: [emailVerifications.userId],
      references: [users.id],
    }),
  })
);
