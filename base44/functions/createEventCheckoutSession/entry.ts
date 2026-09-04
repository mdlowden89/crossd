import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import Stripe from 'npm:stripe@14.21.0';

export default async function(req: Request): Promise<Response> {
  try {
    const { eventId, userId, ticketCount, successUrl, cancelUrl, customerEmail } = await req.json();

    if (!eventId) {
      return Response.json({ error: 'Missing eventId' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    // Events are public listings — read with service role so unauthenticated browsers can buy.
    const event = await base44.asServiceRole.entities.Event.get(eventId);
    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }
    if (event.price_cents <= 0) {
      return Response.json({ error: 'This event is free — no checkout required' }, { status: 400 });
    }

    const qty = Math.max(1, Math.min(4, Number(ticketCount) || 1));
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2023-10-16' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: event.currency || 'gbp',
          product_data: { name: event.title },
          unit_amount: event.price_cents,
        },
        quantity: qty,
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID') ?? '',
        event_id: eventId,
        user_id: userId ?? '',
      },
    });

    return Response.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Event checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}