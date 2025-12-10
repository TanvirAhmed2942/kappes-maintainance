"use client";
import { LucideCircleMinus, LucideCirclePlus, Trash2 } from "lucide-react";
import React from "react";
import { useCart } from "../../hooks/useCart";
import { useRemoveFromCartMutation } from "../../redux/cartApi/cartApi";
import useToast from "../../hooks/useShowToast";

function CartControlButton({ itemId, currentQuantity = 1, item }) {
  const { updateQuantity, refetch } = useCart();
  const [removeFromCart, { isLoading: isRemoving }] =
    useRemoveFromCartMutation();
  const toast = useToast();

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newQuantity = currentQuantity + 1;
    console.log("Increment clicked", { item, newQuantity });

    if (item) {
      // API now uses productId in URL, so ensure we have productId
      const productId = item.productId || item.variantId || item.id || itemId;
      const itemWithProductId = {
        ...item,
        productId: productId,
      };
      updateQuantity(itemWithProductId, newQuantity);
    } else {
      console.error("Item is missing");
      toast.showError(
        "Unable to update quantity. Item information is missing."
      );
    }
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentQuantity > 1) {
      const newQuantity = currentQuantity - 1;
      console.log("Decrement clicked", { item, newQuantity });

      if (item) {
        // API now uses productId in URL, so ensure we have productId
        const productId = item.productId || item.variantId || item.id || itemId;
        const itemWithProductId = {
          ...item,
          productId: productId,
        };
        updateQuantity(itemWithProductId, newQuantity);
      } else {
        console.error("Item is missing");
        toast.showError(
          "Unable to update quantity. Item information is missing."
        );
      }
    }
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // API now uses productId in URL params for deletion
    const productId = item?.productId || item?.variantId || item?.id || itemId;

    if (!productId) {
      console.error("Missing productId for removal. Item object:", item);
      toast.showError(
        "Unable to remove item. Product ID is missing. Please refresh the page."
      );
      return;
    }

    try {
      console.log("Removing item with productId:", productId);
      const response = await removeFromCart(productId).unwrap();

      if (response?.success) {
        toast.showSuccess(
          response?.message || "Item removed from cart successfully"
        );
        refetch(); // Refresh cart data
      } else {
        toast.showError(response?.message || "Failed to remove item from cart");
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.error?.[0]?.message ||
        "Failed to remove item from cart. Please try again.";
      toast.showError(errorMessage);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-between w-20 border bg-white p-1 rounded-md text-base font-medium">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={currentQuantity <= 1}
          className="hover:text-red-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <LucideCircleMinus size={20} />
        </button>
        <span className="px-2">{currentQuantity}</span>
        <button
          type="button"
          onClick={handleIncrement}
          className="hover:text-green-700 cursor-pointer flex items-center justify-center"
        >
          <LucideCirclePlus size={20} />
        </button>
      </div>
      <button
        type="button"
        onClick={handleRemove}
        disabled={isRemoving}
        className={`hover:text-red-700 cursor-pointer text-gray-500 flex items-center justify-center ${
          isRemoving ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}

export default CartControlButton;
