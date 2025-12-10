"use client";
import React, { useEffect } from "react";
import { Heart, Minus, Plus, MessageCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import Image from "next/image";
import { addCart } from "../../features/cartSlice";
import { openChat } from "../../features/chatSlice";
import { setBuyNowProduct } from "../../features/buyNowSlice";
import provideIcon from "../../common/components/provideIcon";
import Link from "next/link";
import useProductDetails from "../../hooks/useProductDetails";
import useProductVariantSelection from "../../hooks/useProductVariantSelection";
import useProductSlug from "../../hooks/useProductSlug";
import { getImageUrl } from "../../redux/baseUrl";
import ProductSpecs from "./ProductSpecs";
import { isProductInStock } from "../../utils/productUtils";
import { useRouter } from "next/navigation";
import { useAddToCartMutation } from "../../redux/cartApi/cartApi";
import useToast from "../../hooks/useShowToast";
import { useCart } from "../../hooks/useCart";
import { useCreateChatMutation } from "../../redux/shopuserChatApi/shopuserChatApi";
import useAuth from "../../hooks/useAuth";

function ProductView() {
  const dispatch = useDispatch();
  const router = useRouter();
  const toast = useToast();
  const { refetch: refetchCart } = useCart();
  const { userId } = useAuth();

  // Get chat state from Redux
  const { unreadCount } = useSelector((state) => state.chat);

  // Add to cart mutation
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

  // Create chat mutation
  const [createChat, { isLoading: isCreatingChat }] = useCreateChatMutation();

  // Use our custom hooks to get product details
  const { productDetails, isLoading, error } = useProductDetails();

  // Use variant selection hook
  const {
    // State setters
    setSelectedColor,
    setSelectedStorage,
    setSelectedRam,
    setSelectedSize,
    setMainImage,
    setQuantity,

    // State values
    selectedColor,
    selectedStorage,
    selectedRam,
    selectedSize,
    selectedVariant,
    mainImage,
    quantity,

    // Derived values
    availableVariants,
    availableSizesForColor,
    productImages,
    pricing,
    stockStatus,

    // Methods
    initializeVariantSelection,
    updateSelectedVariant,
    updateSizeForColor,
  } = useProductVariantSelection(productDetails);

  // Use product slug hook
  const { slugDetails, isValidVariantSlug, isVariantAvailable } =
    useProductSlug(productDetails, selectedVariant);

  // console.log("productDetails", productDetails);

  // Initialize variant selection when product details load
  useEffect(() => {
    if (productDetails) {
      initializeVariantSelection();
    }
  }, [productDetails, initializeVariantSelection]);

  // Update selected variant when specifications change
  useEffect(() => {
    updateSelectedVariant();
  }, [
    selectedColor,
    selectedStorage,
    selectedRam,
    selectedSize,
    updateSelectedVariant,
  ]);

  // Update size when color changes
  useEffect(() => {
    updateSizeForColor();
  }, [selectedColor, updateSizeForColor]);

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const handleAddToCart = async () => {
    if (!productDetails) return;

    // Validate that we have a variant selected if variants are required
    if (!selectedVariant?.variantId?._id) {
      toast.showError("Please select a product variant (color, storage, etc.)");
      return;
    }

    // Prepare the cart item for API
    const productId = productDetails._id || productDetails.id;
    const variantId = selectedVariant.variantId._id;
    const variantQuantity = quantity;
    const shopId = productDetails.shopId?._id || productDetails.shopId?.id;

    // API expects: { items: [{ productId, variantId, variantQuantity, shopId }] }
    // Note: productId can be null based on API response structure
    const cartData = {
      items: [
        {
          variantId: variantId,
          variantQuantity: variantQuantity,
        },
      ],
    };

    // Only add productId if it exists (not null)
    if (productId) {
      cartData.items[0].productId = productId;
    }

    // Add shopId to the item
    if (shopId) {
      cartData.items[0].shopId = shopId;
    }

    try {
      const response = await addToCart({ data: cartData }).unwrap();

      if (response?.success) {
        toast.showSuccess(
          response?.message || "Item added to cart successfully"
        );

        // Also update local Redux for optimistic UI
        const cartItem = {
          id: productId,
          productName: productDetails.name,
          quantity: variantQuantity,
          price: selectedVariant.variantPrice,
          productImage: productImages[0] || "/assets/productPage/bag1.png",
          variantId: variantId,
          variantSpecs: {
            color: selectedVariant.variantId.color?.name,
            storage: selectedVariant.variantId.storage,
            ram: selectedVariant.variantId.ram,
            size: selectedVariant.variantId.size,
          },
        };
        dispatch(addCart(cartItem));

        // Refetch cart from API to get the latest data
        refetchCart();
      } else {
        toast.showError(response?.message || "Failed to add item to cart");
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.error?.[0]?.message ||
        "Failed to add item to cart. Please try again.";
      toast.showError(errorMessage);
    }
  };

  const handleOpenChat = async () => {
    if (!productDetails?.shopId) {
      toast.showError("Shop information not available");
      return;
    }

    if (!userId) {
      toast.showError("Please log in to send messages");
      return;
    }

    try {
      // Create chat with the shop - format as participants array
      const chatData = {
        participants: [
          {
            participantId: userId,
            participantType: "User",
          },
          {
            participantId:
              productDetails.shopId._id || productDetails.shopId.id,
            participantType: "Shop",
          },
        ],
      };

      const response = await createChat(chatData).unwrap();

      if (response?.success) {
        // Use shop info from product for chat
        const sellerInfo = {
          name: productDetails.shopId.name || "Shop",
          location: "Canada",
          id: response.data._id, // Use the chat ID
          chatId: response.data._id,
          avatar: productDetails.shopId.logo
            ? `${getImageUrl}${
                productDetails.shopId.logo.startsWith("/")
                  ? productDetails.shopId.logo.slice(1)
                  : productDetails.shopId.logo
              }`
            : "/assets/chat/default-shop.png",
          isOnline: true,
          lastSeen: "Online",
        };

        dispatch(openChat(sellerInfo));
        toast.showSuccess("Chat opened successfully");
      } else {
        toast.showError(response?.message || "Failed to create chat");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.errorMessages?.[0]?.message ||
        "Failed to create chat. Please try again.";
      toast.showError(errorMessage);
    }
  };

  const handleBuyNow = () => {
    if (!productDetails) return;
    if (!selectedVariant?.variantId?._id) {
      toast.showError("Please select a product variant (color, storage, etc.)");
      return;
    }
    if (!userId) {
      toast.showError("Please log in to buy now");
      return;
    }

    // Prepare Buy Now product data for Redux
    const buyNowData = {
      shop: productDetails.shopId?._id || productDetails.shopId?.id,
      products: [
        {
          product: productDetails._id || productDetails.id,
          variant: selectedVariant.variantId._id,
          quantity: quantity,
        },
      ],
      // Additional product details for display
      productDetails: {
        id: productDetails._id || productDetails.id,
        name: productDetails.name,
        image: productImages[0] || "/assets/productPage/bag1.png",
        price: selectedVariant.variantPrice,
        quantity: quantity,
        variantSpecs: {
          color: selectedVariant.variantId.color?.name,
          storage: selectedVariant.variantId.storage,
          ram: selectedVariant.variantId.ram,
          size: selectedVariant.variantId.size,
        },
        shopId: productDetails.shopId?._id || productDetails.shopId?.id,
        shopName: productDetails.shopId?.name || "Shop",
      },
    };

    // Store in Redux
    dispatch(setBuyNowProduct(buyNowData));

    // Navigate to billing procedure
    router.push(`/check-out/billing-procedure`);
  };

  if (isLoading || !productDetails) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-12">
          <h1 className="text-2xl">Loading product...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mt-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-12">
          <h1 className="text-2xl text-red-600">Error loading product</h1>
          <p className="mt-2">{error.toString()}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-14">
          {/* Left - Images */}
          <div className="w-full md:w-1/2">
            <div className="relative mb-4 bg-white rounded-lg overflow-hidden">
              <Image
                width={500}
                height={500}
                src={`${getImageUrl}/${productImages[mainImage]}`}
                alt={productDetails.name}
                className="w-full h-[20rem] md:h-[30rem] lg:h-[40rem] object-contain transition-transform duration-300 hover:scale-110"
                priority
              />
              {/* <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-white"
              >
                <Heart
                  fill={productDetails.isFeatured ? "red" : "none"}
                  size={25}
                />
              </Button> */}
            </div>

            <div className="flex justify-between overflow-x-auto border-2 rounded-2xl p-3 h-30">
              {productImages.map((image, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={`p-0 rounded-md overflow-hidden h-full ${
                    mainImage === index
                      ? "ring-2 ring-red-600"
                      : "ring-1 ring-gray-200"
                  }`}
                  onClick={() => setMainImage(index)}
                >
                  <Image
                    src={`${getImageUrl}/${image}`}
                    alt={`Thumbnail ${index + 1}`}
                    width={500}
                    height={500}
                    className="w-20 h-full object-cover"
                  />
                </Button>
              ))}
            </div>
          </div>

          {/* Right - Info */}
          <div className="w-full md:w-1/2">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold mb-2 font-comfortaa">
                {productDetails.name}
              </h1>
              <span className="flex items-center gap-2 text-lg font-comfortaa font-bold cursor-pointer">
                {provideIcon({ name: "share" })}Share
              </span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                <span>★</span>
                <span>{productDetails.avg_rating || 0}</span>
              </div>
              <span className="text-gray-500">
                ({productDetails.totalReviews || 0})
              </span>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl font-bold text-red-600">
                ${pricing.currentPrice.toFixed(2)}
              </span>
              {pricing.hasDiscount && (
                <span className="text-gray-500 line-through">
                  ${pricing.originalPrice.toFixed(2)}
                </span>
              )}
              {pricing.hasDiscount && (
                <Badge variant="destructive" className="text-xs">
                  -{pricing.discountPercentage}%
                </Badge>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">{stockStatus}</p>
              {selectedVariant && (
                <div className="mt-2 flex items-center gap-4 text-sm">
                  {selectedVariant.variantId?.identifier && (
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      <span className="text-gray-500">Variant:</span>{" "}
                      <span className="font-medium">
                        {selectedVariant.variantId.identifier}
                      </span>
                    </span>
                  )}
                  <span
                    className={`${
                      selectedVariant.variantQuantity > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedVariant.variantQuantity > 0
                      ? `${selectedVariant.variantQuantity} in stock`
                      : "Out of stock"}
                  </span>
                </div>
              )}
            </div>

            {/* {/* Variant Availability Warning */}
            {/* {(!isValidVariantSlug || !isVariantAvailable) && (
              <div
                className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4"
                role="alert"
              >
                <p className="font-bold">Variant Unavailable</p>
                <p>
                  {!isValidVariantSlug &&
                    "This product variant configuration is not valid. "}
                  {!isVariantAvailable &&
                    "This variant is currently out of stock. "}
                  Please select a different variant or check back later.
                </p>
              </div>
            )} */}

            {/* Color Selection */}
            {availableVariants.color && availableVariants.color.length > 0 && (
              <div className="mb-6">
                <p className="font-semibold mb-2">Color:</p>
                <div className="flex gap-2">
                  {availableVariants.color.map((color) => (
                    <button
                      key={color.code}
                      className={`w-8 h-8 rounded-full ${
                        selectedColor === color.code.replace("#", "")
                          ? "ring-2 ring-offset-2 ring-black"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedColor(color.code.replace("#", ""))
                      }
                      style={{ backgroundColor: color.code }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Storage Selection */}
            {availableVariants.storage &&
              availableVariants.storage.length > 0 && (
                <div className="mb-6">
                  <p className="font-semibold mb-2">Storage:</p>
                  <div className="flex gap-2">
                    {availableVariants.storage.map((storage) => (
                      <Button
                        key={storage}
                        variant={
                          selectedStorage === storage ? "default" : "outline"
                        }
                        className={`${
                          selectedStorage === storage
                            ? "bg-red-700 hover:bg-red-800"
                            : ""
                        }`}
                        onClick={() => setSelectedStorage(storage)}
                      >
                        {storage}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

            {/* RAM Selection */}
            {availableVariants.ram && availableVariants.ram.length > 0 && (
              <div className="mb-6">
                <p className="font-semibold mb-2">RAM:</p>
                <div className="flex gap-2">
                  {availableVariants.ram.map((ram) => (
                    <Button
                      key={ram}
                      variant={selectedRam === ram ? "default" : "outline"}
                      className={`${
                        selectedRam === ram ? "bg-red-700 hover:bg-red-800" : ""
                      }`}
                      onClick={() => setSelectedRam(ram)}
                    >
                      {ram}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {selectedColor && availableVariants.size && (
              <div className="mb-6">
                <p className="font-semibold mb-2">Size:</p>
                <div className="flex gap-2">
                  {availableSizesForColor.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      className={`w-10 h-10 p-0 ${
                        selectedSize === size
                          ? "bg-red-700 hover:bg-red-800"
                          : ""
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="font-semibold mb-2">Quantity:</p>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-r-none h-8 w-8"
                  onClick={decreaseQuantity}
                >
                  <Minus size={16} />
                </Button>
                <div className="w-12 h-8 flex items-center justify-center border-t border-b border-gray-300">
                  {quantity}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-l-none h-8 w-8"
                  onClick={increaseQuantity}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={
                  !isProductInStock(productDetails, selectedVariant) ||
                  isAddingToCart
                }
              >
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </Button>
              <Button
                className="flex-1 bg-red-700 hover:bg-red-800"
                disabled={!isProductInStock(productDetails, selectedVariant)}
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </div>

            <div className="mb-6">
              <div className="flex items-start gap-2 mb-2">
                <span className="font-bold">•</span>
                <div>
                  <span className="font-bold">Category:</span>{" "}
                  {productDetails.categoryId?.name || "Uncategorized"}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <div>
                  <span className="font-bold">Tags:</span>
                  {productDetails.tags?.map((tag, index) => (
                    <Badge key={index} variant="outline" className="ml-1 mr-1">
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </Badge>
                  )) || "No tags"}
                </div>
              </div>
              {productDetails.brandId && (
                <div className="flex items-start gap-2 mt-2">
                  <span className="font-bold">•</span>
                  <div>
                    <span className="font-bold">Brand:</span>{" "}
                    {productDetails.brandId.name}
                  </div>
                </div>
              )}
            </div>

            {/* Product Specifications */}
            <ProductSpecs
              productDetails={productDetails}
              selectedVariant={selectedVariant}
            />

            <Card className="my-6 py-2">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center justify-start gap-4">
                  <div className="bg-gray-800 text-white  rounded-full border flex items-center gap-2">
                    <Image
                      src={`${getImageUrl}/${productDetails.shopId?.logo}`}
                      alt={productDetails.shopId?.name}
                      priority
                      width={50}
                      height={50}
                      className="rounded-full h-10 w-10 object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold">
                      {productDetails.shopId?.name || "Shop"}
                    </p>
                    <p className="text-sm text-gray-500">Canada</p>
                  </div>
                </div>
                <Link
                  href={`/store/${
                    productDetails.shopId?._id ||
                    productDetails.shopId?.id ||
                    "shop"
                  }`}
                >
                  <Button size="sm" className="bg-red-700 hover:bg-red-800">
                    Visit Store
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <div className="relative">
              <Button
                variant="outline"
                className="w-full border-red-700 text-red-700 hover:bg-red-50"
                onClick={handleOpenChat}
                disabled={isCreatingChat}
              >
                <MessageCircle size={20} className="mr-2" />
                <span>
                  {isCreatingChat
                    ? "Opening Chat..."
                    : "Send Message to Seller"}
                </span>
              </Button>

              {/* Show notification dot if there are unread messages */}
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductView;
