import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verificationToken } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

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

    // For demonstration, we'll log the OTP to the console.
    // In a real application, you would send this via email.
    console.log(`OTP for ${email}: ${otp}`);

    return NextResponse.json({ message: "OTP sent successfully", email, otp });
  } catch (error) {
    console.error("Error saving OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
