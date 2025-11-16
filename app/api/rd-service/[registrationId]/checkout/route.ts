import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { db } from '@/lib/db';
import { rdServiceRegistration } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import {
  createMockOrder,
  generateMockCheckoutOptions,
} from '@/lib/razorpay-mock';
import {
  createRazorpayOrder,
  generateCheckoutOptions,
} from '@/lib/razorpay';

/**
 * POST /api/rd-service/[registrationId]/checkout
 * Create a Razorpay order for RD service payment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { registrationId: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { registrationId } = params;

    // Fetch RD service registration
    const registrations = await db
      .select()
      .from(rdServiceRegistration)
      .where(eq(rdServiceRegistration.id, registrationId))
      .limit(1);

    if (registrations.length === 0) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    const registration = registrations[0];

    // Verify user owns this registration
    if (registration.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const amount = registration.total;

    // Create Razorpay order (real or mock based on credentials)
    let razorpayOrder;
    let checkoutOptions;

    const isRealRazorpay = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
                           !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.includes('mock');

    if (isRealRazorpay) {
      // Use real Razorpay API
      try {
        razorpayOrder = await createRazorpayOrder(
          amount,
          registration.registrationNumber,
          {
            registrationId: registrationId,
            userId: registration.userId,
          }
        );

        checkoutOptions = generateCheckoutOptions(
          razorpayOrder.id,
          amount,
          registration.email,
          registration.customerName
        );
      } catch (error) {
        console.error('Razorpay API error:', error);
        return NextResponse.json(
          { error: 'Failed to initialize payment. Please try again.' },
          { status: 500 }
        );
      }
    } else {
      // Use mock Razorpay for development
      razorpayOrder = createMockOrder(
        amount,
        registration.registrationNumber
      );

      checkoutOptions = generateMockCheckoutOptions(
        razorpayOrder.id,
        amount,
        registration.email,
        registration.customerName
      );
    }

    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      checkoutOptions,
      amount,
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}
