import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rdServiceRegistration } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

/**
 * POST /api/rd-service/status
 * Check RD service registration status by registration number and email
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { registrationNumber, email } = body;

    // Validate required fields
    if (!registrationNumber || !email) {
      return NextResponse.json(
        { error: 'Registration number and email are required' },
        { status: 400 }
      );
    }

    // Find registration by registration number and email
    const registrations = await db
      .select()
      .from(rdServiceRegistration)
      .where(
        and(
          eq(rdServiceRegistration.registrationNumber, registrationNumber),
          eq(rdServiceRegistration.email, email)
        )
      )
      .limit(1);

    if (registrations.length === 0) {
      return NextResponse.json(
        { error: 'No registration found with the provided details' },
        { status: 404 }
      );
    }

    const registration = registrations[0];

    // Calculate validity period based on RD support duration
    const validityYears = parseInt(registration.rdSupport);
    const registrationDate = new Date(registration.createdAt);
    const expiryDate = new Date(registrationDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + validityYears);

    // Calculate remaining days
    const today = new Date();
    const remainingDays = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Determine if expired
    const isExpired = remainingDays < 0;
    const isExpiringSoon = remainingDays > 0 && remainingDays <= 30;

    return NextResponse.json({
      success: true,
      registration: {
        registrationNumber: registration.registrationNumber,
        customerName: registration.customerName,
        email: registration.email,
        mobile: registration.mobile,
        deviceName: registration.deviceName,
        deviceModel: registration.deviceModel,
        serialNumber: registration.serialNumber,
        rdSupport: registration.rdSupport,
        amcSupport: registration.amcSupport,
        status: registration.status,
        paymentStatus: registration.paymentStatus,
        registrationDate: registration.createdAt,
        expiryDate: expiryDate.toISOString(),
        validityYears: validityYears,
        remainingDays: Math.max(0, remainingDays),
        isExpired,
        isExpiringSoon,
      },
    });
  } catch (error) {
    console.error('Error checking RD service status:', error);
    return NextResponse.json(
      { error: 'Failed to check registration status' },
      { status: 500 }
    );
  }
}
