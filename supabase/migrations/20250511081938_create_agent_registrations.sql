-- Create agent_registrations table for storing agent registration requests
create table if not exists public.agent_registrations (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text not null,
  sales_volume text not null,
  zip_code text not null,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  processed_at timestamptz,
  processed_by uuid references auth.users(id)
);

-- Create an index on email for faster lookups and to enforce uniqueness
create index if not exists agent_registrations_email_idx on public.agent_registrations(email);

-- Create an index on status for filtering
create index if not exists agent_registrations_status_idx on public.agent_registrations(status);

-- Add table comment
comment on table public.agent_registrations is 'Stores registration requests from real estate agents';

-- Enable Row Level Security (RLS)
alter table public.agent_registrations enable row level security;

-- Create policies
-- Admin can see all agent registrations
create policy "Admin can view all agent registrations"
  on public.agent_registrations for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where auth.uid() = profiles.id and profiles.role = 'admin'
    )
  );

-- Admin can insert agent registrations
create policy "Admin can insert agent registrations"
  on public.agent_registrations for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where auth.uid() = profiles.id and profiles.role = 'admin'
    )
  );

-- Admin can update agent registrations
create policy "Admin can update agent registrations"
  on public.agent_registrations for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where auth.uid() = profiles.id and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where auth.uid() = profiles.id and profiles.role = 'admin'
    )
  );

-- Anyone can submit a registration (insert only)
create policy "Anyone can submit an agent registration"
  on public.agent_registrations for insert
  to anon, authenticated
  with check (true);

-- Create a function to update the updated_at column
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create a trigger to update the updated_at column
create trigger set_updated_at
before update on public.agent_registrations
for each row
execute function public.handle_updated_at();
