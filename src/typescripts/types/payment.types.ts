export type PaymentStatus =
  | 'idle'
  | 'initiating'
  | 'in_progress'
  | 'success'
  | 'failed'
  | 'cancelled';

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayErrorResponse {
  code: number;
  description: string;
  source?: string;
  step?: string;
  reason?: string;
  metadata?: {
    order_id?: string;
    payment_id?: string;
    [key: string]: any;
  };
}

export interface RazorpayPrefill {
  email?: string;
  contact?: string;
  name?: string;
}

export interface RazorpayTheme {
  color?: string;
  backdrop_color?: string;
  hide_topbar?: boolean;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number | string;
  name?: string;
  description?: string;
  image?: string;
  order_id: string;
  currency?: string;
  prefill?: RazorpayPrefill;
  theme?: RazorpayTheme;
  notes?: Record<string, string>;
}

export interface UseRazorpayConfig {
  onPaymentSuccess?: (response: RazorpaySuccessResponse) => void | Promise<void>;
  onPaymentFailure?: (error: RazorpayErrorResponse) => void | Promise<void>;
  onPaymentDismiss?: () => void | Promise<void>;
}
