-- Add Settings table for company configuration
create table if not exists settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid, -- For multi-tenant support later
  
  -- Company Info
  company_name text default 'Your Company',
  services jsonb default '["Web Design", "SEO", "Digital Marketing"]'::jsonb,
  
  -- Lead Qualification Parameters
  min_rating float default 4.0,
  max_rating float default 4.5,
  min_reviews int default 0,
  max_reviews int default 50,
  require_website boolean default false,
  
  -- AI Agent Configuration
  opening_message text default 'Hi! Is this {business_name}? This is {agent_name} from {company_name}...',
  value_proposition text default 'We help businesses like yours get more customers through better online presence.',
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add Packages table
create table if not exists packages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  
  name text not null,
  description text,
  price_min int, -- in cents
  price_max int, -- in cents
  is_fixed_price boolean default false,
  features jsonb default '[]'::jsonb,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table settings enable row level security;
alter table packages enable row level security;

-- Public policies for now
create policy "Enable all access for all users" on settings for all using (true);
create policy "Enable all access for all users" on packages for all using (true);

-- Insert default settings
insert into settings (company_name, services) 
values ('Marketing Solutions', '["Web Design", "SEO", "Google Ads", "Social Media Marketing", "Reputation Management"]'::jsonb)
on conflict do nothing;
