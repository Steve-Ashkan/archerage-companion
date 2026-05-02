-- Optional donation recognition log.
-- This is not a paywall system. It stores manual thank-you entries for public monthly recognition.

create table if not exists public.donation_log (
  id bigserial primary key,
  display_name text,
  ign text,
  support_type text not null default 'Other',
  amount_private text,
  tier text not null default 'Supporter',
  note text,
  is_public boolean not null default true,
  donated_on date not null default current_date,
  donation_month text not null,
  created_by text references public.profiles(discord_id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_donation_log_month_public
  on public.donation_log (donation_month, is_public, donated_on desc);

alter table public.donation_log enable row level security;
