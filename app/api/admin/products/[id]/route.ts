import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { product } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    await db.delete(product).where(eq(product.id, id));
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { name, brand, description, features, regularPrice, salePrice, sku, stock, availability, technicalSpecifications, hardwareSpecifications, options, category, imageUrl, galleryImages, isActive } = await req.json();

  if (!name || !category) {
    return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
  }

  try {
    await db.update(product).set({
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
      category,
      imageUrl,
      galleryImages: galleryImages ? JSON.stringify(galleryImages) : JSON.stringify([]),
      isActive,
    }).where(eq(product.id, id));

    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { isActive } = await req.json();

  if (typeof isActive !== 'boolean') {
    return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 400 });
  }

  try {
    await db.update(product).set({ isActive }).where(eq(product.id, id));
    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
