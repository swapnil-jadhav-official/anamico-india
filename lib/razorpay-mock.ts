/**
 * Mock Razorpay Setup for Development/Testing
 * This file provides mock Razorpay functionality without actual credentials
 */

interface MockPaymentOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: 'created' | 'paid' | 'failed';
  created_at: number;
  payment_id?: string;
}

interface MockPayment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: 'captured' | 'failed' | 'refunded';
  method: string;
  created_at: number;
}

// Mock storage (in production, this would be in a database)
const mockOrders = new Map<string, MockPaymentOrder>();
const mockPayments = new Map<string, MockPayment>();

/**
 * Create a mock Razorpay order
 */
export const createMockOrder = (amount: number, receipt: string) => {
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const order: MockPaymentOrder = {
    id: orderId,
    amount: Math.round(amount * 100), // Convert to paise
    currency: 'INR',
    receipt,
    status: 'created',
    created_at: Math.floor(Date.now() / 1000),
  };

  mockOrders.set(orderId, order);
  return order;
};

/**
 * Get mock order by ID
 */
export const getMockOrder = (orderId: string) => {
  return mockOrders.get(orderId);
};

/**
 * Create a mock payment for an order
 */
export const createMockPayment = (
  orderId: string,
  amount: number,
  method: string = 'card'
) => {
  const order = mockOrders.get(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const payment: MockPayment = {
    id: paymentId,
    order_id: orderId,
    amount: Math.round(amount * 100), // Convert to paise
    currency: 'INR',
    status: 'captured',
    method,
    created_at: Math.floor(Date.now() / 1000),
  };

  mockPayments.set(paymentId, payment);

  // Update order status
  order.status = 'paid';
  order.payment_id = paymentId;
  mockOrders.set(orderId, order);

  return payment;
};

/**
 * Verify payment signature (mock version)
 * In production, this verifies with Razorpay's secret key
 */
export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  // In mock mode, we just verify the payment exists
  const payment = mockPayments.get(paymentId);
  return !!payment && payment.order_id === orderId;
};

/**
 * Refund a payment
 */
export const createMockRefund = (paymentId: string, amount?: number) => {
  const payment = mockPayments.get(paymentId);
  if (!payment) {
    throw new Error('Payment not found');
  }

  const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const refundAmount = amount || payment.amount;

  // Update payment status
  payment.status = 'refunded';
  mockPayments.set(paymentId, payment);

  return {
    id: refundId,
    payment_id: paymentId,
    amount: refundAmount,
    status: 'processed',
    created_at: Math.floor(Date.now() / 1000),
  };
};

/**
 * Get mock Razorpay instance config
 * This mimics the Razorpay SDK configuration
 */
export const getMockRazorpayConfig = () => {
  return {
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_key_secret',
  };
};

/**
 * Generate mock Razorpay checkout options
 */
export const generateMockCheckoutOptions = (
  orderId: string,
  amount: number,
  userEmail: string,
  userName: string
) => {
  return {
    key: getMockRazorpayConfig().key_id,
    amount: Math.round(amount * 100), // Convert to paise
    currency: 'INR',
    name: 'AnamiCo India',
    description: 'Electronic Products Purchase',
    order_id: orderId,
    customer_notify: 1,
    notes: {
      policy_name: 'AnamiCo Purchase',
    },
    prefill: {
      name: userName,
      email: userEmail,
    },
    theme: {
      color: '#3399cc',
    },
  };
};

/**
 * List all mock orders (for testing)
 */
export const getAllMockOrders = () => {
  return Array.from(mockOrders.values());
};

/**
 * List all mock payments (for testing)
 */
export const getAllMockPayments = () => {
  return Array.from(mockPayments.values());
};

/**
 * Clear all mock data (for testing)
 */
export const clearMockData = () => {
  mockOrders.clear();
  mockPayments.clear();
};
