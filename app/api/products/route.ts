import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { product } from '@/drizzle/schema';
import { eq, and, or, like, SQL } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const conditions: SQL<unknown>[] = [eq(product.isActive, true)];

    if (category) {
      conditions.push(eq(product.category, category));
    }

    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          like(product.name, searchTerm),
          like(product.description, searchTerm),
          like(product.brand, searchTerm),
          like(product.category, searchTerm)
        )!
      );
    }

    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

    const products = await db.select().from(product).where(whereCondition);

    // Transform database products to match frontend Product interface
    const transformedProducts = products.map((prod: any) => ({
      id: prod.id,
      name: prod.name,
      description: prod.description,
      price: prod.salePrice || prod.price,
      originalPrice: prod.regularPrice,
      image: prod.imageUrl || null,
      category: prod.category,
      rating: 4.5, // Default rating - you can add this to schema if needed
      reviews: 0, // Default reviews - you can add this to schema if needed
      inStock: prod.stock > 0,
      featured: false,
      badge: undefined,
      // Additional fields for detail page
      brand: prod.brand,
      features: prod.features ? JSON.parse(prod.features) : [],
      technicalSpecifications: prod.technicalSpecifications
        ? JSON.parse(prod.technicalSpecifications)
        : [],
      hardwareSpecifications: prod.hardwareSpecifications
        ? JSON.parse(prod.hardwareSpecifications)
        : [],
      galleryImages: prod.galleryImages ? JSON.parse(prod.galleryImages) : [],
      stock: prod.stock,
      sku: prod.sku,
    }));

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
