"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import useFavProducts from "../../../hooks/useFavProducts";
import { getImageUrl } from "../../../redux/baseUrl";

export default function WishListCard({ product }) {
  const { removeFromFavorites, isLoading } = useFavProducts();

  const productId = product._id || product.id;
  const name = product.name;
  const productImage = product.images || product.productImage;
  const originalPrice = product.basePrice || product.originalPrice || 0;
  const discountPrice =
    product.product_variant_Details?.[0]?.variantPrice || product.discountPrice;
  const rating = product.avg_rating || product.rating || 0;
  const reviews = product.totalReviews || product.reviews || 0;

  const hasDiscount = Array.isArray(discountPrice)
    ? discountPrice?.[0]
    : discountPrice && discountPrice > originalPrice;
  let discountedPrice = originalPrice;

  if (hasDiscount) {
    if (Array.isArray(discountPrice)) {
      const [_, discountType, value] = discountPrice;
      discountedPrice =
        discountType === "percent"
          ? originalPrice * (1 - value / 100)
          : originalPrice - value;
    } else {
      discountedPrice = discountPrice;
    }
  }

  const handleRemove = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (productId) {
      await removeFromFavorites(productId);
    }
  };

  const imageSrc = productImage?.[0]
    ? `${getImageUrl}${
        productImage[0].startsWith("/")
          ? productImage[0]
          : `/${productImage[0]}`
      }`
    : "/assets/fallback.jpg";

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden w-full h-full max-w-xs sm:max-w-sm md:max-w-[260px] relative hover:shadow-md transition flex flex-col">
      <button
        className={`absolute top-3 right-3 text-red-500 z-50 ${
          isLoading ? "opacity-50 cursor-wait" : ""
        }`}
        onClick={handleRemove}
        disabled={isLoading}
        title="Remove from wishlist"
      >
        <Heart size={18} fill="red" />
      </button>

      <div className="w-full aspect-square relative flex-shrink-0">
        <Image
          src={imageSrc}
          alt={name || "Product"}
          fill
          className="object-contain"
        />
      </div>

      <div className="px-4 py-3 flex flex-col flex-grow text-left">
        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
          {name || "Product Name"}
        </h3>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg font-bold text-[#AF1500]">
            ${discountedPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm line-through text-gray-400">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>
        <div className="min-h-[1.25rem]">
          {rating > 0 ? (
            <div className="text-yellow-400 text-sm">
              ⭐ {rating.toFixed(1)} ({reviews} reviews)
            </div>
          ) : (
            <div className="text-sm text-transparent">-</div>
          )}
        </div>
      </div>
    </div>
  );
}
