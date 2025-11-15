// Base Email Template
const emailWrapper = (content: string, title: string = 'Anamico India') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 30px 20px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6c757d;
      border-top: 1px solid #e9ecef;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: 600;
    }
    .button:hover {
      background-color: #5568d3;
    }
    .otp-code {
      background-color: #f8f9fa;
      border: 2px dashed #667eea;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 8px;
      margin: 20px 0;
      color: #667eea;
    }
    .info-box {
      background-color: #e7f3ff;
      border-left: 4px solid #2196F3;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .warning-box {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .success-box {
      background-color: #d4edda;
      border-left: 4px solid #28a745;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .danger-box {
      background-color: #f8d7da;
      border-left: 4px solid #dc3545;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }
    th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    .tracking-number {
      font-size: 20px;
      font-weight: bold;
      color: #667eea;
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 5px;
      display: inline-block;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛒 Anamico India</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>Anamico India</strong></p>
      <p>Your trusted partner for quality products</p>
      <p>
        Email: pardeeps@anamicoindia.com<br>
        Website: <a href="https://anamicoindia.com">anamicoindia.com</a>
      </p>
      <p style="margin-top: 15px; font-size: 11px;">
        This is an automated email. Please do not reply to this message.
      </p>
    </div>
  </div>
</body>
</html>
`;

// ==================== AUTHENTICATION EMAILS ====================

export function generateOTPEmail(email: string, otp: string): { html: string; text: string } {
  const html = emailWrapper(`
    <h2>Your Login OTP</h2>
    <p>Hello,</p>
    <p>You requested to log in to your Anamico India account. Please use the following OTP code:</p>

    <div class="otp-code">${otp}</div>

    <div class="warning-box">
      <p><strong>⏰ Important:</strong> This OTP will expire in <strong>10 minutes</strong></p>
    </div>

    <p>If you didn't request this code, please ignore this email or contact support if you have concerns.</p>

    <p>Best regards,<br>Anamico India Team</p>
  `, 'Login OTP - Anamico India');

  const text = `
Your Login OTP - Anamico India

Hello,

You requested to log in to your Anamico India account. Please use the following OTP code:

OTP: ${otp}

⏰ Important: This OTP will expire in 10 minutes

If you didn't request this code, please ignore this email or contact support if you have concerns.

Best regards,
Anamico India Team
  `;

  return { html, text };
}

export function generateWelcomeEmail(name: string, email: string): { html: string; text: string } {
  const html = emailWrapper(`
    <h2>Welcome to Anamico India! 🎉</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Thank you for registering with Anamico India! We're excited to have you as part of our community.</p>

    <div class="success-box">
      <p>✅ Your account has been successfully created</p>
      <p>📧 Email: <strong>${email}</strong></p>
    </div>

    <p>Here's what you can do now:</p>
    <ul>
      <li>Browse our extensive product catalog</li>
      <li>Add items to your cart and place orders</li>
      <li>Track your orders in real-time</li>
      <li>Manage your profile and preferences</li>
    </ul>

    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/products" class="button">Start Shopping</a>

    <p>If you have any questions, feel free to reach out to our support team.</p>

    <p>Best regards,<br>Anamico India Team</p>
  `, 'Welcome to Anamico India');

  const text = `
Welcome to Anamico India! 🎉

Hello ${name},

Thank you for registering with Anamico India! We're excited to have you as part of our community.

✅ Your account has been successfully created
📧 Email: ${email}

Here's what you can do now:
- Browse our extensive product catalog
- Add items to your cart and place orders
- Track your orders in real-time
- Manage your profile and preferences

Visit: ${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/products

If you have any questions, feel free to reach out to our support team.

Best regards,
Anamico India Team
  `;

  return { html, text };
}

// ==================== ORDER EMAILS - USER ====================

export function generateOrderConfirmationEmail(
  name: string,
  orderNumber: string,
  orderItems: Array<{ productName: string; quantity: number; price: number }>,
  subtotal: number,
  tax: number,
  total: number,
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  }
): { html: string; text: string } {
  const itemsHtml = orderItems.map(item => `
    <tr>
      <td>${item.productName}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="text-align: right;">₹${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = emailWrapper(`
    <h2>Order Confirmation 🎉</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Thank you for your order! We've received your order and it's being processed.</p>

    <div class="success-box">
      <p><strong>Order Number:</strong> ${orderNumber}</p>
      <p><strong>Status:</strong> Pending Payment</p>
    </div>

    <h3>Order Details</h3>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th style="text-align: center;">Quantity</th>
          <th style="text-align: right;">Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr style="background-color: #f8f9fa;">
          <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
          <td style="text-align: right;"><strong>₹${subtotal.toFixed(2)}</strong></td>
        </tr>
        <tr style="background-color: #f8f9fa;">
          <td colspan="3" style="text-align: right;"><strong>Tax (18%):</strong></td>
          <td style="text-align: right;"><strong>₹${tax.toFixed(2)}</strong></td>
        </tr>
        <tr style="background-color: #e7f3ff;">
          <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
          <td style="text-align: right;"><strong>₹${total.toFixed(2)}</strong></td>
        </tr>
      </tbody>
    </table>

    <h3>Shipping Address</h3>
    <div class="info-box">
      <p><strong>${shippingAddress.name}</strong><br>
      ${shippingAddress.address}<br>
      ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}<br>
      Phone: ${shippingAddress.phone}</p>
    </div>

    <div class="warning-box">
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Complete the payment to confirm your order</li>
        <li>Your order will be processed after payment verification</li>
        <li>You'll receive updates via email at each step</li>
      </ul>
    </div>

    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/orders" class="button">View Order Status</a>

    <p>Best regards,<br>Anamico India Team</p>
  `, `Order Confirmation - ${orderNumber}`);

  const text = `
Order Confirmation - ${orderNumber}

Hello ${name},

Thank you for your order! We've received your order and it's being processed.

Order Number: ${orderNumber}
Status: Pending Payment

Order Details:
${orderItems.map(item => `- ${item.productName} x ${item.quantity} = ₹${(item.quantity * item.price).toFixed(2)}`).join('\n')}

Subtotal: ₹${subtotal.toFixed(2)}
Tax (18%): ₹${tax.toFixed(2)}
Total: ₹${total.toFixed(2)}

Shipping Address:
${shippingAddress.name}
${shippingAddress.address}
${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}
Phone: ${shippingAddress.phone}

Next Steps:
- Complete the payment to confirm your order
- Your order will be processed after payment verification
- You'll receive updates via email at each step

View Order Status: ${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/orders

Best regards,
Anamico India Team
  `;

  return { html, text };
}

export function generatePaymentReceivedEmail(
  name: string,
  orderNumber: string,
  paidAmount: number,
  totalAmount: number,
  paymentStatus: string
): { html: string; text: string } {
  const isPartialPayment = paymentStatus === 'partial_payment';
  const remainingAmount = totalAmount - paidAmount;

  const html = emailWrapper(`
    <h2>Payment Received ✅</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>We've successfully received your payment for order <strong>${orderNumber}</strong>.</p>

    <div class="success-box">
      <p><strong>Payment Status:</strong> ${isPartialPayment ? 'Partial Payment' : 'Payment Completed'}</p>
      <p><strong>Amount Paid:</strong> ₹${paidAmount.toFixed(2)}</p>
      ${isPartialPayment ? `<p><strong>Remaining Amount:</strong> ₹${remainingAmount.toFixed(2)}</p>` : ''}
    </div>

    ${isPartialPayment ? `
    <div class="warning-box">
      <p><strong>⚠️ Partial Payment Received</strong></p>
      <p>You've paid ₹${paidAmount.toFixed(2)} of the total ₹${totalAmount.toFixed(2)}.</p>
      <p>Remaining balance: ₹${remainingAmount.toFixed(2)}</p>
      <p>Please complete the remaining payment to avoid order cancellation.</p>
    </div>
    ` : `
    <div class="info-box">
      <p><strong>What's Next?</strong></p>
      <ul>
        <li>Your order is now being reviewed by our team</li>
        <li>You'll receive a confirmation email once approved</li>
        <li>We'll notify you when your order is shipped</li>
      </ul>
    </div>
    `}

    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/orders" class="button">View Order Status</a>

    <p>Thank you for your business!</p>

    <p>Best regards,<br>Anamico India Team</p>
  `, `Payment Received - ${orderNumber}`);

  const text = `
Payment Received - ${orderNumber}

Hello ${name},

We've successfully received your payment for order ${orderNumber}.

Payment Status: ${isPartialPayment ? 'Partial Payment' : 'Payment Completed'}
Amount Paid: ₹${paidAmount.toFixed(2)}
${isPartialPayment ? `Remaining Amount: ₹${remainingAmount.toFixed(2)}` : ''}

${isPartialPayment ? `
⚠️ Partial Payment Received
You've paid ₹${paidAmount.toFixed(2)} of the total ₹${totalAmount.toFixed(2)}.
Remaining balance: ₹${remainingAmount.toFixed(2)}
Please complete the remaining payment to avoid order cancellation.
` : `
What's Next?
- Your order is now being reviewed by our team
- You'll receive a confirmation email once approved
- We'll notify you when your order is shipped
`}

View Order Status: ${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/orders

Thank you for your business!

Best regards,
Anamico India Team
  `;

  return { html, text };
}

export function generateOrderApprovedEmail(
  name: string,
  orderNumber: string
): { html: string; text: string } {
  const html = emailWrapper(`
    <h2>Order Approved! 🎊</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Great news! Your order <strong>${orderNumber}</strong> has been approved and is now being prepared for shipment.</p>

    <div class="success-box">
      <p><strong>✅ Order Status:</strong> Approved</p>
      <p><strong>📦 Order Number:</strong> ${orderNumber}</p>
    </div>

    <div class="info-box">
      <p><strong>What happens next?</strong></p>
      <ul>
        <li>Our team is preparing your items for shipment</li>
        <li>You'll receive tracking information once shipped</li>
        <li>Estimated processing time: 1-2 business days</li>
      </ul>
    </div>

    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/orders" class="button">Track Your Order</a>

    <p>Thank you for shopping with us!</p>

    <p>Best regards,<br>Anamico India Team</p>
  `, `Order Approved - ${orderNumber}`);

  const text = `
Order Approved - ${orderNumber}

Hello ${name},

Great news! Your order ${orderNumber} has been approved and is now being prepared for shipment.

✅ Order Status: Approved
📦 Order Number: ${orderNumber}

What happens next?
- Our team is preparing your items for shipment
- You'll receive tracking information once shipped
- Estimated processing time: 1-2 business days

Track Your Order: ${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/orders

Thank you for shopping with us!

Best regards,
Anamico India Team
  `;

  return { html, text };
}

export function generateOrderRejectedEmail(
  name: string,
  orderNumber: string,
  rejectionReason: string
): { html: string; text: string } {
  const html = emailWrapper(`
    <h2>Order Update Required</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>We regret to inform you that your order <strong>${orderNumber}</strong> could not be processed at this time.</p>

    <div class="danger-box">
      <p><strong>❌ Order Status:</strong> Rejected</p>
      <p><strong>📦 Order Number:</strong> ${orderNumber}</p>
      <p><strong>Reason:</strong> ${rejectionReason}</p>
    </div>

    <div class="info-box">
      <p><strong>What can you do?</strong></p>
      <ul>
        <li>Review the rejection reason above</li>
        <li>Contact our support team for clarification</li>
        <li>Place a new order if applicable</li>
        <li>Refund will be processed within 5-7 business days (if payment was made)</li>
      </ul>
    </div>

    <a href="mailto:pardeeps@anamicoindia.com" class="button">Contact Support</a>

    <p>We apologize for any inconvenience caused.</p>

    <p>Best regards,<br>Anamico India Team</p>
  `, `Order Update - ${orderNumber}`);

  const text = `
Order Update - ${orderNumber}

Hello ${name},

We regret to inform you that your order ${orderNumber} could not be processed at this time.

❌ Order Status: Rejected
📦 Order Number: ${orderNumber}
Reason: ${rejectionReason}

What can you do?
- Review the rejection reason above
- Contact our support team for clarification
- Place a new order if applicable
- Refund will be processed within 5-7 business days (if payment was made)

Contact Support: pardeeps@anamicoindia.com

We apologize for any inconvenience caused.

Best regards,
Anamico India Team
  `;

  return { html, text };
}

export function generateOrderShippedEmail(
  name: string,
  orderNumber: string,
  trackingNumber: string,
  shippingCarrier: string,
  trackingUrl?: string
): { html: string; text: string } {
  const html = emailWrapper(`
    <h2>Your Order Has Been Shipped! 📦</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Great news! Your order <strong>${orderNumber}</strong> has been shipped and is on its way to you.</p>

    <div class="success-box">
      <p><strong>🚚 Shipping Status:</strong> In Transit</p>
      <p><strong>📦 Order Number:</strong> ${orderNumber}</p>
      <p><strong>🚛 Carrier:</strong> ${shippingCarrier}</p>
    </div>

    <h3>Tracking Information</h3>
    <div class="info-box">
      <p><strong>Tracking Number:</strong></p>
      <div class="tracking-number">${trackingNumber}</div>
      ${trackingUrl ? `<a href="${trackingUrl}" class="button" target="_blank">Track Your Package</a>` : ''}
    </div>

    <div class="warning-box">
      <p><strong>Delivery Information:</strong></p>
      <ul>
        <li>Estimated delivery: 3-5 business days</li>
        <li>You'll receive a notification when delivered</li>
        <li>Make sure someone is available to receive the package</li>
      </ul>
    </div>

    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/orders" class="button">View Order Details</a>

    <p>Thank you for your patience!</p>

    <p>Best regards,<br>Anamico India Team</p>
  `, `Order Shipped - ${orderNumber}`);

  const text = `
Your Order Has Been Shipped! - ${orderNumber}

Hello ${name},

Great news! Your order ${orderNumber} has been shipped and is on its way to you.

🚚 Shipping Status: In Transit
📦 Order Number: ${orderNumber}
🚛 Carrier: ${shippingCarrier}

Tracking Information:
Tracking Number: ${trackingNumber}
${trackingUrl ? `Track Your Package: ${trackingUrl}` : ''}

Delivery Information:
- Estimated delivery: 3-5 business days
- You'll receive a notification when delivered
- Make sure someone is available to receive the package

View Order Details: ${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/orders

Thank you for your patience!

Best regards,
Anamico India Team
  `;

  return { html, text };
}

export function generateOrderDeliveredEmail(
  name: string,
  orderNumber: string
): { html: string; text: string } {
  const html = emailWrapper(`
    <h2>Order Delivered Successfully! 🎉</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your order <strong>${orderNumber}</strong> has been successfully delivered!</p>

    <div class="success-box">
      <p><strong>✅ Delivery Status:</strong> Completed</p>
      <p><strong>📦 Order Number:</strong> ${orderNumber}</p>
      <p><strong>📅 Delivered On:</strong> ${new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}</p>
    </div>

    <div class="info-box">
      <p><strong>Important:</strong></p>
      <ul>
        <li>Please inspect your package for any damages</li>
        <li>Verify all items are as ordered</li>
        <li>Contact us immediately if there are any issues</li>
        <li>We hope you enjoy your purchase!</li>
      </ul>
    </div>

    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/orders" class="button">View Order Details</a>

    <p>Thank you for shopping with Anamico India! We appreciate your business and hope to serve you again soon.</p>

    <p>Best regards,<br>Anamico India Team</p>
  `, `Order Delivered - ${orderNumber}`);

  const text = `
Order Delivered Successfully! - ${orderNumber}

Hello ${name},

Your order ${orderNumber} has been successfully delivered!

✅ Delivery Status: Completed
📦 Order Number: ${orderNumber}
📅 Delivered On: ${new Date().toLocaleDateString('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})}

Important:
- Please inspect your package for any damages
- Verify all items are as ordered
- Contact us immediately if there are any issues
- We hope you enjoy your purchase!

View Order Details: ${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/orders

Thank you for shopping with Anamico India! We appreciate your business and hope to serve you again soon.

Best regards,
Anamico India Team
  `;

  return { html, text };
}

// ==================== ORDER EMAILS - ADMIN ====================

export function generateAdminNewOrderEmail(
  orderNumber: string,
  customerName: string,
  customerEmail: string,
  total: number,
  itemCount: number,
  paymentStatus: string
): { html: string; text: string } {
  const html = emailWrapper(`
    <h2>🔔 New Order Received</h2>
    <p>A new order has been placed on Anamico India.</p>

    <div class="info-box">
      <p><strong>📦 Order Number:</strong> ${orderNumber}</p>
      <p><strong>👤 Customer:</strong> ${customerName}</p>
      <p><strong>📧 Email:</strong> ${customerEmail}</p>
      <p><strong>💰 Total Amount:</strong> ₹${total.toFixed(2)}</p>
      <p><strong>📊 Items:</strong> ${itemCount} item(s)</p>
      <p><strong>💳 Payment Status:</strong> ${paymentStatus}</p>
    </div>

    <div class="warning-box">
      <p><strong>Action Required:</strong></p>
      <ul>
        <li>Review the order details</li>
        <li>Verify payment status</li>
        <li>Approve or reject the order</li>
      </ul>
    </div>

    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/admin/orders" class="button">View Order in Admin Panel</a>

    <p>Best regards,<br>Anamico India System</p>
  `, `New Order - ${orderNumber}`);

  const text = `
🔔 New Order Received - ${orderNumber}

A new order has been placed on Anamico India.

📦 Order Number: ${orderNumber}
👤 Customer: ${customerName}
📧 Email: ${customerEmail}
💰 Total Amount: ₹${total.toFixed(2)}
📊 Items: ${itemCount} item(s)
💳 Payment Status: ${paymentStatus}

Action Required:
- Review the order details
- Verify payment status
- Approve or reject the order

View Order in Admin Panel: ${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/admin/orders

Best regards,
Anamico India System
  `;

  return { html, text };
}

export function generateAdminPaymentReceivedEmail(
  orderNumber: string,
  customerName: string,
  paidAmount: number,
  totalAmount: number,
  paymentStatus: string
): { html: string; text: string } {
  const isPartialPayment = paymentStatus === 'partial_payment';
  const remainingAmount = totalAmount - paidAmount;

  const html = emailWrapper(`
    <h2>💰 Payment Received</h2>
    <p>Payment has been received for order <strong>${orderNumber}</strong>.</p>

    <div class="success-box">
      <p><strong>📦 Order Number:</strong> ${orderNumber}</p>
      <p><strong>👤 Customer:</strong> ${customerName}</p>
      <p><strong>💵 Amount Paid:</strong> ₹${paidAmount.toFixed(2)}</p>
      <p><strong>💰 Total Amount:</strong> ₹${totalAmount.toFixed(2)}</p>
      <p><strong>💳 Payment Status:</strong> ${isPartialPayment ? 'Partial Payment' : 'Completed'}</p>
      ${isPartialPayment ? `<p><strong>⚠️ Remaining:</strong> ₹${remainingAmount.toFixed(2)}</p>` : ''}
    </div>

    <div class="info-box">
      <p><strong>Action Required:</strong></p>
      <ul>
        <li>${isPartialPayment ? 'Monitor for remaining payment' : 'Review and approve the order'}</li>
        <li>Verify payment in Razorpay dashboard</li>
        <li>${isPartialPayment ? 'Contact customer if needed' : 'Process the order for shipment'}</li>
      </ul>
    </div>

    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/admin/orders" class="button">View Order in Admin Panel</a>

    <p>Best regards,<br>Anamico India System</p>
  `, `Payment Received - ${orderNumber}`);

  const text = `
💰 Payment Received - ${orderNumber}

Payment has been received for order ${orderNumber}.

📦 Order Number: ${orderNumber}
👤 Customer: ${customerName}
💵 Amount Paid: ₹${paidAmount.toFixed(2)}
💰 Total Amount: ₹${totalAmount.toFixed(2)}
💳 Payment Status: ${isPartialPayment ? 'Partial Payment' : 'Completed'}
${isPartialPayment ? `⚠️ Remaining: ₹${remainingAmount.toFixed(2)}` : ''}

Action Required:
- ${isPartialPayment ? 'Monitor for remaining payment' : 'Review and approve the order'}
- Verify payment in Razorpay dashboard
- ${isPartialPayment ? 'Contact customer if needed' : 'Process the order for shipment'}

View Order in Admin Panel: ${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/admin/orders

Best regards,
Anamico India System
  `;

  return { html, text };
}

// ==================== USER MANAGEMENT EMAILS ====================

export function generateRoleChangeEmail(
  name: string,
  email: string,
  oldRole: string,
  newRole: string
): { html: string; text: string } {
  const html = emailWrapper(`
    <h2>Account Role Updated</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your account role has been updated by an administrator.</p>

    <div class="info-box">
      <p><strong>📧 Email:</strong> ${email}</p>
      <p><strong>Previous Role:</strong> ${oldRole}</p>
      <p><strong>New Role:</strong> ${newRole}</p>
    </div>

    ${newRole === 'admin' ? `
    <div class="success-box">
      <p><strong>🎉 Congratulations!</strong></p>
      <p>You now have admin access to the Anamico India platform.</p>
      <p>You can access the admin panel to manage orders, products, users, and more.</p>
    </div>

    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/admin/dashboard" class="button">Go to Admin Panel</a>
    ` : `
    <div class="warning-box">
      <p>Your admin privileges have been removed. You now have standard user access.</p>
    </div>
    `}

    <p>If you believe this change was made in error, please contact support.</p>

    <p>Best regards,<br>Anamico India Team</p>
  `, 'Account Role Updated');

  const text = `
Account Role Updated

Hello ${name},

Your account role has been updated by an administrator.

📧 Email: ${email}
Previous Role: ${oldRole}
New Role: ${newRole}

${newRole === 'admin' ? `
🎉 Congratulations!
You now have admin access to the Anamico India platform.
You can access the admin panel to manage orders, products, users, and more.

Admin Panel: ${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/admin/dashboard
` : `
Your admin privileges have been removed. You now have standard user access.
`}

If you believe this change was made in error, please contact support.

Best regards,
Anamico India Team
  `;

  return { html, text };
}

export function generateProfileUpdateEmail(
  name: string,
  email: string,
  updatedFields: string[]
): { html: string; text: string } {
  const html = emailWrapper(`
    <h2>Profile Updated</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your profile information has been successfully updated.</p>

    <div class="success-box">
      <p><strong>✅ Updated Fields:</strong></p>
      <ul>
        ${updatedFields.map(field => `<li>${field}</li>`).join('')}
      </ul>
    </div>

    <div class="info-box">
      <p>If you didn't make these changes, please contact support immediately.</p>
    </div>

    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/profile" class="button">View Profile</a>

    <p>Best regards,<br>Anamico India Team</p>
  `, 'Profile Updated');

  const text = `
Profile Updated

Hello ${name},

Your profile information has been successfully updated.

✅ Updated Fields:
${updatedFields.map(field => `- ${field}`).join('\n')}

If you didn't make these changes, please contact support immediately.

View Profile: ${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/profile

Best regards,
Anamico India Team
  `;

  return { html, text };
}

