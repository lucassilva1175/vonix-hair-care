-- Dedicated Vonix Hair Afiliadas database only.
-- Fix C26 admin search for email-less candidates using public social handles.
-- Preserve the Notificacoes tab's reviewed-only semantics, RLS and pagination.
-- Username fragments, @handles and pasted social profile URLs are supported.
-- LIKE wildcards and backslashes are escaped as literal characters.
BEGIN;
create or replace function public.vonix_affiliate_search(
  p_status text, p_query text, p_offset integer, p_limit integer, p_mail_status text default null
) returns jsonb language plpgsql stable security invoker set search_path = ''
as $$
declare
  v_query text := trim(coalesce(p_query, ''));
  -- Escape LIKE wildcard metacharacters; user search must be literal, not a pattern.
  v_pattern text := replace(replace(replace(trim(coalesce(p_query, '')), chr(92),
    chr(92) || chr(92)), '%', chr(92) || '%'), '_', chr(92) || '_');
  -- @handle input is a social username, not an e-mail; wildcard escapes
  -- remain literal and the @-only query must not match every applicant.
  v_profile_query text := case when left(v_query,1)='@' then substring(v_query from 2) else v_query end;
  v_profile_pattern text := replace(replace(replace(v_profile_query, chr(92),
    chr(92) || chr(92)), '%', chr(92) || '%'), '_', chr(92) || '_');
begin
  if p_status not in ('pendente', 'aprovada', 'recusada', 'todas')
    or (p_mail_status is not null and p_mail_status not in ('pendente', 'processando', 'enviado', 'falhou', 'incerto'))
    or length(v_query) > 70
    or p_offset is null or p_offset < 0 or p_offset > 2000000
    or p_limit is null or p_limit < 1 or p_limit > 40 then
    raise exception 'Consulta inválida';
  end if;

  return (
    with filtered as (
      select a.id, a.full_name, a.age, a.city, a.state, a.hair_type, a.email,
             a.instagram_url, a.tiktok_url, a.motivation, a.questionnaire_encrypted,
             a.status, a.rejection_reason, a.created_at, a.reviewed_at
      from public.vonix_affiliate_applications a
      where (a.status = p_status or (p_status = 'todas' and a.status <> 'pendente'))
        and (p_mail_status is null or exists (
          select 1 from public.vonix_affiliate_mail_outbox m
           where m.application_id = a.id and m.status = p_mail_status
        ))
        and (v_query = ''
          or a.full_name ilike '%' || v_pattern || '%' escape chr(92)
          or a.email ilike '%' || v_pattern || '%' escape chr(92)
          or (length(v_profile_query) > 0 and (
            a.instagram_url ilike '%' || v_profile_pattern || '%' escape chr(92)
            or a.tiktok_url ilike '%' || v_profile_pattern || '%' escape chr(92)
          )))
    ), paged as (
      select f.*, m.status as mail_status, m.sent_at as mail_sent_at, m.id as mail_id
      from filtered f
      left join public.vonix_affiliate_mail_outbox m on m.application_id = f.id
      order by f.created_at desc, f.id desc
      limit p_limit offset p_offset
    )
    select jsonb_build_object(
      'total', (select count(*) from filtered),
      'applications', coalesce(
        (select jsonb_agg(jsonb_build_object(
          'id', p.id,
          'full_name', p.full_name,
          'age', p.age,
          'city', p.city,
          'state', p.state,
          'hair_type', p.hair_type,
          'email', p.email,
          'instagram_url', p.instagram_url,
          'tiktok_url', p.tiktok_url,
          'motivation', p.motivation,
          'questionnaire_encrypted', p.questionnaire_encrypted,
          'status', p.status,
          'rejection_reason', p.rejection_reason,
          'created_at', p.created_at,
          'reviewed_at', p.reviewed_at,
          'vonix_affiliate_mail_outbox',
            case when p.mail_id is null then '[]'::jsonb
              else jsonb_build_array(jsonb_build_object('status', p.mail_status, 'sent_at', p.mail_sent_at)) end
        ) order by p.created_at desc, p.id desc) from paged p),
        '[]'::jsonb
      )
    )
  );
end;
$$;
COMMIT;
