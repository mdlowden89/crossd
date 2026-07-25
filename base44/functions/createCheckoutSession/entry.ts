import Stripe from 'npm:stripe@14.21.0';

const PRICE_IDS: Record<string, string | undefined> = {
  monthly:   Deno.env.get("STRIPE_PRICE_MONTHLY"),
  quarterly: Deno.env.get("STRIPE_PRICE_QUARTERLY"),
  yearly:    Deno.env.get("STRIPE_PRICE_YEARLY"),
};

Deno.serve(async (req) => {
  try {
    const { plan, successUrl, cancelUrl, customerEmail } = await req.json();

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      console.error('Unknown plan or missing price env var:', plan);
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? '', { apiVersion: '2023-10-16' });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID") ?? '',
        plan,
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});