import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function ensureProfilesTable() {
  try {
    console.log('Checking if profiles table exists...');

    // Check if the table exists
    const { data: existingTables, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles');

    if (tableCheckError) {
      console.error('Error checking table existence:', tableCheckError);
      return;
    }

    if (existingTables && existingTables.length > 0) {
      console.log('✅ Profiles table already exists');
      return;
    }

    console.log('Creating profiles table...');

    // Create the profiles table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.profiles (
          user_id TEXT PRIMARY KEY NOT NULL,
          membership TEXT NOT NULL DEFAULT 'free',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );

        -- Create the membership enum if it doesn't exist
        DO $$ BEGIN
          CREATE TYPE membership AS ENUM ('free', 'pro');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        -- Add RLS policies
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view own profile" ON public.profiles
          FOR SELECT USING (true);

        CREATE POLICY "Users can insert own profile" ON public.profiles
          FOR INSERT WITH CHECK (true);

        CREATE POLICY "Users can update own profile" ON public.profiles
          FOR UPDATE USING (true);

        CREATE POLICY "Users can delete own profile" ON public.profiles
          FOR DELETE USING (true);
      `
    });

    if (createError) {
      console.error('Error creating profiles table:', createError);
      return;
    }

    console.log('✅ Profiles table created successfully');
  } catch (error) {
    console.error('Error ensuring profiles table:', error);
  }
}

ensureProfilesTable();
