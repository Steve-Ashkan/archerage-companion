// Stripe webhook handler.
// Listens for subscription events and updates the user's role in Supabase.
//
// Events handled:
//   checkout.session.completed       → set role='pro', store stripe_customer_id
//   customer.subscription.deleted   → set role='free' (cancelled/expired)
//   invoice.payment_failed           → set role='free' (payment failed after retries)

import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('No signature', { status: 400 });

  const body = await req.text();

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-06-20',
    });

    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
    );

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // ── Subscription started (checkout completed) ─────────────────────────────
    if (event.type === 'checkout.session.completed') {
      const session  = event.data.object as Stripe.Checkout.Session;
      const discordId = session.client_reference_id;
      if (!discordId) {
        console.error('[stripe-webhook] checkout.session.completed missing client_reference_id');
        return new Response('ok', { status: 200 });
      }

      // Get subscription period end so we know when Pro expires
      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      const proExpiresAt = new Date(sub.current_period_end * 1000).toISOString();

      // Store customer ID so we can look up the profile on future events
      await stripe.customers.update(session.customer as string, {
        metadata: { discord_id: discordId },
      });

      await supabase.from('profiles')
        .update({
          role:               'pro',
          pro_expires_at:     proExpiresAt,
          stripe_customer_id: session.customer as string,
        })
        .eq('discord_id', discordId);

      console.log(`[stripe-webhook] upgraded ${discordId} to pro, expires ${proExpiresAt}`);
    }

    // ── Subscription renewed — update expiry date ─────────────────────────────
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.billing_reason !== 'subscription_cycle') return new Response('ok', { status: 200 });

      const customerId = invoice.customer as string;
      const customer   = await stripe.customers.retrieve(customerId) as Stripe.Customer;
      const discordId  = customer.metadata?.discord_id;
      if (!discordId) return new Response('ok', { status: 200 });

      const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
      const proExpiresAt = new Date(sub.current_period_end * 1000).toISOString();

      await supabase.from('profiles')
        .update({ role: 'pro', pro_expires_at: proExpiresAt })
        .eq('discord_id', discordId);

      console.log(`[stripe-webhook] renewed ${discordId}, expires ${proExpiresAt}`);
    }

    // ── Subscription cancelled or payment failed ──────────────────────────────
    if (
      event.type === 'customer.subscription.deleted' ||
      event.type === 'invoice.payment_failed'
    ) {
      const obj        = event.data.object as Stripe.Subscription | Stripe.Invoice;
      const customerId = (obj as any).customer as string;
      const customer   = await stripe.customers.retrieve(customerId) as Stripe.Customer;
      const discordId  = customer.metadata?.discord_id;
      if (!discordId) return new Response('ok', { status: 200 });

      await supabase.from('profiles')
        .update({ role: 'free', pro_expires_at: null })
        .eq('discord_id', discordId);

      console.log(`[stripe-webhook] downgraded ${discordId} to free (${event.type})`);
    }

    return new Response('ok', { status: 200 });

  } catch (e) {
    console.error('[stripe-webhook] error:', e);
    return new Response('Webhook error', { status: 400 });
  }
});
