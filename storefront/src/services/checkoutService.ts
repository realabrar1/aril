import { apiClient } from './apiClient';
import { ApiResponse, Order } from '@/types';
import { CartPayload } from './cartService';

export interface CheckoutCreatePayload {
  shipping_address: {
    name: string;
    email?: string;
    phone: string;
    address: string;
    address_line_2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
  shipping_method_id?: number;
  coupon_code?: string;
  payment_method?: string;
  free_gift_product_id?: number;
}

export interface CheckoutCreateResponse {
  order: Order;
  redirect_url: string;
}

export const checkoutService = {
  async getSummary(
    couponCode?: string,
    shippingMethodId?: number,
    paymentMethod?: string,
    freeGiftProductId?: number
  ): Promise<ApiResponse<CartPayload>> {
    return apiClient<CartPayload>('/checkout/summary', {
      method: 'POST',
      body: JSON.stringify({
        coupon_code: couponCode,
        shipping_method_id: shippingMethodId,
        payment_method: paymentMethod || 'UPI',
        free_gift_product_id: freeGiftProductId,
      }),
    });
  },

  async validateCheckout(
    couponCode?: string,
    shippingMethodId?: number,
    paymentMethod?: string,
    freeGiftProductId?: number
  ): Promise<ApiResponse<CartPayload>> {
    return apiClient<CartPayload>('/checkout/validate', {
      method: 'POST',
      body: JSON.stringify({
        coupon_code: couponCode,
        shipping_method_id: shippingMethodId,
        payment_method: paymentMethod || 'UPI',
        free_gift_product_id: freeGiftProductId,
      }),
    });
  },

  async createOrder(payload: CheckoutCreatePayload): Promise<ApiResponse<CheckoutCreateResponse>> {
    return apiClient<CheckoutCreateResponse>('/checkout/create-order', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};
