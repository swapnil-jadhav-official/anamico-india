import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verificationToken } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";
import { generateOTPEmail } from "@/lib/email-templates";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const otp = generateOtp();
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + 10);

  try {
    await db
      .delete(verificationToken)
      .where(eq(verificationToken.identifier, email));
    await db.insert(verificationToken).values({
      identifier: email,
      token: hashedOtp,
      expires,
    });

    // Send OTP via email
    try {
      const emailContent = generateOTPEmail(email, otp);
      await sendEmail({
        to: email,
        subject: 'Your Login OTP - Anamico India',
        html: emailContent.html,
        text: emailContent.text,
      });
      console.log(`✅ OTP email sent to ${email}`);
    } catch (emailError) {
      console.error('❌ Failed to send OTP email:', emailError);
      // Still log to console as fallback
      console.log(`OTP for ${email}: ${otp}`);
    }

    // In development, also log to console for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`OTP for ${email}: ${otp}`);
    }

    return NextResponse.json({
      message: "OTP sent successfully",
      email,
      // Only include OTP in response in development mode
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
  } catch (error) {
    console.error("Error saving OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
