-- Migration: Create function to search for properties within a radius
-- Description: This migration adds a PostgreSQL function that allows searching for
-- property listings within a specified radius from a given latitude and longitude.

-- Step 1: Create the function to search for properties within a radius
create or replace function public.search_properties_within_radius(
  latitude float,
  longitude float,
  radius_meters float
)
returns setof public.property_listings as $$
begin
  return query
  select *
  from public.property_listings
  where ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
    radius_meters
  );
end;
$$ language plpgsql stable;
