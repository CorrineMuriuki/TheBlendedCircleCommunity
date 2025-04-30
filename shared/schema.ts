import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum for subscription tiers
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'basic', 'family', 'premium']);

// Enum for message types
export const messageTypeEnum = pgEnum('message_type', ['text', 'image', 'file', 'system']);

// Enum for event types
export const eventTypeEnum = pgEnum('event_type', ['workshop', 'social', 'live']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  subscriptionTier: subscriptionTierEnum("subscription_tier").default('free'),
  activityScore: integer("activity_score").default(0),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  newsletterSubscription: boolean("newsletter_subscription").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chat spaces table
export const chatSpaces = pgTable("chat_spaces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isPrivate: boolean("is_private").default(false),
  createdById: integer("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  type: messageTypeEnum("type").default('text'),
  chatSpaceId: integer("chat_space_id").notNull().references(() => chatSpaces.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chat space memberships table
export const chatSpaceMemberships = pgTable("chat_space_memberships", {
  id: serial("id").primaryKey(),
  chatSpaceId: integer("chat_space_id").notNull().references(() => chatSpaces.id),
  userId: integer("user_id").notNull().references(() => users.id),
  isAdmin: boolean("is_admin").default(false),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  eventType: eventTypeEnum("event_type").default('workshop'),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  imageUrl: text("image_url"),
  location: text("location"),
  isVirtual: boolean("is_virtual").default(true),
  maxAttendees: integer("max_attendees"),
  createdById: integer("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Event attendance table
export const eventAttendance = pgTable("event_attendance", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  userId: integer("user_id").notNull().references(() => users.id),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // Stored in cents
  imageUrl: text("image_url"),
  inventory: integer("inventory").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  avatarUrl: true,
  bio: true,
  newsletterSubscription: true,
});

export const insertChatSpaceSchema = createInsertSchema(chatSpaces).pick({
  name: true,
  description: true,
  isPrivate: true,
  createdById: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  content: true,
  type: true,
  chatSpaceId: true,
  userId: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  eventType: true,
  startDate: true,
  endDate: true,
  imageUrl: true,
  location: true,
  isVirtual: true,
  maxAttendees: true,
  createdById: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  imageUrl: true,
  inventory: true,
});

// Types for insert and select
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertChatSpace = z.infer<typeof insertChatSpaceSchema>;
export type ChatSpace = typeof chatSpaces.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type ChatSpaceMembership = typeof chatSpaceMemberships.$inferSelect;
export type EventAttendance = typeof eventAttendance.$inferSelect;
