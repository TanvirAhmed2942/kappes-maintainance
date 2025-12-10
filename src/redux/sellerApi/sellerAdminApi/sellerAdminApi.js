import { api } from "../../baseApi";

const sellerAdminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getShopAdmin: builder.query({
      query: () => {
        const shopId = localStorage.getItem("shop");
        return {
          url: `/shop/shop-admin/${shopId}`,
          method: "GET",
        };
      },
      providesTags: ["ShopAdmin"],
    }),
    addShopAdmin: builder.mutation({
      query: ({ data }) => {
        const shopId = localStorage.getItem("shop");
        return {
          url: `/shop/create-shop-admin/${shopId}`,
          method: "POST",
          body: data,
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
      invalidatesTags: ["ShopAdmin"],
    }),

    deleteShopAdmin: builder.mutation({
      query: (adminId) => {
        const shopId = localStorage.getItem("shop");
        return {
          url: `/shop/remove-shop-admin/${shopId}`,
          method: "DELETE",
          body: {
            userId: adminId,
          },
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
      invalidatesTags: ["ShopAdmin"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetShopAdminQuery,
  useAddShopAdminMutation,
  useDeleteShopAdminMutation,
} = sellerAdminApi;
