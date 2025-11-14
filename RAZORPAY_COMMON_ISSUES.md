# Razorpay Common Issues & Solutions

## 🚨 Issue: "International cards are not supported"

### Error Message
```
Payment could not be completed
International cards are not supported. Please contact our support team for help
```

### Why This Happens

This error occurs in **LIVE MODE** when:
1. Your Razorpay account doesn't have international payments enabled
2. You're using a non-Indian card (Visa/Mastercard issued outside India)
3. Your account is configured for domestic (Indian) payments only

**This is NOT a code issue - it's an account configuration issue.**

---

## ✅ Solutions

### Solution 1: Enable International Payments (Recommended for Production)

#### Step 1: Login to Razorpay Dashboard
Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)

#### Step 2: Navigate to Settings
1. Click **Settings** (gear icon)
2. Go to **Payment Methods**
3. Find **Cards** section

#### Step 3: Enable International Cards
1. Look for "International Cards" toggle
2. Enable it
3. You may need to:
   - Complete KYC verification
   - Provide business documents
   - Wait for Razorpay approval (1-2 business days)

#### Step 4: Contact Razorpay Support
If the option is not available:
- Email: support@razorpay.com
- Phone: +91-80-68727374
- Request: "Enable international card payments for my account"

**Note:** Razorpay charges additional fees for international transactions (~3-4% vs 2% for domestic).

---

### Solution 2: Switch to Test Mode (Recommended for Development)

For development and testing, **always use test mode** to avoid these issues:

#### Update `.env.local`:
```bash
# Switch to test credentials
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_TEST_KEY_HERE
RAZORPAY_KEY_SECRET=YOUR_TEST_SECRET_HERE
```

#### Get Test Credentials:
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Switch to **Test Mode** (toggle at top)
3. Settings → API Keys → Generate Test Keys

#### Restart Dev Server:
```bash
npm run dev
```

#### Use Test Cards:
```
Card: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
```

**Benefits:**
- ✅ No real money involved
- ✅ No account restrictions
- ✅ Test all payment scenarios
- ✅ Unlimited testing

---

### Solution 3: Use Indian Cards for Testing (Live Mode)

If you must test in live mode, use:
- ✅ Indian debit cards (RuPay, Visa India, Mastercard India)
- ✅ Indian credit cards
- ✅ Indian UPI (recommended for Indian customers)
- ✅ Net Banking (any Indian bank)

**How to identify Indian vs International cards:**
- **Indian Visa/Mastercard:** First 6 digits (BIN) registered in India
- **International Cards:** Cards issued by banks outside India

---

## 🌍 Payment Methods Configuration

### Check Current Configuration

Visit your Razorpay dashboard to see which payment methods are enabled:

**Dashboard → Settings → Payment Methods**

Common configurations:

#### Domestic Only (Default)
- ✅ Indian Cards
- ✅ UPI
- ✅ Net Banking
- ✅ Wallets (Paytm, PhonePe, etc.)
- ❌ International Cards

#### International Enabled (Requires Approval)
- ✅ Indian Cards
- ✅ UPI
- ✅ Net Banking
- ✅ Wallets
- ✅ International Cards (Visa/Mastercard/Amex worldwide)

---

## 🔍 Identifying the Issue

### Check Your Card Type

If you're getting the "international cards not supported" error:

1. **Check card BIN (first 6 digits)**
   - Indian Visa: Usually starts with 4xxx (but registered in India)
   - International Visa: 4xxx but registered outside India
   - RuPay (India only): Starts with 6, 60, 65, 81, 82, 508

2. **Check issuing bank**
   - If issued by Indian bank (SBI, HDFC, ICICI, etc.) = Domestic
   - If issued by foreign bank = International

3. **Test with UPI (Always Works in India)**
   - UPI is domestic-only by design
   - Always enabled in Razorpay
   - Recommended for Indian customers

---

## 📱 Alternative Payment Methods (Always Available)

While waiting for international card approval, use these:

### 1. UPI (Unified Payments Interface)
- **Best for Indian customers**
- Instant, secure, no charges for customers
- Apps: Google Pay, PhonePe, Paytm, BHIM

### 2. Net Banking
- All major Indian banks supported
- Direct bank transfer
- Higher success rate

### 3. Wallets
- Paytm, PhonePe, Amazon Pay
- Popular in India

### 4. Indian Debit/Credit Cards
- RuPay cards (India-specific)
- Visa/Mastercard issued in India

---

## 🧪 Testing Different Payment Methods

