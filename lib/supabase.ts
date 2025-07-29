import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export type NewCustomer = Omit<
  Customer,
  'id' | 'created_at' | 'updated_at' | 'total_credit' | 'total_paid' | 'balance'
>;

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  total_credit: number;
  total_paid: number;
  balance: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  profile_id: string;
}

export type NewTransaction = Omit<Transaction, 'id' | 'created_at' | 'transaction_date'>;

export interface Transaction {
  id: string;
  customer_id: string;
  amount: number;
  type: 'CREDIT' | 'PAYMENT';
  description?: string;
  transaction_date: string;
  created_at: string;
  profile_id: string;
}

// Customer Functions
export const getCustomers = async (profileId: string) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('profile_id', profileId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data as Customer[];
};

export const getCustomerById = async (id: string) => {
  const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();

  if (error) throw error;
  return data as Customer;
};

export const createCustomer = async (
  customer: Omit<
    Customer,
    'id' | 'created_at' | 'updated_at' | 'total_credit' | 'total_paid' | 'balance'
  >
) => {
  const { data, error } = await supabase
    .from('customers')
    .insert([
      {
        ...customer,
        total_credit: 0,
        total_paid: 0,
        balance: 0,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Customer;
};

// Transaction Functions
export const getCustomerTransactions = async (customerId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('customer_id', customerId)
    .order('transaction_date', { ascending: false });

  if (error) throw error;
  return data as Transaction[];
};

export const createTransaction = async (
  transaction: Omit<Transaction, 'id' | 'created_at' | 'transaction_date'>
) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        ...transaction,
        transaction_date: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;

  // Update customer's balance
  const customer = await getCustomerById(transaction.customer_id);
  const newTotalCredit =
    transaction.type === 'CREDIT'
      ? customer.total_credit + transaction.amount
      : customer.total_credit;

  const newTotalPaid =
    transaction.type === 'PAYMENT' ? customer.total_paid + transaction.amount : customer.total_paid;

  const newBalance = newTotalCredit - newTotalPaid;

  await supabase
    .from('customers')
    .update({
      total_credit: newTotalCredit,
      total_paid: newTotalPaid,
      balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq('id', transaction.customer_id);

  return data as Transaction;
};
