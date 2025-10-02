"use client"

import { ECommerceHeader } from "@/components/e-commerce-header"
import { Footer } from "@/components/footer"
import { getProductById, getProductsByCategory } from "@/lib/products"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"
import { Star, ShoppingCart, Heart, Truck, Shield, RefreshCw, Phone } from "lucide-react"
import { useState } from "react"
import { ProductCard } from "@/components/product-card"
import { notFound } from "next/navigation"

export default function ProductDetailPage({ params }: { params: { category: string; id: string } }) {
  const product = getProductById(params.id)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)

  if (!product) {
    notFound()
  }

  const isWishlisted = isInWishlist(product.id)
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const relatedProducts = getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4)

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} added to your cart.`,
    })
  }

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id)
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      })
    } else {
      addToWishlist(product)
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ECommerceHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary">
              Products
            </Link>
            <span>/</span>
            <Link href={`/products/${product.category}`} className="hover:text-primary capitalize">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          {/* Product Details */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Product Image */}
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              {product.badge && <Badge className="absolute top-4 left-4 bg-primary">{product.badge}</Badge>}
              {discount > 0 && <Badge className="absolute top-4 right-4 bg-destructive">{discount}% OFF</Badge>}
              {!product.inStock && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Badge variant="secondary" className="text-lg py-2 px-4">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              <p className="text-muted-foreground mb-6">{product.description}</p>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-4xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-2xl text-muted-foreground line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                    <Badge variant="destructive" className="text-base">
                      Save {discount}%
                    </Badge>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 mb-6">
                <Badge variant={product.inStock ? "default" : "secondary"}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </Badge>
                <span className="text-sm text-muted-foreground">GST Included</span>
              </div>

              <Separator className="my-6" />

              {/* Quantity and Actions */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Quantity:</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={!product.inStock}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={!product.inStock}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1" size="lg" disabled={!product.inStock} onClick={handleAddToCart}>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant={isWishlisted ? "default" : "outline"}
                    size="lg"
                    className="px-6"
                    onClick={handleWishlistToggle}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                  </Button>
                </div>

                <Button variant="outline" size="lg" className="w-full bg-transparent" disabled={!product.inStock}>
                  Buy Now
                </Button>
              </div>

              <Separator className="my-6" />

              {/* Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Free Shipping</p>
                    <p className="text-xs text-muted-foreground">On all orders</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Warranty</p>
                    <p className="text-xs text-muted-foreground">1 Year warranty</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RefreshCw className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Easy Returns</p>
                    <p className="text-xs text-muted-foreground">7 Days return policy</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Support</p>
                    <p className="text-xs text-muted-foreground">24/7 customer support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <Card className="mb-16">
            <CardContent className="p-6">
              <Tabs defaultValue="description">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="specifications">Specifications</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="mt-6">
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold mb-4">Product Description</h3>
                    <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                    <h4 className="text-base font-semibold mt-6 mb-3">Key Features:</h4>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>UIDAI Certified for Aadhaar authentication</li>
                      <li>High-quality optical sensor for accurate readings</li>
                      <li>USB plug-and-play connectivity</li>
                      <li>Compatible with Windows, Linux, and Android</li>
                      <li>Durable construction for long-lasting performance</li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="specifications" className="mt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
                      <dl className="space-y-3">
                        <div className="flex justify-between py-2 border-b">
                          <dt className="text-muted-foreground">Brand</dt>
                          <dd className="font-medium">ANAMICO</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <dt className="text-muted-foreground">Model</dt>
                          <dd className="font-medium">{product.id}</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <dt className="text-muted-foreground">Category</dt>
                          <dd className="font-medium capitalize">{product.category}</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <dt className="text-muted-foreground">Connectivity</dt>
                          <dd className="font-medium">USB 2.0</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <dt className="text-muted-foreground">Warranty</dt>
                          <dd className="font-medium">1 Year</dd>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Package Contents</h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>• 1x {product.name}</li>
                        <li>• 1x USB Cable</li>
                        <li>• 1x User Manual</li>
                        <li>• 1x Warranty Card</li>
                        <li>• 1x Driver CD</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="reviews" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="text-5xl font-bold mb-2">{product.rating}</div>
                        <div className="flex items-center gap-1 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(product.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-muted text-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">{product.reviews} reviews</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-muted-foreground">
                          Customer reviews help you choose the right product. Share your experience to help others.
                        </p>
                        <Button variant="outline" className="mt-4 bg-transparent">
                          Write a Review
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Related Products</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
