-- Add Stripe customer ID to profiles table
alter table profiles
  add column if not exists stripe_customer_id text unique;
