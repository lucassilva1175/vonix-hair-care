-- Vonix Afiliadas ONLY. Apply to dedicated Supabase project jewbzrbbvxyqmxqbrwrq.
-- C25 forward-only, non-destructive, idempotent privilege hardening.
-- A previously activated owner must not re-enable their own deactivated
-- roster entry when password_set_at is reset to NULL.
BEGIN;
ALTER TABLE public.vonix_affiliate_admin_invites
  ADD COLUMN IF NOT EXISTS ever_activated_at timestamptz;

-- Backfill activation history for existing active members without changing
-- their current authorization or the pending owners' invitation state.
UPDATE public.vonix_affiliate_admin_invites
SET ever_activated_at = password_set_at
WHERE password_set_at IS NOT NULL AND ever_activated_at IS NULL;

CREATE OR REPLACE FUNCTION public.vonix_affiliate_activate_admin_account()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE current_email text;
BEGIN
  SELECT lower(email) INTO current_email
  FROM auth.users WHERE id = auth.uid() AND email_confirmed_at IS NOT NULL
    AND encrypted_password IS NOT NULL AND length(encrypted_password) > 0;
  IF current_email IS NULL THEN RETURN false; END IF;

  -- Mark once only. Clearing password_set_at later disables access while
  -- ever_activated_at remains non-NULL; a revoked member cannot restore it.
  UPDATE public.vonix_affiliate_admin_invites
    SET password_set_at = now(), ever_activated_at = now()
    WHERE email = current_email
      AND password_set_at IS NULL
      AND ever_activated_at IS NULL;

  RETURN EXISTS (
    SELECT 1 FROM public.vonix_affiliate_admin_invites
      WHERE email = current_email
        AND password_set_at IS NOT NULL
        AND ever_activated_at IS NOT NULL
  );
END $$;

-- Intentional per-user owner activation endpoint. The SECURITY DEFINER
-- function has no arguments, uses auth.uid() from a confirmed Auth identity,
-- and may update only its matching pre-invited row. No anonymous execution.
REVOKE ALL ON FUNCTION public.vonix_affiliate_activate_admin_account()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.vonix_affiliate_activate_admin_account()
  TO authenticated;
COMMIT;
