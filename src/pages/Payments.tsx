import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const payments = [
  {
    id: 1,
    invoiceId: "INV-2024-001",
    tenant: "Ahmad Fauzi",
    amount: "2500000",
    method: "Bank Transfer",
    date: "2024-01-08",
    proof: true,
  },
  {
    id: 2,
    invoiceId: "INV-2024-004",
    tenant: "Dewi Lestari",
    amount: "1500000",
    method: "Cash",
    date: "2024-01-02",
    proof: false,
  },
  {
    id: 3,
    invoiceId: "INV-2023-098",
    tenant: "Budi Santoso",
    amount: "1800000",
    method: "Bank Transfer",
    date: "2023-12-20",
    proof: true,
  },
  {
    id: 4,
    invoiceId: "INV-2023-095",
    tenant: "Siti Nurhaliza",
    amount: "2500000",
    method: "E-Wallet",
    date: "2023-12-05",
    proof: true,
  },
];

export default function Payments() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const totalAmount = payments.reduce((sum, p) => sum + parseInt(p.amount), 0);

  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground mt-1">Track payment history and receipts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              IDR {(totalAmount / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground mt-1">Received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {payments.filter((p) => p.date.includes("2024-01")).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Payments received</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="cursor-pointer hover:bg-secondary">
                    <TableCell className="font-mono text-sm">{payment.invoiceId}</TableCell>
                    <TableCell className="font-medium">{payment.tenant}</TableCell>
                    <TableCell className="font-medium">
                      IDR {parseInt(payment.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.method}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(payment.date)}</TableCell>
                    <TableCell>
                      {payment.proof ? (
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Receipt className="h-4 w-4" />
                          View
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">No proof</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
