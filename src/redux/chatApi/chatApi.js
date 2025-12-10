import { api } from "../baseApi";

const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getChatforUser: builder.query({
      query: () => {
        return {
          url: `/chat/user`,
          method: "GET",
        };
      },
      providesTags: ["ChatList"],
    }),
    createMessage: builder.mutation({
      query: (formData) => {
        return {
          url: `/message`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (result, error, arg) => {
        // Extract chatId from FormData
        const dataString = arg.get("data");
        const invalidatedTags = [];

        if (dataString) {
          try {
            const data = JSON.parse(dataString);
            // Invalidate messages for this chat
            invalidatedTags.push({ type: "Messages", id: data.chatId });
          } catch (e) {
            // Ignore parse errors
          }
        }

        // Also invalidate chat lists to refresh the sorted order
        // This ensures the chat list is re-fetched and re-sorted after sending a message
        invalidatedTags.push({ type: "ChatList" });
        return invalidatedTags;
      },
    }),
    getMessages: builder.query({
      query: (chatId) => {
        return {
          url: `/message/chat/${chatId}`,
          method: "GET",
        };
      },
      providesTags: (result, error, chatId) => [
        { type: "Messages", id: chatId },
      ],
    }),
    getShopId: builder.query({
      query: () => {
        return {
          url: `/shop/my-shops`,
          method: "GET",
        };
      },
    }),
    getChatListShopOwner: builder.query({
      query: (shopId) => {
        return {
          url: `/chat/shop/${shopId}`,
          method: "GET",
        };
      },
      providesTags: ["ChatList"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetChatforUserQuery,
  useCreateMessageMutation,
  useGetMessagesQuery,
  useGetChatListShopOwnerQuery,
  useGetShopIdQuery,
} = chatApi;
