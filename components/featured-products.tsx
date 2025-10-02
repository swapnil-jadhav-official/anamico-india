import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart } from "lucide-react"

const products = [
  {
    name: "Mantra MFS 110",
    category: "Fingerprint Scanner",
    image: "/mantra-fingerprint-scanner.jpg",
    rating: 4.8,
    reviews: 245,
    price: "₹2,499",
    badge: "Best Seller",
  },
  {
    name: "Morpho MSO 1300 E3",
    category: "Fingerprint Scanner",
    image: "/morpho-biometric-device.jpg",
    rating: 4.9,
    reviews: 189,
    price: "₹3,299",
    badge: "UIDAI Certified",
  },
  {
    name: "Mantra MIS100 V2",
    category: "IRIS Scanner",
    image: "/iris-scanner-biometric.jpg",
    rating: 4.7,
    reviews: 156,
    price: "₹8,999",
    badge: "Premium",
  },
  {
    name: "Startek FM 220U L1",
    category: "Fingerprint Scanner",
    image: "/startek-fingerprint-device.jpg",
    rating: 4.9,
    reviews: 98,
    price: "₹2,799",
    badge: "New Arrival",
  },
  {
    name: "Cogent CSD200",
    category: "Fingerprint Scanner",
    image: "/cogent-fingerprint-scanner.jpg",
    rating: 4.8,
    reviews: 134,
    price: "₹3,499",
    badge: "L1 Certified",
  },
  {
    name: "Aratek A600",
    category: "Fingerprint Scanner",
    image: "/aratek-biometric-scanner.jpg",
    rating: 4.7,
    reviews: 112,
    price: "₹2,899",
    badge: "Popular",
  },
  {
    name: "CMITech BMT 20 Iris",
    category: "Dual IRIS Scanner",
    image: "/dual-iris-scanner.jpg",
    rating: 4.9,
    reviews: 87,
    price: "₹12,999",
    badge: "Advanced",
  },
  {
    name: "Suprema Realscan 4G",
    category: "L1 Fingerprint Scanner",
    image: "/suprema-fingerprint-device.jpg",
    rating: 4.9,
    reviews: 156,
    price: "₹4,999",
    badge: "Premium",
  },
]

export function FeaturedProducts() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Featured Products</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            UIDAI certified biometric devices trusted by thousands of businesses across India
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.name} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-3 right-3">{product.badge}</Badge>
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">{product.category}</div>
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
                </div>
                <div className="text-2xl font-bold text-primary">{product.price}</div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  )
}
