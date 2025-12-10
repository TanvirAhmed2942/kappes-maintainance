import { api } from "../baseApi";

const userprofileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query({
      query: () => {
        return {
          url: `/users/profile`,
          method: "GET",
        };
      },
      providesTags: ["UserProfile"],
    }),
    getFollowedShops: builder.query({
      query: () => {
        return {
          url: "/shop/followed",
          method: "GET",
        };
      },
      providesTags: ["UserProfile"],
    }),
    updateUserProfile: builder.mutation({
      query: ({ data }) => {
        return {
          url: "/users/profile",
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["UserProfile"],
    }),
    getMyOrders: builder.query({
      query: () => {
        return {
          url: "/order/my-orders",
          method: "GET",
        };
      },
      providesTags: ["MyOrders"],
    }),
    cancelOrder: builder.mutation({
      query: (orderId) => {
        return {
          url: `/order/cancel/${orderId}`,
          method: "DELETE",
        };
      },

      invalidatesTags: ["MyOrders", "UserProfile"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetMyOrdersQuery,
  useCancelOrderMutation,
  useGetFollowedShopsQuery,
} = userprofileApi;
