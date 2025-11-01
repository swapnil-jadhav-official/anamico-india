import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cartItem, product } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    // If not authenticated, return empty cart (client will use localStorage)
    if (!session?.user?.id) {
      return NextResponse.json([]);
    }

    // Fetch cart items
    const userCartItems = await db
      .select()
      .from(cartItem)
      .where(eq(cartItem.userId, session.user.id));

    // Fetch product details for each cart item
    const itemsWithProducts = await Promise.all(
      userCartItems.map(async (item: any) => {
        const prod = await db
          .select()
          .from(product)
          .where(eq(product.id, item.productId))
          .limit(1);

        const productData = prod[0];
        if (!productData) {
          return null; // Skip items with missing products
        }
        return {
          id: productData.id,
          name: productData.name,
          imageUrl: productData.imageUrl,
          category: productData.category,
          salePrice: productData.salePrice,
          regularPrice: productData.regularPrice,
          quantity: item.quantity,
          price: item.price,
          cartItemId: item.id,
          description: productData.description || '',
        };
      })
    );

    // Filter out null items
    const validItems = itemsWithProducts.filter((item) => item !== null);
    return NextResponse.json(validItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      console.error('No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Add to cart request body:', body);

    const { productId, quantity = 1, price } = body;

    if (!productId || price === undefined || price === null) {
      console.error('Missing productId or price:', { productId, price });
      return NextResponse.json(
        { error: `Product ID and price are required. Got: productId=${productId}, price=${price}` },
        { status: 400 }
      );
    }

    console.log('Adding to cart:', { userId: session.user.id, productId, quantity, price });

    // Check if item already in cart
    const existingItem = await db
      .select()
      .from(cartItem)
      .where(
        and(
          eq(cartItem.userId, session.user.id),
          eq(cartItem.productId, productId)
        )
      );

    if (existingItem.length > 0) {
      // Update quantity if item exists
      const newQuantity = existingItem[0].quantity + quantity;
      console.log('Updating existing cart item, new quantity:', newQuantity);
      await db
        .update(cartItem)
        .set({ quantity: newQuantity })
        .where(eq(cartItem.id, existingItem[0].id));

      return NextResponse.json(
        { message: 'Cart item updated', item: existingItem[0] },
        { status: 200 }
      );
    }

    // Add new item to cart
    const newItem = {
      id: uuidv4(),
      userId: session.user.id,
      productId,
      quantity,
      price,
    };

    console.log('Inserting new cart item:', newItem);
    await db.insert(cartItem).values(newItem);

    console.log('Item added successfully');
    return NextResponse.json(
      { message: 'Item added to cart', item: newItem },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding to cart:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to add to cart: ${errorMessage}` }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, quantity } = await req.json();

    if (!id || quantity === undefined) {
      return NextResponse.json(
        { error: 'Item ID and quantity are required' },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be at least 1' },
        { status: 400 }
      );
    }

    await db
      .update(cartItem)
      .set({ quantity })
      .where(
        and(
          eq(cartItem.id, id),
          eq(cartItem.userId, session.user.id)
        )
      );

    return NextResponse.json(
      { message: 'Cart item updated' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    await db
      .delete(cartItem)
      .where(
        and(
          eq(cartItem.id, itemId),
          eq(cartItem.userId, session.user.id)
        )
      );

    return NextResponse.json(
      { message: 'Item removed from cart' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}
