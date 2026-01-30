-- Add quotes table
create table if not exists quotes (
  id uuid default gen_random_uuid() primary key,
  deal_id uuid references deals(id) on delete cascade,
  
  package_id uuid references packages(id),
  amount int not null, -- in cents
  status text default 'DRAFT', -- DRAFT, SENT, ACCEPTED, REJECTED, PAID
  
  -- Delivery info
  sent_via text, -- WHATSAPP, EMAIL, SMS
  sent_to text, -- phone number or email
  sent_at timestamp with time zone,
  
  -- Payment
  stripe_payment_link text,
  stripe_payment_id text,
  paid_at timestamp with time zone,
  
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table quotes enable row level security;
create policy "Enable all access for all users" on quotes for all using (true);
