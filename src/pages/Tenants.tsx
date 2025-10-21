import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Phone, Mail, Plus, Search, Upload } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const tenants = [
  {
    id: 1,
    name: "Ahmad Fauzi",
    phone: "+62 812-3456-7890",
    email: "ahmad.fauzi@email.com",
    room: "A-101",
    status: "active",
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    phone: "+62 813-9876-5432",
    email: "siti.nur@email.com",
    room: "A-103",
    status: "active",
  },
  {
    id: 3,
    name: "Budi Santoso",
    phone: "+62 821-1234-5678",
    email: "budi.s@email.com",
    room: "B-201",
    status: "active",
  },
  {
    id: 4,
    name: "Dewi Lestari",
    phone: "+62 856-7890-1234",
    email: "dewi.lestari@email.com",
    room: "C-301",
    status: "active",
  },
  {
    id: 5,
    name: "Rizky Pratama",
    phone: "+62 878-2345-6789",
    email: "rizky.p@email.com",
    room: "-",
    status: "inactive",
  },
];

export default function Tenants() {
  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground mt-1">Manage your tenant information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Tenant
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search Tenants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, phone, or email..." className="pl-9" />
          </div>
        </CardContent>
      </Card>

      {/* Tenants Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id} className="cursor-pointer hover:bg-secondary">
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {tenant.phone}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {tenant.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {tenant.room !== "-" ? (
                        <Badge variant="outline">{tenant.room}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tenant.status === "active" ? "default" : "secondary"}>
                        {tenant.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View Details
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
