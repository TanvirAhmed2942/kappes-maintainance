import { api } from "../baseApi";

const followApi = api.injectEndpoints({
  endpoints: (builder) => ({
    followShop: builder.mutation({
      query: (shopId) => {
        return {
          url: `/shop/follow-unfollow/${shopId}`,
          method: "POST",
        };
      },
      // Invalidate shop data to refresh follower count
      invalidatesTags: (result, error, shopId) => [
        { type: "Shop", id: shopId },
        { type: "Shop", id: "LIST" },
      ],
    }),
    // Get follow status for a shop
    getFollowStatus: builder.query({
      query: (shopId) => ({
        url: `/shop/is-followed-shop/${shopId}`,
        method: "GET",
      }),
      providesTags: (result, error, shopId) => [{ type: "Follow", id: shopId }],
    }),
  }),
  overrideExisting: true,
});

export const { useFollowShopMutation, useGetFollowStatusQuery } = followApi;
