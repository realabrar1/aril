'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  MapPin,
  Tag,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Lock,
  RotateCcw,
  Award,
  Heart,
  Gift,
  Check
} from 'lucide-react';
import { cartService, CartPayload } from '@/services/cartService';
import { addressService, CustomerAddress } from '@/services/addressService';
import { shippingService, ShippingMethod } from '@/services/shippingService';
import { checkoutService } from '@/services/checkoutService';

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartPayload | null>(null);
  const [loadingCart, setLoadingCart] = useState(true);

  // Address State
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Guest Customer Inputs
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrEmail, setNewAddrEmail] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrLine1, setNewAddrLine1] = useState('');
  const [newAddrLine2, setNewAddrLine2] = useState('');
  const [newAddrLandmark, setNewAddrLandmark] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrState, setNewAddrState] = useState('Karnataka');
  const [newAddrPincode, setNewAddrPincode] = useState('');

  // Shipping & Payment
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [paymentOption, setPaymentOption] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'COD'>('UPI');

  // Free Gift State
  const [selectedFreeGiftId, setSelectedFreeGiftId] = useState<number | null>(null);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Placement
  const [placingOrder, setPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Recalculate summary on server whenever paymentOption, couponCode, or selectedFreeGiftId changes
  const recalculateSummary = async (
    payOpt: 'UPI' | 'CARD' | 'NETBANKING' | 'COD' = paymentOption,
    giftId: number | null = selectedFreeGiftId,
    code: string = couponCode
  ) => {
    try {
      const res = await checkoutService.getSummary(code, selectedMethodId ?? undefined, payOpt, giftId ?? undefined);
      if (res.success && res.data) {
        setCart(res.data);
        if (res.data.free_gift && !res.data.free_gift.eligible) {
          // Clear free gift selection if no longer eligible (e.g. switched to COD under ₹500)
          setSelectedFreeGiftId(null);
        }
      }
    } catch {
      // Ignore background recalculation errors
    }
  };

  useEffect(() => {
    document.title = 'Checkout | ARILHA';
    const fetchInitialData = async () => {
      setLoadingCart(true);
      try {
        // Pre-fill customer details if stored
        if (typeof window !== 'undefined') {
          const userStr = localStorage.getItem('femmeera_customer_user');
          if (userStr) {
            try {
              const userObj = JSON.parse(userStr);
              if (userObj?.name) setNewAddrName(userObj.name);
              if (userObj?.email) setNewAddrEmail(userObj.email);
              if (userObj?.phone) setNewAddrPhone(userObj.phone);
            } catch {}
          }
        }

        const [cartRes, addrRes, shipRes] = await Promise.all([
          checkoutService.getSummary('', undefined, 'UPI'),
          addressService.getAddresses().catch(() => ({ success: false, data: [] })),
          shippingService.getMethods().catch(() => ({ success: false, data: { methods: [], free_shipping_threshold: 1499 } })),
        ]);

        if (cartRes.success && cartRes.data) {
          setCart(cartRes.data);
          if (cartRes.data.applied_coupon) {
            setCouponCode(cartRes.data.applied_coupon.code);
          }
        }

        if (addrRes.success && addrRes.data && addrRes.data.length > 0) {
          setAddresses(addrRes.data);
          setSelectedAddressId(addrRes.data[0].id);
        } else {
          setShowNewAddressForm(true);
        }

        if (shipRes.success && shipRes.data) {
          setShippingMethods(shipRes.data.methods);
          if (shipRes.data.methods.length > 0) {
            setSelectedMethodId(shipRes.data.methods[0].id);
          }
        }
      } finally {
        setLoadingCart(false);
      }
    };

    fetchInitialData();
  }, []);

  // Handle Payment Method Switch & Free Gift Eligibility Recalculation
  const handlePaymentOptionChange = (newMethod: 'UPI' | 'CARD' | 'NETBANKING' | 'COD') => {
    setPaymentOption(newMethod);
    let nextGiftId = selectedFreeGiftId;
    if (newMethod === 'COD' && (cart?.subtotal || 0) < 500) {
      nextGiftId = null;
      setSelectedFreeGiftId(null);
    }
    recalculateSummary(newMethod, nextGiftId);
  };

  const handleFreeGiftSelect = (productId: number) => {
    const nextId = selectedFreeGiftId === productId ? null : productId;
    setSelectedFreeGiftId(nextId);
    recalculateSummary(paymentOption, nextId);
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    setCouponMsg(null);
    const res = await checkoutService.getSummary(couponCode.trim(), selectedMethodId ?? undefined, paymentOption, selectedFreeGiftId ?? undefined);
    setApplyingCoupon(false);

    if (res.success && res.data) {
      setCart(res.data);
      if (res.data.coupon_error) {
        setCouponMsg({ type: 'error', text: res.data.coupon_error });
      } else if (res.data.applied_coupon) {
        setCouponMsg({ type: 'success', text: `Coupon '${res.data.applied_coupon.code}' applied!` });
      }
    }
  };

  const handlePlaceOrder = async () => {
    setCheckoutError(null);

    let shippingPayload: any = null;

    if (selectedAddressId && !showNewAddressForm) {
      const selectedObj = addresses.find((a) => a.id === selectedAddressId);
      if (selectedObj) {
        shippingPayload = {
          name: selectedObj.name,
          email: newAddrEmail.trim() || undefined,
          phone: selectedObj.phone,
          address: selectedObj.address_line_1,
          address_line_2: selectedObj.address_line_2 || selectedObj.address_line_1,
          city: selectedObj.city,
          state: selectedObj.state,
          pincode: selectedObj.postal_code || selectedObj.pincode || '',
          country: 'India',
        };
      }
    }

    if (!shippingPayload) {
      if (
        !newAddrName.trim() ||
        !newAddrPhone.trim() ||
        !newAddrEmail.trim() ||
        !newAddrPincode.trim() ||
        !newAddrCity.trim() ||
        !newAddrState.trim() ||
        !newAddrLine1.trim()
      ) {
        setCheckoutError('Please fill in all mandatory shipping address fields (Full Name, Email, Phone, Address, City, State, Pincode).');
        return;
      }

      shippingPayload = {
        name: newAddrName.trim(),
        email: newAddrEmail.trim(),
        phone: newAddrPhone.trim(),
        address: newAddrLine1.trim(),
        address_line_2: newAddrLine2.trim() || newAddrLine1.trim(),
        city: newAddrCity.trim(),
        state: newAddrState.trim(),
        pincode: newAddrPincode.trim(),
        country: 'India',
      };
    }

    setPlacingOrder(true);

    try {
      // Step 1: Create Order in Backend (Guest or Authenticated)
      const orderRes = await checkoutService.createOrder({
        shipping_address: shippingPayload,
        shipping_method_id: selectedMethodId ?? undefined,
        coupon_code: couponCode,
        payment_method: paymentOption,
        free_gift_product_id: selectedFreeGiftId ?? undefined,
      });

      if (!orderRes.success || !orderRes.data) {
        setCheckoutError(orderRes.message || 'Order creation failed. Please check details and try again.');
        setPlacingOrder(false);
        return;
      }

      const createdOrder = orderRes.data.order;

      // Auto-save customer info in browser storage for seamless guest experience
      if (typeof window !== 'undefined' && shippingPayload) {
        const addressObj = {
          addressLine1: shippingPayload.address,
          addressLine2: shippingPayload.address_line_2 !== shippingPayload.address ? shippingPayload.address_line_2 : '',
          city: shippingPayload.city,
          state: shippingPayload.state,
          pincode: shippingPayload.pincode,
          country: 'India',
        };
        localStorage.setItem('femmeera_customer_address', JSON.stringify(addressObj));

        const userObj = {
          name: shippingPayload.name,
          email: shippingPayload.email,
          phone: shippingPayload.phone,
        };
        localStorage.setItem('femmeera_customer_user', JSON.stringify(userObj));
        window.dispatchEvent(new Event('femmeera-auth-updated'));
      }

      // Handle Cash on Delivery
      if (paymentOption === 'COD') {
        router.push(`/checkout/success?order_number=${createdOrder.order_number}&order_id=${createdOrder.id}&method=COD`);
        return;
      }

      // Step 2: Create Razorpay Payment Order
      const { paymentService } = await import('@/services/paymentService');
      const paymentOrder = await paymentService.createPaymentOrder(createdOrder.id);

      // Step 3: Load Razorpay Checkout SDK Script
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay Checkout SDK'));
          document.body.appendChild(script);
        });
      }

      // Step 4: Open Razorpay Checkout Modal
      const options = {
        key: paymentOrder.key_id,
        amount: Math.round(paymentOrder.amount * 100),
        currency: paymentOrder.currency || 'INR',
        name: 'Arilha Couture',
        description: `Payment for Order #${paymentOrder.order_number}`,
        order_id: paymentOrder.provider_payment_order_id,
        handler: async function (response: any) {
          try {
            // Step 5: Authoritatively verify payment signature on backend
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            router.push(`/checkout/success?order_number=${paymentOrder.order_number}&order_id=${paymentOrder.order_id}`);
          } catch (err: any) {
            router.push(`/checkout/failed?order_id=${paymentOrder.order_id}`);
          }
        },
        modal: {
          ondismiss: function () {
            setCheckoutError('Payment popup was closed. You can retry payment anytime.');
          },
        },
        prefill: {
          name: shippingPayload?.name || newAddrName || '',
          email: shippingPayload?.email || newAddrEmail || '',
          contact: shippingPayload?.phone || newAddrPhone || '',
        },
        theme: {
          color: '#B38548',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setCheckoutError(err.message || 'An unexpected error occurred during checkout.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loadingCart) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#B38548] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-neutral-600">Loading secure checkout...</p>
        </div>
      </div>
    );
  }

  const freeGiftInfo = cart?.free_gift;
  const isFreeGiftEligible = freeGiftInfo?.eligible ?? false;
  const giftOptions = freeGiftInfo?.options || [];
  const selectedGiftObj = giftOptions.find((g) => g.product_id === selectedFreeGiftId);

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Title & Stepper */}
        <div className="text-center space-y-6">
          <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-medium tracking-tight">
            Checkout
          </h1>

          <div className="flex items-center justify-center space-x-4 sm:space-x-12 max-w-2xl mx-auto">
            <div className="flex flex-col items-center space-y-1">
              <div className="w-9 h-9 rounded-full bg-[#B38548] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                1
              </div>
              <span className="text-[11px] font-bold text-neutral-900">Shipping Details</span>
            </div>
            <div className="h-0.5 bg-[#EFE6D8] w-12 sm:w-20 -mt-5"></div>
            <div className="flex flex-col items-center space-y-1">
              <div className="w-9 h-9 rounded-full bg-white border-2 border-[#B38548] text-[#B38548] font-bold text-xs flex items-center justify-center">
                2
              </div>
              <span className="text-[11px] font-semibold text-neutral-600">Payment & Free Gift</span>
            </div>
            <div className="h-0.5 bg-[#EFE6D8] w-12 sm:w-20 -mt-5"></div>
            <div className="flex flex-col items-center space-y-1">
              <div className="w-9 h-9 rounded-full bg-white border-2 border-[#EFE6D8] text-neutral-400 font-bold text-xs flex items-center justify-center">
                3
              </div>
              <span className="text-[11px] font-semibold text-neutral-400">Order Placed</span>
            </div>
          </div>
        </div>

        {checkoutError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-4 rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{checkoutError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Checkout Column */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. SHIPPING ADDRESS FORM */}
            <div className="bg-white rounded-3xl p-6 border border-[#EFE6D8] shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F5EDE0] pb-3">
                <h2 className="font-bold text-xs uppercase tracking-wider text-neutral-900">
                  1. CUSTOMER & SHIPPING DETAILS
                </h2>
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  Guest Checkout Enabled
                </span>
              </div>

              <form className="space-y-4 text-xs" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Full Name <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={newAddrName}
                      onChange={(e) => setNewAddrName(e.target.value)}
                      required
                      placeholder="e.g. Ananya Sharma"
                      className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E8DEC8] rounded-xl text-xs focus:ring-2 focus:ring-[#B38548] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Email Address <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <input
                      type="email"
                      value={newAddrEmail}
                      onChange={(e) => setNewAddrEmail(e.target.value)}
                      required
                      placeholder="e.g. ananya@example.com"
                      className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E8DEC8] rounded-xl text-xs focus:ring-2 focus:ring-[#B38548] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Phone Number <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={newAddrPhone}
                      onChange={(e) => setNewAddrPhone(e.target.value)}
                      required
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E8DEC8] rounded-xl text-xs focus:ring-2 focus:ring-[#B38548] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Pincode <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={newAddrPincode}
                      onChange={(e) => setNewAddrPincode(e.target.value)}
                      required
                      placeholder="e.g. 560001"
                      className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E8DEC8] rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#B38548] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      City <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={newAddrCity}
                      onChange={(e) => setNewAddrCity(e.target.value)}
                      required
                      placeholder="e.g. Bangalore"
                      className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E8DEC8] rounded-xl text-xs focus:ring-2 focus:ring-[#B38548] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      State <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <select
                      value={newAddrState}
                      onChange={(e) => setNewAddrState(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E8DEC8] rounded-xl text-xs focus:ring-2 focus:ring-[#B38548] focus:outline-none"
                    >
                      <option value="Karnataka">Karnataka</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="West Bengal">West Bengal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    House No., Building Name, Street <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={newAddrLine1}
                    onChange={(e) => setNewAddrLine1(e.target.value)}
                    required
                    placeholder="#123, Rose Villa, Sector 2"
                    className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E8DEC8] rounded-xl text-xs focus:ring-2 focus:ring-[#B38548] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Landmark <span className="text-neutral-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={newAddrLandmark}
                    onChange={(e) => setNewAddrLandmark(e.target.value)}
                    placeholder="Near BDA Complex"
                    className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E8DEC8] rounded-xl text-xs focus:ring-2 focus:ring-[#B38548] focus:outline-none"
                  />
                </div>
              </form>
            </div>

            {/* 2. PAYMENT METHOD SELECTION */}
            <div className="bg-white rounded-3xl p-6 border border-[#EFE6D8] shadow-2xs space-y-4">
              <h2 className="font-bold text-xs uppercase tracking-wider text-neutral-900">
                2. PAYMENT METHOD
              </h2>

              <div className="space-y-3 text-xs">
                
                {/* UPI Option */}
                <label className={`block p-4 rounded-2xl border cursor-pointer transition-all ${paymentOption === 'UPI' ? 'border-[#B38548] bg-[#FAF4EB]' : 'border-[#EFE6D8]'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentOption === 'UPI'}
                        onChange={() => handlePaymentOptionChange('UPI')}
                        className="text-[#B38548]"
                      />
                      <div>
                        <span className="font-bold text-neutral-900 block">UPI</span>
                        <span className="text-[11px] text-neutral-500">Google Pay, PhonePe, Paytm, BHIM</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 font-bold text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      🎁 Free Gift Eligible
                    </div>
                  </div>
                </label>

                {/* Card Option */}
                <label className={`block p-4 rounded-2xl border cursor-pointer transition-all ${paymentOption === 'CARD' ? 'border-[#B38548] bg-[#FAF4EB]' : 'border-[#EFE6D8]'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentOption === 'CARD'}
                        onChange={() => handlePaymentOptionChange('CARD')}
                        className="text-[#B38548]"
                      />
                      <div>
                        <span className="font-bold text-neutral-900 block">Credit / Debit Card</span>
                        <span className="text-[11px] text-neutral-500">Visa, Mastercard, RuPay</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 font-bold text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      🎁 Free Gift Eligible
                    </div>
                  </div>
                </label>

                {/* COD Option */}
                <label className={`block p-4 rounded-2xl border cursor-pointer transition-all ${paymentOption === 'COD' ? 'border-[#B38548] bg-[#FAF4EB]' : 'border-[#EFE6D8]'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentOption === 'COD'}
                        onChange={() => handlePaymentOptionChange('COD')}
                        className="text-[#B38548]"
                      />
                      <div>
                        <span className="font-bold text-neutral-900 block">Cash on Delivery (COD)</span>
                        <span className="text-[11px] text-neutral-500">Pay when delivered to your address</span>
                      </div>
                    </div>
                    {(cart?.subtotal || 0) < 500 ? (
                      <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-semibold">
                        No free gift under ₹500
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                        🎁 Free Gift Unlocked
                      </span>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* 3. FREE GIFT SELECTION BANNER & SELECTION GRID */}
            <div className="bg-white rounded-3xl p-6 border border-[#EFE6D8] shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F5EDE0] pb-3">
                <div className="flex items-center space-x-2">
                  <Gift className="w-5 h-5 text-[#B38548]" />
                  <h2 className="font-bold text-xs uppercase tracking-wider text-neutral-900">
                    3. SELECT YOUR FREE GIFT
                  </h2>
                </div>
                {selectedFreeGiftId ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Gift Selected (₹0)
                  </span>
                ) : null}
              </div>

              {/* Promotional Status Banner */}
              {isFreeGiftEligible ? (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 text-xs space-y-1">
                  <div className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                    <span>🎉</span>
                    <span>You've unlocked a FREE gift!</span>
                  </div>
                  <p className="text-amber-800 text-[11px]">
                    Choose 1 complimentary gift from the available products below for your order.
                  </p>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs space-y-1 text-rose-900">
                  <div className="font-bold flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-rose-600" />
                    <span>COD orders below ₹500 are not eligible for the free gift.</span>
                  </div>
                  <p className="text-[11px] text-rose-700">
                    🎁 Want a FREE gift? Switch to <button onClick={() => handlePaymentOptionChange('UPI')} className="font-bold underline text-rose-900">UPI/Card Payment</button> or add more items to reach ₹500.
                  </p>
                </div>
              )}

              {/* Free Gift Options Grid */}
              {isFreeGiftEligible && giftOptions.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {giftOptions.map((gift) => {
                    const isSelected = selectedFreeGiftId === gift.product_id;
                    return (
                      <div
                        key={gift.gift_id || gift.product_id}
                        onClick={() => handleFreeGiftSelect(gift.product_id)}
                        className={`relative rounded-2xl border p-3 cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#B38548] bg-[#FAF4EB] ring-2 ring-[#B38548] shadow-md'
                            : 'border-[#EFE6D8] hover:border-[#B38548] bg-white'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-[#B38548] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="relative w-full h-24 rounded-xl bg-neutral-100 overflow-hidden border border-[#EFE6D8]">
                            <img
                              src={gift.image_url}
                              alt={gift.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-neutral-900 line-clamp-1">{gift.title}</h4>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <span className="font-bold text-xs text-emerald-700">FREE (₹0)</span>
                              <span className="text-[10px] text-neutral-400 line-through">₹{gift.reference_price}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFreeGiftSelect(gift.product_id);
                          }}
                          className={`mt-3 w-full py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                            isSelected
                              ? 'bg-[#B38548] text-white'
                              : 'bg-[#FDFBF7] text-neutral-800 border border-[#E8DEC8] hover:bg-[#B38548] hover:text-white'
                          }`}
                        >
                          {isSelected ? '✓ Selected' : 'Select Free Gift'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {/* Submit Order Button */}
            <div className="pt-2">
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="w-full py-4 px-6 bg-[#B38548] hover:bg-[#966C32] disabled:opacity-50 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {placingOrder
                    ? 'PROCESSING ORDER...'
                    : paymentOption === 'COD'
                    ? `CONFIRM & PLACE ORDER (COD) ₹${(cart?.total || 0).toLocaleString('en-IN')}`
                    : `PROCEED TO SECURE PAYMENT ₹${(cart?.total || 0).toLocaleString('en-IN')}`}
                </span>
              </button>
              <p className="text-[10px] text-center text-neutral-500 mt-2">
                🔒 100% Secure Checkout • Guest orders dynamically linked to your profile
              </p>
            </div>

          </div>

          {/* Right Column: ORDER SUMMARY Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#EFE6D8] shadow-2xs space-y-4 sticky top-6">
              <h2 className="font-bold text-xs uppercase tracking-wider text-neutral-900 border-b border-[#F5EDE0] pb-3">
                ORDER SUMMARY ({cart?.item_count || 0} ITEMS)
              </h2>

              {/* Product Cards List */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1 divide-y divide-neutral-100">
                {cart?.items && cart.items.length > 0 ? (
                  cart.items.map((item) => (
                    <div key={item.cart_item_id} className="flex space-x-3 items-center pt-3 first:pt-0">
                      <div className="relative w-16 h-20 bg-neutral-100 rounded-xl overflow-hidden shrink-0 border border-[#EFE6D8]">
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop'}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-xs">
                        <h3 className="font-bold text-neutral-900 line-clamp-1">{item.product_name}</h3>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {item.color || 'Standard'} / {item.size || 'M'}
                        </p>
                        <p className="text-[11px] text-neutral-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-xs text-neutral-900">
                        ₹{(item.line_total || item.unit_price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))
                ) : null}

                {/* Selected Free Gift Line Item */}
                {selectedGiftObj ? (
                  <div className="flex space-x-3 items-center pt-3 border-t border-amber-200 bg-amber-50/50 p-2 rounded-xl">
                    <div className="relative w-14 h-16 bg-white rounded-lg overflow-hidden shrink-0 border border-amber-300">
                      <img
                        src={selectedGiftObj.image_url}
                        alt={selectedGiftObj.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center space-x-1">
                        <span className="px-1.5 py-0.5 bg-amber-600 text-white font-bold text-[9px] rounded">FREE GIFT</span>
                      </div>
                      <h3 className="font-bold text-neutral-900 line-clamp-1 mt-0.5">{selectedGiftObj.title}</h3>
                      <p className="text-[10px] text-neutral-500">Qty: 1</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-xs text-emerald-700">FREE (₹0)</span>
                      <p className="text-[9px] text-neutral-400 line-through">₹{selectedGiftObj.reference_price}</p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs text-neutral-600 pt-3 border-t border-[#F5EDE0]">
                <div className="flex justify-between">
                  <span>Subtotal ({cart?.item_count || 0} items)</span>
                  <span className="font-medium text-neutral-900">
                    ₹{Number(cart?.subtotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {cart?.discount ? (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount Savings</span>
                    <span className="font-semibold">- ₹{cart.discount.toLocaleString('en-IN')}</span>
                  </div>
                ) : null}

                {cart?.coupon_discount ? (
                  <div className="flex justify-between text-rose-600">
                    <span>Coupon Discount</span>
                    <span className="font-semibold">- ₹{cart.coupon_discount.toLocaleString('en-IN')}</span>
                  </div>
                ) : null}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-bold text-emerald-600">
                    {cart?.shipping?.is_free_shipping || cart?.shipping?.amount === 0 ? 'FREE' : `₹${cart?.shipping?.amount || 0}`}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-base text-neutral-900 pt-3 border-t border-[#F5EDE0]">
                  <span>Total Amount</span>
                  <span className="text-[#B38548]">
                    ₹{Number(cart?.total || cart?.subtotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 font-medium">(Inclusive of all taxes)</p>
              </div>

              {/* Promo Code Box */}
              <div className="pt-2 space-y-2 border-t border-[#F5EDE0]">
                <label className="text-[11px] font-bold text-neutral-900 block">Have a Promo Code?</label>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 bg-[#FDFBF7] border border-[#E8DEC8] rounded-xl text-xs uppercase font-mono"
                  />
                  <button type="submit" disabled={applyingCoupon} className="px-4 py-2 bg-[#B38548] text-white font-bold text-xs rounded-xl hover:bg-[#966C32]">
                    {applyingCoupon ? '...' : 'APPLY'}
                  </button>
                </form>
                {couponMsg && (
                  <p className={`text-[11px] font-semibold ${couponMsg.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {couponMsg.text}
                  </p>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Trust Badges Footer */}
        <div className="bg-[#FAF4EB] border border-[#EFE6D8] rounded-3xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs text-neutral-800">
          <div className="flex flex-col items-center space-y-1">
            <Award className="w-5 h-5 text-[#B38548]" />
            <span className="font-bold">Premium Quality</span>
            <span className="text-[10px] text-neutral-500">Finest craftsmanship</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <RotateCcw className="w-5 h-5 text-[#B38548]" />
            <span className="font-bold">Hassle-free Returns</span>
            <span className="text-[10px] text-neutral-500">7-day return policy</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-[#B38548]" />
            <span className="font-bold">Secure Payments</span>
            <span className="text-[10px] text-neutral-500">100% encrypted transactions</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <Heart className="w-5 h-5 text-[#B38548]" />
            <span className="font-bold">Loved by Customers</span>
            <span className="text-[10px] text-neutral-500">4.7 ★ from 128K+ shoppers</span>
          </div>
        </div>

      </div>
    </div>
  );
}
