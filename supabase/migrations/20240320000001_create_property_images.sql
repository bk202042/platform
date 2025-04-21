-- Migration: Create property_images table
-- Description: Adds support for multiple images per property listing
-- with proper ordering and metadata

-- Create the property_images table
create table if not exists public.property_images (
    id uuid primary key default gen_random_uuid(),
    property_id uuid not null references public.property_listings(id) on delete cascade,
    url text not null,
    alt_text text,
    "order" integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references auth.users(id) on delete set null,
    -- Add a unique constraint to ensure image order is unique per property
    unique(property_id, "order")
);

-- Enable RLS
alter table public.property_images enable row level security;

-- Create indexes
create index property_images_property_id_idx on public.property_images(property_id);
create index property_images_order_idx on public.property_images("order");

-- Add updated_at trigger
create trigger set_updated_at
    before update on public.property_images
    for each row
    execute function public.set_updated_at();

-- Create RLS policies

-- Allow anyone to view property images
create policy "Property images are viewable by everyone."
    on public.property_images
    for select
    to authenticated, anon
    using (true);

-- Allow authenticated users to upload images to their own properties
create policy "Users can upload images to their own properties."
    on public.property_images
    for insert
    to authenticated
    with check (
        auth.uid() = (
            select created_by
            from public.property_listings
            where id = property_id
        )
    );

-- Allow users to update their own property images
create policy "Users can update their own property images."
    on public.property_images
    for update
    to authenticated
    using (
        auth.uid() = (
            select created_by
            from public.property_listings
            where id = property_id
        )
    )
    with check (
        auth.uid() = (
            select created_by
            from public.property_listings
            where id = property_id
        )
    );

-- Allow users to delete their own property images
create policy "Users can delete their own property images."
    on public.property_images
    for delete
    to authenticated
    using (
        auth.uid() = (
            select created_by
            from public.property_listings
            where id = property_id
        )
    );
