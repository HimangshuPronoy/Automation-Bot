-- Add deals table for pipeline tracking
create table if not exists deals (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references leads(id) on delete cascade,
  
  stage text default 'NEW', -- NEW, INTERESTED, QUOTE_SENT, NEGOTIATING, WON, LOST
  requirements text,
  quote_amount int, -- in cents
  notes text,
  package_id uuid references packages(id),
  
  closed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add calls table for call history
create table if not exists calls (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references leads(id) on delete cascade,
  
  vapi_call_id text,
  status text default 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, FAILED
  duration int, -- in seconds
  transcript text,
  outcome text, -- INTERESTED, NOT_INTERESTED, CALLBACK, NO_ANSWER
  scheduled_callback timestamp with time zone,
  recording_url text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add onboarding_complete flag to settings
alter table settings add column if not exists onboarding_complete boolean default false;
alter table settings add column if not exists ai_personality text default 'friendly';
alter table settings add column if not exists opening_message text;
alter table settings add column if not exists objection_responses jsonb default '{}'::jsonb;

-- Enable RLS
alter table deals enable row level security;
alter table calls enable row level security;

create policy "Enable all access for all users" on deals for all using (true);
create policy "Enable all access for all users" on calls for all using (true);
