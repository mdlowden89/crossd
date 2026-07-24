import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import Stripe from 'npm:stripe@14.21.0';

const PRICE_IDS = {
  monthly:   Deno.env.get("STRIPE_PRICE_MONTHLY"),
  quarterly: Deno.env.get("STRIPE_PRICE_QUARTERLY"),
  yearly:    Deno.env.get("STRIPE_PRICE_YEARLY"),
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { plan, successUrl, cancelUrl } = await req.json();

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      console.error('Unknown plan or missing price env var:', plan);
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), { apiVersion: '2023-10-16' });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_id: user.id,
        plan,
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});