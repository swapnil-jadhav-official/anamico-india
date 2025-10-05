"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";

const dummyProducts = [
  { id: 1, name: "Cogent Fingerprint Scanner", image: "/cogent-fingerprint-scanner.jpg", category: "biometric", description: "A high-quality fingerprint scanner.", price: "5000", sku: "COG-FING-01", stock: "150", isActive: true },
  { id: 2, name: "Evolis Card Printer", image: "/evolis-card-printer.jpg", category: "printers", description: "Professional card printing solution.", price: "25000", sku: "EVO-CARD-01", stock: "50", isActive: true },
  { id: 3, name: "Logitech C525 Webcam", image: "/logitech-c525-webcam.jpg", category: "electronics", description: "HD webcam for video conferencing.", price: "4500", sku: "LOG-WEBC-01", stock: "200", isActive: false },
  { id: 4, name: "D-Link WiFi Router", image: "/wifi-router.jpg", category: "networking", description: "High-speed wireless router.", price: "3000", sku: "DLINK-ROUT-01", stock: "120", isActive: true },
];

export function ProductListTools({ onEditProduct, onAddNew }: { onEditProduct: (product: any) => void; onAddNew: () => void; }) {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const handleEdit = () => {
    if (selectedProduct) {
      onEditProduct(selectedProduct);
    }
  };

  const handleDelete = () => {
    if (selectedProduct) {
      // In a real app, you'd show a confirmation dialog here
      alert(`Deleting: ${selectedProduct.name}`);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Products</CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-10" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <Button className="w-full mb-4" onClick={onAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Existing Products ({dummyProducts.length})
          </h3>
          <div className="space-y-2 pr-2">
            {dummyProducts.map((product) => (
              <div
                key={product.id}
                className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-colors ${ 
                  selectedProduct?.id === product.id ? 'bg-primary/10 border-primary/50 border' : 'hover:bg-accent'
                }`}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative h-12 w-12 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className={`text-xs font-semibold ${product.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <Switch
                  checked={product.isActive}
                  onClick={(e) => e.stopPropagation()} // Prevent row selection when clicking switch
                  aria-label="Toggle product status"
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-4 border-t mt-auto">
        <Button onClick={handleEdit} disabled={!selectedProduct} className="flex-1">
          <Edit className="mr-2 h-4 w-4" />
          Edit Selected
        </Button>
        <Button onClick={handleDelete} disabled={!selectedProduct} variant="destructive" className="flex-1">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Selected
        </Button>
      </CardFooter>
    </Card>
  );
}
