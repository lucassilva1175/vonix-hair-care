-- QA-ONLY: disposable, network-isolated postgres fixture. DO NOT RUN ON REAL DATA.
-- Requires fake auth schema and affiliate portal-status bootstrap in CI.
INSERT INTO auth.users (id,email,email_confirmed_at,encrypted_password)
VALUES
 ('00000000-0000-4000-8000-000000000025','activated.qa@example.invalid',now(),'synthetic-hash'),
 ('00000000-0000-4000-8000-000000000026','new.qa@example.invalid',now(),'synthetic-hash'),
 ('00000000-0000-4000-8000-000000000027','uninvited.qa@example.invalid',now(),'synthetic-hash'),
 ('00000000-0000-4000-8000-000000000028','unconfirmed.qa@example.invalid',NULL,'synthetic-hash'),
 ('00000000-0000-4000-8000-000000000029','no-password.qa@example.invalid',now(),NULL);

INSERT INTO public.vonix_affiliate_admin_invites(email,role,password_set_at)
VALUES
 ('activated.qa@example.invalid','owner',now() - interval '1 day'),
 ('new.qa@example.invalid','owner',NULL),
 ('unconfirmed.qa@example.invalid','owner',NULL),
 ('no-password.qa@example.invalid','reviewer',NULL);
-- Simulate an old production row active before the immutable marker existed.
UPDATE public.vonix_affiliate_admin_invites
SET ever_activated_at = NULL WHERE email='activated.qa@example.invalid';

-- Forward script must be idempotent and backfill existing activations.
\i /tmp/vonix-affiliate-admin-activation-guard-20261112.sql

DO $$
BEGIN
 IF NOT EXISTS (
  SELECT 1 FROM public.vonix_affiliate_admin_invites
  WHERE email='activated.qa@example.invalid'
    AND password_set_at IS NOT NULL AND ever_activated_at IS NOT NULL
 ) THEN RAISE EXCEPTION 'C25 QA: failed to backfill existing activated member'; END IF;
 IF EXISTS (
  SELECT 1 FROM public.vonix_affiliate_admin_invites
  WHERE email='new.qa@example.invalid' AND ever_activated_at IS NOT NULL
 ) THEN RAISE EXCEPTION 'C25 QA: pending invite was accidentally marked activated'; END IF;
 IF has_function_privilege('anon','public.vonix_affiliate_activate_admin_account()','EXECUTE')
 THEN RAISE EXCEPTION 'C25 QA: anonymous caller can invoke owner activation'; END IF;
 IF NOT has_function_privilege('authenticated','public.vonix_affiliate_activate_admin_account()','EXECUTE')
 THEN RAISE EXCEPTION 'C25 QA: legitimate invited authenticated owner cannot activate'; END IF;
END $$;

-- Use the real authenticated role and synthetic JWT uid, not privileged API key.
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000027',false);
DO $$ BEGIN
 IF public.vonix_affiliate_activate_admin_account()
 THEN RAISE EXCEPTION 'C25 QA: uninvited identity activated'; END IF;
END $$;

SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000028',false);
DO $$ BEGIN
 IF public.vonix_affiliate_activate_admin_account()
 THEN RAISE EXCEPTION 'C25 QA: unconfirmed email activated'; END IF;
END $$;

SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000029',false);
DO $$ BEGIN
 IF public.vonix_affiliate_activate_admin_account()
 THEN RAISE EXCEPTION 'C25 QA: missing password activated'; END IF;
END $$;

SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000025',false);
DO $$ BEGIN
 IF NOT public.vonix_affiliate_activate_admin_account()
 THEN RAISE EXCEPTION 'C25 QA: existing active owner unexpectedly denied'; END IF;
END $$;

SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000026',false);
DO $$ BEGIN
 IF NOT public.vonix_affiliate_activate_admin_account()
 THEN RAISE EXCEPTION 'C25 QA: verified first-time invitation failed'; END IF;
END $$;
RESET ROLE;

DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1 FROM public.vonix_affiliate_admin_invites
  WHERE email='new.qa@example.invalid'
    AND password_set_at IS NOT NULL AND ever_activated_at IS NOT NULL
 ) THEN RAISE EXCEPTION 'C25 QA: first activation not stamped atomically'; END IF;
END $$;

-- Simulated revocation keeps the durable activation marker. Former owners
-- must NOT restore themselves with a still-valid Auth session.
UPDATE public.vonix_affiliate_admin_invites
SET password_set_at=NULL WHERE email='new.qa@example.invalid';
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000026',false);
DO $$ BEGIN
 IF public.vonix_affiliate_activate_admin_account()
 THEN RAISE EXCEPTION 'C25 QA: revoked owner self-reactivated'; END IF;
END $$;
RESET ROLE;
DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1 FROM public.vonix_affiliate_admin_invites
  WHERE email='new.qa@example.invalid'
    AND password_set_at IS NULL AND ever_activated_at IS NOT NULL
 ) THEN RAISE EXCEPTION 'C25 QA: deactivation did not remain in force'; END IF;
END $$;
SELECT 'C25_ACTIVATION_REVOCATION_QA_PASS' AS result;
