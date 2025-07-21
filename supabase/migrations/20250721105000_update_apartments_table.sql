UPDATE apartments SET city_id = (SELECT id FROM cities WHERE name = apartments.city);
