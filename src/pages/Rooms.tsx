import { useState, useEffect } from 'react';
import { Plus, DoorOpen, Building2, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { canAddRoom, getLimitMessage } from '@/services/limits';
import { Paywall } from '@/components/paywall/Paywall';
import { useRoomActions } from '@/hooks/useRoomActions';
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

export default function Rooms() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const { deleteRoom, isDeleting } = useRoomActions();
  const [formData, setFormData] = useState({
    property_id: '',
    name: '',
    price_monthly: '',
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [roomsRes, propertiesRes] = await Promise.all([
        supabase
          .from('rooms')
          .select('*, properties(name), tenants(full_name)')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('properties')
          .select('id, name')
          .eq('owner_id', user.id),
      ]);

      if (roomsRes.error) throw roomsRes.error;
      if (propertiesRes.error) throw propertiesRes.error;

      setRooms(roomsRes.data || []);
      setProperties(propertiesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load rooms',
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
    if (!canAddRoom(rooms.length, profile.plan as any)) {
      setIsPaywallOpen(true);
      return;
    }

    try {
      const { error } = await supabase.from('rooms').insert({
        owner_id: user.id,
        property_id: formData.property_id,
        name: formData.name,
        price_monthly: parseFloat(formData.price_monthly),
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Room created successfully',
      });

      setIsDialogOpen(false);
      setFormData({ property_id: '', name: '', price_monthly: '' });
      loadData();
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: 'Error',
        description: 'Failed to create room',
        variant: 'destructive',
      });
    }
  };

  const statusConfig = {
    occupied: { label: 'Occupied', variant: 'default' as const },
    vacant: { label: 'Available', variant: 'secondary' as const },
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rooms</h1>
          <p className="text-muted-foreground mt-1">Manage all your rental rooms</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="property_id">Property</Label>
                <Select value={formData.property_id} onValueChange={(value) => setFormData({ ...formData, property_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Room Name/Number</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. A-101"
                  required
                />
              </div>
              <div>
                <Label htmlFor="price_monthly">Monthly Rent (IDR)</Label>
                <Input
                  id="price_monthly"
                  type="number"
                  value={formData.price_monthly}
                  onChange={(e) => setFormData({ ...formData, price_monthly: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Create Room</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {rooms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DoorOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No rooms yet. Add your first room to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rooms.map((room) => {
            const status = statusConfig[room.status as keyof typeof statusConfig];
            
            return (
              <Card key={room.id} className="card-hover cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                        <DoorOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{room.name}</CardTitle>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {room.properties?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge variant={status.variant} className="w-full justify-center">
                    {status.label}
                  </Badge>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Rent</span>
                      <span className="font-medium">
                        IDR {Number(room.price_monthly).toLocaleString()}
                      </span>
                    </div>
                    
                    {room.tenants && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-1">Current Tenant</p>
                        <p className="font-medium">{room.tenants.full_name}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        setRoomToDelete(room.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
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
        message={getLimitMessage('room', profile?.plan as any)}
        currentPlan={profile?.plan as any}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this room? This action cannot be undone.
              Occupied rooms cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (roomToDelete) {
                  deleteRoom(roomToDelete, () => {
                    loadData();
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
