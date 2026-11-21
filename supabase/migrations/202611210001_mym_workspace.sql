begin;
create schema mym_private;
revoke all on schema mym_private from public, anon, authenticated;
create table mym_private.administrators (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table mym_private.pending_admin (
  email text primary key check(email=lower(btrim(email)) and email<>'')
);
alter table mym_private.pending_admin enable row level security;
create function mym_private.claim_designated_admin() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if new.email_confirmed_at is not null and new.email is not null then
    delete from mym_private.pending_admin where email=lower(btrim(new.email));
    if found then
      insert into mym_private.administrators(user_id) values(new.id) on conflict do nothing;
    end if;
  end if;
  return new;
end; $$;
revoke all on function mym_private.claim_designated_admin() from public,anon,authenticated;
create trigger mym_bind_designated_owner after insert or update of email,email_confirmed_at on auth.users
for each row execute function mym_private.claim_designated_admin();

create table mym_private.requests (
  id uuid primary key, owner_id uuid not null references auth.users(id) on delete cascade,
  topic text not null check (topic in ('workflow','assistant','analytics','other')),
  subject text not null check (length(btrim(subject)) between 3 and 160),
  status text not null default 'open' check (status in ('open','active','closed')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index mym_request_owner on mym_private.requests(owner_id,updated_at desc);
create index mym_request_queue on mym_private.requests(updated_at desc,id);
create table mym_private.messages (
  seq bigint generated always as identity primary key, id uuid not null unique,
  request_id uuid not null references mym_private.requests(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null, advisor boolean not null,
  body text not null check (length(btrim(body)) between 1 and 5000), created_at timestamptz not null default now()
);
create index mym_message_thread on mym_private.messages(request_id,seq desc);
create table mym_private.collector (
  singleton boolean primary key default true check(singleton),
  digest bytea not null check(octet_length(digest)=32)
);
alter table mym_private.collector enable row level security;
create table mym_private.page_views (
  day date not null, page text not null, lang text not null check(lang in ('en','fa')),
  views bigint not null default 0, primary key(day,page,lang)
);
alter table mym_private.administrators enable row level security;
alter table mym_private.requests enable row level security;
alter table mym_private.messages enable row level security;
alter table mym_private.page_views enable row level security;
revoke all on all tables in schema mym_private from public, anon, authenticated;
revoke all on all sequences in schema mym_private from public, anon, authenticated;

create function public.mym_is_admin() returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from mym_private.administrators where user_id=auth.uid());
$$;

create function public.mym_create_request(p_id uuid,p_topic text,p_subject text,p_body text) returns uuid
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();
begin
  if actor is null then raise insufficient_privilege; end if;
  perform pg_advisory_xact_lock(hashtextextended(actor::text,0));
  if exists(select from mym_private.requests where id=p_id and owner_id=actor) then return p_id; end if;
  if (select count(*) from mym_private.requests where owner_id=actor and created_at>now()-interval '1 hour')>=10 then
    raise exception 'request_limit';
  end if;
  insert into mym_private.requests(id,owner_id,topic,subject) values(p_id,actor,p_topic,btrim(p_subject));
  insert into mym_private.messages(id,request_id,author_id,advisor,body) values(gen_random_uuid(),p_id,actor,false,btrim(p_body));
  return p_id;
end; $$;

create function public.mym_list_requests(p_status text default '',p_search text default '',p_offset int default 0,p_own_only boolean default false)
returns table(id uuid,subject text,topic text,status text,updated_at timestamptz,client_email text)
language sql stable security definer set search_path='' as $$
  select r.id,r.subject,r.topic,r.status,r.updated_at,u.email::text
  from mym_private.requests r join auth.users u on u.id=r.owner_id
  where (r.owner_id=auth.uid() or (not p_own_only and public.mym_is_admin()))
    and (p_status='' or r.status=p_status)
    and (coalesce(p_search,'')='' or strpos(lower(r.subject),lower(left(p_search,160)))>0
      or strpos(lower(u.email),lower(left(p_search,160)))>0)
  order by r.updated_at desc,r.id limit 16 offset greatest(coalesce(p_offset,0),0);
$$;

create function public.mym_thread(p_request uuid,p_before bigint default null)
returns table(seq bigint,advisor boolean,body text,created_at timestamptz)
language sql stable security definer set search_path='' as $$
  select m.seq,m.advisor,m.body,m.created_at from mym_private.messages m join mym_private.requests r on r.id=m.request_id
  where r.id=p_request and (r.owner_id=auth.uid() or public.mym_is_admin())
    and (p_before is null or m.seq<p_before) order by m.seq desc limit 31;
$$;

create function public.mym_reply(p_request uuid,p_id uuid,p_body text) returns void
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); is_staff boolean:=public.mym_is_admin(); target mym_private.requests;
begin
  if actor is null then raise insufficient_privilege; end if;
  perform pg_advisory_xact_lock(hashtextextended(actor::text,0));
  select * into target from mym_private.requests where id=p_request and (owner_id=actor or is_staff) for update;
  if not found then raise insufficient_privilege; end if;
  if exists(select from mym_private.messages where id=p_id and author_id=actor and request_id=p_request) then return; end if;
  if target.status='closed' then raise exception 'thread_closed'; end if;
  if not is_staff and (select count(*) from mym_private.messages where author_id=actor and created_at>now()-interval '1 hour')>=60 then raise exception 'request_limit'; end if;
  insert into mym_private.messages(id,request_id,author_id,advisor,body) values(p_id,p_request,actor,is_staff,btrim(p_body));
  update mym_private.requests set updated_at=now(),status=case when is_staff then 'active' else status end where id=p_request;
end; $$;

create function public.mym_set_status(p_request uuid,p_status text) returns void
language plpgsql security definer set search_path='' as $$
begin
  if not public.mym_is_admin() then raise insufficient_privilege; end if;
  update mym_private.requests set status=p_status,updated_at=now() where id=p_request;
  if not found then raise exception 'unknown_request'; end if;
end; $$;

create function public.mym_record_view(p_page text,p_lang text) returns void
language plpgsql security definer set search_path='' as $$
begin
  if p_page not in ('home','work','work/darj','work/sepam','work/initiative','expertise','about','privacy') then raise exception 'invalid_page'; end if;
  insert into mym_private.page_views as v(day,page,lang,views) values((now() at time zone 'UTC')::date,p_page,p_lang,1)
  on conflict(day,page,lang) do update set views=v.views+1;
end; $$;

-- A server credential limited to incrementing aggregate counters; no access to customer data.
create function public.mym_collect_view(p_page text,p_lang text,p_token text) returns void
language plpgsql security definer set search_path='' as $$
begin
  if p_token is null or length(p_token)<>64 or not exists (
    select from mym_private.collector where digest=sha256(convert_to(p_token,'UTF8'))
  ) then raise insufficient_privilege; end if;
  perform public.mym_record_view(p_page,p_lang);
end; $$;
revoke all on function public.mym_collect_view(text,text,text) from public,anon,authenticated,service_role;
grant execute on function public.mym_collect_view(text,text,text) to anon;

create function public.mym_metrics() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare first_day date:=(now() at time zone 'UTC')::date-29;
begin
  if not public.mym_is_admin() then raise insufficient_privilege; end if;
  return jsonb_build_object(
    'accounts',(select count(*) from auth.users where email_confirmed_at is not null),
    'requests',(select count(*) from mym_private.requests),
    'open',(select count(*) from mym_private.requests where status='open'),
    'active',(select count(*) from mym_private.requests where status='active'),
    'closed',(select count(*) from mym_private.requests where status='closed'),
    'views',(select coalesce(sum(views),0) from mym_private.page_views where day>=first_day),
    'en',(select coalesce(sum(views),0) from mym_private.page_views where day>=first_day and lang='en'),
    'fa',(select coalesce(sum(views),0) from mym_private.page_views where day>=first_day and lang='fa'),
    'days',(select jsonb_agg(jsonb_build_object('day',d.day,'views',d.views) order by d.day) from (
      select first_day+n as day,coalesce(sum(v.views),0) as views from generate_series(0,29) n
      left join mym_private.page_views v on v.day=first_day+n group by n) d),
    'pages',coalesce((select jsonb_agg(jsonb_build_object('page',p.page,'views',p.views) order by p.views desc,p.page)
      from (select page,sum(views) views from mym_private.page_views where day>=first_day group by page) p),'[]'::jsonb)
  );
end; $$;

-- The application can only call these scoped operations. Direct table access stays closed.
revoke all on function public.mym_is_admin(), public.mym_create_request(uuid,text,text,text),
  public.mym_list_requests(text,text,int,boolean),public.mym_thread(uuid,bigint),public.mym_reply(uuid,uuid,text),
  public.mym_set_status(uuid,text),public.mym_metrics(),public.mym_record_view(text,text)
  from public,anon,authenticated,service_role;
grant execute on function public.mym_is_admin(),public.mym_create_request(uuid,text,text,text),
  public.mym_list_requests(text,text,int,boolean),public.mym_thread(uuid,bigint),public.mym_reply(uuid,uuid,text),
  public.mym_set_status(uuid,text),public.mym_metrics() to authenticated;
grant execute on function public.mym_record_view(text,text) to service_role;
commit;

