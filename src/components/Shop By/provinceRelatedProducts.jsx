"use client";
import useVirtualizedList from "../../hooks/VirtualizedList";
import { useState, useMemo } from "react";
import Image from "next/image";

import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import Link from "next/link";
import { getImageUrl } from "../../redux/baseUrl";
import { GrLocation } from "react-icons/gr";

export default function ProvinceRelatedProducts({
  shops = [],
  isLoading = false,
  selectedLocation = "",
  selectedTab = "province",
}) {
  const [sortOption, setSortOption] = useState("featured");

  // Transform API shops to match component structure
  const transformedShops = useMemo(() => {
    return shops.map((shop) => {
      // Get address information
      const address = shop.address
        ? `${shop.address.detail_address || ""} ${shop.address.city || ""} ${
            shop.address.province || ""
          }`.trim()
        : "";

      return {
        id: shop._id || shop.id,
        name: shop.name,
        logo: shop.logo,
        coverPhoto: shop.coverPhoto,
        banner: shop.banner || [],
        rating: Math.round(shop.rating || 0),
        totalReviews: shop.totalReviews || 0,
        totalFollowers: shop.totalFollowers || 0,
        address: address,
        isAdvertised: shop.isAdvertised || false,
        isActive: shop.isActive || false,
        description: shop.description || "",
      };
    });
  }, [shops]);

  // Sort shops based on sort option
  const sortedShops = useMemo(() => {
    const sorted = [...transformedShops];
    switch (sortOption) {
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "followers":
        return sorted.sort((a, b) => b.totalFollowers - a.totalFollowers);
      case "newest":
        return sorted; // API doesn't provide createdAt in this response
      default:
        return sorted;
    }
  }, [transformedShops, sortOption]);

  const ITEM_HEIGHT = 350;
  const COLUMN_COUNT = 4;
  const OVERSCAN = 5;

  const { containerRef, visibleItems, totalHeight, offsetY } =
    useVirtualizedList(sortedShops, ITEM_HEIGHT, OVERSCAN, COLUMN_COUNT);

  const StarRating = ({ rating }) => (
    <div className="flex text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "text-yellow-400" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col w-full">
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between p-4 border-b flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 hidden sm:inline">
            Shops ({sortedShops.length} shops)
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-auto w-full"
        style={{ height: "calc(100vh - 73px)", minHeight: "400px" }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading shops...</p>
            </div>
          </div>
        ) : !selectedLocation ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-600 text-lg">
                Please select a {selectedTab} to view shops
              </p>
            </div>
          </div>
        ) : sortedShops.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-600 text-lg">
                No shops found for this {selectedTab}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative" style={{ height: `${totalHeight}px` }}>
            <div
              className="absolute left-0 right-0"
              style={{ transform: `translateY(${offsetY}px)` }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-4">
                {visibleItems.map((shopItem) => {
                  // Construct cover photo URL
                  const coverPath =
                    shopItem.coverPhoto || shopItem.banner?.[0] || "";
                  const coverUrl = coverPath
                    ? coverPath.startsWith("http")
                      ? coverPath
                      : `${getImageUrl}${
                          coverPath.startsWith("/")
                            ? coverPath.slice(1)
                            : coverPath
                        }`
                    : "/assets/default-shop-cover.jpg";

                  // Construct logo URL
                  const logoPath = shopItem.logo || "";
                  const logoUrl = logoPath
                    ? logoPath.startsWith("http")
                      ? logoPath
                      : `${getImageUrl}${
                          logoPath.startsWith("/")
                            ? logoPath.slice(1)
                            : logoPath
                        }`
                    : "/assets/default-store-logo.png";

                  return (
                    <Link key={shopItem.id} href={`/store/${shopItem.id}`}>
                      <div
                        style={{
                          boxShadow:
                            "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
                        }}
                        className="group flex items-center justify-center relative h-60 w-60 rounded-full border-2 border-transparent overflow-hidden transition-all duration-200 hover:border-red-700 cursor-pointer shadow-xl/10 inset-shadow-orange-100"
                      >
                        {/* Background Image - Absolute */}
                        <Image
                          src={logoUrl}
                          alt={shopItem.name}
                          width={240}
                          height={240}
                          className="object-cover rounded-full"
                        />
                        {/* White background overlay that slides up from bottom on hover */}
                        <div className="absolute bottom-0 left-0 right-0 bg-white/95 h-[55%] flex flex-col items-center justify-center px-4 py-4 rounded-b-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-10">
                          <h3 className="font-medium text-base truncate w-full text-center mb-1">
                            {shopItem.name}
                          </h3>
                          {shopItem.address && (
                            <div className="flex items-center justify-center text-xs text-gray-600 mb-1">
                              <GrLocation className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate text-center max-w-[150px]">
                                {shopItem.address}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-center">
                            <StarRating rating={shopItem.rating} />
                            <span className="text-gray-600 text-xs ml-1">
                              ({shopItem.totalReviews})
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
