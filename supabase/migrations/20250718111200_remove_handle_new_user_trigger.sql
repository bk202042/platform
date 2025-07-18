-- Migration: Remove the handle_new_user function and trigger.
-- Description: This migration removes the old trigger and function that were
-- responsible for creating user profiles. This is being replaced by a more
-- robust solution using Supabase Auth Hooks and a Next.js API route.

-- Step 1: Drop the trigger from the auth.users table.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Drop the function that the trigger was calling.
DROP FUNCTION IF EXISTS public.handle_new_user;
