import nodemailer from 'nodemailer';

// SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.EMAIL_SERVER_PORT || '465'),
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_SERVER_USER || 'pardeeps@anamicoindia.com',
    pass: process.env.EMAIL_SERVER_PASSWORD || 'Anamico@2026',
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready to send emails');
  }
});

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  attachments?: EmailAttachment[];
}

/**
 * Send email using configured SMTP server
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const mailOptions = {
      from: options.from || process.env.EMAIL_FROM || 'pardeeps@anamicoindia.com',
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || '',
      attachments: options.attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', {
      messageId: info.messageId,
      to: mailOptions.to,
      subject: mailOptions.subject,
      attachments: options.attachments?.length || 0,
    });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

/**
 * Send email to admin users
 */
export async function sendAdminEmail(subject: string, html: string, text?: string): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'pardeeps@anamicoindia.com';
  await sendEmail({
    to: adminEmail,
    subject: `[Admin] ${subject}`,
    html,
    text,
  });
}
