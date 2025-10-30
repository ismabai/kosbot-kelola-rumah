import { useState, useEffect } from 'react';
import { Plus, Phone, Mail, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function Tenants() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tenants, setTenants] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    property_id: '',
    room_id: '',
    full_name: '',
    phone: '',
    start_date: '',
    deposit_amount: '',
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [tenantsRes, propertiesRes] = await Promise.all([
        supabase
          .from('tenants')
          .select('*, properties(name), rooms(name)')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('properties')
          .select('id, name')
          .eq('owner_id', user.id),
      ]);

      if (tenantsRes.error) throw tenantsRes.error;
      if (propertiesRes.error) throw propertiesRes.error;

      setTenants(tenantsRes.data || []);
      setProperties(propertiesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tenants',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('id, name, status')
        .eq('property_id', propertyId)
        .eq('status', 'vacant');

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      const { data: newTenant, error } = await supabase
        .from('tenants')
        .insert({
          owner_id: user.id,
          property_id: formData.property_id,
          room_id: formData.room_id || null,
          full_name: formData.full_name,
          phone: formData.phone,
          start_date: formData.start_date,
          deposit_amount: parseFloat(formData.deposit_amount),
        })
        .select()
        .single();

      if (error) throw error;

      // Update room status and tenant_id if room is selected
      if (formData.room_id && newTenant) {
        await supabase
          .from('rooms')
          .update({ 
            status: 'occupied',
            tenant_id: newTenant.id 
          })
          .eq('id', formData.room_id);
      }

      toast({
        title: 'Success',
        description: 'Tenant created successfully',
      });

      setIsDialogOpen(false);
      setFormData({
        property_id: '',
        room_id: '',
        full_name: '',
        phone: '',
        start_date: '',
        deposit_amount: '',
      });
      loadData();
    } catch (error) {
      console.error('Error creating tenant:', error);
      toast({
        title: 'Error',
        description: 'Failed to create tenant',
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
          <h1 className="text-3xl font-bold">Tenants</h1>
          <p className="text-muted-foreground mt-1">Manage your tenant information</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tenant</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+62 xxx-xxxx-xxxx"
                  required
                />
              </div>
              <div>
                <Label htmlFor="property_id">Property</Label>
                <Select
                  value={formData.property_id}
                  onValueChange={(value) => {
                    setFormData({ ...formData, property_id: value, room_id: '' });
                    loadRooms(value);
                  }}
                >
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
              {formData.property_id && (
                <div>
                  <Label htmlFor="room_id">Room (Optional)</Label>
                  <Select value={formData.room_id} onValueChange={(value) => setFormData({ ...formData, room_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="deposit_amount">Deposit Amount (IDR)</Label>
                <Input
                  id="deposit_amount"
                  type="number"
                  value={formData.deposit_amount}
                  onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Create Tenant</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {tenants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No tenants yet. Add your first tenant to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => {
                  const isActive = !tenant.end_date || new Date(tenant.end_date) >= new Date();
                  
                  return (
                    <TableRow key={tenant.id} className="cursor-pointer hover:bg-secondary">
                      <TableCell className="font-medium">{tenant.full_name}</TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {tenant.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{tenant.properties?.name}</TableCell>
                      <TableCell>
                        {tenant.rooms?.name ? (
                          <Badge variant="outline">{tenant.rooms.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(tenant.start_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isActive ? 'default' : 'secondary'}>
                          {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
