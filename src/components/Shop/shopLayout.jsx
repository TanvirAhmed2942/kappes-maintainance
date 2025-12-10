"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import Filter from "./filter";
import ShopProductList from "./productList";
import { useGetShopProductsQuery } from "../../redux/productApi/productApi";
import { useDispatch, useSelector } from "react-redux";
import { addFav, removeFav } from "../../features/productSlice";

function ShopLayout() {
  const [filterVisible, setFilterVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState("featured");

  // Get filter state from Redux
  const filterState = useSelector((state) => state.filter);

  // Build filters object for API queries
  // Create a new array reference for categoryIds to ensure change detection
  const filters = useMemo(() => {
    const filterObj = {
      categoryIds: [...(filterState.selectedCategory || [])], // Create new array reference
      priceMin: filterState.priceRangeLow || 0,
      priceMax: filterState.priceRangeHigh || 10000,
    };

    // Add location filters if they exist
    if (
      filterState.location?.city &&
      Array.isArray(filterState.location.city) &&
      filterState.location.city.length > 0
    ) {
      filterObj.city = filterState.location.city[0];
    }

    if (
      filterState.location?.province &&
      Array.isArray(filterState.location.province) &&
      filterState.location.province.length > 0
    ) {
      filterObj.province = filterState.location.province[0];
    }

    if (
      filterState.location?.territory &&
      Array.isArray(filterState.location.territory) &&
      filterState.location.territory.length > 0
    ) {
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

  // Create query args with new object reference to ensure change detection
  const queryArgs = useMemo(
    () => ({
      filters: { ...filters }, // Spread to create new object reference
      page: 1,
      limit: 100, // Adjust as needed
    }),
    [filters]
  );

  const { data, isLoading, error } = useGetShopProductsQuery(queryArgs, {
    refetchOnMountOrArgChange: true,
  });
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.product);

  const favoritesMap = favorites.reduce((acc, curr) => {
    acc[curr.id] = true;
    return acc;
  }, {});

  // Clear products immediately when filters change
  useEffect(() => {
    const currentFilters = JSON.stringify(filters);
    if (
      prevFiltersRef.current !== currentFilters &&
      prevFiltersRef.current !== JSON.stringify({})
    ) {
      // Filters changed - clear products immediately
      setProducts([]);
    }
    prevFiltersRef.current = currentFilters;
  }, [filters]);

  useEffect(() => {
    // Set products from API response when data is available
    if (data?.data?.result) {
      setProducts(data.data.result);
    } else {
      // Clear products if no data
      setProducts([]);
    }
  }, [data]);

  const handleFilterVisible = () => {
    setFilterVisible(!filterVisible);
  };

  const toggleFavorite = (product, e) => {
    e.stopPropagation();
    e.preventDefault();

    const productId = product._id || product.id;

    if (favoritesMap[productId]) {
      dispatch(removeFav(productId));
    } else {
      dispatch(
        addFav({
          ...product,
          id: productId,
          favourite: true,
        })
      );
    }
  };

  // Price and discount helpers
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

  const hasDiscountedPrice = (product) => {
    if (!product || !product.product_variant_Details) return false;

    return product.product_variant_Details.some(
      (variant) => variant.variantPrice < product.basePrice
    );
  };

  return (
    <div className="flex items-start justify-start gap-5 py-5 px-5 md:px-24 lg:px-32 w-full">
      <Filter filterVisible={filterVisible} />
      <ShopProductList
        products={products}
        isLoading={isLoading}
        error={error}
        filterVisible={filterVisible}
        handleFilterVisible={handleFilterVisible}
        sortOption={sortOption}
        setSortOption={setSortOption}
        toggleFavorite={toggleFavorite}
        favoritesMap={favoritesMap}
        getProductPrice={getProductPrice}
        hasDiscountedPrice={hasDiscountedPrice}
      />
    </div>
  );
}

export default ShopLayout;
