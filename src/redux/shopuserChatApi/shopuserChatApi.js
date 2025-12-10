import { api } from "../baseApi";

const shopuserChatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createChat: builder.mutation({
      query: (data) => {
        return {
          url: `/chat`,
          method: "POST",
          body: data,
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
      invalidatesTags: ["ChatList", "Chat"],
    }),
  }),

  overrideExisting: true,
});

export const { useCreateChatMutation } = shopuserChatApi;
