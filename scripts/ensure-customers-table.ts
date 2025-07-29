import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';

async function ensureCustomersTable() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set in environment variables');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });

  try {
    // Check if customers table exists
    console.log('Checking if customers table exists...');
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'customers'
      );
    `;

    if (!tableExists[0].exists) {
      console.log('Customers table does not exist. Creating...');

      // Create the customers table
      await sql`
        CREATE TABLE IF NOT EXISTS public.customers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          address TEXT,
          notes TEXT,
          total_credit DECIMAL(12, 2) NOT NULL DEFAULT 0,
          total_paid DECIMAL(12, 2) NOT NULL DEFAULT 0,
          balance DECIMAL(12, 2) GENERATED ALWAYS AS (total_credit - total_paid) STORED,
          is_active BOOLEAN NOT NULL DEFAULT true,
          profile_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `;

      // Create indexes
      await sql`
        CREATE INDEX IF NOT EXISTS idx_customers_profile_id ON public.customers(profile_id);
        CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);
        CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
      `;

      // Create a trigger to update the updated_at column
      await sql`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `;

      await sql`
        CREATE TRIGGER update_customers_updated_at
        BEFORE UPDATE ON public.customers
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `;

      console.log('✅ Customers table created successfully');
    } else {
      console.log('✅ Customers table already exists');
    }

    // Verify the table structure
    console.log('\nTable structure:');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'customers';
    `;

    console.table(columns);
  } catch (error) {
    console.error('Error ensuring customers table:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

ensureCustomersTable();
