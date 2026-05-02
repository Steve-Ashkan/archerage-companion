-- Migration 010: Revoke direct PostgREST execute on price submission RPCs
-- These functions must only be callable through app-api (which enforces rate limits + auth).
-- Direct anon/authenticated calls via PostgREST bypass the 200/hr rate limit entirely.
-- Applied manually 2026-04-28. Verified anon_exec = false for all three.

REVOKE EXECUTE ON FUNCTION public.submit_price(text, numeric)    FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.submit_inventory(jsonb)        FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_pending_price_items()      FROM PUBLIC, anon, authenticated;
