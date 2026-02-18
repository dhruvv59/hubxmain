"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Loader2, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { paymentService } from "@/services/payment";
import { couponService } from "@/services/coupon";
import { ScriptProps } from "next/script";

// Add Razorpay type definition
declare global {
    interface Window {
        Razorpay: any;
    }
}

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    paperTitle: string;
    paperId: string; // Added paperId to props for API calls
    amount: number;
    onSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, paperTitle, paperId, amount: initialAmount, onSuccess }: PaymentModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Coupon State
    const [couponCode, setCouponCode] = useState("");
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
    const [finalAmount, setFinalAmount] = useState(initialAmount);

    useEffect(() => {
        if (isOpen) {
            // Reset state on open
            // Reset state on open
            setIsProcessing(false);
            setIsSuccess(false);
            setError(null);
            setCouponCode("");
            setAppliedCoupon(null);
            setFinalAmount(initialAmount);
            setCouponError(null);

            // Dynamically load Razorpay script if not present
            if (!window.Razorpay) {
                const script = document.createElement("script");
                script.src = "https://checkout.razorpay.com/v1/checkout.js";
                script.async = true;
                document.body.appendChild(script);
            }
        }
    }, [isOpen, initialAmount]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;

        setIsValidatingCoupon(true);
        setCouponError(null);

        try {
            const result = await couponService.validate(couponCode, paperId);

            // Backend returns { success: true, message: string, data: paper }
            // Paper object contains the discounted price
            if (result.success && result.data) {
                const paper = result.data;
                const discountedPrice = paper.price || initialAmount;
                const discount = initialAmount - discountedPrice;

                setAppliedCoupon({
                    code: couponCode,
                    discount: discount
                });
                setFinalAmount(discountedPrice);
                setCouponError(null);
            } else {
                setCouponError(result.message || "Invalid coupon code");
                setAppliedCoupon(null);
                setFinalAmount(initialAmount);
            }
        } catch (err: any) {
            console.error("Coupon validation failed:", err);
            // Extract error message from backend response
            const errorMessage = err.response?.data?.message || err.message || "Failed to validate coupon";
            setCouponError(errorMessage);
            setAppliedCoupon(null);
            setFinalAmount(initialAmount);
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
        setFinalAmount(initialAmount);
        setCouponError(null);
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            // Handle Free Coupon Case
            if (finalAmount === 0 && appliedCoupon) {
                // NEW: Claim free access instead of just verifying
                try {
                    await paymentService.claimFreeAccess(paperId);
                    setIsSuccess(true);
                } catch (claimError: any) {
                    console.error("Free coupon claim failed:", claimError);
                    setError(claimError.message || "Failed to claim free access");
                } finally {
                    setIsProcessing(false);
                }
                return;
            }

            // Standard Razorpay Flow
            if (!window.Razorpay) {
                throw new Error("Payment gateway not loaded. Check connection.");
            }

            // 1. Create Order
            const orderData = await paymentService.createOrder(finalAmount, "INR", paperId);

            if (!orderData || !orderData.orderId) {
                throw new Error("Failed to create order");
            }

            // 2. Initialize Razorpay options
            // Fix: Backend returns 'razorpayKeyId', not 'key'
            const options = {
                key: (orderData as any).razorpayKeyId || orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Hubx",
                description: `Purchase: ${paperTitle}`,
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    try {
                        // 3. Verify Payment
                        await paymentService.verifyPayment(
                            response.razorpay_order_id,
                            response.razorpay_payment_id,
                            response.razorpay_signature,
                            paperId
                        );

                        setIsSuccess(true);
                        setIsProcessing(false);
                    } catch (verifyErr) {
                        console.error("Payment verification failed:", verifyErr);
                        setError("Payment verification failed. Please contact support.");
                        setIsProcessing(false);
                    }
                },
                theme: {
                    color: "#5b5bd6"
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                setError(response.error.description || "Payment failed");
                setIsProcessing(false);
            });
            rzp.open();

        } catch (err: any) {
            console.error("Payment initiation failed:", err);
            setError(err.message || "Failed to initiate payment");
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-[24px] w-full max-w-[500px] p-8 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
                    <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                        <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="h-6 w-6 text-white stroke-[3]" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-green-600 mb-2">Purchase Successful! ✓</h2>
                    <p className="text-center text-gray-600 font-medium mb-8">
                        Paper has been added to your purchased papers<br />
                        <span className="text-gray-900 font-bold">"{paperTitle}"</span>
                    </p>

                    <div className="space-y-3 w-full">
                        <button
                            onClick={onSuccess}
                            className="w-full py-3 rounded-xl bg-[#6366f1] text-white font-bold hover:bg-[#4f4fbe] active:scale-95 transition-all"
                        >
                            Close
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 mt-4 text-center">
                        Your paper is now available in the Purchased Papers section
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[24px] w-full max-w-[600px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Unlock Paper</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                {/* Summary */}
                <div className="p-6 bg-gray-50 space-y-4">
                    <div className="flex justify-between items-center text-gray-700">
                        <span className="font-medium">{paperTitle}</span>
                        <span className="font-medium">₹ {initialAmount}</span>
                    </div>

                    {appliedCoupon && (
                        <div className="flex justify-between items-center text-green-600 text-sm bg-green-50 p-2 rounded-lg border border-green-100">
                            <span className="flex items-center gap-1 font-bold">
                                <Tag className="w-3 h-3" />
                                Coupon Applied ({appliedCoupon.code})
                            </span>
                            <span className="font-bold">- ₹ {appliedCoupon.discount}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <span className="font-bold text-gray-900">Total Payable</span>
                        <span className={cn(
                            "font-bold text-2xl",
                            finalAmount === 0 ? "text-green-600" : "text-[#5b5bd6]"
                        )}>
                            {finalAmount === 0 ? "FREE" : `₹ ${finalAmount}`}
                        </span>
                    </div>
                </div>

                {/* Coupon Input */}
                <div className="px-6 py-6 border-b border-gray-100">
                    <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wide">Have a School Code or Coupon?</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                disabled={!!appliedCoupon || isValidatingCoupon}
                                placeholder="Enter code (e.g. SCHOOL100)"
                                className={cn(
                                    "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all uppercase font-medium",
                                    couponError
                                        ? "border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50 text-red-900 placeholder:text-red-300"
                                        : "border-gray-200 focus:border-[#6366f1] focus:ring-indigo-50"
                                )}
                            />
                        </div>
                        {appliedCoupon ? (
                            <button
                                onClick={handleRemoveCoupon}
                                className="px-5 py-3 rounded-xl border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 hover:border-red-200 transition-colors text-sm"
                            >
                                Remove
                            </button>
                        ) : (
                            <button
                                onClick={handleApplyCoupon}
                                disabled={!couponCode || isValidatingCoupon}
                                className="px-6 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm min-w-[100px]"
                            >
                                {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Apply"}
                            </button>
                        )}
                    </div>
                    {couponError && (
                        <p className="text-red-500 text-sm mt-2 font-medium flex items-center gap-1">
                            <X className="w-3 h-3" /> {couponError}
                        </p>
                    )}
                </div>

                {/* Action Button */}
                <div className="p-6">
                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className={cn(
                            "w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98] flex justify-center items-center gap-2",
                            finalAmount === 0
                                ? "bg-green-500 hover:bg-green-600 shadow-green-200"
                                : "bg-[#5b5bd6] hover:bg-[#4f4fbe] shadow-indigo-200"
                        )}
                    >
                        {isProcessing ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            finalAmount === 0 ? "Claim Free Access" : "Pay with Razorpay"
                        )}
                    </button>

                    {finalAmount > 0 && (
                        <p className="text-center text-xs text-gray-400 mt-4 font-medium flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Secure Payment via Razorpay
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
