import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Receipt, Wrench, TrendingUp, DoorOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const kpiData = [
  {
    title: "Occupancy Rate",
    value: "87%",
    change: "+5%",
    trend: "up",
    icon: DoorOpen,
    color: "text-primary",
  },
  {
    title: "Monthly Income",
    value: "IDR 45.2M",
    change: "+12%",
    trend: "up",
    icon: TrendingUp,
    color: "text-success",
  },
  {
    title: "Pending Payments",
    value: "8",
    change: "-3",
    trend: "down",
    icon: Receipt,
    color: "text-warning",
  },
  {
    title: "Open Tickets",
    value: "5",
    change: "-2",
    trend: "down",
    icon: Wrench,
    color: "text-accent",
  },
];

const recentTasks = [
  { id: 1, title: "Follow up payment Room 204", priority: "high", dueDate: "Today" },
  { id: 2, title: "Fix AC in Room 301", priority: "medium", dueDate: "Tomorrow" },
  { id: 3, title: "Lease renewal - Mr. Ahmad", priority: "medium", dueDate: "In 3 days" },
  { id: 4, title: "Property inspection - Building A", priority: "low", dueDate: "Next week" },
];

const quickStats = [
  { label: "Total Properties", value: "3", icon: Building2 },
  { label: "Total Rooms", value: "48", icon: DoorOpen },
  { label: "Active Tenants", value: "42", icon: Users },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((item) => (
          <Card key={item.title} className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className={item.trend === "up" ? "text-success" : "text-primary"}>
                  {item.change}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly income over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-secondary rounded-lg">
              <p className="text-muted-foreground">Chart visualization coming soon</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Overview</CardTitle>
            <CardDescription>Your portfolio at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickStats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">{stat.label}</span>
                </div>
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Tasks Due Today */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tasks Due Today</CardTitle>
              <CardDescription>Important tasks that need your attention</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{task.dueDate}</p>
                  </div>
                </div>
                <Badge
                  variant={
                    task.priority === "high"
                      ? "destructive"
                      : task.priority === "medium"
                      ? "default"
                      : "secondary"
                  }
                >
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
