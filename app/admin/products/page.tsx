"use client";

import { useState } from "react";
import { ECommerceHeader } from "@/components/e-commerce-header";
import { Footer } from "@/components/footer";
import { ProductListTools } from "@/components/admin/product-list-tools";
import { ProductStepperForm } from "@/components/admin/product-stepper-form";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";

// Define a type for the product for clarity
type Product = {
  id: number;
  name: string;
  image: string;
  category?: string;
  description?: string;
  price?: string;
  sku?: string;
  stock?: string;
};

export default function ProductManagementPage() {
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
  };

  const handleAddNew = () => {
    setProductToEdit(null); // Clear the form for a new entry
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100 dark:bg-gray-900">
      <ECommerceHeader />
      <main className="flex-1 p-4 sm:p-6">
        <AdminBreadcrumb />
        <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Product Management</h1>
            <p className="text-muted-foreground">Here you can add, edit, and manage all your products.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ProductListTools onEditProduct={handleEditProduct} onAddNew={handleAddNew} />
          </div>
          <div className="lg:col-span-2">
            <ProductStepperForm product={productToEdit} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}