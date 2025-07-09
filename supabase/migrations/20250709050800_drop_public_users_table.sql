-- Migration: Drop the redundant public.users table
-- Description: This migration removes the public.users table, which has been
-- replaced by the public.profiles table to avoid confusion and potential bugs.
-- All application code and RLS policies have been updated to use public.profiles.

DROP TABLE IF EXISTS public.users;
