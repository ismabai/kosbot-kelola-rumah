import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Image as ImageIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const tickets = [
  {
    id: 1,
    title: "AC not cooling properly",
    room: "A-101",
    priority: "high",
    status: "open",
    date: "2024-01-10",
    hasImage: true,
  },
  {
    id: 2,
    title: "Leaking faucet in bathroom",
    room: "B-201",
    priority: "medium",
    status: "in-progress",
    date: "2024-01-09",
    hasImage: true,
  },
  {
    id: 3,
    title: "Door lock needs replacement",
    room: "C-301",
    priority: "high",
    status: "open",
    date: "2024-01-08",
    hasImage: false,
  },
  {
    id: 4,
    title: "Light bulb replacement",
    room: "A-103",
    priority: "low",
    status: "done",
    date: "2024-01-05",
    hasImage: false,
  },
  {
    id: 5,
    title: "WiFi connectivity issues",
    room: "B-202",
    priority: "medium",
    status: "in-progress",
    date: "2024-01-07",
    hasImage: false,
  },
];

export default function Tickets() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const priorityConfig = {
    high: { label: "High", variant: "destructive" as const },
    medium: { label: "Medium", variant: "default" as const },
    low: { label: "Low", variant: "secondary" as const },
  };

  const statusConfig = {
    open: { label: "Open", variant: "destructive" as const },
    "in-progress": { label: "In Progress", variant: "default" as const },
    done: { label: "Done", variant: "secondary" as const },
  };

  const openTickets = tickets.filter((t) => t.status === "open").length;
  const inProgressTickets = tickets.filter((t) => t.status === "in-progress").length;

  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance Tickets</h1>
          <p className="text-muted-foreground mt-1">Track and resolve maintenance issues</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{openTickets}</div>
            <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTickets}</div>
            <p className="text-xs text-muted-foreground mt-1">Being worked on</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {Math.round((tickets.filter((t) => t.status === "done").length / tickets.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Attachments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => {
                  const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig];
                  const status = statusConfig[ticket.status as keyof typeof statusConfig];
                  
                  return (
                    <TableRow key={ticket.id} className="cursor-pointer hover:bg-secondary">
                      <TableCell className="font-medium">{ticket.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{ticket.room}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={priority.variant}>{priority.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(ticket.date)}</TableCell>
                      <TableCell>
                        {ticket.hasImage && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <ImageIcon className="h-4 w-4" />
                            <span className="text-sm">1 photo</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {ticket.status !== "done" && (
                          <Button variant="ghost" size="sm">
                            Update Status
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
