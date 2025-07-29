/*
Debug script to test customer creation and identify issues.
*/

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

async function debugCustomerCreation() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  console.log('🔍 Debugging customer creation...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // First, let's check if we can access the customers table
    console.log('\n1️⃣ Testing table access...');
    const { data: testData, error: testError } = await supabase
      .from('customers')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('❌ Cannot access customers table:', testError.message);
      console.log('   This might be due to RLS policies or missing table');
      return;
    }

    console.log('✅ Can access customers table');

    // Check table structure
    console.log('\n2️⃣ Checking table structure...');
    let columns = null;
    let columnsError = null;
    try {
      const result = await supabase.rpc('get_table_columns', { table_name: 'customers' });
      columns = result.data;
      columnsError = result.error;
    } catch (error) {
      columnsError = { message: 'Function not available' };
    }

    if (columnsError) {
      console.log('⚠️  Could not get table structure via RPC, trying direct query...');
      
      // Try a simple insert to see what happens
      console.log('\n3️⃣ Testing customer insertion...');
      
      const testCustomer = {
        name: 'Test Customer Debug',
        email: 'test@debug.com',
        phone: '1234567890',
        address: 'Test Address',
        notes: 'Debug test customer',
        profile_id: 'test-user-id', // This will fail due to foreign key, but we'll see the error
        total_credit: 0,
        total_paid: 0,
        balance: 0,
        is_active: true
      };

      const { data: insertData, error: insertError } = await supabase
        .from('customers')
        .insert(testCustomer)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Insert error:', insertError.message);
        console.error('   Code:', insertError.code);
        console.error('   Details:', insertError.details);
        console.error('   Hint:', insertError.hint);
        
        if (insertError.code === '23503') {
          console.log('\n💡 Foreign key constraint error - profile_id must reference existing user');
          console.log('   This is expected since we used a test user ID');
        }
      } else {
        console.log('✅ Test customer inserted successfully:', insertData);
      }
    } else {
      console.log('✅ Table structure:', columns);
    }

    // Check if profiles table exists and has data
    console.log('\n4️⃣ Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (profilesError) {
      console.error('❌ Cannot access profiles table:', profilesError.message);
    } else {
      console.log('✅ Profiles table accessible');
      console.log('   Found', profiles?.length || 0, 'profiles');
      if (profiles && profiles.length > 0) {
        console.log('   Sample profile:', profiles[0]);
      }
    }

    // Test with a real user ID if available
    if (profiles && profiles.length > 0) {
      const realUserId = profiles[0].user_id;
      console.log('\n5️⃣ Testing with real user ID:', realUserId);
      
      const realCustomer = {
        name: 'Real Test Customer',
        email: 'real@test.com',
        phone: '9876543210',
        address: 'Real Test Address',
        notes: 'Real test customer',
        profile_id: realUserId,
        total_credit: 0,
        total_paid: 0,
        balance: 0,
        is_active: true
      };

      const { data: realInsertData, error: realInsertError } = await supabase
        .from('customers')
        .insert(realCustomer)
        .select()
        .single();

      if (realInsertError) {
        console.error('❌ Real insert error:', realInsertError.message);
        console.error('   Code:', realInsertError.code);
      } else {
        console.log('✅ Real customer inserted successfully:', realInsertData);
        
        // Clean up - delete the test customer
        await supabase
          .from('customers')
          .delete()
          .eq('id', realInsertData.id);
        console.log('🧹 Cleaned up test customer');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugCustomerCreation(); 