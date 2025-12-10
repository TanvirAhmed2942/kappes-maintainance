import { api } from "../baseApi";

const couponApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCoupons: builder.query({
      query: () => {
        return {
          url: `/coupon`,
          method: "GET",
        };
      },
    }),
  }),
  overrideExisting: true,
});

export const { useGetCouponsQuery } = couponApi;
