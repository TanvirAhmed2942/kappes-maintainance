"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../../hooks/useCart";
import {
  usePlaceOrderMutation,
  useApplyPromoCodeMutation,
} from "../../../redux/cartApi/cartApi";
import useToast from "../../../hooks/useShowToast";
import useUser from "../../../hooks/useUser";
import { useSelector, useDispatch } from "react-redux";
import { clearBuyNowProduct } from "../../../features/buyNowSlice";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../../components/ui/sheet";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "../../../redux/baseUrl";

export default function OrderSummary({
  deliveryOption,
  paymentMethod,
  shippingAddress,
}) {
  const router = useRouter();
  const toast = useToast();
  const dispatch = useDispatch();
  const { user, profileData } = useUser();
  const { cartItems, totalAmount, formatCurrency, apiResponse, refetch } =
    useCart();

  // Get Buy Now state from Redux
  const { buyNowProduct, isBuyNowMode } = useSelector((state) => state.buyNow);

  const [placeOrder, { isLoading: isPlacingOrder }] = usePlaceOrderMutation();
  const [applyPromoCode, { isLoading: isApplyingPromo }] =
    useApplyPromoCodeMutation();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const userData = profileData?.data || user;

  // Determine which items to use (Buy Now or Cart)
  const currentItems =
    isBuyNowMode && buyNowProduct ? [buyNowProduct.productDetails] : cartItems;

  // Calculate totals from current items (Buy Now or Cart)
  const itemCost =
    isBuyNowMode && buyNowProduct
      ? buyNowProduct.productDetails.price *
        buyNowProduct.productDetails.quantity
      : totalAmount ||
        cartItems.reduce(
          (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
          0
        );

  const shippingFee = itemCost > 0 ? 29.0 : 0.0; // free shipping if no items
  const orderAmount = itemCost + shippingFee; // Total before discount
  const total =
    discountedPrice > 0 ? discountedPrice : orderAmount - discountAmount;

  // Get shopId from current items (Buy Now or Cart)
  const getShopId = () => {
    if (isBuyNowMode && buyNowProduct) {
      return buyNowProduct.shop;
    }
    if (cartItems.length === 0) return null;
    // Get the first shopId from cart items
    return cartItems[0]?.shopId || null;
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.showError("Please enter a promo code");
      return;
    }

    const shopId = getShopId();
    if (!shopId) {
      toast.showError(
        "Unable to apply promo code. Cart is empty or missing shop information."
      );
      return;
    }

    const orderAmountValue = orderAmount;

    try {
      const response = await applyPromoCode({
        data: {
          shopId: shopId,
          orderAmount: orderAmountValue,
        },
        couponCode: promoCode.trim(),
      }).unwrap();

      if (response?.success && response?.data) {
        const { discountAmount: discount, discountedPrice: discounted } =
          response.data;
        setDiscountAmount(discount || 0);
        setDiscountedPrice(discounted || orderAmountValue - (discount || 0));
        setAppliedPromoCode(promoCode.trim());
        toast.showSuccess(
          response?.message || "Promo code applied successfully!"
        );
      } else {
        toast.showError(response?.message || "Failed to apply promo code");
      }
    } catch (error) {
      console.error("Failed to apply promo code:", error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.error?.[0]?.message ||
        "Invalid promo code. Please try again.";
      toast.showError(errorMessage);
      // Reset promo code state on error
      setDiscountAmount(0);
      setDiscountedPrice(0);
      setAppliedPromoCode("");
    }
  };

  const handlePlaceOrder = async () => {
    if (!deliveryOption) {
      toast.showError("Please select a delivery option");
      return;
    }

    if (!paymentMethod) {
      toast.showError("Please select a payment method");
      return;
    }

    if (!shippingAddress) {
      toast.showError("Please provide a shipping address");
      return;
    }

    if (currentItems.length === 0) {
      toast.showError(
        isBuyNowMode ? "No product selected" : "Your cart is empty"
      );
      return;
    }

    // Handle Buy Now mode vs Cart mode
    let itemsByShop = {};

    if (isBuyNowMode && buyNowProduct) {
      // For Buy Now, use the stored product data
      itemsByShop[buyNowProduct.shop] = [buyNowProduct.productDetails];
    } else {
      // For Cart mode, group items by shopId
      cartItems.forEach((item) => {
        const shopId = item.shopId;
        if (!shopId) {
          console.error("Item missing shopId:", item);
          return;
        }
        if (!itemsByShop[shopId]) {
          itemsByShop[shopId] = [];
        }
        itemsByShop[shopId].push(item);
      });
    }

    // Create orders for each shop
    const orderPromises = Object.entries(itemsByShop).map(
      async ([shopId, items]) => {
        // Transform items to API format
        const products = items.map((item) => {
          if (isBuyNowMode && buyNowProduct) {
            // For Buy Now mode, use the exact format from buyNowProduct
            return {
              product: item.id,
              variant: buyNowProduct.products[0].variant,
              quantity: item.quantity,
            };
          } else {
            // For Cart mode, use existing logic
            return {
              product: item.productId || item.id,
              variant: item.variantId,
              quantity: item.quantity,
            };
          }
        });

        const orderData = {
          shop: shopId,
          products: products,
          deliveryOptions: deliveryOption,
          shippingAddress: shippingAddress,
          paymentMethod: paymentMethod,
        };

        // Add coupon if provided and applied
        if (appliedPromoCode) {
          orderData.coupon = appliedPromoCode;
        }

        return placeOrder(orderData).unwrap();
      }
    );

    try {
      const responses = await Promise.all(orderPromises);
      console.log("Orders placed successfully:", responses);

      // Show success message
      toast.showSuccess("Order placed successfully!");

      // Clear Buy Now data if in Buy Now mode
      if (isBuyNowMode) {
        dispatch(clearBuyNowProduct());
      } else {
        // Refetch cart to clear it for normal cart mode
        refetch();
      }

      // Redirect to success page
      router.push(responses?.[0]?.data?.url);
    } catch (error) {
      console.error("Failed to place order:", error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.error?.[0]?.message ||
        "Failed to place order. Please try again.";
      toast.showError(errorMessage);
    }
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-red-700 font-bold">
          Your Order Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Promo Code Section */}
        <div className="flex space-x-2">
          <Input
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-grow"
            disabled={isApplyingPromo}
          />
          <Button
            variant="destructive"
            className="bg-red-700 hover:bg-red-800"
            onClick={handleApplyPromoCode}
            disabled={!promoCode || isApplyingPromo}
          >
            {isApplyingPromo ? "Applying..." : "Apply"}
          </Button>
        </div>
        {appliedPromoCode && (
          <div className="text-sm text-green-600">
            Promo code "{appliedPromoCode}" applied successfully!
          </div>
        )}

        {/* Cost Breakdown */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Item Cost</span>
                <span>{formatCurrency(itemCost)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>{formatCurrency(shippingFee)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="text-green-600">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
              )}

              <div className="border-t pt-4 flex justify-between font-medium">
                <span>Total</span>
                <span className="text-red-700 font-bold">
                  {formatCurrency(total)}
                </span>
              </div>

              <p
                className="text-red-700 font-medium cursor-pointer hover:underline"
                onClick={() => setIsSheetOpen(true)}
              >
                View Details
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Terms Agreement */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={isAgreed}
            onCheckedChange={(checked) => setIsAgreed(checked === true)}
          />
          <label htmlFor="terms" className="text-sm">
            I have read and agree to the website{" "}
            <Link
              href="/terms-&-condition"
              className="text-blue-800 font-medium"
            >
              terms and conditions
            </Link>
            <span className="text-red-600">*</span>
          </label>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full bg-red-700 hover:bg-red-800"
          size="lg"
          disabled={
            !isAgreed ||
            currentItems.length === 0 ||
            isPlacingOrder ||
            !deliveryOption ||
            !paymentMethod ||
            !shippingAddress
          }
          onClick={handlePlaceOrder}
        >
          {isPlacingOrder ? "Placing Order..." : "Place Order"}
        </Button>
      </CardFooter>

      {/* Order Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="right"
          className="max-w-[400px] p-4 sm:max-w-lg overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription>
              Review your order items and billing information
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Products Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Products</h3>
              <div className="space-y-3">
                {currentItems.length > 0 ? (
                  currentItems.map((item, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex gap-4">
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <Image
                            src={
                              (item.productImage || item.image)?.startsWith(
                                "http"
                              )
                                ? item.productImage || item.image
                                : item.productImage || item.image
                                ? `${getImageUrl}${
                                    item.productImage || item.image
                                  }`
                                : "/assets/bag.png"
                            }
                            alt={item.name || "Product"}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {item.name || item.productName || "Product"}
                          </h4>
                          <div className="mt-1 space-y-1 text-xs text-gray-600">
                            {(item.color || item.variantSpecs?.color) && (
                              <p>
                                <span className="font-medium">Color:</span>{" "}
                                {item.color || item.variantSpecs?.color}
                              </p>
                            )}
                            {(item.size || item.variantSpecs?.size) && (
                              <p>
                                <span className="font-medium">Size:</span>{" "}
                                {item.size || item.variantSpecs?.size}
                              </p>
                            )}
                            {(item.variant?.storage ||
                              item.variantSpecs?.storage) && (
                              <p>
                                <span className="font-medium">Storage:</span>{" "}
                                {item.variant?.storage ||
                                  item.variantSpecs?.storage}
                              </p>
                            )}
                            {(item.variant?.ram || item.variantSpecs?.ram) && (
                              <p>
                                <span className="font-medium">RAM:</span>{" "}
                                {item.variant?.ram || item.variantSpecs?.ram}
                              </p>
                            )}
                          </div>
                          <div className="mt-2 flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              Qty: {item.quantity}
                            </span>
                            <span className="font-semibold text-sm">
                              {formatCurrency(
                                (item.price || 0) * (item.quantity || 1)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No items in cart</p>
                )}
              </div>
            </div>

            {/* Billing Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Billing Information
              </h3>
              <Card className="p-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>
                    <p className="mt-1">
                      {userData?.full_name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Phone:</span>
                    <p className="mt-1">{userData?.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Shipping Address:
                    </span>
                    <p className="mt-1">{shippingAddress || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Delivery Option:
                    </span>
                    <p className="mt-1">{deliveryOption || "Not selected"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Payment Method:
                    </span>
                    <p className="mt-1">
                      {paymentMethod === "Cod"
                        ? "COD (Cash on Delivery)"
                        : paymentMethod === "Online"
                        ? "Online (Stripe)"
                        : paymentMethod === "Card"
                        ? "Card (Credit/Debit)"
                        : paymentMethod || "Not selected"}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Order Summary Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <Card className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Item Cost:</span>
                    <span>{formatCurrency(itemCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping Fee:</span>
                    <span>{formatCurrency(shippingFee)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-green-600">
                        -{formatCurrency(discountAmount)}
                      </span>
                    </div>
                  )}
                  {appliedPromoCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Promo Code:</span>
                      <span className="text-blue-600">{appliedPromoCode}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span className="text-red-700">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  );
}
