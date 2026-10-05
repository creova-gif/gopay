create table if not exists transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users not null,
  type         text not null check (type in ('topup','withdrawal','p2p_send','p2p_receive')),
  provider     text not null check (provider in ('selcom','flutterwave','internal')),
  network      text check (network in ('mpesa','tigo','airtel','halopesa','card')),
  amount       numeric(12,2) not null check (amount > 0),
  currency     text not null default 'TZS',
  status       text not null default 'pending'
               check (status in ('pending','processing','completed','failed','reversed')),
  provider_ref text,
  phone        text,
  metadata     jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists transactions_user_status_idx on transactions (user_id, status);
create index if not exists transactions_provider_ref_idx on transactions (provider_ref)
  where provider_ref is not null;

create or replace view pending_balance as
  select
    user_id,
    coalesce(sum(amount), 0) as locked
  from transactions
  where type = 'topup'
    and status = 'pending'
  group by user_id;

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists transactions_updated_at on transactions;
create trigger transactions_updated_at
  before update on transactions
  for each row execute function update_updated_at();

alter table transactions enable row level security;

create policy "Users see own transactions"
  on transactions for select
  using (auth.uid() = user_id);
