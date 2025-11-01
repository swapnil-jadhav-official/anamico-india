'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { message } from 'antd';
import { Loader2 } from 'lucide-react';

interface RazorpayCheckoutProps {
  orderId: string;
  paymentType: '30' | '50' | '100';
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
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    try {
      // Create payment order
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment order');
      }

      const data = await response.json();
      checkoutOptionsRef.current = data.checkoutOptions;

      // Razorpay checkout handler
      const options = {
        ...data.checkoutOptions,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch('/api/payments/verify', {
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

      // Open Razorpay checkout
      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) {
        throw new Error('Razorpay script not loaded');
      }

      const rzp = new Razorpay(options);
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
      case '30':
        return 'Pay 30% Now';
      case '50':
        return 'Pay 50% Now';
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
