INSERT INTO profiles (id, email, first_name, last_name, avatar_url, role)
SELECT
  id,
  email,
  email,
  NULL,
  raw_user_meta_data->>'avatar_url',
  'user'
FROM
  auth.users
WHERE
  id NOT IN (SELECT id FROM profiles);
