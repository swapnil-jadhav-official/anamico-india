import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { db } from '@/drizzle/db';
import { banner } from '@/drizzle/schema';
import { eq, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// GET /api/admin/banners - Get all banners (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const placement = searchParams.get('placement');

    let query = db
      .select()
      .from(banner)
      .orderBy(asc(banner.displayOrder), asc(banner.createdAt));

    if (placement) {
      query = db
        .select()
        .from(banner)
        .where(eq(banner.placement, placement))
        .orderBy(asc(banner.displayOrder), asc(banner.createdAt));
    }

    const banners = await query;

    return NextResponse.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

// POST /api/admin/banners - Create new banner (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      placement,
      imageUrl,
      imageUrlMobile,
      linkUrl,
      altText,
      heading,
      subheading,
      ctaText,
      ctaLink,
      textPosition,
      displayOrder,
      isActive,
      startDate,
      endDate,
    } = body;

    // Validate required fields
    if (!title || !placement || !imageUrl) {
      return NextResponse.json(
        { error: 'Title, placement, and imageUrl are required' },
        { status: 400 }
      );
    }

    // Validate placement
    const validPlacements = ['hero', 'top_promo', 'section', 'offer_strip', 'bottom'];
    if (!validPlacements.includes(placement)) {
      return NextResponse.json(
        { error: `Invalid placement. Must be one of: ${validPlacements.join(', ')}` },
        { status: 400 }
      );
    }

    const bannerId = uuidv4();

    await db.insert(banner).values({
      id: bannerId,
      title,
      placement,
      imageUrl,
      imageUrlMobile: imageUrlMobile || null,
      linkUrl: linkUrl || null,
      altText: altText || null,
      heading: heading || null,
      subheading: subheading || null,
      ctaText: ctaText || null,
      ctaLink: ctaLink || null,
      textPosition: textPosition || 'left',
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    });

    const [newBanner] = await db
      .select()
      .from(banner)
      .where(eq(banner.id, bannerId));

    return NextResponse.json(newBanner, { status: 201 });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}
