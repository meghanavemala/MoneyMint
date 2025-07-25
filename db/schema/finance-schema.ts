import {
  pgTable,
  text,
  timestamp,
  uuid,
  decimal,
  boolean
} from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { relations } from "drizzle-orm"
import { profilesTable as profiles } from "./profiles-schema"

// Customers table
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  email: text("email"),
  totalCredit: decimal("total_credit", { precision: 12, scale: 2 })
    .default("0")
    .notNull(),
  totalPaid: decimal("total_paid", { precision: 12, scale: 2 })
    .default("0")
    .notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 })
    .default("0")
    .notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  profileId: uuid("profile_id")
    .references(() => profiles.userId, { onDelete: "cascade" })
    .notNull()
})

// Transactions table
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .references(() => customers.id, { onDelete: "cascade" })
    .notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: text("type", { enum: ["CREDIT", "PAYMENT"] }).notNull(),
  description: text("description"),
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  profileId: uuid("profile_id")
    .references(() => profiles.userId, { onDelete: "cascade" })
    .notNull()
})

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
  transactions: many(transactions)
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  customer: one(customers, {
    fields: [transactions.customerId],
    references: [customers.id]
  })
}))

// Zod schemas for validation
export const insertCustomerSchema = createInsertSchema(customers, {
  name: schema => schema.min(2, "Name must be at least 2 characters"),
  phone: schema => schema.regex(/^[0-9+\-\s()]*$/, "Invalid phone number"),
  email: schema => schema.email("Invalid email")
})

export const selectCustomerSchema = createSelectSchema(customers)

export const insertTransactionSchema = createInsertSchema(transactions, {
  amount: schema =>
    schema.refine((val: string) => parseFloat(val) > 0, {
      message: "Amount must be greater than 0"
    })
})

export const selectTransactionSchema = createSelectSchema(transactions)

// Types
export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
