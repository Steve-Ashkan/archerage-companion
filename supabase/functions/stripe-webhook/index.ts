// Stripe webhook handler.
// Listens for subscription events and updates the user's role in Supabase.
//
// Events handled:
//   checkout.session.completed       → set role='pro', store stripe_customer_id
//   invoice.payment_succeeded        → update pro_expires_at
//   customer.subscription.deleted   → downgrade to free (pro only — elevated roles preserved)
//   invoice.payment_failed           → downgrade to free (pro only — elevated roles preserved)

import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ELEVATED_ROLES = new Set(['curator', 'staff', 'admin', 'dev']);

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('No signature', { status: 400 });

  const body = await req.text();

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-06-20',
    });

    const event = await stripe.webhooks.constructEventAsync(
      body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
    );

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // ── Subscription started ──────────────────────────────────────────────────
    if (event.type === 'checkout.session.completed') {
      const session   = event.data.object as Stripe.Checkout.Session;
      const discordId = session.client_reference_id;
      if (!discordId) {
        console.error('[stripe-webhook] checkout.session.completed missing client_reference_id');
        return new Response('ok', { status: 200 });
      }

      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      const proExpiresAt = new Date(sub.current_period_end * 1000).toISOString();

      await stripe.customers.update(session.customer as string, {
        metadata: { discord_id: discordId },
      });

      await supabase.from('profiles')
        .update({ role: 'pro', pro_expires_at: proExpiresAt, stripe_customer_id: session.customer as string })
        .eq('discord_id', discordId);

      console.log(`[stripe-webhook] upgraded ${discordId} to pro, expires ${proExpiresAt}`);
    }

    // ── Subscription renewed ──────────────────────────────────────────────────
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

      // L-2: Never downgrade elevated roles — only demote 'pro' back to 'free'
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('discord_id', discordId).single();

      if (profile && ELEVATED_ROLES.has(profile.role)) {
        // Just clear the Stripe expiry date — keep the elevated role intact
        await supabase.from('profiles')
          .update({ pro_expires_at: null })
          .eq('discord_id', discordId);
        console.log(`[stripe-webhook] kept elevated role '${profile.role}' for ${discordId}, cleared pro_expires_at`);
      } else {
        await supabase.from('profiles')
          .update({ role: 'free', pro_expires_at: null })
          .eq('discord_id', discordId);
        console.log(`[stripe-webhook] downgraded ${discordId} to free (${event.type})`);
      }
    }

    return new Response('ok', { status: 200 });

  } catch (e) {
    console.error('[stripe-webhook] error:', e);
    return new Response('Webhook error', { status: 400 });
  }
});
