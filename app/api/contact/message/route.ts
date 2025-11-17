import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendAdminEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    // Validate input
    if (!name || !email || !phone || !subject || !message) {
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
              <h1 style="margin: 0;">Message Received</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>Thank you for contacting ANAMICO India Private Limited. We have received your message and our team will review it shortly.</p>

              <div class="info-box">
                <h3 style="margin-top: 0; color: #667eea;">Your Message Details:</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong><br>${message}</p>
              </div>

              <p>We aim to respond to all inquiries within 24-48 business hours. If your matter is urgent, please feel free to call us directly.</p>

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

Thank you for contacting ANAMICO India Private Limited. We have received your message and our team will review it shortly.

Your Message Details:
- Name: ${name}
- Email: ${email}
- Phone: ${phone}
- Subject: ${subject}
- Message: ${message}

We aim to respond to all inquiries within 24-48 business hours. If your matter is urgent, please feel free to call us directly.

Phone: +91 9818424815, +91 8826353408
Email: info@anamicoindia.com

ANAMICO India Private Limited
204, WZ-663, Madipur Main Village Road, Near Punjabi Bagh Apartment
New Delhi - 110063
      `;

      await sendEmail({
        to: email,
        subject: 'Message Received - ANAMICO India',
        html: customerEmailHTML,
        text: customerEmailText,
      });

      console.log(`✅ Contact confirmation email sent to ${email}`);
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
              <h1 style="margin: 0;">📧 New Contact Message</h1>
            </div>
            <div class="content">
              <div class="alert-box">
                <p style="margin: 0; font-weight: bold;">A new message has been received from the contact form!</p>
              </div>

              <div class="customer-info">
                <h3 style="margin-top: 0; color: #667eea;">Message Details:</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong><br>${message}</p>
              </div>

              <p><strong>Action Required:</strong> Please respond to the customer within 24-48 business hours.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const adminEmailText = `
📧 NEW CONTACT MESSAGE

Message Details:
- Name: ${name}
- Email: ${email}
- Phone: ${phone}
- Subject: ${subject}
- Message: ${message}

Action Required: Please respond to the customer within 24-48 business hours.
      `;

      await sendAdminEmail(
        `📧 New Contact Message: ${subject}`,
        adminEmailHTML,
        adminEmailText
      );

      console.log('✅ Admin notification sent for new contact message');
    } catch (emailError) {
      console.error('❌ Failed to send admin notification:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Error processing contact message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
