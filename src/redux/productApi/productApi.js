import { api } from "../baseApi";

const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPopularCategory: builder.query({
      query: () => {
        return {
          url: `/category?sort=-ctgViewCount`,
          method: "GET",
        };
      },
    }),
    getCategory: builder.query({
      query: () => {
        return {
          url: `/category`,
          method: "GET",
        };
      },
    }),
    getRecommendedProducts: builder.query({
      query: () => {
        return {
          url: `/product/recommended`,
          method: "GET",
        };
      },
      transformResponse: (response) => {
        return response;
      },
    }),
    getRelatedProducts: builder.query({
      query: (categoryId) => {
        return {
          url: `/product/category/${categoryId}`,
          method: "GET",
        };
      },
      transformResponse: (response) => {
        return response;
      },
    }),
    getTrendingProducts: builder.query({
      query: (params) => {
        const { page = 1, limit = 10, ...queryParams } = params || {};
        return {
          url: `/product`,
          method: "GET",
          params: {
            sort: "-purchaseCount",
            page,
            limit,
            ...queryParams,
          },
        };
      },
      transformResponse: (response) => {
        return response;
      },
    }),
    getSearchProducts: builder.query({
      query: (params) => {
        return {
          url: `/product`,
          method: "GET",
          params: {
            searchTerm: params.search,
          },
        };
      },
      transformResponse: (response) => {
        return response;
      },
    }),
    getAllProducts: builder.query({
      query: (params) => {
        const { id, page = 1, limit = 10, ...queryParams } = params || {};

        // If id is provided, get a specific product
        if (id) {
          return {
            url: `/product/${id}`,
            method: "GET",
          };
        }

        // Otherwise get all products with pagination
        return {
          url: `/product`,
          method: "GET",
          params: {
            page,
            limit,
            ...queryParams,
          },
        };
      },
      transformResponse: (response) => {
        return response;
      },
    }),
    getFeaturedProducts: builder.query({
      query: (params) => {
        const { page = 1, limit = 10 } = params || {};
        return {
          url: `/product`,
          method: "GET",
          params: {
            isFeatured: true,
            page,
            limit,
          },
        };
      },
      transformResponse: (response) => {
        return response;
      },
    }),
    updateProduct: builder.mutation({
      query: ({ data, productId }) => {
        return {
          url: `/product/${productId}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["Product"],
    }),
    getReviewByProductId: builder.query({
      query: (productId) => {
        return {
          url: `/review/product/${productId}`,
          method: "GET",
        };
      },
    }),
    getShopProducts: builder.query({
      query: (params = {}) => {
        const { page = 1, limit = 10, filters = {}, ...queryParams } = params;

        // Build query parameters from filters (no encoding)
        const queryParts = [];

        // Add category IDs (can be multiple)
        if (
          filters.categoryIds &&
          Array.isArray(filters.categoryIds) &&
          filters.categoryIds.length > 0
        ) {
          filters.categoryIds.forEach((id) => {
            queryParts.push(`categoryId=${id}`);
          });
        }

        // Add price range
        if (filters.priceMin !== undefined && filters.priceMin > 0) {
          queryParts.push(`basePrice[gt]=${filters.priceMin}`);
        }
        if (filters.priceMax !== undefined && filters.priceMax > 0) {
          queryParts.push(`basePrice[lt]=${filters.priceMax}`);
        }

        // Add city if provided
        if (filters.city) {
          queryParts.push(`city=${filters.city}`);
        }

        // Add province if provided
        if (filters.province) {
          queryParts.push(`province=${filters.province}`);
        }

        // Add territory if provided
        if (filters.territory) {
          queryParts.push(`territory=${filters.territory}`);
        }

        // Add pagination
        queryParts.push(`page=${page}`);
        queryParts.push(`limit=${limit}`);

        // Add any other query params
        Object.keys(queryParams).forEach((key) => {
          if (queryParams[key] !== undefined && queryParams[key] !== null) {
            queryParts.push(`${key}=${queryParams[key]}`);
          }
        });

        const queryString =
          queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
        const url = `/product${queryString}`;

        return {
          url,
          method: "GET",
        };
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        // Include all params in cache key to ensure unique keys for different filter combinations
        const filterKey = queryArgs?.filters
          ? JSON.stringify(queryArgs.filters)
          : "";
        const page = queryArgs?.page || 1;
        const limit = queryArgs?.limit || 10;
        return `${endpointName}(${filterKey})page=${page}limit=${limit}`;
      },
    }),
    addToFavProduct: builder.mutation({
      query: (productId) => {
        return {
          url: `/wishlist`,
          method: "POST",
          body: { productId: productId },
        };
      },
      invalidatesTags: ["WISHLIST", "PRODUCT"],
      transformResponse: (response) => {
        return response;
      },
    }),
    removeFromFavProduct: builder.mutation({
      query: (productId) => {
        return {
          url: `/wishlist/${productId}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["WISHLIST", "PRODUCT"],
      transformResponse: (response) => {
        return response;
      },
    }),
    getFavProducts: builder.query({
      query: () => {
        return {
          url: `/wishlist`,
          method: "GET",
        };
      },
      providesTags: ["WISHLIST"],
      transformResponse: (response) => {
        return response;
      },
    }),
    getProductByProvince: builder.query({
      query: ({ provinceName, filters = {} }) => {
        if (!provinceName) {
          throw new Error("Province name is required");
        }

        // Build query parameters from filters (no encoding)
        const queryParts = [];

        // Add category IDs (can be multiple)
        if (
          filters.categoryIds &&
          Array.isArray(filters.categoryIds) &&
          filters.categoryIds.length > 0
        ) {
          filters.categoryIds.forEach((id) => {
            queryParts.push(`categoryId=${id}`);
          });
        }

        // Add price range
        if (filters.priceMin !== undefined && filters.priceMin > 0) {
          queryParts.push(`basePrice[gt]=${filters.priceMin}`);
        }
        if (filters.priceMax !== undefined && filters.priceMax > 0) {
          queryParts.push(`basePrice[lt]=${filters.priceMax}`);
        }

        // Add city if provided
        if (filters.city) {
          queryParts.push(`city=${filters.city}`);
        }

        // Add province if provided in filters
        if (filters.province) {
          queryParts.push(`province=${filters.province}`);
        }

        const queryString =
          queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
        const url = `/product/province/${provinceName}${queryString}`;

        return {
          url,
          method: "GET",
        };
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        // Handle both old format (string) and new format (object)
        const provinceName =
          typeof queryArgs === "string"
            ? queryArgs
            : queryArgs?.provinceName || "";
        const filterKey =
          typeof queryArgs === "object" && queryArgs?.filters
            ? JSON.stringify(queryArgs.filters)
            : "";
        return `${endpointName}(${provinceName})${filterKey}`;
      },
      providesTags: (result, error, queryArgs) => {
        const provinceName =
          typeof queryArgs === "string"
            ? queryArgs
            : queryArgs?.provinceName || "";
        return [{ type: "PRODUCT", id: `PROVINCE-${provinceName}` }];
      },
      transformResponse: (response) => {
        return response;
      },
    }),
    getProductByTerritory: builder.query({
      query: ({ territoryName, filters = {} }) => {
        if (!territoryName) {
          throw new Error("Territory name is required");
        }

        // Build query parameters from filters (no encoding)
        const queryParts = [];

        // Add category IDs (can be multiple)
        if (
          filters.categoryIds &&
          Array.isArray(filters.categoryIds) &&
          filters.categoryIds.length > 0
        ) {
          filters.categoryIds.forEach((id) => {
            queryParts.push(`categoryId=${id}`);
          });
        }

        // Add price range
        if (filters.priceMin !== undefined && filters.priceMin > 0) {
          queryParts.push(`basePrice[gt]=${filters.priceMin}`);
        }
        if (filters.priceMax !== undefined && filters.priceMax > 0) {
          queryParts.push(`basePrice[lt]=${filters.priceMax}`);
        }

        // Add city if provided
        if (filters.city) {
          queryParts.push(`city=${filters.city}`);
        }

        // Add province if provided
        if (filters.province) {
          queryParts.push(`province=${filters.province}`);
        }

        const queryString =
          queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
        const url = `/product/territory/${territoryName}${queryString}`;

        return {
          url,
          method: "GET",
        };
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        // Handle both old format (string) and new format (object)
        const territoryName =
          typeof queryArgs === "string"
            ? queryArgs
            : queryArgs?.territoryName || "";
        const filterKey =
          typeof queryArgs === "object" && queryArgs?.filters
            ? JSON.stringify(queryArgs.filters)
            : "";
        return `${endpointName}(${territoryName})${filterKey}`;
      },
      providesTags: (result, error, queryArgs) => {
        const territoryName =
          typeof queryArgs === "string"
            ? queryArgs
            : queryArgs?.territoryName || "";
        return [{ type: "PRODUCT", id: `TERRITORY-${territoryName}` }];
      },
      transformResponse: (response) => {
        return response;
      },
    }),
    getProductByCity: builder.query({
      query: ({ cityName, filters = {} }) => {
        if (!cityName) {
          throw new Error("City name is required");
        }

        // Build query parameters from filters (no encoding)
        const queryParts = [];

        // Add category IDs (can be multiple)
        if (
          filters.categoryIds &&
          Array.isArray(filters.categoryIds) &&
          filters.categoryIds.length > 0
        ) {
          filters.categoryIds.forEach((id) => {
            queryParts.push(`categoryId=${id}`);
          });
        }

        // Add price range
        if (filters.priceMin !== undefined && filters.priceMin > 0) {
          queryParts.push(`basePrice[gt]=${filters.priceMin}`);
        }
        if (filters.priceMax !== undefined && filters.priceMax > 0) {
          queryParts.push(`basePrice[lt]=${filters.priceMax}`);
        }

        // Add province if provided
        if (filters.province) {
          queryParts.push(`province=${filters.province}`);
        }

        const queryString =
          queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
        const url = `/product/city/${cityName}${queryString}`;

        return {
          url,
          method: "GET",
        };
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        // Handle both old format (string) and new format (object)
        const cityName =
          typeof queryArgs === "string" ? queryArgs : queryArgs?.cityName || "";
        const filterKey =
          typeof queryArgs === "object" && queryArgs?.filters
            ? JSON.stringify(queryArgs.filters)
            : "";
        return `${endpointName}(${cityName})${filterKey}`;
      },
      providesTags: (result, error, queryArgs) => {
        const cityName =
          typeof queryArgs === "string" ? queryArgs : queryArgs?.cityName || "";
        return [{ type: "PRODUCT", id: `CITY-${cityName}` }];
      },
      transformResponse: (response) => {
        return response;
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetPopularCategoryQuery,
  useGetRecommendedProductsQuery,
  // useGetRelatedProductsQuery, // Commented out to avoid duplicate declaration
  useGetTrendingProductsQuery,
  useGetAllProductsQuery,
  useGetFeaturedProductsQuery,
  useUpdateProductMutation,
  useGetReviewByProductIdQuery,
  useGetShopProductsQuery,
  useAddToFavProductMutation,
  useRemoveFromFavProductMutation,
  useGetFavProductsQuery,
  useGetCategoryQuery,
  useGetProductByProvinceQuery,
  useGetProductByTerritoryQuery,
  useGetProductByCityQuery,
  useGetSearchProductsQuery,
} = productApi;

// Export directly to ensure it's available
export const useGetRelatedProductsQuery =
  productApi.endpoints.getRelatedProducts.useQuery;
