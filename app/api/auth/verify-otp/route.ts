import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const TWOFACTOR_API_KEY = '183f9c86-c93a-11f0-a6b2-0200cd936042';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, otp, sessionId } = await req.json();

    if (!phoneNumber || !otp || !sessionId) {
      return NextResponse.json(
        { error: 'Phone number, OTP, and session ID are required' },
        { status: 400 }
      );
    }

    const cleanedPhone = phoneNumber.replace(/\D/g, '');

    console.log('Verifying OTP for phone:', cleanedPhone);

    // Verify OTP using 2Factor API with country code
    const response = await fetch(
      `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/VERIFY/91${cleanedPhone}/${sessionId}/${otp}`,
      {
        method: 'GET',
      }
    );

    const data = await response.json();

    console.log('2Factor verification response:', data);

    if (data.Status !== 'Success') {
      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // OTP verified successfully, check if user exists or create new user
    const existingUsers = await db
      .select()
      .from(user)
      .where(eq(user.phone, cleanedPhone))
      .limit(1);

    let userId;
    let userName;
    let userEmail;

    if (existingUsers.length > 0) {
      // User exists
      userId = existingUsers[0].id;
      userName = existingUsers[0].name;
      userEmail = existingUsers[0].email;
    } else {
      // Create new user with phone number
      userId = nanoid();
      userName = `User ${cleanedPhone.slice(-4)}`;
      userEmail = `${cleanedPhone}@phone.user`; // Placeholder email

      await db.insert(user).values({
        id: userId,
        name: userName,
        email: userEmail,
        phone: cleanedPhone,
        role: 'customer',
        emailVerified: null,
        image: null,
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        name: userName,
        email: userEmail,
        phone: cleanedPhone,
      },
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