### Test Mode Supports All Methods

When using `rzp_test_*` credentials, you can test:

**Test UPI:**
```
UPI ID: success@razorpay
Result: Successful payment
```

```
UPI ID: failure@razorpay
Result: Failed payment
```

**Test Net Banking:**
- Select any bank
- Use test credentials provided
- Payment succeeds automatically

**Test Wallets:**
- Select any wallet
- Auto-succeeds in test mode

**Test Cards:**
- Domestic: `4111 1111 1111 1111`
- International: Same card works (no restrictions in test mode)

---

## 🔧 Quick Fix Checklist

When you get "International cards not supported":

- [ ] Are you using **live credentials** (`rzp_live_*`)?
- [ ] Is the card issued **outside India**?
- [ ] Have you enabled **international payments** in Razorpay dashboard?
- [ ] Have you completed **KYC verification**?
- [ ] Have you contacted **Razorpay support** to enable international?

**Quick Solution:** Switch to **test mode** for development!

---

## 💡 Best Practices

### For Development & Testing
```bash
# Always use test mode
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET
```

### For Staging
```bash
# Use test mode with real-like data
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET
```

### For Production
```bash
# Use live mode only when ready
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET

# Make sure you have:
# ✅ Completed KYC
# ✅ Enabled required payment methods
# ✅ Tested thoroughly in test mode
# ✅ International cards enabled (if needed)
```

---

## 📞 Razorpay Support Contact

### Enable International Payments
**Email Template:**
```
Subject: Request to Enable International Card Payments

Dear Razorpay Support,

I would like to enable international card payments for my account.

Account Details:
- Key ID: rzp_live_RbH2h92uvHsysH
- Business Name: AnamiCo India
- Use Case: E-commerce electronics store

I have completed KYC verification and understand the additional processing fees for international transactions.

Please enable this feature and let me know if you need any additional information.

Thank you,
[Your Name]
```

### Contact Information
- **Email:** support@razorpay.com
- **Phone:** +91-80-68727374
- **Help Center:** https://razorpay.com/support/
- **Dashboard:** https://dashboard.razorpay.com/

### Typical Response Time
- Email: 24-48 hours
- Phone: Immediate
- Feature Activation: 1-2 business days after approval

---

## 🎯 Recommended Approach

### For Your Situation

1. **Immediate Solution (Now):**
   - Switch to **test mode** for development
   - Use test cards: `4111 1111 1111 1111`
   - Complete all testing without restrictions

2. **Short-term Solution (This Week):**
   - Contact Razorpay support to enable international cards
   - Complete KYC if not done
   - Wait for approval

3. **Production Ready (Before Launch):**
   - Verify international payments are enabled
   - Test with real small amounts
   - Configure all required payment methods
   - Set up webhooks for payment notifications

---

## 🌐 Payment Method Availability by Region

### Indian Customers (Always Supported)
- ✅ Indian Cards (RuPay, Visa India, Mastercard India)
- ✅ UPI (Google Pay, PhonePe, Paytm)
- ✅ Net Banking (All major banks)
- ✅ Wallets

### International Customers (Requires Approval)
- 🔓 Visa/Mastercard (Worldwide) - Needs activation
- 🔓 Amex (Worldwide) - Needs activation
- ❌ UPI (Not available outside India)
- ❌ Net Banking (Not available outside India)

---

## 📊 Transaction Fees (For Reference)

### Domestic Transactions (Indian Cards/UPI)
- **Domestic Cards:** ~2% per transaction
- **UPI:** Free for customers, ~0.5% for merchant
- **Net Banking:** ~2% per transaction
- **Wallets:** ~2% per transaction

### International Transactions (After Enabling)
- **International Cards:** ~3-4% per transaction
- **Additional charges:** Currency conversion fees may apply

---

## ✅ Action Items for You

Based on your current situation with live credentials:

### Option A: Continue with Live Mode (Production Ready)
1. Contact Razorpay support today
2. Request international card payments
3. Complete KYC if pending
4. Wait 1-2 business days for approval
5. Test with Indian payment methods meanwhile

### Option B: Switch to Test Mode (Recommended for Development)
1. Get test credentials from Razorpay dashboard
2. Update `.env.local` with test keys
3. Restart dev server
4. Test freely with test cards and payment methods
5. Switch to live mode only when launching

**Recommendation:** Use **Option B** for now, and work on **Option A** in parallel for production readiness.

---

**Last Updated:** 2025-11-14
