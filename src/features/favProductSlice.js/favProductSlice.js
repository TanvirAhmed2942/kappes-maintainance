import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  favProducts: [],
  favProductIds: [], // Array of product IDs for quick lookup
  isLoading: false,
  error: null,
};

const favProductSlice = createSlice({
  name: "favProduct",
  initialState,
  reducers: {
    // Set all favorite products (from API)
    setFavProducts: (state, action) => {
      console.log("=== setFavProducts Reducer ===");
      console.log("action.payload:", action.payload);

      // Try multiple possible response structures
      let products = [];

      if (action.payload) {
        // Try data.result (most common structure based on API response)
        if (action.payload.data?.result) {
          let result = action.payload.data.result;
          // If result is an array, use it directly
          if (Array.isArray(result)) {
            products = result;
          }
          // If result is an object, try to find array property
          else if (typeof result === "object") {
            products =
              result.wishlist ||
              result.items ||
              result.products ||
              result.data ||
              [];
          }
        }
        // Try data.wishlist
        else if (action.payload.data?.wishlist) {
          products = action.payload.data.wishlist;
        }
        // Try data.data.wishlist (nested)
        else if (action.payload.data?.data?.wishlist) {
          products = action.payload.data.data.wishlist;
        }
        // Try wishlist directly
        else if (action.payload.wishlist) {
          products = action.payload.wishlist;
        }
        // Try data as array
        else if (Array.isArray(action.payload.data)) {
          products = action.payload.data;
        }
        // Try payload as array
        else if (Array.isArray(action.payload)) {
          products = action.payload;
        }
      }

      state.favProducts = Array.isArray(products) ? products : [];
      state.favProductIds = state.favProducts.map((product) => {
        // Handle different product structures
        return (
          product._id ||
          product.productId?._id ||
          product.productId ||
          product.id
        );
      });

      console.log("Extracted products:", state.favProducts);
      console.log("Product IDs:", state.favProductIds);
      state.error = null;
    },

    // Add a product to favorites
    addToFavProduct: (state, action) => {
      const product = action.payload;
      const productId =
        product._id || product.productId?._id || product.id || product;

      // Check if product already exists
      const exists = state.favProductIds.includes(productId);

      if (!exists) {
        // If action.payload is just an ID, we'll add it to IDs array
        // The full product will be added when we refetch from API
        if (
          typeof product === "string" ||
          (typeof product === "object" && !product._id && !product.id)
        ) {
          state.favProductIds.push(productId);
        } else {
          // If it's a full product object
          state.favProducts.push(product);
          state.favProductIds.push(productId);
        }
      }
      state.error = null;
    },

    // Remove a product from favorites
    removeFromFavProduct: (state, action) => {
      const productId =
        action.payload._id ||
        action.payload.productId?._id ||
        action.payload.id ||
        action.payload;

      state.favProducts = state.favProducts.filter((product) => {
        const id = product._id || product.productId?._id || product.id;
        return id !== productId;
      });

      state.favProductIds = state.favProductIds.filter(
        (id) => id !== productId
      );
      state.error = null;
    },

    // Clear all favorites
    clearFavProducts: (state) => {
      state.favProducts = [];
      state.favProductIds = [];
      state.error = null;
    },

    // Set loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Selectors
export const selectFavProducts = (state) => state.favProduct.favProducts;
export const selectFavProductIds = (state) => state.favProduct.favProductIds;
export const selectFavProductsLoading = (state) => state.favProduct.isLoading;
export const selectFavProductsError = (state) => state.favProduct.error;

// Selector factory for checking if a product is favorited
export const makeSelectIsFavProduct = () => (state, productId) => {
  if (!productId) return false;
  return state.favProduct.favProductIds.includes(productId);
};

// Action creators
export const {
  setFavProducts,
  addToFavProduct,
  removeFromFavProduct,
  clearFavProducts,
  setLoading,
  setError,
  clearError,
} = favProductSlice.actions;

export default favProductSlice.reducer;
