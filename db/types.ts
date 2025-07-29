import { PgTable } from 'drizzle-orm/pg-core';
import { customers, transactions } from './schema/finance-schema';
import { profilesTable } from './schema/profiles-schema';

export type DatabaseSchema = {
  customers: typeof customers;
  transactions: typeof transactions;
  profiles: typeof profilesTable;
};

export type Database = typeof import('./db').db;
