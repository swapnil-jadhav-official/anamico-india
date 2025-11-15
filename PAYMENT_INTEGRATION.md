# Payment Integration Guide - Razorpay Live Setup

## Overview
This document outlines the Razorpay payment integration for the AnamiCo India e-commerce platform. The integration supports **partial payments** (30%, 50%, or 100%) and includes a complete order management workflow.

---

## ✅ Current Status

### Completed Features
- ✅ **Product Management** - Full CRUD operations for products
- ✅ **User Management** - User authentication & role-based access
- ✅ **Shopping Cart System** - Add/remove items, quantity management
- ✅ **Order Management** - Order creation, tracking, and history
- ✅ **Payment Gateway Integration** - Razorpay live mode configured

---

## 🔧 Configuration

### Environment Variables

The following environment variables have been configured in `.env.local`:

```bash
# Razorpay Live Credentials
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_RbH2h92uvHsysH
RAZORPAY_KEY_SECRET=9ytahSnz7F4psRNwyFcALMxY

# Database Configuration
DATABASE_URL=mysql://u761240159_anamicodb:Anamico@123@srv1552.hstgr.io:3306/u761240159_anamicodb

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
```

**⚠️ Important Notes:**
- `.env.local` is gitignored for security
- Never commit credentials to version control
- Update `NEXTAUTH_SECRET` for production deployment
- Update `NEXTAUTH_URL` to production domain when deploying

---

## 💳 Payment Flow

### 1. Order Creation
**Endpoint:** `POST /api/orders`

User creates an order with shipping details and cart items.

**Order Status:** `pending` (awaiting payment)
**Payment Status:** `pending`

### 2. Payment Initialization
**Endpoint:** `POST /api/payments`

**Request:**
```json
{
  "orderId": "order-uuid",
  "paymentType": "30" | "50" | "100"
}
```

**Response:**
```json
{
  "success": true,
  "razorpayOrderId": "order_xxx",
  "checkoutOptions": { /* Razorpay options */ },
  "paymentAmount": 12000,
  "paymentType": "30"
}
```

### 3. Payment Processing
- Razorpay checkout modal opens
- User completes payment
- Razorpay returns payment details

### 4. Payment Verification
**Endpoint:** `POST /api/payments` (verification)

**Request:**
```json
{
  "orderId": "order-uuid",
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature_xxx",
  "paymentType": "30"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "payment": {
    "id": "pay_xxx",
    "amount": 12000,
    "status": "captured"
  }
}
```

**Order Status:** `payment_received` (awaiting admin approval)
**Payment Status:** `partial_payment` or `completed`

---

## 📊 Payment Options

The system supports three payment tiers:

| Option | Percentage | Description |
|--------|-----------|-------------|
| **Partial 30%** | 30% | Pay 30% upfront, rest after admin approval |
| **Partial 50%** | 50% | Pay 50% upfront, rest after admin approval |
| **Full Payment** | 100% | Pay complete amount upfront |

**Amount Calculation:**
```typescript
const paymentAmount = Math.round(orderTotal * (paymentType / 100));
```

---

## 🔐 Security Features

### Signature Verification
All payments are verified using HMAC SHA256:

```typescript
const body = `${orderId}|${paymentId}`;
const expectedSignature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(body)
  .digest('hex');
```

### Payment Validation
- ✅ User authentication required
- ✅ Order ownership verification
- ✅ Payment signature validation
- ✅ Payment amount verification
- ✅ Order status validation

---

## 📁 Code Structure

### Core Files

#### Payment Library
- **`lib/razorpay.ts`** - Main Razorpay integration
  - `createRazorpayOrder()` - Create payment order
  - `verifyRazorpaySignature()` - Verify payment
  - `fetchRazorpayPayment()` - Fetch payment details
  - `captureRazorpayPayment()` - Capture payment
  - `createRazorpayRefund()` - Process refunds

#### API Routes
- **`app/api/payments/route.ts`** - Payment creation & verification
- **`app/api/orders/route.ts`** - Order creation & listing
- **`app/api/orders/[orderId]/payment/route.ts`** - Payment recording

#### Frontend Components
- **`components/checkout/razorpay-checkout.tsx`** - Razorpay checkout component
- **`app/checkout/payment/page.tsx`** - Payment page UI

#### Database Schema
- **`drizzle/schema.ts`** - Order & payment tables
  - `order` table - Order details, payment tracking
  - `orderItem` table - Individual order items

---

## 🎨 Frontend Integration

### Razorpay Checkout Component

```tsx
<RazorpayCheckout
  orderId={orderId}
  paymentType={30 | 50 | 100}
  onPaymentSuccess={(data) => {
    // Handle success
  }}
  onPaymentFailure={(error) => {
    // Handle failure
  }}
/>
```

