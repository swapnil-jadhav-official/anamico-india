import { ECommerceHeader } from "@/components/e-commerce-header"
import { Hero } from "@/components/hero"
import { ProductCategories } from "@/components/product-categories"
import { FeaturedProducts } from "@/components/featured-products"
import { Services } from "@/components/services"
import { AboutCompany } from "@/components/about-company"
import { WhyChooseUs } from "@/components/why-choose-us"
import { ContactCTA } from "@/components/contact-cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen">
      <ECommerceHeader />
      <main>
        <Hero />
        <ProductCategories />
        <FeaturedProducts />
        <Services />
        <AboutCompany />
        <WhyChooseUs />
        <ContactCTA />
      </main>
      <Footer />
    </div>
  )
}
