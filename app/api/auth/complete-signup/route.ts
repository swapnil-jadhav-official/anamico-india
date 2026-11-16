import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { isValidPhoneVerificationToken } from '@/lib/phone-verification';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, verificationToken, name, email, address } = await req.json();

    const cleanedPhone = String(phoneNumber || '').replace(/\D/g, '');

    if (!isValidPhoneVerificationToken(cleanedPhone, verificationToken)) {
      return NextResponse.json(
        { error: 'Your verification has expired. Please request a new OTP.' },
        { status: 401 }
      );
    }

    const trimmedName = String(name || '').trim();
    if (trimmedName.length < 2) {
      return NextResponse.json(
        { error: 'Please enter your full name' },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email || '').trim().toLowerCase();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (trimmedEmail) {
      const emailOwners = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, trimmedEmail))
        .limit(1);

      if (emailOwners.length > 0) {
        return NextResponse.json(
          { error: 'This email is already registered. Please log in with email instead.' },
          { status: 409 }
        );
      }
    }

    // The account may already exist if the form was submitted twice
    const existingUsers = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.phone, cleanedPhone))
      .limit(1);

    if (existingUsers.length === 0) {
      await db.insert(user).values({
        id: nanoid(),
        name: trimmedName,
        email: trimmedEmail || `${cleanedPhone}@phone.user`, // Placeholder when no email given
        phone: cleanedPhone,
        address: String(address || '').trim() || null,
        role: 'customer',
        emailVerified: null,
        image: null,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error completing signup:', error);
    return NextResponse.json(
      { error: 'Failed to create your account. Please try again.' },
      { status: 500 }
    );
  }
}
