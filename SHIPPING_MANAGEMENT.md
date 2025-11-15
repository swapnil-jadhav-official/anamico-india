# Shipping & Delivery Management

## Overview
Admin can now manage order shipping and delivery with tracking information throughout the order lifecycle.

---

## 🗄️ Database Migration Required

**IMPORTANT:** Before using the new shipping features, run the database migration to add required fields.

### Run Migration:

```bash
# Option 1: Using drizzle-kit push (Recommended for development)
npm run drizzle:push

# Option 2: Using drizzle-kit migrate (For production)
npm run drizzle:migrate

# Option 3: Run SQL manually
# Execute the SQL in: drizzle/migrations/0007_add_tracking_fields.sql
```

### New Database Fields Added:
- `trackingNumber` - Courier tracking number (VARCHAR 255)
- `shippingCarrier` - Courier company name (VARCHAR 255)
- `shippedAt` - Timestamp when order was shipped
- `deliveredAt` - Timestamp when order was delivered

---

## 📦 Order Status Flow

```
pending
   ↓ (customer pays)
payment_received
   ↓ (admin approves)
accepted
   ↓ (admin ships with tracking)
shipped
   ↓ (admin confirms delivery)
delivered
```

**Alternative Path:**
- `payment_received` → `rejected` (admin rejects)

---

## 🎯 Admin Features

### 1. **Approve/Reject Orders** (payment_received status)
- Review order details
- Approve to move to "accepted" status
- Reject with reason for refund

### 2. **Ship Orders** (accepted status)
**Requirements:**
- Tracking Number (required)
- Shipping Carrier (required)
- Admin Notes (optional)

**Actions:**
1. Click "Mark as Shipped" button
2. Enter tracking number
3. Enter carrier name (e.g., FedEx, DHL, BlueDart, DTDC)
4. Add optional notes
5. Confirm shipment

**Result:**
- Order status changes to "shipped"
- `shippedAt` timestamp recorded
- Tracking info saved

### 3. **Mark as Delivered** (shipped status)
**Actions:**
1. Click "Mark as Delivered" button
2. Confirm delivery

**Result:**
- Order status changes to "delivered"
- `deliveredAt` timestamp recorded
- Order completed

### 4. **View Tracking Information** (shipped/delivered status)
Displays:
- Tracking Number
- Shipping Carrier
- Shipped Date & Time
- Delivered Date & Time (if delivered)

---

## 🖥️ Admin UI Pages

### Order List (`/admin/orders`)
- Filter by status (All, Pending, Awaiting Approval, Accepted, Shipped, Delivered)
- View all orders with status badges
- Quick actions for payment_received orders

### Order Details (`/admin/orders/[orderId]`)

**For `payment_received` orders:**
- ✅ Approve Order button
- ❌ Reject Order button

**For `accepted` orders:**
- 📦 Mark as Shipped button (opens shipping form)

**For `shipped` orders:**
- 🚚 Tracking Information card
- ✅ Mark as Delivered button

**For `delivered` orders:**
- 🚚 Tracking Information card
- ✅ Delivery timestamp displayed

---

## 🔄 API Endpoints

### Update Order Status
**Endpoint:** `PATCH /api/admin/orders/[orderId]`

#### Approve Order
```json
{
  "action": "approve",
  "adminNotes": "Verified order details"
}
```

#### Reject Order
```json
{
  "action": "reject",
  "rejectionReason": "Product out of stock",
  "adminNotes": "Refund initiated"
}
```

#### Ship Order
```json
{
  "action": "ship",
  "trackingNumber": "1234567890",
  "shippingCarrier": "BlueDart",
  "adminNotes": "Shipped via express delivery"
}
```

#### Deliver Order
```json
{
  "action": "deliver"
}
```

### Status Transition Rules

| Current Status | Allowed Actions | Next Status |
|----------------|----------------|-------------|
| `payment_received` | approve, reject | accepted, rejected |
| `accepted` | ship | shipped |
| `shipped` | deliver | delivered |
| `rejected` | (none) | (final state) |
| `delivered` | (none) | (final state) |

**Error Handling:**
- Invalid action returns 400
- Wrong status transition returns 400
- Missing required fields returns 400

---

## 📊 Common Shipping Carriers (India)

### Popular Couriers:
- **BlueDart** - Premier service
- **DTDC** - Nationwide coverage
- **Delhivery** - E-commerce focused
- **FedEx India** - International + Domestic
- **DHL Express** - Premium service
- **India Post** - Speed Post
- **Ecom Express** - E-commerce logistics
- **Xpressbees** - Fast delivery
- **Shadowfax** - Hyperlocal delivery

### International:
- **DHL**
- **FedEx**
- **UPS**
- **Aramex**
- **TNT**

---

## 🎨 Status Badge Colors

| Status | Badge Color | Description |
|--------|------------|-------------|
| Pending Payment | Gray | Awaiting payment |
| Payment Received | Yellow | Awaiting admin approval |
| Accepted | Green | Approved, ready to ship |
| Shipped | Blue | On the way |
| Delivered | Dark Green | Completed |
| Rejected | Red | Cancelled with refund |

---

## 🧪 Testing Workflow

### Test Complete Order Flow:

1. **Create Order (Customer)**
   - Add products to cart
   - Proceed to checkout
   - Complete payment (30%, 50%, or 100%)
   - Order created with status: `payment_received`

2. **Approve Order (Admin)**
   - Go to `/admin/orders`
   - Click "Awaiting Approval" tab
   - View order details
   - Click "Approve Order"
   - Order status: `accepted`

3. **Ship Order (Admin)**
   - View accepted order
   - Click "Mark as Shipped"
   - Enter tracking number: `TEST123456789`
   - Enter carrier: `BlueDart`
   - Confirm shipment
   - Order status: `shipped`
   - Verify tracking info displayed

4. **Deliver Order (Admin)**
   - View shipped order
   - Click "Mark as Delivered"
   - Confirm delivery
   - Order status: `delivered`
   - Verify delivery timestamp

---

## 🚨 Important Notes

### Before Shipping:
- ✅ Verify order items are packed
- ✅ Confirm shipping address
- ✅ Generate courier label
- ✅ Get valid tracking number
- ✅ Enter correct carrier name

### Data Validation:
- Tracking number is **required** for shipping
- Carrier name is **required** for shipping
- Status transitions are **strictly enforced**
- Timestamps are **auto-generated** (server-side)

### Customer Notifications:
*Note: Email notifications are not yet implemented. Coming in future updates.*

Planned notifications:
- Order approved
- Order shipped (with tracking)
- Order delivered

---

## 🔮 Future Enhancements

### Planned Features:
1. **Email Notifications**
   - Order status updates
   - Tracking information

2. **Customer Tracking Page**
   - Real-time tracking status
   - Estimated delivery date
   - Courier website link

3. **Bulk Operations**
   - Mark multiple orders as shipped
   - Bulk status updates
   - CSV import for tracking numbers

4. **Courier API Integration**
   - Auto-fetch tracking status
   - Real-time updates
   - Delivery confirmation automation

5. **Shipment Labels**
   - Generate shipping labels
   - Print packing slips
   - Generate invoices

---

## 📚 Related Documentation

- `PAYMENT_INTEGRATION.md` - Razorpay payment setup
- `RAZORPAY_TEST_CARDS.md` - Testing payment flow
- `RAZORPAY_DEBUGGING.md` - Payment troubleshooting

---

**Last Updated:** 2025-11-14
**Version:** 1.0.0
