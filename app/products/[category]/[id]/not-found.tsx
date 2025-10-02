import { ECommerceHeader } from "@/components/e-commerce-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PackageX } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <ECommerceHeader />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center py-12">
          <PackageX className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist</p>
          <Button asChild>
            <Link href="/products">Browse All Products</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
