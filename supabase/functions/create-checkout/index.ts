// Creates a Stripe Checkout session for the authenticated caller.
// Caller identity comes from the verified session JWT — never the request body.

import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── JWT verification (same as app-api) ───────────────────────────────────────

async function verifyToken(authHeader: string | null): Promise<{ discord_id: string; token_version?: number } | null> {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const data    = `${header}.${body}`;
    const enc     = new TextEncoder();
    const secret  = Deno.env.get('SESSION_JWT_SECRET')!;
    const key     = await crypto.subtle.importKey(
      'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const sigBytes = Uint8Array.from(
      atob(sig.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)
    );
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(data));
    if (!valid) return null;
    const payload = JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/')));
    // H-3: Require exp to be present and numeric
    if (typeof payload.exp !== 'number' || payload.exp < Date.now() / 1000) return null;
    if (typeof payload.iat === 'number' && payload.iat > Date.now() / 1000 + 60) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { status: 200 });

  // M-5: Reject browser-originated requests
  if (req.headers.get('origin')) {
    return new Response(JSON.stringify({ error: 'Browser access forbidden' }), {
      status: 403, headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const caller = await verifyToken(req.headers.get('authorization'));
    if (!caller?.discord_id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    if (typeof caller.token_version !== 'number') {
      return new Response(JSON.stringify({ error: 'Session revoked, please sign in again' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: tv } = await db
      .from('profiles')
      .select('token_version')
      .eq('discord_id', caller.discord_id)
      .single();

    if ((tv?.token_version ?? 1) !== caller.token_version) {
      return new Response(JSON.stringify({ error: 'Session revoked, please sign in again' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-06-20',
    });

    const session = await stripe.checkout.sessions.create({
      mode:                'subscription',
      client_reference_id: caller.discord_id,
      line_items: [{ price: Deno.env.get('STRIPE_PRICE_ID')!, quantity: 1 }],
      subscription_data:   { trial_period_days: 7 },
      success_url: 'https://github.com/Steve-Ashkan/archerage-companion?payment=success',
      cancel_url:  'https://github.com/Steve-Ashkan/archerage-companion?payment=cancelled',
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('[create-checkout]', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
});
