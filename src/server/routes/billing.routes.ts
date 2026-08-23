import express, { Router } from 'express';
import Stripe from 'stripe';
import { rateLimit } from 'express-rate-limit';
import { Firestore } from '@google-cloud/firestore';
import { resolveTierFromPriceId } from '../services/tier-config';
import { gaapAccountingService } from '../services/gaap-accounting.service';

let _db: Firestore | null = null;
function getDb(): Firestore {
  if (!_db) {
    _db = new Firestore();
  }
  return _db;
}

function getStripe(): Stripe {
  return new Stripe(process.env['STRIPE_SECRET_KEY'] || 'sk_test_placeholder', {
    apiVersion: '2024-06-20' as any,
  });
}

export function createBillingRouter() {
  const router = Router();

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { error: 'Too many billing requests.' }
  });

  const handleCheckoutRequest = async (req: express.Request, res: express.Response) => {
    try {
      const isGet = req.method === 'GET';
      const params = isGet ? req.query : req.body;
      const { priceId, tier, successUrl, cancelUrl, customerEmail, endowmentFund, revenueSplit } = params || {};
      const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;

      let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      let mode: Stripe.Checkout.SessionCreateParams.Mode = 'subscription';

      if (priceId) {
        lineItems = [{ price: String(priceId), quantity: 1 }];
      } else if (tier === 'founder_lifetime' || tier === 'founder' || tier === 'lifetime') {
        mode = 'payment';
        lineItems = [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'PocketGull Lifetime Solo Founder License',
              description: '100% on-device offline AI scribing forever, standard SOAP templates, EHR export, and lifetime software updates (Zero recurring monthly fees).',
            },
            unit_amount: 29900, // $299.00
          },
          quantity: 1,
        }];
      } else if (tier === 'clinic_annual' || tier === 'annual') {
        mode = 'subscription';
        lineItems = [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'PocketGull Clinic Pro (Annual Pass - 2 Months Free)',
              description: 'Ambient AI voice scribing, custom specialty note templates, medication & herb-drug safety screening, priority clinician support & onboarding.',
            },
            unit_amount: 49000, // $490.00 / yr
            recurring: { interval: 'year' },
          },
          quantity: 1,
        }];
      } else if (tier === 'clinic_onboarding' || tier === 'onboarding') {
        mode = 'payment';
        lineItems = [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'PocketGull Clinic Turnkey Onboarding & Custom EHR Integration',
              description: 'Up to 5 clinician licenses, white-glove EHR template customization, 1-on-1 workflow integration, dedicated HIPAA BAA.',
            },
            unit_amount: 125000, // $1,250.00
          },
          quantity: 1,
        }];
      } else if (tier === 'clinic_pro_monthly' || tier === 'practitioner' || tier === 'monthly') {
        mode = 'subscription';
        lineItems = [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'PocketGull Clinic Pro (Monthly)',
              description: 'Ambient AI voice scribing, custom specialty templates, medication & herb-drug safety checker, priority support.',
            },
            unit_amount: 4900, // $49.00 / mo
            recurring: { interval: 'month' },
          },
          quantity: 1,
        }];
      } else if (tier === 'pilot') {
        mode = 'subscription';
        lineItems = [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'PocketGull Independent Clinic Pilot License',
              description: 'Ambient Clinical Scribe + SOAP notes, RxGuard PGx & herb-drug screening, Socratic patient intake triage (Up to 3 clinicians)',
            },
            unit_amount: 29900, // $299.00
            recurring: { interval: 'month' },
          },
          quantity: 1,
        }];
      } else if (tier === 'sprint') {
        mode = 'payment';
        lineItems = [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'PocketGull Clinical AI Implementation & FHIR Sprint',
              description: 'Turnkey 2-week implementation: HIPAA §164.514 Safe Harbor setup, Custom LoRA model fine-tuning, FHIR R4 / GA4GH Phenopackets pipeline integration',
            },
            unit_amount: 350000, // $3,500.00
          },
          quantity: 1,
        }];
      } else if (tier === 'academic') {
        mode = 'subscription';
        lineItems = [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'PocketGull Academic Lab & Residency Hub License',
              description: 'GA4GH Phenopackets v2 rare disease pipelines, 11-paradigm open science datasets, unlimited OSCE simulation training seats',
            },
            unit_amount: 120000, // $1,200.00 / yr
            recurring: { interval: 'year' },
          },
          quantity: 1,
        }];
      } else if (tier === 'enterprise') {
        mode = 'subscription';
        lineItems = [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'PocketGull Health System Enterprise Tier',
              description: 'Unlimited clinician seats, Google SAIF Level 3 defense, dedicated Vertex AI endpoint deployment, priority SLA',
            },
            unit_amount: 99900, // $999.00 / mo
            recurring: { interval: 'month' },
          },
          quantity: 1,
        }];
      } else {
        return res.status(400).json({ error: 'A valid priceId or tier (founder_lifetime, clinic_annual, clinic_onboarding, clinic_pro_monthly, academic, enterprise) is required.' });
      }

      // Check if Stripe key is configured or in simulated mode
      const stripeKey = process.env['STRIPE_SECRET_KEY'];
      if (!stripeKey || stripeKey === 'sk_test_placeholder') {
        const fallbackUrl = `https://pocketgull.app/?checkout_tier=${encodeURIComponent(String(tier || 'pro'))}&status=simulated_checkout`;
        if (isGet) {
          return res.redirect(303, fallbackUrl);
        }
        return res.json({ url: fallbackUrl, sessionId: 'cs_simulated_' + Date.now() });
      }

      // Create a live Stripe Checkout Session
      const session = await getStripe().checkout.sessions.create({
        line_items: lineItems,
        mode: mode,
        success_url: String(successUrl || `${origin}/?billing=success&session_id={CHECKOUT_SESSION_ID}`),
        cancel_url: String(cancelUrl || `${origin}/?billing=canceled`),
        customer_email: customerEmail ? String(customerEmail) : undefined,
        metadata: {
          tier: String(tier || 'custom'),
          endowment_fund: String(endowmentFund || 'Alumni Health & Research Endowment'),
          revenue_split: String(revenueSplit || '50-30-20'),
          founder_dispensation: 'true'
        }
      });

      if (isGet) {
        return res.redirect(303, session.url!);
      }
      res.json({ url: session.url, sessionId: session.id });
    } catch (err: any) {
      console.error('[Billing] Error creating checkout session:', err.message);
      res.status(500).json({ error: 'Failed to create checkout session', detail: err.message });
    }
  };

  router.post('/checkout', limiter, express.json(), handleCheckoutRequest);
  router.get('/checkout', limiter, handleCheckoutRequest);

  router.post('/portal', limiter, express.json(), async (req, res) => {
    try {
      const { customerEmail } = req.body || {};
      if (!customerEmail) {
        return res.status(400).json({ error: 'A customerEmail is required.' });
      }

      // Fetch the stripeCustomerId from Firestore
      const tenantDoc = await getDb().collection('tenants').doc(customerEmail).get();
      if (!tenantDoc.exists) {
        return res.status(404).json({ error: 'Tenant not found.' });
      }

      const stripeCustomerId = tenantDoc.data()?.['stripeCustomerId'];
      if (!stripeCustomerId) {
        return res.status(404).json({ error: 'No active Stripe subscription found for this tenant.' });
      }

      const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;

      // Create a Customer Portal Session
      const portalSession = await getStripe().billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${origin}/`,
      });

      res.json({ url: portalSession.url });
    } catch (err: any) {
      console.error('[Billing] Error creating portal session:', err.message);
      res.status(500).json({ error: 'Failed to create portal session' });
    }
  });

  // Webhook endpoint to receive events from Stripe
  // MUST use express.raw({ type: 'application/json' }) before body-parser in main server.ts
  router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env['STRIPE_WEBHOOK_SECRET'];

    let event;

    try {
      if (!endpointSecret) throw new Error('No webhook secret configured.');
      if (!sig) throw new Error('No signature provided.');
      // req.body must be the raw buffer here
      event = getStripe().webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error('[Billing] Webhook signature verification failed');
      return res.status(400).json({ error: 'Webhook Error', message: 'Webhook signature verification failed.' });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSession = event.data.object as any;
        console.log(`[Billing] Checkout session completed for ${checkoutSession.customer_email}`);
        
        // Resolve subscription tier from the line item priceId
        let resolvedTier = 'explorer';
        if (checkoutSession.subscription) {
          try {
            const subscription = await getStripe().subscriptions.retrieve(checkoutSession.subscription as string);
            const priceId = subscription.items?.data?.[0]?.price?.id || '';
            resolvedTier = resolveTierFromPriceId(priceId);
          } catch (subErr: any) {
            console.error('[Billing] Error retrieving subscription for tier resolution:', subErr.message);
          }
        }

        // Update user/tenant document in Firestore to unlock quota/seats
        if (checkoutSession.customer_email) {
          await getDb().collection('tenants').doc(checkoutSession.customer_email).set({
            subscriptionStatus: 'active',
            subscriptionTier: resolvedTier,
            stripeCustomerId: checkoutSession.customer,
            updatedAt: new Date()
          }, { merge: true });

          // Record GAAP ASC 606 Journal Entry and Revenue Schedule
          const grossAmount = (checkoutSession.amount_total || 4900) / 100;
          const stripeFee = Math.round((grossAmount * 0.029 + 0.30) * 100) / 100;
          const now = new Date();
          const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

          await gaapAccountingService.recordSubscriptionPayment({
            tenantId: checkoutSession.customer_email,
            referenceId: checkoutSession.id,
            amountGrossUsd: grossAmount,
            stripeFeeUsd: stripeFee,
            periodStart: now,
            periodEnd,
            tierName: resolvedTier,
            endowmentFund: checkoutSession.metadata?.endowment_fund,
            revenueSplit: checkoutSession.metadata?.revenue_split
          }).catch(e => console.error('[Billing] Error recording GAAP journal entry:', e.message));
        }
        break;
      case 'invoice.paid':
        const invoice = event.data.object as any;
        console.log(`[Billing] Invoice paid for ${invoice.customer_email}`);
        if (invoice.customer_email) {
          const grossAmount = (invoice.amount_paid || 4900) / 100;
          const stripeFee = Math.round((grossAmount * 0.029 + 0.30) * 100) / 100;
          const now = new Date(invoice.period_start ? invoice.period_start * 1000 : Date.now());
          const periodEnd = new Date(invoice.period_end ? invoice.period_end * 1000 : Date.now() + 30 * 24 * 60 * 60 * 1000);

          await gaapAccountingService.recordSubscriptionPayment({
            tenantId: invoice.customer_email,
            referenceId: invoice.id,
            amountGrossUsd: grossAmount,
            stripeFeeUsd: stripeFee,
            periodStart: now,
            periodEnd,
            tierName: 'subscription',
          }).catch(e => console.error('[Billing] Error recording GAAP invoice payment:', e.message));
        }
        break;
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as any;
        console.log(`[Billing] Payment failed for ${failedInvoice.customer_email}`);
        
        // Update user/tenant document to pause quota/seats
        if (failedInvoice.customer_email) {
          await getDb().collection('tenants').doc(failedInvoice.customer_email).set({
            subscriptionStatus: 'past_due',
            updatedAt: new Date()
          }, { merge: true });
        }
        break;
      case 'customer.subscription.deleted':
        const deletedSub = event.data.object as any;
        // Lookup customer email from Stripe if necessary, or use a known map
        // (Assuming we query by stripeCustomerId if we don't have the email in the event object)
        console.log(`[Billing] Subscription canceled for customer ${deletedSub.customer}`);
        
        // Find tenant by stripeCustomerId
        const snapshot = await getDb().collection('tenants').where('stripeCustomerId', '==', deletedSub.customer).get();
        if (!snapshot.empty) {
          const docRef = snapshot.docs[0].ref;
          await docRef.set({
            subscriptionStatus: 'canceled',
            subscriptionTier: 'explorer',  // Downgrade to free tier
            updatedAt: new Date()
          }, { merge: true });
        }
        break;
      case 'customer.subscription.updated':
        // Tier change (upgrade/downgrade)
        const updatedSub = event.data.object as any;
        const updatedPriceId = updatedSub.items?.data?.[0]?.price?.id || '';
        const newTier = resolveTierFromPriceId(updatedPriceId);
        console.log(`[Billing] Subscription updated for customer ${updatedSub.customer} → tier: ${newTier}`);

        const updateSnapshot = await getDb().collection('tenants').where('stripeCustomerId', '==', updatedSub.customer).get();
        if (!updateSnapshot.empty) {
          const updateDocRef = updateSnapshot.docs[0].ref;
          await updateDocRef.set({
            subscriptionStatus: updatedSub.status === 'active' ? 'active' : updatedSub.status,
            subscriptionTier: newTier,
            updatedAt: new Date()
          }, { merge: true });
        }
        break;
      default:
        console.log(`[Billing] Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  });

  /**
   * GET /api/billing/gaap-ledger — Returns ASC 606 compliant GAAP financial statements
   * (Balance Sheet, Income Statement, Double-Entry Journal Audit Trail).
   */
  router.get('/gaap-ledger', limiter, async (_req, res) => {
    try {
      const report = await gaapAccountingService.generateFinancialReport();
      res.json(report);
    } catch (err: any) {
      console.error('[Billing] Error generating GAAP ledger report:', err.message);
      res.status(500).json({ error: 'Failed to generate GAAP financial statement' });
    }
  });

  return router;
}
