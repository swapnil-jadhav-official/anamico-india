import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { banner } from '@/drizzle/schema';
import { eq, and, lte, gte, or, isNull, asc } from 'drizzle-orm';

// GET /api/banners - Get active banners for public display
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placement = searchParams.get('placement');

    const now = new Date();

    // Build query for active banners within date range
    let query = db
      .select()
      .from(banner)
      .where(
        and(
          eq(banner.isActive, true),
          or(
            isNull(banner.startDate),
            lte(banner.startDate, now)
          ),
          or(
            isNull(banner.endDate),
            gte(banner.endDate, now)
          )
        )
      )
      .orderBy(asc(banner.displayOrder));

    // Filter by placement if specified
    if (placement) {
      query = db
        .select()
        .from(banner)
        .where(
          and(
            eq(banner.placement, placement),
            eq(banner.isActive, true),
            or(
              isNull(banner.startDate),
              lte(banner.startDate, now)
            ),
            or(
              isNull(banner.endDate),
              gte(banner.endDate, now)
            )
          )
        )
        .orderBy(asc(banner.displayOrder));
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
