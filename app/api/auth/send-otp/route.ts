import { NextRequest, NextResponse } from 'next/server';

const TWOFACTOR_API_KEY = '183f9c86-c93a-11f0-a6b2-0200cd936042';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone number format (10 digits)
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      return NextResponse.json(
        { error: 'Invalid phone number. Please enter a 10-digit number.' },
        { status: 400 }
      );
    }

    console.log('Sending OTP to phone:', cleanedPhone);

    // Send OTP using 2Factor API
    const response = await fetch(
      `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/${cleanedPhone}/AUTOGEN`,
      {
        method: 'GET',
      }
    );

    const data = await response.json();

    console.log('2Factor API response:', data);

    if (data.Status === 'Success') {
      return NextResponse.json({
        success: true,
        sessionId: data.Details,
        message: 'OTP sent successfully',
      });
    } else {
      return NextResponse.json(
        { error: data.Details || 'Failed to send OTP' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
