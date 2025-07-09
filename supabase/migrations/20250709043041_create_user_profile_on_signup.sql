-- Migration: Create function and trigger to handle new user sign-ups.
-- Description: This migration adds a trigger that automatically creates a new
-- entry in the public.profiles table whenever a new user is created in auth.users.
-- This ensures that user profile data is kept in sync with authentication data.

-- Step 1: Create the function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Step 2: Create the trigger to execute the function after a new user is inserted
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
