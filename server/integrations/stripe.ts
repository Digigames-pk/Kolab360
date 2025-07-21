import Stripe from 'stripe';
import { Router } from 'express';

const router = Router();

// Stripe Integration Service
class StripeIntegration {
  private stripe: Stripe | null = null;

  constructor() {
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });
    }
  }

  async createPaymentIntent(amount: number, currency = 'usd') {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
    });

    return paymentIntent;
  }

  async createCustomer(email: string, name?: string) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const customer = await this.stripe.customers.create({
      email,
      name,
    });

    return customer;
  }

  async getCustomers(limit = 10) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const customers = await this.stripe.customers.list({ limit });
    return customers;
  }

  async getPayments(limit = 10) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const payments = await this.stripe.paymentIntents.list({ limit });
    return payments;
  }

  async createSubscription(customerId: string, priceId: string) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    return subscription;
  }

  isConfigured() {
    return this.stripe !== null;
  }
}

const stripeService = new StripeIntegration();

// Routes
router.get('/status', (req, res) => {
  res.json({ 
    connected: stripeService.isConfigured()
  });
});

router.post('/payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const paymentIntent = await stripeService.createPaymentIntent(amount, currency);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/customers', async (req, res) => {
  try {
    const { email, name } = req.body;
    const customer = await stripeService.createCustomer(email, name);
    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/customers', async (req, res) => {
  try {
    const { limit } = req.query;
    const customers = await stripeService.getCustomers(Number(limit) || 10);
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/payments', async (req, res) => {
  try {
    const { limit } = req.query;
    const payments = await stripeService.getPayments(Number(limit) || 10);
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/subscriptions', async (req, res) => {
  try {
    const { customerId, priceId } = req.body;
    const subscription = await stripeService.createSubscription(customerId, priceId);
    res.json(subscription);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { stripeService };
export default router;