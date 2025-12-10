"use client";
import React from "react";
import { IoArrowForward } from "react-icons/io5";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../../components/ui/carousel";
import { Skeleton } from "../../../components/ui/skeleton";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setSelectedCategory } from "../../../features/filterSlice";

import useCategory from "../../../hooks/useCategory";
import { getImageUrl } from "../../../redux/baseUrl";
function PopularCategories() {
  const { categories, isLoading, hasCategories } = useCategory();
  const router = useRouter();
  const dispatch = useDispatch();
  console.log("categories from API", categories);

  const handleCategoryClick = (categoryId, categoryName) => {
    // Set only this category as selected in Redux
    dispatch(setSelectedCategory([categoryId]));
    // Navigate to categories page with category ID and name in params
    const encodedName = encodeURIComponent(categoryName);
    router.push(`/categories?category=${categoryId}&name=${encodedName}`);
  };

  // Fallback static categories for when API data is not available
  const fallbackCategories = [
    {
      id: 1,
      name: "Clothing",
      image: "/assets/popularCategories/Clothing.png",
    },
    {
      id: 2,
      name: "Footwear",
      image: "/assets/popularCategories/Footwear.png",
    },
    {
      id: 3,
      name: "Food Products",
      image: "/assets/popularCategories/FoodProduct.png",
    },
    {
      id: 4,
      name: "Beauty Products",
      image: "/assets/popularCategories/BeautyProducts.png",
    },
    {
      id: 5,
      name: "Self Care",
      image: "/assets/popularCategories/SelfCare.png",
    },
    {
      id: 6,
      name: "Furniture",
      image: "/assets/popularCategories/Furniture.png",
    },
  ];

  // Use API categories if available, otherwise use fallback
  const displayCategories = hasCategories
    ? categories.map((category) => ({
        id: category._id,
        name: category.name,
        image: category.thumbnail || "/assets/popularCategories/Furniture.png", // fallback image
      }))
    : fallbackCategories;

  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  return (
    <div className="w-full px-5 lg:px-32 py-20">
      <div className="w-full flex items-center justify-between pb-6">
        <h2 className="text-3xl font-extrabold font-comfortaa">
          Popular Categories
        </h2>
        <Link href={"/categories"} className="">
          <button className="flex items-center text-gray-600 hover:text-gray-800 hover:underline transition-colors cursor-pointer">
            See all
            <IoArrowForward className="ml-2 rotate-[-45deg]" />
          </button>
        </Link>
      </div>

      <div className="relative group">
        <Carousel
          opts={{ align: "start", loop: true }}
          plugins={[plugin.current]}
          className="w-full"
        >
          <CarouselContent>
            {isLoading
              ? // Loading skeleton using shadcn Skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <CarouselItem
                    key={`skeleton-${index}`}
                    className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6"
                  >
                    <div className="flex flex-col items-center p-4 gap-2">
                      <Skeleton className="w-24 h-24 rounded-full" />
                      <Skeleton className="h-4 w-16 rounded" />
                    </div>
                  </CarouselItem>
                ))
              : displayCategories.map((category) => (
                  <CarouselItem
                    key={category.id}
                    className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6"
                  >
                    <div
                      className="flex flex-col items-center p-4 gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() =>
                        handleCategoryClick(category.id, category.name)
                      }
                    >
                      <div className="w-24 h-24 rounded-full bg-gray-100 p-4 flex ring-1 items-center justify-center overflow-hidden">
                        <Image
                          src={`${getImageUrl}${category?.image}`}
                          width={80}
                          height={80}
                          alt={category.name}
                          className="object-cover"
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                    </div>
                  </CarouselItem>
                ))}
          </CarouselContent>

          <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-2 rounded-full shadow-lg" />
          <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-2 rounded-full shadow-lg" />
        </Carousel>
      </div>
    </div>
  );
}

export default PopularCategories;
