# Community Database Fixes Summary

## 🚨 **Issues Identified**

### **Primary Issue: Authentication Context Problems**
- `auth.uid()` returning `null` in server-side queries
- RLS policies blocking operations due to missing authentication context
- Foreign key relationships pointing to wrong tables

### **Secondary Issues: Schema Inconsistencies**
- Missing `status` column in some environments
- Conflicting RLS policies
- Missing database functions and triggers
- Missing unique constraints

## 🛠️ **Fixes Applied**

### **1. Database Schema Fixes**

#### **Foreign Key Relationships Fixed**
```sql
-- Fixed community_posts.user_id to reference profiles.id
ALTER TABLE public.community_posts
DROP CONSTRAINT IF EXISTS community_posts_user_id_fkey;
ALTER TABLE public.community_posts
ADD CONSTRAINT community_posts_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fixed community_comments.user_id to reference profiles.id
ALTER TABLE public.community_comments
DROP CONSTRAINT IF EXISTS community_comments_user_id_fkey;
ALTER TABLE public.community_comments
ADD CONSTRAINT community_comments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fixed community_likes.user_id to reference profiles.id
ALTER TABLE public.community_likes
DROP CONSTRAINT IF EXISTS community_likes_user_id_fkey;
ALTER TABLE public.community_likes
ADD CONSTRAINT community_likes_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
```

#### **RLS Policies Updated**
```sql
-- Community Posts Policies
CREATE POLICY "Allow read access to published posts"
ON public.community_posts
FOR SELECT
USING (
  (status = 'published' AND is_deleted = false) OR
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);

CREATE POLICY "Allow authenticated users to create posts"
ON public.community_posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Similar policies for comments and likes...
```

#### **Database Functions & Triggers**
```sql
-- Function to update post likes count
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for likes count update
CREATE TRIGGER community_likes_trigger
  AFTER INSERT OR DELETE ON public.community_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_likes_count();
```

#### **Constraints & Indexes**
```sql
-- Unique constraint for likes
ALTER TABLE public.community_likes
ADD CONSTRAINT community_likes_post_user_unique
UNIQUE (post_id, user_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON public.community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_apartment_id ON public.community_posts(apartment_id);
```

### **2. Debug Functions Added**

#### **Authentication Debug Function**
```sql
CREATE OR REPLACE FUNCTION public.get_auth_uid()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### **Profile Check Function**
```sql
CREATE OR REPLACE FUNCTION public.check_profile_exists(p_user_id UUID)
RETURNS TABLE (
  profile_exists BOOLEAN,
  profile_id UUID,
  email TEXT,
  full_name TEXT
) AS $$
-- Function implementation...
```

### **3. API Route Improvements**

#### **Enhanced Error Handling**
- Added proper authentication checks in all API routes
- Improved error messages with Korean localization
- Added debug endpoints for troubleshooting

#### **Status Field Addition**
- Ensured all post creation includes `status: "published"`
- Updated validation schemas to handle status field

## 🧪 **Testing Infrastructure**

### **Test Files Created**
1. `lib/test/community-test.ts` - Comprehensive functionality tests
2. `app/api/test/community/route.ts` - API endpoint for testing
3. `app/api/debug/auth/route.ts` - Authentication debugging endpoint

### **Test Coverage**
- ✅ Posts readable
- ✅ Comments readable
- ✅ Likes readable
- ✅ Apartments readable
- ✅ Cities readable
- ✅ Auth functions working
- ✅ Database connectivity
- ✅ Profile existence checks

## 🔍 **Root Cause Analysis**

### **Why Authentication Was Failing**

1. **Foreign Key Mismatch**:
   - Community tables referenced `auth.users.id` directly
   - But the application uses `profiles.id` as the user identifier
   - This created a disconnect between authentication and data access

2. **RLS Policy Issues**:
   - Policies were checking `auth.uid() = user_id`
   - But `user_id` was pointing to profiles, not auth.users
   - This caused all authenticated operations to fail

3. **Missing Database Functions**:
   - Triggers for updating counts weren't working properly
   - Debug functions weren't available for troubleshooting

### **Why Comments Weren't Available**

1. **RLS Blocking Access**:
   - Comments table had restrictive policies
   - Foreign key issues prevented proper access control

2. **Missing Relationships**:
   - Comments couldn't properly link to users due to FK issues
   - This caused JOIN queries to fail or return incomplete data

## 🚀 **How to Test the Fixes**

### **1. Basic Functionality Test**
```bash
# GET request to test basic functionality
curl -X GET http://localhost:3000/api/test/community
```

### **2. Authenticated Post Creation Test**
```bash
# POST request to test post creation (requires authentication)
curl -X POST http://localhost:3000/api/test/community \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Post","body":"Test content","category":"FREE","apartmentId":"apt1"}'
```

### **3. Debug Authentication**
```bash
# GET request to debug authentication
curl -X GET http://localhost:3000/api/debug/auth
```

## 📋 **Migration Files Applied**

1. `fix_community_schema_issues` - Fixed foreign keys and basic schema
2. `add_community_functions` - Added triggers and functions
3. `add_debug_functions_fixed` - Added debug utilities
4. `fix_rls_policies` - Updated RLS policies
5. `add_constraints_and_indexes_fixed` - Added constraints and indexes

## ✅ **Expected Results After Fixes**

### **For Authenticated Users**
- ✅ Can create new posts
- ✅ Can add comments to posts
- ✅ Can like/unlike posts
- ✅ Can view their own posts and others' published posts
- ✅ Can edit/delete their own content

### **For Anonymous Users**
- ✅ Can view published posts
- ✅ Can view comments
- ✅ Can view like counts
- ✅ Can browse apartments and cities
- ❌ Cannot create, edit, or delete content (expected behavior)

### **System-wide**
- ✅ Like counts update automatically
- ✅ Comment counts update automatically
- ✅ RLS policies enforce proper access control
- ✅ Database queries are optimized with indexes
- ✅ Foreign key relationships maintain data integrity

## 🔧 **Troubleshooting**

If issues persist:

1. **Check Authentication**: Use `/api/debug/auth` endpoint
2. **Test Database**: Use `/api/test/community` endpoint
3. **Verify Migrations**: Ensure all migrations were applied successfully
4. **Check Logs**: Look for specific error messages in server logs
5. **Profile Creation**: Ensure user profiles are created on signup

## 📝 **Next Steps**

1. **Monitor Performance**: Watch for any performance issues with the new indexes
2. **User Testing**: Have real users test the functionality
3. **Error Monitoring**: Set up proper error tracking for production
4. **Documentation**: Update API documentation with new endpoints
5. **Cleanup**: Remove debug endpoints before production deployment
