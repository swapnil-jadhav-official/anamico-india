# Razorpay Checkout Debugging Guide

## Issue: Razorpay Checkout Not Appearing

If the Razorpay checkout modal is not appearing, follow these steps:

---

## 1. ⚠️ IMPORTANT: Restart the Development Server

After adding or modifying `.env.local`, you **MUST** restart your Next.js development server for the changes to take effect.

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it:
npm run dev
# OR
pnpm dev
# OR
yarn dev
```

**Environment variables are only loaded when the Next.js server starts!**

---

## 2. Verify Environment Variables

Open your browser console (F12) and check the logs. You should see:

```
Razorpay Key ID: rzp_live_RbH2h92uvHsysH
Loading Razorpay script...
Razorpay script loaded successfully
```

If you see `undefined` instead of the key ID, the environment variable is not loaded:
- ✅ Make sure `.env.local` exists in the project root
- ✅ Make sure the variable is prefixed with `NEXT_PUBLIC_`
- ✅ **Restart your dev server** (this is the most common issue!)

---

## 3. Check Browser Console for Errors

When you click the payment button, watch the browser console for:

### Expected Logs:
```
Initiating payment for order: <order-id> Payment type: 30
Payment API response status: 200
Payment order created: {...}
Is production mode? true
Razorpay options: {...}
Using real Razorpay checkout
Opening Razorpay checkout...
```

### Common Errors:

#### Error: "Razorpay script not loaded"
**Solution:** The Razorpay checkout script failed to load. Check:
- Internet connection
- Browser console for network errors
- If using ad blockers, disable them

#### Error: "Failed to create payment order"
**Solution:** Backend API issue. Check:
- The order ID is valid
- User is authenticated
- Database connection is working
- Server logs for errors

---

## 4. Network Tab Check

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Click the payment button
4. Look for these requests:

### Request 1: Create Payment Order
- **URL:** `/api/payments`
- **Method:** POST
- **Status:** Should be 200
- **Response:** Should contain `razorpayOrderId` and `checkoutOptions`

### Request 2: Razorpay Script
- **URL:** `https://checkout.razorpay.com/v1/checkout.js`
- **Status:** Should be 200
- If this fails, check your internet connection or firewall

---

## 5. Test with Mock Mode (Alternative)

If you want to test the flow without real payments temporarily:

**Change in `.env.local`:**
```bash
# Add "mock" to the key ID:
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_mock_key
```

**Restart the dev server**, and the app will use a simulated payment flow.

---

## 6. Database Connection Check

Make sure your database is accessible:

```bash
# Test database connection by checking orders
curl -X GET http://localhost:3000/api/orders \
  -H "Cookie: your-auth-cookie"
```

---

## 7. Common Issues Checklist

- [ ] `.env.local` file exists in the project root (not in subdirectories)
- [ ] Environment variables have correct names (no typos)
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` is prefixed with `NEXT_PUBLIC_`
- [ ] Development server was **restarted** after adding `.env.local`
- [ ] User is logged in (payment requires authentication)
- [ ] Order exists in the database
- [ ] Internet connection is stable (for loading Razorpay script)
- [ ] No browser ad blockers blocking the Razorpay domain

---

## 8. Quick Verification Script

Create a test page to verify environment variables:

**File: `app/test-env/page.tsx`**
```tsx
'use client';

export default function TestEnv() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variable Test</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p><strong>NEXT_PUBLIC_RAZORPAY_KEY_ID:</strong></p>
        <code>{process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'NOT FOUND - RESTART DEV SERVER!'}</code>
      </div>
    </div>
  );
}
```

Visit: `http://localhost:3000/test-env`

If it shows "NOT FOUND", **restart your dev server!**

---

## 9. Razorpay Dashboard Check

Verify your Razorpay credentials:

1. Go to https://dashboard.razorpay.com/
2. Navigate to **Settings** > **API Keys**
3. Verify:
   - Key ID: `rzp_live_RbH2h92uvHsysH`
   - The key is **activated** (not disabled)
   - You're viewing **Live Mode** keys (not Test Mode)

---

## 10. Server Logs

Check your terminal where the dev server is running for errors:

```bash
# Should see:
> ready - started server on 0.0.0.0:3000
> info - Loaded env from .env.local
```

If you don't see "Loaded env from .env.local", the file wasn't found!

---

## Still Not Working?

If the issue persists after following all steps:

1. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Check file permissions:**
   ```bash
   ls -la .env.local
   # Should be readable
   ```

3. **Verify file content:**
   ```bash
   cat .env.local | head -3
   # Should show:
   # # Razorpay Live Credentials
   # NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_RbH2h92uvHsysH
   # RAZORPAY_KEY_SECRET=9ytahSnz7F4psRNwyFcALMxY
   ```

4. **Share browser console logs** for further debugging

---

## Debug Mode Enabled

The Razorpay checkout component now has extensive logging. When you click the payment button, you'll see detailed logs in the browser console that will help identify where the issue is.

**Key logs to check:**
1. Environment variable value
2. Script loading status
3. API call status
4. Payment initialization status
5. Any error messages

---

**Last Updated:** 2025-11-14
