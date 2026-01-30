-- Drop tables if they exist (Order matters: drop leads first because it depends on campaigns)
drop table if exists leads;
drop table if exists scrape_jobs;
drop table if exists campaigns;

-- 1. Create Campaigns Table
create table campaigns (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  query text, -- The search query e.g. "Plumbers in Austin, TX"
  status text default 'DRAFT', -- DRAFT, ACTIVE, PAUSED, COMPLETED
  auto_call_enabled boolean default false, -- Enable automatic calling
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null,
  "updatedAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Scrape Jobs Table (Job Queue)
create table scrape_jobs (
  id uuid default gen_random_uuid() primary key,
  "campaignId" uuid references campaigns(id) on delete cascade,
  query text not null,
  status text default 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
  results_count int default 0,
  error text,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null,
  "processedAt" timestamp with time zone
);

-- 3. Create Leads Table
create table leads (
  id uuid default gen_random_uuid() primary key,
  "businessName" text not null,
  "phoneNumber" text,
  website text,
  address text,
  city text,
  state text,
  zip text,
  country text,
  rating float,
  "reviewCount" int,
  status text default 'NEW', -- NEW, QUALIFIED, DISQUALIFIED, CONTACTED, CONVERTED
  "weakPoints" text, -- JSON string
  "suggestedPitch" text,
  "campaignId" uuid references campaigns(id) on delete set null,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null,
  "updatedAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table leads enable row level security;
alter table campaigns enable row level security;
alter table scrape_jobs enable row level security;

-- 5. Create policies for public access (replace with auth policies later)
create policy "Enable all access for all users" on leads for all using (true);
create policy "Enable all access for all users" on campaigns for all using (true);
create policy "Enable all access for all users" on scrape_jobs for all using (true);
