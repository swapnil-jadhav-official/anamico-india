# Email System Documentation

## Overview

This document describes the comprehensive SMTP email system implemented for the Anamico India e-commerce application. The system sends automated email notifications for authentication, orders, shipping, delivery tracking, and user management across all roles.

## Table of Contents

1. [Email Configuration](#email-configuration)
2. [Email Types](#email-types)
3. [Implementation Details](#implementation-details)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)

---

## Email Configuration

### SMTP Settings

The application uses **Hostinger SMTP** for sending emails with the following configuration:

```env
EMAIL_SERVER_HOST=smtp.hostinger.com
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=pardeeps@anamicoindia.com
EMAIL_SERVER_PASSWORD=Anamico@2026
EMAIL_FROM=pardeeps@anamicoindia.com
ADMIN_EMAIL=pardeeps@anamicoindia.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Environment Variables

Add these variables to your `.env` file (see `.env.example` for reference):

| Variable | Description | Required |
|----------|-------------|----------|
| `EMAIL_SERVER_HOST` | SMTP server hostname | Yes |
| `EMAIL_SERVER_PORT` | SMTP port (465 for SSL, 587 for TLS) | Yes |
| `EMAIL_SERVER_USER` | SMTP username (email address) | Yes |
| `EMAIL_SERVER_PASSWORD` | SMTP password | Yes |
| `EMAIL_FROM` | Sender email address | Yes |
| `ADMIN_EMAIL` | Admin email for notifications | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL for email links | Yes |

---

## Email Types

### 1. Authentication Emails

#### 1.1 OTP Email (Login)
- **Trigger**: User requests OTP for login
- **Recipient**: User
- **API**: `POST /api/otp/send`
- **Content**: 6-digit OTP code with 10-minute expiration
- **Features**:
  - Highlighted OTP code
  - Expiration warning
  - Security notice

#### 1.2 Welcome Email
- **Trigger**: New user registration via OTP login
- **Recipient**: User
- **API**: `POST /api/auth/callback/credentials` (OTP provider)
- **Content**: Welcome message, account details, getting started guide
- **Features**:
  - Account confirmation
  - Links to product catalog
  - Support information

---

### 2. Order Emails (Customer)

#### 2.1 Order Confirmation
- **Trigger**: Order created
- **Recipient**: Customer
- **API**: `POST /api/orders`
- **Content**:
  - Order number
  - Order status: Pending Payment
  - Itemized product list with quantities and prices
  - Subtotal, tax (18% GST), and total
  - Shipping address
  - Next steps instructions
- **Features**:
  - Professional order summary table
  - Clear payment instructions
  - Order tracking link

#### 2.2 Payment Received
- **Trigger**: Payment recorded
- **Recipient**: Customer
- **API**: `POST /api/orders/[orderId]/payment`
- **Content**:
  - Payment confirmation
  - Amount paid
  - Payment status (Partial/Completed)
  - Remaining balance (if partial)
  - Next steps
- **Features**:
  - Payment breakdown
  - Partial payment warnings
  - Order status link

#### 2.3 Order Approved
- **Trigger**: Admin approves order
- **Recipient**: Customer
- **API**: `PATCH /api/admin/orders/[orderId]` (action: approve)
- **Content**:
  - Order approval confirmation
  - Processing timeline
  - Shipping estimate
- **Features**:
  - Status update
  - Timeline expectations
  - Tracking link

#### 2.4 Order Rejected
- **Trigger**: Admin rejects order
- **Recipient**: Customer
- **API**: `PATCH /api/admin/orders/[orderId]` (action: reject)
- **Content**:
  - Rejection notification
  - Rejection reason
  - Refund information
  - Support contact
- **Features**:
  - Clear rejection reason
  - Refund timeline (5-7 business days)
  - Support links

#### 2.5 Order Shipped
- **Trigger**: Admin marks order as shipped
- **Recipient**: Customer
- **API**: `PATCH /api/admin/orders/[orderId]` (action: ship)
- **Content**:
  - Shipping confirmation
  - Tracking number (highlighted)
  - Shipping carrier
  - Tracking URL (if provided)
  - Estimated delivery (3-5 business days)
- **Features**:
  - Prominent tracking number display
  - Direct tracking link
  - Delivery instructions

#### 2.6 Order Delivered
- **Trigger**: Admin marks order as delivered
- **Recipient**: Customer
- **API**: `PATCH /api/admin/orders/[orderId]` (action: deliver)
- **Content**:
  - Delivery confirmation
  - Delivery date
  - Inspection instructions
  - Thank you message
- **Features**:
  - Delivery timestamp
  - Quality check reminder
  - Feedback invitation

---

### 3. Order Emails (Admin)

#### 3.1 New Order Notification
- **Trigger**: Order created
- **Recipient**: Admin
- **API**: `POST /api/orders`
- **Content**:
  - Order number
  - Customer name and email
  - Total amount
  - Item count
  - Payment status
  - Action required notice
- **Features**:
  - Quick order overview
  - Direct admin panel link
  - Action items checklist

#### 3.2 Payment Received Notification
- **Trigger**: Payment recorded
- **Recipient**: Admin
- **API**: `POST /api/orders/[orderId]/payment`
- **Content**:
  - Order number
  - Customer name
  - Amount paid
  - Payment status
  - Total amount
  - Remaining balance (if partial)
  - Action required
- **Features**:
  - Payment verification reminder
  - Razorpay dashboard link suggestion
  - Order processing instructions

---

### 4. User Management Emails

#### 4.1 Role Change Notification
- **Trigger**: Admin changes user role
- **Recipient**: User
- **API**: `PATCH /api/admin/users`
- **Content**:
  - Role change confirmation
  - Previous role
  - New role
  - Admin panel access (if promoted to admin)
  - Support contact (if role change was error)
- **Features**:
  - Clear role comparison
  - Admin panel link (for new admins)
  - Security notice

#### 4.2 Profile Update Notification
- **Trigger**: User or admin updates profile
- **Recipient**: User
- **APIs**:
  - `POST /api/user/update` (user self-update)
  - `PATCH /api/admin/users` (admin update)
- **Content**:
  - Update confirmation
  - List of updated fields
  - Security warning
- **Features**:
  - Field-by-field breakdown
  - Security alert
  - Profile link

---

## Implementation Details

### Architecture

```
lib/
├── email.ts                 # Core email service (Nodemailer setup)
└── email-templates.ts       # All email HTML/text templates

app/api/
├── otp/send/route.ts       # OTP email sending
├── orders/route.ts         # Order confirmation & admin notification
├── orders/[orderId]/
│   └── payment/route.ts    # Payment confirmation emails
├── admin/
│   ├── orders/[orderId]/
│   │   └── route.ts        # Order status update emails
│   └── users/route.ts      # User management emails
└── user/update/route.ts    # User profile update emails
```

### Core Components

#### 1. Email Service (`lib/email.ts`)

```typescript
import nodemailer from 'nodemailer';

// SMTP transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '465'),
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// Send email function
export async function sendEmail(options: EmailOptions): Promise<void>

// Send admin email function
export async function sendAdminEmail(subject: string, html: string, text?: string): Promise<void>
```

**Features:**
- Auto-verification on startup
- Error handling and logging
- Support for HTML and plain text
- Multiple recipient support

#### 2. Email Templates (`lib/email-templates.ts`)

All email templates follow a consistent design:
- **Responsive Design**: Mobile-friendly HTML
- **Brand Colors**: Purple gradient header (#667eea to #764ba2)
- **Clear Typography**: Sans-serif fonts for readability
- **Call-to-Action Buttons**: Prominent action buttons
- **Info Boxes**: Color-coded information sections
  - Blue: Information
  - Yellow: Warnings
  - Green: Success
  - Red: Errors/Rejections

**Template Functions:**
- `generateOTPEmail(email, otp)`
- `generateWelcomeEmail(name, email)`
- `generateOrderConfirmationEmail(...)`
- `generatePaymentReceivedEmail(...)`
- `generateOrderApprovedEmail(...)`
- `generateOrderRejectedEmail(...)`
- `generateOrderShippedEmail(...)`
- `generateOrderDeliveredEmail(...)`
- `generateAdminNewOrderEmail(...)`
- `generateAdminPaymentReceivedEmail(...)`
- `generateRoleChangeEmail(...)`
- `generateProfileUpdateEmail(...)`

### Email Flow Diagrams

#### Order Flow
```
1. Order Created
   ├─> Customer: Order Confirmation Email
   └─> Admin: New Order Notification

2. Payment Recorded
   ├─> Customer: Payment Received Email
   └─> Admin: Payment Notification

3. Order Approved (Admin Action)
   └─> Customer: Order Approved Email

4. Order Shipped (Admin Action)
   └─> Customer: Order Shipped Email (with tracking)

5. Order Delivered (Admin Action)
   └─> Customer: Order Delivered Email
```

#### User Management Flow
```
1. User Registers (OTP)
   ├─> User: OTP Email
   └─> User: Welcome Email (after verification)

2. User Profile Updated
   └─> User: Profile Update Email

3. Admin Changes User Role
   └─> User: Role Change Email
```

---

## Testing

### Manual Testing Checklist

#### Authentication Emails
- [ ] Request OTP - verify OTP email received
- [ ] New user registration - verify welcome email received
- [ ] Check OTP expiration (10 minutes)
- [ ] Verify OTP code is correct in email

#### Order Emails (User)
- [ ] Create order - verify order confirmation
- [ ] Record payment - verify payment confirmation
- [ ] Admin approves order - verify approval email
- [ ] Admin rejects order - verify rejection email with reason
- [ ] Admin ships order - verify shipping email with tracking
- [ ] Admin delivers order - verify delivery email

#### Order Emails (Admin)
- [ ] Create order - verify admin notification
- [ ] Record payment - verify admin payment notification

#### User Management Emails
- [ ] Admin changes user role - verify role change email
- [ ] User updates profile - verify profile update email
- [ ] Admin updates user profile - verify profile update email

### Test Accounts

**Customer Test Account:**
```
Email: customer@example.com
```

**Admin Test Account:**
```
Email: admin@example.com
Role: admin
```

### Development Mode

In development mode (`NODE_ENV=development`):
- OTP is also logged to console for debugging
- Email sending errors are logged but don't break the request
- OTP is included in API response (for testing only)

### Email Verification

Check emails in:
1. Hostinger webmail: https://webmail.hostinger.com
2. Email client configured with `pardeeps@anamicoindia.com`

---

## Troubleshooting

### Common Issues

#### 1. Emails Not Sending

**Symptoms:** No emails received, console shows errors

**Solutions:**
- Verify SMTP credentials in `.env`
- Check Hostinger account is active
- Verify email quota hasn't been exceeded
- Check spam/junk folders
- Review server logs for errors

**Debug Steps:**
```bash
# Check environment variables
echo $EMAIL_SERVER_HOST
echo $EMAIL_SERVER_PORT
echo $EMAIL_SERVER_USER

# Test SMTP connection
npm run dev
# Check console for "✅ Email server is ready to send emails"
```

#### 2. SMTP Authentication Failed

**Error:** `Invalid login: 535 authentication failed`

**Solutions:**
- Verify `EMAIL_SERVER_USER` and `EMAIL_SERVER_PASSWORD`
- Check if 2FA is enabled (may need app password)
- Verify email account is not locked
- Try logging into webmail manually

#### 3. Connection Timeout

**Error:** `Connection timeout`

**Solutions:**
- Check firewall settings
- Verify correct port (465 for SSL, 587 for TLS)
- Try alternative port if one doesn't work
- Check network connectivity

#### 4. Emails Going to Spam

**Solutions:**
- Add SPF record to domain DNS
- Configure DKIM signing
- Set up DMARC policy
- Avoid spam trigger words
- Ensure consistent "From" address

#### 5. Template Rendering Issues

**Symptoms:** Broken layouts, missing styles

**Solutions:**
- Test in multiple email clients
- Use inline CSS (already implemented)
- Avoid JavaScript and external resources
- Test with plain text fallback

### Environment Variables Checklist

Ensure all required variables are set:

```bash
# Required for email functionality
✓ EMAIL_SERVER_HOST
✓ EMAIL_SERVER_PORT
✓ EMAIL_SERVER_USER
✓ EMAIL_SERVER_PASSWORD
✓ EMAIL_FROM
✓ ADMIN_EMAIL
✓ NEXT_PUBLIC_APP_URL
```

### Logs and Monitoring

Email operations are logged with emoji prefixes:

- ✅ Success: Email sent successfully
- ❌ Error: Email failed to send

**Example logs:**
```
✅ OTP email sent to user@example.com
✅ Order confirmation email sent to customer@example.com
✅ Admin notification email sent for order ORD-123456ABC
❌ Failed to send order confirmation email: [error details]
```

### Support

For email-related issues:
1. Check application logs
2. Verify Hostinger email account status
3. Review email quota and limits
4. Contact Hostinger support if needed

---

## Security Considerations

1. **Credentials Storage**
   - Never commit `.env` file to version control
   - Use environment variables for all sensitive data
   - Rotate passwords regularly

2. **Email Content**
   - Don't include full password in emails
   - OTP expires in 10 minutes
   - Include security warnings in sensitive emails

3. **Rate Limiting**
   - Consider implementing rate limiting for OTP requests
   - Monitor for email abuse
   - Set up alerts for unusual email volume

4. **Data Privacy**
   - Only include necessary information
   - Use secure links (HTTPS)
   - Comply with data protection regulations

---

## Future Enhancements

1. **Email Queue System**
   - Implement Bull/Redis for email queuing
   - Retry failed emails automatically
   - Better handling of email bursts

2. **Email Templates**
   - Add more customization options
   - Support for multiple languages
   - Dynamic branding

3. **Analytics**
   - Track email open rates
   - Monitor click-through rates
   - Analyze delivery rates

4. **Additional Notifications**
   - Cart abandonment reminders
   - Low stock alerts (admin)
   - Promotional emails
   - Newsletter system
   - Review requests

5. **Multi-channel Notifications**
   - SMS notifications
   - Push notifications
   - In-app notifications

---

## API Reference

### Email Service Functions

#### `sendEmail(options: EmailOptions)`
Send an email to specified recipient(s).

**Parameters:**
```typescript
interface EmailOptions {
  to: string | string[];     // Recipient email(s)
  subject: string;            // Email subject
  html: string;               // HTML content
  text?: string;              // Plain text fallback
  from?: string;              // Sender (defaults to EMAIL_FROM)
}
```

**Returns:** `Promise<void>`

**Example:**
```typescript
import { sendEmail } from '@/lib/email';

await sendEmail({
  to: 'customer@example.com',
  subject: 'Order Confirmation',
  html: '<h1>Thank you for your order!</h1>',
  text: 'Thank you for your order!',
});
```

#### `sendAdminEmail(subject: string, html: string, text?: string)`
Send an email to admin.

**Parameters:**
- `subject` - Email subject (auto-prefixed with "[Admin]")
- `html` - HTML content
- `text` - Plain text fallback (optional)

**Returns:** `Promise<void>`

**Example:**
```typescript
import { sendAdminEmail } from '@/lib/email';

await sendAdminEmail(
  'New Order Received',
  '<h1>New order #12345</h1>',
  'New order #12345'
);
```

### Email Template Functions

All template functions return:
```typescript
{
  html: string;  // HTML email content
  text: string;  // Plain text fallback
}
```

See function signatures in `lib/email-templates.ts` for specific parameters.

---

## Conclusion

The email system provides comprehensive automated notifications for all critical user interactions in the Anamico India e-commerce platform. All emails are professionally designed, mobile-responsive, and include both HTML and plain text versions for maximum compatibility.

For questions or issues, refer to the troubleshooting section or contact the development team.

**Last Updated:** 2025-11-15
**Version:** 1.0.0
