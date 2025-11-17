import { ECommerceHeader } from "@/components/e-commerce-header"
import { CategorySidebar } from "@/components/category-sidebar"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const searchQuery = searchParams?.search || ""

  return (
    <div className="min-h-screen flex flex-col">
      <ECommerceHeader />
      <div className="flex-1 flex flex-col md:flex-row">
        <CategorySidebar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {searchQuery ? `Search Results for "${searchQuery}"` : "All Products"}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {searchQuery
                  ? `Showing results for "${searchQuery}"`
                  : "Browse our complete range of biometric devices, IT equipment, and security solutions"}
              </p>
            </div>
            <ProductGrid searchQuery={searchQuery} />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
