"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useGetFollowedShopsQuery } from "../../../redux/userprofileApi/userprofileApi";
import { getImageUrl } from "../../../redux/baseUrl";

function FollowedShop({ selectedMenu }) {
  const {
    data: followedShopsData,
    isLoading,
    error,
  } = useGetFollowedShopsQuery();

  // Extract shops array from response - handle different response structures
  const extractShops = () => {
    if (!followedShopsData) return [];

    // Case 1: { success: true, data: [...] }
    if (followedShopsData?.success && Array.isArray(followedShopsData.data)) {
      return followedShopsData.data;
    }

    // Case 2: { data: [...] }
    if (Array.isArray(followedShopsData?.data)) {
      return followedShopsData.data;
    }

    // Case 3: { data: { shops: [...] } } or { data: { result: [...] } }
    if (
      followedShopsData?.data?.shops &&
      Array.isArray(followedShopsData.data.shops)
    ) {
      return followedShopsData.data.shops;
    }
    if (
      followedShopsData?.data?.result &&
      Array.isArray(followedShopsData.data.result)
    ) {
      return followedShopsData.data.result;
    }

    // Case 4: Direct array
    if (Array.isArray(followedShopsData)) {
      return followedShopsData;
    }

    return [];
  };

  const followedShops = extractShops();

  // Debug logging
  console.log("Followed Shops API Response:", followedShopsData);
  console.log("Extracted Shops:", followedShops);

  if (selectedMenu !== 4) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-500">Loading followed shops...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[200px] text-red-500">
        <p>
          Error:{" "}
          {error?.data?.message ||
            error?.message ||
            "Failed to load followed shops"}
        </p>
      </div>
    );
  }

  if (!Array.isArray(followedShops) || followedShops.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px] text-gray-900">
        <p>You haven't followed any shops yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Followed Shops</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {followedShops.map((shop) => {
          const shopId = shop._id || shop.id;
          const shopName = shop.name || shop.storeName || "Shop";
          const shopLogo =
            shop.logo || shop.image || "/assets/default-store-logo.png";
          const logoUrl = shopLogo.startsWith("http")
            ? shopLogo
            : `${getImageUrl}${shopLogo}`;

          return (
            <div key={shopId} className="flex flex-col items-center">
              <Link href={`/store/${shopId}`} className="cursor-pointer">
                <div className="relative w-24 h-24 mb-2">
                  <Image
                    src={logoUrl}
                    alt={shopName}
                    fill
                    quality={100}
                    className="rounded-full object-cover border-2 border-gray-200 hover:border-red-500 transition-colors duration-300"
                  />
                </div>
              </Link>
              <h3 className="text-sm font-medium text-gray-900 text-center line-clamp-2">
                {shopName}
              </h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FollowedShop;
