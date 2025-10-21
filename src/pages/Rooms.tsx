import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2, DoorOpen, Plus, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const rooms = [
  { id: 1, code: "A-101", property: "Menteng Residence", status: "occupied", price: "2500000", tenant: "Ahmad Fauzi" },
  { id: 2, code: "A-102", property: "Menteng Residence", status: "available", price: "2500000", tenant: null },
  { id: 3, code: "A-103", property: "Menteng Residence", status: "occupied", price: "2500000", tenant: "Siti Nurhaliza" },
  { id: 4, code: "A-104", property: "Menteng Residence", status: "maintenance", price: "2500000", tenant: null },
  { id: 5, code: "B-201", property: "Green Valley", status: "occupied", price: "1800000", tenant: "Budi Santoso" },
  { id: 6, code: "B-202", property: "Green Valley", status: "available", price: "1800000", tenant: null },
  { id: 7, code: "C-301", property: "Campus View", status: "occupied", price: "1500000", tenant: "Dewi Lestari" },
  { id: 8, code: "C-302", property: "Campus View", status: "available", price: "1500000", tenant: null },
];

const statusConfig = {
  occupied: { label: "Occupied", variant: "default" as const, color: "bg-primary" },
  available: { label: "Available", variant: "secondary" as const, color: "bg-success" },
  maintenance: { label: "Maintenance", variant: "destructive" as const, color: "bg-warning" },
};

export default function Rooms() {
  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
          <p className="text-muted-foreground mt-1">Manage all your rental rooms</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Room
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search room code..." className="pl-9" />
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="menteng">Menteng Residence</SelectItem>
                <SelectItem value="green">Green Valley</SelectItem>
                <SelectItem value="campus">Campus View</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rooms.map((room) => {
          const status = statusConfig[room.status as keyof typeof statusConfig];
          
          return (
            <Card key={room.id} className="card-hover cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                      <DoorOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{room.code}</CardTitle>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {room.property}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge variant={status.variant} className="w-full justify-center">
                  {status.label}
                </Badge>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Rent</span>
                    <span className="font-medium">
                      IDR {parseInt(room.price).toLocaleString()}
                    </span>
                  </div>
                  
                  {room.tenant && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">Current Tenant</p>
                      <p className="font-medium">{room.tenant}</p>
                    </div>
                  )}
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
