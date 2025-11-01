/**
 * Real Razorpay Integration
 * This file handles actual Razorpay API calls with real credentials
 */

import crypto from "crypto";

interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id: string | null;
  status: string;
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  description: string;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  notes: Record<string, any>;
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;
  acquirer_data: Record<string, any>;
  created_at: number;
}

const RAZORPAY_API_URL = "https://api.razorpay.com/v1";
const KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

/**
 * Get Base64 encoded credentials for Razorpay API
 */
const getAuthHeader = () => {
  const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
  return `Basic ${auth}`;
};

/**
 * Create a Razorpay order
 */
export const createRazorpayOrder = async (
  amount: number,
  receipt: string,
  notes?: Record<string, any>
): Promise<RazorpayOrder> => {
  if (!KEY_ID || !KEY_SECRET) {
    throw new Error("Razorpay credentials not configured");
  }

  const response = await fetch(`${RAZORPAY_API_URL}/orders`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt,
      notes: notes || {},
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create order: ${error.error.description}`);
  }

  return response.json();
};

/**
 * Verify Razorpay payment signature
 * This confirms that the payment response came from Razorpay
 */
export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  if (!KEY_SECRET) {
    throw new Error("Razorpay secret key not configured");
  }

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
};

/**
 * Fetch payment details from Razorpay
 */
export const fetchRazorpayPayment = async (
  paymentId: string
): Promise<RazorpayPayment> => {
  if (!KEY_ID || !KEY_SECRET) {
    throw new Error("Razorpay credentials not configured");
  }

  const response = await fetch(`${RAZORPAY_API_URL}/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: getAuthHeader(),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to fetch payment: ${error.error.description}`);
  }

  return response.json();
};

/**
 * Capture a payment (complete the transaction)
 */
export const captureRazorpayPayment = async (
  paymentId: string,
  amount: number
): Promise<RazorpayPayment> => {
  if (!KEY_ID || !KEY_SECRET) {
    throw new Error("Razorpay credentials not configured");
  }

  const response = await fetch(
    `${RAZORPAY_API_URL}/payments/${paymentId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to paise
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to capture payment: ${error.error.description}`);
  }

  return response.json();
};

/**
 * Create a refund for a payment
 */
export const createRazorpayRefund = async (
  paymentId: string,
  amount?: number,
  notes?: Record<string, any>
) => {
  if (!KEY_ID || !KEY_SECRET) {
    throw new Error("Razorpay credentials not configured");
  }

  const body: Record<string, any> = {
    notes: notes || {},
  };

  if (amount) {
    body.amount = Math.round(amount * 100); // Convert to paise
  }

  const response = await fetch(
    `${RAZORPAY_API_URL}/payments/${paymentId}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create refund: ${error.error.description}`);
  }

  return response.json();
};

/**
 * Generate checkout options for Razorpay
 */
export const generateCheckoutOptions = (
  orderId: string,
  amount: number,
  userEmail: string,
  userName: string
) => {
  return {
    key: KEY_ID,
    amount: Math.round(amount * 100), // Convert to paise
    currency: "INR",
    name: "AnamiCo India",
    description: "Electronic Products Purchase",
    order_id: orderId,
    customer_notify: 1,
    notes: {
      policy_name: "AnamiCo Purchase",
    },
    prefill: {
      name: userName,
      email: userEmail,
    },
    theme: {
      color: "#3399cc",
    },
  };
};
