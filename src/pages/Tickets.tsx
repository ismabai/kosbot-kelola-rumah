import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from 'zod';

const ticketSchema = z.object({
  description: z.string().min(5, "La description doit faire au moins 5 caractères").max(500),
  priority: z.enum(['high', 'medium', 'low']),
  property_id: z.string().uuid(),
  room_id: z.string().uuid().optional(),
});

export default function Tickets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    priority: 'medium',
    property_id: '',
    room_id: '',
  });

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (formData.property_id) {
      loadRooms(formData.property_id);
    }
  }, [formData.property_id]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [ticketsData, propertiesData] = await Promise.all([
        supabase
          .from('tickets')
          .select('*, properties(name), rooms(name)')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('properties')
          .select('id, name')
          .eq('owner_id', user.id)
      ]);

      if (ticketsData.error) throw ticketsData.error;
      if (propertiesData.error) throw propertiesData.error;

      setTickets(ticketsData.data || []);
      setProperties(propertiesData.data || []);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les tickets',
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
        .select('id, name')
        .eq('property_id', propertyId)
        .eq('owner_id', user!.id);

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
      const validatedData = ticketSchema.parse(formData);
      
      const { error } = await supabase
        .from('tickets')
        .insert([{
          description: validatedData.description,
          priority: validatedData.priority,
          property_id: validatedData.property_id,
          room_id: validatedData.room_id || null,
          owner_id: user.id,
        }]);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Ticket créé avec succès',
      });

      setDialogOpen(false);
      setFormData({ description: '', priority: 'medium', property_id: '', room_id: '' });
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
          description: 'Impossible de créer le ticket',
          variant: 'destructive',
        });
      }
    }
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Statut mis à jour',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        variant: 'destructive',
      });
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const searchLower = searchTerm.toLowerCase();
    const description = ticket.description?.toLowerCase() || '';
    const property = ticket.properties?.name?.toLowerCase() || '';
    return description.includes(searchLower) || property.includes(searchLower);
  });

  const priorityConfig = {
    high: { label: "Haute", variant: "destructive" as const },
    medium: { label: "Moyenne", variant: "default" as const },
    low: { label: "Basse", variant: "secondary" as const },
  };

  const statusConfig = {
    open: { label: "Ouvert", variant: "destructive" as const },
    progress: { label: "En cours", variant: "default" as const },
    done: { label: "Terminé", variant: "secondary" as const },
  };

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'progress').length;
  const doneTickets = tickets.filter(t => t.status === 'done').length;

  if (loading) {
    return (
      <div className="space-y-6 animate-in">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map(i => (
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets de Maintenance</h1>
          <p className="text-muted-foreground mt-1">Suivre et résoudre les problèmes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un ticket</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrire le problème..."
                  required
                />
              </div>
              <div>
                <Label>Priorité</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Propriété</Label>
                <Select value={formData.property_id} onValueChange={(value) => setFormData({ ...formData, property_id: value, room_id: '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Chambre (optionnel)</Label>
                <Select value={formData.room_id} onValueChange={(value) => setFormData({ ...formData, room_id: value })} disabled={!formData.property_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Créer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Ouverts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{openTickets}</div>
            <p className="text-xs text-muted-foreground mt-1">Nécessite une attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">En Cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTickets}</div>
            <p className="text-xs text-muted-foreground mt-1">En traitement</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taux de Résolution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {tickets.length > 0 ? Math.round((doneTickets / tickets.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ce mois</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Propriété</TableHead>
                  <TableHead>Chambre</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      Aucun ticket trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => {
                    const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig];
                    const status = statusConfig[ticket.status as keyof typeof statusConfig];
                    
                    return (
                      <TableRow key={ticket.id} className="cursor-pointer hover:bg-secondary">
                        <TableCell className="font-medium max-w-xs truncate">{ticket.description}</TableCell>
                        <TableCell>{ticket.properties?.name}</TableCell>
                        <TableCell>
                          {ticket.rooms?.name ? (
                            <Badge variant="outline">{ticket.rooms.name}</Badge>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={priority.variant}>{priority.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {ticket.status !== 'done' && (
                            <Select
                              value={ticket.status}
                              onValueChange={(value) => handleStatusUpdate(ticket.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Ouvert</SelectItem>
                                <SelectItem value="progress">En cours</SelectItem>
                                <SelectItem value="done">Terminé</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}