"use client";
import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

function CarouselPlay({ slideItem, imageClassName = "" }) {
  // Ensure slideItem is always an array
  const items = Array.isArray(slideItem) ? slideItem : [];

  // Don't render if no items
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-full relative">
      <Swiper
        modules={[Pagination, Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={items.length > 1}
        className="w-full h-full"
        style={{ height: "100%" }}
      >
        {items.map((item) => (
          <SwiperSlide key={item.id} className="w-full h-full">
            <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px] overflow-hidden">
              <Image
                src={item.image}
                width={1200}
                height={600}
                alt={item.image || "Carousel image"}
                className={`w-full h-full object-cover ${imageClassName}`}
                priority={item.id === 1}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom pill-style pagination */}
      <style jsx global>{`
        .swiper-pagination {
          bottom: 10px !important;
          z-index: 10;
        }

        .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background-color: rgba(255, 255, 255, 0.5);
          border-radius: 9999px;
          margin: 0 6px !important;
          opacity: 1;
          transition: all 0.3s ease;
        }

        .swiper-pagination-bullet-active {
          width: 32px;
          background-color: white;
        }

        .swiper {
          width: 100%;
          height: 100%;
        }

        .swiper-slide {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}

export default CarouselPlay;
