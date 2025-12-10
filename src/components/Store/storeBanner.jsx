import CarouselPlay from "../../common/components/carousel";
import React from "react";
import { getBaseUrl } from "../../redux/baseUrl";

function StoreBanner({ shopBanner }) {
  // Ensure shopBanner is an array
  const bannerArray = Array.isArray(shopBanner) ? shopBanner : [];

  const bannerItem = bannerArray.map((banner, index) => {
    let imageUrl = banner?.url;

    // If no url, construct from banner string
    if (!imageUrl && banner) {
      if (typeof banner === "string") {
        imageUrl = banner.startsWith("http")
          ? banner
          : `${getBaseUrl().replace("/api/v1", "")}/${
              banner.startsWith("/") ? banner.slice(1) : banner
            }`;
      }
    }

    return {
      id: banner?.id || index + 1,
      image: imageUrl || "",
    };
  });

  // Don't render carousel if no banners
  if (bannerItem.length === 0) {
    return null;
  }

  return (
    <div className="w-full ">
      <CarouselPlay slideItem={bannerItem} />
    </div>
  );
}

export default StoreBanner;
