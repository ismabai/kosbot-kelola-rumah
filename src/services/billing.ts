import { supabase } from "@/integrations/supabase/client";

export type PlanType = 'basic' | 'pro' | 'enterprise';

export const PLANS = {
  basic: {
    name: 'Basic',
    price: 100000, // IDR
    priceId: 'price_1QkfxSCOwTXPMR8IDR7SBEUr',
    productId: 'prod_RnxdOFWDqP6gQ9',
    features: ['1 kos', '10 chambres', 'Gestion de base'],
  },
  pro: {
    name: 'Pro',
    price: 250000, // IDR
    priceId: 'price_1QkfxyCOwTXPMR8IQhtY3O50',
    productId: 'prod_RnxdiCHgz3RuUZ',
    features: ['5 kos', '100 chambres', 'Fonctionnalités avancées', 'Support prioritaire'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 500000, // IDR (symbolic)
    priceId: 'price_1QkfyLCOwTXPMR8ILTT1AcZy',
    productId: 'prod_RnxdLHVIc44KSl',
    features: ['Kos illimités', 'Chambres illimitées', 'Support 24/7', 'API access'],
  },
};

export const createCheckoutSession = async (plan: PlanType): Promise<string> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('User not authenticated');
  }

  const priceId = PLANS[plan].priceId;

  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { priceId },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error('No checkout URL returned');

  return data.url;
};

export const openCustomerPortal = async (): Promise<string> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase.functions.invoke('customer-portal', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error('No portal URL returned');

  return data.url;
};
