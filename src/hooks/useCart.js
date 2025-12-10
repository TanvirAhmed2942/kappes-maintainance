import {
  useGetMyCartQuery,
  useUpdateMyCartMutation,
} from "../redux/cartApi/cartApi";
import { selectCartItems } from "../features/cartSlice";
import { useSelector, useDispatch } from "react-redux";
import { useDebounce } from "./useDebounce";
import { useState, useEffect, useRef } from "react";
import useToast from "../hooks/useShowToast";

export function useCart() {
  const toast = useToast();
  // Get cart from API
  const { data: apiResponse, isLoading, error, refetch } = useGetMyCartQuery();

  // Get cart from local Redux state as backup
  const localCartItems = useSelector(selectCartItems);
  const dispatch = useDispatch();

  // State for tracking quantity changes (stores full item info)
  const [quantityChanges, setQuantityChanges] = useState({});

  // Debounce quantity changes
  const debouncedQuantityChanges = useDebounce(quantityChanges, 1000);

  // Update cart mutation
  const [updateCart, { isLoading: isUpdating }] = useUpdateMyCartMutation();

  // Ref to track if update is in progress to prevent duplicate toasts
  const isUpdatingRef = useRef(false);
  // Ref to track the last processed changes to prevent re-processing
  const lastProcessedChangesRef = useRef("");

  // Debug the data sources
  console.log("API Cart Response:", apiResponse);
  console.log("Local Redux Cart:", localCartItems);

  // Extract and transform cart items from the API response structure
  let cartItems = [];

  if (apiResponse?.success && apiResponse?.data?.items) {
    // Transform the nested structure to match what the UI component expects
    cartItems = apiResponse.data.items.map((item, index) => {
      // Use variantId._id as itemId since items don't have their own _id in the response
      // This is the unique identifier for the cart item
      const cartItemId =
        item._id || item.id || item.itemId || item.variantId?._id;

      // Handle productId being null - use variant info as fallback
      const productId = item.productId?._id || item.productId?.id || null;
      const productName =
        item.productId?.name || item.variantId?.slug || "Product";
      const productImages =
        item.productId?.images || item.variantId?.images || [];
      const productImage = productImages[0] || "/assets/bag.png";

      return {
        id: productId || item.variantId?._id, // Use variantId if productId is null
        itemId: cartItemId, // Cart item ID for API operations (update/delete)
        name: productName,
        productName: productName,
        productImage: productImage,
        price: item.variantPrice || 0,
        quantity: item.variantQuantity || 1,
        color: item.variantId?.color?.name,
        size: item.variantId?.storage || item.variantId?.ram || null,
        variantId: item.variantId?._id || item.variantId?.id, // Variant ID for updates
        productId: productId, // Product ID for updates (can be null)
        shopId: item.shopId, // Shop ID for order creation
        // Add any other fields your UI might need
        totalItemPrice: item.totalPrice,
        variant: item.variantId, // Store full variant object for reference
      };
    });
    console.log("Transformed cart items:", cartItems);
  }

  // Note: We don't fall back to local cart items for API-based operations
  // because local items don't have itemId which is required for API calls
  // Only use API cart items for operations that require itemId

  // Handle debounced quantity updates
  useEffect(() => {
    // Prevent duplicate updates
    if (
      Object.keys(debouncedQuantityChanges).length === 0 ||
      isUpdatingRef.current
    ) {
      return;
    }

    // Create a serialized key from the changes to track if we've already processed this
    const changesKey = JSON.stringify(debouncedQuantityChanges);
    if (lastProcessedChangesRef.current === changesKey) {
      return; // Already processed these changes
    }

    // Mark as updating and track these changes
    isUpdatingRef.current = true;
    lastProcessedChangesRef.current = changesKey;

    // Update each item individually - API now uses productId in URL and only variantQuantity in body
    const updatePromises = Object.values(debouncedQuantityChanges).map(
      (item) => {
        // API expects: body = { variantQuantity: number }
        // URL = /cart/items/{productId}
        const updateData = {
          variantQuantity: parseInt(item.quantity),
        };

        // Use productId in URL (can be null, but API should handle it)
        const productId = item.productId || item.variantId; // Fallback to variantId if productId is null

        return updateCart({
          data: updateData,
          productId: productId,
        }).unwrap();
      }
    );

    Promise.all(updatePromises)
      .then((responses) => {
        console.log("Cart updated successfully", responses);
        toast.showSuccess("Cart updated successfully");
        setQuantityChanges({}); // Clear pending changes
        refetch(); // Refresh cart data
      })
      .catch((error) => {
        console.error("Failed to update cart:", error);
        const errorMessage =
          error?.data?.message ||
          error?.data?.error?.[0]?.message ||
          "Failed to update cart. Please try again.";
        toast.showError(errorMessage);
      })
      .finally(() => {
        // Reset updating flag after a short delay to allow refetch to complete
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 500);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuantityChanges]);

  // Function to update quantity (will be debounced)
  // Takes full item object to get productId for the URL
  const updateQuantity = (item, newQuantity) => {
    // Use productId as key, fallback to variantId if productId is null
    const key = item.productId || item.variantId || item.id;
    setQuantityChanges((prev) => ({
      ...prev,
      [key]: {
        productId: item.productId || item.variantId, // Use variantId as fallback if productId is null
        variantId: item.variantId,
        quantity: newQuantity,
      },
    }));
  };

  // Calculate total amount safely
  const totalAmount = Array.isArray(cartItems)
    ? cartItems.reduce((total, item) => {
        const itemPrice = parseFloat(item.price) || 0;
        return total + itemPrice * (item.quantity || 1);
      }, 0)
    : 0;

  const quantity = Array.isArray(cartItems)
    ? cartItems.reduce((total, item) => {
        return total + item.quantity;
      }, 0)
    : 0;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return {
    cartItems: Array.isArray(cartItems) ? cartItems : [],
    isLoading: isLoading || isUpdating,
    error,
    totalAmount,
    quantity,
    formatCurrency,
    updateCart,
    updateQuantity,
    refetch,
    apiResponse, // Return raw API response for order creation
  };
}
