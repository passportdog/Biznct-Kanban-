-- Enable RLS
alter table if exists crm_deals enable row level security;
alter table if exists crm_accounts enable row level security;
alter table if exists crm_contacts enable row level security;
alter table if exists crm_tasks enable row level security;
alter table if exists crm_comments enable row level security;

-- Create tables if not exist
create table if not exists crm_deals (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  stage text not null,
  type text not null default 'pipeline',
  status text default 'active',
  value integer default 0,
  probability integer default 20,
  priority text,
  company_name text,
  company_id uuid,
  contact_name text,
  contact_id uuid,
  owner_name text,
  owner_id uuid,
  next_step text,
  next_step_date date,
  description text,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists crm_accounts (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  industry text,
  location text,
  status text default 'lead',
  tags text[],
  website text,
  phone text,
  email text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists crm_contacts (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text,
  email text,
  phone text,
  preferred_contact text,
  company_id uuid,
  company_name text,
  notes text,
  last_contacted date,
  next_follow_up date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists crm_tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  status text default 'todo',
  priority text default 'medium',
  due_date date,
  assigned_to uuid,
  assigned_name text,
  deal_id uuid,
  deal_title text,
  account_id uuid,
  account_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists crm_comments (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  author_id uuid not null,
  author_name text,
  deal_id uuid,
  account_id uuid,
  task_id uuid,
  is_internal boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
create policy "Enable all access for authenticated users" on crm_deals for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on crm_accounts for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on crm_contacts for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on crm_tasks for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on crm_comments for all using (auth.role() = 'authenticated');