-- Enable UUID extension
create extension if not exists "uuid-ossp" with schema extensions;

-- Create update_updated_at_column function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

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

-- Create RPC functions for setup script
create or replace function enable_rls(table_name text)
returns void as $$
begin
  execute format('alter table %I enable row level security', table_name);
end;
$$ language plpgsql;

create or replace function create_policy(
  policy_name text,
  table_name text,
  using text,
  check_condition text,
  with_check_condition text
)
returns void as $$
begin
  if using is not null then
    execute format('drop policy if exists %I on %I', policy_name, table_name);
    execute format('create policy %I on %I as permissive using (%s)', 
      policy_name, table_name, using);
  end if;
  
  if check_condition is not null then
    execute format('drop policy if exists %I on %I', policy_name, table_name);
    execute format('create policy %I on %I as permissive for insert with check (%s)', 
      policy_name, table_name, check_condition);
  end if;
  
  if with_check_condition is not null then
    execute format('alter policy %I on %I with check (%s)', 
      policy_name, table_name, with_check_condition);
  end if;
end;
$$ language plpgsql;
