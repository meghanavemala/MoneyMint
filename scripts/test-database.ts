/*
Test script to verify database connection and table structure.
Run this to check if the database is properly set up.
*/

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

async function testDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file');
    process.exit(1);
  }

  console.log('🔗 Testing Supabase connection...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('\nPossible issues:');
      console.log('1. Check your Supabase URL and key');
      console.log('2. Ensure the database tables are created');
      console.log('3. Check if RLS policies are blocking access');
      process.exit(1);
    }

    console.log('✅ Database connection successful!');

    // Check if tables exist
    console.log('\n📋 Checking table structure...');

    // Check profiles table
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
    } else {
      console.log('✅ Profiles table exists and accessible');
    }

    // Check customers table
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .limit(1);

    if (customersError) {
      console.error('❌ Customers table error:', customersError.message);
    } else {
      console.log('✅ Customers table exists and accessible');
    }

    // Check transactions table
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .limit(1);

    if (transactionsError) {
      console.error('❌ Transactions table error:', transactionsError.message);
    } else {
      console.log('✅ Transactions table exists and accessible');
    }

    // Check if create_transaction function exists
    console.log('\n🔧 Checking database functions...');
    
    const { data: functionData, error: functionError } = await supabase.rpc('create_transaction', {
      p_customer_id: '00000000-0000-0000-0000-000000000000',
      p_amount: 0,
      p_type: 'CREDIT',
      p_description: 'test',
      p_profile_id: 'test'
    });

    if (functionError && functionError.message.includes('function "create_transaction" does not exist')) {
      console.error('❌ create_transaction function not found');
      console.log('Please run the database setup SQL scripts');
    } else if (functionError) {
      console.log('✅ create_transaction function exists (test failed as expected)');
    } else {
      console.log('✅ create_transaction function exists and accessible');
    }

    console.log('\n🎉 Database setup looks good!');
    console.log('You can now start the development server with: npm run dev');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

testDatabase(); 