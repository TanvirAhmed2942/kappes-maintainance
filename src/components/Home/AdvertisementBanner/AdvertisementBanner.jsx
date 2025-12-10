"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";
import { useGetAdvertisementBannersQuery } from "../../../redux/advertisement/advertisementApi";
import { getImageUrl } from "../../../redux/baseUrl";
import { useRouter } from "next/navigation";
import "swiper/css";
import "swiper/css/pagination";

function AdvertisementBanner() {
  const {
    data: advertisementBanners,
    isLoading,
    error,
  } = useGetAdvertisementBannersQuery();
  const router = useRouter();

  // Flatten all banners from all shops into a single array with shop info
  const allBanners = React.useMemo(() => {
    if (!advertisementBanners?.data) return [];

    // Response structure: { success, message, data: { meta, result: [...] } }
    const shops = Array.isArray(advertisementBanners.data.result)
      ? advertisementBanners.data.result
      : [];

    const banners = [];
    shops.forEach((shop) => {
      if (
        shop.advertisement_banner &&
        Array.isArray(shop.advertisement_banner) &&
        shop.advertisement_banner.length > 0
      ) {
        shop.advertisement_banner.forEach((banner) => {
          banners.push({
            imageUrl: banner,
            shopId: shop._id || shop.id,
            shopName: shop.name || "Store",
            shopLogo: `${getImageUrl}${
              shop.logo.startsWith("/") ? shop.logo.slice(1) : shop.logo
            }`,
          });
        });
      }
    });

    return banners;
  }, [advertisementBanners]);

  const handleBannerClick = (shopId) => {
    router.push(`/shop-by-store/store/${shopId}`);
  };

  if (isLoading) {
    return (
      <div className="w-full md:w-[90%] mx-auto py-4 md:py-6 lg:py-8">
        <div className="mx-auto px-4">
          <div className="w-full h-[150px] sm:h-[280px] md:h-[350px] lg:h-[350px] bg-gray-200 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return null; // Don't show error on production, just hide component
  }

  if (!allBanners || allBanners.length === 0) {
    return null; // Don't show anything if no banners
  }

  return (
    <div className="w-full md:w-[90%] mx-auto py-4 md:py-6 lg:py-8 ">
      <div className=" mx-auto px-4">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          loop={allBanners.length > 1}
          speed={800}
          className="w-full rounded-xl overflow-hidden shadow-lg advertisement-swiper"
        >
          {allBanners.map((banner, index) => (
            <SwiperSlide key={`${banner.shopId}-${index}`}>
              <div
                className="relative w-full h-[150px] sm:h-[280px] md:h-[350px] lg:h-[350px] overflow-hidden group cursor-pointer"
                onClick={() => handleBannerClick(banner.shopId)}
              >
                <Image
                  src={`${getImageUrl}${
                    banner.imageUrl.startsWith("/")
                      ? banner.imageUrl.slice(1)
                      : banner.imageUrl
                  }`}
                  alt={`${banner.shopName} Advertisement`}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  sizes="100vw"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

                {/* Shop name overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Image
                      src={banner.shopLogo}
                      alt={banner.shopName}
                      width={100}
                      height={100}
                      className="w-10 h-10 object-cover rounded-full  bg-white p-1"
                    />
                    <p className="text-white font-semibold text-lg">
                      {banner.shopName}
                    </p>
                  </div>
                  <p className="text-white/90 text-sm">Click to visit store</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom pagination styles */}
        <style jsx global>{`
          .advertisement-swiper .swiper-pagination {
            bottom: 12px !important;
          }

          .advertisement-swiper .swiper-pagination-bullet {
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 9999px;
            margin: 0 4px !important;
            opacity: 0.7;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          .advertisement-swiper .swiper-pagination-bullet-active {
            width: 24px;
            background-color: #b01501;
            opacity: 1;
          }

          @media (min-width: 768px) {
            .advertisement-swiper .swiper-pagination {
              bottom: 16px !important;
            }
            .advertisement-swiper .swiper-pagination-bullet {
              width: 10px;
              height: 10px;
            }
            .advertisement-swiper .swiper-pagination-bullet-active {
              width: 32px;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default AdvertisementBanner;
