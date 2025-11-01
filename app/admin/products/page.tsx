"use client";

import { useState, useEffect } from "react";
import { ECommerceHeader } from "@/components/e-commerce-header";
import { Footer } from "@/components/footer";
import { ProductListTools } from "@/components/admin/product-list-tools";
import { ProductStepperForm } from "@/components/admin/product-stepper-form";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { SeedButton } from "@/components/admin/seed-button";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
  };

  const handleAddNew = () => {
    setProductToEdit(null); // Clear the form for a new entry
  };

  const handleSubmitProduct = async (productData: Omit<Product, 'id'>) => {
    setIsSubmitting(true);
    try {
      const url = productToEdit ? `/api/admin/products/${productToEdit.id}` : '/api/admin/products';
      const method = productToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        // Handle success, e.g., clear form, show toast, refresh list
        console.log(productToEdit ? 'Product updated successfully' : 'Product created successfully');
        setProductToEdit(null); // Clear form after submission
        fetchProducts(); // Refresh the product list
      } else {
        // Handle error
        console.error(productToEdit ? 'Failed to update product' : 'Failed to create product');
      }
    } catch (error) {
      console.error('Error submitting product:', error);
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="lg:col-span-1 flex flex-col">
            <SeedButton onSuccess={fetchProducts} />
            <div className="flex-1 min-h-0">
              <ProductListTools products={products} onEditProduct={handleEditProduct} onAddNew={handleAddNew} onProductUpdate={fetchProducts} />
            </div>
          </div>
          <div className="lg:col-span-2 min-h-0">
            <ProductStepperForm product={productToEdit} onSubmit={handleSubmitProduct} isSubmitting={isSubmitting} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}