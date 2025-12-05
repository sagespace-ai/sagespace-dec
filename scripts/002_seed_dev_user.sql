-- Seed dev test user profile
-- Note: You must first create the auth user via signup UI or Supabase dashboard
-- Email: dev@sagespace.test
-- Password: devpassword123

-- Upgrade dev user to admin with enterprise tier and bonus credits
insert into public.profiles (
  id,
  name,
  email,
  role,
  credits,
  xp,
  tier
)
select
  id,
  'Dev Test User',
  'dev@sagespace.test',
  'admin',
  10000,
  5000,
  'enterprise'
from auth.users
where email = 'dev@sagespace.test'
on conflict (id) do update set
  credits = 10000,
  xp = 5000,
  tier = 'enterprise',
  role = 'admin';
