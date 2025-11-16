import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rdServiceRegistration } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { sendEmail, sendAdminEmail } from '@/lib/email';
import {
  generateRDServiceConfirmationEmail,
  generateAdminRDServiceNotification,
} from '@/lib/rd-email-templates';

/**
 * POST /api/rd-service/[registrationId]/payment
 * Record payment for RD service registration
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { registrationId: string } }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { registrationId } = params;
    const body = await req.json();
    const { razorpayPaymentId, razorpayOrderId, amount } = body;

    console.log('Recording payment for RD service registration:', {
      registrationId,
      razorpayPaymentId,
      amount,
    });

    // Fetch registration from database
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
        { error: 'Unauthorized - registration does not belong to you' },
        { status: 403 }
      );
    }

    // Update registration with payment info
    await db
      .update(rdServiceRegistration)
      .set({
        paidAmount: amount,
        paymentStatus: 'completed',
        status: 'payment_received',
        paymentMethod: 'razorpay',
        paymentId: razorpayPaymentId,
      })
      .where(eq(rdServiceRegistration.id, registrationId));

    console.log('Payment recorded successfully for registration:', registrationId);

    // Send confirmation email to customer
    try {
      const confirmationEmail = generateRDServiceConfirmationEmail(
        registration.customerName,
        registration.email,
        registration.registrationNumber,
        {
          deviceName: registration.deviceName,
          deviceModel: registration.deviceModel,
          serialNumber: registration.serialNumber,
          rdSupport: registration.rdSupport,
          amcSupport: registration.amcSupport || 'None',
          deliveryType: registration.deliveryType,
        },
        {
          deviceFee: registration.deviceFee,
          supportFee: registration.supportFee,
          deliveryFee: registration.deliveryFee,
          subtotal: registration.subtotal,
          gst: registration.gst,
          total: registration.total,
        },
        {
          name: registration.customerName,
          mobile: registration.mobile,
          address: registration.address,
          city: registration.district,
          state: registration.state,
          pincode: registration.pincode,
        }
      );

      await sendEmail({
        to: registration.email,
        subject: 'RD Service Registration Confirmation',
        html: confirmationEmail.html,
        text: confirmationEmail.text,
      });

      console.log('✅ RD service confirmation email sent to:', registration.email);
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    // Send notification email to admin
    try {
      const adminEmail = generateAdminRDServiceNotification(
        registration.registrationNumber,
        registration.customerName,
        registration.email,
        registration.mobile,
        {
          deviceName: registration.deviceName,
          deviceModel: registration.deviceModel,
          serialNumber: registration.serialNumber,
        },
        registration.total,
        amount
      );

      await sendAdminEmail(
        'New RD Service Registration',
        adminEmail.html,
        adminEmail.text
      );

      console.log('✅ Admin notification email sent for registration:', registration.registrationNumber);
    } catch (emailError) {
      console.error('❌ Failed to send admin notification email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Payment recorded successfully',
      registration: {
        id: registration.id,
        registrationNumber: registration.registrationNumber,
        status: 'payment_received',
        paymentStatus: 'completed',
      },
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}
