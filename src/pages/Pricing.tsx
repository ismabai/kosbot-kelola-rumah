import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft } from 'lucide-react';
import { createCheckoutSession, PLANS, PlanType } from '@/services/billing';
import { useAuth } from '@/contexts/AuthContext';

const Pricing = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<PlanType | null>(null);

  const handleSubscribe = async (plan: PlanType) => {
    if (!user) {
      window.location.href = '/';
      return;
    }

    if (plan === 'enterprise') {
      window.location.href = 'mailto:contact@kosbot.com';
      return;
    }

    setLoading(plan);
    try {
      const url = await createCheckoutSession(plan);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choisissez votre plan</h1>
          <p className="text-xl text-muted-foreground">
            Sélectionnez l'offre qui correspond à vos besoins
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {(Object.keys(PLANS) as PlanType[]).map((planKey) => {
            const plan = PLANS[planKey];
            const isPopular = planKey === 'pro';

            return (
              <Card key={planKey} className={isPopular ? 'border-primary shadow-lg' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle>{plan.name}</CardTitle>
                    {isPopular && <Badge>Populaire</Badge>}
                  </div>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">
                      {planKey === 'enterprise' 
                        ? 'Sur devis' 
                        : `${(plan.price / 1000).toFixed(0)}K IDR`}
                    </span>
                    {planKey !== 'enterprise' && <span className="text-muted-foreground">/mois</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isPopular ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(planKey)}
                    disabled={loading === planKey}
                  >
                    {loading === planKey 
                      ? 'Chargement...' 
                      : planKey === 'enterprise' 
                        ? 'Nous contacter' 
                        : 'S\'abonner'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
