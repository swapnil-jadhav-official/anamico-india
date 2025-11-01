"use client";

import { ECommerceHeader } from "@/components/e-commerce-header";
import { Footer } from "@/components/footer";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { UserManagement } from "@/components/admin/user-management";

export default function AdminUsersPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <ECommerceHeader />
      <main className="flex-1 p-4 sm:p-6">
        <AdminBreadcrumb />
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users, roles, and permissions
          </p>
        </div>
        <UserManagement />
      </main>
      <Footer />
    </div>
  );
}
