import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { profilesTable } from '../db/schema/profiles-schema';

async function ensureProfilesTable() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set in environment variables');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(sql);

  try {
    // Check if profiles table exists
    console.log('Checking if profiles table exists...');
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
      );
    `;

    if (!tableExists[0].exists) {
      console.log('Profiles table does not exist. Creating...');

      // Create the membership enum type
      await sql`
        CREATE TYPE membership AS ENUM ('free', 'pro');
      `;

      // Create the profiles table
      await sql`
        CREATE TABLE IF NOT EXISTS public.profiles (
          user_id TEXT PRIMARY KEY NOT NULL,
          membership membership NOT NULL DEFAULT 'free',
          stripe_customer_id TEXT,
          stripe_subscription_id TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
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
        CREATE TRIGGER update_profiles_updated_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `;

      console.log('✅ Profiles table created successfully');
    } else {
      console.log('✅ Profiles table already exists');
    }

    // Verify the table structure
    console.log('\nTable structure:');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'profiles';
    `;

    console.table(columns);
  } catch (error) {
    console.error('Error ensuring profiles table:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

ensureProfilesTable();
