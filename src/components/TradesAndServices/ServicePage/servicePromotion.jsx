"use client";
import React from "react";
import { useSelector } from "react-redux";
import CarouselPlay from "../../../common/components/carousel";
import { getImageUrl } from "../../../redux/baseUrl";

function ServicePromotion({ bannerImages = [] }) {
  // Get services from Redux state
  const { selectedService } = useSelector((state) => state.service);

  // Default service promotion images
  const defaultServicePromotionImage = [
    {
      id: 1,
      image: "/assets/tradesAndServies/servicePromo.png",
    },
    {
      id: 2,
      image: "/assets/tradesAndServies/servicePromo.png",
    },
    {
      id: 3,
      image: "/assets/tradesAndServies/servicePromo.png",
    },
  ];

  // Process banner images from API response
  const servicePromotionImage =
    bannerImages.length > 0
      ? bannerImages.map((banner, index) => ({
          id: index + 1,
          image: banner?.startsWith("http")
            ? banner
            : `${getImageUrl}${
                banner?.startsWith("/") ? banner.slice(1) : banner
              }`,
        }))
      : defaultServicePromotionImage;

  // If no service is selected, use default images
  if (!selectedService) {
    return (
      <div className="w-full md:w-[70%] lg:w-[80%] md:p-0">
        <CarouselPlay slideItem={defaultServicePromotionImage} />
        <div className="ml-5">
          <h2 className="text-3xl font-comfortaa font-bold -ml-5 my-5 text-gray-500">
            No Service Details Available
          </h2>
        </div>
      </div>
    );
  }

  // Determine services list from the service field
  const services = selectedService.service
    ? [{ id: 1, service: selectedService.service }]
    : [
        { id: 1, service: "Home Painting" },
        { id: 2, service: "Commercial Painting" },
        { id: 3, service: "Residential Painting" },
      ];

  return (
    <div className="w-full md:w-[70%] lg:w-[80%] md:p-0">
      <CarouselPlay slideItem={servicePromotionImage} />

      <div className="ml-5">
        <h2 className="text-3xl font-comfortaa font-bold -ml-5 my-5">
          Our Services
        </h2>

        <ul>
          {services.map((item) => (
            <li key={item.id} className="list-disc">
              {item.service}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ServicePromotion;
