import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const invoices = [
  {
    id: "INV-2024-001",
    period: "January 2024",
    room: "A-101",
    tenant: "Ahmad Fauzi",
    amount: "2500000",
    dueDate: "2024-01-10",
    status: "paid",
  },
  {
    id: "INV-2024-002",
    period: "January 2024",
    room: "A-103",
    tenant: "Siti Nurhaliza",
    amount: "2500000",
    dueDate: "2024-01-05",
    status: "overdue",
  },
  {
    id: "INV-2024-003",
    period: "January 2024",
    room: "B-201",
    tenant: "Budi Santoso",
    amount: "1800000",
    dueDate: "2024-01-15",
    status: "pending",
  },
  {
    id: "INV-2024-004",
    period: "January 2024",
    room: "C-301",
    tenant: "Dewi Lestari",
    amount: "1500000",
    dueDate: "2024-01-01",
    status: "paid",
  },
  {
    id: "INV-2024-005",
    period: "December 2023",
    room: "A-105",
    tenant: "Rizky Pratama",
    amount: "2500000",
    dueDate: "2023-12-05",
    status: "overdue",
  },
];

export default function Invoices() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusConfig = {
    paid: { label: "Paid", variant: "default" as const },
    pending: { label: "Pending", variant: "secondary" as const },
    overdue: { label: "Overdue", variant: "destructive" as const },
    draft: { label: "Draft", variant: "outline" as const },
  };

  const totalPaid = invoices.filter((i) => i.status === "paid").length;
  const totalOverdue = invoices.filter((i) => i.status === "overdue").length;
  const totalPending = invoices.filter((i) => i.status === "pending").length;

  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-1">Track and manage rental invoices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Generate Monthly
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
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

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const status = statusConfig[invoice.status as keyof typeof statusConfig];
                  
                  return (
                    <TableRow key={invoice.id} className="cursor-pointer hover:bg-secondary">
                      <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                      <TableCell>{invoice.period}</TableCell>
                      <TableCell className="font-medium">{invoice.tenant}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{invoice.room}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        IDR {parseInt(invoice.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {invoice.status === "pending" || invoice.status === "overdue" ? (
                          <Button variant="ghost" size="sm">
                            Mark as Paid
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm">
                            View
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
