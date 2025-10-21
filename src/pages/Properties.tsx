import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, DoorOpen, Plus } from "lucide-react";

const properties = [
  {
    id: 1,
    name: "Kos Menteng Residence",
    address: "Jl. Menteng Raya No. 45, Jakarta Pusat",
    totalRooms: 24,
    occupiedRooms: 21,
    image: "🏢",
  },
  {
    id: 2,
    name: "Green Valley Boarding House",
    address: "Jl. Setiabudhi No. 123, Bandung",
    totalRooms: 16,
    occupiedRooms: 14,
    image: "🏘️",
  },
  {
    id: 3,
    name: "Campus View Kos",
    address: "Jl. Dipatiukur No. 78, Bandung",
    totalRooms: 8,
    occupiedRooms: 7,
    image: "🏠",
  },
];

export default function Properties() {
  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground mt-1">Manage your boarding house properties</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
      </div>

      {/* Properties Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => {
          const occupancyRate = Math.round((property.occupiedRooms / property.totalRooms) * 100);
          
          return (
            <Card key={property.id} className="card-hover cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="text-5xl">{property.image}</div>
                  <Badge variant={occupancyRate >= 80 ? "default" : "secondary"}>
                    {occupancyRate}% Full
                  </Badge>
                </div>
                <CardTitle className="mt-4">{property.name}</CardTitle>
                <CardDescription className="flex items-start gap-1">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {property.address}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <DoorOpen className="h-4 w-4" />
                      Total Rooms
                    </span>
                    <span className="font-medium">{property.totalRooms}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Occupied</span>
                    <span className="font-medium">{property.occupiedRooms}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Available</span>
                    <span className="font-medium text-success">
                      {property.totalRooms - property.occupiedRooms}
                    </span>
                  </div>
                  
                  {/* Occupancy Bar */}
                  <div className="pt-2">
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${occupancyRate}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
