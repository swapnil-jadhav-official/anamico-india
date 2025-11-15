// RD Service Email Templates
import { emailWrapper } from './email-templates';

export function generateRDServiceConfirmationEmail(
  customerName: string,
  email: string,
  registrationNumber: string,
  serviceDetails: {
    deviceName: string;
    deviceModel: string;
    serialNumber: string;
    rdSupport: string;
    amcSupport: string;
    deliveryType: string;
  },
  pricing: {
    deviceFee: number;
    supportFee: number;
    deliveryFee: number;
    subtotal: number;
    gst: number;
    total: number;
  },
  shippingAddress: {
    name: string;
    mobile: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  }
): { html: string; text: string } {
  const rdSupportLabel = serviceDetails.rdSupport === '1' ? '1 Year' : serviceDetails.rdSupport === '2' ? '2 Years' : '3 Years';
  const deliveryLabel = serviceDetails.deliveryType === 'express' ? 'Express (2-3 days)' : 'Regular (5-7 days)';

  const html = emailWrapper(`
    <h2>🎉 RD Service Registration Confirmed!</h2>
    <p>Dear <strong>${customerName}</strong>,</p>
    <p>Thank you for registering your biometric device with Anamico India RD Service. Your payment has been received and your registration is confirmed.</p>

    <div class="success-box">
      <p><strong>Registration Number:</strong> ${registrationNumber}</p>
      <p>Keep this number for your records and future reference.</p>
    </div>

    <h3>📋 Registration Summary</h3>
    <div class="info-box">
      <p><strong>Device Information:</strong></p>
      <p>Device Name: ${serviceDetails.deviceName}</p>
      <p>Device Model: ${serviceDetails.deviceModel}</p>
      <p>Serial Number: ${serviceDetails.serialNumber}</p>
    </div>

    <div class="info-box">
      <p><strong>Service Details:</strong></p>
      <p>RD Technical Support: ${rdSupportLabel}</p>
      <p>AMC Support: ${serviceDetails.amcSupport}</p>
      <p>Delivery Type: ${deliveryLabel}</p>
    </div>

    <h3>💰 Payment Summary</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr style="background-color: #f8f9fa;">
        <td style="padding: 10px; border: 1px solid #dee2e6;">Device Fee</td>
        <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">₹${pricing.deviceFee.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #dee2e6;">Support Fee</td>
        <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">₹${pricing.supportFee.toLocaleString()}</td>
      </tr>
      <tr style="background-color: #f8f9fa;">
        <td style="padding: 10px; border: 1px solid #dee2e6;">Delivery Fee</td>
        <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">₹${pricing.deliveryFee.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #dee2e6;">Subtotal</td>
        <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">₹${pricing.subtotal.toLocaleString()}</td>
      </tr>
      <tr style="background-color: #f8f9fa;">
        <td style="padding: 10px; border: 1px solid #dee2e6;">GST (18%)</td>
        <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">₹${pricing.gst.toLocaleString()}</td>
      </tr>
      <tr style="font-weight: bold; background-color: #e7f3ff;">
        <td style="padding: 10px; border: 1px solid #dee2e6;">Total Paid</td>
        <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right; color: #667eea;">₹${pricing.total.toLocaleString()}</td>
      </tr>
    </table>

    <h3>📦 Delivery Address</h3>
    <div class="info-box">
      <p>${shippingAddress.name}</p>
      <p>${shippingAddress.mobile}</p>
      <p>${shippingAddress.address}</p>
      <p>${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}</p>
    </div>

    <h3>📌 What's Next?</h3>
    <div class="success-box">
      <p>✅ Your registration is being processed</p>
      <p>✅ You will receive device activation details within 24-48 hours</p>
      <p>✅ Our support team will contact you for setup assistance</p>
      <p>✅ Track your registration status in your account</p>
    </div>

    <div class="warning-box">
      <p><strong>⚠️ Important:</strong></p>
      <p>• Device serial number validation will be performed on the manufacturer's server</p>
      <p>• Invalid serial numbers will be refunded within 3-4 working days</p>
      <p>• For any issues with serial number, contact us on WhatsApp: +91 84343 84343</p>
    </div>

    <h3>📞 Need Help?</h3>
    <p>Our support team is here to help:</p>
    <ul>
      <li>WhatsApp: +91 84343 84343</li>
      <li>Email: support@anamicoindia.com</li>
      <li>Business Hours: Mon-Sat, 10 AM - 6 PM</li>
    </ul>

    <p>Thank you for choosing Anamico India for your RD Service needs!</p>
    <p>Best regards,<br>Anamico India Team</p>
  `, `RD Service Registration - ${registrationNumber}`);

  const text = `
🎉 RD Service Registration Confirmed!

Dear ${customerName},

Thank you for registering your biometric device with Anamico India RD Service. Your payment has been received and your registration is confirmed.

Registration Number: ${registrationNumber}
Keep this number for your records and future reference.

📋 REGISTRATION SUMMARY

Device Information:
- Device Name: ${serviceDetails.deviceName}
- Device Model: ${serviceDetails.deviceModel}
- Serial Number: ${serviceDetails.serialNumber}

Service Details:
- RD Technical Support: ${rdSupportLabel}
- AMC Support: ${serviceDetails.amcSupport}
- Delivery Type: ${deliveryLabel}

💰 PAYMENT SUMMARY

Device Fee: ₹${pricing.deviceFee.toLocaleString()}
Support Fee: ₹${pricing.supportFee.toLocaleString()}
Delivery Fee: ₹${pricing.deliveryFee.toLocaleString()}
Subtotal: ₹${pricing.subtotal.toLocaleString()}
GST (18%): ₹${pricing.gst.toLocaleString()}
Total Paid: ₹${pricing.total.toLocaleString()}

📦 DELIVERY ADDRESS

${shippingAddress.name}
${shippingAddress.mobile}
${shippingAddress.address}
${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}

📌 WHAT'S NEXT?

✅ Your registration is being processed
✅ You will receive device activation details within 24-48 hours
✅ Our support team will contact you for setup assistance
✅ Track your registration status in your account

⚠️ IMPORTANT:
• Device serial number validation will be performed on the manufacturer's server
• Invalid serial numbers will be refunded within 3-4 working days
• For any issues with serial number, contact us on WhatsApp: +91 84343 84343

📞 NEED HELP?

Our support team is here to help:
- WhatsApp: +91 84343 84343
- Email: support@anamicoindia.com
- Business Hours: Mon-Sat, 10 AM - 6 PM

Thank you for choosing Anamico India for your RD Service needs!

Best regards,
Anamico India Team
  `;

  return { html, text };
}

