-- Add Debug Functions for Authentication Issues

-- 1. Create a function to get current auth.uid() for debugging
CREATE OR REPLACE FUNCTION public.get_auth_uid()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create a function to debug RLS policies
CREATE OR REPLACE FUNCTION public.debug_rls_context()
RETURNS TABLE (
  current_user_id UUID,
  current_role TEXT,
  session_user TEXT,
  current_user TEXT
) AS $$
BEGIN
  RETURN QUERY SELECT
    auth.uid() as current_user_id,
    auth.role() as current_role,
    session_user::TEXT as session_user,
    current_user::TEXT as current_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create a function to test post creation with proper context
CREATE OR REPLACE FUNCTION public.test_post_creation(
  p_apartment_id UUID,
  p_category TEXT,
  p_title TEXT,
  p_body TEXT,
  p_user_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  post_id UUID,
  error_message TEXT,
  auth_context UUID
) AS $$
DECLARE
  new_post_id UUID;
  error_msg TEXT;
BEGIN
  -- Check authentication context
  IF auth.uid() IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'No authentication context'::TEXT, auth.uid();
    RETURN;
  END IF;

  -- Check if user matches auth context
  IF auth.uid() != p_user_id THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'User ID mismatch with auth context'::TEXT, auth.uid();
    RETURN;
  END IF;

  -- Try to insert the post
  BEGIN
    INSERT INTO public.community_posts (
      apartment_id, category, title, body, user_id, status
    ) VALUES (
      p_apartment_id, p_category::community_category, p_title, p_body, p_user_id, 'published'
    ) RETURNING id INTO new_post_id;

    RETURN QUERY SELECT TRUE, new_post_id, NULL::TEXT, auth.uid();
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS error_msg = MESSAGE_TEXT;
    RETURN QUERY SELECT FALSE, NULL::UUID, error_msg, auth.uid();
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create a function to check profile existence
CREATE OR REPLACE FUNCTION public.check_profile_exists(p_user_id UUID)
RETURNS TABLE (
  profile_exists BOOLEAN,
  profile_id UUID,
  email TEXT,
  full_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (p.id IS NOT NULL) as profile_exists,
    p.id as profile_id,
    p.email,
    p.full_name
  FROM public.profiles p
  WHERE p.id = p_user_id;

  -- If no rows returned, return a default row
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_auth_uid() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.debug_rls_context() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.test_post_creation(UUID, TEXT, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_profile_exists(UUID) TO authenticated, anon;
