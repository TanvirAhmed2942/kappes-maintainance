"use client"; // Ensure this is a Client Component

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import ProvinceRelatedProducts from "./provinceRelatedProducts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useGetShopListProvinceQuery } from "../../redux/shopApi/shopApi";

// All locations data with flags
const locationsData = {
  province: [
    {
      id: 1,
      name: "British Columbia",
      image: "/assets/province/britshColumbia.png",
    },
    { id: 2, name: "Alberta", image: "/assets/province/alberta.png" },
    { id: 3, name: "Manitoba", image: "/assets/province/manitoba.png" },
    { id: 4, name: "Saskatchewan", image: "/assets/province/saskatchewan.png" },
    { id: 5, name: "Ontario", image: "/assets/province/ontario.png" },
    { id: 6, name: "Quebec", image: "/assets/province/quebec.png" },
    {
      id: 7,
      name: "New Brunswick",
      image: "/assets/province/newBrunswick.png",
    },
    { id: 8, name: "Nova Scotia", image: "/assets/province/novaScotia.png" },
    {
      id: 9,
      name: "Prince Edward Island",
      image: "/assets/province/princeEdwardIsland.png",
    },
    {
      id: 10,
      name: "Newfoundland",
      image: "/assets/province/newFoundland.png",
    },
  ],
  territory: [
    { id: 1, name: "Yukon", image: "/assets/city/Yukon.png" },
    {
      id: 2,
      name: "Northwest Territories",
      image: "/assets/city/Northwest Territories.png",
    },
    { id: 3, name: "Nunavut", image: "/assets/city/Nunavut.png" },
  ],
  city: [
    { id: 1, name: "Toronto", image: "/assets/province/ontario.png" },
    { id: 2, name: "Vancouver", image: "/assets/province/britshColumbia.png" },
    { id: 3, name: "Montreal", image: "/assets/province/quebec.png" },
    { id: 4, name: "Calgary", image: "/assets/province/alberta.png" },
    { id: 5, name: "Edmonton", image: "/assets/province/alberta.png" },
    { id: 6, name: "Ottawa", image: "/assets/province/ontario.png" },
    { id: 7, name: "Winnipeg", image: "/assets/province/manitoba.png" },
    { id: 8, name: "Halifax", image: "/assets/province/novaScotia.png" },
  ],
};

function ShopByProvinceLayout() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const locationParam = searchParams.get("location");

  const [selectedType, setSelectedType] = useState(typeParam || "province");
  const [selectedLocation, setSelectedLocation] = useState(
    locationParam ? decodeURIComponent(locationParam) : "Manitoba"
  );

  // Update state when URL params change
  useEffect(() => {
    if (typeParam) {
      setSelectedType(typeParam);
    }
    if (locationParam) {
      setSelectedLocation(decodeURIComponent(locationParam));
    }
  }, [typeParam, locationParam]);

  // Get current locations based on selected type
  const currentLocations = useMemo(() => {
    return locationsData[selectedType] || [];
  }, [selectedType]);

  // Get selected location image
  const selectedLocationData = useMemo(() => {
    return currentLocations.find((loc) => loc.name === selectedLocation);
  }, [currentLocations, selectedLocation]);

  // Handle type change
  const handleTypeChange = (value) => {
    setSelectedType(value);
    setSelectedLocation(""); // Reset location when type changes
  };

  // Handle location change
  const handleLocationChange = (value) => {
    setSelectedLocation(value);
  };

  // Fetch shops based on selected location
  const {
    data: shopsData,
    isLoading,
    isFetching,
    error,
  } = useGetShopListProvinceQuery(
    {
      location: selectedLocation,
      locationType: selectedType,
    },
    {
      skip: !selectedLocation,
      refetchOnMountOrArgChange: true,
    }
  );

  // Extract shops from API response
  const shops = (() => {
    if (!selectedLocation) return [];
    if (isFetching || isLoading) return [];
    if (error) return [];
    if (shopsData?.data?.result && Array.isArray(shopsData.data.result)) {
      return shopsData.data.result;
    }
    return [];
  })();

  return (
    <div className="px-4 lg:px-32">
      {/* Selection Area */}
      <div className="w-full max-w-4xl mx-auto mt-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          {/* Type Select (Province/Territory/City) */}
          <div className="w-full ">
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full h-12 bg-red-700 text-white border-red-700">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="province">
                  <span className="font-medium">Province</span>
                </SelectItem>
                <SelectItem value="territory">
                  <span className="font-medium">Territory</span>
                </SelectItem>
                <SelectItem value="city">
                  <span className="font-medium">City</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location Select with Flag */}
          <div className="w-full ">
            <Select
              value={selectedLocation}
              onValueChange={handleLocationChange}
            >
              <SelectTrigger className="w-full h-12">
                {selectedLocationData ? (
                  <div className="flex items-center gap-2">
                    <Image
                      src={selectedLocationData.image}
                      alt={selectedLocationData.name}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                    <span>{selectedLocationData.name}</span>
                  </div>
                ) : (
                  <SelectValue placeholder={`Select a ${selectedType}`} />
                )}
              </SelectTrigger>
              <SelectContent>
                {currentLocations.map((location) => (
                  <SelectItem key={location.id} value={location.name}>
                    <div className="flex items-center gap-2">
                      <Image
                        src={location.image}
                        alt={location.name}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                      <span>{location.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selected Location Flag Display */}
        {selectedLocationData && (
          <div className="flex justify-center mt-6">
            <div className="flex flex-col items-center">
              <Image
                src={selectedLocationData.image}
                alt={selectedLocationData.name}
                width={120}
                height={120}
                className="object-contain"
              />
              <span className="mt-2 text-lg font-medium text-gray-700">
                {selectedLocationData.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Shops Display */}
      <div className="flex gap-5 py-5 px-5 md:px-24 w-full">
        <ProvinceRelatedProducts
          key={`${selectedType}-${selectedLocation}`}
          shops={shops}
          isLoading={isLoading}
          selectedLocation={selectedLocation}
          selectedTab={selectedType}
        />
      </div>
    </div>
  );
}

export default ShopByProvinceLayout;
