import { api } from "../baseApi";

const contactApi = api.injectEndpoints({
  endpoints: (builder) => ({
    sendContactMessage: builder.mutation({
      query: ({ data }) => {
        return {
          url: `/settings/message`,
          method: "POST",
          body: data,
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
      invalidatesTags: ["Contact"],
    }),
  }),
  overrideExisting: true,
});

export const { useSendContactMessageMutation } = contactApi;
