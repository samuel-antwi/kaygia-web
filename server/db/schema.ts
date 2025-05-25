import {
  pgTable,
  text,
  timestamp,
  boolean,
  real,
  pgEnum,
  integer,
  varchar,
  jsonb,
  primaryKey,
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
  "LANDING_PAGE",
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
  avatarUrl: text("avatar_url"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastLoggedIn: timestamp("last_logged_in"),
  role: roleEnum("role").default("CLIENT").notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  deletedAt: timestamp("deleted_at"),
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
  
  // Timeline & Scope
  timelinePreference: text("timeline_preference"), // 'rush', 'standard', 'flexible'
  preferredLaunchDate: timestamp("preferred_launch_date"),
  maintenanceRequired: boolean("maintenance_required").default(false),
  
  // Technical Requirements
  hostingPreference: text("hosting_preference"), // 'client_managed', 'agency_managed', 'cloud_provider'
  domainStatus: text("domain_status"), // 'new_domain', 'existing_domain', 'subdomain'
  integrationsNeeded: text("integrations_needed").array(),
  performanceRequirements: text("performance_requirements"),
  seoRequirements: text("seo_requirements"),
  
  // Content & Assets
  contentReadiness: text("content_readiness"), // 'client_provides', 'need_copywriting', 'mixed'
  brandAssetsStatus: text("brand_assets_status"), // 'complete', 'partial', 'none'
  competitorReferences: text("competitor_references"),
  cmsRequired: boolean("cms_required").default(false),
  
  // Business Context
  targetAudience: text("target_audience"),
  businessGoals: text("business_goals"),
  successMetrics: text("success_metrics"),
  complianceRequirements: text("compliance_requirements").array(),
  
  // Communication
  communicationPreference: text("communication_preference"), // 'email', 'slack', 'meetings'
  timezone: text("timezone"),
  keyStakeholders: text("key_stakeholders"),
  approvalProcess: text("approval_process"),
  
  // Progress tracking
  progress: integer("progress").default(0).notNull(), // 0-100 percentage
  
  // Preview/staging
  previewUrl: text("preview_url"),
  previewPassword: text("preview_password"), // Optional password protection
  previewEnabled: boolean("preview_enabled").default(true).notNull(),
  previewExpiresAt: timestamp("preview_expires_at"), // Optional expiration
});

