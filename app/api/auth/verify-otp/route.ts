import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { user, phoneOtp } from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { createPhoneVerificationToken } from '@/lib/phone-verification';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, otp } = await req.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    const cleanedPhone = phoneNumber.replace(/\D/g, '');

    console.log('Verifying WhatsApp OTP for phone:', cleanedPhone);

    // Get the latest OTP for this phone number
    const otpRecords = await db
      .select()
      .from(phoneOtp)
      .where(eq(phoneOtp.phone, cleanedPhone))
      .orderBy(desc(phoneOtp.createdAt))
      .limit(1);

    if (otpRecords.length === 0) {
      return NextResponse.json(
        { error: 'No OTP found for this phone number. Please request a new OTP.' },
        { status: 400 }
      );
    }

    const otpRecord = otpRecords[0];

    // Check if OTP has expired
    if (new Date() > otpRecord.expires) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Check if max attempts exceeded
    if (otpRecord.attempts >= 5) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify OTP matches
    if (otpRecord.otp !== otp) {
      // Increment attempts
      await db
        .update(phoneOtp)
        .set({ attempts: otpRecord.attempts + 1 })
        .where(eq(phoneOtp.id, otpRecord.id));

      const remainingAttempts = 5 - (otpRecord.attempts + 1);
      return NextResponse.json(
        {
          error: `Invalid OTP. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining.` : 'Too many failed attempts.'}`
        },
        { status: 400 }
      );
    }

    // Delete the used OTP to prevent reuse
    await db.delete(phoneOtp).where(eq(phoneOtp.id, otpRecord.id));

    // New phone numbers don't get an account yet - the customer fills in
    // their details first and the account is created by /api/auth/complete-signup
    const existingUsers = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.phone, cleanedPhone))
      .limit(1);

    return NextResponse.json({
      success: true,
      isNewUser: existingUsers.length === 0,
      verificationToken: createPhoneVerificationToken(cleanedPhone),
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    );
  }
}
