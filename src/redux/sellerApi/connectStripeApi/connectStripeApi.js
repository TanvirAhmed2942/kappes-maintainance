import { api } from "../../baseApi";

const connectStripeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    connectStripe: builder.mutation({
      query: () => {
        return {
          url: `/stripe/create-connected-account`,
          method: "POST",
        };
      },
      invalidatesTags: ["StripeConnectedAccount", "user"],
    }),
  }),
  overrideExisting: true,
});

export const { useConnectStripeMutation } = connectStripeApi;
