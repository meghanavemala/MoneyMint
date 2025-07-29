// Type definitions for @/db

declare module '@/db' {
  import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

  const db: PostgresJsDatabase<Record<string, unknown>>;
  export { db };

  // Export types from the schema
  export * from '@/db/schema';
}

declare module '@/db/schema' {
  import { PgTableWithColumns } from 'drizzle-orm/pg-core';
  import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

  // Customer table type
  export interface CustomerTable
    extends PgTableWithColumns<{
      name: string;
      schema: undefined;
      columns: {
        id: {
          name: 'id';
          dataType: 'string';
          columnType: 'PgVarchar';
          data: string;
          driverParam: string;
          hasDefault: boolean;
          notNull: true;
          enumValues: undefined;
        };
        name: {
          name: 'name';
          dataType: 'string';
          columnType: 'PgVarchar';
          data: string;
          driverParam: string;
          hasDefault: false;
          notNull: true;
          enumValues: undefined;
        };
        phone: {
          name: 'phone';
          dataType: 'string';
          columnType: 'PgVarchar';
          data: string | null;
          driverParam: string | null;
          hasDefault: false;
          notNull: false;
          enumValues: undefined;
        };
        address: {
          name: 'address';
          dataType: 'string';
          columnType: 'PgText';
          data: string | null;
          driverParam: string | null;
          hasDefault: false;
          notNull: false;
          enumValues: undefined;
        };
        email: {
          name: 'email';
          dataType: 'string';
          columnType: 'PgVarchar';
          data: string | null;
          driverParam: string | null;
          hasDefault: false;
          notNull: false;
          enumValues: undefined;
        };
        totalCredit: {
          name: 'totalCredit';
          dataType: 'string';
          columnType: 'PgVarchar';
          data: string;
          driverParam: string;
          hasDefault: true;
          notNull: true;
          enumValues: undefined;
        };
        totalPaid: {
          name: 'totalPaid';
          dataType: 'string';
          columnType: 'PgVarchar';
          data: string;
          driverParam: string;
          hasDefault: true;
          notNull: true;
          enumValues: undefined;
        };
        balance: {
          name: 'balance';
          dataType: 'string';
          columnType: 'PgVarchar';
          data: string;
          driverParam: string;
          hasDefault: true;
          notNull: true;
          enumValues: undefined;
        };
        isActive: {
          name: 'isActive';
          dataType: 'boolean';
          columnType: 'PgBoolean';
          data: boolean;
          driverParam: boolean;
          hasDefault: true;
          notNull: true;
          enumValues: undefined;
        };
        notes: {
          name: 'notes';
          dataType: 'string';
          columnType: 'PgText';
          data: string | null;
          driverParam: string | null;
          hasDefault: false;
          notNull: false;
          enumValues: undefined;
        };
        createdAt: {
          name: 'createdAt';
          dataType: 'date';
          columnType: 'PgTimestamp';
          data: Date;
          driverParam: string;
          hasDefault: true;
          notNull: true;
          enumValues: undefined;
        };
        updatedAt: {
          name: 'updatedAt';
          dataType: 'date';
          columnType: 'PgTimestamp';
          data: Date;
          driverParam: string;
          hasDefault: true;
          notNull: true;
          enumValues: undefined;
        };
        profileId: {
          name: 'profileId';
          dataType: 'string';
          columnType: 'PgVarchar';
          data: string;
          driverParam: string;
          hasDefault: false;
          notNull: true;
          enumValues: undefined;
        };
      };
    }> {}

  // Transaction table type
  export interface TransactionTable
    extends PgTableWithColumns<{
      name: string;
      schema: undefined;
      columns: {
        id: {
          name: 'id';
          dataType: 'string';
          columnType: 'PgVarchar';
          data: string;
          driverParam: string;
          hasDefault: true;
          notNull: true;
          enumValues: undefined;
        };
        customerId: {
          name: 'customerId';
          dataType: 'string';
          columnType: 'PgVarchar';
          data: string;
          driverParam: string;
          hasDefault: false;
          notNull: true;
          enumValues: undefined;
        };
        amount: {
          name: 'amount';
          dataType: 'string';
          columnType: 'PgVarchar';
          data: string;
          driverParam: string;
          hasDefault: false;
          notNull: true;
          enumValues: undefined;
        };
        type: {
          name: 'type';
          dataType: 'string';
          columnType: 'PgVarchar';
          data: 'CREDIT' | 'PAYMENT';
          driverParam: string;
          hasDefault: false;
          notNull: true;
          enumValues: ['CREDIT', 'PAYMENT'];
        };
        description: {
          name: 'description';
          dataType: 'string';
          columnType: 'PgText';
          data: string | null;
          driverParam: string | null;
          hasDefault: false;
          notNull: false;
          enumValues: undefined;
        };
        transactionDate: {
          name: 'transactionDate';
          dataType: 'date';
          columnType: 'PgTimestamp';
          data: Date;
          driverParam: string;
          hasDefault: true;
          notNull: true;
          enumValues: undefined;
        };
        createdAt: {
          name: 'createdAt';
          dataType: 'date';
          columnType: 'PgTimestamp';
          data: Date;
          driverParam: string;
          hasDefault: true;
          notNull: true;
          enumValues: undefined;
        };
        profileId: {
          name: 'profileId';
          dataType: 'string';
          columnType: 'PgVarchar';
          data: string;
          driverParam: string;
          hasDefault: false;
          notNull: true;
          enumValues: undefined;
        };
      };
    }> {}

  // Export the actual table instances
  export const customers: CustomerTable;
  export const transactions: TransactionTable;

  // Export types for the tables
  export type Customer = InferSelectModel<CustomerTable>;
  export type NewCustomer = InferInsertModel<CustomerTable>;
  export type Transaction = InferSelectModel<TransactionTable>;
  export type NewTransaction = InferInsertModel<TransactionTable>;

  // Export relations
  export const customersRelations: any;
  export const transactionsRelations: any;
}
