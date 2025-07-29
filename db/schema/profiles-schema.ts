/*
Defines the database schema for profiles.
*/

import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const membershipEnum = pgEnum('membership', ['free', 'pro']);

export const profilesTable = pgTable('profiles', {
  userId: text('user_id').primaryKey().notNull(),
  membership: membershipEnum('membership').notNull().default('free'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type InsertProfile = typeof profilesTable.$inferInsert;
export type SelectProfile = typeof profilesTable.$inferSelect;
