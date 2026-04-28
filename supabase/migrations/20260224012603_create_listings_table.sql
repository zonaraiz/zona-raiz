create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties on delete cascade,
  agent_id uuid references public.real_estate_agents on delete restrict,

  -- Tipo y precio
  listing_type listing_type not null,
  price decimal(15, 2) not null,
  currency text default 'ARS',
  price_negotiable boolean default false,
  whatsapp_contact text not null,

  -- Expensas (para alquileres)
  expenses_amount decimal(12, 2),
  expenses_included boolean default false,

  -- Estado y visibilidad
  status listing_status default 'draft',
  featured boolean default false,
  featured_until timestamptz,

  -- SEO y Marketing
  virtual_tour_url text,
  video_url text,

  -- Disponibilidad
  available_from date,
  minimum_contract_duration integer,

  -- Estadísticas
  views_count integer default 0,
  enquiries_count integer default 0,
  whatsapp_clicks integer default 0,

  -- Timestamps
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  published_at timestamptz,

  -- Constraints
  constraint positive_price check (price >= 0),
  unique(property_id, listing_type)
);

create index idx_listings_property on public.listings(property_id);
create index idx_listings_agent on public.listings(agent_id);
create index idx_listings_type_status on public.listings(listing_type, status);
create index idx_listings_status on public.listings(status);
create index idx_listings_price on public.listings(price);
create index idx_listings_featured on public.listings(featured, featured_until) where featured = true;
create index idx_listings_published on public.listings(published_at);
create index idx_listings_created on public.listings(created_at desc);
