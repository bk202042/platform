# Securing PostGIS Spatial Reference System Data in Supabase

## Context

- Environment: Supabase with PostGIS extension
- Security Concern: `public.spatial_ref_sys` table exposed via PostgREST API
- Goal: Implement secure access controls while maintaining functionality

## Security Requirements

1. Restrict direct access to `public.spatial_ref_sys` table
2. Maintain read-only access for authenticated users
3. Expose only necessary columns
4. Document implementation for maintainers

## Implementation Steps

1. Create secure view with limited column access:

```sql
CREATE OR REPLACE VIEW public.secure_spatial_ref_sys AS
SELECT srid, auth_name, auth_srid, srtext, proj4text
FROM public.spatial_ref_sys;

GRANT SELECT ON public.secure_spatial_ref_sys TO authenticated, anon;
COMMENT ON VIEW public.secure_spatial_ref_sys IS 'Secure view for spatial_ref_sys data with controlled access';
```

2. Update application code to use secure view:

```typescript
const { data, error } = await supabase
  .from("secure_spatial_ref_sys")
  .select("*");
```

## Security Notes

- Original table remains accessible through REST API
- View provides read-only access to non-sensitive reference data
- For enhanced security, contact database administrator to:
  - Enable RLS on source table
  - Move PostGIS tables to private schema
  - Implement custom access policies

Reference: PostGIS Documentation (https://postgis.net/docs/reference.html)
Reference: Supabase Security Best Practices (https://supabase.com/docs/guides/auth/row-level-security)
