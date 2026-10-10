import { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { product } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://amicocart.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/products/biometric`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/downloads`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Dynamic product pages
  try {
    const products = await db
      .select({
        id: product.id,
        category: product.category,
        updatedAt: product.updatedAt,
      })
      .from(product)
      .where(eq(product.isActive, true))

    const productPages: MetadataRoute.Sitemap = products.map((prod) => ({
      url: `${baseUrl}/products/${encodeURIComponent(prod.category)}/${prod.id}`,
      lastModified: prod.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    return [...staticPages, ...productPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}
