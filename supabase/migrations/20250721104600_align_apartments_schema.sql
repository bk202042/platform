-- 1. Create cities table
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

-- 2. Add city_id to apartments table
ALTER TABLE apartments ADD COLUMN city_id UUID REFERENCES cities(id);

-- 3. Populate cities table
INSERT INTO cities (name) SELECT DISTINCT city FROM apartments;

-- 4. Update apartments table
UPDATE apartments a SET city_id = (SELECT id FROM cities c WHERE c.name = a.city);

-- 5. Make city_id not nullable
ALTER TABLE apartments ALTER COLUMN city_id SET NOT NULL;

-- 6. Drop old city column
ALTER TABLE apartments DROP COLUMN city;
