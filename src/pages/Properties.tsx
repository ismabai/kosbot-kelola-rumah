import { useState, useEffect } from 'react';
import { Plus, Building2, MapPin, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { canAddProperty, getLimitMessage } from '@/services/limits';
import { Paywall } from '@/components/paywall/Paywall';
import { Badge } from '@/components/ui/badge';
import { usePropertyActions } from '@/hooks/usePropertyActions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';

export default function Properties() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const { deleteProperty, isDeleting } = usePropertyActions();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    rooms_total: 0,
  });

  useEffect(() => {
    loadProperties();
  }, [user]);

  const loadProperties = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*, rooms(id, status)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to load properties',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) return;

    // Check plan limits
    if (!canAddProperty(properties.length, profile.plan as any)) {
      setIsPaywallOpen(true);
      return;
    }

    try {
      const { error } = await supabase.from('properties').insert({
        owner_id: user.id,
        ...formData,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Property created successfully',
      });

      setIsDialogOpen(false);
      setFormData({ name: '', address: '', city: '', rooms_total: 0 });
      loadProperties();
    } catch (error) {
      console.error('Error creating property:', error);
      toast({
        title: 'Error',
        description: 'Failed to create property',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Properties</h1>
          <p className="text-muted-foreground mt-1">Manage your boarding house properties</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Property</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Property Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rooms_total">Total Rooms</Label>
                <Input
                  id="rooms_total"
                  type="number"
                  value={formData.rooms_total}
                  onChange={(e) => setFormData({ ...formData, rooms_total: parseInt(e.target.value) })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Create Property</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No properties yet. Add your first property to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => {
            const occupiedRooms = property.rooms?.filter((r: any) => r.status === 'occupied').length || 0;
            const totalRooms = property.rooms?.length || 0;
            const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

            return (
              <Card key={property.id} className="card-hover cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="text-5xl">🏢</div>
                    <Badge variant={occupancyRate >= 80 ? 'default' : 'secondary'}>
                      {occupancyRate}% Full
                    </Badge>
                  </div>
                  <CardTitle className="mt-4">{property.name}</CardTitle>
                  <p className="text-sm text-muted-foreground flex items-start gap-1 mt-1">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {property.address}, {property.city}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Rooms</span>
                      <span className="font-medium">{totalRooms}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Occupied</span>
                      <span className="font-medium">{occupiedRooms}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Available</span>
                      <span className="font-medium text-success">{totalRooms - occupiedRooms}</span>
                    </div>
                    <div className="pt-2">
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${occupancyRate}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigate(`/properties/${property.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => {
                        setPropertyToDelete(property.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Paywall
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        message={getLimitMessage('property', profile?.plan as any)}
        currentPlan={profile?.plan as any}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
              All associated rooms must be removed first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (propertyToDelete) {
                  deleteProperty(propertyToDelete, () => {
                    loadProperties();
                    setDeleteDialogOpen(false);
                  });
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
