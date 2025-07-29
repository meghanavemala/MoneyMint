// actions/create-customer.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import type { Customer } from '@/lib/supabase/database.types';

export async function createCustomerAction(
  prevState: { success: boolean; data: any; error: string | null },
  formData: FormData
) {
  const supabase = await createClient();

  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        ...prevState,
        success: false,
        error: 'You must be signed in to create a customer',
      };
    }

    // Validate input
    const name = formData.get('name')?.toString().trim();
    const email = formData.get('email')?.toString().trim() || null;
    const phone = formData.get('phone')?.toString().trim() || null;
    const address = formData.get('address')?.toString().trim() || null;
    const notes = formData.get('notes')?.toString().trim() || null;
    const amount = formData.get('amount')?.toString().trim();
    const initialCredit = amount ? parseFloat(amount) : 0;

    if (!name) {
      return {
        ...prevState,
        success: false,
        error: 'Customer name is required',
      };
    }

    // Start a transaction
    const { data: rpcResponse, error } = await supabase.rpc('create_customer_with_initial_credit', {
      p_name: name,
      p_email: email,
      p_phone: phone,
      p_address: address,
      p_notes: notes,
      p_profile_id: userId,
      p_initial_credit: initialCredit,
    });

    if (error) {
      console.error('Error in create_customer_with_initial_credit:', error);
      return {
        ...prevState,
        success: false,
        error: error.message || 'Failed to create customer with initial credit',
      };
    }

    // Check if the RPC call was successful
    if (!rpcResponse?.success) {
      return {
        ...prevState,
        success: false,
        error: rpcResponse?.error || 'Failed to create customer',
      };
    }

    const customerData = rpcResponse.data;

    revalidatePath('/dashboard');
    revalidatePath('/api/customers');
    return {
      ...prevState,
      success: true,
      data: customerData,
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error in createCustomerAction:', error);
    return {
      ...prevState,
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while creating the customer',
    };
  }
}
