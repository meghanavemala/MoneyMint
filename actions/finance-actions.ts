/*
Finance actions for managing customers, transactions, and daily collections.
Handles all database operations for the finance tracking app.
*/

'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import type { Customer, Transaction, NewCustomer, NewTransaction } from '@/lib/supabase/database.types';
import type { ActionState } from '@/types';

export type CustomerWithBalance = Customer & { 
  balance: number;
  total_credit: number;
  total_paid: number;
};

export type CustomerWithTransactions = Customer & {
  transactions: Array<{
    id: string;
    amount: number;
    type: 'CREDIT' | 'PAYMENT';
    description: string | null;
    transaction_date: string;
    created_at: string;
  }>;
};

export async function getCustomersAction(): Promise<ActionState<CustomerWithBalance[]>> {
  const { userId } = await auth();
  if (!userId) return { isSuccess: false, message: 'Unauthorized' };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('profile_id', userId)
      .order('name', { ascending: true });

    if (error) throw error;

    return {
      isSuccess: true,
      message: 'Customers retrieved successfully',
      data: data.map((customer) => ({
        ...customer,
        balance: customer.balance || 0,
        total_credit: customer.total_credit || 0,
        total_paid: customer.total_paid || 0,
      })),
    };
  } catch (error) {
    console.error('Error fetching customers:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to fetch customers',
    };
  }
}

