import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { db } from '@/lib/db';
import { order, orderItem, user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import {
  createMockOrder,
  createMockPayment,
  verifyPaymentSignature as verifyMockPaymentSignature,
  generateMockCheckoutOptions,
} from '@/lib/razorpay-mock';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  generateCheckoutOptions,
  fetchRazorpayPayment,
} from '@/lib/razorpay';
import { sendEmail, sendAdminEmail } from '@/lib/email';
import {
  generatePaymentReceivedEmail,
  generateAdminPaymentReceivedEmail,
  generateOrderConfirmationEmail,
  generateAdminNewOrderEmail
} from '@/lib/email-templates';
import { generateInvoicePDF, getInvoiceFilename, InvoiceData } from '@/lib/invoice-generator';

/**
 * POST /api/payments
 * Create a Razorpay order and return checkout options
 * POST /api/payments/verify
 * Verify payment and update order status
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if this is a verify request
    if (body.razorpayOrderId && body.razorpayPaymentId) {
      return handleVerifyPayment(req, body);
    }

    // Otherwise, create new payment order
    return await handleCreatePayment(req, body);
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}

async function handleCreatePayment(_req: NextRequest, body: any) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId, paymentType } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Fetch order from database
    const orders = await db
      .select()
      .from(order)
      .where(eq(order.id, orderId))
      .limit(1);

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const currentOrder = orders[0];

    // Calculate payment amount based on payment type
    let paymentAmount = 0;
    const paymentTypeStr = String(paymentType);

    if (paymentTypeStr === '30') {
      paymentAmount = Math.round(currentOrder.total * 0.3);
    } else if (paymentTypeStr === '50') {
      paymentAmount = Math.round(currentOrder.total * 0.5);
    } else if (paymentTypeStr === '100') {
      paymentAmount = currentOrder.total;
    } else {
      return NextResponse.json(
        { error: `Invalid payment type: ${paymentType}` },
        { status: 400 }
      );
    }

    // Create Razorpay order (real or mock based on credentials)
    let razorpayOrder;
    let checkoutOptions;

    const isRealRazorpay = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
                           !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.includes('mock');

    if (isRealRazorpay) {
      // Use real Razorpay API
      try {
        razorpayOrder = await createRazorpayOrder(
          paymentAmount,
          currentOrder.orderNumber,
          {
            orderId: orderId,
            userId: currentOrder.userId,
          }
        );

        checkoutOptions = generateCheckoutOptions(
          razorpayOrder.id,
          paymentAmount,
          session.user.email,
          session.user.name || 'Customer'
        );
      } catch (error) {
        console.error('Razorpay API error:', error);
        return NextResponse.json(
          { error: 'Failed to initialize payment. Please try again.' },
          { status: 500 }
        );
      }
    } else {
      // Use mock Razorpay for development
      razorpayOrder = createMockOrder(
        paymentAmount,
        currentOrder.orderNumber
      );

      checkoutOptions = generateMockCheckoutOptions(
        razorpayOrder.id,
        paymentAmount,
        session.user.email,
        session.user.name || 'Customer'
      );
    }

    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      checkoutOptions,
      paymentAmount,
      paymentType,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

async function handleVerifyPayment(_req: NextRequest, body: any) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      orderId: dbOrderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentType,
    } = body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json(
        { error: 'Missing payment details' },
        { status: 400 }
      );
    }

    // Check if using real Razorpay
    const isRealRazorpay = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
                           !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.includes('mock');

    // Verify signature (real or mock based on credentials)
    let isSignatureValid = false;

    if (isRealRazorpay) {
      // Verify with real Razorpay signature
      try {
        isSignatureValid = verifyRazorpaySignature(
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature
        );
      } catch (error) {
        console.error('Signature verification error:', error);
        return NextResponse.json(
          { error: 'Payment verification failed' },
          { status: 400 }
        );
      }
    } else {
      // Use mock verification
      isSignatureValid = verifyMockPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );
    }

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Fetch order to calculate payment amount
    const orders = await db
      .select()
      .from(order)
      .where(eq(order.id, dbOrderId))
      .limit(1);

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const existingOrder = orders[0];

    // Calculate payment amount based on payment type
    let paymentAmount = 0;
    const paymentTypeStr = String(paymentType);

    if (paymentTypeStr === '30') {
      paymentAmount = Math.round(existingOrder.total * 0.3);
    } else if (paymentTypeStr === '50') {
      paymentAmount = Math.round(existingOrder.total * 0.5);
    } else if (paymentTypeStr === '100') {
      paymentAmount = existingOrder.total;
    } else {
      return NextResponse.json(
        { error: `Invalid payment type: ${paymentType}` },
        { status: 400 }
      );
    }

    // Create or fetch payment (real or mock based on credentials)
    let payment;

    if (isRealRazorpay) {
      // Fetch real payment from Razorpay
      try {
        payment = await fetchRazorpayPayment(razorpayPaymentId);
      } catch (error) {
        console.error('Failed to fetch payment details:', error);
        return NextResponse.json(
          { error: 'Failed to verify payment details' },
          { status: 500 }
        );
      }
    } else {
      // Create mock payment
      payment = createMockPayment(razorpayOrderId, paymentAmount);
    }

    // Calculate new payment status
    const newPaidAmount = (existingOrder.paidAmount || 0) + paymentAmount;
    const newPaymentStatus = newPaidAmount >= existingOrder.total ? 'completed' : 'partial_payment';

    // Update order with payment info
    await db
      .update(order)
      .set({
        paidAmount: newPaidAmount,
        paymentStatus: newPaymentStatus,
        status: 'payment_received',
        paymentMethod: isRealRazorpay ? 'razorpay' : 'mock_razorpay',
        paymentId: payment.id,
        updatedAt: new Date(),
      })
      .where(eq(order.id, dbOrderId));

    console.log('Payment recorded and order awaiting admin approval:', dbOrderId);

    // Get customer details for email
    const [customerData] = await db
      .select()
      .from(user)
      .where(eq(user.id, existingOrder.userId));

    // Fetch order items for confirmation email
    const items = await db
      .select()
      .from(orderItem)
      .where(eq(orderItem.orderId, dbOrderId));

    const customerEmail = existingOrder.shippingEmail || customerData?.email || '';
    const customerName = existingOrder.shippingName || customerData?.name || 'Customer';

    // Send order confirmation email to customer with invoice PDF (sent after payment, not at order creation)
    try {
      console.log('🔵 STEP 1: Entering order confirmation email block');

      const orderItemsForEmail = items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      }));

      console.log('🔵 STEP 2: Order items mapped for email');

      const emailContent = generateOrderConfirmationEmail(
        customerName,
        existingOrder.orderNumber,
        orderItemsForEmail,
        existingOrder.subtotal,
        existingOrder.tax,
        existingOrder.total,
        {
          name: existingOrder.shippingName,
          address: existingOrder.shippingAddress,
          city: existingOrder.shippingCity,
          state: existingOrder.shippingState,
          pincode: existingOrder.shippingPincode,
          phone: existingOrder.shippingPhone,
        }
      );

      console.log('🔵 STEP 3: Email content generated');

      // Generate PDF invoice
      console.log('🔵 STEP 4: About to create invoice data object');

      const invoiceData: InvoiceData = {
        orderNumber: existingOrder.orderNumber,
        orderDate: typeof existingOrder.createdAt === 'string' ? new Date(existingOrder.createdAt) : existingOrder.createdAt,
        customerName: existingOrder.shippingName,
        customerEmail: existingOrder.shippingEmail,
        customerPhone: existingOrder.shippingPhone,
        shippingAddress: existingOrder.shippingAddress,
        shippingCity: existingOrder.shippingCity,
        shippingState: existingOrder.shippingState,
        shippingPincode: existingOrder.shippingPincode,
        items: orderItemsForEmail.map(item => ({
          ...item,
          total: item.price * item.quantity,
        })),
        subtotal: existingOrder.subtotal,
        tax: existingOrder.tax,
        total: existingOrder.total,
        paidAmount: paymentAmount,
        dueAmount: existingOrder.total - paymentAmount,
        paymentStatus: newPaymentStatus,
        status: 'payment_received',
        invoiceNumber: `INV-${existingOrder.orderNumber}`,
      };

      console.log('🔵 STEP 5: Invoice data object created, calling generateInvoicePDF()...');

      const pdfBuffer = await generateInvoicePDF(invoiceData);

      console.log('🔵 STEP 6: PDF generated, getting filename...');

      const filename = getInvoiceFilename(existingOrder.orderNumber);

      console.log(`📄 STEP 7: Generated invoice PDF: ${filename}, size: ${pdfBuffer.length} bytes`);

      console.log('🔵 STEP 8: About to send email with attachment...');

      await sendEmail({
        to: customerEmail,
        subject: `Order Confirmation - ${existingOrder.orderNumber}`,
        html: emailContent.html,
        text: emailContent.text,
        attachments: [
          {
            filename,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      console.log(`🔵 STEP 9: ✅ Order confirmation email with invoice PDF sent to ${customerEmail}`);
    } catch (emailError) {
      console.error('❌❌❌ FAILED in order confirmation email block:');
      console.error('Error message:', emailError);
      console.error('Error stack:', emailError instanceof Error ? emailError.stack : 'No stack trace');
      console.error('Error details:', JSON.stringify(emailError, null, 2));
    }

    // Send payment confirmation email to customer with invoice PDF
    try {
      console.log('🟢 PAYMENT STEP 1: Entering payment confirmation email block');

      const emailContent = generatePaymentReceivedEmail(
        customerName,
        existingOrder.orderNumber,
        paymentAmount,
        existingOrder.total,
        newPaymentStatus
      );

      console.log('🟢 PAYMENT STEP 2: Payment email content generated, creating invoice data...');

      // Generate PDF invoice for payment confirmation
      const invoiceData: InvoiceData = {
        orderNumber: existingOrder.orderNumber,
        orderDate: typeof existingOrder.createdAt === 'string' ? new Date(existingOrder.createdAt) : existingOrder.createdAt,
        customerName: existingOrder.shippingName,
        customerEmail: existingOrder.shippingEmail,
        customerPhone: existingOrder.shippingPhone,
        shippingAddress: existingOrder.shippingAddress,
        shippingCity: existingOrder.shippingCity,
        shippingState: existingOrder.shippingState,
        shippingPincode: existingOrder.shippingPincode,
        items: items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        subtotal: existingOrder.subtotal,
        tax: existingOrder.tax,
        total: existingOrder.total,
        paidAmount: paymentAmount,
        dueAmount: existingOrder.total - paymentAmount,
        paymentStatus: newPaymentStatus,
        status: 'payment_received',
        invoiceNumber: `INV-${existingOrder.orderNumber}`,
      };

      console.log('🟢 PAYMENT STEP 3: Calling generateInvoicePDF()...');

      const pdfBuffer = await generateInvoicePDF(invoiceData);

      console.log('🟢 PAYMENT STEP 4: PDF generated, getting filename...');

      const filename = getInvoiceFilename(existingOrder.orderNumber);

      console.log(`📄 PAYMENT STEP 5: Generated payment invoice PDF: ${filename}, size: ${pdfBuffer.length} bytes`);

      console.log('🟢 PAYMENT STEP 6: Sending email with attachment...');

      await sendEmail({
        to: customerEmail,
        subject: `Payment Received - ${existingOrder.orderNumber}`,
        html: emailContent.html,
        text: emailContent.text,
        attachments: [
          {
            filename,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      console.log(`🟢 PAYMENT STEP 7: ✅ Payment confirmation email with invoice PDF sent to ${customerEmail}`);
    } catch (emailError) {
      console.error('❌❌❌ FAILED in payment confirmation email block:');
      console.error('Error message:', emailError);
      console.error('Error stack:', emailError instanceof Error ? emailError.stack : 'No stack trace');
      console.error('Error details:', JSON.stringify(emailError, null, 2));
    }

    // Send new order notification to admin
    try {
      const adminEmailContent = generateAdminNewOrderEmail(
        existingOrder.orderNumber,
        customerName,
        customerEmail,
        existingOrder.total,
        items.length,
        'payment_received'
      );

      await sendAdminEmail(
        `New Order - ${existingOrder.orderNumber}`,
        adminEmailContent.html,
        adminEmailContent.text
      );

      console.log(`✅ Admin order notification sent for order ${existingOrder.orderNumber}`);
    } catch (emailError) {
      console.error('❌ Failed to send admin order notification:', emailError);
    }

    // Send payment notification to admin
    try {
      const adminEmailContent = generateAdminPaymentReceivedEmail(
        existingOrder.orderNumber,
        customerName,
        paymentAmount,
        existingOrder.total,
        newPaymentStatus
      );

      await sendAdminEmail(
        `Payment Received - ${existingOrder.orderNumber}`,
        adminEmailContent.html,
        adminEmailContent.text
      );

      console.log(`✅ Admin payment notification sent for order ${existingOrder.orderNumber}`);
    } catch (emailError) {
      console.error('❌ Failed to send admin payment notification:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        id: payment.id,
        amount: paymentAmount,
        status: isRealRazorpay ? payment.status : 'captured',
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
