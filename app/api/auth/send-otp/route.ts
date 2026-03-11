import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { phoneOtp } from '@/drizzle/schema';
import { nanoid } from 'nanoid';

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

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration

    console.log('Generating OTP for phone:', cleanedPhone);

    // Store OTP in database
    await db.insert(phoneOtp).values({
      id: nanoid(),
      phone: cleanedPhone,
      otp: otp,
      expires: expiresAt,
      attempts: 0,
    });

    // Send OTP via BhashSMS WhatsApp Authentication Messages
    const whatsappApiUrl = process.env.BHASMSMS_API_URL || 'https://bhashsms.com/api/sendmsgutil.php';
    const userId = process.env.BHASMSMS_USER_ID;
    const password = process.env.BHASMSMS_PASSWORD;
    const senderName = process.env.BHASMSMS_SENDER_NAME || 'BUZWAP';
    const templateText = process.env.BHASMSMS_TEMPLATE_TEXT || 'anamicoindia_authentication_01';

    if (!userId || !password) {
      throw new Error('BhashSMS credentials are not configured');
    }

    // Build WhatsApp Authentication Message API URL using template
    // API: https://bhashsms.com/api/sendmsgutil.php?user=...&pass=...&sender=SENDER_NAME&phone=Mobile No&text=TEMPLATE_ID&priority=wa&stype=auth&Params=OTP_VALUE
    const whatsappUrl = new URL(whatsappApiUrl);
    whatsappUrl.searchParams.append('user', userId);
    whatsappUrl.searchParams.append('pass', password);
    whatsappUrl.searchParams.append('sender', senderName);
    whatsappUrl.searchParams.append('phone', cleanedPhone);
    whatsappUrl.searchParams.append('text', templateText); // Use template identifier
    whatsappUrl.searchParams.append('priority', 'wa');
    whatsappUrl.searchParams.append('stype', 'auth');
    whatsappUrl.searchParams.append('Params', otp); // OTP value goes in Params

    const whatsappUrlString = whatsappUrl.toString();
    console.log('BhashSMS API URL:', whatsappUrlString);

    const whatsappResponse = await fetch(whatsappUrlString, {
      method: 'GET',
    });

    const whatsappData = await whatsappResponse.text();
    console.log('BhashSMS WhatsApp API response:', whatsappData);

    // Check for insufficient credits error
    if (whatsappData.includes('No Sufficient Credits') || whatsappData.includes('insufficient')) {
      console.error('BhashSMS: Insufficient WA Utility Credits');
      return NextResponse.json(
        {
          error: 'WhatsApp service temporarily unavailable. Please contact support to add more WA Utility Credits.',
          code: 'INSUFFICIENT_CREDITS'
        },
        { status: 503 }
      );
    }

    if (!whatsappResponse.ok) {
      console.error('Failed to send WhatsApp OTP via BhashSMS:', whatsappData);
      return NextResponse.json(
        { error: 'Failed to send OTP. Please try again.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
