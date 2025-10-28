import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { openCustomerPortal } from '@/services/billing';

export const AuthGate = () => {
  const { user, loading, profile, refreshProfile } = useAuth();

  useEffect(() => {
    if (user && !profile) {
      refreshProfile();
    }
  }, [user, profile, refreshProfile]);

  const handleManageSubscription = async () => {
    try {
      const url = await openCustomerPortal();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening portal:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const showAlert = profile?.status === 'past_due' || profile?.status === 'expired';

  return (
    <>
      {showAlert && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {profile?.status === 'past_due' 
                ? 'Votre paiement a échoué. Veuillez mettre à jour vos informations de paiement.'
                : 'Votre abonnement a expiré. Veuillez renouveler pour continuer.'}
            </span>
            <Button onClick={handleManageSubscription} variant="outline" size="sm">
              Gérer mon abonnement
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <Outlet context={{ profile }} />
    </>
  );
};
