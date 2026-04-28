import Stripe from "stripe";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
}

// Pass this as the second arg to every Stripe API call.
// When using an Organization API key, Stripe requires a Stripe-Context header
// specifying which account in the org to use.
export function stripeOpts(): Stripe.RequestOptions {
  const accountId = process.env.STRIPE_ACCOUNT_ID;
  if (!accountId) return {};
  return { headers: { "Stripe-Context": accountId } };
}
