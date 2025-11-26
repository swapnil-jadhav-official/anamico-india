import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productReview } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/reviews
 * Fetch all reviews for moderation (admin only)
 */
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
    const approved = searchParams.get('approved');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = db.select().from(productReview);

    if (approved === 'true') {
      query = query.where(eq(productReview.isApproved, true));
    } else if (approved === 'false') {
      query = query.where(eq(productReview.isApproved, false));
    }

    const reviews = await query
      .orderBy(desc(productReview.createdAt))
      .limit(limit)
      .offset(offset);

    const totalQuery = db.select().from(productReview);
    let countQuery = totalQuery;
    if (approved === 'true') {
      countQuery = countQuery.where(eq(productReview.isApproved, true));
    } else if (approved === 'false') {
      countQuery = countQuery.where(eq(productReview.isApproved, false));
    }
    const total = await countQuery;

    return NextResponse.json({
      reviews,
      total: total.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
