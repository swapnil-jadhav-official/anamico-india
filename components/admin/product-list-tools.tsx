"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";



export function ProductListTools({ products, onEditProduct, onAddNew, onProductUpdate }: { products: any[]; onEditProduct: (product: any) => void; onAddNew: () => void; onProductUpdate: () => void; }) {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const handleEdit = () => {
    if (selectedProduct) {
      onEditProduct(selectedProduct);
    }
  };

  const handleDelete = async () => {
    if (selectedProduct) {
      try {
        const res = await fetch(`/api/admin/products/${selectedProduct.id}`,
          {
            method: 'DELETE',
          }
        );

        if (res.ok) {
          onProductUpdate();
          setSelectedProduct(null);
        } else {
          console.error('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isActive }),
        }
      );

      if (res.ok) {
        onProductUpdate();
      } else {
        console.error('Failed to update product status');
      }
    } catch (error) {
      console.error('Error updating product status:', error);
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
            Existing Products ({products.length})
          </h3>
          <div className="space-y-2 pr-2">
            {products.map((product) => (
              <div
                key={product.id}
                className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-colors ${ 
                  selectedProduct?.id === product.id ? 'bg-primary/10 border-primary/50 border' : 'hover:bg-accent'
                }`}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative h-12 w-12 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                    <Image src={product.image || "/placeholder.jpg"} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className={`text-xs font-semibold ${product.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <Switch
                  checked={product.isActive}
                  onCheckedChange={(value) => handleToggleActive(product.id, value)}
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={!selectedProduct} variant="destructive" className="flex-1">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
