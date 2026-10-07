-- Keep ownership RLS; restrict which columns the browser can write.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant insert (id, display_name, slug) on public.profiles to authenticated;
grant update (display_name, bio, avatar_url) on public.profiles to authenticated;

create function public.protect_profile_writes()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  avatar_prefix constant text :=
    'https://bqhtqbiqrzwpcxmyxlef.supabase.co/storage/v1/object/public/profile-avatars/';
  avatar_changed boolean;
begin
  if tg_op = 'UPDATE' then
    if new.id is distinct from old.id
      or new.slug is distinct from old.slug
      or new.created_at is distinct from old.created_at then
      raise exception 'Profile identity cannot be changed'
        using errcode = '42501';
    end if;
    avatar_changed := new.avatar_url is distinct from old.avatar_url;
    new.updated_at := now();
  else
    avatar_changed := new.avatar_url is not null;
  end if;

  new.display_name := btrim(new.display_name);
  if new.display_name is null or char_length(new.display_name) = 0 then
    raise exception 'Display name is required'
      using errcode = '23514', constraint = 'profiles_display_name_nonempty';
  end if;

  if new.bio is not null then
    new.bio := btrim(new.bio);
    if char_length(new.bio) = 0 then
      raise exception 'Introduction cannot be empty'
        using errcode = '23514', constraint = 'profiles_bio_nonempty';
    end if;
  end if;

  -- Preserve unchanged legacy URLs. New URLs must use this project's own folder.
  -- This matches the former Route check; it does not verify object existence.
  if avatar_changed and (
    new.avatar_url is null
    or left(new.avatar_url, char_length(avatar_prefix)) <> avatar_prefix
    or substring(new.avatar_url from char_length(avatar_prefix) + 1)
      !~ ('^' || new.id::text || '/[0-9a-f-]{36}\.(jpg|png|webp)$')
  ) then
    raise exception 'profiles_avatar_url_owner: Avatar must use the profile owner storage folder'
      using errcode = '23514', constraint = 'profiles_avatar_url_owner';
  end if;

  return new;
end;
$$;

revoke all on function public.protect_profile_writes() from public, anon, authenticated;

create trigger protect_profile_writes
before insert or update on public.profiles
for each row execute function public.protect_profile_writes();
