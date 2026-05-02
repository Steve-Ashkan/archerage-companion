-- ═══════════════════════════════════════════════════════════════════════════════
-- ARC Points System Migration
-- Run this in the Supabase SQL editor (Dashboard → SQL editor → New query)
-- ═══════════════════════════════════════════════════════════════════════════════


-- ─── TABLES ──────────────────────────────────────────────────────────────────

-- One row per point event (earned or deducted)
create table if not exists arc_point_ledger (
  id           bigint generated always as identity primary key,
  discord_id   text        not null,
  points       int         not null,   -- positive = earned, negative = spent
  action_type  text        not null,   -- 'wiki_approved' | 'recipe_verified' | 'ah_price_accepted' | 'redemption' | 'refund' | 'admin_grant'
  reference_id text,                   -- submission id, item name, etc.
  created_at   timestamptz not null default now()
);

create index if not exists arc_point_ledger_discord_idx on arc_point_ledger(discord_id);
create index if not exists arc_point_ledger_created_idx on arc_point_ledger(created_at desc);

-- Redemption requests
create table if not exists arc_redemptions (
  id           bigint generated always as identity primary key,
  discord_id   text        not null,
  reward_id    text        not null,
  reward_label text        not null,
  points_spent int         not null,
  ign_snapshot text,                   -- in-game name at time of redemption
  discord_name text,
  recipient_id text,                   -- for gift rewards: recipient's discord_id
  status       text        not null default 'pending',  -- pending | fulfilled | cancelled
  notes        text,
  fulfilled_at timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists arc_redemptions_discord_idx on arc_redemptions(discord_id);
create index if not exists arc_redemptions_status_idx  on arc_redemptions(status);

-- In-app mail (used to notify users of approvals, rejections, point awards)
create table if not exists user_mail (
  id                   bigint generated always as identity primary key,
  sender_discord_id    text,                   -- null = system message
  recipient_discord_id text        not null,
  subject              text        not null,
  body                 text        not null,
  is_read              boolean     not null default false,
  reference_id         text,                   -- optional link to a submission/redemption
  created_at           timestamptz not null default now()
);

create index if not exists user_mail_recipient_idx on user_mail(recipient_discord_id);
create index if not exists user_mail_read_idx      on user_mail(recipient_discord_id, is_read);

-- Enable RLS (service role bypasses it — all app queries use supabaseAdmin)
alter table arc_point_ledger  enable row level security;
alter table arc_redemptions   enable row level security;
alter table user_mail         enable row level security;


-- ─── RPCs ────────────────────────────────────────────────────────────────────

-- Total point balance for a user
create or replace function get_my_points(p_discord_id text)
returns int
language sql security definer
as $$
  select coalesce(sum(points), 0)::int
  from arc_point_ledger
  where discord_id = p_discord_id;
$$;

-- Point history for a user (last 100 events, newest first)
create or replace function get_my_point_history(p_discord_id text)
returns table (
  action_type  text,
  points       int,
  reference_id text,
  created_at   timestamptz
)
language sql security definer
as $$
  select action_type, points, reference_id, created_at
  from arc_point_ledger
  where discord_id = p_discord_id
  order by created_at desc
  limit 100;
$$;

-- Pending redemptions for the admin panel (all pending, oldest first)
create or replace function get_pending_redemptions()
returns table (
  id           bigint,
  discord_id   text,
  reward_id    text,
  reward_label text,
  points_spent int,
  ign_snapshot text,
  discord_name text,
  recipient_id text,
  status       text,
  notes        text,
  created_at   timestamptz
)
language sql security definer
as $$
  select id, discord_id, reward_id, reward_label, points_spent,
         ign_snapshot, discord_name, recipient_id, status, notes, created_at
  from arc_redemptions
  where status = 'pending'
  order by created_at asc;
$$;

-- Award points to a user (server-side only — called from main.js via supabaseAdmin.rpc)
create or replace function award_arc_points(
  p_discord_id  text,
  p_points      int,
  p_action_type text,
  p_reference_id text default null
)
returns void
language sql security definer
as $$
  insert into arc_point_ledger (discord_id, points, action_type, reference_id)
  values (p_discord_id, p_points, p_action_type, p_reference_id);
$$;
