declare module 'react-native-razorpay' {
  export interface CheckoutOptions {
    key: string;
    amount: number | string;
    order_id: string;
    currency?: string;
    name?: string;
    description?: string;
    image?: string;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
      method?: string;
    };
    theme?: {
      color?: string;
      backdrop_color?: string;
      hide_topbar?: boolean;
    };
    notes?: Record<string, string>;
    modal?: {
      backdropclose?: boolean;
      escape?: boolean;
      handleback?: boolean;
      confirm_close?: boolean;
      ondismiss?: () => void;
      animation?: boolean;
    };
    [key: string]: any;
  }

  export default class RazorpayCheckout {
    static open(
      options: CheckoutOptions,
      successCallback?: (data: any) => void,
      errorCallback?: (data: any) => void
    ): Promise<any>;
    static onExternalWalletSelection(callback: (data: any) => void): void;
  }
}
