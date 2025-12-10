import { api } from "../../baseApi";

const storeInfoApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStoreInfo: builder.query({
      query: () => {
        const shopId = localStorage.getItem("shop");
        return {
          url: `/shop/${shopId}`,
          method: "GET",
        };
      },
      providesTags: ["ShopInfo"],
    }),
    updateStoreInfo: builder.mutation({
      query: ({ data }) => {
        const shopId = localStorage.getItem("shop");
        return {
          url: `/shop/${shopId}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["ShopInfo"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetStoreInfoQuery,
  useUpdateStoreInfoMutation,
} = storeInfoApi;
