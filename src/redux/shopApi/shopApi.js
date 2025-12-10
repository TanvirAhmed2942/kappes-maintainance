import { api } from "../baseApi";

const shopApi = api.injectEndpoints({
  endpoints: (builder) => ({
    //shop-by-store page
    getShopList: builder.query({
      query: (params) => {
        return {
          url: `/shop`,
          method: "GET",
          params: {
            fields: params.fields,
          },
        };
      },
    }),
    getShopListProvince: builder.query({
      query: ({ location, locationType }) => {
        const queryParts = [];
        if (location) {
          queryParts.push(`searchTerm=${location}`);
        }
        const queryString =
          queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
        return {
          url: `/shop${queryString}`,
          method: "GET",
        };
      },
    }),
    getProductsByShop: builder.query({
      query: ({ shopId, filters = {} }) => {
        if (!shopId) {
          throw new Error("Shop ID is required");
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
        // Include priceMin if it's defined and greater than 0 (not default)
        if (filters.priceMin !== undefined && filters.priceMin > 0) {
          queryParts.push(`basePrice[gt]=${filters.priceMin}`);
        }
        // Include priceMax if it's defined and less than 10000 (not default)
        // If it's exactly 10000, still include it as the user might have set it explicitly
        // The serializeQueryArgs will ensure different cache keys for different values
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

        const queryString =
          queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
        const url = `/shop/products/${shopId}${queryString}`;

        return {
          url,
          method: "GET",
        };
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        // Handle both old format (string) and new format (object)
        const shopId =
          typeof queryArgs === "string" ? queryArgs : queryArgs?.shopId || "";
        const filterKey =
          typeof queryArgs === "object" && queryArgs?.filters
            ? JSON.stringify(queryArgs.filters)
            : "";
        return `${endpointName}(${shopId})${filterKey}`;
      },
    }),
    getShopbyId: builder.query({
      query: (shopId) => {
        return {
          url: `/shop/${shopId}`,
          method: "GET",
        };
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetShopListQuery,
  useGetShopListProvinceQuery,
  useGetProductsByShopQuery,
  useGetShopbyIdQuery,
} = shopApi;
