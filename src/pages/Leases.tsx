import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const leases = [
  {
    id: 1,
    tenant: "Ahmad Fauzi",
    room: "A-101",
    startDate: "2024-01-15",
    endDate: "2024-07-15",
    rent: "2500000",
    status: "active",
  },
  {
    id: 2,
    tenant: "Siti Nurhaliza",
    room: "A-103",
    startDate: "2024-02-01",
    endDate: "2024-08-01",
    rent: "2500000",
    status: "active",
  },
  {
    id: 3,
    tenant: "Budi Santoso",
    room: "B-201",
    startDate: "2024-01-20",
    endDate: "2025-01-20",
    rent: "1800000",
    status: "active",
  },
  {
    id: 4,
    tenant: "Dewi Lestari",
    room: "C-301",
    startDate: "2023-12-01",
    endDate: "2024-12-01",
    rent: "1500000",
    status: "active",
  },
  {
    id: 5,
    tenant: "Rizky Pratama",
    room: "A-105",
    startDate: "2023-09-01",
    endDate: "2024-03-01",
    rent: "2500000",
    status: "ended",
  },
];

export default function Leases() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysUntilEnd = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leases</h1>
          <p className="text-muted-foreground mt-1">Manage tenant lease agreements</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Assign Tenant to Room
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Leases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leases.filter((l) => l.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ending Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {leases.filter((l) => {
                const days = getDaysUntilEnd(l.endDate);
                return days > 0 && days <= 30 && l.status === "active";
              }).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Within 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              IDR{" "}
              {(
                leases
                  .filter((l) => l.status === "active")
                  .reduce((sum, l) => sum + parseInt(l.rent), 0) / 1000000
              ).toFixed(1)}
              M
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per month</p>
          </CardContent>
        </Card>
      </div>

      {/* Leases Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Monthly Rent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leases.map((lease) => {
                  const daysLeft = getDaysUntilEnd(lease.endDate);
                  const isEndingSoon = daysLeft > 0 && daysLeft <= 30;
                  
                  return (
                    <TableRow key={lease.id} className="cursor-pointer hover:bg-secondary">
                      <TableCell className="font-medium">{lease.tenant}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{lease.room}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(lease.startDate)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">to</span>
                            <span className={isEndingSoon ? "text-warning font-medium" : ""}>
                              {formatDate(lease.endDate)}
                            </span>
                          </div>
                          {isEndingSoon && lease.status === "active" && (
                            <Badge variant="outline" className="text-warning border-warning">
                              Ends in {daysLeft} days
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        IDR {parseInt(lease.rent).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={lease.status === "active" ? "default" : "secondary"}>
                          {lease.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          {lease.status === "active" ? "End Lease" : "View"}
                        </Button>
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