export function generateAdminRDServiceNotification(
  registrationNumber: string,
  customerName: string,
  email: string,
  mobile: string,
  deviceInfo: {
    deviceName: string;
    deviceModel: string;
    serialNumber: string;
  },
  totalAmount: number,
  paidAmount: number
): { html: string; text: string } {
  const html = emailWrapper(`
    <h2>🆕 New RD Service Registration</h2>
    <p>A new RD service registration has been received and payment is confirmed.</p>

    <div class="success-box">
      <p><strong>Registration Number:</strong> ${registrationNumber}</p>
    </div>

    <h3>👤 Customer Information</h3>
    <div class="info-box">
      <p><strong>Name:</strong> ${customerName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mobile:</strong> ${mobile}</p>
    </div>

    <h3>📱 Device Information</h3>
    <div class="info-box">
      <p><strong>Device Name:</strong> ${deviceInfo.deviceName}</p>
      <p><strong>Device Model:</strong> ${deviceInfo.deviceModel}</p>
      <p><strong>Serial Number:</strong> ${deviceInfo.serialNumber}</p>
    </div>

    <h3>💰 Payment Details</h3>
    <div class="success-box">
      <p><strong>Total Amount:</strong> ₹${totalAmount.toLocaleString()}</p>
      <p><strong>Paid Amount:</strong> ₹${paidAmount.toLocaleString()}</p>
      <p><strong>Payment Status:</strong> ✅ Completed</p>
    </div>

    <h3>⚡ Action Required</h3>
    <div class="warning-box">
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Verify serial number on manufacturer's server</li>
        <li>Validate device authenticity</li>
        <li>Process device activation</li>
        <li>Contact customer for setup assistance</li>
        <li>Arrange delivery if applicable</li>
      </ul>
    </div>

    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/admin/rd-service" class="button">View RD Service Dashboard</a>

    <p>Best regards,<br>Anamico India System</p>
  `, `New RD Service Registration - ${registrationNumber}`);

  const text = `
🆕 New RD Service Registration

A new RD service registration has been received and payment is confirmed.

Registration Number: ${registrationNumber}

👤 CUSTOMER INFORMATION

Name: ${customerName}
Email: ${email}
Mobile: ${mobile}

📱 DEVICE INFORMATION

Device Name: ${deviceInfo.deviceName}
Device Model: ${deviceInfo.deviceModel}
Serial Number: ${deviceInfo.serialNumber}

💰 PAYMENT DETAILS

Total Amount: ₹${totalAmount.toLocaleString()}
Paid Amount: ₹${paidAmount.toLocaleString()}
Payment Status: ✅ Completed

⚡ ACTION REQUIRED

Next Steps:
- Verify serial number on manufacturer's server
- Validate device authenticity
- Process device activation
- Contact customer for setup assistance
- Arrange delivery if applicable

View RD Service Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://anamicoindia.com'}/admin/rd-service

Best regards,
Anamico India System
  `;

  return { html, text };
}
