import { pgTable, text, serial, integer, boolean, varchar, timestamp, json, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  hwid: varchar("hwid"),
  role: varchar("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  price: integer("price").notNull(), // stored in cents
  categoryId: integer("category_id").references(() => categories.id),
  features: json("features").$type<string[]>(),
  imageUrl: varchar("image_url"),
  isBestseller: boolean("is_bestseller").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  status: varchar("status").notNull().default("pending"),
  total: integer("total").notNull(), // stored in cents
  paymentMethod: varchar("payment_method"),
  paymentId: varchar("payment_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(), // price at time of purchase, in cents
});

// HWID activation logs
export const hwidLogs = pgTable("hwid_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  hwid: varchar("hwid").notNull(),
  productId: integer("product_id").references(() => products.id),
  status: varchar("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define schemas and types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type Category = typeof categories.$inferSelect;
export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
});
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Product = typeof products.$inferSelect;
export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  slug: true,
  description: true,
  shortDescription: true,
  price: true,
  categoryId: true,
  features: true,
  imageUrl: true,
  isBestseller: true,
  isActive: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Review = typeof reviews.$inferSelect;
export const insertReviewSchema = createInsertSchema(reviews).pick({
  userId: true,
  productId: true,
  rating: true,
  comment: true,
});
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Order = typeof orders.$inferSelect;
export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  status: true,
  total: true,
  paymentMethod: true,
  paymentId: true,
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  quantity: true,
  price: true,
});
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type HwidLog = typeof hwidLogs.$inferSelect;
export const insertHwidLogSchema = createInsertSchema(hwidLogs).pick({
  userId: true,
  hwid: true,
  productId: true,
  status: true,
});
export type InsertHwidLog = z.infer<typeof insertHwidLogSchema>;

// Site settings
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  value: jsonb("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by").references(() => users.id),
});

// Temas
export const themes = pgTable("themes", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  isActive: boolean("is_active").default(false),
  primaryColor: varchar("primary_color").default("#00f0ff"),
  secondaryColor: varchar("secondary_color").default("#ff2a6d"),
  accentColor: varchar("accent_color").default("#7000ff"),
  backgroundColor: varchar("background_color").default("#050507"),
  textColor: varchar("text_color").default("#f9f9f9"),
  fontFamily: varchar("font_family").default("Share Tech Mono"),
  cssOverrides: text("css_overrides"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

// Assets (images, etc)
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // 'image', 'video', etc
  path: varchar("path").notNull(),
  url: varchar("url").notNull(),
  size: integer("size").notNull().default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
});

// Verificação de email
export const emailVerifications = pgTable("email_verifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  token: varchar("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tipos para as novas tabelas
export type SiteSetting = typeof siteSettings.$inferSelect;
export const insertSiteSettingSchema = createInsertSchema(siteSettings).pick({
  name: true,
  value: true,
  updatedBy: true,
});
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;

export type Theme = typeof themes.$inferSelect;
export const insertThemeSchema = createInsertSchema(themes).pick({
  name: true,
  isActive: true,
  primaryColor: true,
  secondaryColor: true,
  accentColor: true,
  backgroundColor: true,
  textColor: true,
  fontFamily: true,
  cssOverrides: true,
  createdBy: true,
});
export type InsertTheme = z.infer<typeof insertThemeSchema>;

export type Asset = typeof assets.$inferSelect;
export const insertAssetSchema = createInsertSchema(assets).pick({
  name: true,
  type: true,
  path: true,
  url: true,
  size: true,
  metadata: true,
  uploadedBy: true,
});
export type InsertAsset = z.infer<typeof insertAssetSchema>;

export type EmailVerification = typeof emailVerifications.$inferSelect;
export const insertEmailVerificationSchema = createInsertSchema(emailVerifications).pick({
  userId: true,
  token: true,
  expiresAt: true,
});
export type InsertEmailVerification = z.infer<typeof insertEmailVerificationSchema>;

// Game accounts marketplace
export const gameAccounts = pgTable("game_accounts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  game: varchar("game").notNull(),
  price: integer("price").notNull(), // stored in cents
  status: varchar("status").notNull().default("available"),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type GameAccount = typeof gameAccounts.$inferSelect;
export const insertGameAccountSchema = createInsertSchema(gameAccounts).pick({
  userId: true,
  title: true,
  description: true,
  game: true,
  price: true,
  imageUrl: true,
});
export type InsertGameAccount = z.infer<typeof insertGameAccountSchema>;
