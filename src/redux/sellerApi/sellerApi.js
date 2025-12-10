import { api } from "../baseApi";

const sellerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createSeller: builder.mutation({
      query: ({ data }) => {
        return {
          url: `/users/seller`,
          method: "POST",
          body: data,
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
    }),
  }),
  overrideExisting: true,
});

export const { useCreateSellerMutation } = sellerApi;