export async function getCustomerByIdAction(
  id: string
): Promise<ActionState<CustomerWithTransactions>> {
  const { userId } = await auth();
  if (!userId) return { isSuccess: false, message: 'Unauthorized' };

  try {
    const supabase = await createClient();

    // Get customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('profile_id', userId)
      .single();

    if (customerError) {
      if (customerError.code === 'PGRST116') {
        return { isSuccess: false, message: 'Customer not found' };
      }
      throw customerError;
    }

    // Get customer's transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('customer_id', id)
      .order('transaction_date', { ascending: false });

    if (transactionsError) throw transactionsError;

    return {
      isSuccess: true,
      message: 'Customer details retrieved successfully',
      data: {
        ...customer,
        balance: customer.balance || 0,
        transactions: transactions.map((tx) => ({
          id: tx.id,
          amount: tx.amount,
          type: tx.type as 'CREDIT' | 'PAYMENT',
          description: tx.description,
          transaction_date: tx.transaction_date,
          created_at: tx.created_at,
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching customer:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to fetch customer',
    };
  }
}

export async function createCustomerAction(
  data: Pick<NewCustomer, 'name' | 'email' | 'phone' | 'address' | 'notes'>
): Promise<ActionState<Customer>> {
  try {
    console.log('🔐 Getting user ID...');
    const { userId } = await auth();

    if (!userId) {
      console.error('❌ No user ID found');
      return {
        isSuccess: false,
        message: 'Unauthorized: Please sign in',
      };
    }

    console.log('✅ User ID:', userId);

    if (!data.name?.trim()) {
      console.error('❌ No customer name provided');
      return {
        isSuccess: false,
        message: 'Customer name is required',
      };
    }

    console.log('🔗 Creating Supabase client...');
    const supabase = await createClient();

    const customerData = {
      ...data,
      name: data.name.trim(),
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      address: data.address?.trim() || null,
      notes: data.notes?.trim() || null,
      profile_id: userId,
      total_credit: 0,
      total_paid: 0,
      is_active: true,
    };

    console.log('📝 Customer data to insert:', customerData);

    console.log('💾 Inserting customer into database...');
    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      console.error('   Code:', error.code);
      console.error('   Message:', error.message);
      console.error('   Details:', error.details);
      console.error('   Hint:', error.hint);

      if (error.code === '23505') {
        return {
          isSuccess: false,
          message: 'A customer with this email or phone already exists',
        };
      }

      throw new Error(error.message || 'Failed to create customer');
    }

    console.log('✅ Customer inserted successfully:', newCustomer);

    console.log('🔄 Revalidating path...');
    revalidatePath('/dashboard');

    return {
      isSuccess: true,
      message: 'Customer created successfully',
      data: newCustomer,
    };
  } catch (error) {
    console.error('💥 Error in createCustomerAction:', error);
    return {
      isSuccess: false,
      message:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while creating the customer',
    };
  }
}

export async function updateCustomerAction(
  id: string,
  data: Partial<Pick<Customer, 'name' | 'email' | 'phone' | 'address' | 'notes' | 'is_active'>>
): Promise<ActionState<Customer>> {
  const { userId } = await auth();
  if (!userId) return { isSuccess: false, message: 'Unauthorized' };

  try {
    const supabase = await createClient();
    const { data: updatedCustomer, error } = await supabase
      .from('customers')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('profile_id', userId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard');
    return { 
      isSuccess: true, 
      message: 'Customer updated successfully',
      data: updatedCustomer 
    };
  } catch (error) {
    console.error('Error updating customer:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to update customer',
    };
  }
}

export async function deleteCustomerAction(id: string): Promise<ActionState<undefined>> {
  const { userId } = await auth();
  if (!userId) return { isSuccess: false, message: 'Unauthorized' };

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('profile_id', userId);

    if (error) throw error;

    revalidatePath('/dashboard');
    return { 
      isSuccess: true, 
      message: 'Customer deleted successfully',
      data: undefined 
    };
  } catch (error) {
    console.error('Error deleting customer:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to delete customer',
    };
  }
}

export async function getCustomerTransactionsAction(
  customerId: string
): Promise<ActionState<Array<Transaction>>> {
  const { userId } = await auth();
  if (!userId) return { isSuccess: false, message: 'Unauthorized' };

  try {
    const supabase = await createClient();

    // First verify the customer belongs to the user
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', customerId)
      .eq('profile_id', userId)
      .single();

    if (customerError || !customer) {
      return { isSuccess: false, message: 'Customer not found or access denied' };
    }

    // Get all transactions for the customer
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('customer_id', customerId)
      .order('transaction_date', { ascending: false });

    if (transactionsError) throw transactionsError;

    return {
      isSuccess: true,
      message: 'Transactions retrieved successfully',
      data: transactions,
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to fetch transactions',
    };
  }
}

export async function createTransactionAction(
  data: {
    customer_id: string;
    amount: number;
    type: 'CREDIT' | 'PAYMENT';
    description?: string;
    transaction_date?: string;
  }
): Promise<ActionState<Transaction>> {
  const { userId } = await auth();
  if (!userId) return { isSuccess: false, message: 'Unauthorized' };

  try {
    const supabase = await createClient();

    // Use Supabase's rpc for atomic operations
    const { data: result, error } = await supabase.rpc('create_transaction', {
      p_customer_id: data.customer_id,
      p_amount: data.amount,
      p_type: data.type,
      p_description: data.description || null,
      p_profile_id: userId,
    });

    if (error) throw error;

    revalidatePath('/dashboard');
    return { 
      isSuccess: true, 
      message: 'Transaction created successfully',
      data: result 
    };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to create transaction',
    };
  }
}

export async function getDailyCollectionsAction(date: Date = new Date()): Promise<
  ActionState<{
    date: Date;
    totalCollection: number;
    transactions: Array<{
      id: string;
      customer_id: string;
      customer_name: string;
      amount: number;
      type: 'CREDIT' | 'PAYMENT';
      description: string | null;
      transaction_date: string;
    }>;
  }>
> {
  const { userId } = await auth();
  if (!userId) return { isSuccess: false, message: 'Unauthorized' };

  try {
    const supabase = await createClient();

    // Format dates for Supabase query
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all transactions for the day with customer info
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        customers (name)
      `)
      .gte('transaction_date', startOfDay.toISOString())
      .lte('transaction_date', endOfDay.toISOString())
      .order('transaction_date', { ascending: false });

    if (error) throw error;

    // Transform the data to match the expected format
    const transactions = (data || []).map((tx: any) => ({
      id: tx.id,
      customer_id: tx.customer_id,
      customer_name: tx.customers?.name || 'Unknown',
      amount: tx.amount,
      type: tx.type as 'CREDIT' | 'PAYMENT',
      description: tx.description,
      transaction_date: tx.transaction_date,
    }));

    // Calculate total collection for the day (only payments)
    const totalCollection = transactions
      .filter(tx => tx.type === 'PAYMENT')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      isSuccess: true,
      message: 'Daily collections retrieved successfully',
      data: {
        date,
        totalCollection,
        transactions,
      },
    };
  } catch (error) {
    console.error('Error fetching daily collections:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to fetch daily collections',
    };
  }
}
