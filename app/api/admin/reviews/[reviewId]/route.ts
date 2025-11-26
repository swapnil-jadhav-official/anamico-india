import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productReview } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/reviews/[reviewId]
 * Approve or update a review
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { isApproved } = await req.json();

    if (typeof isApproved !== 'boolean') {
      return NextResponse.json(
        { error: 'isApproved must be a boolean' },
        { status: 400 }
      );
    }

    await db
      .update(productReview)
      .set({ isApproved })
      .where(eq(productReview.id, params.reviewId));

    return NextResponse.json({
      success: true,
      message: isApproved ? 'Review approved' : 'Review rejected',
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reviews/[reviewId]
 * Delete a review
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await db.delete(productReview).where(eq(productReview.id, params.reviewId));

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
