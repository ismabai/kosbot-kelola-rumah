# KosBot - Property Management System

A modern property management system for boarding houses (kos) built with React, TypeScript, Supabase, and Stripe.

## Features

- 🏢 **Property Management** - Manage multiple properties and rooms
- 👥 **Tenant Management** - Track tenants and their rental information
- 💰 **Payments & Invoices** - Generate invoices and track payments with Stripe integration
- 🎫 **Maintenance Tickets** - Handle maintenance requests
- 📊 **Dashboard** - Real-time analytics and insights
- 🔐 **Authentication** - Secure Google OAuth via Supabase
- 💳 **Subscription Plans** - Multiple pricing tiers with usage limits

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Recharts
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Payments**: Stripe (Checkout, Customer Portal, Webhooks)
- **Deployment**: Lovable Cloud

## Environment Variables

The following variables are automatically configured by Lovable Cloud:

```env
# Supabase (auto-configured)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id

# Stripe (configure in Lovable Cloud secrets)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Stripe Setup

### 1. Create Products and Prices

In your Stripe Dashboard, create three products with the following Price IDs (already configured):

- **Basic Plan**: 100,000 IDR/month → `price_1QkfxSCOwTXPMR8IDR7SBEUr`
- **Pro Plan**: 250,000 IDR/month → `price_1QkfxyCOwTXPMR8IQhtY3O50`
- **Enterprise Plan**: Custom pricing → `price_1QkfyLCOwTXPMR8ILTT1AcZy`

### 2. Configure Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://wkjmvyenixntlhcsjpzy.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
4. Copy the webhook signing secret and add it to Lovable Cloud secrets as `STRIPE_WEBHOOK_SECRET`

### 3. Set Up Customer Portal

1. Go to Stripe Dashboard → Settings → Billing → Customer Portal
2. Enable the portal
3. Configure allowed actions:
   - Update payment method
   - Cancel subscription
   - Switch plans (optional)

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Authorized JavaScript origins: Your app URL
   - Authorized redirect URIs: `https://wkjmvyenixntlhcsjpzy.supabase.co/auth/v1/callback`
5. Configure in Lovable Cloud Dashboard → Authentication → Google Settings

## Database Schema

The application uses the following main tables:

- `profiles` - User profiles and subscription info
- `properties` - Boarding house properties
- `rooms` - Individual rental rooms
- `tenants` - Tenant information
- `invoices` - Rental invoices
- `payments` - Payment records
- `tickets` - Maintenance tickets

All tables have Row Level Security (RLS) enabled to ensure data privacy.

## Subscription Plans

### Basic (100K IDR/month)
- 1 property
- 10 rooms
- Basic management features

### Pro (250K IDR/month)
- 5 properties
- 100 rooms
- Advanced features
- Priority support

### Enterprise (Custom)
- Unlimited properties
- Unlimited rooms
- 24/7 support
- API access

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment

This app is deployed on Lovable Cloud, which automatically handles:
- Backend infrastructure (Supabase)
- Edge Functions deployment
- Environment variables
- SSL certificates

Simply click Share → Publish in Lovable to deploy changes.

## Project URL

**Lovable Project**: https://lovable.dev/projects/657975d9-3ebb-4d3e-8440-76e4f10529d8

## Support

For issues or questions, contact: contact@kosbot.com