### Payment Page Features
- ✅ Payment percentage selection (30%, 50%, 100%)
- ✅ Real-time amount calculation
- ✅ Order summary display
- ✅ Payment success/failure handling
- ✅ Automatic redirect to order confirmation

---

## 🔄 Order Workflow

```mermaid
graph TD
    A[Customer adds items to cart] --> B[Proceed to checkout]
    B --> C[Enter shipping details]
    C --> D[Create order - Status: PENDING]
    D --> E[Select payment option 30%/50%/100%]
    E --> F[Razorpay payment processing]
    F --> G{Payment Success?}
    G -->|Yes| H[Status: PAYMENT_RECEIVED]
    G -->|No| I[Status: PENDING]
    H --> J[Admin reviews order]
    J --> K{Admin Decision}
    K -->|Accept| L[Status: ACCEPTED]
    K -->|Reject| M[Status: REJECTED]
    L --> N[Collect remaining payment if partial]
    N --> O[Status: SHIPPED]
    O --> P[Status: DELIVERED]
```

---

## 🗄️ Database Schema

### Order Table
```sql
- id: VARCHAR(255) PRIMARY KEY
- userId: VARCHAR(255) - References user
- orderNumber: VARCHAR(255) UNIQUE
- subtotal: INT - Amount before tax
- tax: INT - GST (18%)
- total: INT - Final amount
- paidAmount: INT - Amount paid
- status: VARCHAR(255) - Order status
- paymentStatus: VARCHAR(255) - Payment status
- paymentMethod: VARCHAR(255) - razorpay
- paymentId: VARCHAR(255) - Razorpay payment ID
- shippingName, shippingEmail, shippingPhone
- shippingAddress, shippingCity, shippingState, shippingPincode
- adminNotes: TEXT
- rejectionReason: TEXT
- createdAt, updatedAt
```

### Order Statuses
- `pending` - Order created, awaiting payment
- `payment_received` - Payment received, awaiting admin approval
- `accepted` - Admin approved order
- `rejected` - Admin rejected order
- `shipped` - Order shipped
- `delivered` - Order delivered
- `cancelled` - Order cancelled

### Payment Statuses
- `pending` - No payment received
- `partial_payment` - Partial payment received
- `completed` - Full payment received
- `failed` - Payment failed

---

## 🧪 Testing

### Development Mode (Mock Razorpay)
To test without real payments, use mock credentials:

```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_mock_key
```

The system will automatically use mock mode when `KEY_ID` contains "mock".

### Production Mode (Live Razorpay)
Use the configured live credentials:

```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_RbH2h92uvHsysH
```

---

## 📝 Admin Features

### Order Management
Admin can:
- ✅ View all orders
- ✅ Filter by status
- ✅ Accept/reject orders
- ✅ Add admin notes
- ✅ Track payment status
- ✅ Update order status (shipped, delivered)

**Admin Routes:**
- `/admin/orders` - Order list
- `/admin/orders/[orderId]` - Order details

---

## 🚀 Next Steps

### Remaining Features to Implement

1. **Email Notifications**
   - Order confirmation emails
   - Payment receipt emails
   - Order status update emails
   - Admin notification emails

2. **Delivery Tracking**
   - Third-party courier integration
   - Tracking number storage
   - Real-time shipment tracking
   - Delivery status updates

3. **Admin Analytics Dashboard**
   - Revenue charts
   - Order statistics
   - Product performance
   - Payment analytics

4. **Additional Features**
   - Order invoice generation (PDF)
   - Refund processing
   - Customer reviews & ratings
   - Wishlist functionality
   - Product search & filters

---

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local` to git
   - Use different keys for dev/staging/production
   - Rotate keys periodically

2. **Payment Security**
   - Always verify payment signatures
   - Validate payment amounts server-side
   - Log all payment transactions
   - Handle errors gracefully

3. **Order Security**
   - Verify user ownership before updates
   - Sanitize admin inputs
   - Prevent duplicate orders
   - Rate limit payment attempts

---

## 📞 Support & Resources

### Razorpay Documentation
- [Razorpay Checkout Docs](https://razorpay.com/docs/payments/payment-gateway/web-integration/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Payment Verification](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/#step-4-verify-payment-signature)

### Contact
- **Razorpay Support:** support@razorpay.com
- **Dashboard:** https://dashboard.razorpay.com/

---

## 📋 Deployment Checklist

Before deploying to production:

- [ ] Update `NEXTAUTH_SECRET` with a secure random string
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Verify Razorpay live credentials
- [ ] Test payment flow end-to-end
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure email service for notifications
- [ ] Set up database backups
- [ ] Configure HTTPS/SSL
- [ ] Test all order statuses and transitions
- [ ] Review security headers and CORS settings

---

**Last Updated:** 2025-11-14
**Version:** 1.0.0
