-- Migration: Create function and trigger to handle new user sign-ups.
-- Description: This migration adds a trigger that automatically creates a new
-- entry in the public.profiles table whenever a new user is created in auth.users.
-- This ensures that user profile data is kept in sync with authentication data.

-- Step 1: Drop the existing trigger if it exists to ensure idempotency.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Create or replace the function to handle new user creation.
-- This function now correctly maps the full_name from Google to first_name and last_name,
-- and sets a default 'user' role.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, avatar_url, role)
  values (
    new.id,
    new.email,
    split_part(new.raw_user_meta_data->>'full_name', ' ', 1),
    substring(new.raw_user_meta_data->>'full_name' from position(' ' in new.raw_user_meta_data->>'full_name') + 1),
    new.raw_user_meta_data->>'avatar_url',
    'user' -- Sets default role
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Step 3: Recreate the trigger to execute the function after a new user is inserted.
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
