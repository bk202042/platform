ALTER TABLE apartments ADD COLUMN city_id UUID REFERENCES cities(id);