// Project files table
export const projectFiles = pgTable("project_files", {
  id: text("id").primaryKey().notNull(),
  projectId: text("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  originalName: text("original_name").notNull(),
  path: text("path").notNull(), // Supabase storage path
  type: text("type").notNull(), // file, image, document, etc.
  mimeType: text("mime_type"),
  size: real("size"), // file size in bytes
  uploadedBy: text("uploaded_by")
    .references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Project milestones table
export const projectMilestones = pgTable("project_milestones", {
  id: text("id").primaryKey().notNull(),
  projectId: text("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  targetDate: timestamp("target_date"),
  completedAt: timestamp("completed_at"),
  status: text("status").notNull().default("pending"), // 'pending', 'in_progress', 'completed'
  order: real("order").notNull().default(0), // For ordering milestones
  phase: text("phase"), // 'discovery', 'design', 'development', 'testing', 'deployment'
  weight: integer("weight").default(1).notNull(), // Weight for progress calculation
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Project updates/activity feed table
export const projectUpdates = pgTable("project_updates", {
  id: text("id").primaryKey().notNull(),
  projectId: text("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'progress', 'milestone', 'feedback', 'general'
  author: text("author").notNull(), // Name of team member
  authorRole: text("author_role"), // 'Project Manager', 'Developer', 'Designer'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Project deliverables table
export const projectDeliverables = pgTable("project_deliverables", {
  id: text("id").primaryKey().notNull(),
  projectId: text("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'file', 'link', 'preview'
  url: text("url"), // For links and previews
  fileId: text("file_id")
    .references(() => projectFiles.id, { onDelete: "set null" }), // For file deliverables
  status: text("status").notNull().default("pending"), // 'pending', 'ready', 'approved', 'rejected'
  fileType: text("file_type"), // 'pdf', 'image', 'doc', 'link'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
  approvedBy: text("approved_by")
    .references(() => users.id, { onDelete: "set null" }),
});

// Project comments table
export const projectComments = pgTable("project_comments", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  message: text("message").notNull(),
  type: text("type").default("comment"), // 'comment', 'feedback', 'question'
  parentId: text("parent_id"), // Will be set up as self-reference later
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

// Messaging tables
export const conversationTypeEnum = pgEnum("conversation_type", ["project", "support", "general"]);
export const conversationStatusEnum = pgEnum("conversation_status", ["active", "archived", "closed"]);

export const conversations = pgTable("conversations", {
  id: text("id").primaryKey().notNull(),
  projectId: text("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title"),
  type: conversationTypeEnum("type").default("project").notNull(),
  status: conversationStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastMessageAt: timestamp("last_message_at"),
  createdBy: text("created_by").references(() => users.id),
});

export const conversationParticipants = pgTable("conversation_participants", {
  conversationId: text("conversation_id")
    .references(() => conversations.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  role: text("role").default("member"), // owner, admin, member
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  lastReadAt: timestamp("last_read_at"),
}, (table) => ({
  pk: primaryKey({ columns: [table.conversationId, table.userId] })
}));

export const messages = pgTable("messages", {
  id: text("id").primaryKey().notNull(),
  conversationId: text("conversation_id")
    .references(() => conversations.id, { onDelete: "cascade" })
    .notNull(),
  senderId: text("sender_id")
    .references(() => users.id, { onDelete: "set null" }),
  content: text("content").notNull(),
  type: text("type").default("text"), // text, file, system
  metadata: jsonb("metadata").default({}), // For reactions, edits, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  editedAt: timestamp("edited_at"),
  deletedAt: timestamp("deleted_at"),
});

export const messageFiles = pgTable("message_files", {
  id: text("id").primaryKey().notNull(),
  messageId: text("message_id")
    .references(() => messages.id, { onDelete: "cascade" })
    .notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  fileUrl: text("file_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messageReadReceipts = pgTable("message_read_receipts", {
  messageId: text("message_id")
    .references(() => messages.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  readAt: timestamp("read_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.messageId, table.userId] })
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  supportTickets: many(supportTickets),
  ticketComments: many(ticketComments),
  passwordResets: many(passwordResets),
  emailVerifications: many(emailVerifications),
  projectFiles: many(projectFiles),
  projectComments: many(projectComments),
  conversationParticipants: many(conversationParticipants),
  messages: many(messages),
  messageReadReceipts: many(messageReadReceipts),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(users, {
    fields: [projects.clientId],
    references: [users.id],
  }),
  files: many(projectFiles),
  updates: many(projectUpdates),
  deliverables: many(projectDeliverables),
  comments: many(projectComments),
  milestones: many(projectMilestones),
  conversations: many(conversations),
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

// Project files relations
export const projectFilesRelations = relations(projectFiles, ({ one }) => ({
  project: one(projects, {
    fields: [projectFiles.projectId],
    references: [projects.id],
  }),
  uploadedBy: one(users, {
    fields: [projectFiles.uploadedBy],
    references: [users.id],
  }),
}));

// Project updates relations
export const projectUpdatesRelations = relations(projectUpdates, ({ one }) => ({
  project: one(projects, {
    fields: [projectUpdates.projectId],
    references: [projects.id],
  }),
}));

// Project deliverables relations
export const projectDeliverablesRelations = relations(projectDeliverables, ({ one }) => ({
  project: one(projects, {
    fields: [projectDeliverables.projectId],
    references: [projects.id],
  }),
  file: one(projectFiles, {
    fields: [projectDeliverables.fileId],
    references: [projectFiles.id],
  }),
  approvedBy: one(users, {
    fields: [projectDeliverables.approvedBy],
    references: [users.id],
  }),
}));

// Project comments relations
export const projectCommentsRelations = relations(projectComments, ({ one, many }) => ({
  project: one(projects, {
    fields: [projectComments.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectComments.userId],
    references: [users.id],
  }),
  parent: one(projectComments, {
    fields: [projectComments.parentId],
    references: [projectComments.id],
    relationName: "parentComment"
  }),
  replies: many(projectComments, {
    relationName: "parentComment"
  }),
}));

// Project milestones relations
export const projectMilestonesRelations = relations(projectMilestones, ({ one }) => ({
  project: one(projects, {
    fields: [projectMilestones.projectId],
    references: [projects.id],
  }),
}));

// Messaging Relations

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  project: one(projects, {
    fields: [conversations.projectId],
    references: [projects.id],
  }),
  creator: one(users, {
    fields: [conversations.createdBy],
    references: [users.id],
  }),
  messages: many(messages),
  participants: many(conversationParticipants),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  files: many(messageFiles),
  readReceipts: many(messageReadReceipts),
}));

export const messageFilesRelations = relations(messageFiles, ({ one }) => ({
  message: one(messages, {
    fields: [messageFiles.messageId],
    references: [messages.id],
  }),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationParticipants.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationParticipants.userId],
    references: [users.id],
  }),
}));

export const messageReadReceiptsRelations = relations(messageReadReceipts, ({ one }) => ({
  message: one(messages, {
    fields: [messageReadReceipts.messageId],
    references: [messages.id],
  }),
  user: one(users, {
    fields: [messageReadReceipts.userId],
    references: [users.id],
  }),
}));
