import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rdServiceRegistration } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// Generate unique registration number
function generateRegistrationNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RD-${timestamp}${random}`;
}

/**
 * POST /api/rd-service
 * Create a new RD service registration
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { formData, pricing } = body;

    // Validate required fields
    if (!formData || !pricing) {
      return NextResponse.json(
        { error: 'Missing required fields: formData, pricing' },
        { status: 400 }
      );
    }

    // Validate form data
    const {
      email,
      customerName,
      mobile,
      address,
      state,
      district,
      pincode,
      deviceName,
      deviceModel,
      serialNumber,
      gstNumber,
      rdSupport,
      amcSupport,
      callbackService,
      deliveryType,
    } = formData;

    if (
      !email ||
      !customerName ||
      !mobile ||
      !address ||
      !state ||
      !district ||
      !pincode ||
      !deviceName ||
      !deviceModel ||
      !serialNumber ||
      !rdSupport ||
      !deliveryType
    ) {
      return NextResponse.json(
        { error: 'Incomplete registration information' },
        { status: 400 }
      );
    }

    const registrationId = uuidv4();
    const registrationNumber = generateRegistrationNumber();

    console.log('Creating RD service registration:', {
      registrationId,
      registrationNumber,
      userId: session.user.id,
      deviceName,
      deviceModel,
      total: pricing.total,
    });

    // Create RD service registration with status 'pending' - waiting for payment
    await db.insert(rdServiceRegistration).values({
      id: registrationId,
      userId: session.user.id,
      registrationNumber,
      email,
      customerName,
      mobile,
      address,
      state,
      district,
      pincode,
      deviceName,
      deviceModel,
      serialNumber,
      gstNumber: gstNumber || null,
      rdSupport,
      amcSupport: amcSupport || null,
      callbackService: callbackService || false,
      deliveryType,
      deviceFee: pricing.deviceFee,
      supportFee: pricing.supportFee,
      deliveryFee: pricing.deliveryFee,
      subtotal: pricing.subtotal,
      gst: pricing.gst,
      total: pricing.total,
      status: 'pending', // Initial status
      paymentStatus: 'pending', // Waiting for payment
      paidAmount: 0,
    });

    console.log('RD service registration created successfully:', registrationId);

    return NextResponse.json({
      success: true,
      registrationId,
      registrationNumber,
      registrationData: {
        id: registrationId,
        registrationNumber,
        customerName,
        email,
        deviceName,
        deviceModel,
        total: pricing.total,
        status: 'pending',
      },
    });
  } catch (error) {
    console.error('Error creating RD service registration:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create registration: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/rd-service
 * Fetch user's RD service registrations
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const registrations = await db
      .select()
      .from(rdServiceRegistration)
      .where(eq(rdServiceRegistration.userId, session.user.id));

    return NextResponse.json({
      success: true,
      registrations,
    });
  } catch (error) {
    console.error('Error fetching RD service registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}
