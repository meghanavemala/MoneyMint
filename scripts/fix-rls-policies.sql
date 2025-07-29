-- Fix RLS policies for Clerk authentication
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Allow users to view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Allow users to insert their own customers" ON public.customers;
DROP POLICY IF EXISTS "Allow users to update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Allow users to view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow users to insert their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policies that work with Clerk auth
-- Customers policies
CREATE POLICY "Allow users to view their own customers"
  ON public.customers FOR SELECT
  USING (true); -- Allow all selects, filter by profile_id in the app

CREATE POLICY "Allow users to insert their own customers"
  ON public.customers FOR INSERT
  WITH CHECK (true); -- Allow all inserts, validate profile_id in the app

CREATE POLICY "Allow users to update their own customers"
  ON public.customers FOR UPDATE
  USING (true); -- Allow all updates, validate profile_id in the app

-- Transactions policies
CREATE POLICY "Allow users to view their own transactions"
  ON public.transactions FOR SELECT
  USING (true); -- Allow all selects, filter by profile_id in the app

CREATE POLICY "Allow users to insert their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (true); -- Allow all inserts, validate profile_id in the app

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (true); -- Allow all selects, filter by user_id in the app

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (true); -- Allow all updates, validate user_id in the app

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('customers', 'transactions', 'profiles'); 