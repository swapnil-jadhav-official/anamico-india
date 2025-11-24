'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { message } from 'antd';
import { Loader2, X } from 'lucide-react';

interface RazorpayCheckoutProps {
  orderId: string;
  paymentType: '10' | '100';
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentFailure: (error: any) => void;
  isProcessing?: boolean;
}

// Mock Razorpay class for development without real credentials
class MockRazorpay {
  options: any;
  onModalOpen: (() => void) | null = null;

  constructor(options: any) {
    this.options = options;
  }

  setOnModalOpen(callback: () => void) {
    this.onModalOpen = callback;
  }

  open() {
    // Notify that modal has opened
    if (this.onModalOpen) {
      this.onModalOpen();
    }

    // Simulate payment processing delay (3 seconds to show modal)
    setTimeout(() => {
      // Simulate successful payment with mock data
      const mockResponse = {
        razorpay_payment_id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        razorpay_order_id: this.options.order_id,
        razorpay_signature: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      // Call the success handler
      if (this.options.handler) {
        this.options.handler(mockResponse);
      }
    }, 3000);
  }
}

export const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  orderId,
  paymentType,
  onPaymentSuccess,
  onPaymentFailure,
  isProcessing = false,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const checkoutOptionsRef = useRef<any>(null);
  const [showMockModal, setShowMockModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    // Debug: Log environment variable
    console.log('Razorpay Key ID:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);

    // Only load real Razorpay script in production
    if (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
        !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.includes('mock')) {
      console.log('Loading Razorpay script...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => console.log('Razorpay script loaded successfully');
      script.onerror = () => console.error('Failed to load Razorpay script');
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    } else {
      console.log('Using mock Razorpay (no valid key found)');
    }
  }, []);

  const handlePayment = async () => {
    try {
      console.log('Initiating payment for order:', orderId, 'Payment type:', paymentType);

      // Create payment order
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentType,
        }),
      });

      console.log('Payment API response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Payment API error:', error);
        throw new Error(error.error || 'Failed to create payment order');
      }

      const data = await response.json();
      console.log('Payment order created:', data);
      checkoutOptionsRef.current = data.checkoutOptions;

      // Razorpay checkout handler
      const options = {
        ...data.checkoutOptions,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch('/api/payments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                razorpayOrderId: data.razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentType,
              }),
            });

            if (!verifyResponse.ok) {
              const error = await verifyResponse.json();
              throw new Error(error.error || 'Payment verification failed');
            }

            const verifyData = await verifyResponse.json();
            message.success('Payment successful!');
            onPaymentSuccess(verifyData);
          } catch (error) {
            console.error('Verification error:', error);
            message.error(
              error instanceof Error
                ? error.message
                : 'Payment verification failed'
            );
            onPaymentFailure(error);
          }
        },
        modal: {
          ondismiss: () => {
            message.info('Payment cancelled');
            onPaymentFailure(new Error('Payment cancelled by user'));
          },
        },
      };

      // Check if we should use mock or real Razorpay
      const isProduction = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
                          !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.includes('mock');

      console.log('Is production mode?', isProduction);
      console.log('Razorpay options:', options);

      if (isProduction) {
        // Use real Razorpay
        console.log('Using real Razorpay checkout');
        const Razorpay = (window as any).Razorpay;
        if (!Razorpay) {
          console.error('Razorpay script not loaded on window object');
          throw new Error('Razorpay script not loaded. Please refresh the page and try again.');
        }
        console.log('Opening Razorpay checkout...');
        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response: any){
          console.error('Payment failed:', response);
          message.error('Payment failed: ' + response.error.description);
        });
        rzp.open();
      } else {
        // Use mock Razorpay for development
        console.log('Using mock Razorpay checkout');
        const rzp = new MockRazorpay(options);
        rzp.setOnModalOpen(() => {
          setShowMockModal(true);
          setIsProcessingPayment(true);
        });
        rzp.open();
      }
    } catch (error) {
      console.error('Payment error:', error);
      message.error(
        error instanceof Error ? error.message : 'Payment initialization failed'
      );
      onPaymentFailure(error);
    }
  };

  const getButtonText = () => {
    if (isProcessing) return 'Processing...';
    switch (paymentType) {
      case '10':
        return 'Pay 10% Now';
      case '100':
        return 'Pay Full Amount';
      default:
        return 'Proceed to Payment';
    }
  };

  return (
    <>
      <Button
        ref={buttonRef}
        onClick={handlePayment}
        disabled={isProcessing || isProcessingPayment}
        className="w-full bg-blue-600 hover:bg-blue-700"
        size="lg"
      >
        {(isProcessing || isProcessingPayment) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {getButtonText()}
      </Button>

      {/* Mock Razorpay Modal */}
      {showMockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Rz</span>
                </div>
                <h2 className="text-lg font-semibold">Razorpay Checkout</h2>
              </div>
              <button
                onClick={() => {
                  setShowMockModal(false);
                  setIsProcessingPayment(false);
                  onPaymentFailure(new Error('Payment cancelled by user'));
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
                <h3 className="text-xl font-semibold">Processing Payment</h3>
                <p className="text-gray-600 text-sm">
                  Please wait while we process your payment...
                </p>
              </div>

              <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-gray-900">
                    ₹{Math.round((checkoutOptionsRef.current?.amount || 0) / 100).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold text-gray-900">Mock Card</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-blue-600">Processing...</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Mock payment will complete automatically in 3 seconds
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
