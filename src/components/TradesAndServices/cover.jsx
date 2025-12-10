"use client";
import SearchBox from "../../common/components/searchBox";
import Image from "next/image";
import React, { useMemo } from "react";
import { useGetBusinessListQuery } from "../../redux/servicesApi/servicsApi";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

function Cover() {
  const router = useRouter();
  const { data: businessList, isLoading, error } = useGetBusinessListQuery();

  // Transform businesses from API to SearchBox format
  const searchServices = useMemo(() => {
    if (!businessList?.success || !businessList?.data?.businesses) {
      return [];
    }
    return businessList.data.businesses.map((business) => ({
      id: business._id,
      serviceName: business.name || business.service || "Business",
    }));
  }, [businessList]);

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;

    // Find matching business
    const found = searchServices.find(
      (service) =>
        service.serviceName.toLowerCase() === searchTerm.toLowerCase()
    );

    if (found) {
      // Navigate to the business page
      router.push(`/trades-&-services/services/${found.id}`);
    } else {
      // If exact match not found, search for partial matches
      const partialMatch = searchServices.find((service) =>
        service.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (partialMatch) {
        router.push(`/trades-&-services/services/${partialMatch.id}`);
      } else {
        console.log("No business found matching:", searchTerm);
      }
    }
  };
  return (
    <div>
      <div className="relative min-h-[400px] sm:min-h-[500px] md:min-h-[600px]">
        <Image
          src="/assets/tradesAndServies/tradesAndServices.png"
          width={1000}
          height={1000}
          alt="trades and service"
          className="w-full h-full object-cover min-h-[400px] sm:min-h-[500px] md:min-h-[600px]"
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full px-3 sm:px-4 md:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-comfortaa font-semibold text-white mb-3 sm:mb-4 px-2">
            <span>Find Trusted</span> <br />
            <span>Trades & Services near you</span>
          </h2>
          <div className="max-w-5xl mx-auto w-full">
            <div className="px-0 sm:px-2">
              <SearchBox
                placeholder="Search Trades & Services"
                searchServices={searchServices}
                handleSearch={handleSearch}
                searchType="services"
              />
            </div>
            <Button
              className="bg-kappes hover:bg-red-700 px-4 sm:px-5 lg:px-6 py-2 text-white rounded-md flex items-center justify-center mx-auto mt-3 sm:mt-4 text-sm sm:text-base"
              onClick={() => router.push("/trades-&-services/all-services")}
            >
              See All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cover;
