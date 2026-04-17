// Creates a Stripe Checkout session for a given discord_id.
// Returns { url } — the hosted checkout URL to open in the system browser.

import Stripe from 'https://esm.sh/stripe@14?target=deno';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { discord_id } = await req.json();
    if (!discord_id) {
      return new Response(JSON.stringify({ error: 'Missing discord_id' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-06-20',
    });

    const session = await stripe.checkout.sessions.create({
      mode:                'subscription',
      client_reference_id: discord_id,
      line_items: [{ price: Deno.env.get('STRIPE_PRICE_ID')!, quantity: 1 }],
      subscription_data:   { trial_period_days: 7 },
      success_url: 'https://github.com/Steve-Ashkan/archerage-companion?payment=success',
      cancel_url:  'https://github.com/Steve-Ashkan/archerage-companion?payment=cancelled',
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('[create-checkout]', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
