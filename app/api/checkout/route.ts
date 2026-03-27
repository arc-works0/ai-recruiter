import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

type CheckoutBody = {
  priceId?: string;
  successUrl?: string;
  cancelUrl?: string;
  customerEmail?: string;
};

export async function POST(req: NextRequest) {
  if (!stripeSecretKey) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const sessionAuth = await auth();
  const clerkUserId = sessionAuth.userId;
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CheckoutBody = {};
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    /* keep defaults */
  }

  const priceId = typeof body.priceId === "string" ? body.priceId.trim() : "";
  const origin = req.nextUrl.origin;
  const successUrl =
    typeof body.successUrl === "string" && body.successUrl.trim()
      ? body.successUrl.trim()
      : `${origin}/?checkout=success`;
  const cancelUrl =
    typeof body.cancelUrl === "string" && body.cancelUrl.trim()
      ? body.cancelUrl.trim()
      : `${origin}/?checkout=cancel`;

  if (!priceId) {
    return NextResponse.json({ error: "priceId is required" }, { status: 400 });
  }

  const stripe = new Stripe(stripeSecretKey);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: clerkUserId,
      customer_email: typeof body.customerEmail === "string" ? body.customerEmail : undefined,
      metadata: {
        clerkUserId,
      },
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
