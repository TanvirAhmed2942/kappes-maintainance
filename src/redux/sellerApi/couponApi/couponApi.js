import { api } from "../../baseApi";

const couponApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCoupons: builder.query({
      query: () => {
        const shopId = localStorage.getItem("shop");
        return {
          url: `/coupon/shop/${shopId}`,
          method: "GET",
        };
      },
    }),
    createCoupon: builder.mutation({
      query: ({ data }) => {
        return {
          url: `/coupon/create`,
          method: "POST",
          body: data,
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
    }),
    updateCoupon: builder.mutation({
      query: ({ data, couponCode }) => {
        return {
          url: `/coupon/${couponCode}/update-coupon`,
          method: "PATCH",
          body: data,
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
    }),
    deleteCoupon: builder.mutation({
      query: (couponId) => {
        return {
          url: `/coupon/${couponId}`,
          method: "DELETE",
        };
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponApi;
