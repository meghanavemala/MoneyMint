import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTables() {
  try {
    console.log('Creating Supabase tables...');

    // Create customers table
    const { error: customersError } = await supabase.rpc('create_customers_table');
    if (customersError) throw customersError;

    // Create transactions table
    const { error: transactionsError } = await supabase.rpc('create_transactions_table');
    if (transactionsError) throw transactionsError;

    // Create function to update timestamps
    const { error: functionError } = await supabase.rpc('update_updated_at_column');
    if (functionError) throw functionError;

    // Set up Row Level Security (RLS) policies
    await setupRLSPolicies();

    console.log('✅ Supabase tables created successfully!');
  } catch (error) {
    console.error('❌ Error setting up Supabase tables:', error);
    process.exit(1);
  }
}

async function setupRLSPolicies() {
  // Enable RLS on customers table
  await supabase.rpc('enable_rls', { table_name: 'customers' });

  // Customers policies
  await supabase.rpc('create_policy', {
    policy_name: 'Allow users to view their own customers',
    table_name: 'customers',
    using: 'auth.uid() = profile_id',
    check: null,
    with_check: null,
  });

  await supabase.rpc('create_policy', {
    policy_name: 'Allow users to insert their own customers',
    table_name: 'customers',
    using: null,
    check: 'auth.uid() = profile_id',
    with_check: 'auth.uid() = profile_id',
  });

  // Enable RLS on transactions table
  await supabase.rpc('enable_rls', { table_name: 'transactions' });

  // Transactions policies
  await supabase.rpc('create_policy', {
    policy_name: 'Allow users to view their own transactions',
    table_name: 'transactions',
    using: 'auth.uid() = profile_id',
    check: null,
    with_check: null,
  });

  await supabase.rpc('create_policy', {
    policy_name: 'Allow users to insert their own transactions',
    table_name: 'transactions',
    using: null,
    check: 'auth.uid() = profile_id',
    with_check: 'auth.uid() = profile_id',
  });
}

// Run the setup
setupTables();
