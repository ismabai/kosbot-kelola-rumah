import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check, Zap, BarChart, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Plan {
  name: string;
  price: string;
  priceId: string;
  productId: string;
  description: string;
  features: string[];
  popular?: boolean;
}

const PLANS: Record<string, Plan> = {
  basic: {
    name: 'Basic',
    price: '100K',
    priceId: 'price_1SMdPGIlYUVEqT7DypsCPs1V',
    productId: 'prod_TJFvhblrHkaiTO',
    description: '1 kos / jusqu\'à 10 chambres',
    features: [
      'Gestion de 1 propriété',
      'Jusqu\'à 10 chambres',
      'Tableau de bord basique',
      'Rappels automatiques',
      'Support par email',
    ],
  },
  pro: {
    name: 'Pro',
    price: '250K',
    priceId: 'price_1SMdPSIlYUVEqT7D5LmxNU2L',
    productId: 'prod_TJFvmpbjHYBN7y',
    description: 'Jusqu\'à 5 kos / 100 chambres',
    features: [
      'Gestion de 5 propriétés',
      'Jusqu\'à 100 chambres',
      'Tableau de bord avancé',
      'Automatisation complète',
      'Analyses et rapports',
      'Support prioritaire',
    ],
    popular: true,
  },
  enterprise: {
    name: 'Enterprise',
    price: 'Sur devis',
    priceId: 'price_1SMdPnIlYUVEqT7DpZ9ATIZF',
    productId: 'prod_TJFv6gUhEWoxyh',
    description: 'Illimité + support IA avancé',
    features: [
      'Propriétés illimitées',
      'Chambres illimitées',
      'Support IA avancé',
      'API personnalisée',
      'Formation dédiée',
      'Support 24/7',
    ],
  },
};

export default function Landing() {
  const { user, signInWithGoogle, subscription } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!user) {
      toast({
        title: 'Authentification requise',
        description: 'Veuillez vous connecter avec Google pour continuer',
      });
      await signInWithGoogle();
      return;
    }

    if (planName === 'Enterprise') {
      window.location.href = 'mailto:contact@kosbot.id?subject=Demande Enterprise';
      return;
    }

    setLoadingPlan(planName);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  if (user && subscription?.subscribed) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Banner */}
      <div className="bg-gradient-primary text-white py-2 px-4 text-center text-sm font-medium animate-in">
        ✨ Essai gratuit 7 jours — sans carte bancaire
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg" />
            <span className="text-xl font-bold">KosBot</span>
          </div>
          <Button onClick={signInWithGoogle} variant="outline">
            Se connecter avec Google
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center animate-in">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
          Gérez vos kos-kosan
          <br />
          en toute simplicité
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Automatisez vos paiements, suivez vos locataires et maximisez votre taux d'occupation. 
          Pendant que KosBot travaille pour vous.
        </p>
        <Button size="lg" onClick={signInWithGoogle} className="animate-scale-in">
          Essayer gratuitement
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="card-hover">
            <CardHeader>
              <Zap className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Automatisation complète</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Rappels de paiement automatiques, génération de factures et notifications WhatsApp.
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <BarChart className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Suivi en temps réel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tableau de bord intelligent avec taux d'occupation, revenus et statistiques détaillées.
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Données sécurisées</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Vos données et celles de vos locataires sont cryptées et stockées en toute sécurité.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Choisissez votre plan</h2>
          <p className="text-muted-foreground">Commencez gratuitement, évoluez selon vos besoins</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.entries(PLANS).map(([key, plan]) => (
            <Card 
              key={key} 
              className={`relative card-hover ${plan.popular ? 'border-primary border-2' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Plus populaire
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== 'Sur devis' && <span className="text-muted-foreground"> IDR/mois</span>}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan.priceId, plan.name)}
                  disabled={loadingPlan === plan.name}
                >
                  {loadingPlan === plan.name ? 'Chargement...' : 'S\'abonner'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Questions fréquentes</h2>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="trial">
              <AccordionTrigger>Comment fonctionne l'essai gratuit ?</AccordionTrigger>
              <AccordionContent>
                Vous bénéficiez de 7 jours d'essai gratuit sans avoir à fournir de carte bancaire. 
                À la fin de la période d'essai, vous pouvez choisir le plan qui vous convient.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="security">
              <AccordionTrigger>Mes données sont-elles sécurisées ?</AccordionTrigger>
              <AccordionContent>
                Oui, toutes vos données sont cryptées et stockées sur des serveurs sécurisés. 
                Nous ne partageons jamais vos informations avec des tiers.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="payment">
              <AccordionTrigger>Quels modes de paiement acceptez-vous ?</AccordionTrigger>
              <AccordionContent>
                Nous acceptons tous les moyens de paiement via Stripe : cartes bancaires, 
                virements bancaires et portefeuilles électroniques locaux.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cancel">
              <AccordionTrigger>Puis-je annuler mon abonnement ?</AccordionTrigger>
              <AccordionContent>
                Oui, vous pouvez annuler votre abonnement à tout moment. 
                Aucun frais d'annulation ne sera appliqué et vous conserverez l'accès jusqu'à la fin de votre période payée.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="support">
              <AccordionTrigger>Quel type de support proposez-vous ?</AccordionTrigger>
              <AccordionContent>
                Le plan Basic inclut un support par email. Le plan Pro offre un support prioritaire. 
                Le plan Enterprise bénéficie d'un support dédié 24/7.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-primary rounded-lg" />
              <span className="font-semibold">KosBot</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="mailto:contact@kosbot.id" className="hover:text-foreground transition-colors">
                Contact
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Mentions légales
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Confidentialité
              </a>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground mt-4">
            © 2025 KosBot. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
