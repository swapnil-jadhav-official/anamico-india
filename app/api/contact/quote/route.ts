import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendAdminEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message } = await req.json();

    // Validate input
    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Send confirmation email to customer
    try {
      const customerEmailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Quote Request Received</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>Thank you for your interest in ANAMICO India Private Limited. We have received your quote request and our team will review it shortly.</p>

              <div class="info-box">
                <h3 style="margin-top: 0; color: #667eea;">Your Request Details:</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Requirements:</strong><br>${message}</p>
              </div>

              <p>Our sales team will contact you within 24-48 business hours to discuss your requirements in detail.</p>

              <p>If you have any urgent queries, please feel free to reach us at:</p>
              <p>
                <strong>Phone:</strong> +91 9818424815, +91 8826353408<br>
                <strong>Email:</strong> info@anamicoindia.com
              </p>

              <div class="footer">
                <p><strong>ANAMICO India Private Limited</strong></p>
                <p>204, WZ-663, Madipur Main Village Road, Near Punjabi Bagh Apartment<br>New Delhi - 110063</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const customerEmailText = `
Dear ${name},

Thank you for your interest in ANAMICO India Private Limited. We have received your quote request and our team will review it shortly.

Your Request Details:
- Name: ${name}
- Email: ${email}
- Phone: ${phone}
- Requirements: ${message}

Our sales team will contact you within 24-48 business hours to discuss your requirements in detail.

If you have any urgent queries, please feel free to reach us at:
Phone: +91 9818424815, +91 8826353408
Email: info@anamicoindia.com

ANAMICO India Private Limited
204, WZ-663, Madipur Main Village Road, Near Punjabi Bagh Apartment
New Delhi - 110063
      `;

      await sendEmail({
        to: email,
        subject: 'Quote Request Received - ANAMICO India',
        html: customerEmailHTML,
        text: customerEmailText,
      });

      console.log(`✅ Quote confirmation email sent to ${email}`);
    } catch (emailError) {
      console.error('❌ Failed to send customer confirmation email:', emailError);
    }

    // Send notification email to admin
    try {
      const adminEmailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .customer-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🔔 New Quote Request</h1>
            </div>
            <div class="content">
              <div class="alert-box">
                <p style="margin: 0; font-weight: bold;">A new customer has requested a quote!</p>
              </div>

              <div class="customer-info">
                <h3 style="margin-top: 0; color: #667eea;">Customer Details:</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Requirements:</strong><br>${message}</p>
              </div>

              <p><strong>Action Required:</strong> Please contact the customer within 24-48 business hours.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const adminEmailText = `
🔔 NEW QUOTE REQUEST

Customer Details:
- Name: ${name}
- Email: ${email}
- Phone: ${phone}
- Requirements: ${message}

Action Required: Please contact the customer within 24-48 business hours.
      `;

      await sendAdminEmail(
        '🔔 New Quote Request',
        adminEmailHTML,
        adminEmailText
      );

      console.log('✅ Admin notification sent for new quote request');
    } catch (emailError) {
      console.error('❌ Failed to send admin notification:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Quote request submitted successfully',
    });
  } catch (error) {
    console.error('Error processing quote request:', error);
    return NextResponse.json(
      { error: 'Failed to process quote request' },
      { status: 500 }
    );
  }
}
