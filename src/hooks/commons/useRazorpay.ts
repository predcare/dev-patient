import { useCallback, useRef, useState } from 'react';
import RazorpayCheckout, { CheckoutOptions } from 'react-native-razorpay';
import { showErrorToast, showInfoToast } from '../../lib/common/toast.utils';
import {
  PaymentStatus,
  RazorpayCheckoutOptions,
  RazorpayErrorResponse,
  RazorpayPrefill,
  RazorpaySuccessResponse,
  RazorpayTheme,
  UseRazorpayConfig,
} from '../../typescripts/types/payment.types';

export const useRazorpay = (config?: UseRazorpayConfig) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const isProcessingRef = useRef(false);

  // Store config callbacks in a ref to avoid stale closures in callbacks
  const configRef = useRef(config);
  configRef.current = config;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetStatus = useCallback(() => {
    setPaymentStatus('idle');
    setError(null);
    isProcessingRef.current = false;
  }, []);

  const openCheckout = useCallback(
    async (
      paymentInfo: RazorpayCheckoutOptions,
      prefill?: RazorpayPrefill,
      theme?: RazorpayTheme,
      notes?: Record<string, string>
    ): Promise<RazorpaySuccessResponse | null> => {
      // Prevent concurrent/double checkout invocations
      if (isProcessingRef.current) {
        return null;
      }

      if (!paymentInfo?.key || !paymentInfo?.order_id) {
        const errorMsg = 'Invalid payment configuration: key or order_id missing.';
        setError(errorMsg);
        setPaymentStatus('failed');
        showErrorToast(errorMsg);
        return null;
      }

      try {
        isProcessingRef.current = true;
        setPaymentStatus('in_progress');
        setError(null);

        const options: CheckoutOptions = {
          key: paymentInfo.key,
          amount: Number(paymentInfo.amount) || 0,
          order_id: paymentInfo.order_id,
          currency: paymentInfo.currency || 'INR',
          name: paymentInfo.name || 'PRED Care',
          description: paymentInfo.description || 'Appointment Consultation Fee',
          image: paymentInfo.image,
          prefill: prefill || ('prefill' in paymentInfo ? paymentInfo.prefill : undefined),
          theme:
            theme ||
            ('theme' in paymentInfo
              ? paymentInfo.theme
              : {
                  color: '#0EA5E9',
                  backdrop_color: '#000000',
                }),
          notes: notes || ('notes' in paymentInfo ? paymentInfo.notes : undefined),
        };

        const data: RazorpaySuccessResponse = await RazorpayCheckout.open(options);

        setPaymentStatus('success');
        setError(null);

        if (configRef.current?.onPaymentSuccess) {
          await configRef.current.onPaymentSuccess(data);
        }

        return data;
      } catch (err: any) {
        const errorData: RazorpayErrorResponse = {
          code: err?.code ?? -1,
          description: err?.description || err?.message || 'Payment processing failed',
          source: err?.source,
          step: err?.step,
          reason: err?.reason,
          metadata: err?.metadata,
        };

        // Razorpay RN error code 0 or 2 represents user dismissal/cancellation
        const isCancelled =
          errorData.code === 0 ||
          errorData.code === 2 ||
          errorData.description?.toLowerCase().includes('cancelled') ||
          errorData.description?.toLowerCase().includes('dismissed');

        if (isCancelled) {
          setPaymentStatus('cancelled');
          const cancelMsg = 'Payment was cancelled';
          setError(cancelMsg);
          showInfoToast(cancelMsg);

          if (configRef.current?.onPaymentDismiss) {
            await configRef.current.onPaymentDismiss();
          }
        } else {
          setPaymentStatus('failed');
          const failureMsg = errorData.description || 'Payment failed. Please try again.';
          setError(failureMsg);
          showErrorToast(failureMsg);

          if (configRef.current?.onPaymentFailure) {
            await configRef.current.onPaymentFailure(errorData);
          }
        }

        return null;
      } finally {
        isProcessingRef.current = false;
      }
    },
    []
  );

  return {
    paymentStatus,
    error,
    isLoading: paymentStatus === 'initiating' || paymentStatus === 'in_progress',
    isPaymentSuccess: paymentStatus === 'success',
    isPaymentFailed: paymentStatus === 'failed',
    isPaymentCancelled: paymentStatus === 'cancelled',
    openCheckout,
    setPaymentStatus,
    clearError,
    resetStatus,
  };
};
