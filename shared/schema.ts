import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Story page interface for visual stories
export interface StoryPage {
  text: string;
  description: string;
}

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Book schema
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  childName: text("child_name").notNull(),
  childAge: text("child_age").notNull(),
  childGender: text("child_gender").notNull(),
  characterStyle: text("character_style").notNull(),
  hairStyle: text("hair_style").notNull(),
  skinTone: text("skin_tone").notNull(),
  storyTheme: text("story_theme").notNull(),
  storyGoal: text("story_goal").notNull(),
  storyLength: text("story_length").notNull(),
  storyContent: text("story_content").notNull(),
  coverImageUrl: text("cover_image_url"),
  previewImages: jsonb("preview_images").$type<string[]>(),
  // New fields for visual stories
  allPageImages: jsonb("all_page_images").$type<string[]>(),
  storyPages: jsonb("story_pages").$type<StoryPage[]>(),
  format: text("format").notNull(),
  price: text("price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id"),
  interests: jsonb("interests").$type<string[]>(),
  companions: jsonb("companions").$type<string[]>(),
});

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
});

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;

// Order schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  format: text("format").notNull(),
  total: text("total").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// API request schemas
export const bookGenerationSchema = z.object({
  childName: z.string().min(1, "Child's name is required"),
  childAge: z.string().min(1, "Age range is required"),
  childGender: z.string().min(1, "Gender is required"),
  interests: z.array(z.string()).min(1, "At least one interest is required").max(3, "Maximum of 3 interests"),
  characterStyle: z.string().min(1, "Character style is required"),
  hairStyle: z.string().min(1, "Hair style is required"),
  skinTone: z.string().min(1, "Skin tone is required"),
  storyTheme: z.string().min(1, "Story theme is required"),
  storyGoal: z.string().min(1, "Story goal is required"),
  companions: z.array(z.string()).max(2, "Maximum of 2 companions"),
  storyLength: z.string().min(1, "Story length is required"),
});

export type BookGenerationRequest = z.infer<typeof bookGenerationSchema>;

export const checkoutSchema = z.object({
  bookId: z.number().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  format: z.string().min(1, "Format is required"),
  total: z.string().min(1, "Total is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
});

export type CheckoutRequest = z.infer<typeof checkoutSchema>;
