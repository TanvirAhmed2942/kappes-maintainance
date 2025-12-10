import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetFavProductsQuery,
  useAddToFavProductMutation,
  useRemoveFromFavProductMutation,
} from "../redux/productApi/productApi";
import {
  setFavProducts,
  addToFavProduct,
  removeFromFavProduct,
  clearFavProducts,
  setLoading,
  setError,
  selectFavProducts,
  selectFavProductIds,
  selectFavProductsLoading,
  selectFavProductsError,
} from "../features/favProductSlice.js/favProductSlice";

/**
 * Custom hook for managing favorite products (wishlist)
 * Integrates RTK Query API with Redux slice for global state management
 *
 * @example
 * // Basic usage in a component:
 * function ProductCard({ product }) {
 *   const { isFavProduct, addToFavorites, removeFromFavorites, toggleFavorite, isLoading } = useFavProducts();
 *
 *   const handleFavoriteClick = async () => {
 *     await toggleFavorite(product._id, product);
 *   };
 *
 *   return (
 *     <button onClick={handleFavoriteClick} disabled={isLoading}>
 *       {isFavProduct(product._id) ? '❤️' : '🤍'}
 *     </button>
 *   );
 * }
 *
 * @example
 * // Get all favorite products:
 * function WishlistPage() {
 *   const { favProducts, isLoading } = useFavProducts();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       {favProducts.map(product => (
 *         <ProductCard key={product._id} product={product} />
 *       ))}
 *     </div>
 *   );
 * }
 *
 * @returns {Object} Object containing:
 * - favProducts: Array of favorite products
 * - favProductIds: Array of favorite product IDs
 * - isLoading: Loading state
 * - error: Error state
 * - isFavProduct: Function to check if a product is favorited
 * - addToFavorites: Function to add a product to favorites
 * - removeFromFavorites: Function to remove a product from favorites
 * - toggleFavorite: Function to toggle favorite status
 * - clearFavorites: Function to clear all favorites
 * - refetch: Function to refetch favorite products from API
 */
const useFavProducts = () => {
  const dispatch = useDispatch();

  // Get data from Redux slice
  const favProducts = useSelector(selectFavProducts);
  const favProductIds = useSelector(selectFavProductIds);
  const isLoadingSlice = useSelector(selectFavProductsLoading);
  const errorSlice = useSelector(selectFavProductsError);

  // RTK Query hooks
  const {
    data: favProductsData,
    isLoading: isLoadingApi,
    error: errorApi,
    refetch,
  } = useGetFavProductsQuery();

  const [addToFavMutation, { isLoading: isAdding }] =
    useAddToFavProductMutation();
  const [removeFromFavMutation, { isLoading: isRemoving }] =
    useRemoveFromFavProductMutation();

  // Sync API data to Redux slice
  useEffect(() => {
    if (favProductsData) {
      console.log("=== useFavProducts: API Response ===");
      console.log("favProductsData:", favProductsData);
      console.log("favProductsData.data:", favProductsData?.data);
      console.log(
        "favProductsData.data?.wishlist:",
        favProductsData?.data?.wishlist
      );
      dispatch(setFavProducts(favProductsData));
    }
  }, [favProductsData, dispatch]);

  // Sync loading state
  // Only show loading for initial load or mutations, not for automatic refetches
  useEffect(() => {
    // Only set loading to true if:
    // 1. Initial API load (isLoadingApi) AND we don't have data yet
    // 2. OR we're actively adding/removing (mutations)
    const shouldShowLoading =
      (isLoadingApi && !favProductsData) || // Initial load only
      isAdding ||
      isRemoving;

    dispatch(setLoading(shouldShowLoading));
  }, [isLoadingApi, isAdding, isRemoving, favProductsData, dispatch]);

  // Sync error state
  useEffect(() => {
    if (errorApi) {
      dispatch(
        setError(
          errorApi?.data?.message || errorApi?.message || "An error occurred"
        )
      );
    } else {
      dispatch(setError(null));
    }
  }, [errorApi, dispatch]);

  /**
   * Check if a product is in favorites
   * @param {string} productId - The product ID to check
   * @returns {boolean} True if product is favorited
   */
  const isFavProduct = (productId) => {
    if (!productId) return false;
    return favProductIds.includes(productId);
  };

  /**
   * Add a product to favorites
   * @param {string|Object} productId - Product ID or product object
   * @param {Object} product - Optional full product object
   * @returns {Promise} Promise that resolves when product is added
   */
  const addToFavorites = async (productId, product = null) => {
    try {
      const id =
        typeof productId === "string"
          ? productId
          : productId._id || productId.id;

      // Optimistically update Redux slice
      if (product) {
        dispatch(addToFavProduct(product));
      } else {
        dispatch(addToFavProduct(id));
      }

      // Call API mutation
      const response = await addToFavMutation(id).unwrap();

      // RTK Query will automatically refetch due to invalidatesTags: ["WISHLIST"]
      // No need to manually refetch - the cache will be invalidated and refetched automatically

      return { success: true, data: response };
    } catch (error) {
      // Revert optimistic update on error
      dispatch(removeFromFavProduct(productId));
      dispatch(
        setError(
          error?.data?.message || error?.message || "Failed to add to favorites"
        )
      );
      return { success: false, error };
    }
  };

  /**
   * Remove a product from favorites
   * @param {string|Object} productId - Product ID or product object
   * @returns {Promise} Promise that resolves when product is removed
   */
  const removeFromFavorites = async (productId) => {
    try {
      const id =
        typeof productId === "string"
          ? productId
          : productId._id || productId.id;

      // Optimistically update Redux slice
      dispatch(removeFromFavProduct(id));

      // Call API mutation
      const response = await removeFromFavMutation(id).unwrap();

      // RTK Query will automatically refetch due to invalidatesTags: ["WISHLIST"]
      // No need to manually refetch - the cache will be invalidated and refetched automatically

      return { success: true, data: response };
    } catch (error) {
      // On error, revert the optimistic update by re-adding the product
      // RTK Query will handle the refetch automatically
      dispatch(
        setError(
          error?.data?.message ||
            error?.message ||
            "Failed to remove from favorites"
        )
      );
      return { success: false, error };
    }
  };

  /**
   * Toggle favorite status of a product
   * @param {string|Object} productId - Product ID or product object
   * @param {Object} product - Optional full product object (for adding)
   * @returns {Promise} Promise that resolves when toggle is complete
   */
  const toggleFavorite = async (productId, product = null) => {
    const id =
      typeof productId === "string" ? productId : productId._id || productId.id;

    if (isFavProduct(id)) {
      return await removeFromFavorites(id);
    } else {
      return await addToFavorites(id, product);
    }
  };

  /**
   * Clear all favorites (useful for logout)
   */
  const clearFavorites = () => {
    dispatch(clearFavProducts());
  };

  return {
    // Data
    favProducts,
    favProductIds,

    // State
    // Use only the Redux slice loading state (which is controlled by our logic above)
    isLoading: isLoadingSlice,
    error: errorSlice || errorApi,

    // Functions
    isFavProduct,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    clearFavorites,
    refetch,
  };
};

export default useFavProducts;
