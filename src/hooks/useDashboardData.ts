import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getOverviewStats, getQuickStats, getTasks, getRevenueSeries } from '@/services/db';
import { DoorOpen, TrendingUp, Receipt, Wrench, Building2, Users } from 'lucide-react';

export const useDashboardData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<any[]>([]);
  const [quick, setQuick] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const [stats, quickStats, tasksList, revenueData] = await Promise.all([
          getOverviewStats(user.id),
          getQuickStats(user.id),
          getTasks(user.id),
          getRevenueSeries(user.id),
        ]);

        // Map to KPI format
        setKpis([
          {
            title: 'Occupancy Rate',
            value: `${stats.occupancyRate.toFixed(0)}%`,
            change: stats.occupancyChange,
            trend: 'up',
            icon: DoorOpen,
            color: 'text-primary',
          },
          {
            title: 'Monthly Income',
            value: `IDR ${(stats.monthlyIncome / 1000000).toFixed(1)}M`,
            change: stats.monthlyIncomeChange,
            trend: 'up',
            icon: TrendingUp,
            color: 'text-success',
          },
          {
            title: 'Pending Payments',
            value: stats.pendingPayments.toString(),
            change: stats.pendingPaymentsChange,
            trend: 'down',
            icon: Receipt,
            color: 'text-warning',
          },
          {
            title: 'Open Tickets',
            value: stats.openTickets.toString(),
            change: stats.openTicketsChange,
            trend: 'down',
            icon: Wrench,
            color: 'text-accent',
          },
        ]);

        // Map to quick stats format
        setQuick([
          { label: 'Total Properties', value: quickStats.totalProperties.toString(), icon: Building2 },
          { label: 'Total Rooms', value: quickStats.totalRooms.toString(), icon: DoorOpen },
          { label: 'Active Tenants', value: quickStats.activeTenants.toString(), icon: Users },
        ]);

        setTasks(tasksList);
        setRevenue(revenueData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  return { kpis, quick, tasks, revenue, loading };
};
