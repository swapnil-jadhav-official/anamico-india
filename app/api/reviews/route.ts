import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productReview } from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reviews?productId=xxx
 * Fetch reviews for a product
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Only show approved reviews to public, admins can see all
    const session = await getServerSession(authConfig);
    const isAdmin = session?.user?.id && session.user.role === 'admin';

    const whereConditions = isAdmin
      ? eq(productReview.productId, productId)
      : and(
          eq(productReview.productId, productId),
          eq(productReview.isApproved, true)
        );

    const reviews = await db
      .select()
      .from(productReview)
      .where(whereConditions)
      .orderBy(desc(productReview.createdAt));

    // Calculate average rating
    const allReviews = await db
      .select()
      .from(productReview)
      .where(
        and(
          eq(productReview.productId, productId),
          eq(productReview.isApproved, true)
        )
      );

    const avgRating = allReviews.length > 0
      ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
      : 0;

    return NextResponse.json({
      reviews,
      averageRating: parseFloat(avgRating as string),
      totalReviews: allReviews.length,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews
 * Submit a new review
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to submit a review' },
        { status: 401 }
      );
    }

    const { productId, rating, title, comment } = await req.json();

    // Validation
    if (!productId || !rating || !title) {
      return NextResponse.json(
        { error: 'Product ID, rating, and title are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    if (title.length < 3 || title.length > 255) {
      return NextResponse.json(
        { error: 'Title must be between 3 and 255 characters' },
        { status: 400 }
      );
    }

    if (comment && comment.length > 5000) {
      return NextResponse.json(
        { error: 'Comment cannot exceed 5000 characters' },
        { status: 400 }
      );
    }

    // Check if user already has a review for this product
    const existingReview = await db
      .select()
      .from(productReview)
      .where(
        and(
          eq(productReview.productId, productId),
          eq(productReview.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingReview.length > 0) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 409 }
      );
    }

    const reviewId = crypto.randomUUID();
    const newReview = {
      id: reviewId,
      productId,
      userId: session.user.id,
      rating,
      title,
      comment: comment || null,
      isApproved: false, // Requires moderation
      helpfulCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(productReview).values(newReview);

    return NextResponse.json(
      {
        success: true,
        message: 'Review submitted successfully. It will be visible after approval.',
        review: newReview,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
