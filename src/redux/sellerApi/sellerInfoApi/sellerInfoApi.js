import { api } from "../baseApi";

const sellerInfoApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSellerInfo: builder.query({
      query: () => {
        return {
          url: `/users/profile`,
          method: "GET",
        };
      },
    }),
    updateSellerInfo: builder.mutation({
      query: ({ data }) => {
        return {
          url: `/users/profile`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["UserProfile"],
    }),
  }),
  overrideExisting: true,
});

export const { useGetSellerInfoQuery, useUpdateSellerInfoMutation } = sellerInfoApi;
