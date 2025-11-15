# Razorpay Test Card Numbers & Mode Switching

## 🔴 CRITICAL: Check Your Current Mode

Your app is currently configured with **LIVE** credentials:
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_RbH2h92uvHsysH
```

**This means:**
- ❌ Test card numbers will NOT work
- ✅ Only real cards will work
- 💰 Real money will be charged!

---

## 🎯 Option 1: Switch to Test Mode (For Safe Testing)

### Step 1: Get Test Credentials

1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. **Switch to Test Mode** (toggle at top-right)
3. Go to **Settings** → **API Keys**
4. Click **Generate Test Keys**
5. Copy both Key ID and Key Secret

### Step 2: Update Environment Variables

Edit `.env.local`:
```bash
# Razorpay TEST Credentials (no real money)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_TEST_KEY_HERE
RAZORPAY_KEY_SECRET=YOUR_TEST_SECRET_HERE
```

### Step 3: Restart Development Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 4: Use Test Cards

Now you can use these test card numbers:

#### ✅ Successful Payment Cards
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
Name: Test User
```

```
Card Number: 5555 5555 5555 4444 (Mastercard)
CVV: 123
Expiry: 12/25
Name: Test User
```

#### ❌ Failure Test Cards
```
Card Number: 4000 0000 0000 0002 (Declined)
Card Number: 4000 0000 0000 0010 (Invalid)
```

---

## 🎯 Option 2: Stay in Live Mode (Real Payments)

If you want to test with live mode, you must use:
- ✅ **Real debit/credit cards**
- 💰 **Real money will be charged**
- ⚠️ **Not recommended for testing**

**Tip:** If testing in live mode, use small amounts!

---

## 🔄 Switching Between Modes

### Development (Testing)
```bash
# .env.local
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_TEST_SECRET
```

### Staging (Testing with Real Payment Flow)
```bash
# .env.local
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_TEST_SECRET
```

### Production (Live Payments)
```bash
# .env.production or server environment
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_RbH2h92uvHsysH
RAZORPAY_KEY_SECRET=9ytahSnz7F4psRNwyFcALMxY
```

---

## 📱 Test Payment Scenarios

### Scenario 1: Successful Card Payment (Test Mode)
1. Use card: `4111 1111 1111 1111`
2. Enter CVV: `123`
3. Enter Expiry: `12/25`
4. Click Pay
5. Payment succeeds automatically

### Scenario 2: Failed Payment (Test Mode)
1. Use card: `4000 0000 0000 0002`
2. Payment will be declined
3. Error message appears

### Scenario 3: UPI Payment (Test Mode)
1. Select UPI option
2. Use test UPI ID: `success@razorpay`
3. Payment succeeds

### Scenario 4: Net Banking (Test Mode)
1. Select any bank
2. Use test credentials shown
3. Payment succeeds

---

## 🔐 Additional Test Details

### Test OTP (if required)
In test mode, Razorpay may show you a test OTP on the screen or accept any OTP.

### Test 3D Secure
For cards requiring 3D Secure (OTP):
- Use card: `4000 0000 0000 3220`
- Test OTP will be provided in the interface

### International Cards (Test Mode)
```
Visa: 4111 1111 1111 1111
Mastercard: 5555 5555 5555 4444
Amex: 3782 822463 10005
Diners: 3056 9309 0259 04
```

---

## 🚨 Common Mistakes

### ❌ Using Test Cards with Live Keys
```bash
# This will NOT work:
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx  # Live key
Card: 4111 1111 1111 1111  # Test card ❌
```

### ✅ Correct Combinations
```bash
# Test Mode:
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx  # Test key
Card: 4111 1111 1111 1111  # Test card ✅

# Live Mode:
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx  # Live key
Card: Real card number  # Real card ✅
```

---

## 📊 Quick Reference

| Mode | Key Prefix | Card Numbers | Money |
|------|-----------|--------------|-------|
| **Test** | `rzp_test_` | Test cards (4111...) | Fake (₹0) |
| **Live** | `rzp_live_` | Real cards only | Real money |

---

## 🔗 Useful Links

- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-upi-details/)
- [Razorpay Dashboard](https://dashboard.razorpay.com/)
- [API Documentation](https://razorpay.com/docs/api/)
- [Payment Methods](https://razorpay.com/docs/payments/payment-methods/)

---

## ⚙️ Quick Switch Script

Create this file for easy mode switching:

**File: `scripts/switch-razorpay-mode.sh`**
```bash
#!/bin/bash

echo "Switch Razorpay Mode"
echo "1. Test Mode"
echo "2. Live Mode"
read -p "Select mode (1 or 2): " mode

if [ "$mode" = "1" ]; then
    echo "Switching to TEST mode..."
    echo "Update your .env.local with rzp_test_ credentials"
elif [ "$mode" = "2" ]; then
    echo "Switching to LIVE mode..."
    echo "Update your .env.local with rzp_live_ credentials"
fi

echo "Don't forget to restart your dev server!"
```

---

**Last Updated:** 2025-11-14
