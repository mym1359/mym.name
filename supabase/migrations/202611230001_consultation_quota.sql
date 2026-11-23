-- Transient counters only; no questions, answers or IP addresses.
create table mym_private.assistant_quota (
  day date not null,
  bucket text not null,
  calls integer not null,
  primary key (day, bucket)
);
alter table mym_private.assistant_quota enable row level security;
revoke all on mym_private.assistant_quota from public, anon, authenticated;

create function public.mym_reserve_assistant(p_token text, p_visitor text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  today date := (now() at time zone 'UTC')::date;
  visitor_bucket text := to_char(now() at time zone 'UTC','HH24') || ':' || p_visitor;
begin
  if p_token is null or length(p_token) <> 64 or not exists (
    select from mym_private.collector where digest = sha256(convert_to(p_token,'UTF8'))
  ) then raise insufficient_privilege; end if;
  if p_visitor is null or p_visitor !~ '^[0-9a-f]{64}$' then raise invalid_parameter_value; end if;

  insert into mym_private.assistant_quota values (today,'all',0)
    on conflict do nothing;
  perform 1 from mym_private.assistant_quota
    where day=today and bucket='all' and calls < 120 for update;
  if not found then return false; end if;
  delete from mym_private.assistant_quota where day < today;
  insert into mym_private.assistant_quota as q values (today,visitor_bucket,1)
    on conflict (day,bucket) do update set calls=q.calls+1 where q.calls < 12;
  if not found then return false; end if;
  update mym_private.assistant_quota set calls=calls+1 where day=today and bucket='all';
  return true;
end;
$$;
revoke all on function public.mym_reserve_assistant(text,text) from public, anon, authenticated, service_role;
grant execute on function public.mym_reserve_assistant(text,text) to anon;
