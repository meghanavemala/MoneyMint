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
