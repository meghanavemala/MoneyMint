/*
Initializes the database connection and schema for the app.
*/

import { customers, profilesTable, transactions } from "./schema"
import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

config({ path: ".env.local" })

const dbSchema = {
  profiles: profilesTable,
  customers,
  transactions
}

const client = postgres(process.env.DATABASE_URL!)

export const db = drizzle(client, { schema: dbSchema })
