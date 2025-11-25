'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { message } from 'antd';
import { Loader2 } from 'lucide-react';

interface RazorpayCheckoutProps {
  orderId: string;
  paymentType: '10' | '100';
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentFailure: (error: any) => void;
  isProcessing?: boolean;
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

  useEffect(() => {
    // Debug: Log environment variable
    console.log('Razorpay Key ID:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);

    // Load real Razorpay script if we have a valid key (test or live)
    const hasValidKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
                       (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.startsWith('rzp_test_') ||
                        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.startsWith('rzp_live_'));

    if (hasValidKey) {
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

      // Check if we have a valid Razorpay key (test or live)
      const hasValidKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
                         (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.startsWith('rzp_test_') ||
                          process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.startsWith('rzp_live_'));

      console.log('Has valid Razorpay key?', hasValidKey);
      console.log('Razorpay Key ID:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
      console.log('Razorpay options:', options);

      if (!hasValidKey) {
        throw new Error('Razorpay key not configured. Please check your environment variables.');
      }

      // Use real Razorpay (both test and live keys)
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
    <Button
      ref={buttonRef}
      onClick={handlePayment}
      disabled={isProcessing}
      className="w-full bg-blue-600 hover:bg-blue-700"
      size="lg"
    >
      {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {getButtonText()}
    </Button>
  );
};
