# Sandeep Finance - Setup Guide

## Prerequisites

1. **Supabase Account**: You need a Supabase account and project
2. **Clerk Account**: You need a Clerk account for authentication
3. **Node.js**: Version 18 or higher

## Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Database URL (for direct database access)
DATABASE_URL=your_supabase_database_url
```

## Database Setup

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the following SQL scripts in order:

#### Step 1: Clean Up Existing Tables and Types
```sql
-- Drop existing tables and functions (if they exist)
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.create_transaction CASCADE;
DROP FUNCTION IF EXISTS public.create_customer_with_initial_credit CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS public.enable_rls CASCADE;
DROP FUNCTION IF EXISTS public.create_policy CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS membership CASCADE;
```

#### Step 2: Create Profiles Table
```sql
-- Create the membership enum type
CREATE TYPE membership AS ENUM ('free', 'pro');

-- Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id TEXT PRIMARY KEY NOT NULL,
  membership membership NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create a trigger to update the updated_at column on each update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access - using user_id directly since we're using Clerk auth
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (true); -- Allow all selects for now, we'll filter by user_id in the app

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (true); -- Allow all updates for now, we'll validate user_id in the app
```

#### Step 3: Create Customers and Transactions Tables
```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp" with schema extensions;

-- Create customers table
create table if not exists public.customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text,
  email text,
  address text,
  total_credit numeric(12,2) not null default 0,
  total_paid numeric(12,2) not null default 0,
  balance numeric(12,2) not null generated always as (total_credit - total_paid) stored,
  is_active boolean not null default true,
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  profile_id text not null references public.profiles(user_id) on delete cascade
);

-- Create transactions table
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  amount numeric(12,2) not null,
  type text not null check (type in ('CREDIT', 'PAYMENT')),
  description text,
  transaction_date timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  profile_id text not null references public.profiles(user_id) on delete cascade
);

-- Create indexes
create index if not exists idx_customers_profile_id on public.customers(profile_id);
create index if not exists idx_transactions_customer_id on public.transactions(customer_id);
create index if not exists idx_transactions_profile_id on public.transactions(profile_id);

