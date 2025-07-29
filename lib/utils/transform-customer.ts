import type { Database } from '@/lib/supabase/database.types';
import type { CustomerWithBalance } from '@/actions/finance-actions';

type DatabaseCustomer = Database['public']['Tables']['customers']['Row'];

// Helper type to make all properties optional except id
type PartialCustomer = Partial<Omit<DatabaseCustomer, 'id'>> & { id: string };

/**
 * Transforms a customer object to ensure it matches the CustomerWithBalance type.
 * Handles both camelCase and snake_case property names and ensures all required fields are present.
 */
export function transformCustomer(customer: PartialCustomer): CustomerWithBalance {
  const now = new Date().toISOString();

  // Create a properly typed customer object that matches the database schema
  const baseCustomer: DatabaseCustomer = {
    id: customer.id,
    name: customer.name ?? '',
    email: customer.email ?? null,
    phone: customer.phone ?? null,
    address: customer.address ?? null,
    notes: customer.notes ?? null,
    is_active: customer.is_active ?? true,
    total_credit: typeof customer.total_credit === 'number' ? customer.total_credit : 0,
    total_paid: typeof customer.total_paid === 'number' ? customer.total_paid : 0,
    balance: typeof customer.balance === 'number' ? customer.balance : 0,
    created_at: customer.created_at ?? now,
    updated_at: customer.updated_at ?? now,
    profile_id: customer.profile_id ?? '',
  };

  // Return as CustomerWithBalance, which is just Customer with a required balance
  return baseCustomer as unknown as CustomerWithBalance;
}
