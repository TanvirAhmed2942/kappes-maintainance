"use client";
import React from "react";
import WishListCard from "./wishListCard";
import useFavProducts from "../../../hooks/useFavProducts";
import { useGetFavProductsQuery } from "../../../redux/productApi/productApi";

function WishList({ selectedMenu }) {
  // All hooks must be called before any conditional returns
  const { favProducts, isLoading, error, refetch } = useFavProducts();

  // Also get the raw API data as fallback
  const { data: rawApiData } = useGetFavProductsQuery();

  // Debug: Log the data to see what we're getting
  React.useEffect(() => {
    // console.log("=== WishList Debug ===");
    // console.log("favProducts from hook:", favProducts);
    // console.log("favProducts type:", typeof favProducts);
    // console.log("favProducts isArray:", Array.isArray(favProducts));
    // console.log("favProducts length:", favProducts?.length);
    // console.log("rawApiData:", rawApiData);
    // console.log("isLoading:", isLoading);
    // console.log("error:", error);
  }, [favProducts, isLoading, error, rawApiData]);

  // Extract products from wishlist items (handle different API response structures)
  const products = React.useMemo(() => {
    // First try to use favProducts from Redux
    let sourceData = favProducts;

    // If favProducts is empty but we have raw API data, use that as fallback
    if ((!sourceData || sourceData.length === 0) && rawApiData) {
      console.log("Using rawApiData as fallback");
      // Extract from raw API response - handle the structure: data.result
      sourceData =
        rawApiData?.data?.result ||
        rawApiData?.data?.wishlist ||
        rawApiData?.wishlist ||
        rawApiData?.data ||
        (Array.isArray(rawApiData) ? rawApiData : []);

      // If result is an object, it might have an array property
      if (
        sourceData &&
        typeof sourceData === "object" &&
        !Array.isArray(sourceData)
      ) {
        // Try common array property names
        sourceData =
          sourceData.wishlist ||
          sourceData.items ||
          sourceData.products ||
          sourceData.data ||
          [];
      }
    }

    if (!sourceData || !Array.isArray(sourceData)) {
      console.log("No valid source data found. sourceData:", sourceData);
      return [];
    }

    console.log("Processing sourceData:", sourceData);
    console.log("SourceData length:", sourceData.length);

    const extracted = sourceData
      .map((item, index) => {
        // Handle different response structures:
        // 1. item.productId (if wishlist item has productId field with product object)
        // 2. item.product (if wishlist item has product field)
        // 3. item itself (if it's already a product object)
        let product = item;

        // Check if item has nested product
        if (item.productId && typeof item.productId === "object") {
          product = item.productId;
        } else if (item.product && typeof item.product === "object") {
          product = item.product;
        }

        // If product is an object with _id or id, it's valid
        if (
          product &&
          typeof product === "object" &&
          (product._id || product.id)
        ) {
          console.log(
            `Product ${index} extracted:`,
            product._id || product.id,
            product.name || "No name"
          );
          return product;
        }

        console.log(`Product ${index} invalid:`, item);
        return null;
      })
      .filter(Boolean); // Remove null/undefined entries

    console.log("Final extracted products:", extracted.length);
    return extracted;
  }, [favProducts, rawApiData]);

  // Early return if not the right menu (after all hooks)
  if (selectedMenu !== 3) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full p-4 z-10">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">My Wishlist</h2>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="w-full p-4 z-10">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">My Wishlist</h2>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading wishlist</p>
            <p className="text-gray-500 text-sm">
              {error?.message || "Please try again later"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 z-10">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">My Wishlist</h2>
        <p className="text-gray-600">
          {products.length} {products.length === 1 ? "item" : "items"} in your
          wishlist
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 items-stretch">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No favorite products yet
            </h3>
            <p className="text-gray-500">
              Start adding products to your wishlist by clicking the heart icon
              on any product.
            </p>
          </div>
        ) : (
          products.map((product, index) => {
            return (
              <WishListCard
                key={product._id || product.id || index}
                product={product}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default WishList;
