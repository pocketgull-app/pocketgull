import fs from 'node:fs';
import Stripe from 'stripe';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/["']/g, '');
  }
}

async function check() {
  console.log('=== STRIPE ACCOUNT AUDIT ===');
  console.log('Account ID:', env.STRIPE_ACCOUNT_ID || 'Not specified');

  // Check Test Mode
  if (env.STRIPE_SECRET_KEY) {
    try {
      const stripeTest = new Stripe(env.STRIPE_SECRET_KEY);
      const bal = await stripeTest.balance.retrieve();
      console.log('\n[TEST MODE BALANCE]:');
      console.log('Available:', bal.available.map(b => (b.amount / 100) + ' ' + b.currency.toUpperCase()).join(', ') || '0.00 USD');
      console.log('Pending:', bal.pending.map(b => (b.amount / 100) + ' ' + b.currency.toUpperCase()).join(', ') || '0.00 USD');
    } catch (e) {
      console.log('[TEST MODE ERROR]:', e.message);
    }
  }

  // Check Live Mode
  if (env.STRIPE_SECRET_KEY_LIVE) {
    try {
      const stripeLive = new Stripe(env.STRIPE_SECRET_KEY_LIVE);
      const bal = await stripeLive.balance.retrieve();
      console.log('\n[LIVE PRODUCTION BALANCE]:');
      console.log('Available:', bal.available.map(b => (b.amount / 100) + ' ' + b.currency.toUpperCase()).join(', ') || '0.00 USD');
      console.log('Pending:', bal.pending.map(b => (b.amount / 100) + ' ' + b.currency.toUpperCase()).join(', ') || '0.00 USD');

      const charges = await stripeLive.charges.list({ limit: 5 });
      console.log('Recent Live Charges:', charges.data.length);
      const customers = await stripeLive.customers.list({ limit: 5 });
      console.log('Registered Live Customers:', customers.data.length);
    } catch (e) {
      console.log('[LIVE MODE ERROR]:', e.message);
    }
  }
}

check();
