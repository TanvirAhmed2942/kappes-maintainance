import { api } from '../../baseApi';

const OrderListApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllOrder: builder.query({
      query: ({ status, id }) => {
        const url = status
          ? `/order/shop/${id}?status=${status}`
          : `/order/shop/${id}`;

        return {
          url,
          method: "GET",
        };
      },
      providesTags: ['order'],
    }),
    getOrderById: builder.query({
      query: (id) => {
        return {
          url: `/order/${id}`,
          method: "GET",
        };
      },
      providesTags: ['order'],
    }),

    deleteOrder: builder.mutation({
      query: (Id) => {
        return {
          url: `/order/cancel/${Id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ['order'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAllOrderQuery,
  useGetOrderByIdQuery,
  useDeleteOrderMutation,
} = OrderListApi;