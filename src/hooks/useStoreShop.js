"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { useGetProductsByShopQuery } from "../redux/shopApi/shopApi";

export function useStoreShop(shopId) {
  // State for managing products and UI states
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    page: 1,
    totalPage: 1,
  });

  // Get filter state from Redux
  const filterState = useSelector((state) => state.filter);
  
  // Build filters object for API queries
  // Create a new array reference for categoryIds to ensure change detection
  const filters = useMemo(() => {
    const filterObj = {
      categoryIds: [...(filterState.selectedCategory || [])], // Create new array reference
      priceMin: Number(filterState.priceRangeLow) || 0,
      priceMax: Number(filterState.priceRangeHigh) || 10000,
    };

    // Add location filters if they exist
    if (filterState.location?.city && Array.isArray(filterState.location.city) && filterState.location.city.length > 0) {
      filterObj.city = filterState.location.city[0];
    }
    
    if (filterState.location?.province && Array.isArray(filterState.location.province) && filterState.location.province.length > 0) {
      filterObj.province = filterState.location.province[0];
    }
    
    if (filterState.location?.territory && Array.isArray(filterState.location.territory) && filterState.location.territory.length > 0) {
      filterObj.territory = filterState.location.territory[0];
    }

    return filterObj;
  }, [
    filterState.selectedCategory,
    filterState.priceRangeLow,
    filterState.priceRangeHigh,
    filterState.location?.city,
    filterState.location?.province,
    filterState.location?.territory,
  ]);

  // Track previous filters to detect changes
  const prevFiltersRef = useRef(JSON.stringify(filters));
  
  // Clear products and error immediately when filters change to show loading state
  useEffect(() => {
    const currentFilters = JSON.stringify(filters);
    if (prevFiltersRef.current !== currentFilters) {
      // Filters changed - clear products and error immediately to avoid showing stale data
      setProducts([]);
      setError(null); // Clear error when filters change
      setIsLoading(true);
    }
    prevFiltersRef.current = currentFilters;
  }, [filters]);

  // Create query args with new object reference to ensure change detection
  const queryArgs = useMemo(() => ({
    shopId: shopId,
    filters: { ...filters }, // Spread to create new object reference
  }), [shopId, filters]);

  // Use the API query hook with filters
  const {
    data: apiResponse,
    isLoading: queryLoading,
    error: queryError,
  } = useGetProductsByShopQuery(
    queryArgs,
    {
      // Only fetch if shopId is provided
      skip: !shopId,
      refetchOnMountOrArgChange: true,
    }
  );

  // Effect to handle API response - always check latest data
  useEffect(() => {
    // Update loading state
    setIsLoading(queryLoading);

    // If query is loading, don't update products/error yet
    if (queryLoading) {
      return;
    }

    // If there's a query error, handle it
    if (queryError) {
      setError({
        message:
          queryError.data?.message ||
          queryError.message ||
          "An error occurred while fetching products",
        statusCode: queryError.status || 500,
      });
      setProducts([]);
      setIsLoading(false);
      return;
    }

    // Handle successful response
    if (apiResponse?.success) {
      // Set products from API response
      const fetchedProducts = apiResponse.data?.products || [];
      setProducts(fetchedProducts);

      // Update pagination info
      if (apiResponse.data?.meta) {
        setPagination(apiResponse.data.meta);
      }

      setIsLoading(false);
      setError(null); // Clear error on success
    } else if (apiResponse?.success === false) {
      // Handle API-level error response
      const errorMessage =
        apiResponse.message || "No products found for this shop";
      setError({
        message: errorMessage,
        statusCode: apiResponse.statusCode || 404,
      });
      setProducts([]);
      setIsLoading(false);
    }
  }, [apiResponse, queryLoading, queryError]);

  // Helper function to get lowest product price
  const getProductPrice = (product) => {
    if (!product) return 0;

    if (
      product.product_variant_Details &&
      product.product_variant_Details.length > 0
    ) {
      const variantPrices = product.product_variant_Details.map(
        (variant) => variant.variantPrice
      );
      return Math.min(...variantPrices, product.basePrice);
    }

    return product.basePrice;
  };

  // Helper function to check if product has a discounted price
  const hasDiscountedPrice = (product) => {
    if (!product || !product.product_variant_Details) return false;

    return product.product_variant_Details.some(
      (variant) => variant.variantPrice < product.basePrice
    );
  };

  // Favorite toggle function (you might want to implement this with Redux)
  const toggleFavorite = (product, e) => {
    e.stopPropagation();
    e.preventDefault();
    // Implement favorite logic
    console.log("Toggle favorite", product);
  };

  return {
    products,
    isLoading,
    error,
    pagination,
    getProductPrice,
    hasDiscountedPrice,
    toggleFavorite,
  };
}
