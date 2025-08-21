import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'company' or 'recruiter'
  industry: varchar("industry", { length: 100 }),
  location: varchar("location", { length: 255 }),
  description: text("description"),
  website: varchar("website", { length: 255 }),
  logoUrl: varchar("logo_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const experiences = pgTable("experiences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  companyId: varchar("company_id").references(() => companies.id).notNull(),
  position: varchar("position", { length: 255 }),
  applicationDate: timestamp("application_date").notNull(),
  receivedResponse: boolean("received_response").notNull(),
  responseTime: varchar("response_time", { length: 50 }), // 'same_day', '1_3_days', etc.
  communicationQuality: varchar("communication_quality", { length: 50 }), // 'excellent', 'good', 'fair', 'poor'
  comments: text("comments"),
  isAnonymous: boolean("is_anonymous").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  experiences: many(experiences),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  experiences: many(experiences),
}));

export const experiencesRelations = relations(experiences, ({ one }) => ({
  user: one(users, {
    fields: [experiences.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [experiences.companyId],
    references: [companies.id],
  }),
}));

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

export type Experience = typeof experiences.$inferSelect;
export type InsertExperience = typeof experiences.$inferInsert;

// Schemas
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExperienceSchema = createInsertSchema(experiences).omit({
  id: true,
  createdAt: true,
}).extend({
  companyName: z.string().min(1, "Company name is required"),
  companyType: z.enum(["company", "recruiter"]),
  companyIndustry: z.string().optional(),
});

export const searchCompaniesSchema = z.object({
  query: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(["company", "recruiter"]).optional(),
  responseRate: z.enum(["high", "medium", "low"]).optional(),
  sortBy: z.enum(["rating", "response_rate", "recent"]).default("rating"),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
});

export type SearchCompaniesInput = z.infer<typeof searchCompaniesSchema>;
