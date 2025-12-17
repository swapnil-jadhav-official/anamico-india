import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { product } from '@/drizzle/schema';
import crypto from 'crypto';

export async function GET() {
  try {
    const products = await db.select().from(product);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { name, brand, description, features, regularPrice, salePrice, sku, stock, availability, technicalSpecifications, hardwareSpecifications, options, category, imageUrl, galleryImages, taxPercentage } = await req.json();

  if (!name || !category) {
    return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
  }

  try {
    const newProduct = await db.insert(product).values({
      id: crypto.randomUUID(),
      name,
      brand,
      description,
      features: features ? JSON.stringify(features) : null,
      regularPrice: regularPrice ? parseInt(regularPrice) : null,
      salePrice: salePrice ? parseInt(salePrice) : null,
      sku,
      stock: stock ? parseInt(stock) : null,
      availability,
      technicalSpecifications: technicalSpecifications ? JSON.stringify(technicalSpecifications) : null,
      hardwareSpecifications: hardwareSpecifications ? JSON.stringify(hardwareSpecifications) : null,
      options: options ? JSON.stringify(options) : null,
      price: regularPrice ? parseInt(regularPrice) : 0, // Assuming regularPrice is the main price
      taxPercentage: taxPercentage ? parseInt(taxPercentage) : 18, // Default to 18% if not provided
      category,
      imageUrl,
      galleryImages: galleryImages ? JSON.stringify(galleryImages) : JSON.stringify([]),
      isActive: true, // New products are active by default
    });

    return NextResponse.json({ message: 'Product created successfully', product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
