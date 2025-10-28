import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No stripe signature");

    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    let event: Stripe.Event;
    
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook verified", { type: event.type });
    } else {
      event = JSON.parse(body);
      logStep("Webhook not verified (no secret)", { type: event.type });
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", { sessionId: session.id });

        const customerId = session.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        
        if (customer.deleted) {
          throw new Error("Customer was deleted");
        }

        const email = customer.email;
        if (!email) throw new Error("No customer email");

        // Get the subscription to determine plan
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const productId = subscription.items.data[0].price.product as string;

        // Map product ID to plan name
        let plan = 'basic';
        if (productId === 'prod_RnxdOFWDqP6gQ9') plan = 'basic';
        else if (productId === 'prod_RnxdiCHgz3RuUZ') plan = 'pro';
        else if (productId === 'prod_RnxdLHVIc44KSl') plan = 'enterprise';

        logStep("Updating profile", { email, plan, customerId });

        // Update profile with subscription info
        const { error } = await supabaseClient
          .from('profiles')
          .update({
            plan,
            status: 'active',
            stripe_customer_id: customerId,
            trial_end_at: null
          })
          .eq('email', email);

        if (error) throw error;
        logStep("Profile updated successfully");
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        logStep("Payment failed", { customerId });

        const { error } = await supabaseClient
          .from('profiles')
          .update({ status: 'past_due' })
          .eq('stripe_customer_id', customerId);

        if (error) throw error;
        logStep("Status updated to past_due");
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        logStep("Subscription deleted", { customerId });

        const { error } = await supabaseClient
          .from('profiles')
          .update({ status: 'canceled', plan: 'basic' })
          .eq('stripe_customer_id', customerId);

        if (error) throw error;
        logStep("Status updated to canceled");
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;
        
        logStep("Subscription updated", { customerId, status });

        let dbStatus = 'active';
        if (status === 'past_due') dbStatus = 'past_due';
        else if (status === 'canceled') dbStatus = 'canceled';
        else if (status === 'unpaid') dbStatus = 'past_due';

        const { error } = await supabaseClient
          .from('profiles')
          .update({ status: dbStatus })
          .eq('stripe_customer_id', customerId);

        if (error) throw error;
        logStep("Subscription status synced");
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