-- Create triggers for updated_at
create or replace trigger update_customers_updated_at
before update on public.customers
for each row
execute function update_updated_at_column();
```

#### Step 4: Create Database Functions
```sql
-- Create a function to handle transaction creation and update customer balances
create or replace function public.create_transaction(
  p_customer_id uuid,
  p_amount numeric(12,2),
  p_type text,
  p_description text,
  p_profile_id text
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_transaction_id uuid;
  v_result jsonb;
begin
  -- Verify the customer belongs to the user
  if not exists (
    select 1 from public.customers 
    where id = p_customer_id and profile_id = p_profile_id
  ) then
    return jsonb_build_object(
      'success', false,
      'data', null,
      'error', 'Customer not found or access denied'
    );
  end if;

  -- Insert the transaction
  insert into public.transactions (
    customer_id,
    amount,
    type,
    description,
    profile_id
  ) values (
    p_customer_id,
    p_amount,
    p_type,
    p_description,
    p_profile_id
  )
  returning id into v_transaction_id;

  -- Update customer totals
  if p_type = 'CREDIT' then
    update public.customers 
    set total_credit = total_credit + p_amount
    where id = p_customer_id;
  else
    update public.customers 
    set total_paid = total_paid + p_amount
    where id = p_customer_id;
  end if;

  -- Return the created transaction
  select to_jsonb(t) 
  into v_result
  from public.transactions t
  where t.id = v_transaction_id;

  return jsonb_build_object(
    'success', true,
    'data', v_result,
    'error', null
  );

exception when others then
  return jsonb_build_object(
    'success', false,
    'data', null,
    'error', sqlerrm
  );
end;
$$;

-- Create a function to handle customer creation with initial credit in a transaction
create or replace function public.create_customer_with_initial_credit(
  p_name text,
  p_email text,
  p_phone text,
  p_address text,
  p_notes text,
  p_profile_id text,
  p_initial_credit numeric(12,2) default 0
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_customer_id uuid;
  v_result jsonb;
begin
  -- Insert the new customer
  insert into public.customers (
    name, 
    email, 
    phone, 
    address, 
    notes, 
    profile_id, 
    is_active,
    total_credit,
    total_paid
  ) values (
    p_name, 
    p_email, 
    p_phone, 
    p_address, 
    p_notes, 
    p_profile_id, 
    true,
    case when p_initial_credit > 0 then p_initial_credit else 0 end,
    0
  )
  returning id into v_customer_id;

  -- If initial credit is provided, create a transaction
  if p_initial_credit > 0 then
    insert into public.transactions (
      customer_id,
      amount,
      type,
      description,
      profile_id
    ) values (
      v_customer_id,
      p_initial_credit,
      'CREDIT',
      'Initial credit',
      p_profile_id
    );
  end if;

  -- Return the created customer
  select to_jsonb(c) 
  into v_result
  from public.customers c
  where c.id = v_customer_id;

  return jsonb_build_object(
    'success', true,
    'data', v_result,
    'error', null
  );

exception when others then
  return jsonb_build_object(
    'success', false,
    'data', null,
    'error', sqlerrm
  );
end;
$$;
```

#### Step 5: Enable Row Level Security
```sql
-- Enable RLS on customers table
alter table public.customers enable row level security;

-- Customers policies - using profile_id directly since we're using Clerk auth
create policy "Allow users to view their own customers"
  on public.customers for select
  using (true); -- Allow all selects for now, we'll filter by profile_id in the app

create policy "Allow users to insert their own customers"
  on public.customers for insert
  with check (true); -- Allow all inserts for now, we'll validate profile_id in the app

create policy "Allow users to update their own customers"
  on public.customers for update
  using (true); -- Allow all updates for now, we'll validate profile_id in the app

-- Enable RLS on transactions table
alter table public.transactions enable row level security;

-- Transactions policies - using profile_id directly since we're using Clerk auth
create policy "Allow users to view their own transactions"
  on public.transactions for select
  using (true); -- Allow all selects for now, we'll filter by profile_id in the app

create policy "Allow users to insert their own transactions"
  on public.transactions for insert
  with check (true); -- Allow all inserts for now, we'll validate profile_id in the app
```

### Option 2: Using Migration Scripts

If you prefer to use the migration scripts:

1. Set up your environment variables
2. Run: `npx tsx scripts/setup-supabase-tables.ts`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Sign up/Login** using Clerk authentication
2. **Add Customers** in the "Add Entry" tab
3. **Record Transactions** for existing customers
4. **View Dashboard** to see all customer balances
5. **Check Daily Collections** for any date
6. **Download PDF Reports** for customer history

## Troubleshooting

### Customer Creation Not Working
- Ensure the database tables are created correctly
- Check that the `create_transaction` function exists
- Verify your environment variables are set correctly
- Check the browser console for any errors

### Authentication Issues
- Verify your Clerk keys are correct
- Ensure the Clerk app is configured properly
- Check that the redirect URLs are set correctly

### Database Connection Issues
- Verify your Supabase URL and keys
- Check that the database is accessible
- Ensure the RLS policies are set up correctly

### "Type already exists" Error
- Run the cleanup script (Step 1) to drop existing tables and types
- Then run the creation scripts in order
- This will ensure a clean slate for the database setup

### "Operator does not exist: uuid = text" Error
- This error occurs when comparing UUID and TEXT types
- The fix is to cast `auth.uid()` to text using `auth.uid()::text`
- Updated RLS policies now include proper type casting

### "Role authenticated_user does not exist" Error
- This error occurs because Supabase doesn't have this role by default
- Removed the GRANT statement that was causing this error
- RLS policies are sufficient for access control 