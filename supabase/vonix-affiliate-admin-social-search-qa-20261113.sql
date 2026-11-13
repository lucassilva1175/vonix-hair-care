-- Synthetic QA only, executed in a disposable offline PostgreSQL container.
INSERT INTO public.vonix_affiliate_applications
(full_name,city,state,instagram_url,tiktok_url,consent_at,status,reviewed_at)
VALUES
('C26 Ana Demo','Cidade Teste','MG','https://instagram.com/c26ana','https://tiktok.com/@c26ana',now(),'pendente',NULL),
('C26 Bia Demo','Cidade Teste','MG','https://instagram.com/c26bia','https://tiktok.com/@c26bia',now(),'aprovada',now()),
('C26 Caio Demo','Cidade Teste','MG','https://instagram.com/c26caio',NULL,now(),'recusada',now());

DO $test$
DECLARE q jsonb;
BEGIN
  q := public.vonix_affiliate_search('pendente','@c26ana',0,40,NULL);
  IF (q->>'total')::integer <> 1 THEN RAISE EXCEPTION 'C26 Instagram @handle search failed'; END IF;
  q := public.vonix_affiliate_search('pendente','c26ana',0,40,NULL);
  IF (q->>'total')::integer <> 1 THEN RAISE EXCEPTION 'C26 plain Instagram username search failed'; END IF;
  q := public.vonix_affiliate_search('aprovada','@c26bia',0,40,NULL);
  IF (q->>'total')::integer <> 1 THEN RAISE EXCEPTION 'C26 TikTok @handle search failed'; END IF;
  q := public.vonix_affiliate_search('pendente','https://instagram.com/c26ana',0,40,NULL);
  IF (q->>'total')::integer <> 1 THEN RAISE EXCEPTION 'C26 pasted Instagram URL search failed'; END IF;
  q := public.vonix_affiliate_search('pendente','c26%',0,40,NULL);
  IF (q->>'total')::integer <> 0 THEN RAISE EXCEPTION 'C26 percent wildcard expanded'; END IF;
  q := public.vonix_affiliate_search('pendente','c26_',0,40,NULL);
  IF (q->>'total')::integer <> 0 THEN RAISE EXCEPTION 'C26 underscore wildcard expanded'; END IF;
  q := public.vonix_affiliate_search('pendente','C26 Ana',0,40,NULL);
  IF (q->>'total')::integer <> 1 THEN RAISE EXCEPTION 'C26 existing name search regressed'; END IF;
  q := public.vonix_affiliate_search('todas','c26',0,40,NULL);
  IF (q->>'total')::integer <> 2 THEN RAISE EXCEPTION 'C26 notifications view includes pending'; END IF;
  q := public.vonix_affiliate_search('pendente','c26',0,40,NULL);
  IF (q->>'total')::integer <> 1 THEN RAISE EXCEPTION 'C26 pending filter regressed'; END IF;
  RAISE NOTICE 'C26_ADMIN_SOCIAL_SEARCH_QA_PASS';
END $test$;
