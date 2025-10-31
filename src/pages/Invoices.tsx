import { useState, useEffect } from 'react';
import { Plus, FileText, AlertCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const invoiceSchema = z.object({
  tenant_id: z.string().uuid(),
  amount: z.number().min(1, "Le montant doit être positif"),
  due_date: z.string().min(1, "La date d'échéance est requise"),
});

export default function Invoices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    tenant_id: '',
    amount: '',
    due_date: '',
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [invoicesData, tenantsData] = await Promise.all([
        supabase
          .from('invoices')
          .select('*, tenants(full_name, rooms(name))')
          .eq('owner_id', user.id)
          .order('due_date', { ascending: false }),
        supabase
          .from('tenants')
          .select('id, full_name')
          .eq('owner_id', user.id)
          .or('end_date.is.null,end_date.gte.' + new Date().toISOString().split('T')[0])
      ]);

      if (invoicesData.error) throw invoicesData.error;
      if (tenantsData.error) throw tenantsData.error;

      setInvoices(invoicesData.data || []);
      setTenants(tenantsData.data || []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les factures',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const validatedData = invoiceSchema.parse({
        ...formData,
        amount: parseFloat(formData.amount),
      });

      const { error } = await supabase
        .from('invoices')
        .insert([{
          tenant_id: validatedData.tenant_id,
          amount: validatedData.amount,
          due_date: validatedData.due_date,
          owner_id: user.id,
        }]);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Facture créée avec succès',
      });

      setDialogOpen(false);
      setFormData({ tenant_id: '', amount: '', due_date: '' });
      loadData();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Erreur de validation',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de créer la facture',
          variant: 'destructive',
        });
      }
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Facture marquée comme payée',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la facture',
        variant: 'destructive',
      });
    }
  };

  const statusConfig = {
    paid: { label: 'Paid', variant: 'default' as const },
    pending: { label: 'Pending', variant: 'secondary' as const },
    overdue: { label: 'Overdue', variant: 'destructive' as const },
    partial: { label: 'Partial', variant: 'outline' as const },
  };

  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = searchTerm.toLowerCase();
    const tenantName = invoice.tenants?.full_name?.toLowerCase() || '';
    return tenantName.includes(searchLower);
  });

  const totalPaid = invoices.filter((i) => i.status === 'paid').length;
  const totalOverdue = invoices.filter((i) => i.status === 'overdue').length;
  const totalPending = invoices.filter((i) => i.status === 'pending').length;

  if (loading) {
    return (
      <div className="space-y-6 animate-in">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Factures</h1>
          <p className="text-muted-foreground mt-1">Suivre et gérer les factures de location</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer une Facture
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une facture</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Locataire</Label>
                <Select value={formData.tenant_id} onValueChange={(value) => setFormData({ ...formData, tenant_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un locataire..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Montant (IDR)</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="2500000"
                  required
                />
              </div>
              <div>
                <Label>Date d'échéance</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Créer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{totalPaid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPending}</div>
          </CardContent>
        </Card>
        <Card className="border-destructive/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalOverdue}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par locataire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Aucune facture trouvée' : 'Aucune facture. Créez votre première facture pour commencer.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Locataire</TableHead>
                  <TableHead>Chambre</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date d'échéance</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const status = statusConfig[invoice.status as keyof typeof statusConfig];
                  
                  return (
                    <TableRow key={invoice.id} className="cursor-pointer hover:bg-secondary">
                      <TableCell className="font-medium">{invoice.tenants?.full_name}</TableCell>
                      <TableCell>
                        {invoice.tenants?.rooms?.name ? (
                          <Badge variant="outline">{invoice.tenants.rooms.name}</Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        IDR {Number(invoice.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.due_date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {invoice.status === 'pending' || invoice.status === 'overdue' ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleMarkAsPaid(invoice.id)}
                          >
                            Marquer payée
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm">
                            Voir
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
