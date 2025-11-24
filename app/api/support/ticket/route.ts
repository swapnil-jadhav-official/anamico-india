import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { supportTicket } from '@/drizzle/schema';
import { sendEmail, sendAdminEmail } from '@/lib/email';
import { nanoid } from 'nanoid';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { eq } from 'drizzle-orm';

// Generate ticket number (format: TKT-YYYYMMDD-XXXX)
function generateTicketNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return `TKT-${year}${month}${day}-${random}`;
}

// POST - Create new support ticket
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    const data = await req.json();

    const { name, email, phone, subject, message } = data;

    // Validation
    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Phone validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number. Please enter 10 digits.' },
        { status: 400 }
      );
    }

    // Generate unique ticket ID and number
    const ticketId = nanoid();
    const ticketNumber = generateTicketNumber();

    // Create ticket in database
    await db.insert(supportTicket).values({
      id: ticketId,
      ticketNumber,
      userId: session?.user?.id || null,
      name,
      email,
      phone,
      subject,
      message,
      priority: 'medium',
      status: 'open',
    });

    // Send confirmation email to customer
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .ticket-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
          .ticket-number { font-size: 24px; font-weight: bold; color: #667eea; margin: 10px 0; }
          .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 5px; }
          .label { font-weight: bold; color: #555; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #777; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Support Ticket Received</h1>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for contacting Anamico support. We have received your support ticket and our team will review it shortly.</p>

            <div class="ticket-box">
              <p class="label">Your Ticket Number:</p>
              <p class="ticket-number">${ticketNumber}</p>
              <p style="color: #666; font-size: 14px;">Please save this number for tracking your request</p>
            </div>

            <div class="info-row">
              <p class="label">Subject:</p>
              <p>${subject}</p>
            </div>

            <div class="info-row">
              <p class="label">Message:</p>
              <p>${message}</p>
            </div>

            <div class="info-row">
              <p class="label">Status:</p>
              <p><span style="background: #10b981; color: white; padding: 5px 15px; border-radius: 20px;">Open</span></p>
            </div>

            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Our support team will review your ticket within 24 hours</li>
              <li>You'll receive updates via email</li>
              <li>For urgent issues, call us at +91 84343 84343</li>
            </ul>

            <div style="text-align: center;">
              <a href="tel:+918434384343" class="button">Call Support</a>
            </div>

            <p>If you have any additional information to add, please reply to this email with your ticket number.</p>

            <p>Best regards,<br>
            <strong>Anamico Support Team</strong></p>
          </div>
          <div class="footer">
            <p>Anamico India | Support: +91 84343 84343 | Email: support@anamico.in</p>
            <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send notification email to admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 5px; }
          .label { font-weight: bold; color: #555; }
          .ticket-number { font-size: 20px; font-weight: bold; color: #dc2626; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 New Support Ticket</h1>
          </div>
          <div class="content">
            <div class="alert">
              <p><strong>A new support ticket has been submitted and requires attention.</strong></p>
            </div>

            <div class="info-row">
              <p class="label">Ticket Number:</p>
              <p class="ticket-number">${ticketNumber}</p>
            </div>

            <div class="info-row">
              <p class="label">Customer Name:</p>
              <p>${name}</p>
            </div>

            <div class="info-row">
              <p class="label">Email:</p>
              <p><a href="mailto:${email}">${email}</a></p>
            </div>

            <div class="info-row">
              <p class="label">Phone:</p>
              <p><a href="tel:${phone}">${phone}</a></p>
            </div>

            <div class="info-row">
              <p class="label">Subject:</p>
              <p>${subject}</p>
            </div>

            <div class="info-row">
              <p class="label">Message:</p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>

            <div class="info-row">
              <p class="label">Status:</p>
              <p><span style="background: #10b981; color: white; padding: 5px 15px; border-radius: 20px;">Open</span></p>
            </div>

            <div class="info-row">
              <p class="label">Priority:</p>
              <p><span style="background: #f59e0b; color: white; padding: 5px 15px; border-radius: 20px;">Medium</span></p>
            </div>

            ${session?.user?.id ? `
            <div class="info-row">
              <p class="label">User Account:</p>
              <p>Registered User (ID: ${session.user.id})</p>
            </div>
            ` : `
            <div class="info-row">
              <p class="label">User Account:</p>
              <p>Guest User</p>
            </div>
            `}

            <div class="info-row">
              <p class="label">Submitted At:</p>
              <p>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            </div>

            <p><strong>Action Required:</strong> Please review and assign this ticket to the appropriate support team member.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send emails
    try {
      await sendEmail({
        to: email,
        subject: `Support Ticket Received - ${ticketNumber}`,
        html: customerEmailHtml,
      });

      await sendAdminEmail(
        `New Support Ticket - ${ticketNumber}`,
        adminEmailHtml
      );
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      ticketId,
      ticketNumber,
      message: 'Support ticket submitted successfully',
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json(
      { error: 'Failed to submit support ticket' },
      { status: 500 }
    );
  }
}

// GET - Get ticket by ticket number
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketNumber = searchParams.get('ticketNumber');

    if (!ticketNumber) {
      return NextResponse.json(
        { error: 'Ticket number is required' },
        { status: 400 }
      );
    }

    const tickets = await db
      .select()
      .from(supportTicket)
      .where(eq(supportTicket.ticketNumber, ticketNumber))
      .limit(1);

    if (tickets.length === 0) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ticket: tickets[0],
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}
