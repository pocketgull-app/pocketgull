import express, { Router } from 'express';
import Stripe from 'stripe';
import { rateLimit } from 'express-rate-limit';
import { Firestore } from '@google-cloud/firestore';
import { resolveTierFromPriceId } from '../services/tier-config';
import { gaapAccountingService } from '../services/gaap-accounting.service';

const db = new Firestore();

// Make sure to set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in your .env
const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || 'sk_test_placeholder', {
  apiVersion: '2024-06-20' as any, // Use the latest stable version or match existing
});

export function createBillingRouter() {
  const router = Router();

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { error: 'Too many billing requests.' }
  });

  router.post('/checkout', limiter, express.json(), async (req, res) => {
    try {
      const { priceId, successUrl, cancelUrl, customerEmail, endowmentFund, revenueSplit } = req.body || {};

      if (!priceId) {
        return res.status(400).json({ error: 'A priceId is required.' });
      }

      const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;

      // Create a Stripe Checkout Session with dynamic payment methods and philanthropic revenue metadata
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl || `${origin}/?billing=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${origin}/?billing=canceled`,
        customer_email: customerEmail,
        metadata: {
          endowment_fund: endowmentFund || 'Alumni Health & Research Endowment',
          revenue_split: revenueSplit || '50-30-20',
          philanthropic_pledge: 'true',
          founder_dispensation: 'true'
        }
      });

      res.json({ url: session.url });
    } catch (err: any) {
      console.error('[Billing] Error creating checkout session:', err.message);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  });

  router.post('/portal', limiter, express.json(), async (req, res) => {
    try {
      const { customerEmail } = req.body || {};
      if (!customerEmail) {
        return res.status(400).json({ error: 'A customerEmail is required.' });
      }

      // Fetch the stripeCustomerId from Firestore
      const tenantDoc = await db.collection('tenants').doc(customerEmail).get();
      if (!tenantDoc.exists) {
        return res.status(404).json({ error: 'Tenant not found.' });
      }

      const stripeCustomerId = tenantDoc.data()?.['stripeCustomerId'];
      if (!stripeCustomerId) {
        return res.status(404).json({ error: 'No active Stripe subscription found for this tenant.' });
      }

      const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;

      // Create a Customer Portal Session
      const portalSession = await stripe.billingPortal.sessions.create({
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
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
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
            const subscription = await stripe.subscriptions.retrieve(checkoutSession.subscription as string);
            const priceId = subscription.items?.data?.[0]?.price?.id || '';
            resolvedTier = resolveTierFromPriceId(priceId);
          } catch (subErr: any) {
            console.error('[Billing] Error retrieving subscription for tier resolution:', subErr.message);
          }
        }

        // Update user/tenant document in Firestore to unlock quota/seats
        if (checkoutSession.customer_email) {
          await db.collection('tenants').doc(checkoutSession.customer_email).set({
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
          await db.collection('tenants').doc(failedInvoice.customer_email).set({
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
        const snapshot = await db.collection('tenants').where('stripeCustomerId', '==', deletedSub.customer).get();
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

        const updateSnapshot = await db.collection('tenants').where('stripeCustomerId', '==', updatedSub.customer).get();
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
