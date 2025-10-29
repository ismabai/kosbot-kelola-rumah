import { supabase } from '@/integrations/supabase/client';

export interface OverviewStats {
  occupancyRate: number;
  occupancyChange: string;
  monthlyIncome: number;
  monthlyIncomeChange: string;
  pendingPayments: number;
  pendingPaymentsChange: string;
  openTickets: number;
  openTicketsChange: string;
}

export interface QuickStats {
  totalProperties: number;
  totalRooms: number;
  activeTenants: number;
}

export interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
}

export interface RevenueDataPoint {
  month: string;
  amount: number;
}

export const getOverviewStats = async (ownerId: string): Promise<OverviewStats> => {
  // Get total rooms and occupied rooms
  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select('status')
    .eq('owner_id', ownerId);

  if (roomsError) throw roomsError;

  const totalRooms = rooms?.length || 0;
  const occupiedRooms = rooms?.filter(r => r.status === 'occupied').length || 0;
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  // Get current month's income
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('amount, paid_at')
    .eq('owner_id', ownerId)
    .gte('paid_at', firstDayOfMonth.toISOString());

  if (paymentsError) throw paymentsError;

  const monthlyIncome = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  // Get pending and overdue invoices count
  const { data: invoices, error: invoicesError } = await supabase
    .from('invoices')
    .select('status')
    .eq('owner_id', ownerId)
    .in('status', ['pending', 'overdue']);

  if (invoicesError) throw invoicesError;

  const pendingPayments = invoices?.length || 0;

  // Get open tickets
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('id')
    .eq('owner_id', ownerId)
    .in('status', ['open', 'progress']);

  if (ticketsError) throw ticketsError;

  const openTickets = tickets?.length || 0;

  return {
    occupancyRate,
    occupancyChange: '+5%', // Mock for now
    monthlyIncome,
    monthlyIncomeChange: '+12%', // Mock for now
    pendingPayments,
    pendingPaymentsChange: '-3',
    openTickets,
    openTicketsChange: '-2',
  };
};

export const getQuickStats = async (ownerId: string): Promise<QuickStats> => {
  const { data: properties } = await supabase
    .from('properties')
    .select('id')
    .eq('owner_id', ownerId);

  const { data: rooms } = await supabase
    .from('rooms')
    .select('id')
    .eq('owner_id', ownerId);

  const { data: tenants } = await supabase
    .from('tenants')
    .select('id')
    .eq('owner_id', ownerId)
    .or('end_date.is.null,end_date.gte.' + new Date().toISOString().split('T')[0]);

  return {
    totalProperties: properties?.length || 0,
    totalRooms: rooms?.length || 0,
    activeTenants: tenants?.length || 0,
  };
};

export const getTasks = async (ownerId: string): Promise<Task[]> => {
  const today = new Date().toISOString().split('T')[0];
  const tasks: Task[] = [];

  // Get invoices due today
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, due_date, tenants(full_name)')
    .eq('owner_id', ownerId)
    .eq('due_date', today)
    .neq('status', 'paid');

  if (invoices) {
    invoices.forEach((inv: any) => {
      tasks.push({
        id: inv.id,
        title: `Follow up payment - ${inv.tenants?.full_name}`,
        priority: 'high',
        dueDate: 'Today',
      });
    });
  }

  // Get high priority tickets
  const { data: tickets } = await supabase
    .from('tickets')
    .select('id, description, priority')
    .eq('owner_id', ownerId)
    .eq('priority', 'high')
    .in('status', ['open', 'progress'])
    .limit(3);

  if (tickets) {
    tickets.forEach((ticket: any) => {
      tasks.push({
        id: ticket.id,
        title: ticket.description,
        priority: ticket.priority,
        dueDate: 'Today',
      });
    });
  }

  return tasks.slice(0, 4);
};

export const getRevenueSeries = async (ownerId: string): Promise<RevenueDataPoint[]> => {
  const months = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleString('default', { month: 'short' });
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('owner_id', ownerId)
      .gte('paid_at', startDate.toISOString())
      .lte('paid_at', endDate.toISOString());

    const total = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    months.push({
      month: monthName,
      amount: total / 1000000, // Convert to millions
    });
  }

  return months;
};
