"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Badge } from "../ui/badge";
import { TbCircleX } from "react-icons/tb";
import { VscError } from "react-icons/vsc";
import { useGetCategoryQuery } from "../../redux/productApi/productApi";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCategory } from "../../features/filterSlice";
import ShopLayout from "../Shop/shopLayout";
import { useSearchParams } from "next/navigation";
function SeeAllCategories() {
  const { data: categoriesResponse, isLoading, error } = useGetCategoryQuery();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  // Check if a specific category was selected from URL params
  const categoryParam = searchParams.get("category");
  const categoryNameParam = searchParams.get("name");
  const isSpecificCategorySelected = Boolean(categoryParam);

  // Get current filter state from Redux
  const filterState = useSelector((state) => state.filter);
  const selectedCategoriesFromFilter = filterState.selectedCategory || [];

  console.log("categories", categoriesResponse);

  // Extract categories from API response
  const apiCategories = categoriesResponse?.data?.categorys || [];

  // Memoize categories transformation to prevent unnecessary re-renders
  const allCategories = useMemo(
    () =>
      apiCategories.map((category) => ({
        id: category._id,
        categoryName: category.name,
        thumbnail: category.thumbnail,
        description: category.description,
        ctgViewCount: category.ctgViewCount,
        subCategory: category.subCategory || [],
      })),
    [apiCategories]
  );

  // Use Redux state directly as the source of truth
  const selectedCategories = selectedCategoriesFromFilter;

  // Track if initialization has happened to prevent infinite loops
  const initializedRef = useRef(false);
  const prevCategoryParamRef = useRef(null);
  const prevAllCategoriesLengthRef = useRef(0);

  // Initialize with specific category from URL or all categories if no filter is set
  useEffect(() => {
    // Check if category param changed
    const categoryParamChanged = prevCategoryParamRef.current !== categoryParam;
    const categoriesLoaded =
      allCategories.length > 0 && prevAllCategoriesLengthRef.current === 0;

    prevCategoryParamRef.current = categoryParam;
    prevAllCategoriesLengthRef.current = allCategories.length;

    if (isSpecificCategorySelected && categoryParam) {
      // If a specific category is selected from URL, set only that category
      // Always set it if the param changed or if it's not already set
      const currentCategorySet =
        selectedCategoriesFromFilter.length === 1 &&
        selectedCategoriesFromFilter[0] === categoryParam;

      if (categoryParamChanged || !currentCategorySet) {
        dispatch(setSelectedCategory([categoryParam]));
        initializedRef.current = true;
      }
    } else if (
      !isSpecificCategorySelected &&
      categoriesLoaded &&
      selectedCategoriesFromFilter.length === 0 &&
      !initializedRef.current
    ) {
      // If no categories are selected in filter and we have categories, select all
      // Only do this once on initial load when NOT coming from a specific category
      const allCategoryIds = allCategories.map((cat) => cat.id);
      dispatch(setSelectedCategory(allCategoryIds));
      initializedRef.current = true;
    }
  }, [
    allCategories.length,
    dispatch,
    isSpecificCategorySelected,
    categoryParam,
    selectedCategoriesFromFilter,
  ]);

  const toggleCategory = (id) => {
    const newSelectedCategories = selectedCategories.includes(id)
      ? selectedCategories.filter((cid) => cid !== id)
      : [...selectedCategories, id];

    // Update Redux filter state directly
    dispatch(setSelectedCategory(newSelectedCategories));
  };

  const toggleAll = () => {
    // Check if all categories are currently selected
    const allCategoryIds = allCategories.map((cat) => cat.id);
    const isCurrentlyAllSelected =
      selectedCategories.length === allCategories.length &&
      allCategoryIds.every((id) => selectedCategories.includes(id));

    const newSelectedCategories = isCurrentlyAllSelected ? [] : allCategoryIds;

    // Update Redux filter state directly
    dispatch(setSelectedCategory(newSelectedCategories));
  };

  // Check if all categories are selected more accurately
  const allCategoryIds = allCategories.map((cat) => cat.id);
  const isAllSelected =
    selectedCategories.length === allCategories.length &&
    allCategoryIds.every((id) => selectedCategories.includes(id));

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 md:px-32">
        {!isSpecificCategorySelected && (
          <>
            <h2 className="my-4 px-3 py-1 border-2 rounded-lg w-fit font-comfortaa font-bold">
              Categories
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-8 bg-gray-200 animate-pulse rounded-full px-4 py-2"
                  style={{ width: `${80 + Math.random() * 40}px` }}
                ></div>
              ))}
            </div>
          </>
        )}

        {/* Show filtered products if any categories are selected or when a specific category is in URL */}
        {(selectedCategories.length > 0 || isSpecificCategorySelected) && (
          <div className="mt-8">
            <ShopLayout />
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 md:px-32">
        {!isSpecificCategorySelected && (
          <h2 className="my-4 px-3 py-1 border-2 rounded-lg w-fit font-comfortaa font-bold">
            Categories
          </h2>
        )}
        <div className="flex justify-center items-center h-32">
          <div className="text-center">
            <VscError className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">Failed to load categories</p>
            <p className="text-gray-500 text-sm">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (allCategories.length === 0) {
    return (
      <div className="p-4 md:px-32 min-h-screen">
        {!isSpecificCategorySelected && (
          <h2 className="my-4 px-3 py-1 border-2 rounded-lg w-fit font-comfortaa font-bold">
            Categories
          </h2>
        )}
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500">No categories available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:px-32 min-h-screen">
      {/* Only show category badges section when NOT coming from a specific category click */}
      {!isSpecificCategorySelected && (
        <>
          <h2 className="my-4 px-3 py-1 border-2 rounded-lg w-fit font-comfortaa font-bold">
            Categories ({allCategories.length})
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge
              className={`flex items-center gap-1 px-3 py-2 cursor-pointer ${
                isAllSelected
                  ? "bg-kappes text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
              onClick={toggleAll}
            >
              <p>All</p>
              {isAllSelected && <TbCircleX className="w-4 h-4" />}
            </Badge>

            {allCategories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <Badge
                  key={cat.id}
                  className={`flex items-center gap-1 px-3 py-2 transition duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-kappes text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  onClick={() => toggleCategory(cat.id)}
                  title={`${cat.categoryName}${
                    cat.ctgViewCount ? ` (${cat.ctgViewCount} views)` : ""
                  }`}
                >
                  <p>{cat.categoryName}</p>
                  {cat.subCategory.length > 0 && (
                    <span className="text-xs opacity-75">
                      ({cat.subCategory.length})
                    </span>
                  )}
                  {isSelected && <TbCircleX className="w-4 h-4" />}
                </Badge>
              );
            })}
          </div>
        </>
      )}

      {/* Show products when categories are selected or when a specific category is in URL */}
      {(selectedCategories.length > 0 || isSpecificCategorySelected) && (
        <div className="mt-8">
          <ShopLayout />
        </div>
      )}
    </div>
  );
}

export default SeeAllCategories;
