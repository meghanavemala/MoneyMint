/*
Initializes the database connection and schema for the app.
*/

import { customers, profilesTable, transactions } from './schema';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { DatabaseSchema } from './types';

config({ path: '.env.local' });

const dbSchema = {
  profiles: profilesTable,
  customers,
  transactions,
} satisfies DatabaseSchema;

const client = postgres(process.env.DATABASE_URL!);

// Create the database client with proper typing
export const db: PostgresJsDatabase<DatabaseSchema> = drizzle(client, { schema: dbSchema });

export type Database = typeof db;
