create table public.finance_snapshots (
 user_id uuid primary key references auth.users(id) on delete cascade,
 state_json jsonb not null check (jsonb_typeof(state_json)='object' and octet_length(state_json::text)<=4000000),
 revision bigint not null check (revision>0),
 updated_at timestamptz not null default now()
);
alter table public.finance_snapshots enable row level security;
create policy "Read only own finances" on public.finance_snapshots for select to authenticated using ((select auth.uid())=user_id);
revoke all on public.finance_snapshots from anon,authenticated;
grant select on public.finance_snapshots to authenticated;
grant usage on schema public to authenticated;

create schema finance_private;
revoke all on schema finance_private from public;
grant usage on schema finance_private to authenticated;

create function finance_private.save_finance_snapshot(expected_revision bigint,new_state jsonb)
returns table(revision bigint,updated_at timestamptz)
language plpgsql security definer set search_path=''
as $$
declare current_user_id uuid := auth.uid();
begin
 if current_user_id is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if expected_revision is null or expected_revision<0 or new_state is null or jsonb_typeof(new_state) is distinct from 'object' or new_state->>'version' is distinct from '1' or jsonb_typeof(new_state->'transactions') is distinct from 'array' or jsonb_typeof(new_state->'accounts') is distinct from 'array' then raise exception 'Invalid state' using errcode='22023'; end if;
 if expected_revision=0 then
  return query insert into public.finance_snapshots as s(user_id,state_json,revision,updated_at) values(current_user_id,new_state,1,now()) on conflict(user_id) do nothing returning s.revision,s.updated_at;
 else
  return query update public.finance_snapshots as s set state_json=new_state,revision=s.revision+1,updated_at=now() where s.user_id=current_user_id and s.revision=expected_revision returning s.revision,s.updated_at;
 end if;
 if not found then raise exception 'Revision conflict' using errcode='40001'; end if;
end;
$$;
revoke all on function finance_private.save_finance_snapshot(bigint,jsonb) from public,anon;
grant execute on function finance_private.save_finance_snapshot(bigint,jsonb) to authenticated;

create function public.save_finance_snapshot(expected_revision bigint,new_state jsonb)
returns table(revision bigint,updated_at timestamptz)
language sql security invoker set search_path=''
as $$ select * from finance_private.save_finance_snapshot(expected_revision,new_state); $$;
revoke all on function public.save_finance_snapshot(bigint,jsonb) from public,anon;
grant execute on function public.save_finance_snapshot(bigint,jsonb) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('receipts','receipts',false,3000000,array['image/jpeg','image/png','image/webp','application/pdf','application/json']);
create policy "Own receipt read" on storage.objects for select to authenticated using (bucket_id='receipts' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Own receipt upload" on storage.objects for insert to authenticated with check (bucket_id='receipts' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Own receipt delete" on storage.objects for delete to authenticated using (bucket_id='receipts' and (storage.foldername(name))[1]=(select auth.uid())::text);
