-- Run through psql with -v owner_email=... as the trusted project operator.
\set ON_ERROR_STOP on
begin;
-- Serialize against signups while recording or resolving this one-time appointment.
lock table auth.users in share row exclusive mode;
insert into mym_private.pending_admin(email) values(lower(btrim(:'owner_email'))) on conflict do nothing;
with candidate as (
  select id,lower(btrim(email)) email from auth.users
  where lower(btrim(email))=lower(btrim(:'owner_email')) and email_confirmed_at is not null
), appointed as (
  insert into mym_private.administrators(user_id) select id from candidate on conflict do nothing
)
delete from mym_private.pending_admin where email in (select email from candidate);
commit;
