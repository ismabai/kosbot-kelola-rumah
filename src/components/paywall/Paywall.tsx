import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createCheckoutSession, PLANS, PlanType } from '@/services/billing';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface PaywallProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  currentPlan: PlanType;
}

export const Paywall = ({ isOpen, onClose, message, currentPlan }: PaywallProps) => {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (plan: PlanType) => {
    setLoading(true);
    try {
      const url = await createCheckoutSession(plan);
      window.open(url, '_blank');
      onClose();
    } catch (error) {
      console.error('Error creating checkout:', error);
    } finally {
      setLoading(false);
    }
  };

  const suggestedPlan = currentPlan === 'basic' ? 'pro' : 'enterprise';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Limite atteinte</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{PLANS[suggestedPlan].name}</h3>
              <Badge variant="default">Recommandé</Badge>
            </div>
            <p className="text-2xl font-bold">
              {suggestedPlan === 'enterprise' 
                ? 'Sur devis' 
                : `${(PLANS[suggestedPlan].price / 1000).toFixed(0)}K IDR/mois`}
            </p>
            <ul className="space-y-2">
              {PLANS[suggestedPlan].features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Link to="/pricing">
            <Button variant="secondary">Voir tous les plans</Button>
          </Link>
          {suggestedPlan !== 'enterprise' ? (
            <Button onClick={() => handleUpgrade(suggestedPlan)} disabled={loading}>
              {loading ? 'Chargement...' : `S'abonner ${PLANS[suggestedPlan].name}`}
            </Button>
          ) : (
            <Button asChild>
              <a href="mailto:contact@kosbot.com">Nous contacter</a>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
