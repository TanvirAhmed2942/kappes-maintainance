"use client";
import React, { useState } from "react";
import StoreCover from "./storeCover";
import StoreBanner from "./storeBanner";
import Filter from "../Shop/filter";
import ShopProductList from "../Shop/productList";
import { useStoreShop } from "../../hooks/useStoreShop";
import { useParams } from "next/navigation";
import { useGetShopbyIdQuery } from "../../redux/shopApi/shopApi";
import { getBaseUrl } from "../../redux/baseUrl";
function StoreLayout() {
  // Get store ID from URL params
  const params = useParams();
  const storeId = params?.id;

  // State for filter visibility
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortOption, setSortOption] = useState("featured");

  // Use custom hook to fetch store products
  const {
    products,
    isLoading,
    error,
    getProductPrice,
    hasDiscountedPrice,
    toggleFavorite,
  } = useStoreShop(storeId);

  // Handler for filter visibility toggle
  const handleFilterVisible = () => {
    setFilterVisible(!filterVisible);
  };

  const {
    data: shopData,
    isLoading: shopLoading,
    error: shopError,
  } = useGetShopbyIdQuery(storeId);
  console.log(shopData?.data);

  const shopInfo = {
    shopCover: shopData?.data?.coverPhoto,
    name: shopData?.data?.name,
    logo: shopData?.data?.logo,
    aboutUs: shopData?.data?.description,
    followers: shopData?.data?.totalFollowers,
    rating: shopData?.data?.rating,
  };

  const shopBanner = shopData?.data?.banner
    ? Array.isArray(shopData.data.banner)
      ? shopData.data.banner.map((banner) => {
          const bannerPath = banner?.startsWith("http")
            ? banner
            : `${getBaseUrl().replace("/api/v1", "")}/${
                banner?.startsWith("/") ? banner.slice(1) : banner
              }`;
          return {
            url: bannerPath,
            alt: "shop banner",
          };
        })
      : []
    : [];

  return (
    <div className="lg:px-32">
      <StoreCover shopInfo={shopInfo} />
      <StoreBanner shopBanner={shopBanner} />
      <div className="flex items-start justify-start my-10">
        <Filter filterVisible={filterVisible} />
        <ShopProductList
          products={products}
          isLoading={isLoading}
          error={error}
          filterVisible={filterVisible}
          handleFilterVisible={handleFilterVisible}
          sortOption={sortOption}
          setSortOption={setSortOption}
          getProductPrice={getProductPrice}
          hasDiscountedPrice={hasDiscountedPrice}
          toggleFavorite={toggleFavorite}
        />
      </div>
    </div>
  );
}

export default StoreLayout;
