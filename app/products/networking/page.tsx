import { ECommerceHeader } from "@/components/e-commerce-header"
import { CategorySidebar } from "@/components/category-sidebar"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"

export default function NetworkingProductsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ECommerceHeader />
      <div className="flex-1 flex flex-col md:flex-row">
        <CategorySidebar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Networking Equipment</h1>
              <p className="text-muted-foreground">Routers, switches, modems, and network infrastructure</p>
            </div>
            <ProductGrid category="networking" />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
