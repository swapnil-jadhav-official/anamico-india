import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { db } from '@/lib/db';
import { banner } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

// GET /api/admin/banners/[bannerId] - Get single banner
export async function GET(
  req: NextRequest,
  { params }: { params: { bannerId: string } }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { bannerId } = params;

    const [bannerData] = await db
      .select()
      .from(banner)
      .where(eq(banner.id, bannerId));

    if (!bannerData) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json(bannerData);
  } catch (error) {
    console.error('Error fetching banner:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banner' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/banners/[bannerId] - Update banner
export async function PATCH(
  req: NextRequest,
  { params }: { params: { bannerId: string } }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { bannerId } = params;
    const body = await req.json();

    // Check if banner exists
    const [existingBanner] = await db
      .select()
      .from(banner)
      .where(eq(banner.id, bannerId));

    if (!existingBanner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    // Validate placement if provided
    if (body.placement) {
      const validPlacements = ['hero', 'top_promo', 'section', 'offer_strip', 'bottom'];
      if (!validPlacements.includes(body.placement)) {
        return NextResponse.json(
          { error: `Invalid placement. Must be one of: ${validPlacements.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.placement !== undefined) updateData.placement = body.placement;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.imageUrlMobile !== undefined) updateData.imageUrlMobile = body.imageUrlMobile || null;
    if (body.linkUrl !== undefined) updateData.linkUrl = body.linkUrl || null;
    if (body.altText !== undefined) updateData.altText = body.altText || null;
    if (body.heading !== undefined) updateData.heading = body.heading || null;
    if (body.subheading !== undefined) updateData.subheading = body.subheading || null;
    if (body.ctaText !== undefined) updateData.ctaText = body.ctaText || null;
    if (body.ctaLink !== undefined) updateData.ctaLink = body.ctaLink || null;
    if (body.textPosition !== undefined) updateData.textPosition = body.textPosition;
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null;

    await db
      .update(banner)
      .set(updateData)
      .where(eq(banner.id, bannerId));

    const [updatedBanner] = await db
      .select()
      .from(banner)
      .where(eq(banner.id, bannerId));

    return NextResponse.json(updatedBanner);
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/banners/[bannerId] - Delete banner
export async function DELETE(
  req: NextRequest,
  { params }: { params: { bannerId: string } }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { bannerId } = params;

    // Check if banner exists
    const [existingBanner] = await db
      .select()
      .from(banner)
      .where(eq(banner.id, bannerId));

    if (!existingBanner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    await db.delete(banner).where(eq(banner.id, bannerId));

    return NextResponse.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
